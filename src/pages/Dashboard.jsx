import React, { useEffect, useMemo, useState } from 'react'
import {
  ARAH_TRANSAKSI,
  JENIS_PROYEK,
  KATEGORI_OPS_PERUSAHAAN,
  PROYEK_UMUM_ID,
  STATUS_PROYEK,
  TIPE_TRANSAKSI,
} from '../constants'
import { getProyek, getSettings, getTransaksi } from '../store'
import { fmtIDR, hitungProyek } from '../utils'
import { LabelRow, PageFrame, ProgressBar } from '../components/WireframeShared.jsx'
import { EmptyState, InsightCard, StatusBanner } from '../components/ui.jsx'
import { componentStyles, tokens } from '../designTokens'

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

const HISTORY_SORT_OPTIONS = [
  'Terbaru dulu',
  'Terlama dulu',
  'A-Z Proyek/Kategori',
  'Nominal tertinggi',
  'Nominal terendah',
]

const HISTORY_PREVIEW_LIMIT = 5

const sumNominal = (items) =>
  items.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)

const normalizeText = (value) => String(value || '').toLowerCase().trim()

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const cardTitleStyle = {
  margin: 0,
  color: tokens.colors.text.ink,
  fontFamily: tokens.typography.family,
  ...tokens.typography.cardTitle,
}

const historyInputStyle = {
  width: '100%',
  minHeight: 42,
  border: `1px solid ${tokens.colors.line.borderGray}`,
  borderRadius: tokens.radius.md,
  padding: '0 12px',
  background: tokens.colors.surface.white,
  color: tokens.colors.text.ink,
  boxSizing: 'border-box',
  fontFamily: tokens.typography.family,
  fontSize: tokens.typography.body.fontSize,
}

function DashboardCard({ title, note, children }) {
  return (
    <section
      className="motion-card"
      style={{
        ...componentStyles.card,
        display: 'grid',
        gap: tokens.spacing.md,
        fontFamily: tokens.typography.family,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: tokens.spacing.md,
        }}
      >
        <h2 style={cardTitleStyle}>{title}</h2>
        {note ? (
          <span
            style={{
              color: tokens.colors.text.coolGray,
              ...tokens.typography.caption,
            }}
          >
            {note}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function HistoryChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      className="motion-pressable"
      onClick={onClick}
      style={{
        minHeight: 34,
        padding: '0 12px',
        border: `1px solid ${
          active ? tokens.colors.primary.actionBlue : tokens.colors.line.borderGray
        }`,
        borderRadius: tokens.radius.full,
        background: active ? tokens.colors.primary.actionBlue : tokens.colors.surface.white,
        color: active ? tokens.colors.text.inverse : tokens.colors.text.slate,
        fontFamily: tokens.typography.family,
        fontSize: tokens.typography.caption.fontSize,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function InlineEmpty({ title, description }) {
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: tokens.spacing.xs,
        padding: tokens.spacing.lg,
        border: `1px dashed ${tokens.colors.line.lineBlue}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.surface.mistBlue,
        textAlign: 'center',
      }}
    >
      <strong style={{ color: tokens.colors.text.ink, fontSize: 13 }}>{title}</strong>
      {description ? (
        <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
          {description}
        </span>
      ) : null}
    </div>
  )
}

function KpiTile({ label, value, note, color }) {
  return (
    <div
      style={{
        minHeight: 96,
        padding: tokens.spacing.md,
        border: `1px solid ${tokens.colors.line.borderGray}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.surface.mistBlue,
        display: 'grid',
        alignContent: 'space-between',
        gap: tokens.spacing.sm,
      }}
    >
      <span
        style={{
          color: tokens.colors.text.coolGray,
          fontFamily: tokens.typography.family,
          ...tokens.typography.caption,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          color: color || tokens.colors.text.ink,
          fontFamily: tokens.typography.family,
          fontSize: 16,
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        {fmtIDR(value)}
      </strong>
      {note ? (
        <span
          style={{
            color: tokens.colors.text.coolGray,
            fontFamily: tokens.typography.family,
            ...tokens.typography.caption,
          }}
        >
          {note}
        </span>
      ) : null}
    </div>
  )
}

function getHistoryProjectMeta(item, proyekById) {
  if (item.proyekId === PROYEK_UMUM_ID) {
    return {
      kodeProyek: PROYEK_UMUM_ID,
      namaProyek: 'UMUM - Ops Perusahaan',
      jenisProyek: 'UMUM',
    }
  }

  const relatedProyek = proyekById.get(item.proyekId)
  return {
    kodeProyek: item.proyekId || '-',
    namaProyek: relatedProyek?.nama || 'Proyek tidak ditemukan',
    jenisProyek: relatedProyek?.jenis || 'Tidak ditemukan',
  }
}

function sortHistoryRows(rows, sortMode) {
  const nextRows = [...rows]
  const byDateDesc = (a, b) => String(b.tanggal).localeCompare(String(a.tanggal))
  const byDateAsc = (a, b) => String(a.tanggal).localeCompare(String(b.tanggal))

  if (sortMode === 'Terlama dulu') return nextRows.sort(byDateAsc)
  if (sortMode === 'Nominal tertinggi') {
    return nextRows.sort(
      (a, b) => (Number(b.nominal) || 0) - (Number(a.nominal) || 0) || byDateDesc(a, b)
    )
  }
  if (sortMode === 'Nominal terendah') {
    return nextRows.sort(
      (a, b) => (Number(a.nominal) || 0) - (Number(b.nominal) || 0) || byDateDesc(a, b)
    )
  }
  if (sortMode === 'A-Z Proyek/Kategori') {
    return nextRows.sort((a, b) => {
      const first = `${a.namaProyek} ${a.kategori} ${a.tanggal}`
      const second = `${b.namaProyek} ${b.kategori} ${b.tanggal}`
      return first.localeCompare(second, 'id')
    })
  }
  return nextRows.sort(byDateDesc)
}

function GlobalHistoryCard({
  rows,
  totalRows,
  expanded,
  onExpandedChange,
  searchTerm,
  onSearchTermChange,
  jenisFilter,
  onJenisFilterChange,
  arahFilter,
  onArahFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortMode,
  onSortModeChange,
  onReset,
}) {
  const filterActive =
    searchTerm || jenisFilter !== 'Semua' || arahFilter !== 'Semua' || dateFrom || dateTo
  const hasMoreRows = rows.length > HISTORY_PREVIEW_LIMIT
  const visibleRows = expanded ? rows : rows.slice(0, HISTORY_PREVIEW_LIMIT)

  return (
    <DashboardCard
      title="Histori Transaksi Global"
      note={`${visibleRows.length} tampil / ${rows.length} cocok`}
    >
      <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Cari proyek, kategori, tipe, catatan..."
          style={historyInputStyle}
        />

        <div style={{ display: 'grid', gap: tokens.spacing.xs }}>
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 800,
            }}
          >
            Jenis
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
            {['Semua', 'Regular', 'Project', 'UMUM'].map((item) => (
              <HistoryChip
                key={item}
                active={jenisFilter === item}
                onClick={() => onJenisFilterChange(item)}
              >
                {item}
              </HistoryChip>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.xs }}>
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 800,
            }}
          >
            Arah
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
            {['Semua', ARAH_TRANSAKSI.masuk, ARAH_TRANSAKSI.keluar].map((item) => (
              <HistoryChip
                key={item}
                active={arahFilter === item}
                onClick={() => onArahFilterChange(item)}
              >
                {item === 'Semua' ? item : item[0].toUpperCase() + item.slice(1)}
              </HistoryChip>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing.sm,
          }}
        >
          <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
            <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
              Dari tanggal
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              style={historyInputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
            <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
              Sampai tanggal
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              style={historyInputStyle}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
          <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
            Urutkan
          </span>
          <select
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value)}
            style={historyInputStyle}
          >
            {HISTORY_SORT_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        {filterActive ? (
          <button
            type="button"
            className="motion-pressable"
            onClick={onReset}
            style={{
              minHeight: 40,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.line.lineBlue}`,
              background: tokens.colors.surface.white,
              color: tokens.colors.primary.actionBlue,
              fontFamily: tokens.typography.family,
              fontWeight: 800,
            }}
          >
            Reset Filter
          </button>
        ) : null}
      </div>

      {visibleRows.length > 0 ? (
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          {visibleRows.map((item) => {
            const masuk = item.arah === ARAH_TRANSAKSI.masuk
            return (
              <div
                key={item.id}
                className="motion-list-item"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: tokens.spacing.sm,
                  padding: tokens.spacing.md,
                  border: `1px solid ${tokens.colors.line.borderGray}`,
                  borderRadius: tokens.radius.md,
                  background: tokens.colors.surface.mistBlue,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: tokens.colors.text.ink,
                      fontSize: 12,
                      lineHeight: 1.35,
                    }}
                  >
                    {item.kategori}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 3,
                      color: tokens.colors.text.slate,
                      fontSize: 11,
                      lineHeight: 1.35,
                    }}
                  >
                    {formatDate(item.tanggal)} | {item.kodeProyek} | {item.jenisProyek}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 3,
                      color: tokens.colors.text.coolGray,
                      fontSize: 11,
                      lineHeight: 1.35,
                    }}
                  >
                    {item.namaProyek}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 3,
                      color: tokens.colors.text.coolGray,
                      fontSize: 11,
                      lineHeight: 1.35,
                    }}
                  >
                    {item.tipe} | {item.catatan || 'Tanpa catatan'}
                  </span>
                </div>
                <strong
                  style={{
                    color: masuk
                      ? tokens.colors.semantic.success
                      : tokens.colors.semantic.error,
                    fontSize: 12,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {masuk ? '+' : '-'} {fmtIDR(item.nominal)}
                </strong>
              </div>
            )
          })}
          {hasMoreRows ? (
            <button
              type="button"
              className="motion-pressable"
              onClick={() => onExpandedChange(!expanded)}
              style={{
                justifySelf: 'center',
                minHeight: 36,
                padding: '0 14px',
                borderRadius: tokens.radius.full,
                border: `1px solid ${tokens.colors.line.lineBlue}`,
                background: tokens.colors.surface.white,
                color: tokens.colors.primary.actionBlue,
                fontFamily: tokens.typography.family,
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 800,
              }}
            >
              {expanded ? 'Tampilkan lebih sedikit' : 'Lihat semua transaksi'}
            </button>
          ) : null}
        </div>
      ) : totalRows === 0 ? (
        <InlineEmpty
          title="Belum ada transaksi"
          description="Transaksi dari Input Cepat akan tampil di sini."
        />
      ) : (
        <InlineEmpty
          title="Tidak ada transaksi yang cocok"
          description="Ubah filter, pencarian, atau rentang tanggal."
        />
      )}
    </DashboardCard>
  )
}

function MiniBars({ data }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.masuk, item.keluar])
  )

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: tokens.spacing.sm,
        alignItems: 'end',
        minHeight: 132,
        padding: tokens.spacing.md,
        border: `1px dashed ${tokens.colors.line.lineBlue}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.surface.mistBlue,
      }}
    >
      {data.map((item) => {
        const masukHeight = Math.max(4, Math.round((item.masuk / maxValue) * 82))
        const keluarHeight = Math.max(4, Math.round((item.keluar / maxValue) * 82))

        return (
          <div key={item.month} style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'end', height: 82 }}>
              <div
                className="motion-bar-fill"
                style={{
                  width: 8,
                  height: masukHeight,
                  borderRadius: 3,
                  background: tokens.colors.semantic.success,
                }}
              />
              <div
                className="motion-bar-fill"
                style={{
                  width: 8,
                  height: keluarHeight,
                  borderRadius: 3,
                  background: tokens.colors.semantic.error,
                }}
              />
            </div>
            <span
              style={{
                color: tokens.colors.text.coolGray,
                fontFamily: tokens.typography.family,
                fontSize: 10,
              }}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ProjectTypeTile({ title, count, value, description }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: tokens.spacing.sm,
        padding: tokens.spacing.md,
        border: `1px solid ${tokens.colors.line.borderGray}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.surface.mistBlue,
      }}
    >
      <strong style={{ color: tokens.colors.text.ink, fontSize: 15 }}>{title}</strong>
      <span
        style={{
          color: tokens.colors.text.slate,
          fontFamily: tokens.typography.family,
          ...tokens.typography.caption,
        }}
      >
        {count} {title} | {description}
      </span>
      <strong style={{ color: tokens.colors.text.ink, fontSize: 14 }}>{fmtIDR(value)}</strong>
    </div>
  )
}

function getProjectTalangan(project, transaksi) {
  const tx = transaksi.filter((item) => item.proyekId === project.id)
  const modal = sumNominal(tx.filter((item) => item.tipe === TIPE_TRANSAKSI.modal))
  const pengembalian = sumNominal(
    tx.filter((item) => item.tipe === TIPE_TRANSAKSI.pengembalian)
  )
  return Math.max(0, modal - pengembalian)
}

function getStatusBannerData({
  labaRugi,
  totalPemasukan,
  totalPengeluaran,
  hasActiveProjectTalangan,
}) {
  if (labaRugi > 0 && totalPemasukan > 0) {
    return {
      label: 'Keuangan Sehat',
      color: tokens.colors.semantic.success,
      description: 'Pemasukan lebih besar dari pengeluaran periode ini.',
    }
  }

  if (labaRugi < 0 && hasActiveProjectTalangan) {
    return {
      label: 'Arus Kas Negatif',
      color: tokens.colors.semantic.warning,
      description: 'Pengeluaran lebih besar dari pemasukan. Dana talangan sedang berjalan.',
    }
  }

  if (labaRugi < 0) {
    return {
      label: 'Keuangan Defisit',
      color: tokens.colors.semantic.error,
      description: 'Pengeluaran melebihi pemasukan tanpa proyek aktif berjalan.',
    }
  }

  if (labaRugi === 0 && totalPemasukan === 0 && totalPengeluaran === 0) {
    return {
      label: 'Belum Ada Data',
      color: tokens.colors.text.coolGray,
      description: 'Mulai catat transaksi pertama untuk melihat kondisi keuangan.',
    }
  }

  return {
    label: 'Impas',
    color: tokens.colors.primary.corporateBlue,
    description: 'Pemasukan dan pengeluaran seimbang periode ini.',
  }
}

function daysSince(dateValue) {
  if (!dateValue) return null
  const then = new Date(dateValue)
  if (Number.isNaN(then.getTime())) return null
  return Math.floor((Date.now() - then.getTime()) / 86_400_000)
}

function getInsight({
  proyek,
  transaksi,
  activeProjectsWithTalangan,
  danaBeredar,
  opsByCategory,
  settings,
  onNavigate,
}) {
  const lastBackupDays = daysSince(settings.lastBackup)
  if (!settings.lastBackup) {
    return {
      message: 'Kamu belum pernah backup data. Export backup sekarang untuk keamanan.',
      ctaLabel: 'Backup Sekarang ->',
      onCta: () => onNavigate?.('settings'),
    }
  }

  if (lastBackupDays !== null && lastBackupDays > 7) {
    return {
      message: `Backup terakhir ${lastBackupDays} hari lalu. Disarankan backup rutin setiap minggu.`,
      ctaLabel: 'Backup Sekarang ->',
      onCta: () => onNavigate?.('settings'),
    }
  }

  const unpaidProjects = proyek
    .map((item) => ({ ...item, summary: hitungProyek(item, transaksi) }))
    .filter((item) => item.summary.sisaPiutang > 0)
  if (unpaidProjects.length > 0) {
    return {
      message: `Ada ${unpaidProjects.length} proyek dengan pembayaran belum lunas.`,
      ctaLabel: 'Lihat Proyek ->',
      onCta: () => onNavigate?.('projects'),
    }
  }

  if (danaBeredar > 0) {
    return {
      message: `Dana talangan ${fmtIDR(danaBeredar)} masih beredar di ${activeProjectsWithTalangan.length} proyek aktif.`,
    }
  }

  const largestCategory = [...opsByCategory].sort((a, b) => b.total - a.total)[0]
  if (largestCategory?.total > 0) {
    return {
      message: `Pengeluaran terbesar periode ini: ${largestCategory.kategori} sebesar ${fmtIDR(largestCategory.total)}.`,
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const hasTodayTx = transaksi.some((item) => item.tanggal === today)
  if (!hasTodayTx) {
    return {
      message: 'Belum ada transaksi hari ini. Tap Input untuk mulai mencatat.',
      ctaLabel: 'Input Sekarang ->',
      onCta: () => onNavigate?.('input'),
    }
  }

  return {
    message: 'Semua data tercatat. Pantau terus kondisi keuangan perusahaan.',
  }
}

export default function Dashboard({ onNavigate }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [settings, setSettings] = useState({})
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [historySearch, setHistorySearch] = useState('')
  const [historyJenis, setHistoryJenis] = useState('Semua')
  const [historyArah, setHistoryArah] = useState('Semua')
  const [historyDateFrom, setHistoryDateFrom] = useState('')
  const [historyDateTo, setHistoryDateTo] = useState('')
  const [historySort, setHistorySort] = useState('Terbaru dulu')
  const [historyExpanded, setHistoryExpanded] = useState(false)

  useEffect(() => {
    setProyek(getProyek())
    setTransaksi(getTransaksi())
    setSettings(getSettings())
  }, [])

  const yearOptions = useMemo(() => {
    const fromTx = transaksi
      .map((item) => String(item.tanggal || '').slice(0, 4))
      .filter(Boolean)
    return Array.from(new Set([String(new Date().getFullYear()), ...fromTx])).sort()
  }, [transaksi])

  const globalHistoryRows = useMemo(() => {
    const proyekById = new Map(proyek.map((item) => [item.id, item]))
    const rows = transaksi.map((item) => ({
      ...item,
      ...getHistoryProjectMeta(item, proyekById),
      nominal: Number(item.nominal) || 0,
    }))

    const query = normalizeText(historySearch)
    const filteredRows = rows.filter((item) => {
      const searchHaystack = normalizeText(
        [
          item.namaProyek,
          item.kodeProyek,
          item.jenisProyek,
          item.kategori,
          item.tipe,
          item.catatan,
          item.nominal,
          item.arah,
          item.tanggal,
        ].join(' ')
      )
      const searchMatch = !query || searchHaystack.includes(query)
      const jenisMatch = historyJenis === 'Semua' || item.jenisProyek === historyJenis
      const arahMatch = historyArah === 'Semua' || item.arah === historyArah
      const fromMatch = !historyDateFrom || String(item.tanggal || '') >= historyDateFrom
      const toMatch = !historyDateTo || String(item.tanggal || '') <= historyDateTo
      return searchMatch && jenisMatch && arahMatch && fromMatch && toMatch
    })

    return sortHistoryRows(filteredRows, historySort)
  }, [
    proyek,
    transaksi,
    historySearch,
    historyJenis,
    historyArah,
    historyDateFrom,
    historyDateTo,
    historySort,
  ])

  const resetGlobalHistoryFilter = () => {
    setHistorySearch('')
    setHistoryJenis('Semua')
    setHistoryArah('Semua')
    setHistoryDateFrom('')
    setHistoryDateTo('')
    setHistoryExpanded(false)
  }

  useEffect(() => {
    setHistoryExpanded(false)
  }, [
    historySearch,
    historyJenis,
    historyArah,
    historyDateFrom,
    historyDateTo,
    historySort,
  ])

  const transaksiPeriode = transaksi.filter((item) =>
    String(item.tanggal || '').startsWith(year)
  )
  const totalPemasukan = sumNominal(
    transaksiPeriode.filter((item) => item.arah === ARAH_TRANSAKSI.masuk)
  )
  const totalPengeluaran = sumNominal(
    transaksiPeriode.filter((item) => item.arah === ARAH_TRANSAKSI.keluar)
  )
  const labaRugi = totalPemasukan - totalPengeluaran
  const totalDanaTalangan = sumNominal(
    transaksi.filter((item) => item.tipe === TIPE_TRANSAKSI.modal)
  )
  const totalPengembalian = sumNominal(
    transaksi.filter((item) => item.tipe === TIPE_TRANSAKSI.pengembalian)
  )
  const danaBeredar = totalDanaTalangan - totalPengembalian
  const monthlyData = monthLabels.map((label, index) => {
    const month = String(index + 1).padStart(2, '0')
    const txMonth = transaksi.filter((item) =>
      String(item.tanggal || '').startsWith(`${year}-${month}`)
    )
    return {
      label,
      month,
      masuk: sumNominal(txMonth.filter((item) => item.arah === ARAH_TRANSAKSI.masuk)),
      keluar: sumNominal(txMonth.filter((item) => item.arah === ARAH_TRANSAKSI.keluar)),
    }
  })

  const visibleMonthlyData = monthlyData.filter((item) => item.masuk || item.keluar)
  const chartData = visibleMonthlyData.slice(-6)

  const activeProjects = proyek
    .filter((item) => item.status === STATUS_PROYEK.aktif)
    .map((item) => ({
      ...item,
      summary: hitungProyek(item, transaksi),
      talangan: getProjectTalangan(item, transaksi),
    }))
    .sort((a, b) => b.summary.profitBersih - a.summary.profitBersih)
  const activeProjectsWithTalangan = activeProjects.filter((item) => item.talangan > 0)

  const regularProjects = proyek.filter((item) => item.jenis === JENIS_PROYEK.regular)
  const projectProjects = proyek.filter((item) => item.jenis === JENIS_PROYEK.project)
  const regularValue = regularProjects.reduce(
    (sum, item) => sum + (Number(item.nilaiPesanan) || 0),
    0
  )
  const projectValue = projectProjects.reduce(
    (sum, item) => sum + (Number(item.nilaiPesanan) || 0),
    0
  )

  const opsPerusahaanTx = transaksiPeriode.filter(
    (item) =>
      item.proyekId === PROYEK_UMUM_ID ||
      item.tipe === TIPE_TRANSAKSI.opsPerusahaan
  )
  const totalOpsPerusahaan = sumNominal(
    opsPerusahaanTx.filter((item) => item.arah === ARAH_TRANSAKSI.keluar)
  )
  const opsByCategory = KATEGORI_OPS_PERUSAHAAN.map((kategori) => ({
    kategori,
    total: sumNominal(opsPerusahaanTx.filter((item) => item.kategori === kategori)),
  }))
  const largestOpsCategory = [...opsByCategory].sort((a, b) => b.total - a.total)[0]

  const hasFinancialData = proyek.length > 0 || transaksi.length > 0
  const statusBanner = getStatusBannerData({
    labaRugi,
    totalPemasukan,
    totalPengeluaran,
    hasActiveProjectTalangan: activeProjectsWithTalangan.length > 0,
  })
  const insight = getInsight({
    proyek,
    transaksi,
    activeProjectsWithTalangan,
    danaBeredar,
    opsByCategory,
    settings,
    onNavigate,
  })

  return (
    <PageFrame
      title="Dashboard"
      subtitle="Ringkasan keuangan perusahaan"
      activePage="dashboard"
      onNavigate={onNavigate}
    >
      {!hasFinancialData ? (
        <EmptyState
          title="Belum ada data keuangan"
          description="Tambah proyek dan mulai catat transaksi"
          ctaLabel="Mulai Catat"
          onCta={() => onNavigate?.('input')}
        />
      ) : null}

      <StatusBanner
        label={statusBanner.label}
        description={statusBanner.description}
        color={statusBanner.color}
      />

      <DashboardCard title="KPI utama" note="Periode & semua data">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
          <KpiTile
            label="Total Pemasukan"
            value={totalPemasukan}
            note={`Periode ${year}`}
            color={tokens.colors.semantic.success}
          />
          <KpiTile
            label="Total Pengeluaran"
            value={totalPengeluaran}
            note={`Periode ${year}`}
            color={tokens.colors.semantic.error}
          />
          <KpiTile
            label="Laba/Rugi"
            value={labaRugi}
            note={`Periode ${year}`}
            color={
              labaRugi >= 0 ? tokens.colors.semantic.success : tokens.colors.semantic.error
            }
          />
          <KpiTile
            label="Dana Talangan Beredar"
            value={danaBeredar}
            note="Semua periode"
            color={tokens.colors.primary.corporateBlue}
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Pembagian jenis transaksi" note="Project vs Regular">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
          <ProjectTypeTile
            title="Regular"
            count={regularProjects.length}
            value={regularValue}
            description="buku, map raport, supplies"
          />
          <ProjectTypeTile
            title="Project"
            count={projectProjects.length}
            value={projectValue}
            description="CCTV, aplikasi, meubelair"
          />
        </div>
      </DashboardCard>

      <GlobalHistoryCard
        rows={globalHistoryRows}
        totalRows={transaksi.length}
        expanded={historyExpanded}
        onExpandedChange={setHistoryExpanded}
        searchTerm={historySearch}
        onSearchTermChange={setHistorySearch}
        jenisFilter={historyJenis}
        onJenisFilterChange={setHistoryJenis}
        arahFilter={historyArah}
        onArahFilterChange={setHistoryArah}
        dateFrom={historyDateFrom}
        onDateFromChange={setHistoryDateFrom}
        dateTo={historyDateTo}
        onDateToChange={setHistoryDateTo}
        sortMode={historySort}
        onSortModeChange={setHistorySort}
        onReset={resetGlobalHistoryFilter}
      />

      <DashboardCard title="Arus Kas Bulanan" note="Masuk vs Keluar">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: tokens.spacing.md,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: tokens.colors.text.slate,
              fontFamily: tokens.typography.family,
              ...tokens.typography.body,
            }}
          >
            Tahun berjalan
          </span>
          <select
            aria-label="Filter tahun"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            style={{
              minHeight: 38,
              border: `1px solid ${tokens.colors.line.borderGray}`,
              borderRadius: tokens.radius.sm,
              background: tokens.colors.surface.white,
              color: tokens.colors.text.ink,
              fontFamily: tokens.typography.family,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            {yearOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        {visibleMonthlyData.length === 0 ? (
          <EmptyState
            title="Belum ada data untuk ditampilkan."
            description="Grafik arus kas akan muncul setelah ada transaksi."
          />
        ) : (
          <>
            <MiniBars data={chartData} />
            {visibleMonthlyData.length < 2 ? (
              <span
                style={{
                  color: tokens.colors.text.coolGray,
                  fontFamily: tokens.typography.family,
                  ...tokens.typography.caption,
                }}
              >
                Tren akan lebih jelas setelah ada transaksi di bulan berikutnya.
              </span>
            ) : null}
          </>
        )}
        <div style={{ display: 'flex', gap: tokens.spacing.md, alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              gap: 4,
              alignItems: 'center',
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            <span
              style={{
                width: 12,
                height: 8,
                borderRadius: 3,
                background: tokens.colors.semantic.success,
              }}
            />
            Masuk
          </span>
          <span
            style={{
              display: 'inline-flex',
              gap: 4,
              alignItems: 'center',
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            <span
              style={{
                width: 12,
                height: 8,
                borderRadius: 3,
                background: tokens.colors.semantic.error,
              }}
            />
            Keluar
          </span>
        </div>
      </DashboardCard>

      <DashboardCard title="Ringkasan proyek aktif">
        {activeProjects.length > 0 ? (
          activeProjects.slice(0, 3).map((item) => (
            <div key={item.id} style={{ display: 'grid', gap: tokens.spacing.sm }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: tokens.spacing.sm,
                  alignItems: 'baseline',
                  minHeight: 28,
                  borderBottom: `1px solid ${tokens.colors.line.borderGray}`,
                  paddingBottom: 6,
                }}
              >
                <span
                  style={{
                    color: tokens.colors.text.slate,
                    fontFamily: tokens.typography.family,
                    fontSize: tokens.typography.caption.fontSize,
                  }}
                >
                  {item.nama}
                </span>
                <strong
                  style={{
                    color:
                      item.summary.profitBersih > 0
                        ? tokens.colors.semantic.success
                        : item.summary.profitBersih < 0
                          ? tokens.colors.semantic.error
                          : tokens.colors.text.coolGray,
                    fontSize: 14,
                    textAlign: 'right',
                  }}
                >
                  {fmtIDR(item.summary.profitBersih)}
                </strong>
              </div>
              <ProgressBar value={item.summary.progressPct} />
            </div>
          ))
        ) : (
          <EmptyState
            title="Tidak ada proyek aktif saat ini."
            description="Proyek aktif akan tampil di sini saat statusnya Aktif."
            ctaLabel="Lihat semua proyek ->"
            onCta={() => onNavigate?.('projects')}
          />
        )}
      </DashboardCard>

      <DashboardCard title="Ops Perusahaan">
        <LabelRow label="Total pengeluaran" value={fmtIDR(totalOpsPerusahaan)} strong />
        <LabelRow
          label="Kategori terbesar"
          value={
            largestOpsCategory?.total > 0
              ? `${largestOpsCategory.kategori} (${fmtIDR(largestOpsCategory.total)})`
              : '-'
          }
        />
      </DashboardCard>

      <InsightCard
        message={insight.message}
        ctaLabel={insight.ctaLabel}
        onCta={insight.onCta}
      />
    </PageFrame>
  )
}
