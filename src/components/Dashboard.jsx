import { TrendingUp, Users, Calendar, Banknote, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { bookingService } from '../services/bookingService'

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl glass card-gradient shadow-xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-slate-700 text-${color}-500`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="flex items-center text-emerald-400 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" /> {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
)

const BookingItem = ({ title, customer, date, status, value }) => {
    const statusColors = {
        confirmed: 'bg-emerald-500/20 text-emerald-500',
        budget: 'bg-amber-500/20 text-amber-500',
        picked_up: 'bg-blue-500/20 text-blue-500',
        returned: 'bg-slate-500/20 text-slate-500'
    }

    const statusLabels = {
        confirmed: 'Confirmado',
        budget: 'Orçamento',
        picked_up: 'Retirado',
        returned: 'Devolvido'
    }

    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-400">
                    {title.charAt(0)}
                </div>
                <div>
                    <h4 className="font-semibold text-slate-200">{title}</h4>
                    <p className="text-xs text-slate-400">{customer} • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="font-bold">R$ {value}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${statusColors[status]}`}>
                        {statusLabels[status]}
                    </span>
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
            </div>
        </div>
    )
}

export default function Dashboard({ onNavigate = () => { } }) {
    const [isFinModalOpen, setIsFinModalOpen] = useState(false)
    const [revenue, setRevenue] = useState({ description: '', value: '' })

    const generateReport = async () => {
        try {
            const doc = new jsPDF()
            const bookings = await bookingService.getAllBookings()

            doc.setFontSize(20)
            doc.text('Relatorio de Locacoes - Pegue e Monte', 20, 20)

            doc.setFontSize(12)
            doc.text(`Data de geracao: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30)

            let y = 50
            bookings.forEach((b, i) => {
                if (y > 270) {
                    doc.addPage()
                    y = 20
                }
                doc.text(`${i + 1}. Cliente: ${b.customer.name} | Status: ${b.status} | Valor: R$ ${b.totalValue}`, 20, y)
                y += 10
            })

            doc.save('relatorio-locacoes.pdf')
        } catch (error) {
            alert("Erro ao gerar relatório")
        }
    }

    const handleRevenueSubmit = (e) => {
        e.preventDefault()
        alert(`Receita de R$ ${revenue.value} lançada: ${revenue.description}`)
        setIsFinModalOpen(false)
        setRevenue({ description: '', value: '' })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Resumo do Dia</h1>
                    <p className="text-slate-400">Bem-vindo, Admin da Pegue e Monte</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Sexta, 13 de Fevereiro</p>
                    <p className="font-bold text-blue-400 pt-1">Status do Sistema: OK</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Vendas Totais" value="R$ 1.250,00" icon={TrendingUp} color="blue" trend="+12%" />
                <StatCard title="Pagamentos Pendentes" value="R$ 450,00" icon={Banknote} color="amber" />
                <StatCard title="Locações do Mês" value="24" icon={Calendar} color="emerald" trend="+5" />
                <StatCard title="Novos Clientes" value="8" icon={Users} color="pink" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Locações de Hoje</h2>
                        <button onClick={() => onNavigate('calendar')} className="text-blue-500 text-sm font-medium hover:underline">Ver todas</button>
                    </div>
                    <div className="space-y-3">
                        <BookingItem title="Tema Safari Baby" customer="Maria Oliveira" date="14:00 - Retirada" status="confirmed" value="250,00" />
                        <BookingItem title="Kit Mesa Rústica" customer="João Ferreira" date="10:00 - Devolução" status="picked_up" value="180,00" />
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl glass card-gradient">
                    <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onNavigate('calendar', true)}
                            className="p-4 bg-slate-700/50 rounded-xl text-sm font-medium hover:bg-blue-600/20 hover:text-blue-400 transition-all border border-white/5"
                        >
                            Novo Orçamento
                        </button>
                        <button
                            onClick={() => setIsFinModalOpen(true)}
                            className="p-4 bg-slate-700/50 rounded-xl text-sm font-medium hover:bg-blue-600/20 hover:text-blue-400 transition-all border border-white/5"
                        >
                            Lançar Receita
                        </button>
                        <button
                            onClick={() => onNavigate('inventory', true)}
                            className="p-4 bg-slate-700/50 rounded-xl text-sm font-medium hover:bg-blue-600/20 hover:text-blue-400 transition-all border border-white/5"
                        >
                            Adicionar Item
                        </button>
                        <button
                            onClick={generateReport}
                            className="p-4 bg-slate-700/50 rounded-xl text-sm font-medium hover:bg-blue-600/20 hover:text-blue-400 transition-all border border-white/5"
                        >
                            Gerar Relatório
                        </button>
                    </div>
                    <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                        <h4 className="text-blue-400 font-bold text-sm mb-1">Dica do Dia</h4>
                        <p className="text-xs text-slate-400">Lembre-se de conferir as fotos dos itens na devolução para garantir a integridade do estoque.</p>
                    </div>
                </div>
            </div>

            {isFinModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Lançar Receita</h2>
                            <button onClick={() => setIsFinModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleRevenueSubmit} className="space-y-4">
                            <input
                                placeholder="Descrição"
                                className="w-full bg-slate-800 p-3 rounded-xl border border-white/10"
                                value={revenue.description}
                                onChange={e => setRevenue({ ...revenue, description: e.target.value })}
                            />
                            <input
                                placeholder="Valor R$"
                                type="number"
                                className="w-full bg-slate-800 p-3 rounded-xl border border-white/10"
                                value={revenue.value}
                                onChange={e => setRevenue({ ...revenue, value: e.target.value })}
                            />
                            <button type="submit" className="w-full bg-blue-600 p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Lançar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
