import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Bookings from './components/Bookings'
import { LayoutDashboard, Package, Calendar, Settings, Plus } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [openInventoryModal, setOpenInventoryModal] = useState(false)
    const [openBookingModal, setOpenBookingModal] = useState(false)

    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pl-20">
            {/* Sidebar - Desktop */}
            <nav className="fixed left-0 top-0 hidden h-full w-20 flex-col items-center bg-slate-900 py-8 border-r border-white/10 md:flex">
                <div className="mb-10 text-blue-500">
                    <Package size={32} />
                </div>
                <div className="flex flex-col gap-8">
                    <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-400'}>
                        <LayoutDashboard size={24} />
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-blue-500' : 'text-slate-400'}>
                        <Package size={24} />
                    </button>
                    <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-blue-500' : 'text-slate-400'}>
                        <Calendar size={24} />
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-blue-500' : 'text-slate-400'}>
                        <Settings size={24} />
                    </button>
                </div>
            </nav>

            {/* Bottom Nav - Mobile */}
            <nav className="fixed bottom-0 left-0 flex w-full justify-around bg-slate-900 py-4 border-t border-white/10 md:hidden glass z-50">
                <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-400'}>
                    <LayoutDashboard size={24} />
                </button>
                <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-blue-500' : 'text-slate-400'}>
                    <Package size={24} />
                </button>
                <div
                    onClick={() => { setActiveTab('calendar'); setOpenBookingModal(true); }}
                    className="relative -top-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/50 cursor-pointer"
                >
                    <Plus size={32} />
                </div>
                <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-blue-500' : 'text-slate-400'}>
                    <Calendar size={24} />
                </button>
                <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-blue-500' : 'text-slate-400'}>
                    <Settings size={24} />
                </button>
            </nav>

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
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
                {activeTab === 'calendar' && (
                    <Bookings
                        isModalInitiallyOpen={openBookingModal}
                        onCloseModal={() => setOpenBookingModal(false)}
                    />
                )}
            </main>
        </div>
    )
}

export default App
