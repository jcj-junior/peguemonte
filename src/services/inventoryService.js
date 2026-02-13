import { db, storage } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const itemsCollection = collection(db, "items");

export const inventoryService = {
    async getAllItems() {
        const snapshot = await getDocs(itemsCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async createItem(item, imageFile) {
        let photoURL = "";
        if (imageFile) {
            const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
            const uploadSnapshot = await uploadBytes(storageRef, imageFile);
            photoURL = await getDownloadURL(uploadSnapshot.ref);
        }

        return await addDoc(itemsCollection, {
            ...item,
            photoURL,
            createdAt: new Date().toISOString()
        });
    },

    async updateItem(id, updates) {
        const itemRef = doc(db, "items", id);
        await updateDoc(itemRef, updates);
    },

    async deleteItem(id) {
        const itemRef = doc(db, "items", id);
        await deleteDoc(itemRef);
    }
};
