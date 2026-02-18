import { supabase } from "../supabase";

export const inventoryService = {
    async getAllItems() {
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Mapeia snake_case do banco para camelCase do código
            return data.map(item => ({
                ...item,
                imageUrl: item.image_url
            }));
        } catch (error) {
            console.error("Erro ao carregar itens:", error);
            throw error;
        }
    },

    async createItem(item) {
        try {
            const payload = {
                name: item.name,
                category: item.category,
                price: item.price,
                quantity: item.quantity,
                description: item.description,
                image_url: item.imageUrl,
                sku: item.sku,
                quantity: item.quantity
            };

            const { data, error } = await supabase
                .from('items')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return { ...data, imageUrl: data.image_url };
        } catch (error) {
            console.error("Erro ao criar item:", error);
            throw error;
        }
    },

    async updateItem(id, updates) {
        try {
            const payload = {};
            if (updates.name) payload.name = updates.name;
            if (updates.category) payload.category = updates.category;
            if (updates.price) payload.price = updates.price;
            if (updates.quantity) payload.quantity = updates.quantity;
            if (updates.description) payload.description = updates.description;
            if (updates.imageUrl) payload.image_url = updates.imageUrl;
            if (updates.sku) payload.sku = updates.sku;
            if (updates.quantity !== undefined) payload.quantity = updates.quantity;

            const { data, error } = await supabase
                .from('items')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            throw error;
        }
    },

    async deleteItem(id) {
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Erro ao excluir item:", error);
            throw error;
        }
    }
};
