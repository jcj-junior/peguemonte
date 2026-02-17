import { supabase } from "../supabase";

export const bookingService = {
    async getAllBookings() {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) throw error;
            // Mapeia snake_case para camelCase
            return data.map(b => ({
                id: b.id,
                customer: b.customer,
                items: b.items,
                startDate: b.start_date,
                endDate: b.end_date,
                totalValue: b.total_value,
                status: b.status,
                category: b.category,
                createdAt: b.created_at
            }));
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            throw error;
        }
    },

    async createBooking(booking) {
        try {
            const payload = {
                customer: booking.customer,
                items: booking.items,
                start_date: booking.startDate,
                end_date: booking.endDate,
                total_value: booking.totalValue,
                status: "budget",
                category: booking.category
            };

            const { data, error } = await supabase
                .from('bookings')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            throw error;
        }
    },

    async updateBooking(id, updates) {
        try {
            const payload = {};
            if (updates.customer) payload.customer = updates.customer;
            if (updates.items) payload.items = updates.items;
            if (updates.startDate) payload.start_date = updates.startDate;
            if (updates.endDate) payload.end_date = updates.endDate;
            if (updates.totalValue) payload.total_value = updates.totalValue;
            if (updates.status) payload.status = updates.status;
            if (updates.category) payload.category = updates.category;

            const { data, error } = await supabase
                .from('bookings')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao atualizar reserva:", error);
            throw error;
        }
    },

    async deleteBooking(id) {
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Erro ao excluir reserva:", error);
            throw error;
        }
    },

    async checkAvailability(itemIds, startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('items, end_date')
                .in('status', ['confirmed', 'picked_up'])
                .lte('start_date', endDate);

            if (error) throw error;

            const busyItems = new Set();
            data.forEach(booking => {
                if (booking.end_date >= startDate) {
                    booking.items.forEach(itemId => {
                        if (itemIds.includes(itemId)) {
                            busyItems.add(itemId);
                        }
                    });
                }
            });

            return Array.from(busyItems);
        } catch (error) {
            console.error("Erro ao verificar disponibilidade:", error);
            return [];
        }
    }
};
