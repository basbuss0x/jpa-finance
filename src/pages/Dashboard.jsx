import React, { useEffect, useMemo, useState } from 'react'
import {
  ARAH_TRANSAKSI,
  JENIS_PROYEK,
  KATEGORI_OPS_PERUSAHAAN,
  PROYEK_UMUM_ID,
  STATUS_PROYEK,
  TIPE_TRANSAKSI,
} from '../constants'
import { getProyek, getTransaksi } from '../store'
import { fmtIDR, hitungProyek } from '../utils'
import {
  Card,
  LabelRow,
  PageFrame,
  ProgressBar,
  WireButton,
  gray,
} from '../components/WireframeShared.jsx'

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

const sumNominal = (items) =>
  items.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)

function KpiTile({ label, value, note, color }) {
  return (
    <div
      style={{
        minHeight: 78,
        padding: 10,
        border: `1px solid ${gray.line}`,
        borderRadius: 8,
        background: gray.bg,
      }}
    >
      <span style={{ display: 'block', color: gray.text, fontSize: 10 }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 8, fontSize: 14, color: color || gray.ink }}>
        {fmtIDR(value)}
      </strong>
      {note ? (
        <span style={{ display: 'block', marginTop: 6, color: gray.mid, fontSize: 10 }}>
          {note}
        </span>
      ) : null}
    </div>
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
        gap: 8,
        alignItems: 'end',
        minHeight: 132,
        padding: 10,
        border: `1px dashed ${gray.line}`,
        borderRadius: 8,
        background: gray.bg,
      }}
    >
      {data.map((item) => {
        const masukHeight = Math.max(4, Math.round((item.masuk / maxValue) * 82))
        const keluarHeight = Math.max(4, Math.round((item.keluar / maxValue) * 82))

        return (
          <div key={item.month} style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'end', height: 82 }}>
              <div style={{ width: 8, height: masukHeight, background: gray.success }} />
              <div
                style={{
                  width: 8,
                  height: keluarHeight,
                  background: gray.danger,
                  border: `1px solid ${gray.danger}`,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <span style={{ color: gray.text, fontSize: 10 }}>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function EmptyDashboard({ onNavigate }) {
  return (
    <Card title="Belum ada data keuangan" note="empty state">
      <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: 12 }}>
        <div
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 18px)',
            gap: 8,
            alignItems: 'end',
            height: 78,
          }}
        >
          <span style={{ height: 28, background: gray.line, border: `1px solid ${gray.mid}` }} />
          <span style={{ height: 52, background: gray.line, border: `1px solid ${gray.mid}` }} />
          <span style={{ height: 40, background: gray.line, border: `1px solid ${gray.mid}` }} />
        </div>
        <strong style={{ color: gray.ink, fontSize: 16 }}>Belum ada data keuangan</strong>
        <span style={{ color: gray.text, fontSize: 12, textAlign: 'center' }}>
          Tambah proyek dan mulai catat transaksi
        </span>
      </div>
      <WireButton onClick={() => onNavigate?.('input')}>Mulai Catat</WireButton>
    </Card>
  )
}

export default function Dashboard({ onNavigate }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [year, setYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    setProyek(getProyek())
    setTransaksi(getTransaksi())
  }, [])

  const yearOptions = useMemo(() => {
    const fromTx = transaksi
      .map((item) => String(item.tanggal || '').slice(0, 4))
      .filter(Boolean)
    return Array.from(new Set([String(new Date().getFullYear()), ...fromTx])).sort()
  }, [transaksi])

  const totalPemasukan = sumNominal(
    transaksi.filter((item) => item.arah === ARAH_TRANSAKSI.masuk)
  )
  const totalPengeluaran = sumNominal(
    transaksi.filter((item) => item.arah === ARAH_TRANSAKSI.keluar)
  )
  const labaRugi = totalPemasukan - totalPengeluaran
  const totalDanaTalangan = sumNominal(
    transaksi.filter((item) => item.tipe === TIPE_TRANSAKSI.modal)
  )
  const totalPengembalian = sumNominal(
    transaksi.filter((item) => item.tipe === TIPE_TRANSAKSI.pengembalian)
  )
  const danaBeredar = totalDanaTalangan - totalPengembalian
  const kondisi = labaRugi > 0 ? 'UNTUNG' : labaRugi < 0 ? 'RUGI' : 'STAGNAN'
  const kondisiColor =
    kondisi === 'UNTUNG'
      ? gray.success
      : kondisi === 'RUGI'
        ? gray.danger
        : gray.warning
  const margin = totalPemasukan > 0 ? (labaRugi / totalPemasukan) * 100 : 0

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
  const chartData = visibleMonthlyData.length > 0 ? visibleMonthlyData.slice(-6) : monthlyData.slice(0, 6)

  const activeProjects = proyek
    .filter((item) => item.status === STATUS_PROYEK.aktif)
    .map((item) => ({
      ...item,
      summary: hitungProyek(item, transaksi),
    }))
    .sort((a, b) => b.summary.profitBersih - a.summary.profitBersih)

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

  const opsPerusahaanTx = transaksi.filter(
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

  const hasFinancialData = proyek.length > 0 || transaksi.length > 0

  return (
    <PageFrame
      title="Dashboard Global"
      subtitle="Ringkasan kondisi keuangan perusahaan."
      activePage="dashboard"
      onNavigate={onNavigate}
    >
      {!hasFinancialData ? <EmptyDashboard onNavigate={onNavigate} /> : null}

      <Card title="Kondisi perusahaan" note="banner besar">
        <div
          style={{
            display: 'grid',
            gap: 8,
            minHeight: 92,
            padding: 14,
            border: `2px solid ${kondisiColor}`,
            borderRadius: 8,
            background: gray.card,
          }}
        >
          <span style={{ color: gray.mid, fontSize: 11 }}>Status computed</span>
          <strong style={{ color: kondisiColor, fontSize: 28 }}>{kondisi}</strong>
          <span style={{ color: gray.text, fontSize: 12 }}>
            Margin {margin.toFixed(1)}%
          </span>
        </div>
      </Card>

      <Card title="KPI utama" note="4 kartu ringkas">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <KpiTile label="Total Pemasukan" value={totalPemasukan} note={`Periode ${year}`} color={gray.success} />
          <KpiTile label="Total Pengeluaran" value={totalPengeluaran} note={`Periode ${year}`} color={gray.danger} />
          <KpiTile label="Laba/Rugi" value={labaRugi} note={`Periode ${year}`} color={labaRugi >= 0 ? gray.success : gray.danger} />
          <KpiTile label="Dana Talangan Beredar" value={danaBeredar} note="Semua periode" color={gray.warning} />
        </div>
      </Card>

      <Card title="Pembagian jenis transaksi" note="Project vs Regular">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div
            style={{
              display: 'grid',
              gap: 8,
              padding: 10,
              border: `1px solid ${gray.line}`,
              borderRadius: 8,
              background: gray.bg,
            }}
          >
            <strong style={{ color: gray.ink, fontSize: 14 }}>Regular</strong>
            <span style={{ color: gray.text, fontSize: 11 }}>
              {regularProjects.length} Regular | buku, map raport, supplies.
            </span>
            <strong style={{ color: gray.ink, fontSize: 13 }}>{fmtIDR(regularValue)}</strong>
          </div>
          <div
            style={{
              display: 'grid',
              gap: 8,
              padding: 10,
              border: `1px solid ${gray.line}`,
              borderRadius: 8,
              background: gray.bg,
            }}
          >
            <strong style={{ color: gray.ink, fontSize: 14 }}>Project</strong>
            <span style={{ color: gray.text, fontSize: 11 }}>
              {projectProjects.length} Project | CCTV, aplikasi, meubelair.
            </span>
            <strong style={{ color: gray.ink, fontSize: 13 }}>{fmtIDR(projectValue)}</strong>
          </div>
        </div>
      </Card>

      <Card title="Grafik arus kas bulanan" note="Masuk vs Keluar">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <span style={{ color: gray.text, fontSize: 12 }}>Tahun berjalan</span>
          <select
            aria-label="Filter tahun"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            style={{
              minHeight: 36,
              border: `1px solid ${gray.mid}`,
              borderRadius: 6,
              background: gray.bg,
              color: gray.ink,
              fontSize: 12,
            }}
          >
            {yearOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <MiniBars data={chartData} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: gray.text, fontSize: 10 }}>
            <span style={{ width: 12, height: 8, background: gray.success }} />
            Masuk
          </span>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: gray.text, fontSize: 10 }}>
            <span style={{ width: 12, height: 8, background: gray.danger, border: `1px solid ${gray.danger}` }} />
            Keluar
          </span>
        </div>
      </Card>

      <Card title="Ringkasan proyek aktif" note="profit terbesar di atas">
        {activeProjects.length > 0 ? (
          activeProjects.map((item) => (
            <div key={item.id} style={{ display: 'grid', gap: 6 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                  alignItems: 'baseline',
                  minHeight: 28,
                  borderBottom: `1px solid ${gray.line}`,
                  paddingBottom: 6,
                }}
              >
                <span style={{ color: gray.text, fontSize: 12 }}>{item.nama}</span>
                <strong
                  style={{
                    color: item.summary.profitBersih >= 0 ? gray.success : gray.danger,
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
          <span style={{ color: gray.text, fontSize: 12 }}>
            Tidak ada proyek aktif.
          </span>
        )}
      </Card>

      <Card title="Ops Perusahaan" note="non-proyek">
        <LabelRow label="Total ops perusahaan" value={fmtIDR(totalOpsPerusahaan)} strong />
        {opsByCategory.map((item) => (
          <LabelRow key={item.kategori} label={item.kategori} value={fmtIDR(item.total)} />
        ))}
      </Card>
    </PageFrame>
  )
}
