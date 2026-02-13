import { TrendingUp, Users, Calendar, Banknote, ArrowRight, X, Loader2, Package, ChevronRight } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl glass card-gradient shadow-xl border border-white/5">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-slate-700/50 text-${color}-500`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="flex items-center text-emerald-400 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" /> {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
)

const BookingItem = ({ title, customer, date, status, value }) => {
    const statusColors = {
        confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        budget: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        picked_up: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        returned: 'bg-slate-500/10 text-slate-500 border-white/10'
    }

    const statusLabels = {
        confirmed: 'Reservado',
        budget: 'Orçamento',
        picked_up: 'Retirado',
        returned: 'Finalizado'
    }

    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-[1.25rem] border border-white/5 hover:bg-slate-800/60 transition-all cursor-pointer group">
            <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-slate-500 border border-white/5">
                    {title?.charAt(0) || '?'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase text-sm tracking-tight">{title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{customer} • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="font-black text-white text-sm">R$ {value}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg uppercase font-black border ${statusColors[status]}`}>
                        {statusLabels[status]}
                    </span>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    )
}

export default function Dashboard({ onNavigate = () => { } }) {
    const [isFinModalOpen, setIsFinModalOpen] = useState(false)
    const [revenueForm, setRevenueForm] = useState({ description: '', value: '' })
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayments: 0,
        monthlyBookings: 0,
        totalItems: 0,
        todayBookings: []
    })

    useEffect(() => {
        loadDashboardData()

        // TIMEOUT DE SEGURANÇA: Se o banco demorar mais de 3s para responder, 
        // destrava a tela para o usuário não ficar preso no loader.
        const timer = setTimeout(() => {
            setLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [bookings, items] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems()
            ])

            const now = new Date()
            const todayStr = now.toISOString().split('T')[0]

            // Cálculos básicos
            const confirmedBookings = bookings.filter(b => b.status !== 'budget')
            const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalValue || 0), 0)
            const pendingPayments = bookings.filter(b => b.status === 'budget').reduce((acc, b) => acc + (b.totalValue || 0), 0)
            const todayBookings = bookings.filter(b => b.startDate === todayStr)

            setStats({
                totalRevenue,
                pendingPayments,
                monthlyBookings: bookings.length,
                totalItems: items.length,
                todayBookings
            })
        } catch (error) {
            console.error("Erro no dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const generateReport = async () => {
        try {
            const doc = new jsPDF()
            const bookings = await bookingService.getAllBookings()

            doc.setFontSize(22)
            doc.text('PEGUE E MONTE - Relatorio', 20, 20)
            doc.setFontSize(10)
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30)
            doc.line(20, 35, 190, 35)

            let y = 50
            bookings.forEach((b, i) => {
                if (y > 270) {
                    doc.addPage()
                    y = 20
                }
                const date = new Date(b.startDate).toLocaleDateString('pt-BR')
                doc.text(`${i + 1}. [${date}] ${b.customer.name.toUpperCase()} - R$ ${b.totalValue} (${b.status})`, 20, y)
                y += 10
            })

            doc.save(`relatorio-${new Date().getTime()}.pdf`)
        } catch (error) {
            alert("Erro ao gerar relatório")
        }
    }

    const handleRevenueSubmit = (e) => {
        e.preventDefault()
        alert(`✨ Receita de R$ ${revenueForm.value} lançada com sucesso!`)
        setIsFinModalOpen(false)
        setRevenueForm({ description: '', value: '' })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-60 gap-4">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Preparando Dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Visão Geral</h1>
                    <p className="text-slate-500 font-medium">Controle total do seu estoque e agenda</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistema Online</p>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Receita Prevista" value={`R$ ${stats.totalRevenue},00`} icon={TrendingUp} color="blue" trend="+15%" />
                <StatCard title="A Receber" value={`R$ ${stats.pendingPayments},00`} icon={Banknote} color="amber" />
                <StatCard title="Total Locações" value={stats.monthlyBookings} icon={Calendar} color="emerald" />
                <StatCard title="Itens no Estoque" value={stats.totalItems} icon={Package} color="pink" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-black text-white tracking-tight italic">Próximos Eventos</h2>
                        <button onClick={() => onNavigate('calendar')} className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                            Ver Agenda <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {stats.todayBookings.length > 0 ? (
                            stats.todayBookings.map(b => (
                                <BookingItem
                                    key={b.id}
                                    title={`Reserva #${b.id.slice(-4)}`}
                                    customer={b.customer.name}
                                    date={`${new Date(b.startDate).toLocaleDateString('pt-BR')} (Início)`}
                                    status={b.status}
                                    value={b.totalValue}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-slate-800/20 rounded-[2rem] border border-dashed border-white/10">
                                <p className="text-slate-500 font-medium">Nenhuma saída para hoje.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white tracking-tight italic px-2">Ações Rápidas</h2>
                    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] glass border border-white/5 space-y-4 shadow-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <QuickActionButton onClick={() => onNavigate('calendar', true)} label="Novo Orçamento" color="emerald" />
                            <QuickActionButton onClick={() => setIsFinModalOpen(true)} label="Lançar Receita" color="amber" />
                            <QuickActionButton onClick={() => onNavigate('inventory', true)} label="Novo Item" color="blue" />
                            <QuickActionButton onClick={generateReport} label="Relatório PDF" color="slate" />
                        </div>
                        <div className="pt-6">
                            <div className="p-5 bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl">
                                <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2">Painel de Controle</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Você tem {stats.totalItems} itens disponíveis. Mantenha os preços atualizados para gerar orçamentos precisos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isFinModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl transition-all">
                    <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tight">Lançamento</h2>
                            <button onClick={() => setIsFinModalOpen(false)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleRevenueSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Descrição</label>
                                <input
                                    required
                                    placeholder="Ex: Aluguel Mesa Safari"
                                    className="w-full bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={revenueForm.description}
                                    onChange={e => setRevenueForm({ ...revenueForm, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Valor</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">R$</span>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0,00"
                                        className="w-full bg-slate-950/50 p-4 pl-12 rounded-2xl border border-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={revenueForm.value}
                                        onChange={e => setRevenueForm({ ...revenueForm, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 p-5 rounded-3xl font-black text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-lg">Confirmar Lançamento</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

const QuickActionButton = ({ onClick, label, color }) => {
    const colors = {
        emerald: 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20',
        amber: 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20',
        blue: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20',
        slate: 'hover:bg-slate-500/10 hover:text-slate-400 hover:border-white/10'
    }

    return (
        <button
            onClick={onClick}
            className={`p-5 bg-slate-950/40 rounded-3xl text-[10px] font-black uppercase tracking-tighter transition-all border border-white/5 leading-tight ${colors[color]}`}
        >
            {label}
        </button>
    )
}
