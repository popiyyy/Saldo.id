function TopNavBar({ activeTab = 'Transactions', onNavigate, onBack, showBackButton = false, userRole = 'owner' }) {
    // Navigation items based on role
    const navItems = userRole === 'staff' ? [
        { name: 'Dashboard', page: 'staff-dashboard' },
        { name: 'Transactions', page: 'staff-transaction-form' },
        { name: 'Reports', page: 'staff-reports' },
        { name: 'Settings', page: 'staff-settings' }
    ] : [
        { name: 'Dashboard', page: 'dashboard' },
        { name: 'Transactions', page: 'transaction-form' },
        { name: 'Reports', page: 'reports' },
        { name: 'Settings', page: 'settings' }
    ]

    const handleNavClick = (page, e) => {
        e.preventDefault()
        if (onNavigate) onNavigate(page)
    }

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ecf4] dark:border-gray-800 bg-white dark:bg-[#1a2636] px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-4 text-[#0d131c] dark:text-white">
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-primary hover:text-blue-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                <div className="size-8 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
                <h2 className="text-[#0d131c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    FinFlow
                </h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
                <div className="hidden md:flex items-center gap-9">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href="#"
                            onClick={(e) => handleNavClick(item.page, e)}
                            className={`text-sm leading-normal cursor-pointer ${item.name === activeTab
                                ? 'text-primary font-bold'
                                : 'text-[#0d131c] dark:text-gray-300 hover:text-primary font-medium'
                                }`}
                        >
                            {item.name}
                        </a>
                    ))}
                </div>
                <button
                    onClick={() => onNavigate && onNavigate('login')}
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                    style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBg3XFXSzLS71r0Gow7FCSmJswf769Mk9YbL3gpU5mUx9J2IlcAWZzfjI0bYoIdmVvxGGAFnntQEjEFQkGJHnP3GrlBaQdhgt27lNrQ1YSqHiFhqHwHc-g-_6cNoH0QHY8MLV0L_jh-68MgSW-Wf7OQTIoO2yQ8Vb06tzqMfHSgAvkIT_RZhlgpNCt0OCLxVe9a3fV5CKDXmDD1r3NsXwYOjMaQaq3nFLjfQofN_k4KaDp2vHvtP2qDmGjZUGRY6Z_NcdiGaQKWE3g")`,
                    }}
                    title="Logout"
                />
            </div>
        </header>
    )
}

export default TopNavBar

