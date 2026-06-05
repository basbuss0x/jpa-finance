export const STORAGE_KEYS = {
  proyek: 'jpa_proyek',
  transaksi: 'jpa_transaksi',
  settings: 'jpa_settings',
}

export const ARAH_TRANSAKSI = {
  masuk: 'masuk',
  keluar: 'keluar',
}

export const TIPE_TRANSAKSI = {
  modal: 'modal',
  opsProyek: 'ops_proyek',
  opsPerusahaan: 'ops_perusahaan',
  penerimaan: 'penerimaan',
  pengembalian: 'pengembalian',
}

export const JENIS_PROYEK = {
  project: 'Project',
  regular: 'Regular',
}

export const JENIS_PROYEK_OPTIONS = [
  JENIS_PROYEK.regular,
  JENIS_PROYEK.project,
]

export const SUMBER_PROYEK = {
  siplah: 'SiPLAH',
  nonSiplah: 'Non-SiPLAH',
  lainnya: 'Lainnya',
}

export const SUMBER_PROYEK_OPTIONS = [
  SUMBER_PROYEK.siplah,
  SUMBER_PROYEK.nonSiplah,
  SUMBER_PROYEK.lainnya,
]

export const STATUS_PROYEK = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  menungguBayar: 'Menunggu Bayar',
}

export const STATUS_PROYEK_OPTIONS = [
  STATUS_PROYEK.aktif,
  STATUS_PROYEK.menungguBayar,
  STATUS_PROYEK.selesai,
]

export const KATEGORI = {
  penerimaan: 'Penerimaan',
  bayarVendor: 'Bayar Vendor',
  transportasiBbm: 'Transportasi & BBM',
  angkutLogistik: 'Angkut & Logistik',
  makanKonsumsi: 'Makan & Konsumsi',
  feeKomisi: 'Fee & Komisi',
  meetingEntertain: 'Meeting & Entertain',
  sewa: 'Sewa',
  pinjamanKeluar: 'Pinjaman Keluar',
  lainLain: 'Lain-lain',
}

export const KATEGORI_OPS_PROYEK = [
  KATEGORI.bayarVendor,
  KATEGORI.transportasiBbm,
  KATEGORI.angkutLogistik,
  KATEGORI.makanKonsumsi,
  KATEGORI.feeKomisi,
  KATEGORI.lainLain,
]

export const KATEGORI_OPS_PERUSAHAAN = [
  KATEGORI.meetingEntertain,
  KATEGORI.sewa,
  KATEGORI.pinjamanKeluar,
  KATEGORI.lainLain,
]

export const KATEGORI_MASUK = [
  KATEGORI.penerimaan,
  KATEGORI.lainLain,
]

export const KATEGORI_KELUAR = [
  KATEGORI.bayarVendor,
  KATEGORI.transportasiBbm,
  KATEGORI.angkutLogistik,
  KATEGORI.makanKonsumsi,
  KATEGORI.feeKomisi,
  KATEGORI.meetingEntertain,
  KATEGORI.sewa,
  KATEGORI.pinjamanKeluar,
  KATEGORI.lainLain,
]

export const KATEGORI_BY_ARAH = {
  [ARAH_TRANSAKSI.masuk]: KATEGORI_MASUK,
  [ARAH_TRANSAKSI.keluar]: KATEGORI_KELUAR,
}

export const PROYEK_UMUM_ID = 'UMUM'

export const DEFAULT_SETTINGS = {
  namaPerusahaan: 'CV Juara Pertama Abadi',
  versi: '1.0.0',
  lastBackup: null,
}
