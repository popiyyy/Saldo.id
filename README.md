# 💰 Saldo.id

**Aplikasi Manajemen Keuangan** - Dashboard untuk mencatat dan mengelola transaksi pemasukan dan pengeluaran.

![Saldo.id Dashboard](https://img.shields.io/badge/Status-Active-green) ![Node.js](https://img.shields.io/badge/Node.js-18+-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

---

## 📋 Fitur

### Owner Dashboard
- ✅ Melihat total pemasukan, pengeluaran, dan profit
- ✅ Grafik pemasukan vs pengeluaran (7 hari terakhir)
- ✅ Tabel audit transaksi dengan detail user
- ✅ Search dan filter transaksi
- ✅ Edit dan hapus transaksi
- ✅ Laporan keuangan

### Staff Dashboard
- ✅ Catat pemasukan dan pengeluaran
- ✅ Lihat riwayat transaksi pribadi
- ✅ Upload bukti transaksi

### Umum
- ✅ Autentikasi (Login/Register)
- ✅ Dark mode
- ✅ Responsive design (mobile-friendly)
- ✅ Update profil user

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | JWT (JSON Web Token) |

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/popiyyy/Saldo.id.git
cd Saldo.id
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
Buat database PostgreSQL dan update file `.env` di folder `packages/backend`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/saldo_db
JWT_SECRET=your-secret-key
PORT=3000
```

### 4. Migrasi Database
```bash
cd packages/backend
npx drizzle-kit push
```

### 5. Jalankan Aplikasi
```bash
# Dari root folder
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5175
- **Backend**: http://localhost:3000

---

## 📁 Struktur Folder

```
finance-Dashboard/
├── packages/
│   ├── backend/           # Express.js API server
│   │   ├── src/
│   │   │   ├── config/    # Database config
│   │   │   ├── middleware/# Auth middleware
│   │   │   ├── routes/    # API routes
│   │   │   ├── schema/    # Drizzle schema
│   │   │   └── services/  # Business logic
│   │   └── drizzle.config.ts
│   │
│   └── owner-dashboard/   # React frontend
│       ├── src/
│       │   ├── components/# Reusable components
│       │   ├── pages/     # Page components
│       │   └── services/  # API client
│       └── index.html
│
├── package.json           # Root package.json
└── README.md
```

---

##  API Endpoints

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update` | Update profile |

### Transactions
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions/details` | Get with user info |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Stats
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/stats/summary` | Get income/expense summary |
| GET | `/api/stats/chart` | Get chart data |

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur-baru`
3. Commit perubahan: `git commit -m 'Tambah fitur baru'`
4. Push ke branch: `git push origin fitur-baru`
5. Buat Pull Request

---

