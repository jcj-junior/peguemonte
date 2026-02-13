import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    where,
    orderBy
} from "firebase/firestore";

const bookingsCollection = collection(db, "bookings");

export const bookingService = {
    async getAllBookings() {
        const q = query(bookingsCollection, orderBy("startDate", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async createBooking(booking) {
        return await addDoc(bookingsCollection, {
            ...booking,
            status: "budget", // Status inicial
            createdAt: new Date().toISOString()
        });
    },

    async updateBookingStatus(id, status) {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, { status });
    },

    /**
     * Verifica a disponibilidade de itens para um período
     * @param {string[]} itemIds 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<string[]>} IDs dos itens que estão ocupados
     */
    async checkAvailability(itemIds, startDate, endDate) {
        // Busca reservas que se sobrepõem ao período e estão confirmadas ou retiradas
        const q = query(
            bookingsCollection,
            where("status", "in", ["confirmed", "picked_up"]),
            where("startDate", "<=", endDate)
        );

        const snapshot = await getDocs(q);
        const busyItems = new Set();

        snapshot.docs.forEach(doc => {
            const booking = doc.data();
            // Verificação adicional de sobreposição no lado do cliente (Firestore tem limitações em buscas complexas)
            if (booking.endDate >= startDate) {
                booking.items.forEach(itemId => {
                    if (itemIds.includes(itemId)) {
                        busyItems.add(itemId);
                    }
                });
            }
        });

        return Array.from(busyItems);
    }
};
