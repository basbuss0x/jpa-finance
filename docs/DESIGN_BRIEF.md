# DESIGN BRIEF — JPA Finance System
> Versi 1.1 — Updated Juni 2025
> Perubahan dari v1.0: tambah warna dana talangan, spesifikasi toast, insight card rules, empty state per filter, dan klarifikasi quick chips.

## 1. Project Overview

**Project Name:** JPA Finance System
**Client/Brand:** CV Juara Pertama Abadi
**Type:** Mobile-first finance admin web app
**Primary Device:** Mobile browser, sekitar 390px width
**Current Phase:** Phase 1 — local-only single user
**Main Storage:** localStorage
**Frontend Stack:** React JSX, inline styles, Recharts
**Primary Users:** Pengelola internal CV Juara Pertama Abadi

JPA Finance System adalah aplikasi keuangan internal untuk membantu CV Juara Pertama Abadi mencatat transaksi harian, memantau arus kas proyek, melihat kondisi keuangan perusahaan, dan melakukan backup data lokal.

Aplikasi ini bukan consumer banking app dan bukan fintech publik. Ini adalah sistem admin keuangan ringan untuk operasional perusahaan kecil/menengah, terutama untuk kebutuhan pencatatan cepat, dana talangan, proyek pengadaan, biaya operasional, dan backup data.

---

## 2. Design Goal

Tujuan redesign adalah membuat aplikasi terasa:

* Lebih profesional
* Lebih rapi
* Lebih cepat digunakan
* Lebih mudah dibaca
* Lebih aman secara persepsi
* Lebih cocok untuk operasional finance JPA
* Lebih realistis untuk dibangun di React tanpa rewrite besar

Target kualitas desain:

* 30% lebih premium dari versi sekarang
* 50% lebih bersih dari versi sekarang
* Lebih sedikit border
* Lebih sedikit visual noise
* Lebih kuat hierarchy-nya
* Lebih mudah diterjemahkan menjadi komponen frontend

Desain harus terasa seperti **admin finance app yang matang**, bukan sekadar form panjang yang diberi warna brand.

---

## 3. Product Positioning

JPA Finance System harus diposisikan sebagai:

> "Mobile-first finance admin interface for project cashflow, daily transactions, and safe local backup."

Karakter produk:

* Praktis
* Operasional
* Cepat
* Terpercaya
* Tidak over-designed
* Tidak terlalu playful
* Tidak terlalu kaku seperti aplikasi birokrasi lama
* Cocok dipakai langsung oleh owner/pengelola keuangan

---

## 4. Main User Problems

Aplikasi harus membantu menjawab pertanyaan berikut:

1. Hari ini ada transaksi apa yang harus dicatat?
2. Uang masuk dan keluar berapa?
3. Proyek mana yang sudah dibayar?
4. Proyek mana yang masih belum masuk pembayaran?
5. Apakah perusahaan sedang untung, rugi sementara, atau arus kas negatif?
6. Berapa dana talangan yang masih beredar?
7. Berapa biaya operasional perusahaan?
8. Apakah data sudah dibackup?
9. Bagaimana mencegah data hilang dari browser HP?

---

## 5. Core UX Principles

### 5.1 Fast Input First

Halaman **Input Cepat** adalah halaman paling penting.

User harus bisa mencatat transaksi dalam waktu singkat tanpa berpikir terlalu lama.

Prinsip:

* Jangan buat user membaca terlalu banyak teks.
* Jangan gunakan step 1–6 yang terlalu berat secara visual.
* Jangan memakai terlalu banyak card bertumpuk.
* Nominal harus menjadi fokus utama.
* Pilihan cepat nominal harus tersedia.
* Tombol simpan harus sangat jelas.

### 5.2 Clear Financial Context

Dashboard tidak boleh hanya menampilkan angka. Dashboard harus memberi konteks.

Contoh:

Buruk:
"RUGI"

Lebih baik:
"Arus Kas Negatif"
"Pengeluaran lebih besar dari pemasukan periode ini."

Aplikasi harus membedakan antara:

* rugi final
* rugi sementara
* arus kas negatif
* belum ada pemasukan
* dana talangan masih berjalan

### 5.3 Mobile-first Simplicity

Karena target utama adalah HP, semua layout harus:

* satu kolom
* mudah di-scroll
* tombol mudah ditekan
* bottom navigation mudah dijangkau
* tidak padat seperti dashboard desktop
* tidak memakai tabel besar di mobile

### 5.4 Trust and Safety

Karena app menyimpan data keuangan di localStorage, UI harus memberi rasa aman dan mengingatkan user untuk backup.

Backup bukan fitur tambahan. Backup adalah bagian penting dari sistem.

Halaman Backup harus memberi pesan:

* data tersimpan lokal
* backup perlu dilakukan rutin
* import akan mengganti data
* reset data berbahaya dan tidak bisa dibatalkan

---

## 6. Brand Direction

Gunakan identitas visual CV Juara Pertama Abadi.

### Brand Personality

Desain harus terasa:

* Profesional
* Berkualitas
* Terpercaya
* Modern administratif
* Bersih
* Rapi
* Kredibel
* Solutif
* Cocok untuk bisnis pengadaan, pendidikan, multimedia, dan layanan digital

### Visual Formula

Gunakan formula:

**White space + JPA Navy + Action Blue + clean cards + light borders + soft shadows + outline icons + restrained brand accents**

### Jangan membuat desain terasa:

* terlalu startup/playful
* terlalu gelap
* terlalu rame
* terlalu banyak gradient
* terlalu banyak wave
* terlalu banyak dot pattern
* seperti template dashboard generik
* seperti poster promosi
* seperti aplikasi bank publik

---

## 7. Color System

Gunakan token warna berikut.

### Primary

* JPA Navy: `#002B68`
* Deep Navy: `#001A4A`
* Corporate Blue: `#0046B8`
* Action Blue: `#0B63F6`
* Sky Blue: `#33A8FF`

### Surfaces

* White: `#FFFFFF`
* Mist Blue: `#F6FAFF`
* Ice Blue: `#EAF3FF`
* Surface: `#F8FAFC`

### Text

* Ink: `#111827`
* Slate: `#334155`
* Cool Gray: `#64748B`

### Lines

* Border Gray: `#E2E8F0`
* Line Blue: `#BBD7F5`

### Semantic

* Success Green: `#16A34A`
* Warning Amber: `#F59E0B`
* Error Red: `#DC2626`
* Talangan Blue: `#0046B8` ← khusus untuk KPI Dana Talangan Beredar

### Dana Talangan Color Rule

Dana Talangan Beredar bukan success/warning/error.
Ini adalah angka netral tapi penting — uang yang sedang berputar.
Gunakan `Corporate Blue #0046B8` sebagai warnanya, bukan hijau/merah/kuning.

Contoh implementasi:
```
KPI Pemasukan     → Success Green  #16A34A
KPI Pengeluaran   → Error Red      #DC2626
KPI Laba/Rugi     → kondisional: hijau jika positif, merah jika negatif
KPI Dana Talangan → Corporate Blue #0046B8  (selalu biru, bukan kondisional)
```

### Usage Ratio

* 60–70% white / mist / surface
* 20–25% navy
* 5–10% action blue
* 1–3% semantic colors

Semantic colors hanya dipakai untuk status, bukan dekorasi utama.

---

## 8. Typography

Gunakan style typography yang terasa modern, clean, dan administratif.

Recommended stack:

```css
font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Mobile Type Scale

* Page title: 22–26px, weight 700–800
* Section title: 16–18px, weight 700
* Card title: 14–16px, weight 600–700
* Body: 13–15px, weight 400–500
* Caption: 11–12px, weight 500
* Numbers/KPI: 20–32px, weight 700–800

### Typography Rules

* Angka finance harus mudah dibaca.
* Heading pakai navy atau ink.
* Body pakai slate.
* Caption pakai cool gray.
* Jangan gunakan terlalu banyak ukuran font.
* Hindari uppercase berlebihan di UI mobile.
* Label harus jelas dan manusiawi.

---

## 9. Layout System

### App Width

Target desain mobile:

```css
max-width: 430px;
margin: 0 auto;
```

### Page Padding

```css
padding: 16px;
```

### Card Padding

```css
padding: 16px;
```

### Spacing Tokens

```css
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
```

### Radius Tokens

```css
sm: 8px
md: 12px
lg: 16px
xl: 20px
full: 999px
```

### Shadow

Gunakan shadow ringan saja:

```css
box-shadow: 0 4px 12px rgba(0, 43, 104, 0.08);
```

Untuk card penting:

```css
box-shadow: 0 12px 32px rgba(0, 43, 104, 0.12);
```

Jangan gunakan shadow terlalu tebal.

---

## 10. Visual Rules

### Border

Kurangi penggunaan border berat.

Gunakan border hanya untuk:

* input
* card penting
* danger zone
* separator halus

Default border:

```css
border: 1px solid #E2E8F0;
```

Jangan gunakan terlalu banyak dashed border.

### Cards

Card harus bersih dan ringan.

Default card:

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 16px;
padding: 16px;
box-shadow: 0 4px 12px rgba(0, 43, 104, 0.08);
```

### Buttons

Primary button:

```css
background: #0B63F6;
color: #FFFFFF;
border-radius: 12px;
height: 52px;
font-weight: 700;
```

Secondary button:

```css
background: #FFFFFF;
color: #002B68;
border: 1px solid #BBD7F5;
border-radius: 12px;
```

Danger button:

```css
background: #DC2626;
color: #FFFFFF;
border-radius: 12px;
```

### Icons

Gunakan outline icons:

* stroke 2px
* rounded cap
* konsisten ukuran
* ukuran nav: 20–24px
* ukuran card: 20–32px

Jangan pakai emoji sebagai icon utama.

---

## 11. Navigation

Gunakan bottom navigation dengan 4 menu:

1. Input
2. Proyek
3. Dashboard
4. Backup

Rules:

* Bottom nav harus fixed atau sticky di bawah container.
* Tinggi sekitar 64–72px.
* Gunakan icon + label.
* Active state memakai Action Blue.
* Inactive state memakai Cool Gray.
* Jangan buat bottom nav seperti empat tombol besar berat.
* Jangan terlalu banyak border.

Contoh behavior:

* User membuka app → default ke Input Cepat.
* Input adalah flow utama harian.
* Proyek untuk monitoring pekerjaan.
* Dashboard untuk ringkasan manajemen.
* Backup untuk keamanan data.

---

## 12. Page 1 — Input Cepat

### Goal

Membuat input transaksi cepat, praktis, dan nyaman dipakai di lapangan.

### Layout Structure

1. Compact header
2. Transaction direction selector
3. Nominal input
4. Quick amount chips
5. Project selector
6. Category selector
7. Transaction type row
8. Notes field
9. Save CTA
10. Recent transaction (1 item terakhir)
11. Bottom nav

### Content

Header:

* Title: `Input Cepat`
* Date chip: `06 Jun 2026`
* Logo/mark kecil: `JPA`

Transaction selector:

* `Masuk`
* `Keluar`

Nominal:

* Main amount: `Rp 250.000`
* Helper: `Ketik nominal atau pilih cepat`
* Quick chips:
  * `50k`
  * `100k`
  * `250k`
  * `500k`
  * `1jt`
  * `5jt`

Project selector:

* `Ops Perusahaan (Umum)`
* Secondary: `Overhead perusahaan`

Or:

* `PRJ-001 · SD NGAWI 7`
* Secondary: `Aktif · Regular`

Category selector:

* `Bayar Vendor`
* `Penerimaan`
* `Ops Proyek`
* `Ops Perusahaan`

Transaction type:

* `Tipe: Pengeluaran`
* Action: `Ubah tipe`

Notes:

* Placeholder: `Tulis catatan di sini...`

CTA:

* `Simpan Transaksi`

### Quick Amount Chips — Implementation Rule

Quick chips memodifikasi nilai state nominal di InputCepat.jsx.
Chips boleh mengubah state lokal nominal.
Chips TIDAK boleh mengubah cara data disimpan ke localStorage.
Format chips adalah shorthand yang di-resolve ke angka penuh:

```
50k   → 50000
100k  → 100000
250k  → 250000
500k  → 500000
1jt   → 1000000
5jt   → 5000000
```

Saat chip di-tap, nominal input langsung berubah ke angka tersebut.
User masih bisa mengedit manual setelah tap chip.

### Toast Specification

Tampilkan toast setelah transaksi berhasil disimpan.

Spesifikasi:

```
Posisi    : di atas bottom navigation (bukan di tengah layar)
Jarak     : 12px dari atas bottom nav
Durasi    : 2 detik, lalu auto-dismiss
Animasi   : slide up saat muncul, fade out saat dismiss
Background: #002B68 (JPA Navy)
Teks      : #FFFFFF
Border    : tidak ada
Border-radius: 12px
Padding   : 12px 20px
Isi teks  : "Transaksi tersimpan ✓"
Icon      : opsional, checkmark outline
```

Setelah toast muncul:

* Form di-reset ke state kosong
* Nominal kembali kosong
* Proyek tetap pada pilihan terakhir (memudahkan input berulang 1 proyek)
* Kategori kembali ke default

### UX Rules

* Jangan pakai label "Override manual".
* Jangan pakai step number panjang.
* Jangan tampilkan terlalu banyak helper text.
* Nominal harus menjadi visual focus.
* CTA harus mudah ditemukan.
* Proyek tetap selected setelah simpan — memudahkan input berulang.

---

## 13. Page 2 — Dashboard Global

### Goal

Memberi ringkasan kondisi keuangan perusahaan dengan cepat dan jelas.

### Layout Structure

1. Header
2. Top summary card
3. KPI grid
4. Cashflow chart
5. Active project summary
6. Ops company summary
7. Insight card
8. Bottom nav

### Header

Title:

`Dashboard`

Subtitle:

`Ringkasan keuangan perusahaan`

### Top Summary Card

Gunakan wording kontekstual berdasarkan kondisi aktual.

Mapping kondisi ke wording:

```
labaRugi > 0 dan ada pemasukan
→ Label  : "Keuangan Sehat"
→ Warna  : Success Green
→ Deskripsi: "Pemasukan lebih besar dari pengeluaran periode ini."

labaRugi < 0 dan ada proyek aktif dengan dana talangan berjalan
→ Label  : "Arus Kas Negatif"
→ Warna  : Warning Amber
→ Deskripsi: "Pengeluaran lebih besar dari pemasukan. Dana talangan sedang berjalan."

labaRugi < 0 dan tidak ada proyek aktif
→ Label  : "Keuangan Defisit"
→ Warna  : Error Red
→ Deskripsi: "Pengeluaran melebihi pemasukan tanpa proyek aktif berjalan."

labaRugi === 0 dan totalMasuk === 0 dan totalKeluar === 0
→ Label  : "Belum Ada Data"
→ Warna  : Cool Gray
→ Deskripsi: "Mulai catat transaksi pertama untuk melihat kondisi keuangan."

labaRugi === 0 dan ada transaksi
→ Label  : "Impas"
→ Warna  : Corporate Blue
→ Deskripsi: "Pemasukan dan pengeluaran seimbang periode ini."
```

Jangan hanya menampilkan kata "RUGI" atau "UNTUNG" tanpa konteks.

### KPI Cards

Empat KPI:

1. Pemasukan → warna Success Green
2. Pengeluaran → warna Error Red
3. Laba/Rugi → hijau jika positif, merah jika negatif
4. Dana Talangan Beredar → warna Corporate Blue (selalu biru)

### Chart

Section:

`Arus Kas Bulanan`

Rules:

* Gunakan Recharts.
* Chart harus sederhana.
* Gunakan warna hijau untuk masuk.
* Gunakan merah untuk keluar.
* Jangan membuat chart terlalu rumit.
* Jika data sedikit (kurang dari 2 bulan ada transaksi), tampilkan low-data state:
  ```
  "Grafik tersedia setelah data 2 bulan terkumpul."
  ```
* Jika tidak ada data sama sekali, tampilkan empty state:
  ```
  "Belum ada data untuk ditampilkan."
  ```

### Ringkasan Proyek Aktif

Tampilkan maksimal 3 proyek aktif, sorted by profit descending.

Jika tidak ada proyek aktif:
```
Empty state: "Tidak ada proyek aktif saat ini."
CTA kecil  : "Lihat semua proyek →"
```

### Ops Perusahaan

Tampilkan:

* Total ops perusahaan
* Kategori terbesar

Contoh:

`Total Pengeluaran: Rp 300.000`
`Kategori Terbesar: Bayar Vendor`

### Insight Card

Insight card menampilkan 1 kalimat kontekstual berdasarkan data aktual.

Rules:

* Selalu tampilkan insight card — jangan sembunyikan meski data kosong.
* Pilih insight dari prioritas berikut (dari atas ke bawah, ambil yang pertama berlaku):

```
Prioritas 1 — Backup belum pernah dilakukan:
→ "Kamu belum pernah backup data. Export backup sekarang untuk keamanan."
→ CTA: "Backup Sekarang →"

Prioritas 2 — Backup lebih dari 7 hari lalu:
→ "Backup terakhir [X hari] lalu. Disarankan backup rutin setiap minggu."
→ CTA: "Backup Sekarang →"

Prioritas 3 — Ada proyek dengan sisa piutang > 0:
→ "Ada [N] proyek dengan pembayaran belum lunas."
→ CTA: "Lihat Proyek →"

Prioritas 4 — Dana talangan beredar > 0:
→ "Dana talangan Rp [X] masih beredar di [N] proyek aktif."

Prioritas 5 — Pengeluaran terbesar dari kategori tertentu:
→ "Pengeluaran terbesar periode ini: [Kategori] sebesar Rp [X]."

Prioritas 6 — Tidak ada transaksi hari ini:
→ "Belum ada transaksi hari ini. Tap Input untuk mulai mencatat."
→ CTA: "Input Sekarang →"

Prioritas 7 — Default jika semua kondisi di atas tidak berlaku:
→ "Semua data tercatat. Pantau terus kondisi keuangan perusahaan."
```

* Jangan tampilkan lebih dari 1 insight sekaligus.
* Insight harus actionable jika memungkinkan — sertakan CTA kecil.

---

## 14. Page 3 — Daftar Proyek

### Goal

Membantu user memantau proyek, nilai pembayaran, progress, dan profit.

### Layout Structure

1. Header
2. Primary CTA
3. Filter chips
4. Project card list
5. Bottom nav

### Header

Title:

`Proyek`

Subtitle:

`Pantau nilai, pembayaran, dan profit.`

### CTA

Button:

`+ Proyek Baru`

### Filter Chips

Status:

* Semua
* Aktif
* Menunggu Bayar
* Selesai

Jenis:

* Semua
* Regular
* Project

Rules:

* Chips harus compact.
* Jangan buat chip terlalu besar seperti tombol blok.
* Active chip pakai Action Blue.
* Inactive chip pakai white/surface.

### Empty State Per Filter

Setiap kombinasi filter yang menghasilkan list kosong harus punya empty state yang spesifik.

```
Filter "Semua" — belum ada proyek sama sekali:
→ Ilustrasi sederhana
→ "Belum ada proyek."
→ "Mulai dengan membuat proyek pertama."
→ CTA: "+ Buat Proyek Pertama"

Filter "Aktif" — tidak ada proyek aktif:
→ "Tidak ada proyek aktif saat ini."
→ CTA: "Lihat semua proyek →"

Filter "Menunggu Bayar" — tidak ada proyek menunggu bayar:
→ "Tidak ada proyek yang menunggu pembayaran."

Filter "Selesai" — belum ada proyek selesai:
→ "Belum ada proyek yang selesai."

Filter "Regular" — tidak ada proyek Regular:
→ "Tidak ada proyek jenis Regular."

Filter "Project" — tidak ada proyek jenis Project:
→ "Tidak ada proyek jenis Project."
```

Jangan tampilkan empty state yang generic ("Tidak ada data") untuk semua kondisi.

### Project Card

Setiap card menampilkan:

* Project name
* Project code
* Client
* Type
* Status badge
* Payment progress bar
* Target/nilai proyek
* Profit summary

Example 1:

`SD NGAWI 7`
`PRJ-001 · Regular · Tut Wuri`
Badge: `Aktif`
`Masuk Rp0 dari Rp5.000.000`
`Profit Bersih Rp0`

Example 2:

`VIDEO KEKAYAAN ALAM MALUKU`
`PRJ-002 · Project · Dinas Pariwisata Provinsi Maluku`
Badge: `Aktif`
`Masuk Rp0 dari Rp50.000.000`
`Profit Bersih Rp0`

### UX Rules

* Project card harus mudah discan.
* Jangan menaruh terlalu banyak data kecil.
* Progress bar harus jelas.
* Profit harus mudah terlihat.
* Card bisa ditap untuk masuk ke detail proyek.

---

## 15. Page 4 — Backup & Pengaturan

### Goal

Membuat user paham bahwa data tersimpan lokal dan backup harus dilakukan rutin.

### Layout Structure

1. Header
2. Backup status card
3. Export/import actions
4. Backup reminder row
5. App info card
6. Danger zone
7. Bottom nav

### Header

Title:

`Backup & Pengaturan`

Subtitle:

`Kelola data lokal dan info aplikasi.`

### Backup Status Card

Title:

`Status Backup`

Value:

`Belum pernah backup`

Or:

`Terakhir: 06 Jun 2026, 08:32`

Reminder:

`Simpan backup rutin ke Google Drive atau folder aman.`

### Backup Actions

Action 1:

`Export Backup (JSON)`
Description: `Simpan file backup ke perangkat`

Action 2:

`Import Backup`
Description: `Pulihkan data dari file backup`

Visual differentiation antara Export dan Import:

```
Export → Primary button style (Action Blue, solid)
Import → Secondary button style (border only, tidak solid)
```

Jangan buat keduanya tampak sama — user harus langsung tahu mana yang simpan dan mana yang pulihkan.

### Reminder Row

`Pengingat backup mingguan`
Status: `Disarankan`

### App Info Card

Rows:

* `Nama Perusahaan` — `CV Juara Pertama Abadi`
* `Versi Aplikasi` — `1.0.0`
* `Storage` — `localStorage`

### Danger Zone

Title:

`Zona Berbahaya`

Warning:

`Tindakan ini akan menghapus semua data lokal dan tidak dapat dibatalkan.`

Button:

`Hapus Semua Data`

Rules:

* Danger zone harus dipisah secara visual — beri jarak besar dari section di atasnya.
* Gunakan red tint background: `#FEF2F2`
* Border: `1px solid #FECACA`
* Tombol hapus harus merah.
* Jangan letakkan danger action terlalu dekat dengan import/export.
* Reset data harus butuh konfirmasi dua langkah:
  * Step 1: tap tombol "Hapus Semua Data"
  * Step 2: muncul bottom sheet, user harus ketik "HAPUS" untuk aktifkan tombol konfirmasi

---

## 16. Component System

Codex harus memecah UI menjadi komponen kecil agar mudah dirawat.

### Required Components

```txt
AppShell
PageHeader
BottomNav
Card
Button
Chip
AmountInput
QuickAmountChips
TransactionDirectionToggle
SelectField
KpiCard
SummaryCard
StatusBanner
ProjectCard
BackupActionCard
DangerZone
InsightCard
Toast
EmptyState
SectionTitle
```

### Component Rules

* Jangan duplikasi style terlalu banyak.
* Buat shared style tokens.
* Pertahankan inline styles jika project saat ini memakai inline styles.
* Jangan migrasi ke Tailwind/CSS framework kecuali diminta.
* Jangan mengubah business logic saat redesign UI.
* Jangan mengubah localStorage keys.
* Jangan mengubah perhitungan finance tanpa alasan jelas.

---

## 17. Data and Storage Constraints

Jangan ubah storage keys:

```txt
jpa_proyek
jpa_transaksi
jpa_settings
```

Jangan migrasi ke backend pada brief ini.

Jangan tambah auth pada Phase 1.

Jangan ubah struktur data besar-besaran.

Fokus brief ini adalah:

* redesign UI
* component cleanup
* microcopy improvement
* layout improvement
* usability improvement

---

## 18. Microcopy Rules

Gunakan bahasa Indonesia yang jelas dan natural.

### Replace Technical Copy

Hindari:

* `Override manual`
* `filter ikut arah`
* `keyboard angka`
* `banner besar`
* `4 kartu ringkas`
* `auto, bisa override`
* `RUGI` tanpa konteks
* `UNTUNG` tanpa konteks

Gunakan:

* `Ubah tipe`
* `Kategori tersedia`
* `Ketik nominal`
* `Ringkasan kondisi`
* `KPI utama`
* `Tipe transaksi`
* `Arus Kas Negatif` dengan deskripsi
* `Keuangan Sehat` dengan deskripsi

### Tone

Microcopy harus:

* jelas
* singkat
* tidak terlalu teknis
* tidak terlalu santai
* cocok untuk admin keuangan

---

## 19. Accessibility and Usability Rules

* Tap target minimal terasa nyaman untuk jari.
* Button utama minimal 48px height.
* Text tidak boleh terlalu kecil.
* Kontras harus jelas.
* Jangan hanya mengandalkan warna untuk status; gunakan label.
* Error message harus spesifik.
* Empty state harus jelas dan spesifik per konteks — jangan generic.
* Loading state harus ada jika diperlukan.
* Reset/delete harus selalu butuh konfirmasi dua langkah.
* Toast harus tidak menghalangi interaksi utama.

---

## 20. Implementation Scope for Codex

### Allowed

* Refactor UI components.
* Improve visual hierarchy.
* Improve spacing.
* Improve card design.
* Improve button/chip styling.
* Improve bottom navigation.
* Improve microcopy.
* Add quick amount chips (modifikasi state nominal saja, bukan localStorage).
* Add toast component dengan spesifikasi di Section 12.
* Add contextual status banner di Dashboard (Section 13).
* Add insight card dengan priority rules di Section 13.
* Add empty state per filter di Daftar Proyek (Section 14).
* Add better empty states di semua halaman.
* Add danger zone styling yang terpisah secara visual.
* Differentiate Export vs Import button style secara visual.
* Improve dashboard layout.
* Improve backup page clarity.

### Not Allowed

* Do not rewrite the whole app.
* Do not migrate to Supabase.
* Do not add authentication.
* Do not change localStorage keys.
* Do not change core finance calculations.
* Do not remove existing pages.
* Do not add complex libraries.
* Do not introduce heavy animation.
* Do not create desktop-only layout.
* Do not modify how data is saved to localStorage via quick chips.

---

## 21. Acceptance Criteria

Redesign is considered successful if:

1. App still runs normally.
2. Existing data in localStorage remains readable.
3. Input Cepat is faster and cleaner.
4. Quick amount chips work correctly and resolve to correct IDR values.
5. Toast appears after save with correct spec (position, duration, style).
6. Dashboard status banner shows contextual wording, not raw RUGI/UNTUNG.
7. Insight card appears with correct priority logic.
8. Project cards are easier to scan.
9. Empty states are specific per filter/context, not generic.
10. Backup page clearly explains local data and backup risk.
11. Export and Import buttons are visually differentiated.
12. Danger zone is visually separated with red tint.
13. Bottom nav feels lighter and more mobile-native.
14. UI follows JPA brand colors including Corporate Blue for Dana Talangan.
15. No major business logic is changed.
16. No localStorage keys are modified.
17. Build passes.
18. Basic manual test passes.

---

## 22. Manual Test Checklist

After implementation, test:

### Input Cepat

* Can switch Masuk/Keluar.
* Can type nominal manually.
* Can tap quick amount chips — verify 50k resolves to 50000, 1jt to 1000000.
* Can select project.
* Can select category.
* Can save transaction.
* Toast appears after save at correct position (above bottom nav).
* Toast auto-dismisses after 2 seconds.
* Form resets after save — nominal cleared, proyek stays selected.
* Saved transaction appears in dashboard/project calculation.

### Dashboard

* KPI numbers render correctly.
* Dana Talangan KPI uses Corporate Blue, not green/red.
* Status banner shows contextual wording (not raw RUGI/UNTUNG).
* Insight card appears with relevant insight based on data state.
* Chart does not break with low data — shows low-data state if < 2 months.
* Active projects appear sorted by profit.
* Ops company section appears.

### Proyek

* Project list appears.
* Filter chips work.
* Each filter shows specific empty state when no results.
* Project card shows progress bar.
* Project card shows profit with correct color (green/red).
* New project button still works.

### Backup

* Export backup works — file downloads with correct filename.
* Export button visually different from Import button.
* Import backup flow still works with two-step confirmation.
* App info appears.
* Danger zone appears at bottom with red tint background.
* Delete/reset requires two-step confirmation (ketik "HAPUS").

---

## 23. Recommended Codex Prompt

Use this prompt when asking Codex to implement the design brief:

```
Read docs/DESIGN_BRIEF.md thoroughly before writing any code.
Also read AGENT.md for business logic constraints.

Implement the UI/UX redesign described in the brief.

Key changes from current version:
1. Add quick amount chips to Input Cepat (modify nominal state only, not localStorage).
2. Add toast component — position above bottom nav, 2s duration, JPA Navy background.
3. Replace raw RUGI/UNTUNG with contextual status banner (see Section 13 for mapping).
4. Add insight card with priority-based logic (see Section 13 for priority rules).
5. Add specific empty states per filter in Daftar Proyek (see Section 14).
6. Use Corporate Blue (#0046B8) for Dana Talangan KPI — not green or red.
7. Visually differentiate Export (solid blue) vs Import (border only) buttons.
8. Separate Danger Zone with red tint background (#FEF2F2).
9. Apply JPA color system and typography as defined in Sections 7–8.
10. Build reusable components: Toast, QuickAmountChips, StatusBanner, InsightCard, EmptyState.

Constraints:
- Do not change localStorage keys: jpa_proyek, jpa_transaksi, jpa_settings.
- Do not change core finance calculations.
- Do not add backend, auth, or cloud sync.
- Keep inline styles — do not migrate to Tailwind.
- Do not rewrite the whole app — refactor UI only.

After implementation:
1. List all files changed.
2. Confirm no storage keys or core calculations were changed.
3. Run build.
4. Provide manual test checklist result.
```

---

## 24. Changelog Brief

```
v1.0 — Initial brief
v1.1 — Updates:
  - Section 7  : Tambah warna Dana Talangan (Corporate Blue #0046B8) + usage rule
  - Section 12 : Tambah Quick Amount Chips implementation rule
  - Section 12 : Tambah Toast Specification (posisi, durasi, animasi, warna, teks)
  - Section 12 : Tambah aturan form reset setelah simpan (proyek tetap selected)
  - Section 13 : Tambah mapping kondisi ke wording kontekstual (5 kondisi)
  - Section 13 : Tambah Insight Card priority rules (7 prioritas)
  - Section 13 : Tambah chart low-data state dan empty state
  - Section 13 : Tambah dashboard empty state untuk proyek aktif
  - Section 14 : Tambah Empty State Per Filter (6 kondisi spesifik)
  - Section 15 : Tambah visual differentiation Export vs Import button
  - Section 16 : Tambah komponen Toast, QuickAmountChips, StatusBanner, EmptyState
  - Section 20 : Update Allowed/Not Allowed sesuai penambahan fitur
  - Section 21 : Update Acceptance Criteria (18 item)
  - Section 22 : Update Manual Test Checklist
  - Section 23 : Update Recommended Codex Prompt
```

---

## 25. Final Direction

The redesign should not chase visual hype. It should make JPA Finance System feel like a reliable internal finance tool:

* fast for daily input
* clear for project cashflow
* safe for local backup
* professional for company use
* simple enough to maintain
* polished enough to trust

The best result is not the most decorative UI.
The best result is the UI that helps JPA record money accurately, understand project cashflow quickly, and avoid losing data.
