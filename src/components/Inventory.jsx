import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit, Package, Camera, X } from 'lucide-react'
import { inventoryService } from '../services/inventoryService'

export default function Inventory({ isModalInitiallyOpen = false, onCloseModal = () => { } }) {
    const [items, setItems] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [newItem, setNewItem] = useState({ name: '', category: '', description: '' })
    const [imageFile, setImageFile] = useState(null)

    useEffect(() => {
        setIsModalOpen(isModalInitiallyOpen)
    }, [isModalInitiallyOpen])

    useEffect(() => {
        loadItems()
    }, [])

    async function loadItems() {
        try {
            const data = await inventoryService.getAllItems()
            setItems(data)
        } catch (error) {
            console.error("Erro ao carregar itens", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setIsModalOpen(false)
        onCloseModal()
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await inventoryService.createItem(newItem, imageFile)
            handleClose()
            setNewItem({ name: '', category: '', description: '' })
            setImageFile(null)
            loadItems()
        } catch (error) {
            alert("Erro ao salvar item. Verifique as configurações do Firebase.")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Inventário</h1>
                    <p className="text-slate-400">Gerencie seus itens e kits de festa</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Novo Item
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar no estoque..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Carregando inventário...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="bg-slate-800/50 rounded-2xl overflow-hidden glass border border-white/10 group">
                            <div className="aspect-square bg-slate-700 relative overflow-hidden">
                                {item.photoURL ? (
                                    <img src={item.photoURL} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-slate-900/80 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white">
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => inventoryService.deleteItem(item.id).then(loadItems)}
                                        className="p-2 bg-slate-900/80 rounded-lg text-red-400 hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                    {item.category || 'Sem Categoria'}
                                </span>
                                <h3 className="font-bold text-lg mt-1">{item.name}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">Cadastrar Novo Item</h2>
                            <button onClick={handleClose} className="text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Item</label>
                                <input
                                    required
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Mesa Cubo Branca"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Moveis">Móveis</option>
                                    <option value="Temas">Temas/Painéis</option>
                                    <option value="Vasilhames">Vasilhames</option>
                                    <option value="Eletronicos">Eletrônicos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                    placeholder="Detalhes do item..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Foto</label>
                                <div className="relative h-32 w-full border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center hover:border-blue-500/50 transition-colors cursor-pointer group">
                                    <input
                                        type="file"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="text-center text-slate-500 group-hover:text-blue-400">
                                        <Camera size={32} className="mx-auto mb-2" />
                                        <span className="text-xs">{imageFile ? imageFile.name : 'Clique para subir foto'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                Salvar Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
