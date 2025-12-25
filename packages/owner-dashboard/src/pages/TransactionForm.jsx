import { useState, useEffect } from 'react'
import TopNavBar from '../components/TopNavBar'
import { transactionsApi, categoriesApi, uploadApi } from '../services/api'

function TransactionForm({ onBack, onNavigate, userRole = 'owner' }) {
    const [transactionType, setTransactionType] = useState('income')
    const [categoryId, setCategoryId] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [proofFile, setProofFile] = useState(null)
    const [proofPreview, setProofPreview] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesApi.getAll()
                setCategories(data)
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            }
        }
        fetchCategories()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            // Upload proof file first if exists
            let proofUrl = null
            if (proofFile) {
                const uploadResult = await uploadApi.uploadFile(proofFile)
                proofUrl = uploadResult.url
            }

            await transactionsApi.create({
                type: transactionType,
                categoryId: categoryId ? parseInt(categoryId) : null,
                amount: amount, // Send as string, backend handles decimal
                description,
                proofUrl,
                transactionDate: new Date(transactionDate).toISOString(),
            })

            setMessage({ type: 'success', text: 'Transaksi berhasil disimpan!' })
            // Reset form
            setAmount('')
            setDescription('')
            setCategoryId('')
            setProofFile(null)
            setProofPreview(null)

            // Go back after success
            setTimeout(() => {
                if (onBack) onBack()
            }, 1500)
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan transaksi' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProofFile(file)
            setProofPreview(URL.createObjectURL(file))
        }
    }

    const filteredCategories = categories.filter(cat => cat.type === transactionType)

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <TopNavBar
                activeTab="Transactions"
                onNavigate={onNavigate}
                onBack={onBack}
                showBackButton={true}
                userRole={userRole}
            />

            <main className="layout-container flex h-full grow flex-col py-8 px-4 md:px-20 lg:px-40">
                <div className="flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col max-w-[800px] flex-1 w-full">
                        {/* Page Heading */}
                        <div className="flex flex-wrap justify-between gap-3 px-4 pb-6 pt-2">
                            <div className="flex min-w-72 flex-col gap-2">
                                <h1 className="text-[#0d131c] dark:text-white tracking-light text-[32px] font-bold leading-tight">
                                    Tambah Transaksi Baru
                                </h1>
                                <p className="text-[#49699c] dark:text-gray-400 text-sm font-normal leading-normal">
                                    Catat pemasukan dan pengeluaran Anda dengan detail.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex flex-col gap-6 px-4 pb-10">
                            {/* Transaction Type */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[#0d131c] dark:text-white text-base font-medium leading-normal">
                                    Tipe Transaksi
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label
                                        className={`flex items-center gap-4 rounded-lg border border-solid p-[15px] cursor-pointer hover:border-primary/50 transition-colors ${transactionType === 'income'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636]'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="transaction_type"
                                            value="income"
                                            checked={transactionType === 'income'}
                                            onChange={(e) => setTransactionType(e.target.value)}
                                            className="h-5 w-5 border-2 border-[#ced8e8] dark:border-gray-600 bg-transparent text-primary focus:ring-primary"
                                        />
                                        <div className="flex grow flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600">arrow_downward</span>
                                                <p className="text-[#0d131c] dark:text-white text-sm font-bold leading-normal">
                                                    Pemasukan
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex items-center gap-4 rounded-lg border border-solid p-[15px] cursor-pointer hover:border-primary/50 transition-colors ${transactionType === 'expense'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636]'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="transaction_type"
                                            value="expense"
                                            checked={transactionType === 'expense'}
                                            onChange={(e) => setTransactionType(e.target.value)}
                                            className="h-5 w-5 border-2 border-[#ced8e8] dark:border-gray-600 bg-transparent text-primary focus:ring-primary"
                                        />
                                        <div className="flex grow flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-red-500">arrow_upward</span>
                                                <p className="text-[#0d131c] dark:text-white text-sm font-bold leading-normal">
                                                    Pengeluaran
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Date & Category Row */}
                            <div className="flex flex-wrap items-start gap-4">
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-[#0d131c] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                                        Tanggal
                                    </p>
                                    <input
                                        type="date"
                                        value={transactionDate}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                        className="form-input flex w-full min-w-0 flex-1 rounded-lg text-[#0d131c] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636] focus:border-primary h-14 placeholder:text-[#49699c] p-[15px] text-base font-normal leading-normal"
                                    />
                                </label>
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-[#0d131c] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                                        Kategori
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="form-select flex w-full min-w-0 flex-1 rounded-lg text-[#0d131c] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636] focus:border-primary h-14 placeholder:text-[#49699c] px-[15px] text-base font-normal leading-normal appearance-none"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {filteredCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#49699c]">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Nominal */}
                            <label className="flex flex-col w-full">
                                <p className="text-[#0d131c] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                                    Nominal
                                </p>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-[#0d131c] dark:text-gray-400 font-bold">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="form-input flex w-full min-w-0 flex-1 rounded-lg text-[#0d131c] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636] focus:border-primary h-14 placeholder:text-[#49699c] pl-12 pr-4 text-lg font-bold leading-normal"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </label>

                            {/* Keterangan */}
                            <label className="flex flex-col w-full">
                                <p className="text-[#0d131c] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                                    Keterangan
                                </p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-none rounded-lg text-[#0d131c] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#ced8e8] dark:border-gray-700 bg-white dark:bg-[#1a2636] focus:border-primary min-h-[120px] placeholder:text-[#49699c] p-[15px] text-base font-normal leading-normal"
                                    placeholder="Tulis detail transaksi (opsional)"
                                />
                            </label>

                            {/* Bukti Transaksi Upload */}
                            <div className="flex flex-col w-full gap-2">
                                <p className="text-[#0d131c] dark:text-gray-200 text-base font-medium leading-normal">
                                    Bukti Transaksi <span className="text-gray-400 text-sm ml-1">(Opsional)</span>
                                </p>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#ced8e8] dark:border-gray-600 rounded-xl bg-[#f8f9fc] dark:bg-[#1a2636] hover:bg-[#edf2fa] dark:hover:bg-[#233044] transition-colors cursor-pointer group overflow-hidden">
                                    {proofPreview ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={proofPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white text-sm font-medium">Klik untuk ganti</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                            </div>
                                            <p className="mb-2 text-sm text-[#0d131c] dark:text-gray-300 font-medium">
                                                Klik untuk upload atau drag &amp; drop
                                            </p>
                                            <p className="text-xs text-[#49699c] dark:text-gray-500">
                                                PNG, JPG atau PDF (MAX. 5MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {proofFile && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        <span>{proofFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => { setProofFile(null); setProofPreview(null); }}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            {message.text && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isLoading || !amount}
                                    className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-4 text-white text-base font-bold leading-normal tracking-wide shadow-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined mr-2">{isLoading ? 'hourglass_empty' : 'save'}</span>
                                    {isLoading ? 'MENYIMPAN...' : 'SIMPAN TRANSAKSI'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TransactionForm
