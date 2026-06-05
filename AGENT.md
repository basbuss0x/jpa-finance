# JPA Finance System — AGENT.md
> Instruksi teknis untuk Codex / Claude Code. Baca seluruh file ini sebelum menulis satu baris kode pun.

---

## 1. Gambaran Proyek

Bangun **web app mobile-first** untuk sistem keuangan CV Juara Pertama Abadi (JPA), perusahaan pengadaan barang & IT solutions di Ambon, Maluku.

Pengguna utama adalah pengelola keuangan yang **aktif di lapangan**, membuka app dari **browser HP**. Prioritas utama adalah kecepatan dan kemudahan input — bukan kelengkapan fitur.

**Satu kalimat tujuan:**
> Pengelola bisa mencatat transaksi dalam 4 tap, dan melihat kondisi keuangan per proyek + keseluruhan perusahaan kapan saja.

---

## 2. Tech Stack

```
Framework     : React (JSX) — functional components + hooks
Styling       : Inline styles only — TIDAK pakai Tailwind, CSS modules, atau library styling
Charts        : Recharts
Storage       : localStorage (BUKAN database, BUKAN API, BUKAN sessionStorage)
Language UI   : Bahasa Indonesia
Mata Uang     : IDR (Rupiah)
Target Device : Mobile browser (layar ~390px lebar)
```

**Library yang boleh dipakai:**
- `recharts` — untuk grafik
- `lucide-react` — untuk icon (opsional)
- Tidak perlu library lain

---

## 3. Struktur File

```
src/
├── App.jsx                  — root, routing antar halaman
├── store.js                 — semua fungsi baca/tulis localStorage
├── utils.js                 — helper: format IDR, hitung profit, dll
├── constants.js             — kategori, status, konstanta lain
└── pages/
    ├── InputCepat.jsx       — halaman utama, form transaksi cepat
    ├── DaftarProyek.jsx     — list semua proyek
    ├── DetailProyek.jsx     — detail keuangan 1 proyek
    ├── Dashboard.jsx        — ringkasan global perusahaan
    └── Pengaturan.jsx       — export/import backup data
```

> Single file artifact juga diterima selama semua logika terorganisir dengan jelas.

---

## 4. Data Schema (localStorage)

### Keys

```js
localStorage.getItem('jpa_proyek')      // JSON array of Proyek
localStorage.getItem('jpa_transaksi')   // JSON array of Transaksi
localStorage.getItem('jpa_settings')    // JSON object Settings
```

### Proyek

```ts
{
  id           : string,    // "PRJ-001", "PRJ-002", dst — generate otomatis
  jenis        : string,    // "Project" | "Regular" — klasifikasi major transaksi/proyek
  nama         : string,    // "Pengadaan Buku SDN 1 Ambon"
  sumber       : string,    // "SiPLAH" | "Non-SiPLAH" | "Lainnya"
  klien        : string,    // nama sekolah / instansi
  nilaiPesanan : number,    // total yang ditagihkan ke klien (IDR)
  potOpsPerush : number,    // potongan ops perusahaan — input manual, default 0
  status       : string,    // "Aktif" | "Selesai" | "Menunggu Bayar"
  tanggalMulai : string,    // "YYYY-MM-DD"
  catatan      : string,    // opsional
}
```

### Transaksi

```ts
{
  id        : string,    // generate dari Date.now()
  proyekId  : string,    // referensi ke Proyek.id, atau "UMUM" jika ops perusahaan umum
  tanggal   : string,    // "YYYY-MM-DD"
  arah      : string,    // "masuk" | "keluar"
  tipe      : string,    // lihat Tipe Transaksi di bawah
  kategori  : string,    // lihat Kategori di bawah
  nominal   : number,    // IDR, selalu positif
  catatan   : string,    // opsional
}
```

### Tipe Transaksi

```
"modal"           — Dana talangan keluar untuk bayar vendor
"ops_proyek"      — Biaya operasional terkait proyek tertentu
"ops_perusahaan"  — Overhead perusahaan, tidak terikat proyek
"penerimaan"      — Bayaran masuk dari klien/sekolah
"pengembalian"    — Dana talangan yang dikembalikan ke penyetor
```

### Kategori (untuk dropdown di form)

```js
// Ops Proyek
"Bayar Vendor"
"Transportasi & BBM"
"Angkut & Logistik"      // angkut barang, tali, plaster, packing
"Makan & Konsumsi"
"Fee & Komisi"           // fee guru, fee pemberi proyek

// Ops Perusahaan
"Meeting & Entertain"    // kafe, meeting klien
"Sewa"                   // kost, gudang, kantor
"Pinjaman Keluar"        // uang dipinjam pihak lain

// Fleksibel
"Lain-lain"
```

### Settings

```ts
{
  namaPerusahaan : string,   // default: "CV Juara Pertama Abadi"
  versi          : string,   // "1.0.0"
  lastBackup     : string,   // ISO datetime string, update setiap export
}
```

---

## 5. Kalkulasi Keuangan

Semua kalkulasi dilakukan **computed dari array transaksi** — tidak ada angka yang di-store terpisah kecuali `potOpsPerush` di Proyek.

### Per Proyek

```js
const txProyek = transaksi.filter(t => t.proyekId === proyek.id)

const totalModal      = txProyek.filter(t => t.tipe === 'modal').reduce((s,t) => s + t.nominal, 0)
const totalOpsProyek  = txProyek.filter(t => t.tipe === 'ops_proyek').reduce((s,t) => s + t.nominal, 0)
const totalMasuk      = txProyek.filter(t => t.tipe === 'penerimaan').reduce((s,t) => s + t.nominal, 0)
const potOps          = proyek.potOpsPerush   // input manual

const totalBiaya      = totalModal + totalOpsProyek + potOps
const profitBersih    = totalMasuk - totalBiaya
const sisaPiutang     = proyek.nilaiPesanan - totalMasuk
const sudahBalikModal = totalMasuk >= totalModal
```

### Dashboard Global

```js
const semuaTx = transaksi  // semua transaksi

const totalDanaTalangan   = semuaTx.filter(t => t.tipe === 'modal').reduce((s,t) => s + t.nominal, 0)
const totalPengembalian   = semuaTx.filter(t => t.tipe === 'pengembalian').reduce((s,t) => s + t.nominal, 0)
const danaBeredar         = totalDanaTalangan - totalPengembalian  // saldo modal yang belum kembali

const totalPemasukan      = semuaTx.filter(t => t.arah === 'masuk').reduce((s,t) => s + t.nominal, 0)
const totalPengeluaran    = semuaTx.filter(t => t.arah === 'keluar').reduce((s,t) => s + t.nominal, 0)
const labaRugi            = totalPemasukan - totalPengeluaran

// Kondisi perusahaan
const kondisi = labaRugi > 0 ? 'UNTUNG' : labaRugi < 0 ? 'RUGI' : 'STAGNAN'
```

---

## 6. Spesifikasi Halaman

### 6.1 Input Cepat (Halaman Utama)

**Tujuan:** Input transaksi dalam ≤ 4 tap, ≤ 30 detik.

**Form fields (urutan tampil di HP):**
1. Toggle **Masuk / Keluar** — tap besar, full width, visual kontras jelas
2. Dropdown **Proyek** — list proyek aktif + opsi "Ops Perusahaan (Umum)"
3. **Nominal** — input angka, keyboard numerik otomatis muncul, tampilkan format IDR real-time di bawahnya
4. Dropdown **Kategori** — filter otomatis sesuai arah (masuk/keluar) dan tipe
5. **Tipe** — auto-assign berdasarkan kombinasi arah + kategori, tapi bisa dioverride
6. Input **Catatan** — opsional, satu baris, placeholder "Keterangan (opsional)"
7. Tombol **Simpan** — besar, full width, warna kontras

**Behavior:**
- Tanggal default = hari ini, bisa diubah (tap untuk buka date picker)
- Setelah simpan: form reset, tampil toast "Tersimpan ✓", tetap di halaman yang sama
- Validasi minimal: nominal > 0 dan proyek dipilih
- Jika tidak ada proyek aktif: tampil prompt "Buat proyek dulu"

---

### 6.2 Daftar Proyek

**Tampilkan per proyek (card):**
- Nama proyek + nama klien
- Badge status: Aktif (hijau) / Menunggu Bayar (kuning) / Selesai (abu)
- Nilai pesanan vs total masuk (progress bar)
- Profit bersih — warna hijau jika positif, merah jika negatif
- Tap card → masuk ke Detail Proyek

**Di halaman ini ada:**
- Tombol "+ Proyek Baru" di atas
- Filter: Semua / Aktif / Selesai

---

### 6.3 Detail Proyek

**Header:** Nama proyek, klien, sumber (SiPLAH/Non), status, tanggal mulai

**Ringkasan Keuangan (kartu angka):**
```
Total Dana Talangan    Total Ops Proyek    Total Masuk
Potongan Ops Perush    Profit Bersih       Sisa Piutang
```

**Field Potongan Ops Perusahaan:**
- Tampil sebagai input yang bisa langsung diedit inline
- Label jelas: "Potongan Ops Perusahaan (manual)"
- Auto-save saat blur

**Progress pembayaran:**
- Bar: Total Masuk / Nilai Pesanan
- Teks: "Rp X dari Rp Y (Z%)"

**Histori Transaksi proyek ini:**
- List transaksi urut tanggal terbaru
- Setiap item: tanggal, kategori, nominal (merah/hijau), catatan
- Bisa hapus transaksi individual (dengan konfirmasi)

**Tombol Edit Proyek** — ubah nama, klien, nilai pesanan, status

---

### 6.4 Dashboard Global

**KPI Cards (4 kartu):**
```
Total Pemasukan    Total Pengeluaran    Laba/Rugi    Dana Talangan Beredar
```

**Kondisi Perusahaan Banner:**
- Besar, visual mencolok
- UNTUNG → hijau, RUGI → merah, STAGNAN → kuning
- Tampilkan margin: "Margin X%"

**Grafik Arus Kas Bulanan:**
- Bar chart: Masuk vs Keluar per bulan
- Filter tahun (default tahun berjalan)

**Ringkasan Proyek:**
- List semua proyek aktif dengan profit masing-masing
- Sorted: yang paling banyak profit di atas

**Ringkasan Ops Perusahaan:**
- Total pengeluaran ops perusahaan (non-proyek)
- Breakdown per kategori

---

### 6.5 Pengaturan & Backup

**Backup:**
- Tombol "Export Backup (JSON)" — download file `jpa-backup-YYYY-MM-DD.json`
- Tombol "Import Backup" — upload JSON, replace semua data (dengan konfirmasi)
- Tampilkan: "Backup terakhir: [tanggal]" atau "Belum pernah backup"

**Reset Data:**
- Tombol "Hapus Semua Data" — dengan konfirmasi 2 langkah (ketik "HAPUS" untuk konfirmasi)

**Info:**
- Nama perusahaan (editable)
- Versi app

---

## 7. Aturan Bisnis — WAJIB DIIKUTI

```
✅ Potongan ops perusahaan per proyek = input MANUAL oleh pengelola
   JANGAN buat kalkulasi otomatis atau persentase

✅ Penerimaan dari klien bisa BERTAHAP — tidak ada batas jumlah transaksi masuk per proyek

✅ Dana talangan beredar = total modal keluar - total pengembalian eksplisit
   JANGAN otomatis kurangi saat ada profit

✅ Satu proyek bisa punya banyak transaksi masuk dan keluar

✅ Transaksi "Ops Perusahaan Umum" menggunakan proyekId = "UMUM"

✅ Semua nominal disimpan sebagai angka POSITIF — arah (masuk/keluar) ditentukan field 'arah'

✅ Transaksi/proyek JPA dibagi menjadi 2 major type:
   1. Project
      Untuk pekerjaan non-sekolah atau pekerjaan khusus, seperti CCTV, website/aplikasi,
      pengadaan umum, meubelair, atau pekerjaan berbasis vendor/proyek.
   2. Regular
      Kategori khusus untuk transaksi sekolah yang berulang, seperti buku sekolah,
      map raport, perlengkapan sekolah, atau repeat order sekolah.
```

---

## 8. UX Rules — TIDAK BOLEH DILANGGAR

```
❌ JANGAN buat form dengan lebih dari 6 field terlihat sekaligus di mobile
❌ JANGAN pakai modal/popup untuk input utama — langsung di halaman
❌ JANGAN require login atau autentikasi apapun
❌ JANGAN pakai localStorage untuk menyimpan state UI (hanya data bisnis)
❌ JANGAN pakai sessionStorage
❌ JANGAN hilangkan data saat navigasi antar halaman
❌ JANGAN pakai tabel untuk layout di mobile — gunakan card/flex

✅ Semua tombol aksi utama: min height 48px (mudah di-tap jari)
✅ Input nominal: type="number", inputMode="numeric" agar keyboard angka muncul di HP
✅ Format IDR tampil real-time saat user ketik nominal
✅ Toast notification setelah aksi simpan/hapus
✅ Loading state saat ada operasi yang perlu waktu
```

---

## 9. Helper Functions (utils.js)

```js
// Format angka ke IDR
export const fmtIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

// Format singkat untuk dashboard
export const fmtShort = (n) => {
  if (Math.abs(n) >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000_000)     return `${(n/1_000_000).toFixed(1)}Jt`
  if (Math.abs(n) >= 1_000)         return `${(n/1_000).toFixed(0)}Rb`
  return String(n)
}

// Generate ID proyek
export const generateProyekId = (existingProyek) => {
  const n = existingProyek.length + 1
  return `PRJ-${String(n).padStart(3, '0')}`
}

// Hitung ringkasan keuangan 1 proyek
export const hitungProyek = (proyek, transaksi) => {
  const tx = transaksi.filter(t => t.proyekId === proyek.id)
  const totalModal     = tx.filter(t => t.tipe === 'modal').reduce((s,t) => s+t.nominal, 0)
  const totalOps       = tx.filter(t => t.tipe === 'ops_proyek').reduce((s,t) => s+t.nominal, 0)
  const totalMasuk     = tx.filter(t => t.tipe === 'penerimaan').reduce((s,t) => s+t.nominal, 0)
  const potOps         = proyek.potOpsPerush || 0
  const totalBiaya     = totalModal + totalOps + potOps
  const profitBersih   = totalMasuk - totalBiaya
  const sisaPiutang    = proyek.nilaiPesanan - totalMasuk
  const progressPct    = proyek.nilaiPesanan > 0 ? Math.min(100, Math.round((totalMasuk/proyek.nilaiPesanan)*100)) : 0
  return { totalModal, totalOps, totalMasuk, potOps, totalBiaya, profitBersih, sisaPiutang, progressPct }
}
```

---

## 10. Store Functions (store.js)

```js
const KEYS = {
  proyek: 'jpa_proyek',
  transaksi: 'jpa_transaksi',
  settings: 'jpa_settings',
}

export const getProyek     = () => JSON.parse(localStorage.getItem(KEYS.proyek) || '[]')
export const getTransaksi  = () => JSON.parse(localStorage.getItem(KEYS.transaksi) || '[]')
export const getSettings   = () => JSON.parse(localStorage.getItem(KEYS.settings) || '{"namaPerusahaan":"CV Juara Pertama Abadi","versi":"1.0.0","lastBackup":null}')

export const saveProyek    = (data) => localStorage.setItem(KEYS.proyek, JSON.stringify(data))
export const saveTransaksi = (data) => localStorage.setItem(KEYS.transaksi, JSON.stringify(data))
export const saveSettings  = (data) => localStorage.setItem(KEYS.settings, JSON.stringify(data))

export const addProyek     = (item) => saveProyek([...getProyek(), item])
export const addTransaksi  = (item) => saveTransaksi([...getTransaksi(), item])

export const exportBackup  = () => {
  const payload = { proyek: getProyek(), transaksi: getTransaksi(), settings: getSettings(), exportedAt: new Date().toISOString() }
  const blob    = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href        = url
  a.download    = `jpa-backup-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  const s = getSettings()
  saveSettings({ ...s, lastBackup: new Date().toISOString() })
}
```

---

## 11. Urutan Build (Task Order)

Kerjakan dalam urutan ini — jangan loncat:

```
[ ] 1. constants.js      — kategori, status, tipe transaksi
[ ] 2. utils.js          — fmtIDR, fmtShort, hitungProyek, generateId
[ ] 3. store.js          — semua fungsi localStorage
[ ] 4. InputCepat.jsx    — halaman utama, form 4 tap
[ ] 5. DaftarProyek.jsx  — list proyek + tambah proyek baru
[ ] 6. DetailProyek.jsx  — detail keuangan + histori transaksi
[ ] 7. Dashboard.jsx     — KPI + grafik + kondisi perusahaan
[ ] 8. Pengaturan.jsx    — export/import backup
[ ] 9. App.jsx           — routing/navigasi antar halaman
[ ] 10. Testing          — cek semua kalkulasi dengan data dummy
```

---

## 12. Seed Data untuk Testing

```js
// Gunakan data ini saat development untuk testing kalkulasi
const seedProyek = [
  { id: 'PRJ-001', nama: 'Pengadaan Buku SDN 1 Ambon', sumber: 'SiPLAH', klien: 'SDN 1 Ambon', nilaiPesanan: 18500000, potOpsPerush: 500000, status: 'Selesai', tanggalMulai: '2025-03-01', catatan: '' },
  { id: 'PRJ-002', nama: 'Pengadaan Buku SMP 3 Ambon', sumber: 'Non-SiPLAH', klien: 'SMP Negeri 3 Ambon', nilaiPesanan: 32000000, potOpsPerush: 0, status: 'Aktif', tanggalMulai: '2025-05-10', catatan: 'Menunggu Dana BOS cair' },
]

const seedTransaksi = [
  { id: '1', proyekId: 'PRJ-001', tanggal: '2025-03-01', arah: 'keluar', tipe: 'modal', kategori: 'Bayar Vendor', nominal: 14000000, catatan: 'Bayar vendor buku' },
  { id: '2', proyekId: 'PRJ-001', tanggal: '2025-03-05', arah: 'keluar', tipe: 'ops_proyek', kategori: 'Angkut & Logistik', nominal: 350000, catatan: 'Ongkos angkut' },
  { id: '3', proyekId: 'PRJ-001', tanggal: '2025-03-05', arah: 'keluar', tipe: 'ops_proyek', kategori: 'Makan & Konsumsi', nominal: 120000, catatan: 'Makan tim' },
  { id: '4', proyekId: 'PRJ-001', tanggal: '2025-03-10', arah: 'masuk', tipe: 'penerimaan', kategori: 'Penerimaan', nominal: 18500000, catatan: 'Pelunasan dari SDN 1' },
  { id: '5', proyekId: 'PRJ-002', tanggal: '2025-05-10', arah: 'keluar', tipe: 'modal', kategori: 'Bayar Vendor', nominal: 25000000, catatan: 'DP vendor buku SMP' },
  { id: '6', proyekId: 'PRJ-002', tanggal: '2025-05-15', arah: 'masuk', tipe: 'penerimaan', kategori: 'Penerimaan', nominal: 15000000, catatan: 'DP dari sekolah' },
  { id: '7', proyekId: 'UMUM', tanggal: '2025-05-01', arah: 'keluar', tipe: 'ops_perusahaan', kategori: 'Sewa', nominal: 1500000, catatan: 'Sewa gudang Mei' },
]
```

---

## 13. Warna & Desain

```js
// Palette utama — konsisten di semua halaman
const COLORS = {
  primary   : '#1B2A4A',   // navy — header, tombol utama, teks heading
  gold      : '#C9A84C',   // gold — aksen, border aktif
  success   : '#10b981',   // hijau — masuk, untung, lunas
  danger    : '#f43f5e',   // merah — keluar, rugi, jatuh tempo
  warning   : '#f59e0b',   // kuning — pending, stagnan
  bg        : '#f8f7f4',   // background halaman
  card      : '#ffffff',   // background kartu
  border    : '#e5e1d8',   // border kartu
  text      : '#1c1917',   // teks utama
  muted     : '#78716c',   // teks sekunder
}
```

**Prinsip desain:**
- Card-based layout — setiap section dalam card dengan border tipis dan shadow ringan
- Font: system font (tidak perlu import Google Fonts)
- Spacing konsisten: 8px, 12px, 16px, 24px
- Tidak ada animasi berlebihan — smooth transition 0.15s cukup

---

## 14. Hal yang Sengaja TIDAK Dibangun di Phase 1

```
✗ Login / autentikasi
✗ Multi-user / role management
✗ Sinkronisasi cloud / Supabase
✗ Laporan pajak (PPh, PPN)
✗ Invoice / cetak dokumen
✗ Notifikasi push
✗ Integrasi SiPLAH API
✗ Dark mode
```

Semua di atas masuk roadmap Phase 2+. Jangan implementasi sekarang meskipun terasa mudah.

---

*AGENT.md — JPA Finance System v1.0 | CV Juara Pertama Abadi*
