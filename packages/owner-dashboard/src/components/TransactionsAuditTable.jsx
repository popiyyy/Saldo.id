import { useState, useEffect } from 'react'
import { transactionsApi, categoriesApi } from '../services/api'

// Format number to Rupiah
const formatRupiah = (num) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num || 0)
}

// Get initials from name
const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Random color for initials
const getInitialsColor = (name) => {
    const colors = [
        'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
        'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300',
        'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300',
        'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
        'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    ]
    const index = (name?.length || 0) % colors.length
    return colors[index]
}

function TransactionsAuditTable({ onDataChange }) {
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [editModal, setEditModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [showFilter, setShowFilter] = useState(false)

    // Edit form state
    const [editType, setEditType] = useState('income')
    const [editCategoryId, setEditCategoryId] = useState('')
    const [editAmount, setEditAmount] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editDate, setEditDate] = useState('')

    const fetchTransactions = async () => {
        try {
            const data = await transactionsApi.getDetails()
            setTransactions(data)
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
        categoriesApi.getAll().then(setCategories).catch(console.error)
    }, [])

    const openEditModal = (tx) => {
        setEditModal(tx)
        setEditType(tx.type)
        setEditCategoryId(tx.categoryId || '')
        setEditAmount(tx.amount?.toString() || '')
        setEditDescription(tx.description || '')
        setEditDate(tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : '')
    }

    const handleEdit = async () => {
        if (!editModal) return
        setSaving(true)
        try {
            await transactionsApi.update(editModal.id, {
                type: editType,
                categoryId: editCategoryId ? parseInt(editCategoryId) : null,
                amount: editAmount,
                description: editDescription,
                transactionDate: editDate
            })
            setMessage({ type: 'success', text: 'Transaksi berhasil diupdate!' })
            setEditModal(null)
            fetchTransactions()
            if (onDataChange) onDataChange()
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal update transaksi' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal) return
        setSaving(true)
        try {
            await transactionsApi.delete(deleteModal.id)
            setMessage({ type: 'success', text: 'Transaksi berhasil dihapus!' })
            setDeleteModal(null)
            fetchTransactions()
            if (onDataChange) onDataChange()
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal hapus transaksi' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    const filteredCategories = categories.filter(c => c.type === editType)

    // Filter transactions based on search and type
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = searchQuery === '' ||
            tx.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || tx.type === filterType
        return matchesSearch && matchesType
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                    Recent Transactions (Audit List)
                </h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white w-full sm:w-64"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 ${filterType !== 'all' ? 'ring-2 ring-primary' : ''}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        </button>
                        {showFilter && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => { setFilterType('all'); setShowFilter(false) }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${filterType === 'all' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => { setFilterType('income'); setShowFilter(false) }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${filterType === 'income' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Pemasukan
                                </button>
                                <button
                                    onClick={() => { setFilterType('expense'); setShowFilter(false) }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${filterType === 'expense' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Pengeluaran
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Staff Name
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Nominal
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Actions
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
                                        {transactions.length === 0 ? 'Tidak ada transaksi' : 'Tidak ada hasil yang cocok'}
                                    </td>
                                </tr>
                            ) : filteredTransactions.map((tx, index) => (
                                <tr
                                    key={tx.id || index}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full ${getInitialsColor(tx.userName)} flex items-center justify-center text-xs font-bold`}
                                            >
                                                {getInitials(tx.userName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {tx.userName || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {tx.description || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}
                                        >
                                            {tx.categoryName || tx.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            <span className="text-sm">{new Date(tx.transactionDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(tx)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal(tx)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Showing {transactions.length} transactions
                    </span>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Transaksi</h3>
                            <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Tipe</label>
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                >
                                    <option value="income">Pemasukan</option>
                                    <option value="expense">Pengeluaran</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Kategori</label>
                                <select
                                    value={editCategoryId}
                                    onChange={(e) => setEditCategoryId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Jumlah</label>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Keterangan</label>
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Tanggal</label>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                                Batal
                            </button>
                            <button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg disabled:opacity-50">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full shadow-xl">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-red-600 text-2xl">delete</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hapus Transaksi?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Transaksi "{deleteModal.description || deleteModal.categoryName}" sebesar {formatRupiah(deleteModal.amount)} akan dihapus secara permanen.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    Batal
                                </button>
                                <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                                    {saving ? 'Menghapus...' : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransactionsAuditTable
