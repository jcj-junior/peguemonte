import { TrendingUp, Calendar, ArrowRight, Loader2, Package, Search, Bell, Plus, Truck, Wallet, ClipboardCheck, Printer, AlertTriangle, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
// import { jsPDF } from 'jspdf'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

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

const LogItem = ({ item, client, phone, time, status, type }) => {
    const statusConfig = {
        pickup: {
            'awaiting': { label: 'Aguardando Retirada', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
            'ready': { label: 'Pronto', color: 'text-[#10B981] bg-[#10B981]/10' },
            'scheduled': { label: 'Agendado', color: 'text-[#1D4ED8] bg-[#1D4ED8]/10' }
        },
        return: {
            'pending': { label: 'Aguardando Devolução', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
            'late': { label: 'Atrasado', color: 'text-red-500 bg-red-500/10' }
        }
    }

    const currentStatus = statusConfig[type][status] || { label: status, color: 'text-[#64748B] bg-white/5' }

    return (
        <div className="grid grid-cols-12 items-center p-4 hover:bg-white/[0.02] transition-colors gap-4 border-b border-[#1E293B] last:border-0">
            <div className="col-span-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#0B0E14] border border-[#1E293B] flex items-center justify-center overflow-hidden">
                    <Package size={20} className="text-[#64748B]" />
                </div>
                <div>
                    <p className="text-sm font-black text-white tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">#{item.id || 'ORD-2491'}</p>
                </div>
            </div>
            <div className="col-span-3">
                <p className="text-sm font-bold text-slate-300">{client}</p>
                <p className="text-[10px] font-bold text-[#64748B]">{phone}</p>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-bold text-slate-300">{time}</p>
            </div>
            <div className="col-span-2">
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${currentStatus.color}`}>
                    {currentStatus.label}
                </span>
            </div>
            <div className="col-span-1 flex justify-end">
                {status === 'ready' ? (
                    <button className="bg-[#1D4ED8]/10 text-[#1D4ED8] border border-[#1D4ED8]/20 text-[10px] font-black px-4 py-2 rounded-xl active:scale-95 hover:bg-[#1D4ED8] hover:text-white transition-all">
                        Finalizar
                    </button>
                ) : (
                    <ArrowRight size={18} className="text-[#64748B] cursor-pointer hover:text-white transition-colors" />
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
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeRentals: 0,
        availablePercent: 0,
        pickups: [],
        returns: []
    })

    useEffect(() => {
        loadDashboardData()
        const timer = setTimeout(() => setLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [bookings] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems()
            ])

            const monthRevenue = bookings
                .filter(b => b.status !== 'budget')
                .reduce((acc, b) => acc + (b.totalValue || 0), 0)

            const activeRentals = bookings.filter(b => b.status === 'picked_up').length

            setStats({
                totalRevenue: monthRevenue,
                activeRentals: activeRentals || 28,
                availablePercent: 85,
                pickups: [
                    { id: '1', item: { name: 'Kit Tropical Verão' }, client: 'Fernanda Oliveira', phone: '+55 (11) 99823-1020', time: '09:00 - 10:00', status: 'awaiting' },
                    { id: '2', item: { name: 'Set Luxo Dourado' }, client: 'Carlos Mendes', phone: '+55 (11) 98722-4432', time: '10:30 - 11:30', status: 'ready' },
                    { id: '3', item: { name: 'Tema Herói Azul' }, client: 'Juliana Paes', phone: '+55 (11) 99123-5567', time: '13:00 - 14:00', status: 'scheduled' },
                ],
                returns: []
            })
        } catch (error) {
            console.error("Erro no dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-60 gap-4 bg-[#0B0E14]">
                <Loader2 size={48} className="animate-spin text-[#1D4ED8]" />
                <p className="text-[#94A3B8] font-bold tracking-widest uppercase text-xs">Puxando dados...</p>
            </div>
        )
    }

    const todayLabel = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

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
                <StatCard title="Receita Mensal" value={`R$ ${stats.totalRevenue || '42.580'}`} trend="12.5%" icon={Wallet} />
                <StatCard title="Locações Ativas" value={`${stats.activeRentals} Pedidos`} icon={Truck} />
                <StatCard title="Saúde do Estoque" value={`${stats.availablePercent}% Disponíveis`} progress={85} icon={ClipboardCheck} />
            </div>

            {/* Today's Log Card */}
            <div className="bg-[#161B22] rounded-[2.5rem] border border-[#1E293B] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="p-8 border-b border-[#1E293B] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1D4ED8]/10 text-[#1D4ED8] p-2 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Log de Hoje</h2>
                    </div>
                    <div className="bg-[#0B0E14] p-1.5 rounded-2xl flex border border-[#1E293B]">
                        <button
                            onClick={() => setActiveTab('pickups')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'pickups' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Retiradas (12)
                        </button>
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'returns' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Devoluções (8)
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-12 px-4 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#1E293B]">
                        <div className="col-span-4">Item / Kit</div>
                        <div className="col-span-3">Cliente</div>
                        <div className="col-span-2">Horário</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Ação</div>
                    </div>
                    <div className="min-h-[300px]">
                        {activeTab === 'pickups' ? (
                            stats.pickups.map(log => (
                                <LogItem key={log.id} {...log} type="pickup" />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <Truck size={48} className="text-[#64748B]" />
                                <p className="font-bold uppercase tracking-widest text-xs mt-4 text-[#64748B]">Sem devoluções hoje</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex justify-between items-center border-t border-[#1E293B] mt-4">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Exibindo 4 de 12 retiradas</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-[#0B0E14] border border-[#1E293B] rounded-xl text-[10px] font-black text-[#64748B] hover:text-white transition-all shadow-inner">Ant</button>
                            <button className="px-4 py-2 bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 rounded-xl text-[10px] font-black text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all">Prox</button>
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
        </div>
    )
}
