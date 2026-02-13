import { useState, useEffect } from 'react'
import { Plus, Search, Calendar as CalendarIcon, Filter, ChevronRight, CheckCircle2, Clock, Package, AlertCircle } from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

export default function Bookings({ isModalInitiallyOpen = false, onCloseModal = () => { } }) {
    const [bookings, setBookings] = useState([])
    const [items, setItems] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [newBooking, setNewBooking] = useState({
        customer: { name: '', phone: '' },
        items: [],
        startDate: '',
        endDate: '',
        totalValue: 0
    })

    useEffect(() => {
        setIsModalOpen(isModalInitiallyOpen)
    }, [isModalInitiallyOpen])

    const statusMap = {
        budget: { label: 'Orçamento', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
        confirmed: { label: 'Reservado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
        picked_up: { label: 'Retirado', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package },
        returned: { label: 'Finalizado', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: CheckCircle2 }
    }

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [bookingsData, itemsData] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems()
            ])
            setBookings(bookingsData)
            setItems(itemsData)
        } catch (error) {
            console.error("Erro ao carregar dados", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setIsModalOpen(false)
        onCloseModal()
    }

    async function handleCreateBooking(e) {
        e.preventDefault()

        // Validar disponibilidade antes de criar (apenas se for reserva direta ou confirmada)
        const busyItems = await bookingService.checkAvailability(
            newBooking.items,
            newBooking.startDate,
            newBooking.endDate
        )

        if (busyItems.length > 0) {
            const busyNames = items
                .filter(i => busyItems.includes(i.id))
                .map(i => i.name)
                .join(', ')
            alert(`Os seguintes itens já estão reservados para este período: ${busyNames}`)
            return
        }

        try {
            await bookingService.createBooking(newBooking)
            handleClose()
            loadData()
            setNewBooking({
                customer: { name: '', phone: '' },
                items: [],
                startDate: '',
                endDate: '',
                totalValue: 0
            })
        } catch (error) {
            alert("Erro ao criar reserva.")
        }
    }

    const toggleItemSelection = (id) => {
        const isSelected = newBooking.items.includes(id)
        if (isSelected) {
            setNewBooking({ ...newBooking, items: newBooking.items.filter(itemId => itemId !== id) })
        } else {
            setNewBooking({ ...newBooking, items: [...newBooking.items, id] })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-3xl font-bold">Agenda</h1>
                    <p className="text-slate-400">Controle de saídas e entradas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl md:px-4 md:py-2 flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={24} className="md:w-5 md:h-5" />
                    <span className="hidden md:inline">Nova Locação</span>
                </button>
            </div>

            <div className="flex gap-2 p-2 overflow-x-auto pb-4 no-scrollbar">
                {['Todos', 'Hoje', 'Pendentes', 'Finalizados'].map((filter) => (
                    <button key={filter} className="whitespace-nowrap px-6 py-2 rounded-full bg-slate-800/50 border border-white/5 text-sm font-medium hover:bg-slate-700 transition-colors">
                        {filter}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 font-medium">Sincronizando com o banco...</div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(booking => {
                        const StatusIcon = statusMap[booking.status]?.icon || AlertCircle
                        return (
                            <div key={booking.id} className="bg-slate-800/40 p-4 rounded-2xl glass border border-white/5 hover:bg-slate-800/60 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl ${statusMap[booking.status]?.bg}`}>
                                            <StatusIcon size={24} className={statusMap[booking.status]?.color} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">
                                                {booking.customer.name}
                                            </h3>
                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                <CalendarIcon size={14} />
                                                {new Date(booking.startDate).toLocaleDateString('pt-BR')} até {new Date(booking.endDate).toLocaleDateString('pt-BR')}
                                            </p>
                                            <div className="flex gap-1 mt-2">
                                                {booking.items.slice(0, 3).map((itemId, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">
                                                        {items.find(i => i.id === itemId)?.name || 'Item'}
                                                    </span>
                                                ))}
                                                {booking.items.length > 3 && (
                                                    <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">
                                                        +{booking.items.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-200">R$ {booking.totalValue}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${statusMap[booking.status]?.color}`}>
                                            {statusMap[booking.status]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal de Reserva */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 w-full max-w-2xl h-[90vh] md:h-auto overflow-y-auto rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md flex justify-between items-center p-6 border-b border-white/10 z-10">
                            <h2 className="text-xl font-bold">Nova Locação</h2>
                            <button onClick={handleClose} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronRight size={24} className="rotate-90 md:rotate-0" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Nome do Cliente</label>
                                    <input required value={newBooking.customer.name} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, name: e.target.value } })} className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Telefone</label>
                                    <input value={newBooking.customer.phone} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, phone: e.target.value } })} className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Data Retirada</label>
                                    <input type="date" required value={newBooking.startDate} onChange={e => setNewBooking({ ...newBooking, startDate: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Data Devolução</label>
                                    <input type="date" required value={newBooking.endDate} onChange={e => setNewBooking({ ...newBooking, endDate: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">Selecionar Itens</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1 pr-3 custom-scrollbar">
                                    {items.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleItemSelection(item.id)}
                                            className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${newBooking.items.includes(item.id)
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                                                : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'
                                                }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <div>
                                    <p className="text-sm text-slate-400">Total da Reserva</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-bold">R$</span>
                                        <input type="number" value={newBooking.totalValue} onChange={e => setNewBooking({ ...newBooking, totalValue: Number(e.target.value) })} className="bg-transparent text-3xl font-black w-32 outline-none focus:text-blue-400 transition-colors" />
                                    </div>
                                </div>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                    CONFIRMAR
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
