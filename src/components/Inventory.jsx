import { useState, useEffect, useMemo, memo } from 'react'
import { Plus, Search, Trash2, Edit, Package, X, Loader2 } from 'lucide-react'
import { inventoryService } from '../services/inventoryService'

// Componente de Card memoizado para evitar re-renders desnecessários
const ItemCard = memo(({ item, onEdit, onDelete }) => (
    <div className="bg-[#161B22] rounded-3xl overflow-hidden border border-[#1E293B] group flex flex-col h-full hover:border-[#1D4ED8]/30 transition-all duration-500 shadow-xl">
        <div className="aspect-square bg-[#0B0E14] relative overflow-hidden">
            {item.photoURL ? (
                <img
                    src={item.photoURL}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Package size={48} strokeWidth={1.5} />
                </div>
            )}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 bg-[#0B0E14]/90 rounded-xl text-[#1D4ED8] border border-[#1D4ED8]/20 hover:bg-[#1D4ED8] hover:text-white transition-all shadow-xl backdrop-blur-md"
                    title="Editar item"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-[#0B0E14]/90 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-xl backdrop-blur-md"
                    title="Excluir item"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-1 rounded-lg">
                    {item.category || 'Sem Categoria'}
                </span>
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-[#1D4ED8] transition-colors line-clamp-1">{item.name}</h3>
            <p className="text-sm text-[#94A3B8] line-clamp-2 mt-2 flex-1 italic font-medium">
                {item.description || 'Sem descrição detalhada'}
            </p>
        </div>
    </div>
))

ItemCard.displayName = 'ItemCard'

export default function Inventory({ isModalInitiallyOpen = false, onCloseModal = () => { } }) {
    const [items, setItems] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [newItem, setNewItem] = useState({ name: '', category: '', description: '', photoURL: '' })

    useEffect(() => {
        setIsModalOpen(isModalInitiallyOpen)
    }, [isModalInitiallyOpen])

    useEffect(() => {
        loadItems()

        const timer = setTimeout(() => {
            setLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    const loadItems = async () => {
        try {
            const data = await inventoryService.getAllItems()
            setItems(data)
        } catch (error) {
            console.error("Erro ao carregar itens:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [items, searchTerm])

    const handleClose = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setNewItem({ name: '', category: '', description: '', photoURL: '' })
        onCloseModal()
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setNewItem({
            name: item.name,
            category: item.category || '',
            description: item.description || '',
            photoURL: item.photoURL || ''
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("🗑️ Deseja realmente excluir este item do inventário?")) {
            try {
                await inventoryService.deleteItem(id)
                loadItems()
            } catch (error) {
                alert("Erro ao excluir item. Tente novamente.")
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        console.log("Iniciando submissão...");
        setIsSubmitting(true)
        try {
            if (editingItem) {
                console.log("Tentando atualizar documento no Firebase...");
                await inventoryService.updateItem(editingItem.id, newItem)
                console.log("Sucesso na atualização!");
            } else {
                console.log("Tentando criar documento no Firebase...");
                const docRef = await inventoryService.createItem(newItem)
                console.log("Sucesso! Documento criado com ID:", docRef.id);
            }

            console.log("Sucesso! Fechando modal...");
            handleClose()
            await loadItems()

            setTimeout(() => {
                alert(editingItem ? "✨ Item atualizado com sucesso!" : "✅ Item cadastrado com sucesso!")
            }, 100)

        } catch (error) {
            console.error("Erro no processamento:", error)
            alert("❌ Erro ao salvar: " + (error.message || "Verifique sua conexão."))
        } finally {
            console.log("Resetando estado de submissão");
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Glassmorphism */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Inventário</h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <Package size={16} className="text-blue-500" />
                        {items.length} itens no catálogo
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/30 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Novo Item
                </button>
            </div>

            {/* Barra de Busca Pro */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={22} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar por nome ou categoria..."
                    className="w-full bg-slate-800/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-500 backdrop-blur-sm transition-all"
                />
            </div>

            {/* Grid de Itens */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-500">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                    <p className="font-medium animate-pulse">Sincronizando com o banco de dados...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                    <Package size={64} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 text-lg">Nenhum item encontrado.</p>
                </div>
            )}

            {/* Modal de Cadastro/Edição com Design Premium */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-all duration-300">
                    <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.25)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-blue-600/10 to-transparent">
                            <div>
                                <h2 className="text-2xl font-black text-white">
                                    {editingItem ? 'Editar Registro' : 'Novo Registro'}
                                </h2>
                                <p className="text-sm text-slate-400">Preencha os dados do item</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                                    <input
                                        required
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                                        placeholder="Ex: Mesa Cubo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Moveis">Móveis</option>
                                        <option value="Temas">Temas/Painéis</option>
                                        <option value="Vasilhames">Vasilhames</option>
                                        <option value="Eletronicos">Eletrônicos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Descrição (Opcional)</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-28 text-white resize-none transition-all"
                                    placeholder="Detalhes sobre o item..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Link da Imagem (Opcional)</label>
                                <input
                                    value={newItem.photoURL}
                                    onChange={e => setNewItem({ ...newItem, photoURL: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                                    placeholder="https://sua-imagem.com/foto.jpg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-black py-5 rounded-3xl transition-all shadow-[0_8px_30px_rgb(37,99,235,0.3)] active:scale-[0.97] flex items-center justify-center gap-3 text-lg mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>{editingItem ? 'Salvar Alterações' : 'Finalizar Cadastro'}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
