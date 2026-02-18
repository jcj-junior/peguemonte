import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Bookings from './components/Bookings'
import { LayoutDashboard, Package, Calendar, Settings, Plus, BarChart2, Users, Tag } from 'lucide-react'
import Categories from './components/Categories'
import Reports from './components/Reports'
import Clients from './components/Clients'
import Login from './components/Login'
import { supabase } from './supabase'
import { useEffect } from 'react'

const NavButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${active ? 'bg-[#1D4ED8]/10 text-[#1D4ED8]' : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.03]'
            }`}
    >
        {active && <div className="absolute left-0 w-1 h-6 bg-[#1D4ED8] rounded-r-lg shadow-[0_0_12px_#1D4ED8aa]" />}
        <Icon size={20} className={active ? 'text-[#1D4ED8]' : 'group-hover:scale-110 transition-transform'} />
        <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
)

function App() {
    const [user, setUser] = useState(null)
    const [initializing, setInitializing] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [openInventoryModal, setOpenInventoryModal] = useState(false)
    const [openBookingModal, setOpenBookingModal] = useState(false)

    useEffect(() => {
        // Verificar sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setInitializing(false)
        })

        // Escutar mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    if (initializing) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#1D4ED8]" size={48} />
            </div>
        )
    }

    if (!user) {
        return <Login onLogin={setUser} />
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white flex">
            {/* Sidebar - Desktop */}
            <nav className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-[#0B0E14] border-r border-[#1E293B] shadow-2xl md:flex z-50">
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-[#1D4ED8] p-2 rounded-lg shadow-lg shadow-[#1D4ED8]/20">
                        <Package size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter">Pegue<span className="text-[#1D4ED8]">e</span>Monte</span>
                </div>

                <div className="flex-1 px-4 py-4 space-y-2">
                    <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Painel" />
                    <NavButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Package} label="Estoque" />
                    <NavButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Tag} label="Categorias" />
                    <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={Calendar} label="Agenda" />
                    <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Relatórios" />
                    <NavButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={Users} label="Clientes" />
                </div>

                <div className="p-6 border-t border-[#1E293B]">
                    <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-2 rounded-2xl hover:bg-red-500/5 transition-colors cursor-pointer group"
                    >
                        <div className="h-10 w-10 rounded-full bg-[#161B22] flex items-center justify-center border border-[#1E293B] overflow-hidden group-hover:border-red-500/20">
                            <span className="text-xs font-bold text-[#94A3B8]">{user.email?.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors cursor-pointer">Sair do Sistema</p>
                        </div>
                        <Settings size={16} className="text-[#64748B] group-hover:text-white transition-colors" />
                    </div>
                </div>
            </nav>

            {/* Bottom Nav - Mobile */}
            <nav className="fixed bottom-0 left-0 flex w-full justify-around bg-[#0B0E14]/90 backdrop-blur-xl py-4 border-t border-[#1E293B] md:hidden z-50">
                <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-[#1D4ED8]' : 'text-[#64748B]'}>
                    <LayoutDashboard size={24} />
                </button>
                <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-[#1D4ED8]' : 'text-[#64748B]'}>
                    <Package size={24} />
                </button>
                <div
                    onClick={() => { setActiveTab('calendar'); setOpenBookingModal(true); }}
                    className="relative -top-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#1D4ED8] text-white shadow-lg shadow-[#1D4ED8]/30 cursor-pointer"
                >
                    <Plus size={28} />
                </div>
                <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-[#1D4ED8]' : 'text-[#64748B]'}>
                    <Calendar size={24} />
                </button>
                <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'text-[#1D4ED8]' : 'text-[#64748B]'}>
                    <Tag size={24} />
                </button>
            </nav>

            <main className="flex-1 md:ml-64 p-4 md:p-10 h-screen flex flex-col overflow-hidden">
                {activeTab === 'dashboard' && (
                    <Dashboard
                        onNavigate={(tab, openModal) => {
                            setActiveTab(tab);
                            if (tab === 'inventory' && openModal) setOpenInventoryModal(true);
                            if (tab === 'calendar' && openModal) setOpenBookingModal(true);
                        }}
                    />
                )}
                {activeTab === 'inventory' && (
                    <Inventory
                        isModalInitiallyOpen={openInventoryModal}
                        onCloseModal={() => setOpenInventoryModal(false)}
                    />
                )}
                {activeTab === 'categories' && (
                    <Categories />
                )}
                {activeTab === 'calendar' && (
                    <Bookings
                        isModalInitiallyOpen={openBookingModal}
                        onCloseModal={() => setOpenBookingModal(false)}
                    />
                )}
                {activeTab === 'analytics' && (
                    <Reports />
                )}
                {activeTab === 'clients' && (
                    <Clients />
                )}
            </main>
        </div>
    )
}

export default App
