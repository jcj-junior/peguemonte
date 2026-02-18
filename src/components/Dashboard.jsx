import { TrendingUp, Calendar, ArrowRight, Loader2, Package, Search, Bell, Plus, Truck, Wallet, ClipboardCheck, Printer, AlertTriangle, MessageCircle, Eye, X, Phone, User, Clock, Tag, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'
import { format, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const StatCard = ({ title, value, icon: Icon, trend, progress }) => (
    <div className="bg-[#161B22] p-6 rounded-[2rem] border border-[#1E293B] space-y-4 hover:border-[#1D4ED8]/30 transition-all group shadow-xl">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B0E14] text-[#1D4ED8] group-hover:bg-[#1D4ED8] group-hover:text-white transition-all shadow-inner">
                <Icon size={20} />
            </div>
        </div>

        {trend && (
            <div className="flex items-center gap-2">
                <span className="flex items-center text-[#10B981] text-xs font-black bg-[#10B981]/10 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} className="mr-1" /> {trend}
                </span>
                <span className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider italic">vs mês anterior</span>
            </div>
        )}

        {progress !== undefined && (
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{progress}% Disponível</span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E293B]">
                    <div
                        className="h-full bg-gradient-to-r from-[#1D4ED8] to-[#10B981] rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )}
    </div>
)

const LogItem = ({ id, item, client, phone, startDateFormatted, endDateFormatted, status, type, onAction, onView }) => {
    const statusConfig = {
        pickup: {
            'awaiting': { icon: Clock, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20', label: 'Orçamento' },
            'ready': { icon: CheckCircle2, color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20', label: 'Pronto' },
            'scheduled': { icon: CheckCircle2, color: 'text-[#1D4ED8] bg-[#1D4ED8]/10 border-[#1D4ED8]/20', label: 'Reservado' }
        },
        return: {
            'pending': { icon: Package, color: 'text-[#1D4ED8] bg-[#1D4ED8]/10 border-[#1D4ED8]/20', label: 'Retirado' },
            'late': { icon: AlertTriangle, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Atrasado' }
        }
    }

    const currentStatus = statusConfig[type][status] || { icon: Tag, color: 'text-[#64748B] bg-white/5 border-white/10', label: status }
    const StatusIcon = currentStatus.icon

    return (
        <div className="grid grid-cols-12 items-center p-4 hover:bg-white/[0.02] transition-colors gap-4 border-b border-[#1E293B] last:border-0">
            <div className="col-span-3 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#0B0E14] border border-[#1E293B] flex items-center justify-center overflow-hidden">
                    <Package size={20} className="text-[#64748B]" />
                </div>
                <div>
                    <p className="text-sm font-black text-white tracking-tight leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">#{item.id}</p>
                </div>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-bold text-slate-300 truncate">{client}</p>
                <p className="text-[10px] font-bold text-[#64748B]">{phone}</p>
            </div>
            <div className="col-span-2">
                <p className="text-[11px] font-black text-white uppercase tracking-tight">{startDateFormatted.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-[#64748B]">{startDateFormatted.split(' ')[1]}</p>
            </div>
            <div className="col-span-2">
                <p className="text-[11px] font-black text-white uppercase tracking-tight">{endDateFormatted.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-[#64748B]">{endDateFormatted.split(' ')[1]}</p>
            </div>
            <div className="col-span-2 flex justify-center">
                <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all hover:scale-110 cursor-help ${currentStatus.color}`}
                    title={currentStatus.label}
                >
                    <StatusIcon size={20} />
                </div>
            </div>
            <div className="col-span-1 flex justify-end items-center gap-2">
                <button
                    onClick={() => onView(id)}
                    className="p-2 bg-white/5 text-[#94A3B8] border border-[#1E293B] rounded-xl hover:bg-[#1D4ED8]/10 hover:text-[#1D4ED8] hover:border-[#1D4ED8]/20 transition-all"
                    title="Visualizar Detalhes"
                >
                    <Eye size={16} />
                </button>

                {type === 'pickup' ? (
                    <button
                        onClick={() => onAction(id, 'picked_up')}
                        className="p-2 bg-[#1D4ED8]/10 text-[#1D4ED8] border border-[#1E293B] rounded-xl active:scale-95 hover:bg-[#1D4ED8] hover:text-white transition-all shadow-lg shadow-[#1D4ED8]/10"
                        title="Marcar como Retirado"
                    >
                        <Truck size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => onAction(id, 'returned')}
                        className="p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl active:scale-95 hover:bg-[#10B981] hover:text-white transition-all shadow-lg shadow-[#10B981]/10"
                        title="Marcar como Devolvido"
                    >
                        <ClipboardCheck size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}

const QuickAction = ({ icon: Icon, title, desc, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-4 p-5 bg-[#161B22] border border-[#1E293B] rounded-[1.5rem] hover:border-[#1D4ED8]/30 hover:bg-white/[0.02] transition-all group text-left shadow-lg">
        <div className="h-12 w-12 rounded-2xl bg-[#0B0E14] flex items-center justify-center text-[#1D4ED8] group-hover:bg-[#1D4ED8] group-hover:text-white transition-all shadow-inner border border-[#1E293B]">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm font-black text-white tracking-tight">{title}</p>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{desc}</p>
        </div>
    </button>
)

export default function Dashboard({ onNavigate = () => { } }) {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pickups')
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeRentals: 0,
        availablePercent: 0,
        pickups: [],
        returns: [],
        rawBookings: [],
        items: []
    })

    useEffect(() => {
        loadDashboardData()
        const timer = setTimeout(() => setLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [bookings, itemsData] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems()
            ])

            const today = startOfDay(new Date())

            // Cálculos para os StatCards
            const monthRevenue = bookings
                .filter(b => b.status !== 'budget')
                .reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0)

            const activeRentals = bookings.filter(b => b.status === 'picked_up').length

            // Processar Retiradas (Próximas locações)
            const pickups = bookings
                .filter(b => b.status === 'confirmed' || b.status === 'budget')
                .map(b => {
                    const start = parseISO(b.startDate)
                    const end = parseISO(b.endDate)
                    const firstItem = itemsData.find(i => i.id === b.items[0])

                    return {
                        id: b.id,
                        item: {
                            name: b.items.length > 1 ? `${firstItem?.name || 'Item'} +${b.items.length - 1}` : (firstItem?.name || 'Item'),
                            id: b.id.slice(0, 8).toUpperCase()
                        },
                        client: b.customer.name,
                        phone: b.customer.phone,
                        startDateFormatted: format(start, 'dd/MM/yyyy HH:mm'),
                        endDateFormatted: format(end, 'dd/MM/yyyy HH:mm'),
                        status: b.status === 'confirmed' ? 'scheduled' : 'awaiting',
                        date: start
                    }
                })
                .sort((a, b) => a.date - b.date)

            // Processar Devoluções (Locações ativas que devem voltar)
            const returns = bookings
                .filter(b => b.status === 'picked_up')
                .map(b => {
                    const start = parseISO(b.startDate)
                    const end = parseISO(b.endDate)
                    const firstItem = itemsData.find(i => i.id === b.items[0])
                    const isLate = end < new Date()

                    return {
                        id: b.id,
                        item: {
                            name: b.items.length > 1 ? `${firstItem?.name || 'Item'} +${b.items.length - 1}` : (firstItem?.name || 'Item'),
                            id: b.id.slice(0, 8).toUpperCase()
                        },
                        client: b.customer.name,
                        phone: b.customer.phone,
                        startDateFormatted: format(start, 'dd/MM/yyyy HH:mm'),
                        endDateFormatted: format(end, 'dd/MM/yyyy HH:mm'),
                        status: isLate ? 'late' : 'pending',
                        date: end
                    }
                })
                .sort((a, b) => a.date - b.date)

            const availableItems = itemsData.length
            const totalStock = itemsData.reduce((acc, item) => acc + (item.quantity || 1), 0)
            const rentedItems = bookings
                .filter(b => b.status === 'picked_up')
                .reduce((acc, b) => acc + b.items.length, 0)
            const availablePercent = totalStock > 0 ? Math.round(((totalStock - rentedItems) / totalStock) * 100) : 100

            setStats({
                totalRevenue: monthRevenue,
                activeRentals: activeRentals,
                availablePercent: availablePercent,
                pickups: pickups,
                returns: returns,
                rawBookings: bookings,
                items: itemsData
            })
        } catch (error) {
            console.error("Erro no dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleBookingAction = async (id, newStatus) => {
        try {
            await bookingService.updateBooking(id, { status: newStatus })
            await loadDashboardData()
        } catch (error) {
            console.error("Erro ao executar ação:", error)
            alert("Erro ao atualizar status da reserva.")
        }
    }

    const handleViewBooking = (id) => {
        const booking = stats.rawBookings.find(b => b.id === id)
        if (booking) setSelectedBooking(booking)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-60 gap-4 bg-[#0B0E14]">
                <Loader2 size={42} className="text-[#1D4ED8] animate-spin" />
                <p className="text-[#64748B] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Carregando Painel...</p>
            </div>
        )
    }

    const todayLabel = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Top Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Painel</h1>
                    <p className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-[0.2em]">Visão geral de <span className="text-[#1D4ED8]">{todayLabel}</span></p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <input
                            placeholder="Buscar pedidos..."
                            className="bg-[#161B22] border border-[#1E293B] rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder-[#64748B] outline-none focus:border-[#1D4ED8]/30 w-64 transition-all"
                        />
                    </div>
                    <button className="relative h-12 w-12 bg-[#161B22] border border-[#1E293B] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#1D4ED8]/20 transition-all">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 h-2 w-2 bg-[#10B981] rounded-full border-2 border-[#161B22]" />
                    </button>
                    <button
                        onClick={() => onNavigate('calendar', true)}
                        className="px-6 py-3 bg-[#1D4ED8] text-white font-black text-sm rounded-2xl hover:bg-[#1e40af] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#1D4ED8]/20"
                    >
                        <Plus size={18} /> Novo Pedido
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Receita Mensal"
                    value={`R$ ${(stats.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    trend="12.5%"
                    icon={Wallet}
                />
                <StatCard title="Locações Ativas" value={`${stats.activeRentals} Pedidos`} icon={Truck} />
                <StatCard title="Saúde do Estoque" value={`${stats.availablePercent}% Disponíveis`} progress={85} icon={ClipboardCheck} />
            </div>

            {/* Today's Log Card */}
            <div className="col-span-full bg-[#161B22] rounded-[2.5rem] border border-[#1E293B] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="p-8 border-b border-[#1E293B] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1D4ED8]/10 text-[#1D4ED8] p-2 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Próximas Locações</h2>
                    </div>
                    <div className="bg-[#0B0E14] p-1.5 rounded-2xl flex border border-[#1E293B]">
                        <button
                            onClick={() => setActiveTab('pickups')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'pickups' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Retiradas ({stats.pickups.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'returns' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Devoluções ({stats.returns.length})
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-12 px-4 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#1E293B]">
                        <div className="col-span-3">Item / Kit</div>
                        <div className="col-span-2">Cliente</div>
                        <div className="col-span-2">Retirada</div>
                        <div className="col-span-2">Devolução</div>
                        <div className="col-span-2 block text-center">Status</div>
                        <div className="col-span-1 text-right">Ação</div>
                    </div>
                    <div className="min-h-[300px]">
                        {activeTab === 'pickups' ? (
                            stats.pickups.length > 0 ? (
                                stats.pickups.map(log => (
                                    <LogItem
                                        key={log.id}
                                        {...log}
                                        type="pickup"
                                        onAction={handleBookingAction}
                                        onView={handleViewBooking}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <ClipboardCheck size={48} className="text-[#64748B]" />
                                    <p className="font-bold uppercase tracking-widest text-xs mt-4 text-[#64748B]">Nenhuma retirada agendada</p>
                                </div>
                            )
                        ) : (
                            stats.returns.length > 0 ? (
                                stats.returns.map(log => (
                                    <LogItem
                                        key={log.id}
                                        {...log}
                                        type="return"
                                        onAction={handleBookingAction}
                                        onView={handleViewBooking}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <Truck size={48} className="text-[#64748B]" />
                                    <p className="font-bold uppercase tracking-widest text-xs mt-4 text-[#64748B]">Sem devoluções pendentes</p>
                                </div>
                            )
                        )}
                    </div>
                    <div className="p-4 flex justify-between items-center border-t border-[#1E293B] mt-4">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                            Exibindo {activeTab === 'pickups' ? stats.pickups.length : stats.returns.length} {activeTab === 'pickups' ? 'retiradas' : 'devoluções'}
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-[#0B0E14] border border-[#1E293B] rounded-xl text-[10px] font-black text-[#64748B] hover:text-white transition-all shadow-inner">Ant</button>
                            <button className="px-4 py-2 bg-[#1D4ED8]/10 border border-[#1E293B] rounded-xl text-[10px] font-black text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all">Prox</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickAction icon={Plus} title="Novo Item" desc="Atualizar Estoque" onClick={() => onNavigate('inventory', true)} />
                <QuickAction icon={Printer} title="Imprimir Etiquetas" desc="Para pedidos de hoje" />
                <QuickAction icon={AlertTriangle} title="Itens Danificados" desc="Reportar problemas" />
                <QuickAction icon={MessageCircle} title="Contatar Clientes" desc="Via WhatsApp" />
            </div>

            {/* Modal de Detalhes da Reserva */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#161B22] w-full max-w-lg rounded-[2.5rem] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header do Modal */}
                        <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-[#0B0E14]/50">
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <Tag size={20} className="text-[#1D4ED8]" /> Detalhes da Locação
                            </h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="h-10 w-10 bg-[#0B0E14] border border-[#1E293B] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {/* Seção Cliente */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                                    <User size={14} /> Dados do Cliente
                                </div>
                                <div className="bg-[#0B0E14] p-5 rounded-2xl border border-[#1E293B]">
                                    <p className="text-lg font-black text-white">{selectedBooking.customer.name}</p>
                                    <div className="flex items-center gap-2 text-[#94A3B8] font-bold mt-1">
                                        <Phone size={14} /> {selectedBooking.customer.phone}
                                    </div>
                                </div>
                            </div>

                            {/* Seção Período */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                                        <Clock size={14} /> Retirada
                                    </div>
                                    <div className="bg-[#0B0E14] p-4 rounded-2xl border border-[#1E293B]">
                                        <p className="text-white font-black">{format(parseISO(selectedBooking.startDate), 'dd/MM/yyyy')}</p>
                                        <p className="text-[#1D4ED8] font-black text-xs">{format(parseISO(selectedBooking.startDate), 'HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                                        <Clock size={14} /> Devolução
                                    </div>
                                    <div className="bg-[#0B0E14] p-4 rounded-2xl border border-[#1E293B]">
                                        <p className="text-white font-black">{format(parseISO(selectedBooking.endDate), 'dd/MM/yyyy')}</p>
                                        <p className="text-[#1D4ED8] font-black text-xs">{format(parseISO(selectedBooking.endDate), 'HH:mm')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seção Itens */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                                    <Package size={14} /> Itens Contratados
                                </div>
                                <div className="space-y-2">
                                    {selectedBooking.items.map(itemId => {
                                        const item = stats.items.find(i => i.id === itemId)
                                        return (
                                            <div key={itemId} className="flex items-center justify-between bg-[#0B0E14] p-4 rounded-2xl border border-[#1E293B]">
                                                <div className="flex items-center gap-3">
                                                    <Package size={16} className="text-[#64748B]" />
                                                    <span className="text-sm font-bold text-white">{item?.name || 'Item Removido'}</span>
                                                </div>
                                                <span className="text-xs font-black text-[#64748B]">R$ {Number(item?.price || 0).toFixed(2)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Seção Financeira e Status */}
                            <div className="pt-6 border-t border-[#1E293B] flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-1">Valor Total</p>
                                    <p className="text-2xl font-black text-white tracking-tighter">R$ {Number(selectedBooking.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-1">Status Atual</p>
                                    <span className="text-xs font-black text-[#1D4ED8] bg-[#1D4ED8]/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-[#1D4ED8]/20">
                                        {{
                                            'budget': 'Orçamento',
                                            'confirmed': 'Reservado',
                                            'picked_up': 'Retirado',
                                            'returned': 'Finalizado',
                                            'cancelled': 'Cancelado'
                                        }[selectedBooking.status] || selectedBooking.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
