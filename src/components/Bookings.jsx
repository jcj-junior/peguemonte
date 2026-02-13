import { useState, useEffect, useMemo, memo } from 'react'
import { Plus, Search, Calendar as CalendarIcon, Filter, ChevronRight, CheckCircle2, Clock, Package, AlertCircle, Edit, Trash2, X, Loader2, Phone } from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

const statusMap = {
    budget: { label: 'Orçamento', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
    confirmed: { label: 'Reservado', color: 'text-[#b6ec13]', bg: 'bg-[#b6ec13]/10', icon: CheckCircle2 },
    picked_up: { label: 'Retirado', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: Package },
    returned: { label: 'Finalizado', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: CheckCircle2 }
}

const BookingCard = memo(({ booking, items, statusMap, onEdit, onDelete, onStatusChange }) => {
    const StatusIcon = statusMap[booking.status]?.icon || AlertCircle

    return (
        <div className="bg-slate-800/40 p-5 rounded-2xl glass border border-white/5 hover:border-blue-500/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-start">
                <div className={`p-4 rounded-2xl ${statusMap[booking.status]?.bg}`}>
                    <StatusIcon size={24} className={statusMap[booking.status]?.color} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">
                        {booking.customer.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className="text-sm text-slate-400 flex items-center gap-1.5">
                            <CalendarIcon size={14} className="text-blue-500" />
                            {new Date(booking.startDate).toLocaleDateString('pt-BR')} — {new Date(booking.endDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5">
                            <Phone size={14} className="text-emerald-500" />
                            {booking.customer.phone || 'Sem contato'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                <div className="text-left md:text-right">
                    <p className="font-black text-xl text-white">R$ {booking.totalValue}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${statusMap[booking.status]?.color}`}>
                        {statusMap[booking.status]?.label}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(booking)}
                        className="p-2 bg-slate-900/50 rounded-xl text-[#b6ec13] border border-[#b6ec13]/20 hover:bg-[#b6ec13] hover:text-black transition-all"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(booking.id)}
                        className="p-2 bg-slate-900/50 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all border border-white/5"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
})

BookingCard.displayName = 'BookingCard'

export default function Bookings({ isModalInitiallyOpen = false, onCloseModal = () => { } }) {
    const [bookings, setBookings] = useState([])
    const [items, setItems] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingBooking, setEditingBooking] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [newBooking, setNewBooking] = useState({
        customer: { name: '', phone: '' },
        items: [],
        startDate: '',
        endDate: '',
        totalValue: 0,
        status: 'budget'
    })

    useEffect(() => {
        setIsModalOpen(isModalInitiallyOpen)
    }, [isModalInitiallyOpen])

    useEffect(() => {
        loadData()

        const timer = setTimeout(() => {
            setLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
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

    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.customer.phone?.includes(searchTerm)
        )
    }, [bookings, searchTerm])

    const handleClose = () => {
        setIsModalOpen(false)
        setEditingBooking(null)
        setNewBooking({
            customer: { name: '', phone: '' },
            items: [],
            startDate: '',
            endDate: '',
            totalValue: 0,
            status: 'budget'
        })
        onCloseModal()
    }

    const handleEdit = (booking) => {
        setEditingBooking(booking)
        setNewBooking({
            customer: { ...booking.customer },
            items: [...booking.items],
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalValue: booking.totalValue,
            status: booking.status
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("🗑️ Excluir esta reserva permanentemente?")) {
            try {
                await bookingService.deleteBooking(id)
                loadData()
            } catch (error) {
                alert("Erro ao excluir reserva.")
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // Verificar disponibilidade apenas se for confirmado/retirado e se for nova ou data mudou
            const needsAvailabilityCheck = ["confirmed", "picked_up"].includes(newBooking.status)

            if (needsAvailabilityCheck) {
                const busyItems = await bookingService.checkAvailability(
                    newBooking.items,
                    newBooking.startDate,
                    newBooking.endDate
                )

                // Se estiver editando, remove os próprios itens da verificação de ocupado
                const actualBusyItems = editingBooking
                    ? busyItems.filter(itemId => !editingBooking.items.includes(itemId))
                    : busyItems

                if (actualBusyItems.length > 0) {
                    const busyNames = items
                        .filter(i => actualBusyItems.includes(i.id))
                        .map(i => i.name)
                        .join(', ')
                    alert(`Itens já reservados: ${busyNames}`)
                    setIsSubmitting(false)
                    return
                }
            }

            if (editingBooking) {
                await bookingService.updateBooking(editingBooking.id, newBooking)
            } else {
                await bookingService.createBooking(newBooking)
            }

            handleClose()
            await loadData()
            setTimeout(() => alert("✨ Reserva salva com sucesso!"), 100)
        } catch (error) {
            alert("Erro ao salvar reserva.")
        } finally {
            setIsSubmitting(false)
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-4xl font-black text-white">Agenda</h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <CalendarIcon size={16} className="text-emerald-500" />
                        {bookings.length} locações registradas
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/30 active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Nova Locação
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por cliente ou telefone..."
                    className="w-full bg-slate-800/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-slate-500 backdrop-blur-sm transition-all text-lg"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-500">
                    <Loader2 size={40} className="animate-spin text-emerald-500" />
                    <p className="font-medium animate-pulse">Carregando cronograma...</p>
                </div>
            ) : filteredBookings.length > 0 ? (
                <div className="space-y-4">
                    {filteredBookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            items={items}
                            statusMap={statusMap}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                    <CalendarIcon size={64} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 text-lg">Nenhuma reserva encontrada.</p>
                </div>
            )}

            {/* Modal de Reserva Premium */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg transition-all duration-300">
                    <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-emerald-600/10 to-transparent">
                            <div>
                                <h2 className="text-2xl font-black text-white">
                                    {editingBooking ? 'Editar Locação' : 'Nova Locação'}
                                </h2>
                                <p className="text-sm text-slate-400">Detalhes do contrato e período</p>
                            </div>
                            <button onClick={handleClose} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Cliente</label>
                                    <input required value={newBooking.customer.name} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, name: e.target.value } })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all" placeholder="Nome completo" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">WhatsApp / Telefone</label>
                                    <input value={newBooking.customer.phone} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, phone: e.target.value } })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all" placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Início (Retirada)</label>
                                    <input type="date" required value={newBooking.startDate} onChange={e => setNewBooking({ ...newBooking, startDate: e.target.value })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Término (Devolvida)</label>
                                    <input type="date" required value={newBooking.endDate} onChange={e => setNewBooking({ ...newBooking, endDate: e.target.value })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Itens do Catálogo</label>
                                    <span className="text-[10px] text-emerald-400 font-black">{newBooking.items.length} SELECIONADOS</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                                    {items.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleItemSelection(item.id)}
                                            className={`p-4 rounded-2xl border text-[11px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-2 group ${newBooking.items.includes(item.id)
                                                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20 scale-[0.98]'
                                                : 'bg-slate-950/40 border-white/5 text-slate-500 hover:border-white/20'
                                                }`}
                                        >
                                            <Package size={16} className={newBooking.items.includes(item.id) ? 'text-white' : 'text-slate-600'} />
                                            <span className="line-clamp-1">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Status da Reserva</label>
                                <select
                                    value={newBooking.status}
                                    onChange={e => setNewBooking({ ...newBooking, status: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all appearance-none cursor-pointer"
                                >
                                    {Object.entries(statusMap).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 mt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-500 font-black text-xl">R$</span>
                                        <input
                                            type="number"
                                            value={newBooking.totalValue}
                                            onChange={e => setNewBooking({ ...newBooking, totalValue: Number(e.target.value) })}
                                            className="bg-transparent text-4xl font-black w-32 outline-none text-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black px-10 py-5 rounded-[1.5rem] shadow-xl shadow-emerald-600/10 active:scale-95 transition-all text-lg flex items-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONCLUIR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
