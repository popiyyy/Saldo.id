function MetricCard({ icon, iconBg, iconColor, label, value, change, changeColor }) {
    return (
        <div className="flex flex-col p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${iconBg} rounded-lg`}>
                    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                </div>
                <span
                    className={`flex items-center gap-1 ${changeColor} text-sm font-bold ${changeColor.includes('green')
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : changeColor.includes('red')
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : 'bg-slate-50 dark:bg-slate-900/20'
                        } px-2 py-1 rounded-full`}
                >
                    {change}
                </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{value}</p>
        </div>
    )
}

export default MetricCard
