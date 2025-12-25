import { useState, useEffect } from 'react'
import { statsApi, transactionsApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

function IncomeExpenseChart({ onExport }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(7) // days

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true)
            try {
                const transactions = await transactionsApi.getDetails()

                // Group transactions by date
                const groupedData = {}
                const now = new Date()

                // Initialize data for each day
                for (let i = period - 1; i >= 0; i--) {
                    const date = new Date(now)
                    date.setDate(date.getDate() - i)
                    const dateKey = date.toISOString().split('T')[0]
                    groupedData[dateKey] = { date: dateKey, income: 0, expense: 0 }
                }

                // Sum transactions per day
                transactions.forEach(tx => {
                    const dateKey = new Date(tx.transactionDate).toISOString().split('T')[0]
                    if (groupedData[dateKey]) {
                        const amount = parseFloat(tx.amount) || 0
                        if (tx.type === 'income') {
                            groupedData[dateKey].income += amount
                        } else {
                            groupedData[dateKey].expense += amount
                        }
                    }
                })

                setChartData(Object.values(groupedData))
            } catch (error) {
                console.error('Failed to fetch chart data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchChartData()
    }, [period])

    // Calculate max value for scaling
    const maxValue = Math.max(
        ...chartData.map(d => Math.max(d.income, d.expense)),
        1
    )

    // Generate SVG path from data
    const generatePath = (type) => {
        if (chartData.length === 0) return 'M0 100'

        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 100
            const y = 100 - ((type === 'income' ? d.income : d.expense) / maxValue) * 80
            return `${x},${y}`
        })

        return `M${points.join(' L')}`
    }

    const handleExport = () => {
        if (onExport) {
            onExport(chartData)
        } else {
            // Default export to CSV
            const headers = ['Tanggal', 'Pemasukan', 'Pengeluaran']
            const rows = chartData.map(d => [
                d.date,
                d.income,
                d.expense
            ])
            const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `trend_keuangan_${period}_hari.csv`
            link.click()
        }
    }

    // Find max income day for tooltip
    const maxIncomeDay = chartData.reduce((max, d) => d.income > max.income ? d : max, { income: 0 })
    const maxIncomeIndex = chartData.findIndex(d => d === maxIncomeDay)
    const tooltipX = chartData.length > 1 ? (maxIncomeIndex / (chartData.length - 1)) * 100 : 50
    const tooltipY = maxValue > 0 ? 100 - (maxIncomeDay.income / maxValue) * 80 : 50

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                        Income vs Expense Trend
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {period === 7 ? 'Last 7 days' : period === 14 ? 'Last 2 weeks' : `Last ${period} days`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50"
                    >
                        <option value={7}>7 Hari</option>
                        <option value={14}>14 Hari</option>
                        <option value={30}>30 Hari</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Expense</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64 w-full">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">progress_activity</span>
                    </div>
                ) : (
                    <>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500">
                            <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0 relative">
                                <span className="absolute -top-2 -left-2 text-[10px]">{formatRupiah(maxValue)}</span>
                            </div>
                            <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0 relative">
                                <span className="absolute -top-2 -left-2 text-[10px]">{formatRupiah(maxValue / 2)}</span>
                            </div>
                            <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full h-0"></div>
                            <div className="border-b border-slate-200 dark:border-slate-700 w-full h-0 relative">
                                <span className="absolute -top-2 -left-2 text-[10px]">Rp 0</span>
                            </div>
                        </div>

                        {/* SVG Chart */}
                        <svg
                            className="absolute inset-0 h-full w-full overflow-visible"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            {/* Income Line (Blue) */}
                            <path
                                d={generatePath('income')}
                                fill="none"
                                stroke="#3c83f6"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Income Fill Area */}
                            <path
                                d={`${generatePath('income')} V 100 H 0 Z`}
                                fill="url(#incomeGradient)"
                                opacity="0.1"
                            />
                            {/* Expense Line (Red Dashed) */}
                            <path
                                d={generatePath('expense')}
                                fill="none"
                                stroke="#f87171"
                                strokeWidth="2"
                                strokeDasharray="4"
                                vectorEffect="non-scaling-stroke"
                            />
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3c83f6" />
                                    <stop offset="100%" stopColor="#3c83f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Tooltip Indicator */}
                        {maxIncomeDay.income > 0 && (
                            <div
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                style={{ left: `${tooltipX}%`, top: `${tooltipY}%` }}
                            >
                                <div className="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-primary rounded-full shadow-sm z-10"></div>
                                <div className="absolute top-4 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                    {formatRupiah(maxIncomeDay.income)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Date Labels */}
            <div className="flex justify-between mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium px-1">
                {chartData.length > 0 && (
                    <>
                        <span>{new Date(chartData[0]?.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        {chartData.length > 2 && (
                            <span>{new Date(chartData[Math.floor(chartData.length / 2)]?.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        )}
                        <span>{new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default IncomeExpenseChart
