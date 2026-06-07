import { JENIS_PROYEK, TIPE_TRANSAKSI } from './constants'

export const fmtIDR = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0)

export const fmtShort = (n) => {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}Rb`
  return String(n)
}

export const generateProyekId = (
  existingProyek = [],
  jenis = JENIS_PROYEK.project,
  date = new Date()
) => {
  const typePrefix = jenis === JENIS_PROYEK.regular ? 'REG' : 'PRJ'
  const year = date.getFullYear()
  const prefix = `${typePrefix}-${year}`
  const nextNumber =
    existingProyek.reduce((max, item) => {
      const match = String(item.id || '').match(new RegExp(`^${prefix}-(\\d+)$`))
      return match ? Math.max(max, Number(match[1]) || 0) : max
    }, 0) + 1
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`
}

export const sumNominalByTipe = (transaksi = [], tipe) =>
  transaksi
    .filter((item) => item.tipe === tipe)
    .reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)

export const hitungProyek = (proyek, transaksi = []) => {
  const tx = transaksi.filter((item) => item.proyekId === proyek.id)
  const totalModal = sumNominalByTipe(tx, TIPE_TRANSAKSI.modal)
  const totalOps = sumNominalByTipe(tx, TIPE_TRANSAKSI.opsProyek)
  const totalMasuk = sumNominalByTipe(tx, TIPE_TRANSAKSI.penerimaan)
  const potOps = Number(proyek.potOpsPerush) || 0
  const nilaiPesanan = Number(proyek.nilaiPesanan) || 0

  const totalBiaya = totalModal + totalOps + potOps
  const profitBersih = totalMasuk - totalBiaya
  const sisaPiutang = nilaiPesanan - totalMasuk
  const progressPct =
    nilaiPesanan > 0 ? Math.min(100, Math.round((totalMasuk / nilaiPesanan) * 100)) : 0
  const sudahBalikModal = totalMasuk >= totalModal

  return {
    totalModal,
    totalOps,
    totalMasuk,
    potOps,
    totalBiaya,
    profitBersih,
    sisaPiutang,
    progressPct,
    sudahBalikModal,
  }
}
