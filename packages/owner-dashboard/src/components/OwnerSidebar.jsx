import { authApi } from '../services/api'

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', page: 'dashboard' },
    { icon: 'history', label: 'Riwayat', page: 'history' },
    { icon: 'description', label: 'Laporan', page: 'reports' },
    { icon: 'settings', label: 'Pengaturan', page: 'settings' },
]

function OwnerSidebar({ currentPage, onNavigate }) {
    const user = authApi.getStoredUser()
    const userName = user?.name || 'Owner'
    const userRole = user?.role || 'owner'

    return (
        <div className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex">
            {/* Logo */}
            <div className="p-6">
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-xl font-bold leading-normal">Saldo.id</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Owner Panel</p>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2">
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = currentPage === item.page
                        return (
                            <button
                                key={item.label}
                                onClick={() => onNavigate && onNavigate(item.page)}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left w-full ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                                    {item.icon}
                                </span>
                                <p className={`text-sm leading-normal ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => onNavigate && onNavigate('login')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors w-full"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        logout
                    </span>
                    <p className="text-sm font-medium leading-normal">Sign Out</p>
                </button>
            </div>
        </div>
    )
}

export default OwnerSidebar
