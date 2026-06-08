# Backlog — JPA Finance System

Daftar fitur, perbaikan, dan rencana pengembangan per versi.
Update file ini setiap kali ada keputusan baru atau item selesai dikerjakan.

---

## Status Legend

```
[ ] → Belum dikerjakan
[~] → Sedang dikerjakan
[x] → Selesai
[-] → Dibatalkan / tidak jadi
```

---

## v1.2.0 — UI Redesign + Polish
> Target: setelah v1.1.0 deploy dan stabil
> Branch: feature/ui-redesign-v1.2
> Referensi: docs/DESIGN_BRIEF.md v1.1

### Must Have

- [x] Terapkan JPA color system (Section 7 DESIGN_BRIEF)
      Navy #002B68, Action Blue #0B63F6, semantic colors
- [x] Terapkan typography scale (Section 8 DESIGN_BRIEF)
      Plus Jakarta Sans / Inter, mobile type scale
- [x] Refactor card, button, chip ke style baru (Section 10)
- [x] Redesign bottom navigation — lebih ringan, mobile-native (Section 11)
- [x] Input Cepat — quick amount chips (50k, 100k, 250k, 500k, 1jt, 5jt)
      Modifikasi state nominal saja, TIDAK mengubah localStorage
- [x] Input Cepat — toast component setelah simpan
      Posisi di atas bottom nav, duration 2s, JPA Navy background
- [x] Input Cepat — form reset setelah simpan (proyek tetap selected)
- [x] Dashboard — contextual status banner
      Ganti raw RUGI/UNTUNG dengan wording kontekstual (5 kondisi)
- [x] Dashboard — insight card dengan 7 priority rules
- [x] Dashboard — Dana Talangan KPI pakai Corporate Blue #0046B8
- [x] Dashboard — grafik arus kas tampil sejak bulan pertama transaksi
- [x] Daftar Proyek — empty state spesifik per filter (6 kondisi)
- [x] Backup — visual differentiation Export (solid) vs Import (border)
- [x] Backup — Danger Zone dengan red tint background (#FEF2F2)
- [x] Bangun komponen reusable:
      Toast, QuickAmountChips, StatusBanner, InsightCard, EmptyState

### Nice to Have

- [x] Export data ke Excel (.xlsx) — halaman Backup
      Sheet 1: Semua Transaksi
      Sheet 2: Ringkasan per Proyek
      Sheet 3: Dashboard summary
- [x] Screenshot before/after untuk dokumentasi (docs/screenshots/)
- [x] Detail Proyek — improve layout ringkasan keuangan
- [x] Input Cepat — animasi ringan saat toggle Masuk/Keluar
- [x] Dashboard — Histori Transaksi Global dengan search, filter, sort, dan compact preview
- [x] App-wide motion polish ringan dengan dukungan `prefers-reduced-motion`
- [x] Build polish — split async chunk Excel agar `npm run build` bersih tanpa warning

### Out of Scope v1.2.0

- Migrasi ke Supabase
- Login / autentikasi
- Multi-user
- Laporan pajak
- Integrasi SiPLAH API

---

## v2.0.0 — Cloud Storage
> Target: setelah rekrut karyawan keuangan / akuntan
> Trigger: saat localStorage dirasa tidak cukup aman

- [ ] Migrasi storage dari localStorage ke Supabase
- [ ] Data tidak hilang saat ganti HP atau clear browser
- [ ] Setup Supabase project + tabel (proyek, transaksi, settings)
- [ ] Update store.js — ganti localStorage calls ke Supabase queries
- [ ] Tetap offline-capable — queue transaksi saat tidak ada internet
- [ ] Update README dan AGENT.md

---

## v3.0.0 — Multi User & Role Management
> Target: setelah v2.0.0 stabil dan tim keuangan bertambah

- [ ] Login sederhana (email + password via Supabase Auth)
- [ ] Role: Pengelola (input + lihat), Direktur (lihat semua), Akuntan (lihat + export)
- [ ] Setiap user punya akses sesuai role
- [ ] Activity log — siapa input apa kapan
- [ ] Update AGENT.md dengan skema multi-user

---

## v4.0.0 — Laporan Pajak
> Target: sebelum periode pelaporan pajak tahunan

- [ ] Rekap PPh 21 (karyawan)
- [ ] Rekap PPh 23 (jasa/sewa)
- [ ] Rekap PPN
- [ ] Rekap PPh Badan tahunan
- [ ] Export laporan ke format yang bisa diserahkan ke akuntan

---

## v5.0.0 — Integrasi & Otomasi
> Target: jangka panjang, setelah semua fase sebelumnya stabil

- [ ] Integrasi SiPLAH API — tarik data pesanan otomatis
- [ ] Notifikasi jatuh tempo pembayaran
- [ ] Auto-reminder backup via notifikasi browser
- [ ] Export invoice / kwitansi langsung dari app

---

## Ide & Catatan (belum masuk versi)

> Tempat menampung ide yang belum diputuskan masuk versi mana.

- Fitur pencarian transaksi (search by deskripsi/kategori/nominal) — selesai untuk Detail Proyek dan Dashboard Global
- Filter transaksi by rentang tanggal — selesai untuk Detail Proyek dan Dashboard Global
- Ringkasan per bulan di halaman terpisah
- Dark mode (low priority)
- PWA / installable app (Add to Home Screen)
- Print / cetak laporan langsung dari HP

---

*BACKLOG.md — JPA Finance System | CV Juara Pertama Abadi*
*Update file ini setiap sprint atau saat ada keputusan baru.*
