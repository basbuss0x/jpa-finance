import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants'

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

const escapeCell = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const renderTable = (title, headers, rows) => `
  <h2>${escapeCell(title)}</h2>
  <table>
    <thead>
      <tr>${headers.map((item) => `<th>${escapeCell(item)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${headers
              .map((header) => `<td>${escapeCell(row[header])}</td>`)
              .join('')}</tr>`
        )
        .join('')}
    </tbody>
  </table>
`

export const exportExcel = () => {
  const exportedAt = new Date().toISOString()
  const proyek = getProyek()
  const transaksi = getTransaksi()
  const settings = getSettings()

  const proyekRows = proyek.map((item) => ({
    Kode: item.id,
    Jenis: item.jenis,
    'Nama Proyek': item.nama,
    Klien: item.klien,
    Sumber: item.sumber,
    Status: item.status,
    'Nilai Pesanan': item.nilaiPesanan,
    'Potongan Ops Perusahaan': item.potOpsPerush,
    'Tanggal Mulai': item.tanggalMulai,
    Catatan: item.catatan,
  }))

  const transaksiRows = transaksi.map((item) => ({
    ID: item.id,
    'Kode Proyek': item.proyekId,
    Tanggal: item.tanggal,
    Arah: item.arah,
    Tipe: item.tipe,
    Kategori: item.kategori,
    Nominal: item.nominal,
    Catatan: item.catatan,
  }))

  const settingsRows = [
    { Key: 'Nama Perusahaan', Value: settings.namaPerusahaan },
    { Key: 'Versi', Value: settings.versi },
    { Key: 'Last Backup', Value: settings.lastBackup },
    { Key: 'Exported At', Value: exportedAt },
  ]

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { color: #002B68; }
      h2 { margin-top: 24px; color: #111827; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
      th { background: #EAF3FF; color: #111827; font-weight: 700; }
      th, td { border: 1px solid #BBD7F5; padding: 8px; mso-number-format: "\\@"; }
    </style>
  </head>
  <body>
    <h1>JPA Finance System</h1>
    <p>Export Excel dibuat pada ${escapeCell(exportedAt)}</p>
    ${renderTable('Proyek', [
      'Kode',
      'Jenis',
      'Nama Proyek',
      'Klien',
      'Sumber',
      'Status',
      'Nilai Pesanan',
      'Potongan Ops Perusahaan',
      'Tanggal Mulai',
      'Catatan',
    ], proyekRows)}
    ${renderTable('Transaksi', [
      'ID',
      'Kode Proyek',
      'Tanggal',
      'Arah',
      'Tipe',
      'Kategori',
      'Nominal',
      'Catatan',
    ], transaksiRows)}
    ${renderTable('Settings', ['Key', 'Value'], settingsRows)}
  </body>
</html>`

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `jpa-finance-report-${exportedAt.slice(0, 10)}.xls`
  link.click()
  URL.revokeObjectURL(url)
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
