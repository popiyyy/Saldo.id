import { useState, useEffect } from 'react'
import { authApi } from '../services/api'

function SettingsPage() {
    const [user, setUser] = useState(null)
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false')
    const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('emailAlerts') !== 'false')

    // Form states
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const storedUser = authApi.getStoredUser()
        if (storedUser) {
            setUser(storedUser)
            setName(storedUser.name || '')
            setEmail(storedUser.email || '')
        }
    }, [])

    const handleDarkModeToggle = () => {
        const newDarkMode = !darkMode
        setDarkMode(newDarkMode)
        if (newDarkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('darkMode', 'true')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('darkMode', 'false')
        }
    }

    const handleNotificationsToggle = () => {
        const newValue = !notifications
        setNotifications(newValue)
        localStorage.setItem('notifications', newValue.toString())
    }

    const handleEmailAlertsToggle = () => {
        const newValue = !emailAlerts
        setEmailAlerts(newValue)
        localStorage.setItem('emailAlerts', newValue.toString())
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            // Save to database
            const updatedUser = await authApi.updateProfile(name, email)
            setUser(updatedUser)
            setMessage({ type: 'success', text: 'Profil berhasil disimpan ke database!' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan pengaturan' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Password baru tidak cocok!' })
            return
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password minimal 6 karakter!' })
            return
        }

        setMessage({ type: 'success', text: 'Password berhasil diubah! (Demo mode)' })
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }

    const handleLogoutAll = () => {
        if (confirm('Apakah Anda yakin ingin keluar dari semua perangkat?')) {
            authApi.logout()
            window.location.reload()
        }
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <h1 className="text-slate-900 dark:text-white text-base font-bold">Saldo.id</h1>
                <button className="text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-4xl mx-auto w-full">
                {/* Page Heading */}
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                        Pengaturan
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        Kelola preferensi dan konfigurasi akun Anda
                    </p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {/* Profile Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profil</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Informasi akun Anda</p>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{name || 'User'}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{email || 'email@example.com'}</p>
                                    <p className="text-xs text-primary mt-1">Role: {user?.role || 'User'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferensi</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sesuaikan pengalaman aplikasi</p>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Dark Mode Toggle */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">dark_mode</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Mode Gelap</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Aktifkan tampilan gelap</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDarkModeToggle}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Notifications Toggle */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifikasi</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Terima notifikasi push</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNotificationsToggle}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Email Alerts Toggle */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">mail</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Peringatan Email</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Terima laporan mingguan via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEmailAlertsToggle}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${emailAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keamanan</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola keamanan akun</p>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lock</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Ubah Password</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Perbarui password akun Anda</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    Ubah
                                </button>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-600 dark:text-red-400">logout</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Keluar dari Semua Perangkat</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Keluar dari semua sesi aktif</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogoutAll}
                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    Keluar Semua
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setName(user?.name || '')
                                setEmail(user?.email || '')
                            }}
                            className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ubah Password</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Password Saat Ini</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Password Baru</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg"
                            >
                                Ubah Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SettingsPage
