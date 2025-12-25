import { useState, useEffect } from 'react'
import { transactionsApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

function HistoryPage() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterDays, setFilterDays] = useState(7)
    const [showFilterMenu, setShowFilterMenu] = useState(false)

    const filterOptions = [
        { value: 7, label: '7 Hari Terakhir' },
        { value: 14, label: '14 Hari Terakhir' },
        { value: 30, label: '30 Hari Terakhir' },
        { value: 90, label: '3 Bulan Terakhir' },
        { value: 365, label: '1 Tahun Terakhir' },
        { value: 0, label: 'Semua Data' },
    ]

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true)
            try {
                const data = await transactionsApi.getDetails()

                // Filter by days
                let filtered = data
                if (filterDays > 0) {
                    const cutoffDate = new Date()
                    cutoffDate.setDate(cutoffDate.getDate() - filterDays)
                    filtered = data.filter(tx => new Date(tx.transactionDate) >= cutoffDate)
                }

                setTransactions(filtered)
            } catch (error) {
                console.error('Failed to fetch transactions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [filterDays])

    const getIcon = (type) => {
        switch (type) {
            case 'income': return { icon: 'arrow_downward', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' }
            case 'expense': return { icon: 'arrow_upward', bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' }
            default: return { icon: 'info', bg: 'bg-slate-100 dark:bg-slate-700', color: 'text-slate-600 dark:text-slate-400' }
        }
    }

    const selectedFilter = filterOptions.find(f => f.value === filterDays) || filterOptions[0]

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
                            Riwayat Aktivitas
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Lihat semua aktivitas dan perubahan dalam sistem
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{selectedFilter.label}</span>
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
                            </button>

                            {showFilterMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[180px]">
                                    {filterOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setFilterDays(option.value)
                                                setShowFilterMenu(false)
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${filterDays === option.value ? 'text-primary font-semibold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                            <p className="mt-2">Memuat data...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                            <p className="mt-2">Tidak ada transaksi dalam periode ini</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {transactions.map((item) => {
                                const iconStyle = getIcon(item.type)
                                return (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full ${iconStyle.bg} flex items-center justify-center flex-shrink-0`}>
                                                <span className={`material-symbols-outlined ${iconStyle.color} text-xl`}>{iconStyle.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                            Transaksi {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            oleh {item.userName || 'Unknown'} • {item.categoryName || '-'}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={`text-sm font-bold ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                            {new Date(item.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(item.transactionDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Menampilkan {transactions.length} transaksi
                        </span>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default HistoryPage
