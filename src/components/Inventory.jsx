import { useState, useEffect, useMemo, memo } from 'react'
import { Plus, Search, Trash2, Edit, Package, X, Loader2, Hash, DollarSign } from 'lucide-react'
import { inventoryService } from '../services/inventoryService'
import { categoryService } from '../services/categoryService'

// Helper para gerar código randômico
const generateSKU = () => {
    return 'PM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

const ItemCard = memo(({ item, onEdit, onDelete }) => (
    <div className="bg-[#161B22] rounded-3xl overflow-hidden border border-[#1E293B] group flex flex-col h-full hover:border-[#1D4ED8]/30 transition-all duration-500 shadow-xl">
        <div className="aspect-square bg-[#0B0E14] relative overflow-hidden">
            {item.imageUrl || item.photoURL ? (
                <img
                    src={item.imageUrl || item.photoURL}
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
            <div className="absolute bottom-3 left-3">
                <span className="bg-[#0B0E14]/80 backdrop-blur-md text-[10px] font-black text-white px-2 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                    {item.sku || 'N/A'}
                </span>
            </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-1 rounded-lg">
                    {item.category || 'Sem Categoria'}
                </span>
                <span className="text-sm font-black text-white">
                    R$ {Number(item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        description: '',
        imageUrl: '',
        price: '',
        sku: '',
        quantity: 1
    })

    // Funções para máscara de moeda BRL
    const formatCurrency = (value) => {
        if (!value) return '';
        const number = value.replace(/\D/g, '');
        const options = { minimumFractionDigits: 2 };
        const result = new Intl.NumberFormat('pt-BR', options).format(
            parseFloat(number) / 100
        );
        return result;
    };

    const parseCurrency = (value) => {
        return value.replace(/\D/g, '') / 100;
    };

    useEffect(() => {
        if (isModalInitiallyOpen && !isModalOpen) {
            handleOpenModal()
        }
    }, [isModalInitiallyOpen, isModalOpen])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [itemsData, categoriesData] = await Promise.all([
                inventoryService.getAllItems(),
                categoryService.getAllCategories()
            ])
            setItems(itemsData)
            setCategories(categoriesData)
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        } finally {
            setLoading(false)
        }
    }


    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [items, searchTerm])

    const handleOpenModal = () => {
        setNewItem({
            name: '',
            category: '',
            description: '',
            imageUrl: '',
            price: '',
            sku: generateSKU(),
            quantity: 1
        })
        setIsModalOpen(true)
    }

    const handleClose = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setNewItem({
            name: '',
            category: '',
            description: '',
            imageUrl: '',
            price: '',
            sku: '',
            quantity: 1
        })
        onCloseModal()
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setNewItem({
            name: item.name,
            category: item.category || '',
            description: item.description || '',
            imageUrl: item.imageUrl || item.photoURL || '',
            price: item.price || '',
            sku: item.sku || generateSKU(),
            quantity: item.quantity || 1
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("🗑️ Deseja realmente excluir este item do inventário?")) {
            try {
                await inventoryService.deleteItem(id)
                loadData()
            } catch (error) {
                alert("Erro ao excluir item. Tente novamente.")
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const itemData = {
                ...newItem,
                price: Number(newItem.price),
                quantity: Number(newItem.quantity)
            }

            if (editingItem) {
                await inventoryService.updateItem(editingItem.id, itemData)
            } else {
                await inventoryService.createItem(itemData)
            }

            handleClose()
            await loadData()

            setTimeout(() => {
                alert(editingItem ? "✨ Item atualizado com sucesso!" : "✅ Item cadastrado com sucesso!")
            }, 100)

        } catch (error) {
            console.error("Erro no processamento:", error)
            alert("❌ Erro ao salvar: " + (error.message || "Verifique sua conexão."))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161B22] p-6 rounded-3xl border border-[#1E293B] shadow-2xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Estoque</h1>
                    <p className="text-[#94A3B8] mt-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-[0.2em]">
                        <Package size={14} className="text-[#1D4ED8]" />
                        Total de <span className="text-white">{items.length}</span> itens registrados
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-[#1D4ED8]/20 active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Novo Item
                </button>
            </header>

            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar por nome, categoria ou código SKU..."
                    className="w-full bg-[#161B22] border border-[#1E293B] rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#1D4ED8]/30 text-white placeholder-[#64748B] transition-all text-lg shadow-inner"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 size={40} className="animate-spin text-[#1D4ED8]" />
                    <p className="text-[#94A3B8] font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando estoque...</p>
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
                <div className="text-center py-40 bg-[#161B22]/50 rounded-[3rem] border-2 border-dashed border-[#1E293B]">
                    <Package size={64} className="mx-auto mb-4 text-[#64748B] opacity-20" />
                    <p className="text-[#64748B] font-bold uppercase text-xs tracking-widest">Nenhum item encontrado no catálogo</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300">
                    <div className="bg-[#161B22] w-full max-w-xl max-h-[90vh] rounded-[2.5rem] border border-[#1E293B] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-[#1D4ED8]/10 to-transparent border-b border-[#1E293B]">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">
                                    {editingItem ? 'Editar Registro' : 'Novo Registro'}
                                </h2>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Preencha os dados do item</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-2xl text-[#64748B] hover:text-white transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Nome do Item</label>
                                <input
                                    required
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-6 py-4 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner text-lg font-bold"
                                    placeholder="Ex: Mesa de Centro Provençal Branca"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Código (SKU)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                                        <input
                                            required
                                            readOnly
                                            value={newItem.sku}
                                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-3 text-[#1D4ED8] font-mono font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Valor Unitário</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                                        <input
                                            type="text"
                                            required
                                            value={formatCurrency(String(newItem.price * 100 || ''))}
                                            onChange={e => setNewItem({ ...newItem, price: parseCurrency(e.target.value) })}
                                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Categoria</label>
                                    <select
                                        required
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Quantidade</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Descrição (Opcional)</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none h-24 text-white resize-none transition-all shadow-inner"
                                    placeholder="Detalhes sobre o item..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Link da Imagem (Opcional)</label>
                                <input
                                    value={newItem.imageUrl}
                                    onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner"
                                    placeholder="https://sua-imagem.com/foto.jpg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#1D4ED8] hover:bg-[#1e40af] disabled:bg-[#1E293B] text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-[#1D4ED8]/20 active:scale-[0.97] flex items-center justify-center gap-3 text-lg mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>{editingItem ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
