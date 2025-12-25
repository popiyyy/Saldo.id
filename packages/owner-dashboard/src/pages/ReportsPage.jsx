import { useState, useEffect } from 'react'
import { statsApi, transactionsApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

function ReportsPage() {
    const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0, balance: 0 })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterPeriod, setFilterPeriod] = useState('month')
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsData, transData] = await Promise.all([
                    statsApi.getSummary(),
                    transactionsApi.getDetails()
                ])
                setStats(statsData)
                setTransactions(transData)
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Filter transactions based on search and type
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = searchQuery === '' ||
            tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = filterType === 'all' || tx.type === filterType

        return matchesSearch && matchesType
    })

    // Calculate filtered stats
    const filteredStats = filteredTransactions.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount) || 0
        if (tx.type === 'income') {
            acc.income += amount
        } else {
            acc.expense += amount
        }
        return acc
    }, { income: 0, expense: 0 })
    filteredStats.profit = filteredStats.income - filteredStats.expense

    // Group transactions by category for report
    const categoryStats = transactions.reduce((acc, tx) => {
        const categoryName = tx.categoryName || 'Uncategorized'
        if (!acc[categoryName]) {
            acc[categoryName] = { income: 0, expense: 0, count: 0 }
        }
        const amount = parseFloat(tx.amount) || 0
        if (tx.type === 'income') {
            acc[categoryName].income += amount
        } else {
            acc[categoryName].expense += amount
        }
        acc[categoryName].count++
        return acc
    }, {})

    const handleExportCSV = () => {
        const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'User', 'Keterangan']
        const rows = filteredTransactions.map(tx => [
            new Date(tx.transactionDate).toLocaleDateString('id-ID'),
            tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            tx.categoryName || '-',
            tx.amount,
            tx.userName || '-',
            tx.description || '-'
        ])

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `laporan_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const handlePrint = () => {
        window.print()
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

            <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                            Laporan Keuangan
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Ringkasan dan analisis keuangan Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            Print
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-xl">trending_up</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pemasukan</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{loading ? '...' : formatRupiah(stats.income)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 text-xl">trending_down</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{loading ? '...' : formatRupiah(stats.expense)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Profit / Loss</span>
                        </div>
                        <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {loading ? '...' : formatRupiah(stats.profit)}
                        </p>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ringkasan per Kategori</h2>
                    </div>
                    <div className="p-4">
                        {Object.keys(categoryStats).length === 0 ? (
                            <p className="text-center text-slate-500 py-4">Belum ada data</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(categoryStats).map(([category, data]) => (
                                    <div key={category} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">{category}</span>
                                            <span className="text-xs text-slate-500">{data.count} transaksi</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600">+{formatRupiah(data.income)}</span>
                                            <span className="text-red-600">-{formatRupiah(data.expense)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Row */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Jumlah
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        User
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            Tidak ada data yang cocok
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.slice(0, 20).map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {new Date(tx.transactionDate).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                    }`}>
                                                    {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {tx.categoryName || '-'}
                                            </td>
                                            <td className={`p-4 text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {tx.userName || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan {Math.min(filteredTransactions.length, 20)} dari {filteredTransactions.length} transaksi
                        </span>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ReportsPage
