import { supabase } from "../supabase";

export const clientService = {
    async getAllClients() {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            throw error;
        }
    },

    async createClient(client) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([client])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            throw error;
        }
    },

    async updateClient(id, updates) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            throw error;
        }
    },

    async deleteClient(id) {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            throw error;
        }
    },

    async getClientStats(clientId) {
        try {
            // Esta função pode ser expandida para buscar histórico de locações
            const { data, error } = await supabase
                .from('bookings')
                .select('total_value, status')
                .filter('customer->>name', 'eq', (await supabase.from('clients').select('name').eq('id', clientId).single()).data.name);

            if (error) throw error;

            const stats = {
                totalBookings: data.length,
                totalSpent: data.reduce((acc, curr) => acc + (Number(curr.total_value) || 0), 0),
                confirmedBookings: data.filter(b => b.status === 'confirmed' || b.status === 'picked_up' || b.status === 'returned').length
            };

            return stats;
        } catch (error) {
            console.error("Erro ao carregar estatísticas do cliente:", error);
            return { totalBookings: 0, totalSpent: 0, confirmedBookings: 0 };
        }
    }
};
