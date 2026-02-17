import { useState, useEffect } from 'react'
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Search,
    Tag,
    X,
    Check,
    Save
} from 'lucide-react'
import { categoryService } from '../services/categoryService'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [categoryName, setCategoryName] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const data = await categoryService.getAllCategories()
            setCategories(data)
        } catch (error) {
            console.error("Erro ao carregar categorias", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setCategoryName(category.name)
        } else {
            setEditingCategory(null)
            setCategoryName('')
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
        setCategoryName('')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!categoryName.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, categoryName)
            } else {
                await categoryService.createCategory(categoryName)
            }
            await loadData()
            handleCloseModal()
        } catch (error) {
            alert("Erro ao salvar categoria. Verifique se o nome já existe.")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(id) {
        if (window.confirm("🗑️ Excluir esta categoria? Itens vinculados a ela permanecerão no estoque, mas sem categoria definida.")) {
            try {
                await categoryService.deleteCategory(id)
                await loadData()
            } catch (error) {
                alert("Erro ao excluir categoria.")
            }
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 size={40} className="animate-spin text-[#1D4ED8]" />
            <p className="text-[#94A3B8] font-bold tracking-widest uppercase text-xs">Carregando categorias...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161B22] p-6 rounded-3xl border border-[#1E293B] shadow-2xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Categorias</h1>
                    <p className="text-[#94A3B8] mt-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <Tag size={14} className="text-[#1D4ED8]" />
                        {categories.length} categorias cadastradas
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-[#1D4ED8]/20 active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Nova Categoria
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar categorias..."
                    className="w-full bg-[#161B22] border border-[#1E293B] rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#1D4ED8]/30 text-white placeholder-[#64748B] transition-all text-lg shadow-inner"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                        <div key={category.id} className="bg-[#161B22] p-6 rounded-[2rem] border border-[#1E293B] hover:border-[#1D4ED8]/30 transition-all group shadow-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-[#0B0E14] text-[#1D4ED8] group-hover:bg-[#1D4ED8] group-hover:text-white transition-all shadow-inner border border-[#1E293B]">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-100">{category.name}</h3>
                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-1">ID: {category.id.slice(0, 8)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(category)}
                                    className="p-2 bg-[#0B0E14] rounded-xl text-[#1D4ED8] border border-[#1E293B] hover:border-[#1D4ED8]/20 transition-all shadow-inner"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 bg-[#0B0E14] rounded-xl text-red-400 border border-[#1E293B] hover:bg-red-600 hover:text-white transition-all shadow-inner"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#1E293B] rounded-[3rem] opacity-30">
                        <Tag size={60} className="text-[#64748B] mb-4" />
                        <h3 className="text-xl font-black text-white">Nenhuma categoria encontrada</h3>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300">
                    <div className="bg-[#161B22] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[#1E293B] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-[#1D4ED8]/10 to-transparent border-b border-[#1E293B]">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">
                                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                </h2>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Organize seu catálogo</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-2xl text-[#64748B] hover:text-white transition-all active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Nome da Categoria</label>
                                <input
                                    required
                                    autoFocus
                                    value={categoryName}
                                    onChange={e => setCategoryName(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold text-lg"
                                    placeholder="Ex: Kits Temáticos, Móveis, etc."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !categoryName.trim()}
                                className="w-full bg-[#1D4ED8] hover:bg-[#1e40af] disabled:bg-[#1E293B] text-white font-black px-10 py-5 rounded-[1.5rem] shadow-xl shadow-[#1D4ED8]/10 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCategory ? 'ATUALIZAR' : 'CADASTRAR')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
