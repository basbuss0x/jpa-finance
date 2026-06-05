# JPA Finance System

Sistem keuangan mobile-first untuk CV Juara Pertama Abadi (JPA), Ambon, Maluku.

---

## Tentang Aplikasi

Web app untuk mencatat dan memonitor keuangan perusahaan — khususnya alur dana talangan, biaya operasional proyek, dan kondisi keuangan keseluruhan perusahaan.

Dirancang untuk pengguna yang aktif di lapangan: input transaksi cukup 4 tap, langsung dari browser HP, tanpa install apapun.

---

## Fitur Utama

- **Input Cepat** — catat transaksi masuk/keluar dalam ≤ 30 detik
- **Manajemen Proyek** — tracking per pengadaan/proyek dari modal sampai profit
- **Dashboard Global** — kondisi perusahaan (UNTUNG/STAGNAN/RUGI) real-time
- **Backup & Restore** — export/import data ke file JSON

---

## Tech Stack

| Aspek | Pilihan |
|---|---|
| Framework | React (JSX) |
| Styling | Inline styles |
| Charts | Recharts |
| Storage | localStorage |
| Auth | Tidak ada (Phase 1) |
| Bahasa UI | Bahasa Indonesia |
| Target device | Mobile browser (~390px) |

---

## Struktur Project

```
jpa-finance/
├── README.md
├── AGENT.md              ← instruksi teknis untuk AI/developer
├── CHANGELOG.md          ← history perubahan
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.jsx           ← root + navigasi antar halaman
    ├── constants.js      ← kategori, status, tipe transaksi
    ├── utils.js          ← format IDR, hitung profit, generate ID
    ├── store.js          ← semua fungsi baca/tulis localStorage
    └── pages/
        ├── InputCepat.jsx
        ├── DaftarProyek.jsx
        ├── DetailProyek.jsx
        ├── Dashboard.jsx
        └── Pengaturan.jsx
```

---

## Setup & Menjalankan

### Prasyarat

- Node.js v18 atau lebih baru
- npm v8 atau lebih baru

### Instalasi

```bash
# Clone repository
git clone https://github.com/jpa-ambon/jpa-finance.git
cd jpa-finance

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka di browser: `http://localhost:5173`

### Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/` — bisa di-deploy ke Vercel, Netlify, atau hosting statis manapun.

### Deploy ke Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## Cara Pakai

### Pertama Kali

1. Buka app di browser HP
2. Tap **"+ Proyek Baru"** di halaman Proyek
3. Isi nama proyek, klien, nilai pesanan
4. Mulai catat transaksi via **Input Cepat**

### Alur Harian

```
Pagi/Siang (lapangan)
  → Ada transaksi → buka app → Input Cepat → 4 tap → simpan

Malam
  → Review transaksi hari ini
  → Tambah yang terlewat
  → Cek kondisi proyek di Detail Proyek

Akhir Proyek
  → Buka Detail Proyek
  → Isi "Potongan Ops Perusahaan" secara manual
  → Ubah status proyek ke "Selesai"

Mingguan
  → Pengaturan → Export Backup (JSON)
  → Simpan ke HP atau Google Drive
```

### Jenis Transaksi

| Tipe | Arah | Keterangan |
|---|---|---|
| `modal` | Keluar | Dana talangan untuk bayar vendor |
| `ops_proyek` | Keluar | Biaya operasional terkait proyek |
| `ops_perusahaan` | Keluar | Overhead perusahaan, tidak terikat proyek |
| `penerimaan` | Masuk | Bayaran dari klien/sekolah |
| `pengembalian` | Masuk | Dana talangan yang dikembalikan |

---

## Data & Storage

Semua data tersimpan di **localStorage browser HP pengguna**.

```
jpa_proyek      → array data proyek
jpa_transaksi   → array data transaksi
jpa_settings    → konfigurasi app
```

> ⚠️ **Penting:** Data tersimpan di browser, bukan di server.
> Jika browser di-clear atau HP diganti tanpa backup, data hilang permanen.
> **Lakukan export backup secara rutin minimal seminggu sekali.**

### Export Backup

1. Buka halaman **Backup** (tab paling kanan)
2. Tap **"Export Backup (JSON)"**
3. File `jpa-backup-YYYY-MM-DD.json` otomatis terdownload
4. Simpan ke Google Drive atau folder aman di HP

### Import / Restore Backup

1. Buka halaman **Backup**
2. Tap area **"Upload Backup"**
3. Pilih file `.json` dari HP
4. Tap **"Import Backup"** — konfirmasi
5. Semua data terganti dengan data dari file backup

---

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Web app mobile-first, localStorage, single user | 🔨 In Progress |
| **Phase 2** | Migrasi ke Supabase (cloud), data tidak hilang saat ganti HP | 📋 Planned |
| **Phase 3** | Multi-user dengan role (pengelola, direktur, akuntan) | 📋 Planned |
| **Phase 4** | Laporan pajak, export format DJP | 📋 Planned |
| **Phase 5** | Integrasi SiPLAH API, notifikasi jatuh tempo | 📋 Planned |

---

## Dokumen Referensi

| File | Isi | Untuk |
|---|---|---|
| `AGENT.md` | Instruksi teknis lengkap, schema data, spesifikasi halaman | AI/Developer |
| `JPA-Finance-Build-Docs.docx` | Konteks bisnis, latar belakang, roadmap | Direktur/Manajemen |
| `README.md` | Setup, cara pakai, struktur project | Semua |
| `CHANGELOG.md` | History perubahan per versi | Developer |

---

## Kontribusi & Pengembangan

Saat ini dikembangkan oleh tim IT CV Juara Pertama Abadi.

Sebelum mulai development:
1. Baca `AGENT.md` dari awal sampai akhir
2. Pahami aturan bisnis di Section 7 (`AGENT.md`)
3. Ikuti urutan build di Section 11 (`AGENT.md`)
4. Catat setiap perubahan keputusan di `CHANGELOG.md`

---

## Kontak

**CV Juara Pertama Abadi**
Ambon, Maluku, Indonesia

---

*JPA Finance System v1.0.0 — Phase 1*
