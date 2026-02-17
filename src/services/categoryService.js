import { supabase } from "../supabase";

export const categoryService = {
    async getAllCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            throw error;
        }
    },

    async createCategory(name) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }
    },

    async updateCategory(id, name) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update({ name })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            throw error;
        }
    }
};
