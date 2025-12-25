import { useState, useEffect } from 'react'
import { authApi } from '../services/api'

function LoginPage({ onLogin }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState('error')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    // Modal states
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showForgotModal, setShowForgotModal] = useState(false)

    // Register form
    const [registerName, setRegisterName] = useState('')
    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    const [registerConfirm, setRegisterConfirm] = useState('')

    // Forgot password form
    const [forgotEmail, setForgotEmail] = useState('')

    // Check for remembered session on mount
    useEffect(() => {
        const remembered = localStorage.getItem('rememberMe')
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (remembered === 'true' && storedUser && storedToken) {
            try {
                const user = JSON.parse(storedUser)
                // Auto-login
                if (onLogin) onLogin(user.role, user)
            } catch (e) {
                localStorage.removeItem('rememberMe')
            }
        }
    }, [onLogin])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = await authApi.login(email, password)

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true')
            } else {
                localStorage.removeItem('rememberMe')
            }

            setToastMessage('Login berhasil! Redirecting...')
            setToastType('success')
            setShowToast(true)

            setTimeout(() => {
                if (onLogin) onLogin(data.user.role, data.user)
            }, 500)
        } catch (error) {
            setToastMessage(error.message || 'Email atau password salah!')
            setToastType('error')
            setShowToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        if (registerPassword !== registerConfirm) {
            setToastMessage('Password tidak cocok!')
            setToastType('error')
            setShowToast(true)
            return
        }

        if (registerPassword.length < 6) {
            setToastMessage('Password minimal 6 karakter!')
            setToastType('error')
            setShowToast(true)
            return
        }

        setIsLoading(true)
        try {
            await authApi.register(registerName, registerEmail, registerPassword)
            setToastMessage('Akun berhasil dibuat! Silakan login.')
            setToastType('success')
            setShowToast(true)
            setShowRegisterModal(false)
            setRegisterName('')
            setRegisterEmail('')
            setRegisterPassword('')
            setRegisterConfirm('')
            // Pre-fill login email
            setEmail(registerEmail)
        } catch (error) {
            setToastMessage(error.message || 'Gagal membuat akun!')
            setToastType('error')
            setShowToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()

        if (!forgotEmail) {
            setToastMessage('Masukkan email Anda!')
            setToastType('error')
            setShowToast(true)
            return
        }

        // Since this is a demo, we just show a message
        setToastMessage(`Link reset password telah dikirim ke ${forgotEmail}`)
        setToastType('success')
        setShowToast(true)
        setShowForgotModal(false)
        setForgotEmail('')
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#0d131c] dark:text-white min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-6 right-6 z-50 animate-bounce">
                    <div
                        className={`flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 border-l-4 ${toastType === 'success' ? 'border-green-500' : 'border-red-500'
                            }`}
                        role="alert"
                    >
                        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${toastType === 'success'
                            ? 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200'
                            : 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200'
                            }`}>
                            <span className="material-symbols-outlined text-xl">
                                {toastType === 'success' ? 'check_circle' : 'error'}
                            </span>
                        </div>
                        <div className="ml-3 text-sm font-normal">
                            <span className="font-semibold block text-gray-900 dark:text-white">
                                {toastType === 'success' ? 'Berhasil!' : 'Gagal'}
                            </span>
                            {toastMessage}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowToast(false)}
                            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="w-full max-w-[480px] flex flex-col gap-6">
                {/* Brand / Logo */}
                <div className="flex justify-center mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white">
                            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Saldo.id
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8 sm:p-10 flex flex-col gap-6">
                        {/* Heading */}
                        <div className="text-center flex flex-col gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                Welcome back
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                Please enter your details to access the portal.
                            </p>
                        </div>

                        {/* Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal"
                                    htmlFor="email"
                                >
                                    Email or Username
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal transition-all"
                                    placeholder="Enter your email or username"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <div className="relative flex w-full flex-1 items-stretch rounded-lg">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input flex w-full rounded-l-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:z-10 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal transition-all border-r-0"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-500 dark:text-gray-400 flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center justify-between mt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/20 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Belum punya akun?{' '}
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                className="font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Daftar Sekarang
                            </button>
                        </p>
                    </div>
                </div>

                {/* Bottom Graphic */}
                <div
                    className="w-full h-32 rounded-lg bg-cover bg-center opacity-80 overflow-hidden shadow-sm hidden sm:block"
                    style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcxq2tAdsm4-5_voO2u5IuWeNAO0OcRg2oX8Dg-RQt6-L-hp7A8cJee5DNwoGjeetI05G5jQ6gdFQZJ7hmHLKtcMy9RXMfV2wRpO0WKQwHw2RRVfc4qPbW6xNzGM4tQ4nYsGIHtzhXyEGhjVnFBxvUuKZnE6whKhfR7GDQd4kQpMUTynRtIPdGWCdkNXhsYfPC8G7qzWWBQweDHk1b3RazHD6vuBapwQqDzXjvIo6HOre21A4MoJIELaMBxjLw23zeV7R8LRekm4M')`,
                    }}
                >
                    <div className="w-full h-full bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
                    © 2024 Saldo.id - Secure Transaction Management.
                </p>
            </div>

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Buat Akun</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Daftar akun baru</p>
                            </div>
                            <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={registerName}
                                    onChange={(e) => setRegisterName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Email</label>
                                <input
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                    placeholder="Masukkan email"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Password</label>
                                <input
                                    type="password"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={registerConfirm}
                                    onChange={(e) => setRegisterConfirm(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                    placeholder="Ulangi password"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg disabled:opacity-50"
                                >
                                    {isLoading ? 'Mendaftar...' : 'Daftar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lupa Password</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Kami akan kirimkan link reset</p>
                            </div>
                            <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleForgotPassword} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Email Anda</label>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                    placeholder="Masukkan email terdaftar"
                                />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Link reset akan dikirim ke email Anda
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg"
                                >
                                    Kirim Link Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoginPage
