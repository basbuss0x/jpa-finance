import React, { useEffect, useMemo, useState } from 'react'
import {
  JENIS_PROYEK_OPTIONS,
  STATUS_PROYEK,
  STATUS_PROYEK_OPTIONS,
  SUMBER_PROYEK_OPTIONS,
} from '../constants'
import { addProyek, getProyek, getTransaksi } from '../store'
import { fmtIDR, generateProyekId, hitungProyek } from '../utils'
import { PageFrame, WireButton } from '../components/WireframeShared.jsx'
import { EmptyState } from '../components/ui.jsx'
import { componentStyles, tokens } from '../designTokens'

const inputStyle = {
  width: '100%',
  minHeight: 50,
  border: `1px solid ${tokens.colors.line.borderGray}`,
  borderRadius: tokens.radius.md,
  padding: '0 14px',
  background: tokens.colors.surface.white,
  color: tokens.colors.text.ink,
  boxSizing: 'border-box',
  fontSize: tokens.typography.body.fontSize,
  fontFamily: tokens.typography.family,
}

const labelStyle = {
  color: tokens.colors.text.ink,
  fontSize: tokens.typography.cardTitle.fontSize,
  fontWeight: tokens.typography.cardTitle.fontWeight,
}

function SurfaceCard({ title, note, children }) {
  return (
    <section
      style={{
        ...componentStyles.card,
        display: 'grid',
        gap: tokens.spacing.md,
        fontFamily: tokens.typography.family,
      }}
    >
      {(title || note) ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: tokens.spacing.md,
          }}
        >
          {title ? (
            <h2
              style={{
                margin: 0,
                color: tokens.colors.text.ink,
                ...tokens.typography.cardTitle,
              }}
            >
              {title}
            </h2>
          ) : null}
          {note ? (
            <span
              style={{
                color: tokens.colors.text.coolGray,
                ...tokens.typography.caption,
                textAlign: 'right',
              }}
            >
              {note}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

function Segmented({ label, options, value, onChange, note }) {
  return (
    <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
      <span style={labelStyle}>{label}</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: tokens.spacing.sm,
        }}
      >
        {options.map((option) => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                minHeight: 42,
                border: `1px solid ${
                  active ? tokens.colors.primary.actionBlue : tokens.colors.line.borderGray
                }`,
                borderRadius: tokens.radius.full,
                background: active
                  ? tokens.colors.surface.iceBlue
                  : tokens.colors.surface.white,
                color: active
                  ? tokens.colors.primary.actionBlue
                  : tokens.colors.text.slate,
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 800,
                fontFamily: tokens.typography.family,
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
      {note ? (
        <span
          style={{
            color: tokens.colors.text.coolGray,
            fontSize: tokens.typography.caption.fontSize,
          }}
        >
          {note}
        </span>
      ) : null}
    </label>
  )
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
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

function StatusBadge({ status }) {
  const palette =
    status === STATUS_PROYEK.aktif
      ? {
          bg: '#ECFDF5',
          border: '#BBF7D0',
          color: tokens.colors.semantic.success,
        }
      : status === STATUS_PROYEK.menungguBayar
        ? {
            bg: '#FFFBEB',
            border: '#FDE68A',
            color: tokens.colors.semantic.warning,
          }
        : {
            bg: tokens.colors.surface.mistBlue,
            border: tokens.colors.line.borderGray,
            color: tokens.colors.text.slate,
          }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 26,
        padding: '0 9px',
        borderRadius: tokens.radius.full,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.color,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {status}
    </span>
  )
}

function ProjectProgress({ value }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div
      aria-label={`Progress pembayaran ${safeValue}%`}
      style={{
        height: 10,
        borderRadius: tokens.radius.full,
        background: tokens.colors.surface.iceBlue,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${safeValue}%`,
          height: '100%',
          borderRadius: tokens.radius.full,
          background:
            safeValue >= 100
              ? tokens.colors.semantic.success
              : tokens.colors.primary.actionBlue,
        }}
      />
    </div>
  )
}

function ProjectCard({ proyek, transaksi, onOpenDetail }) {
  const summary = hitungProyek(proyek, transaksi)
  const profitColor =
    summary.profitBersih > 0
      ? tokens.colors.semantic.success
      : summary.profitBersih < 0
        ? tokens.colors.semantic.error
        : tokens.colors.text.coolGray

  return (
    <button
      type="button"
      onClick={onOpenDetail}
      style={{
        display: 'grid',
        gap: tokens.spacing.md,
        width: '100%',
        padding: tokens.spacing.lg,
        border: `1px solid ${tokens.colors.line.borderGray}`,
        borderRadius: tokens.radius.lg,
        background: tokens.colors.surface.white,
        boxShadow: tokens.shadow.soft,
        color: tokens.colors.text.ink,
        textAlign: 'left',
        fontFamily: tokens.typography.family,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: tokens.spacing.sm,
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <strong
            style={{
              display: 'block',
              color: tokens.colors.text.ink,
              fontSize: tokens.typography.cardTitle.fontSize,
              lineHeight: 1.25,
            }}
          >
            {proyek.nama}
          </strong>
          <span
            style={{
              display: 'block',
              marginTop: 4,
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
              lineHeight: 1.35,
            }}
          >
            {proyek.id} | {proyek.jenis} | {proyek.klien || '-'}
          </span>
        </div>
        <StatusBadge status={proyek.status} />
      </div>

      <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
        <ProjectProgress value={summary.progressPct} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: tokens.spacing.sm,
            color: tokens.colors.text.slate,
            fontSize: tokens.typography.caption.fontSize,
          }}
        >
          <span>
            Masuk {fmtIDR(summary.totalMasuk)} dari {fmtIDR(proyek.nilaiPesanan)}
          </span>
          <strong style={{ color: tokens.colors.text.ink }}>{summary.progressPct}%</strong>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: tokens.spacing.sm,
          paddingTop: tokens.spacing.sm,
          borderTop: `1px solid ${tokens.colors.line.borderGray}`,
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            color: tokens.colors.text.coolGray,
            fontSize: tokens.typography.caption.fontSize,
          }}
        >
          Profit bersih
        </span>
        <strong style={{ color: profitColor, fontSize: 14, textAlign: 'right' }}>
          {fmtIDR(summary.profitBersih)}
        </strong>
      </div>
    </button>
  )
}

function getEmptyCopy({ totalCount, statusFilter, jenisFilter }) {
  if (totalCount === 0 && statusFilter === 'Semua' && jenisFilter === 'Semua') {
    return {
      title: 'Belum ada proyek.',
      description: 'Mulai dengan membuat proyek pertama.',
      ctaLabel: '+ Buat Proyek Pertama',
      action: 'create',
    }
  }

  if (statusFilter === STATUS_PROYEK.aktif && jenisFilter === 'Semua') {
    return {
      title: 'Tidak ada proyek aktif saat ini.',
      description: 'Cek semua proyek untuk melihat status lainnya.',
      ctaLabel: 'Lihat semua proyek ->',
      action: 'all',
    }
  }

  if (statusFilter === STATUS_PROYEK.menungguBayar && jenisFilter === 'Semua') {
    return {
      title: 'Tidak ada proyek yang menunggu pembayaran.',
      description: 'Proyek dengan status menunggu bayar akan muncul di sini.',
    }
  }

  if (statusFilter === STATUS_PROYEK.selesai && jenisFilter === 'Semua') {
    return {
      title: 'Belum ada proyek yang selesai.',
      description: 'Proyek selesai akan tampil setelah statusnya diperbarui.',
    }
  }

  if (jenisFilter === 'Regular' && statusFilter === 'Semua') {
    return {
      title: 'Tidak ada proyek jenis Regular.',
      description: 'Regular dipakai untuk transaksi sekolah berulang.',
    }
  }

  if (jenisFilter === 'Project' && statusFilter === 'Semua') {
    return {
      title: 'Tidak ada proyek jenis Project.',
      description: 'Project dipakai untuk kerja khusus seperti CCTV, aplikasi, atau pengadaan umum.',
    }
  }

  return {
    title: `Tidak ada proyek ${jenisFilter !== 'Semua' ? jenisFilter : ''} dengan status ${statusFilter}.`,
    description: 'Ubah filter untuk melihat proyek lain.',
    ctaLabel: 'Lihat semua proyek ->',
    action: 'all',
  }
}

function TambahProyekForm({ proyek, onCancel, onSaved }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState(JENIS_PROYEK_OPTIONS[0])
  const [klien, setKlien] = useState('')
  const [sumber, setSumber] = useState(SUMBER_PROYEK_OPTIONS[1])
  const [nilaiPesanan, setNilaiPesanan] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState(today)
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const nilai = Number(nilaiPesanan)
    if (!nama.trim()) {
      setError('Nama proyek wajib diisi.')
      return
    }
    if (!nilai || nilai <= 0) {
      setError('Nilai Pesanan wajib lebih dari 0.')
      return
    }

    addProyek({
      id: generateProyekId(proyek, jenis),
      jenis,
      nama: nama.trim(),
      sumber,
      klien: klien.trim(),
      nilaiPesanan: nilai,
      potOpsPerush: 0,
      status: STATUS_PROYEK.aktif,
      tanggalMulai,
      catatan: catatan.trim(),
    })

    onSaved()
  }

  return (
    <PageFrame
      title="Tambah Proyek"
      subtitle="Form halaman penuh, bukan modal."
      activePage="projects"
      onNavigate={() => {}}
    >
      <WireButton variant="secondary" onClick={onCancel}>
        {'<-'} Kembali
      </WireButton>

      <SurfaceCard title="Data proyek baru" note="status otomatis Aktif">
        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span style={labelStyle}>Nama Proyek</span>
          <input
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: Pengadaan Buku SDN 5 Ambon"
            style={inputStyle}
          />
        </label>

        <Segmented
          label="Jenis Transaksi"
          options={JENIS_PROYEK_OPTIONS}
          value={jenis}
          onChange={setJenis}
          note={
            jenis === 'Regular'
              ? 'Regular = transaksi sekolah berulang.'
              : 'Project = kerja khusus seperti CCTV, aplikasi, konstruksi.'
          }
        />

        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span style={labelStyle}>Klien</span>
          <input
            value={klien}
            onChange={(event) => setKlien(event.target.value)}
            placeholder="Nama sekolah / instansi"
            style={inputStyle}
          />
        </label>

        <Segmented
          label="Sumber"
          options={SUMBER_PROYEK_OPTIONS}
          value={sumber}
          onChange={setSumber}
        />

        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span style={labelStyle}>Nilai Pesanan (IDR)</span>
          <input
            type="number"
            inputMode="numeric"
            value={nilaiPesanan}
            onChange={(event) => setNilaiPesanan(event.target.value)}
            placeholder="Contoh: 18500000"
            style={inputStyle}
          />
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            {fmtIDR(Number(nilaiPesanan))}
          </span>
        </label>

        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span style={labelStyle}>Tanggal Mulai</span>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(event) => setTanggalMulai(event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span style={labelStyle}>Catatan</span>
          <textarea
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            placeholder="Keterangan tambahan (opsional)"
            rows={3}
            style={{
              ...inputStyle,
              minHeight: 76,
              padding: tokens.spacing.md,
              resize: 'none',
              lineHeight: 1.4,
            }}
          />
        </label>
      </SurfaceCard>

      <SurfaceCard title="Catatan proyek">
        <span style={{ color: tokens.colors.text.slate, fontSize: 12 }}>
          Tidak ada field Status saat tambah baru. Status otomatis Aktif.
        </span>
        <span style={{ color: tokens.colors.text.slate, fontSize: 12 }}>
          Potongan Ops Perusahaan diisi nanti di Detail Proyek.
        </span>
        <strong style={{ color: tokens.colors.text.ink, fontSize: 12 }}>
          Validasi: Nama dan Nilai Pesanan wajib diisi.
        </strong>
      </SurfaceCard>

      {error ? (
        <div
          style={{
            padding: tokens.spacing.md,
            border: `1px solid ${tokens.colors.danger.border}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.danger.tint,
            color: tokens.colors.semantic.error,
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        style={{
          ...componentStyles.primaryButton,
          width: '100%',
          fontFamily: tokens.typography.family,
        }}
      >
        Simpan Proyek
      </button>
    </PageFrame>
  )
}

export default function DaftarProyek({ onNavigate, onOpenDetail }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [filter, setFilter] = useState('Semua')
  const [jenisFilter, setJenisFilter] = useState('Semua')
  const [mode, setMode] = useState('list')

  const reload = () => {
    setProyek(getProyek())
    setTransaksi(getTransaksi())
  }

  useEffect(() => {
    reload()
  }, [])

  const filteredProyek = proyek.filter((item) => {
    const statusMatch = filter === 'Semua' || item.status === filter
    const jenisMatch = jenisFilter === 'Semua' || item.jenis === jenisFilter
    return statusMatch && jenisMatch
  })

  const emptyCopy = getEmptyCopy({
    totalCount: proyek.length,
    statusFilter: filter,
    jenisFilter,
  })

  const handleEmptyCta = () => {
    if (emptyCopy.action === 'create') {
      setMode('create')
      return
    }
    setFilter('Semua')
    setJenisFilter('Semua')
  }

  if (mode === 'create') {
    return (
      <TambahProyekForm
        proyek={proyek}
        onCancel={() => setMode('list')}
        onSaved={() => {
          reload()
          setMode('list')
        }}
      />
    )
  }

  return (
    <PageFrame
      title="Proyek"
      subtitle="Pantau nilai, pembayaran, dan profit."
      activePage="projects"
      onNavigate={onNavigate}
    >
      <button
        type="button"
        onClick={() => setMode('create')}
        style={{
          ...componentStyles.primaryButton,
          width: '100%',
          fontFamily: tokens.typography.family,
          fontSize: 15,
        }}
      >
        + Proyek Baru
      </button>

      <SurfaceCard title="Filter proyek">
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 800,
            }}
          >
            Status
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
            {['Semua', ...STATUS_PROYEK_OPTIONS].map((item) => (
              <FilterChip
                key={item}
                active={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </FilterChip>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 800,
            }}
          >
            Jenis transaksi
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
            {['Semua', ...JENIS_PROYEK_OPTIONS].map((item) => (
              <FilterChip
                key={item}
                active={jenisFilter === item}
                onClick={() => setJenisFilter(item)}
              >
                {item}
              </FilterChip>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <section style={{ display: 'grid', gap: tokens.spacing.md }}>
        {filteredProyek.length > 0 ? (
          filteredProyek.map((item) => (
            <ProjectCard
              key={item.id}
              proyek={item}
              transaksi={transaksi}
              onOpenDetail={() => onOpenDetail?.(item.id)}
            />
          ))
        ) : (
          <EmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            ctaLabel={emptyCopy.ctaLabel}
            onCta={emptyCopy.ctaLabel ? handleEmptyCta : undefined}
          />
        )}
      </section>
    </PageFrame>
  )
}
