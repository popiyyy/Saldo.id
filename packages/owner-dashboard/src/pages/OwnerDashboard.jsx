import { useState, useEffect, useCallback } from 'react'
import MetricCard from '../components/MetricCard'
import IncomeExpenseChart from '../components/IncomeExpenseChart'
import TransactionsAuditTable from '../components/TransactionsAuditTable'
import { statsApi, transactionsApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

function OwnerDashboard({ onNavigate }) {
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        profit: 0,
        balance: 0
    })
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchStats = useCallback(async () => {
        try {
            const data = await statsApi.getSummary()
            setStats(data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats, refreshKey])

    // Handle data change - called when transactions are edited/deleted
    const handleDataChange = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    // Export dashboard report to CSV
    const handleExport = async () => {
        try {
            const transactions = await transactionsApi.getDetails()

            // Create summary section
            const summaryRows = [
                ['LAPORAN DASHBOARD KEUANGAN'],
                [`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
                [''],
                ['RINGKASAN KEUANGAN'],
                ['Total Pemasukan', stats.income],
                ['Total Pengeluaran', stats.expense],
                ['Profit/Rugi', stats.profit],
                ['Saldo', stats.balance],
                [''],
                ['DETAIL TRANSAKSI'],
                ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'User', 'Keterangan']
            ]

            // Add transaction rows
            const txRows = transactions.map(tx => [
                new Date(tx.transactionDate).toLocaleDateString('id-ID'),
                tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                tx.categoryName || '-',
                tx.amount,
                tx.userName || '-',
                tx.description || '-'
            ])

            const allRows = [...summaryRows, ...txRows]
            const csvContent = allRows.map(row => row.join(',')).join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`
            link.click()
        } catch (error) {
            console.error('Export failed:', error)
            alert('Gagal export laporan')
        }
    }

    const metrics = [
        {
            icon: 'trending_up',
            iconBg: 'bg-green-50 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
            label: 'INCOME',
            value: loading ? '...' : formatRupiah(stats.income),
            change: '+12%',
            changeColor: 'text-green-600 dark:text-green-400',
        },
        {
            icon: 'trending_down',
            iconBg: 'bg-red-50 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            label: 'EXPENSE',
            value: loading ? '...' : formatRupiah(stats.expense),
            change: '+5%',
            changeColor: 'text-red-600 dark:text-red-400',
        },
        {
            icon: 'account_balance_wallet',
            iconBg: 'bg-blue-50 dark:bg-blue-900/30',
            iconColor: 'text-primary',
            label: 'PROFIT',
            value: loading ? '...' : formatRupiah(stats.profit),
            change: stats.profit > 0 ? '+' : '',
            changeColor: stats.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600',
        },
        {
            icon: 'savings',
            iconBg: 'bg-purple-50 dark:bg-purple-900/30',
            iconColor: 'text-purple-600 dark:text-purple-400',
            label: 'BALANCE',
            value: loading ? '...' : formatRupiah(stats.balance),
            change: '+2%',
            changeColor: 'text-green-600 dark:text-green-400',
        },
    ]

    return (
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-base font-bold">Saldo.id</h1>
                </div>
                <button className="text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                            Owner Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Overview of financial performance and audit logs
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate && onNavigate('transaction-form')}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold h-10 px-5 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Add Transaction</span>
                        </button>
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                calendar_today
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                {new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold h-10 px-5 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {metrics.map((metric) => (
                        <MetricCard key={metric.label} {...metric} />
                    ))}
                </div>

                {/* Chart - key forces re-render on data change */}
                <IncomeExpenseChart key={`chart-${refreshKey}`} />

                {/* Transactions Table - with callback for data changes */}
                <TransactionsAuditTable onDataChange={handleDataChange} />
            </main>
        </div>
    )
}

export default OwnerDashboard
