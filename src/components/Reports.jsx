import { useState, useEffect, useMemo } from 'react'
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Calendar,
    Download,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    FileText,
    ChevronDown,
    Package
} from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-[#161B22] p-6 rounded-[2rem] border border-[#1E293B] shadow-xl hover:border-[#1D4ED8]/30 transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${color}/10 transition-all`} />

        <div className="flex justify-between items-start relative z-10">
            <div className={`p-3 rounded-2xl bg-[#0B0E14] border border-[#1E293B] text-${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trendValue}
                </div>
            )}
        </div>

        <div className="mt-6 relative z-10">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-2xl font-black text-white mt-1 letter-spacing-tighter">{value}</h3>
        </div>
    </div>
)

const ChartBar = ({ height, label, value, active }) => (
    <div className="flex flex-col items-center gap-3 flex-1 group">
        <div className="relative w-full flex flex-col items-center justify-end h-40">
            <div
                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out relative group-hover:brightness-125 ${active ? 'bg-[#1D4ED8]' : 'bg-[#1D4ED8]/20'
                    }`}
                style={{ height: `${height}%` }}
            >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B0E14] text-white text-[10px] font-black py-1 px-2 rounded-lg border border-[#1E293B] shadow-xl transition-all whitespace-nowrap z-20">
                    R$ {value.toLocaleString('pt-BR')}
                </div>
            </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-[#64748B]'}`}>
            {label}
        </span>
    </div>
)

export default function Reports() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('month') // 'month', 'year', 'all'

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await bookingService.getAllBookings()
            setBookings(data)
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error)
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        if (!bookings.length) return { total: 0, count: 0, avg: 0, pending: 0 }

        const now = new Date()
        const currentMonthStart = startOfMonth(now)
        const currentMonthEnd = endOfMonth(now)

        const currentMonthBookings = bookings.filter(b => {
            const date = parseISO(b.startDate)
            return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })
        })

        const total = currentMonthBookings.reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0)
        const count = currentMonthBookings.length
        const avg = count > 0 ? total / count : 0

        const pendingValue = bookings
            .filter(b => b.status === 'budget')
            .reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0)

        return {
            total: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            count,
            avg: avg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            pending: pendingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }
    }, [bookings])

    const monthlyData = useMemo(() => {
        const last6Months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i)
            const label = format(date, 'MMM', { locale: ptBR })
            const monthStart = startOfMonth(date)
            const monthEnd = endOfMonth(date)

            const value = bookings
                .filter(b => {
                    const bDate = parseISO(b.startDate)
                    return isWithinInterval(bDate, { start: monthStart, end: monthEnd })
                })
                .reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0)

            last6Months.push({ label, value, date })
        }

        const maxVal = Math.max(...last6Months.map(m => m.value), 1)
        return last6Months.map(m => ({
            ...m,
            height: (m.value / maxVal) * 100
        }))
    }, [bookings])

    const topCategories = useMemo(() => {
        const cats = {}
        bookings.forEach(b => {
            const cat = b.category || 'Geral'
            cats[cat] = (cats[cat] || 0) + 1
        })

        return Object.entries(cats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
    }, [bookings])

    return (
        <div className="space-y-8 animate-in fade-in duration-700 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
            {/* Header com Filtros */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#161B22] p-8 rounded-[2.5rem] border border-[#1E293B] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1D4ED8]/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter">Relatórios</h1>
                    <p className="text-[#94A3B8] mt-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-[0.2em]">
                        <BarChart3 size={14} className="text-[#1D4ED8]" />
                        Análise de desempenho e financeira
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="flex bg-[#0B0E14] border border-[#1E293B] p-1 rounded-2xl w-full md:w-auto">
                        <button
                            onClick={() => setPeriod('month')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'month' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setPeriod('year')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'year' ? 'bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/20' : 'text-[#64748B] hover:text-white'}`}
                        >
                            Ano
                        </button>
                    </div>
                    <button className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-2xl text-[#64748B] hover:text-white transition-all shadow-xl active:scale-90">
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {/* Grid de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Faturamento (Mês)"
                    value={stats.total}
                    icon={DollarSign}
                    trend="up"
                    trendValue="12.5%"
                    color="[#1D4ED8]"
                />
                <StatCard
                    title="Total de Locações"
                    value={stats.count}
                    icon={Calendar}
                    trend="up"
                    trendValue="+3"
                    color="green-500"
                />
                <StatCard
                    title="Ticket Médio"
                    value={stats.avg}
                    icon={TrendingUp}
                    color="purple-500"
                />
                <StatCard
                    title="Valor em Orçamentos"
                    value={stats.pending}
                    icon={FileText}
                    color="yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico de Faturamento */}
                <div className="lg:col-span-2 bg-[#161B22] p-8 rounded-[2.5rem] border border-[#1E293B] shadow-2xl relative">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Evolução do Faturamento</h3>
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Últimos 6 meses</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-[#1D4ED8]" />
                                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Receita</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-4 h-64 px-4">
                        {monthlyData.map((data, idx) => (
                            <ChartBar
                                key={idx}
                                label={data.label}
                                value={data.value}
                                height={data.height}
                                active={idx === monthlyData.length - 1}
                            />
                        ))}
                    </div>
                </div>

                {/* Categorias mais Alugadas */}
                <div className="bg-[#161B22] p-8 rounded-[2.5rem] border border-[#1E293B] shadow-2xl flex flex-col h-full">
                    <h3 className="text-xl font-black text-white tracking-tight mb-2 text-center">Top Categorias</h3>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-8 text-center italic">Mais solicitadas</p>

                    <div className="flex-1 space-y-6 flex flex-col justify-center">
                        {topCategories.map(([cat, count], idx) => (
                            <div key={idx} className="space-y-2 group">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{cat}</span>
                                    <span className="text-xs font-black text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-lg border border-[#1D4ED8]/20">{count} locaç.</span>
                                </div>
                                <div className="h-2 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E293B]">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#1D4ED8]/40 to-[#1D4ED8] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(count / Math.max(...topCategories.map(c => c[1]))) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Log de Atividades Recentes (Financeiro) */}
            <div className="bg-[#161B22] rounded-[2.5rem] border border-[#1E293B] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-[#1E293B] flex justify-between items-center bg-[#0B0E14]/30">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Movimentações Recentes</h3>
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Dados financeiros detalhados</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 px-8 py-4 bg-[#0B0E14]/30 border-b border-[#1E293B] text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">
                    <div className="col-span-3">Cliente / ID</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2">Categoria</div>
                    <div className="col-span-3">Período da Locação</div>
                    <div className="col-span-2 text-right">Valor Total</div>
                </div>

                <div className="divide-y divide-[#1E293B]">
                    {bookings.slice(0, 10).map((b, idx) => {
                        const statusMap = {
                            'budget': { label: 'Orçamento', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
                            'confirmed': { label: 'Reservado', color: 'text-[#1D4ED8] bg-[#1D4ED8]/10 border-[#1D4ED8]/20' },
                            'picked_up': { label: 'Retirado', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                            'returned': { label: 'Finalizado', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
                            'ready': { label: 'Pronto', color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
                            'scheduled': { label: 'Agendado', color: 'text-[#1D4ED8] bg-[#1D4ED8]/10 border-[#1D4ED8]/20' }
                        }
                        const currentStatus = statusMap[b.status] || { label: b.status, color: 'text-[#64748B] bg-white/5 border-white/10' }

                        return (
                            <div key={idx} className="px-8 py-5 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors group">
                                <div className="col-span-3 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-[#0B0E14] flex items-center justify-center border border-[#1E293B] group-hover:border-[#1D4ED8]/30 transition-colors">
                                        <TrendingUp size={18} className="text-[#1D4ED8]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate leading-tight">{b.customer.name}</p>
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">#{b.id.substring(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${currentStatus.color}`}>
                                        {currentStatus.label}
                                    </span>
                                </div>

                                <div className="col-span-2">
                                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 group-hover:text-white transition-colors">
                                        {b.category || 'Geral'}
                                    </span>
                                </div>

                                <div className="col-span-3">
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">
                                                {format(parseISO(b.startDate), 'dd MMM', { locale: ptBR })}
                                            </p>
                                            <p className="text-[9px] font-bold opacity-60">Início</p>
                                        </div>
                                        <div className="h-px w-4 bg-[#1E293B]" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">
                                                {format(parseISO(b.endDate), 'dd MMM', { locale: ptBR })}
                                            </p>
                                            <p className="text-[9px] font-bold opacity-60">Fim</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-black text-white">
                                        R$ {Number(b.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[9px] font-bold text-[#1D4ED8] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Detalhes →</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
