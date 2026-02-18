import { useState, useEffect, useMemo, memo, useRef } from 'react'
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
    Check,
    ChevronLeft,
    ChevronRight,
    MoreVertical
} from 'lucide-react'
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    startOfDay,
    parseISO,
    isWithinInterval,
    getHours,
    getMinutes,
    setHours,
    setMinutes,
    differenceInHours
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'
import { categoryService } from '../services/categoryService'

const statusMap = {
    budget: { label: 'Orçamento', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', icon: Clock },
    confirmed: { label: 'Reservado', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', icon: CheckCircle2 },
    picked_up: { label: 'Retirado', color: 'text-[#1D4ED8]', bg: 'bg-[#1D4ED8]/10', border: 'border-[#1D4ED8]/30', icon: Package },
    returned: { label: 'Finalizado', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10', border: 'border-[#64748B]/30', icon: CheckCircle2 }
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
                    <div className="absolute z-[110] top-full mt-2 w-full bg-[#161B22] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
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

const MiniCalendar = ({ currentMonth, selectedDate, onDateClick, onPrevMonth, onNextMonth }) => {
    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    return (
        <div className="p-4 bg-[#161B22]/50 rounded-3xl border border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black uppercase tracking-widest text-[#94A3B8]">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <div className="flex gap-1">
                    <button onClick={onPrevMonth} className="p-1 hover:bg-white/5 rounded-lg text-[#64748B] hover:text-white transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={onNextMonth} className="p-1 hover:bg-white/5 rounded-lg text-[#64748B] hover:text-white transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                    <span key={d} className="text-[10px] font-black text-[#64748B] py-1">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, i) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const isCurrMonth = isSameMonth(day, currentMonth);

                    return (
                        <button
                            key={i}
                            onClick={() => onDateClick(day)}
                            className={`
                                aspect-square text-[11px] font-bold rounded-lg flex items-center justify-center transition-all
                                ${isSelected ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : ''}
                                ${!isSelected && isToday ? 'text-[#1D4ED8] bg-[#1D4ED8]/10' : ''}
                                ${!isSelected && !isToday && isCurrMonth ? 'text-[#94A3B8] hover:bg-white/5 hover:text-white' : ''}
                                ${!isCurrMonth ? 'text-[#334155] opacity-30 hover:bg-white/5' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default function Bookings({ isModalInitiallyOpen = false, onCloseModal = () => { } }) {
    const [bookings, setBookings] = useState([])
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingBooking, setEditingBooking] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Calendário State
    const [viewDate, setViewDate] = useState(new Date())
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const scrollRef = useRef(null)

    // Horários para o grid (Horário Comercial: 08:00 às 18:00)
    const hours = Array.from({ length: 11 }, (_, i) => i + 8)

    // Datas da semana atual
    const weekDays = useMemo(() => {
        const start = startOfWeek(viewDate, { weekStartsOn: 0 })
        return eachDayOfInterval({ start, end: addDays(start, 6) })
    }, [viewDate])

    // Função para aplicar máscara de telefone (DD) 00000-0000
    const formatPhone = (value) => {
        if (!value) return value;
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 2) return `(${phone}`;
        if (phone.length <= 6) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
        if (phone.length <= 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
    };

    const [newBooking, setNewBooking] = useState({
        customer: { name: '', phone: '' },
        items: [],
        startDate: '',
        startTime: '08:00',
        endDate: '',
        endTime: '18:00',
        totalValue: 0,
        status: 'budget',
        category: ''
    })

    // Efeito para somatizar valores dos itens selecionados
    useEffect(() => {
        if (newBooking.items.length > 0 && items.length > 0) {
            const sum = newBooking.items.reduce((acc, itemId) => {
                const item = items.find(i => i.id === itemId);
                return acc + (Number(item?.price) || 0);
            }, 0);
            setNewBooking(prev => ({ ...prev, totalValue: sum }));
        } else if (newBooking.items.length === 0 && !editingBooking) {
            setNewBooking(prev => ({ ...prev, totalValue: 0 }));
        }
    }, [newBooking.items, items, editingBooking]);

    useEffect(() => {
        setIsModalOpen(isModalInitiallyOpen)
    }, [isModalInitiallyOpen])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const [bookingsData, itemsData, categoriesData] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems(),
                categoryService.getAllCategories()
            ])
            setBookings(bookingsData)
            setItems(itemsData)
            setCategories(categoriesData)
        } catch (error) {
            console.error("Erro ao carregar dados", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setIsModalOpen(false)
        setEditingBooking(null)
        setNewBooking({
            customer: { name: '', phone: '' },
            items: [],
            startDate: '',
            startTime: '08:00',
            endDate: '',
            endTime: '18:00',
            totalValue: 0,
            status: 'budget',
            category: ''
        })
        onCloseModal()
    }

    const handleEdit = (booking) => {
        // Garantir que a data seja analisada corretamente mesmo se vier com espaço do banco
        const parseDateTime = (str) => {
            if (!str) return new Date()
            const isoStr = str.replace(' ', 'T')
            return parseISO(isoStr)
        }

        const start = parseDateTime(booking.startDate)
        const end = parseDateTime(booking.endDate)

        setEditingBooking(booking)
        setNewBooking({
            customer: { ...booking.customer },
            items: [...booking.items],
            startDate: format(start, 'yyyy-MM-dd'),
            startTime: format(start, 'HH:mm'),
            endDate: format(end, 'yyyy-MM-dd'),
            endTime: format(end, 'HH:mm'),
            totalValue: booking.totalValue,
            status: booking.status,
            category: booking.category || ''
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
            // Construir objetos Date baseados nos inputs locais (Data e Hora)
            // Isso garante que o fuso horário do navegador seja considerado corretamente
            const parseDate = (dateStr, timeStr) => {
                const [year, month, day] = dateStr.split('-').map(Number)
                const [hours, minutes] = timeStr.split(':').map(Number)
                return new Date(year, month - 1, day, hours, minutes)
            }

            const startDateObj = parseDate(newBooking.startDate, newBooking.startTime)
            const endDateObj = parseDate(newBooking.endDate, newBooking.endTime)

            if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                alert("Por favor, preencha a data e hora corretamente.")
                setIsSubmitting(false)
                return
            }

            const startISO = startDateObj.toISOString()
            const endISO = endDateObj.toISOString()

            // Payload limpo para o banco de dados (snake_case é tratado no serviço)
            const bookingPayload = {
                customer: newBooking.customer,
                items: newBooking.items,
                startDate: startISO,
                endDate: endISO,
                totalValue: newBooking.totalValue,
                status: newBooking.status,
                category: newBooking.category
            }

            const needsAvailabilityCheck = ["confirmed", "picked_up"].includes(newBooking.status)

            if (needsAvailabilityCheck) {
                const busyItems = await bookingService.checkAvailability(
                    newBooking.items,
                    startISO,
                    endISO
                )

                const actualBusyItems = editingBooking
                    ? busyItems.filter(itemId => !editingBooking.items.includes(itemId))
                    : busyItems

                if (actualBusyItems.length > 0) {
                    const busyNames = items
                        .filter(i => actualBusyItems.includes(i.id))
                        .map(i => i.name)
                        .join(', ')
                    alert(`Itens já reservados neste horário: ${busyNames}`)
                    setIsSubmitting(false)
                    return
                }
            }

            if (editingBooking) {
                await bookingService.updateBooking(editingBooking.id, bookingPayload)
            } else {
                await bookingService.createBooking(bookingPayload)
            }

            handleClose()
            await loadData()
            setTimeout(() => alert("✨ Reserva salva com sucesso!"), 100)
        } catch (error) {
            console.error("Erro completo ao salvar:", error)
            alert(`Erro ao salvar: ${error.message || 'Verifique sua conexão'}`)
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

    const handleCellClick = (day, hour) => {
        const hString = String(hour).padStart(2, '0')
        setNewBooking(prev => ({
            ...prev,
            startDate: format(day, 'yyyy-MM-dd'),
            startTime: `${hString}:00`,
            endDate: format(day, 'yyyy-MM-dd'),
            endTime: `${hString}:00`
        }))
        setIsModalOpen(true)
    }

    // Filtrar bookings por busca (cliente ou telefone)
    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.customer.phone?.includes(searchTerm)
        )
    }, [bookings, searchTerm])

    // Função para calcular o estilo do card com suporte a múltiplas colunas (eventos simultâneos)
    const getEventStyle = (booking, currentDay, allDayBookings) => {
        const start = parseISO(booking.startDate)
        const end = parseISO(booking.endDate)

        const isStart = isSameDay(currentDay, start)
        const isEnd = isSameDay(currentDay, end)

        let displayHour = 8

        if (isStart) {
            displayHour = getHours(start) + getMinutes(start) / 60
        } else if (isEnd) {
            displayHour = getHours(end) + getMinutes(end) / 60
        }

        const visibleHour = Math.min(18, Math.max(8, displayHour))
        const top = (visibleHour - 8) * 96

        // Identificar conflitos (eventos que ocupam o mesmo "slot" visual)
        const overlapping = allDayBookings
            .map(b => {
                const bStart = parseISO(b.startDate);
                const bEnd = parseISO(b.endDate);
                const bIsStart = isSameDay(currentDay, bStart);
                const bIsEnd = isSameDay(currentDay, bEnd);
                let bHour = 8;
                if (bIsStart) bHour = getHours(bStart) + getMinutes(bStart) / 60;
                else if (bIsEnd) bHour = getHours(bEnd) + getMinutes(bEnd) / 60;
                return { id: b.id, hour: Math.min(18, Math.max(8, bHour)) };
            })
            .filter(b => Math.abs(b.hour - visibleHour) < 0.5) // Conflito se estiverem a menos de 30min
            .sort((a, b) => a.id.localeCompare(b.id));

        const totalOverlapping = overlapping.length;
        const myIndex = overlapping.findIndex(b => b.id === booking.id);

        // Calcular largura e posição lateral proporcional
        const widthPercent = totalOverlapping > 1 ? (100 / totalOverlapping) : 100;
        const leftPercent = totalOverlapping > 1 ? (myIndex * widthPercent) : 0;

        return {
            top: `${top}px`,
            height: '96px', // Altura alinhada com a grade (h-24)
            left: totalOverlapping > 1 ? `${leftPercent}%` : '8px',
            width: totalOverlapping > 1 ? `calc(${widthPercent}% - 4px)` : 'calc(100% - 16px)',
            zIndex: 10 + myIndex
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 size={40} className="animate-spin text-[#1D4ED8]" />
            <p className="text-[#94A3B8] font-bold tracking-widest uppercase text-xs">Carregando agenda...</p>
        </div>
    )

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Header de Ação Estilizado */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161B22] p-6 rounded-3xl border border-[#1E293B] shadow-2xl flex-shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-white tracking-tighter">Agenda</h1>
                        <p className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-widest mt-1">
                            {format(viewDate, "MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>

                    <div className="flex items-center bg-[#0B0E14] p-1.5 rounded-2xl border border-[#1E293B]">
                        <button
                            onClick={() => setViewDate(addDays(viewDate, -7))}
                            className="p-2 hover:bg-white/5 rounded-xl text-[#64748B] hover:text-white transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setViewDate(new Date())}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#94A3B8] hover:text-[#1D4ED8] transition-colors"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => setViewDate(addDays(viewDate, 7))}
                            className="p-2 hover:bg-white/5 rounded-xl text-[#64748B] hover:text-white transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#1D4ED8]/30 text-white placeholder-[#64748B] transition-all text-sm font-bold"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-[#1D4ED8]/20 active:scale-95 group whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Nova Locação
                    </button>
                </div>
            </header>

            {/* Layout Principal em 2 Colunas */}
            <div className="flex gap-6 flex-1 min-h-0 overflow-hidden mb-4">
                {/* Sidebar com Mini Calendário */}
                <aside className="w-80 hidden lg:flex flex-col gap-6 flex-shrink-0 animate-in slide-in-from-left duration-500">
                    <MiniCalendar
                        currentMonth={currentMonth}
                        selectedDate={viewDate}
                        onDateClick={(date) => setViewDate(date)}
                        onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    />

                    <div className="bg-[#161B22] p-6 rounded-[2.5rem] border border-[#1E293B] flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-4">Legenda de Status</h3>
                        <div className="space-y-4">
                            {Object.entries(statusMap).map(([key, value]) => {
                                const Icon = value.icon
                                return (
                                    <div key={key} className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${value.bg}`}>
                                            <Icon size={14} className={value.color} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-300">{value.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </aside>

                {/* Grid do Calendário (Estilo Teams) */}
                <main className="flex-1 bg-[#161B22] rounded-[3rem] border border-[#1E293B] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-500">
                    {/* Header do Grid (Dias) */}
                    <div className="flex border-b border-[#1E293B] bg-[#1D4ED8]/5">
                        <div className="w-20 border-r border-[#1E293B] flex-shrink-0 h-16" />
                        <div className="flex flex-1">
                            {weekDays.map((day, idx) => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <div
                                        key={idx}
                                        className={`flex-1 text-center py-3 border-r border-[#1E293B] last:border-r-0 flex flex-col items-center justify-center gap-1 ${isToday ? 'bg-[#1D4ED8]/10' : ''}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                                            {format(day, 'EEE', { locale: ptBR })}
                                        </span>
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-black tracking-tight ${isToday ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/30' : 'text-white'}`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Corpo do Grid (Scrolling) */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <div className="flex min-h-full">
                            <div className="w-20 border-r border-[#1E293B] flex-shrink-0 bg-[#0B0E14]/30">
                                {hours.map(hour => (
                                    <div key={hour} className="h-24 px-3 flex flex-col items-end justify-start border-b border-[#1E293B]/20 pt-2">
                                        <span className="text-[10px] font-black text-[#64748B] tabular-nums">
                                            {String(hour).padStart(2, '0')}:00
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-1 relative">
                                {weekDays.map((day, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className="flex-1 border-r border-[#1E293B]/50 last:border-r-0 relative group"
                                    >
                                        {/* Linhas de Fundo e Botões de Clique */}
                                        <div className="absolute inset-0">
                                            {hours.map(hour => (
                                                <div
                                                    key={hour}
                                                    onClick={() => handleCellClick(day, hour)}
                                                    className="h-24 border-b border-[#1E293B]/20 relative group/cell cursor-pointer"
                                                >
                                                    <div className="absolute inset-x-2 top-2 h-8 rounded-xl bg-[#1D4ED8]/5 border border-dashed border-[#1D4ED8]/20 opacity-0 group-hover/cell:opacity-100 flex items-center justify-center transition-all">
                                                        <Plus size={14} className="text-[#1D4ED8]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Eventos da Coluna - Posicionados Absolutamente */}
                                        {filteredBookings
                                            .filter(b => {
                                                const start = startOfDay(parseISO(b.startDate))
                                                const end = startOfDay(parseISO(b.endDate))
                                                const current = startOfDay(day)
                                                return isWithinInterval(current, { start, end })
                                            })
                                            .map((booking, idx, dayBookings) => {
                                                const status = statusMap[booking.status] || statusMap.budget
                                                const start = startOfDay(parseISO(booking.startDate))
                                                const end = startOfDay(parseISO(booking.endDate))
                                                const current = startOfDay(day)

                                                const isStart = isSameDay(current, start)
                                                const isEnd = isSameDay(current, end)

                                                let typeLabel = "Em Locação"
                                                if (isStart && isEnd) typeLabel = "Retirada/Devolução"
                                                else if (isStart) typeLabel = "Retirada"
                                                else if (isEnd) typeLabel = "Devolução"

                                                const style = getEventStyle(booking, day, dayBookings)

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(booking); }}
                                                        className={`
                                                            absolute p-3.5 rounded-2xl border ${status.border} ${status.bg} 
                                                            cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all
                                                            flex flex-col gap-1.5 overflow-hidden backdrop-blur-md animate-in zoom-in-95 duration-200
                                                        `}
                                                        style={style}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <status.icon size={12} className={`${status.color} flex-shrink-0`} />
                                                            <h4 className="text-[14px] font-black truncate text-white leading-none flex-1">{booking.customer.name}</h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(booking.id);
                                                                }}
                                                                className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
                                                                title="Excluir Locação"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-col gap-2 mt-auto">
                                                            <div className="flex items-center gap-1.5 opacity-80">
                                                                <p className="text-[10px] font-black uppercase tracking-wider text-white truncate">
                                                                    {typeLabel}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase text-[#1D4ED8] bg-[#1D4ED8]/20 px-2 py-0.5 rounded-lg border border-[#1D4ED8]/20 w-fit truncate max-w-full">
                                                                {booking.category || 'Geral'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300">
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

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Cliente</label>
                                    <input required value={newBooking.customer.name} onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, name: e.target.value } })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" placeholder="Nome completo" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">WhatsApp / Telefone</label>
                                    <input
                                        value={newBooking.customer.phone}
                                        onChange={e => setNewBooking({ ...newBooking, customer: { ...newBooking.customer, phone: formatPhone(e.target.value) } })}
                                        className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold"
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Data Retirada</label>
                                    <input type="date" required value={newBooking.startDate} onChange={e => setNewBooking({ ...newBooking, startDate: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Hora Retirada</label>
                                    <input
                                        type="time"
                                        required
                                        value={newBooking.startTime}
                                        onChange={e => {
                                            const time = e.target.value;
                                            setNewBooking({ ...newBooking, startTime: time })
                                        }}
                                        className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Data Devolução</label>
                                    <input type="date" required value={newBooking.endDate} onChange={e => setNewBooking({ ...newBooking, endDate: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Hora Devolução</label>
                                    <input type="time" required value={newBooking.endTime} onChange={e => setNewBooking({ ...newBooking, endTime: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all shadow-inner font-bold" />
                                </div>
                            </div>

                            <ItemSelector
                                items={items}
                                selectedIds={newBooking.items}
                                onToggle={toggleItemSelection}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Categoria do Evento</label>
                                    <div className="relative">
                                        <select
                                            value={newBooking.category}
                                            onChange={e => setNewBooking({ ...newBooking, category: e.target.value })}
                                            className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl px-5 py-3 focus:border-[#1D4ED8]/50 outline-none text-white transition-all appearance-none cursor-pointer font-bold"
                                        >
                                            <option value="">Selecione...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" size={18} />
                                    </div>
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
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#1D4ED8]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Salvando...' : editingBooking ? 'Salvar Alterações' : 'Confirmar Reserva'}
                                    </button>
                                    {editingBooking && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(editingBooking.id)}
                                            className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest py-2 transition-all"
                                        >
                                            Excluir Locação
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
