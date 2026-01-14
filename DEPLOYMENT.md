# 🚀 Deployment Guide - Saldo.id Finance Dashboard

Panduan lengkap untuk deploy aplikasi ke **Vercel** (Frontend), **Railway** (Backend), dan **Neon** (Database).

---

## 📋 Arsitektur Deployment

```
┌─────────────────────┐         HTTPS          ┌─────────────────────┐
│   VERCEL (FREE)     │ ────────────────────►  │   RAILWAY (FREE)    │
│   owner-dashboard   │ ◄────────────────────  │   backend           │
│   (React + Vite)    │                        │   (Express)         │
└─────────────────────┘                        └──────────┬──────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │   NEON (FREE)       │
                                               │   PostgreSQL        │
                                               └─────────────────────┘
```

---

## 1️⃣ Setup Database (Neon) ✅ SELESAI

Database sudah dikonfigurasi di Neon.

---

## 2️⃣ Deploy Backend (Railway)

### Langkah-langkah:

1. **Push code ke GitHub** (jika belum):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Buka **[railway.app](https://railway.app)** → Login dengan GitHub

3. Klik **"New Project"** → **"Deploy from GitHub repo"**

4. Pilih repository `finance-Dashboard`

5. Setelah project dibuat, klik service yang muncul

6. Buka tab **Settings** dan atur:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `packages/backend` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm run start` |

7. Buka tab **Variables** dan tambahkan:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `postgresql://...` (dari Neon .env) |
   | `JWT_SECRET` | `your-secret-32-char-string` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (isi setelah Vercel) |
   | `PORT` | `3001` |

8. Railway akan auto-deploy. Tunggu hingga selesai.

9. Buka tab **Settings** → **Networking** → **Generate Domain**

10. Catat URL backend: `https://xxx.up.railway.app`

---

## 3️⃣ Deploy Frontend (Vercel)

### Langkah-langkah:

1. Buka **[vercel.com](https://vercel.com)** → Login dengan GitHub

2. Klik **"Add New..."** → **"Project"**

3. Import repository yang sama

4. **Konfigurasi:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `packages/owner-dashboard` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. **Environment Variables:**

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://xxx.up.railway.app/api` |

6. Klik **"Deploy"**

7. Catat URL frontend: `https://your-app.vercel.app`

---

## 4️⃣ Update CORS (Final Step)

1. Kembali ke **Railway Dashboard** → Service → **Variables**
2. Update `FRONTEND_URL` dengan URL Vercel Anda
3. Railway akan auto-redeploy

---

## 🔧 Troubleshooting

### CORS Error
- Pastikan `FRONTEND_URL` di Railway sama persis dengan URL Vercel (tanpa trailing slash)

### Database Connection Error
- Pastikan `?sslmode=require` ada di akhir DATABASE_URL

### Railway Build Error
- Cek logs di Railway Dashboard
- Pastikan Root Directory sudah benar: `packages/backend`

---

## ✅ Checklist Deployment

- [x] Database Neon dibuat
- [x] Schema database di-push
- [x] Data di-seed
- [ ] Push code ke GitHub
- [ ] Deploy Backend ke Railway
- [ ] Generate domain di Railway
- [ ] Deploy Frontend ke Vercel
- [ ] Set VITE_API_URL di Vercel
- [ ] Update FRONTEND_URL di Railway
- [ ] Test login
