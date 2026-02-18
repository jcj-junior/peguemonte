import { useState, useEffect, useMemo, memo } from 'react'
import {
    Users,
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    UserPlus,
    MoreVertical,
    Edit,
    Trash2,
    ExternalLink,
    Calendar,
    DollarSign,
    Loader2,
    X
} from 'lucide-react'
import { clientService } from '../services/clientService'

const ClientCard = memo(({ client, onEdit, onDelete }) => (
    <div className="grid grid-cols-12 items-center p-4 hover:bg-white/[0.02] transition-colors gap-4 border-b border-[#1E293B] last:border-0 group">
        <div className="col-span-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 flex items-center justify-center text-[#1D4ED8] font-black text-xs uppercase group-hover:scale-110 transition-transform">
                {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{client.name}</h3>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Cliente desde {new Date(client.created_at).toLocaleDateString()}</p>
            </div>
        </div>

        <div className="col-span-3">
            <div className="flex items-center gap-2 text-[#94A3B8]">
                <Phone size={14} className="text-[#1D4ED8]" />
                <span className="text-xs font-bold">{client.phone || 'Sem telefone'}</span>
            </div>
        </div>

        <div className="col-span-3">
            <div className="flex items-center gap-2 text-[#94A3B8]">
                <Mail size={14} className="text-[#1D4ED8]" />
                <span className="text-xs font-bold truncate max-w-[150px]">{client.email || 'Sem e-mail'}</span>
            </div>
        </div>

        <div className="col-span-2 flex justify-end gap-2">
            <button
                onClick={() => onEdit(client)}
                className="p-2 bg-white/5 text-[#94A3B8] border border-[#1E293B] rounded-xl hover:bg-[#1D4ED8]/10 hover:text-[#1D4ED8] hover:border-[#1D4ED8]/20 transition-all active:scale-95"
            >
                <Edit size={16} />
            </button>
            <button
                onClick={() => onDelete(client.id)}
                className="p-2 bg-white/5 text-[#94A3B8] border border-[#1E293B] rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95"
            >
                <Trash2 size={16} />
            </button>
        </div>
    </div>
))

const ClientModal = ({ isOpen, onClose, onSave, client }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    })

    useEffect(() => {
        if (client) setFormData(client)
        else setFormData({ name: '', phone: '', email: '', address: '', notes: '' })
    }, [client, isOpen])

    const formatPhone = (value) => {
        if (!value) return ""
        value = value.replace(/\D/g, "")
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d{5})(\d)/, "$1-$2")
        return value.substring(0, 15)
    }

    const handleChangePhone = (e) => {
        const formatted = formatPhone(e.target.value)
        setFormData({ ...formData, phone: formatted })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#161B22] w-full max-w-xl rounded-[2.5rem] border border-[#1E293B] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-[#1E293B] flex justify-between items-center bg-[#0B0E14]/30">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter">
                            {client ? 'Editar Cliente' : 'Novo Cliente'}
                        </h2>
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] mt-1">Gerencie informações de contato</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 border border-[#1E293B] rounded-2xl text-[#64748B] hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all"
                                placeholder="Ex: Mariana Costa"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Telefone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={handleChangePhone}
                                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">E-mail</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all"
                            placeholder="exemplo@gmail.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Endereço</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all"
                            placeholder="Rua, Número, Bairro, Cidade"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Observações Internas</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all min-h-[100px] resize-none"
                            placeholder="Notas sobre preferências do cliente..."
                        />
                    </div>
                </div>

                <div className="p-8 bg-[#0B0E14]/30 border-t border-[#1E293B] flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-2xl border border-[#1E293B] text-[#64748B] font-bold hover:bg-white/5 transition-all outline-none"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-[2] bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg shadow-[#1D4ED8]/20 transition-all active:scale-95 outline-none"
                    >
                        Salvar Cliente
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Clients() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState(null)

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        try {
            setLoading(true)
            const data = await clientService.getAllClients()
            setClients(data)
        } catch (error) {
            console.error("Erro ao carregar clientes:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (formData) => {
        try {
            if (editingClient) {
                await clientService.updateClient(editingClient.id, formData)
            } else {
                await clientService.createClient(formData)
            }
            loadClients()
            setIsModalOpen(false)
            setEditingClient(null)
        } catch (error) {
            console.error("Erro ao salvar cliente:", error)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await clientService.deleteClient(id)
                loadClients()
            } catch (error) {
                console.error("Erro ao excluir cliente:", error)
            }
        }
    }

    const filteredClients = useMemo(() => {
        return clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone?.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [clients, searchTerm])

    return (
        <div className="space-y-8 animate-in fade-in duration-700 flex flex-col h-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#161B22] p-8 rounded-[2.5rem] border border-[#1E293B] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1D4ED8]/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter">Clientes</h1>
                    <p className="text-[#94A3B8] mt-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-[0.2em]">
                        <Users size={14} className="text-[#1D4ED8]" />
                        Base de contatos e histórico
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all placeholder:text-[#64748B] placeholder:font-bold"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
                        className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white p-3.5 rounded-2xl shadow-lg shadow-[#1D4ED8]/20 transition-all active:scale-90 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Novo</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 bg-[#161B22] rounded-[2.5rem] border border-[#1E293B] overflow-hidden shadow-2xl flex flex-col mb-10">
                <div className="grid grid-cols-12 px-8 py-4 bg-[#0B0E14]/30 border-b border-[#1E293B] text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">
                    <div className="col-span-4">Cliente</div>
                    <div className="col-span-3">Telefone</div>
                    <div className="col-span-3">E-mail</div>
                    <div className="col-span-2 text-right">Ações</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-[#1D4ED8]" size={32} />
                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Carregando base de dados...</p>
                        </div>
                    ) : filteredClients.length > 0 ? (
                        <div className="divide-y divide-[#1E293B]">
                            {filteredClients.map(client => (
                                <ClientCard
                                    key={client.id}
                                    client={client}
                                    onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 grayscale opacity-50">
                            <Users size={48} className="text-[#64748B] mb-4" />
                            <p className="text-sm font-bold text-white">Nenhum cliente encontrado</p>
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mt-2">Tente ajustar seus filtros de busca</p>
                        </div>
                    )}
                </div>
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                client={editingClient}
            />
        </div>
    )
}
