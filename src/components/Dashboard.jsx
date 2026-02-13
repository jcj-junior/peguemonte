import { TrendingUp, Users, Calendar, Banknote, ArrowRight, X, Loader2, Package, ChevronRight, Search, Bell, Plus, Truck, Wallet, ClipboardCheck, Printer, AlertTriangle, MessageCircle } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import { bookingService } from '../services/bookingService'
import { inventoryService } from '../services/inventoryService'

const StatCard = ({ title, value, icon: Icon, trend, color, progress }) => (
    <div className="bg-[#111311] p-6 rounded-[2rem] border border-white/5 space-y-4 hover:border-[#b6ec13]/20 transition-all group">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
            </div>
            <div className={`p-3 rounded-2xl bg-[#b6ec13]/10 text-[#b6ec13] group-hover:bg-[#b6ec13] group-hover:text-black transition-all`}>
                <Icon size={20} />
            </div>
        </div>

        {trend && (
            <div className="flex items-center gap-2">
                <span className="flex items-center text-[#b6ec13] text-xs font-black bg-[#b6ec13]/10 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} className="mr-1" /> {trend}
                </span>
                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider italic">vs last month</span>
            </div>
        )}

        {progress !== undefined && (
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{progress}% Available</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#b6ec13] to-emerald-400 rounded-full"
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
            'awaiting': { label: 'Awaiting Pickup', color: 'text-amber-400 bg-amber-400/10' },
            'ready': { label: 'Ready', color: 'text-[#b6ec13] bg-[#b6ec13]/10' },
            'scheduled': { label: 'Scheduled', color: 'text-blue-400 bg-blue-400/10' }
        },
        return: {
            'pending': { label: 'Awaiting Return', color: 'text-pink-400 bg-pink-400/10' },
            'late': { label: 'Delayed', color: 'text-red-500 bg-red-500/10' }
        }
    }

    const currentStatus = statusConfig[type][status] || { label: status, color: 'text-slate-400 bg-white/5' }

    return (
        <div className="grid grid-cols-12 items-center p-4 hover:bg-white/[0.02] transition-colors gap-4 border-b border-white/[0.03] last:border-0">
            <div className="col-span-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                    <Package size={20} className="text-slate-600" />
                </div>
                <div>
                    <p className="text-sm font-black text-white tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">#{item.id || 'ORD-2491'}</p>
                </div>
            </div>
            <div className="col-span-3">
                <p className="text-sm font-bold text-slate-300">{client}</p>
                <p className="text-[10px] font-bold text-slate-600">{phone}</p>
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
                    <button className="bg-[#b6ec13]/10 text-[#b6ec13] border border-[#b6ec13]/20 text-[10px] font-black px-4 py-2 rounded-xl active:scale-95 hover:bg-[#b6ec13] hover:text-black transition-all">
                        Mark Done
                    </button>
                ) : (
                    <ArrowRight size={18} className="text-slate-700 cursor-pointer hover:text-[#b6ec13] transition-colors" />
                )}
            </div>
        </div>
    )
}

const QuickAction = ({ icon: Icon, title, desc, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-4 p-5 bg-[#111311] border border-white/5 rounded-[1.5rem] hover:border-[#b6ec13]/30 hover:bg-white/[0.02] transition-all group text-left">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#b6ec13] group-hover:bg-[#b6ec13] group-hover:text-black transition-all">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm font-black text-white tracking-tight">{title}</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{desc}</p>
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
            const [bookings, items] = await Promise.all([
                bookingService.getAllBookings(),
                inventoryService.getAllItems()
            ])

            const monthRevenue = bookings
                .filter(b => b.status !== 'budget')
                .reduce((acc, b) => acc + (b.totalValue || 0), 0)

            const activeRentals = bookings.filter(b => b.status === 'picked_up').length

            // Mocking availability for UI
            const availablePercent = Math.round((items.length > 0 ? items.length : 100) * 0.85)

            // Mocking logs for UI (Today)
            const pickups = [
                { id: '1', item: { name: 'Tropical Summer Kit' }, client: 'Fernanda Oliveira', phone: '+55 (11) 99823-1020', time: '09:00 - 10:00 AM', status: 'awaiting' },
                { id: '2', item: { name: 'Gold Luxury Set' }, client: 'Carlos Mendes', phone: '+55 (11) 98722-4432', time: '10:30 - 11:30 AM', status: 'ready' },
                { id: '3', item: { name: 'Blue Hero Theme' }, client: 'Juliana Paes', phone: '+55 (11) 99123-5567', time: '01:00 - 02:00 PM', status: 'scheduled' },
            ]

            setStats({
                totalRevenue: monthRevenue,
                activeRentals: activeRentals || 28, // Using mock from screenshot if empty
                availablePercent: 85,
                pickups,
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
            <div className="flex flex-col items-center justify-center py-60 gap-4">
                <Loader2 size={48} className="animate-spin text-[#b6ec13]" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Puxando dados...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Top Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Dashboard</h1>
                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.2em]">Overview for <span className="text-[#b6ec13]">Oct 24, 2023</span></p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                            placeholder="Search orders..."
                            className="bg-[#111311] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder-slate-700 outline-none focus:border-[#b6ec13]/30 w-64 transition-all"
                        />
                    </div>
                    <button className="relative h-12 w-12 bg-[#111311] border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 h-2 w-2 bg-[#b6ec13] rounded-full border-2 border-[#111311]" />
                    </button>
                    <button
                        onClick={() => onNavigate('calendar', true)}
                        className="px-6 py-3 bg-[#b6ec13]/10 border border-[#b6ec13]/20 text-[#b6ec13] font-black text-sm rounded-2xl hover:bg-[#b6ec13] hover:text-black active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> New Order
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Monthly Revenue" value={`R$ ${stats.totalRevenue || '42.580'}`} trend="12.5%" icon={Wallet} />
                <StatCard title="Active Rentals" value={`${stats.activeRentals} Orders`} icon={Truck} />
                <StatCard title="Inventory Health" value={`${stats.availablePercent}% Available`} progress={85} icon={ClipboardCheck} />
            </div>

            {/* Today's Log Card */}
            <div className="bg-[#111311] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#b6ec13]/10 text-[#b6ec13] p-2 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Today's Log</h2>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-2xl flex border border-white/5">
                        <button
                            onClick={() => setActiveTab('pickups')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'pickups' ? 'bg-white/10 text-[#b6ec13] shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Pickups (12)
                        </button>
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'returns' ? 'bg-white/10 text-[#b6ec13] shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Returns (8)
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-12 px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-white/5">
                        <div className="col-span-4">Item / Kit</div>
                        <div className="col-span-3">Client</div>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>
                    <div className="min-h-[300px]">
                        {activeTab === 'pickups' ? (
                            stats.pickups.map(log => (
                                <LogItem key={log.id} {...log} type="pickup" />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <Truck size={48} />
                                <p className="font-bold uppercase tracking-widest text-xs mt-4">No returns scheduled for today</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex justify-between items-center border-t border-white/5 mt-4">
                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Showing 4 of 12 pickups</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-black border border-white/5 rounded-xl text-[10px] font-black text-slate-500 hover:text-white transition-all">Prev</button>
                            <button className="px-4 py-2 bg-[#b6ec13]/10 border border-[#b6ec13]/20 rounded-xl text-[10px] font-black text-[#b6ec13] hover:bg-[#b6ec13] hover:text-black transition-all">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickAction icon={Plus} title="Add Item" desc="Update Inventory" onClick={() => onNavigate('inventory', true)} />
                <QuickAction icon={Printer} title="Print Labels" desc="For today's orders" />
                <QuickAction icon={AlertTriangle} title="Damaged Items" desc="Report issues" />
                <QuickAction icon={MessageCircle} title="Contact Clients" desc="Via WhatsApp" />
            </div>
        </div>
    )
}
