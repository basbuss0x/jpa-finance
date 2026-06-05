# Changelog — JPA Finance System

Semua perubahan signifikan pada project ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versi mengikuti [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

---

## Cara Mengisi Changelog

Setiap kali ada perubahan, tambahkan entry di bawah `[Unreleased]`.
Saat release, ubah `[Unreleased]` menjadi versi + tanggal.

Kategori yang dipakai:
- `Added` — fitur baru
- `Changed` — perubahan pada fitur yang sudah ada
- `Fixed` — perbaikan bug
- `Removed` — fitur yang dihapus
- `Decision` — keputusan desain/arsitektur yang disepakati
- `Note` — catatan penting untuk developer

---

## [1.1.0] — 5 Juni 2026

> Phase 1 build fungsional + Visual QA + UX polish awal.

### Added
- `src/constants.js` — konstanta kategori, status, tipe transaksi, jenis proyek, sumber proyek, storage keys, dan default settings untuk Phase 1 build.
- `src/utils.js` — helper format IDR, format singkat, generate ID proyek, dan kalkulasi ringkasan keuangan per proyek.
- `src/store.js` — fungsi baca/tulis localStorage, tambah/hapus data, export/import backup, dan reset semua data.
- `src/pages/InputCepat.jsx` — halaman utama input transaksi cepat dengan data localStorage, validasi minimal, auto-assign tipe, override manual, format IDR, simpan transaksi, reset form, dan toast.
- `src/pages/DaftarProyek.jsx` — halaman daftar proyek berbasis localStorage dengan filter status/jenis, ringkasan progress pembayaran, profit bersih per proyek, empty state, dan form tambah proyek full-page.
- `src/pages/DetailProyek.jsx` — halaman detail proyek berbasis localStorage dengan header proyek, ringkasan keuangan computed, potongan ops manual autosave, progress pembayaran, histori transaksi, hapus transaksi via bottom sheet, toast, empty state, dan edit proyek full-page.
- `src/pages/Dashboard.jsx` — dashboard global berbasis localStorage dengan KPI utama, kondisi perusahaan, margin, pembagian Regular/Project, grafik arus kas bulanan, ringkasan proyek aktif, ops perusahaan, dan empty state.
- `src/pages/Pengaturan.jsx` — halaman pengaturan fungsional dengan export backup JSON, import backup JSON dua langkah, reset semua data dengan konfirmasi HAPUS, edit nama perusahaan, info app, dan toast.
- `src/App.jsx` — routing utama antar halaman dengan sinkronisasi query string, bottom navigation, tanggal input cepat bersama, dan selected proyek ID untuk membuka Detail Proyek dari card yang ditap.
- Visual QA complete — semua halaman utama dicek di mobile app frame dan browser smoke test.
- UX Polish — warna status/aksi, spacing, tap area, inputMode, active state bottom navigation, dan toast diperbaiki untuk pemakaian lapangan.
- Skenario lapangan A passed — proyek baru, transaksi modal/ops/penerimaan bertahap, potongan ops manual, status selesai, dan dashboard terverifikasi.
- Skenario lapangan B partial — export effect, reset data 2 langkah, dan empty state passed; restore upload perlu verifikasi manual karena in-app browser tidak mendukung file download/upload automation.

### Fixed
- Progress bar proyek memakai warna berbeda untuk lunas dan belum lunas.
- Label profit/rugi proyek dan transaksi masuk/keluar memakai warna hijau/merah.
- Badge status proyek memakai warna Aktif, Menunggu Bayar, dan Selesai.
- Toast Input Cepat dipindah fixed di atas bottom navigation agar tidak mengganggu nav.
- Tombol aksi kecil pada histori transaksi dinaikkan ke tap target 48px.
- Form Edit Proyek ditambah zona bahaya hapus proyek dengan konfirmasi 2 langkah ketik `HAPUS`.
- Dashboard ditambah warna kondisi perusahaan, label periode KPI, dan warna grafik Masuk/Keluar.
- App shell dan shared UI dipoles mengikuti palette `AGENT.md` Section 13.

---

## [1.0.0] — Fase Perancangan — Juni 2025

### Added
- `AGENT.md` — instruksi teknis lengkap untuk Codex/Claude Code
- `README.md` — dokumentasi setup, cara pakai, dan struktur project
- `JPA-Finance-Build-Docs.docx` — dokumen konteks bisnis untuk manajemen
- Wireframe 10 halaman:
  - Input Cepat (dengan mode Referensi Visual)
  - Daftar Proyek (filter status + jenis transaksi)
  - Detail Proyek (ringkasan keuangan + histori transaksi)
  - Dashboard Global (KPI + grafik + kondisi perusahaan)
  - Pengaturan & Backup
  - Form Tambah Proyek
  - Form Edit Proyek (termasuk zona bahaya)
  - Empty State (3 varian: Daftar Proyek, Dashboard, Histori Transaksi)
  - Flow Konfirmasi Hapus Transaksi (bottom sheet + toast)
  - Flow Konfirmasi Hapus Proyek (bottom sheet + input HAPUS + toast)

### Decision
- **Storage:** localStorage untuk Phase 1 — cepat dibangun, tidak perlu server
- **Auth:** tidak ada login untuk Phase 1 — single user, simplifikasi awal
- **Terminologi universal:** tidak pakai nama orang — siap untuk multi-user nanti
  - "Dana Talangan" bukan "Modal Wakdir"
  - "Penyetor Dana" bukan nama spesifik
- **Potongan Ops Perusahaan:** input manual per proyek, bukan persentase otomatis
- **Tipe transaksi:** auto-assign dari kombinasi arah + kategori, bisa di-override
- **Jenis proyek:** Regular (pengadaan berulang) vs Project (kerja khusus)
- **Konfirmasi hapus:** 2 langkah — tap tombol → ketik "HAPUS" → konfirmasi
- **Navigasi halaman:** bottom navigation 4 tab (Input, Proyek, Dashboard, Backup)
- **Form baru vs modal:** semua form tampil sebagai halaman penuh, bukan popup

### Note
- Wireframe dibuat dalam grayscale — warna final mengikuti palette di `AGENT.md` Section 13
- Tombol "Konfirmasi Hapus Proyek" harus disabled (abu-abu) sampai user ketik persis "HAPUS"
- Field Tipe di Input Cepat: auto-assign, tidak ditampilkan kecuali user tap "override manual"
- Status proyek baru default otomatis "Aktif" — tidak ada field status di form Tambah Proyek

---

## Template Entry (copy saat butuh)

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

### Decision
- 

### Note
- 
```

---

## Roadmap Versi

| Versi | Scope | Target |
|---|---|---|
| `1.0.0` | Fase perancangan selesai | ✅ Juni 2025 |
| `1.1.0` | Phase 1 build selesai — semua halaman fungsional | 🔨 In Progress |
| `1.2.0` | Bug fixes + polish UI setelah testing lapangan | 📋 Planned |
| `2.0.0` | Migrasi ke Supabase (Phase 2) | 📋 Planned |
| `3.0.0` | Multi-user + role management (Phase 3) | 📋 Planned |

---

*JPA Finance System — CV Juara Pertama Abadi, Ambon, Maluku*
