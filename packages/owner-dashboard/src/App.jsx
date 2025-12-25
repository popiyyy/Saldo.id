import { useState } from 'react'
import OwnerSidebar from './components/OwnerSidebar'
import StaffSidebar from './components/StaffSidebar'
import OwnerDashboard from './pages/OwnerDashboard'
import StaffDashboard from './pages/StaffDashboard'
import TransactionForm from './pages/TransactionForm'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import { authApi } from './services/api'

function App() {
    const [currentPage, setCurrentPage] = useState('login')
    const [userRole, setUserRole] = useState(null)
    const [user, setUser] = useState(null)

    const handleLogin = (role, userData) => {
        setUserRole(role)
        setUser(userData)
        if (role === 'owner') {
            setCurrentPage('dashboard')
        } else {
            setCurrentPage('staff-dashboard')
        }
    }

    const handleLogout = () => {
        authApi.logout()
        setUserRole(null)
        setUser(null)
        setCurrentPage('login')
    }

    const renderOwnerPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <OwnerDashboard onNavigate={setCurrentPage} />
            case 'reports':
                return <ReportsPage />
            case 'history':
                return <HistoryPage />
            case 'settings':
                return <SettingsPage />
            default:
                return <OwnerDashboard onNavigate={setCurrentPage} />
        }
    }

    const renderStaffPage = () => {
        switch (currentPage) {
            case 'staff-dashboard':
                return <StaffDashboard onNavigate={setCurrentPage} />
            case 'staff-history':
                return <HistoryPage />
            case 'staff-reports':
                return <ReportsPage />
            case 'staff-settings':
                return <SettingsPage />
            default:
                return <StaffDashboard onNavigate={setCurrentPage} />
        }
    }

    const handleNavigate = (page) => {
        if (page === 'login') {
            handleLogout()
        } else {
            setCurrentPage(page)
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            {currentPage === 'login' ? (
                <LoginPage onLogin={handleLogin} />
            ) : currentPage === 'transaction-form' || currentPage === 'staff-transaction-form' ? (
                <TransactionForm
                    onBack={() => setCurrentPage(userRole === 'owner' ? 'dashboard' : 'staff-dashboard')}
                    onNavigate={handleNavigate}
                    userRole={userRole}
                />
            ) : userRole === 'owner' ? (
                <div className="flex h-screen w-full overflow-hidden">
                    <OwnerSidebar currentPage={currentPage} onNavigate={handleNavigate} />
                    {renderOwnerPage()}
                </div>
            ) : (
                <div className="flex h-screen w-full overflow-hidden">
                    <StaffSidebar currentPage={currentPage} onNavigate={handleNavigate} />
                    {renderStaffPage()}
                </div>
            )}
        </div>
    )
}

export default App
