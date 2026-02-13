import { useState, useEffect, useMemo, memo } from 'react'
import {
    Edit,
    Trash2,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Search,
    Package,
    X,
    Loader2,
    Phone,
    ChevronDown,
    Check
} from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

const statusMap = {
    budget: { label: 'Orçamento', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: Clock },
    confirmed: { label: 'Reservado', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: CheckCircle2 },
    picked_up: { label: 'Retirado', color: 'text-[#1D4ED8]', bg: 'bg-[#1D4ED8]/10', icon: Package },
    returned: { label: 'Finalizado', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10', icon: CheckCircle2 }
}

const ItemSelector = ({ items, selectedIds, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase())
    )

    const selectedItems = items.filter(item => selectedIds.includes(item.id))

    return (
        <div className="relative space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1 flex justify-between">
                Itens do Catálogo
                <span className="text-[#1D4ED8]">{selectedIds.length} selecionados</span>
            </label>

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-4 cursor-pointer flex items-center justify-between group hover:border-[#1D4ED8]/30 transition-all"
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {selectedItems.length > 0 ? (
                        selectedItems.map(item => (
                            <span key={item.id} className="bg-[#1D4ED8] text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 group/item">
                                {item.name}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                                    className="hover:text-red-300 ml-1"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-[#64748B]">Selecione os itens...</span>
                    )}
                </div>
                <ChevronDown size={20} className={`text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-20 top-full mt-2 w-full bg-[#161B22] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                        <div className="p-4 border-b border-[#1E293B]">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar itens..."
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-[#1D4ED8]/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                            {filteredItems.length > 0 ? (
                                filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => onToggle(item.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedIds.includes(item.id)
                                                ? 'bg-[#1D4ED8]/10 text-[#1D4ED8]'
                                                : 'hover:bg-white/5 text-[#94A3B8] hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#0B0E14] flex items-center justify-center border border-[#1E293B]">
                                                {item.imageUrl || item.photoURL ? (
                                                    <img src={item.imageUrl || item.photoURL} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Package size={14} className="text-[#64748B]" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{item.name}</p>
                                                <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">{item.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {selectedIds.includes(item.id) && <Check size={16} />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-[#64748B]">
                                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum item encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const BookingCard = memo(({ booking, statusMap, onEdit, onDelete }) => {
    const StatusIcon = statusMap[booking.status]?.icon || AlertCircle

    return (
        <div className="bg-[#161B22] p-6 rounded-[2rem] border border-[#1E293B] hover:border-[#1D4ED8]/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
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
                    <p className="font-black text-xl text-white">R$ {Number(booking.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${statusMap[booking.status]?.color}`}>
                        {statusMap[booking.status]?.label}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(booking)}
                        className="p-2 bg-[#0B0E14] rounded-xl text-[#1D4ED8] border border-[#1D4ED8]/20 hover:bg-[#1D4ED8] hover:text-white transition-all shadow-inner"
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
    }, [])

    async function loadData() {
        try {
            setLoading(true)
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
            const needsAvailabilityCheck = ["confirmed", "picked_up"].includes(newBooking.status)

            if (needsAvailabilityCheck) {
                const busyItems = await bookingService.checkAvailability(
                    newBooking.items,
                    newBooking.startDate,
                    newBooking.endDate
                )

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 size={40} className="animate-spin text-[#1D4ED8]" />
            <p className="text-[#94A3B8] font-bold tracking-widest uppercase text-xs">Carregando agenda...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161B22] p-6 rounded-3xl border border-[#1E293B] shadow-2xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Agenda</h1>
                    <p className="text-[#94A3B8] mt-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <CalendarIcon size={14} className="text-[#1D4ED8]" />
                        {bookings.length} locações registradas
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-[#1D4ED8]/20 active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Nova Locação
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por cliente ou telefone..."
                    className="w-full bg-[#161B22] border border-[#1E293B] rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#1D4ED8]/30 text-white placeholder-[#64748B] transition-all text-lg shadow-inner"
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            statusMap={statusMap}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#1E293B] rounded-[3rem] opacity-30">
                        <CalendarIcon size={60} className="text-[#64748B] mb-4" />
                        <h3 className="text-xl font-black text-white">Nenhuma reserva encontrada</h3>
                        <p className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-widest mt-2">Agende seu primeiro evento</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300">
                    <div className="bg-[#161B22] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-[#1E293B] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-[#1D4ED8]/10 to-transparent border-b border-[#1E293B]">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">
                                    {editingBooking ? 'Editar Locação' : 'Nova Locação'}
                                </h2>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Detalhes do contrato e período</p>
                            </div>
                            <button onClick={handleClose} className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-2xl text-[#64748B] hover:text-white transition-all active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Cliente</label>
                                    <input required value={newBooking.customer.name} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, name: e.target.value } })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" placeholder="Nome completo" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">WhatsApp / Telefone</label>
                                    <input value={newBooking.customer.phone} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, phone: e.target.value } })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Início (Retirada)</label>
                                    <input type="date" required value={newBooking.startDate} onChange={e => setNewBooking({ ...newBooking, startDate: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Término (Devolvida)</label>
                                    <input type="date" required value={newBooking.endDate} onChange={e => setNewBooking({ ...newBooking, endDate: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" />
                                </div>
                            </div>

                            <ItemSelector
                                items={items}
                                selectedIds={newBooking.items}
                                onToggle={toggleItemSelection}
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Status da Reserva</label>
                                <div className="relative">
                                    <select
                                        value={newBooking.status}
                                        onChange={e => setNewBooking({ ...newBooking, status: e.target.value })}
                                        className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        {Object.entries(statusMap).map(([key, value]) => (
                                            <option key={key} value={key}>{value.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-[#0B0E14] p-6 rounded-[2.5rem] border border-[#1E293B] mt-4 shadow-inner">
                                <div>
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] mb-1">Valor Total</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#1D4ED8] font-black text-xl">R$</span>
                                        <input
                                            type="number"
                                            value={newBooking.totalValue}
                                            onChange={e => setNewBooking({ ...newBooking, totalValue: Number(e.target.value) })}
                                            className="bg-transparent text-4xl font-black w-32 outline-none text-white tracking-tighter"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#1D4ED8] hover:bg-[#1e40af] disabled:bg-[#1E293B] text-white font-black px-10 py-5 rounded-[1.5rem] shadow-xl shadow-[#1D4ED8]/10 active:scale-95 transition-all text-lg flex items-center gap-3"
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
