import { useState, useEffect } from 'react'
import { transactionsApi, statsApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

function StaffDashboard({ onNavigate }) {
    const [todayStats, setTodayStats] = useState({ income: 0, expense: 0, count: 0, balance: 0 })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsData, txData] = await Promise.all([
                    statsApi.getSummary(),
                    transactionsApi.getAll()
                ])

                // Get today's transactions
                const today = new Date().toISOString().split('T')[0]
                const todayTx = txData.filter(tx =>
                    new Date(tx.transactionDate).toISOString().split('T')[0] === today
                )

                // Calculate today's stats using Number() for precision
                const todayIncome = todayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
                const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)

                setTodayStats({
                    income: Number(statsData.income) || 0,
                    expense: Number(statsData.expense) || 0,
                    count: todayTx.length,
                    balance: todayIncome - todayExpense
                })

                setTransactions(txData.slice(0, 5)) // Show last 5 transactions
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const stats = [
        { label: 'Total Pemasukan', value: loading ? '...' : formatRupiah(todayStats.income), icon: 'arrow_downward', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
        { label: 'Total Pengeluaran', value: loading ? '...' : formatRupiah(todayStats.expense), icon: 'arrow_upward', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
        { label: 'Transaksi Hari Ini', value: loading ? '...' : todayStats.count.toString(), icon: 'receipt_long', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Saldo Hari Ini', value: loading ? '...' : (todayStats.balance >= 0 ? '+ ' : '') + formatRupiah(todayStats.balance), icon: 'account_balance_wallet', color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    ]

    return (
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <h1 className="text-slate-900 dark:text-white text-base font-bold">Saldo.id</h1>
                <button className="text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                            Staff Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Selamat datang! Kelola transaksi harian Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => onNavigate && onNavigate('staff-transaction-form')}
                        className="flex items-center gap-4 p-6 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors shadow-lg shadow-green-600/20"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">arrow_downward</span>
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-bold">Catat Pemasukan</p>
                            <p className="text-sm text-green-100">Tambah transaksi pemasukan baru</p>
                        </div>
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('staff-transaction-form')}
                        className="flex items-center gap-4 p-6 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors shadow-lg shadow-red-600/20"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">arrow_upward</span>
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-bold">Catat Pengeluaran</p>
                            <p className="text-sm text-red-100">Tambah transaksi pengeluaran baru</p>
                        </div>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 ${stat.bg} rounded-lg`}>
                                    <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                {stat.label}
                            </p>
                            <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Today's Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h2>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                            <p className="mt-2">Belum ada transaksi</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            <span className={`material-symbols-outlined ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.description || tx.categoryName || 'Transaksi'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {tx.userName} • {new Date(tx.transactionDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(Number(tx.amount))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                        <button
                            onClick={() => onNavigate && onNavigate('staff-history')}
                            className="text-primary hover:text-blue-600 text-sm font-semibold"
                        >
                            Lihat Semua Riwayat →
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default StaffDashboard
