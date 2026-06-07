import {
  ARAH_TRANSAKSI,
  DEFAULT_SETTINGS,
  JENIS_PROYEK,
  PROYEK_UMUM_ID,
  STATUS_PROYEK,
  STORAGE_KEYS,
  TIPE_TRANSAKSI,
} from './constants'
import { hitungProyek, sumNominalByTipe } from './utils'

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const getProyek = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.proyek), [])

export const getTransaksi = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.transaksi), [])

export const getSettings = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.settings), DEFAULT_SETTINGS)

export const saveProyek = (data) =>
  localStorage.setItem(STORAGE_KEYS.proyek, JSON.stringify(data))

export const saveTransaksi = (data) =>
  localStorage.setItem(STORAGE_KEYS.transaksi, JSON.stringify(data))

export const saveSettings = (data) =>
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data))

export const addProyek = (item) => saveProyek([...getProyek(), item])

export const addTransaksi = (item) => saveTransaksi([...getTransaksi(), item])

export const deleteTransaksi = (id) =>
  saveTransaksi(getTransaksi().filter((item) => item.id !== id))

export const deleteProyek = (id) => {
  saveProyek(getProyek().filter((item) => item.id !== id))
  saveTransaksi(getTransaksi().filter((item) => item.proyekId !== id))
}

export const exportBackup = () => {
  const exportedAt = new Date().toISOString()
  const payload = {
    proyek: getProyek(),
    transaksi: getTransaksi(),
    settings: getSettings(),
    exportedAt,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `jpa-backup-${exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)

  saveSettings({ ...getSettings(), lastBackup: exportedAt })
}

const numberValue = (value) => Number(value) || 0

const sumNominalByArah = (transaksi = [], arah) =>
  transaksi
    .filter((item) => item.arah === arah)
    .reduce((sum, item) => sum + numberValue(item.nominal), 0)

const normalizeProyekId = (value) => String(value || '')

const isCurrentProjectCode = (value) =>
  /^(REG|PRJ)-\d{4}-\d{3,}$/.test(normalizeProyekId(value))

const sheetFromRows = (XLSX, rows, columns, options = {}) => {
  const headers = columns.map((item) => item.header)
  const data = rows.map((row) => columns.map((item) => row[item.key] ?? ''))
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  worksheet['!cols'] = columns.map((item) => ({ wch: item.width || 16 }))
  if (rows.length > 0) {
    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: rows.length, c: columns.length - 1 },
      }),
    }
  }

  const border = {
    top: { style: 'thin', color: { rgb: 'BBD7F5' } },
    bottom: { style: 'thin', color: { rgb: 'BBD7F5' } },
    left: { style: 'thin', color: { rgb: 'BBD7F5' } },
    right: { style: 'thin', color: { rgb: 'BBD7F5' } },
  }

  columns.forEach((column, colIndex) => {
    const headerRef = XLSX.utils.encode_cell({ r: 0, c: colIndex })
    if (worksheet[headerRef]) {
      worksheet[headerRef].s = {
        fill: { fgColor: { rgb: '0046B8' } },
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border,
      }
    }

    for (let rowIndex = 1; rowIndex <= rows.length; rowIndex += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
      const format =
        typeof column.format === 'function' ? column.format(rows[rowIndex - 1]) : column.format
      if (!worksheet[cellRef]) continue
      const status = String(rows[rowIndex - 1]?.status || '').toUpperCase()
      const statusFill =
        column.key === 'status' && ['PASS', 'OK', 'UNTUNG', 'AKTIF'].includes(status)
          ? 'DCFCE7'
          : column.key === 'status' && ['CHECK', 'REVIEW', 'RUGI'].includes(status)
            ? 'FEE2E2'
            : column.key === 'status' && ['INFO', 'MONITOR', 'STAGNAN'].includes(status)
              ? 'FEF3C7'
              : 'FFFFFF'
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: statusFill } },
        font: { color: { rgb: '111827' } },
        alignment: { vertical: 'top', wrapText: true },
        border,
      }
      if (format) {
        worksheet[cellRef].z = format
        worksheet[cellRef].s.numFmt = format
      }
    }
  })

  worksheet['!rows'] = [{ hpt: 24 }]
  worksheet['!freeze'] = options.freeze || { xSplit: 0, ySplit: 1 }
  return worksheet
}

const appendSheet = (workbook, name, rows, columns, options) => {
  const XLSX = workbook.__xlsx
  XLSX.utils.book_append_sheet(workbook, sheetFromRows(XLSX, rows, columns, options), name)
}

const projectColumns = [
  { key: 'kode', header: 'Kode Proyek', width: 18 },
  { key: 'jenis', header: 'Jenis', width: 12 },
  { key: 'nama', header: 'Nama Proyek', width: 34 },
  { key: 'klien', header: 'Klien', width: 28 },
  { key: 'sumber', header: 'Sumber', width: 14 },
  { key: 'status', header: 'Status', width: 18 },
  { key: 'nilaiPesanan', header: 'Nilai Pesanan', width: 18, format: '"Rp"#,##0' },
  { key: 'totalModal', header: 'Total Modal', width: 18, format: '"Rp"#,##0' },
  { key: 'totalOps', header: 'Total Ops Proyek', width: 18, format: '"Rp"#,##0' },
  { key: 'potOps', header: 'Pot Ops Perusahaan', width: 20, format: '"Rp"#,##0' },
  { key: 'totalMasuk', header: 'Total Masuk', width: 18, format: '"Rp"#,##0' },
  { key: 'totalBiaya', header: 'Total Biaya', width: 18, format: '"Rp"#,##0' },
  { key: 'profitBersih', header: 'Profit Bersih', width: 18, format: '"Rp"#,##0' },
  { key: 'sisaPiutang', header: 'Sisa Piutang', width: 18, format: '"Rp"#,##0' },
  { key: 'progressPct', header: 'Progress Bayar', width: 16, format: '0%' },
  { key: 'sudahBalikModal', header: 'Balik Modal?', width: 14 },
  { key: 'tanggalMulai', header: 'Tanggal Mulai', width: 16 },
  { key: 'catatan', header: 'Catatan', width: 34 },
]

const transactionColumns = [
  { key: 'id', header: 'ID Transaksi', width: 18 },
  { key: 'kodeProyek', header: 'Kode Proyek', width: 18 },
  { key: 'namaProyek', header: 'Nama Proyek', width: 34 },
  { key: 'klien', header: 'Klien', width: 26 },
  { key: 'jenisProyek', header: 'Jenis Proyek', width: 14 },
  { key: 'tanggal', header: 'Tanggal', width: 14 },
  { key: 'arah', header: 'Arah', width: 12 },
  { key: 'tipe', header: 'Tipe', width: 20 },
  { key: 'kategori', header: 'Kategori', width: 24 },
  { key: 'nominal', header: 'Nominal', width: 18, format: '"Rp"#,##0' },
  { key: 'catatan', header: 'Catatan', width: 36 },
]

const dashboardColumns = [
  { key: 'kpi', header: 'KPI', width: 34 },
  {
    key: 'nilai',
    header: 'Nilai',
    width: 20,
    format: (row) => (row.format === 'count' ? '0' : '"Rp"#,##0'),
  },
  { key: 'status', header: 'Status', width: 18 },
  { key: 'catatan', header: 'Catatan', width: 54 },
]

const summaryColumns = [
  { key: 'jenis', header: 'Jenis', width: 12 },
  { key: 'jumlahProyek', header: 'Jumlah Proyek', width: 16 },
  { key: 'aktif', header: 'Aktif', width: 12 },
  { key: 'nilaiPesanan', header: 'Nilai Pesanan', width: 18, format: '"Rp"#,##0' },
  { key: 'totalMasuk', header: 'Total Masuk', width: 18, format: '"Rp"#,##0' },
  { key: 'totalBiaya', header: 'Total Biaya', width: 18, format: '"Rp"#,##0' },
  { key: 'profitBersih', header: 'Profit Bersih', width: 18, format: '"Rp"#,##0' },
  { key: 'sisaPiutang', header: 'Sisa Piutang', width: 18, format: '"Rp"#,##0' },
]

const qaColumns = [
  { key: 'check', header: 'Check', width: 42 },
  { key: 'hasil', header: 'Hasil', width: 14 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'risiko', header: 'Risiko', width: 44 },
  { key: 'saran', header: 'Saran Perbaikan', width: 52 },
]

const settingsColumns = [
  { key: 'key', header: 'Key', width: 24 },
  { key: 'value', header: 'Value', width: 60 },
]

export const exportExcel = async () => {
  const XLSX = await import('xlsx-js-style')
  const exportedAt = new Date().toISOString()
  const proyek = getProyek()
  const transaksi = getTransaksi()
  const settings = getSettings()

  const proyekById = new Map(proyek.map((item) => [item.id, item]))
  const proyekRows = proyek.map((item) => {
    const summary = hitungProyek(item, transaksi)
    return {
      kode: item.id,
      jenis: item.jenis,
      nama: item.nama,
      klien: item.klien,
      sumber: item.sumber,
      status: item.status,
      nilaiPesanan: numberValue(item.nilaiPesanan),
      totalModal: summary.totalModal,
      totalOps: summary.totalOps,
      potOps: summary.potOps,
      totalMasuk: summary.totalMasuk,
      totalBiaya: summary.totalBiaya,
      profitBersih: summary.profitBersih,
      sisaPiutang: summary.sisaPiutang,
      progressPct: summary.progressPct / 100,
      sudahBalikModal: summary.sudahBalikModal ? 'Ya' : 'Belum',
      tanggalMulai: item.tanggalMulai,
      catatan: item.catatan,
    }
  })

  const transaksiRows = transaksi.map((item) => {
    const relatedProyek = proyekById.get(item.proyekId)
    return {
      id: item.id,
      kodeProyek: item.proyekId,
      namaProyek:
        item.proyekId === PROYEK_UMUM_ID
          ? 'Ops Perusahaan (Umum)'
          : relatedProyek?.nama || 'Proyek tidak ditemukan',
      klien: relatedProyek?.klien || '',
      jenisProyek: relatedProyek?.jenis || (item.proyekId === PROYEK_UMUM_ID ? 'Umum' : ''),
      tanggal: item.tanggal,
      arah: item.arah,
      tipe: item.tipe,
      kategori: item.kategori,
      nominal: numberValue(item.nominal),
      catatan: item.catatan,
    }
  })

  const totalPemasukan = sumNominalByArah(transaksi, ARAH_TRANSAKSI.masuk)
  const totalPengeluaran = sumNominalByArah(transaksi, ARAH_TRANSAKSI.keluar)
  const labaRugi = totalPemasukan - totalPengeluaran
  const totalDanaTalangan = sumNominalByTipe(transaksi, TIPE_TRANSAKSI.modal)
  const totalPengembalian = sumNominalByTipe(transaksi, TIPE_TRANSAKSI.pengembalian)
  const danaBeredar = totalDanaTalangan - totalPengembalian
  const totalProfitRegular = proyekRows
    .filter((item) => item.jenis === JENIS_PROYEK.regular)
    .reduce((sum, item) => sum + item.profitBersih, 0)
  const totalProfitProject = proyekRows
    .filter((item) => item.jenis === JENIS_PROYEK.project)
    .reduce((sum, item) => sum + item.profitBersih, 0)
  const activeProjects = proyek.filter((item) => item.status === STATUS_PROYEK.aktif).length

  const dashboardRows = [
    {
      kpi: 'Total Pemasukan',
      nilai: totalPemasukan,
      status: totalPemasukan > 0 ? 'OK' : 'Cek',
      catatan: 'Semua transaksi arah masuk.',
    },
    {
      kpi: 'Total Pengeluaran',
      nilai: totalPengeluaran,
      status: totalPengeluaran >= 0 ? 'OK' : 'Cek',
      catatan: 'Semua transaksi arah keluar.',
    },
    {
      kpi: 'Laba/Rugi',
      nilai: labaRugi,
      status: labaRugi > 0 ? 'Untung' : labaRugi < 0 ? 'Rugi' : 'Stagnan',
      catatan: 'Total pemasukan dikurangi total pengeluaran.',
    },
    {
      kpi: 'Dana Talangan Beredar',
      nilai: danaBeredar,
      status: danaBeredar > 0 ? 'Monitor' : 'OK',
      catatan: 'Modal keluar dikurangi pengembalian.',
    },
    {
      kpi: 'Jumlah Proyek Aktif',
      nilai: activeProjects,
      format: 'count',
      status: activeProjects > 0 ? 'Aktif' : 'Kosong',
      catatan: 'Jumlah proyek dengan status Aktif.',
    },
    {
      kpi: 'Profit Regular',
      nilai: totalProfitRegular,
      status: totalProfitRegular >= 0 ? 'OK' : 'Review',
      catatan: 'Akumulasi profit bersih proyek jenis Regular.',
    },
    {
      kpi: 'Profit Project',
      nilai: totalProfitProject,
      status: totalProfitProject >= 0 ? 'OK' : 'Review',
      catatan: 'Akumulasi profit bersih proyek jenis Project.',
    },
  ]

  const summaryRows = [JENIS_PROYEK.regular, JENIS_PROYEK.project].map((jenis) => {
    const rows = proyekRows.filter((item) => item.jenis === jenis)
    return {
      jenis,
      jumlahProyek: rows.length,
      aktif: rows.filter((item) => item.status === STATUS_PROYEK.aktif).length,
      nilaiPesanan: rows.reduce((sum, item) => sum + item.nilaiPesanan, 0),
      totalMasuk: rows.reduce((sum, item) => sum + item.totalMasuk, 0),
      totalBiaya: rows.reduce((sum, item) => sum + item.totalBiaya, 0),
      profitBersih: rows.reduce((sum, item) => sum + item.profitBersih, 0),
      sisaPiutang: rows.reduce((sum, item) => sum + item.sisaPiutang, 0),
    }
  })

  const missingProjectCount = transaksi.filter(
    (item) => item.proyekId !== PROYEK_UMUM_ID && !proyekById.has(item.proyekId)
  ).length
  const zeroNominalCount = transaksi.filter((item) => numberValue(item.nominal) <= 0).length
  const projectWithoutTxCount = proyek.filter(
    (item) => !transaksi.some((tx) => tx.proyekId === item.id)
  ).length
  const legacyCodeCount = proyek.filter((item) => !isCurrentProjectCode(item.id)).length

  const qaRows = [
    {
      check: 'Transaksi dengan proyek tidak ditemukan',
      hasil: missingProjectCount,
      status: missingProjectCount === 0 ? 'PASS' : 'CHECK',
      risiko: 'Transaksi tidak masuk ke ringkasan proyek yang benar.',
      saran: 'Periksa kode proyek pada transaksi atau buat ulang proyek yang hilang.',
    },
    {
      check: 'Transaksi nominal nol/kosong',
      hasil: zeroNominalCount,
      status: zeroNominalCount === 0 ? 'PASS' : 'CHECK',
      risiko: 'Laporan kas dan profit bisa tidak akurat.',
      saran: 'Edit atau hapus transaksi dengan nominal tidak valid.',
    },
    {
      check: 'Proyek tanpa transaksi',
      hasil: projectWithoutTxCount,
      status: projectWithoutTxCount === 0 ? 'PASS' : 'REVIEW',
      risiko: 'Proyek aktif mungkin belum mulai dicatat.',
      saran: 'Jika proyek sudah berjalan, mulai catat penerimaan/modal/ops proyek.',
    },
    {
      check: 'Kode proyek belum format REG/PRJ-YYYY-###',
      hasil: legacyCodeCount,
      status: legacyCodeCount === 0 ? 'PASS' : 'INFO',
      risiko: 'Data lama tetap valid, tapi format kode tidak seragam dengan standar baru.',
      saran: 'Tidak perlu migrasi otomatis. Gunakan format baru untuk proyek berikutnya.',
    },
  ]

  const settingsRows = [
    { key: 'Nama Perusahaan', value: settings.namaPerusahaan },
    { key: 'Versi App', value: settings.versi },
    { key: 'Last Backup', value: settings.lastBackup || '' },
    { key: 'Exported At', value: exportedAt },
    { key: 'Sumber Data', value: 'localStorage: jpa_proyek, jpa_transaksi, jpa_settings' },
    { key: 'Catatan', value: 'Workbook dibuat otomatis dari flow app JPA Finance System.' },
  ]

  const workbook = XLSX.utils.book_new()
  workbook.__xlsx = XLSX
  workbook.Props = {
    Title: 'JPA Finance System Report',
    Subject: 'Ringkasan profesional JPA Finance',
    Author: settings.namaPerusahaan || DEFAULT_SETTINGS.namaPerusahaan,
    CreatedDate: new Date(exportedAt),
  }

  appendSheet(workbook, 'Dashboard', dashboardRows, dashboardColumns)
  appendSheet(workbook, 'Proyek', proyekRows, projectColumns)
  appendSheet(workbook, 'Transaksi', transaksiRows, transactionColumns)
  appendSheet(
    workbook,
    'Kas_Masuk',
    transaksiRows.filter((item) => item.arah === ARAH_TRANSAKSI.masuk),
    transactionColumns
  )
  appendSheet(
    workbook,
    'Kas_Keluar',
    transaksiRows.filter((item) => item.arah === ARAH_TRANSAKSI.keluar),
    transactionColumns
  )
  appendSheet(workbook, 'Ringkasan_REG_PRJ', summaryRows, summaryColumns)
  appendSheet(workbook, 'QA_Checks', qaRows, qaColumns)
  appendSheet(workbook, 'Settings', settingsRows, settingsColumns)
  delete workbook.__xlsx

  XLSX.writeFile(workbook, `jpa-finance-report-${exportedAt.slice(0, 10)}.xlsx`, {
    bookType: 'xlsx',
    compression: true,
  })
}

export const importBackup = (payload) => {
  saveProyek(Array.isArray(payload?.proyek) ? payload.proyek : [])
  saveTransaksi(Array.isArray(payload?.transaksi) ? payload.transaksi : [])
  saveSettings({ ...DEFAULT_SETTINGS, ...(payload?.settings || {}) })
}

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.proyek)
  localStorage.removeItem(STORAGE_KEYS.transaksi)
  localStorage.removeItem(STORAGE_KEYS.settings)
}
