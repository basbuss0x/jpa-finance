import React, { useEffect, useMemo, useState } from 'react'
import {
  JENIS_PROYEK_OPTIONS,
  STATUS_PROYEK_OPTIONS,
  SUMBER_PROYEK_OPTIONS,
} from '../constants'
import {
  deleteProyek,
  deleteTransaksi,
  getProyek,
  getTransaksi,
  saveProyek,
  updateTransaksi,
} from '../store'
import { fmtIDR, hitungProyek } from '../utils'
import { LabelRow, PageFrame, ProgressBar } from '../components/WireframeShared.jsx'
import { EmptyState, Toast } from '../components/ui.jsx'
import { componentStyles, tokens } from '../designTokens'

const todayId = () => new Date().toISOString().slice(0, 10)

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

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function DetailCard({ title, note, children, style }) {
  return (
    <section
      style={{
        ...componentStyles.card,
        display: 'grid',
        gap: tokens.spacing.md,
        fontFamily: tokens.typography.family,
        ...style,
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

function ActionButton({ children, onClick, variant = 'primary', disabled }) {
  const primary = variant === 'primary'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? componentStyles.primaryButton : componentStyles.secondaryButton),
        width: '100%',
        opacity: disabled ? 0.6 : 1,
        fontFamily: tokens.typography.family,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  )
}

function Segmented({ label, options, value, onChange }) {
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
                  ? tokens.colors.primary.actionBlue
                  : tokens.colors.surface.white,
                color: active ? tokens.colors.text.inverse : tokens.colors.text.slate,
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
    </label>
  )
}

function Badge({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 26,
        padding: '0 9px',
        borderRadius: tokens.radius.full,
        border: `1px solid ${tokens.colors.line.borderGray}`,
        background: tokens.colors.surface.mistBlue,
        color: tokens.colors.text.slate,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  )
}

function TrashIcon({ color }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function NumberTile({ label, value, color }) {
  return (
    <div
      style={{
        minHeight: 78,
        padding: tokens.spacing.md,
        border: `1px solid ${tokens.colors.line.borderGray}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.surface.mistBlue,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <span
        style={{
          color: tokens.colors.text.coolGray,
          fontSize: tokens.typography.caption.fontSize,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          display: 'block',
          marginTop: tokens.spacing.sm,
          fontSize: 14,
          color: color || tokens.colors.text.ink,
        }}
      >
        {fmtIDR(value)}
      </strong>
    </div>
  )
}

function EmptyDetail({ onNavigate }) {
  return (
    <PageFrame
      title="Detail Proyek"
      subtitle="Belum ada proyek untuk ditampilkan."
      activePage="projects"
      onNavigate={onNavigate}
    >
      <EmptyState
        title="Belum ada proyek"
        description="Buat proyek dulu sebelum melihat detail keuangan."
        ctaLabel="Ke Daftar Proyek"
        onCta={() => onNavigate?.('projects')}
      />
    </PageFrame>
  )
}

function EmptyHistory() {
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
      <strong style={{ color: tokens.colors.text.ink, fontSize: 13 }}>
        Belum ada transaksi di proyek ini
      </strong>
      <span style={{ color: tokens.colors.text.slate, fontSize: 11 }}>
        Tap Input untuk mulai mencatat
      </span>
    </div>
  )
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function DeleteSheet({ transaksi, onCancel, onConfirm }) {
  if (!transaksi) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.48)',
        zIndex: 20,
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 390,
          display: 'grid',
          gap: tokens.spacing.md,
          padding: tokens.spacing.lg,
          borderRadius: '16px 16px 0 0',
          background: tokens.colors.surface.white,
          boxSizing: 'border-box',
          boxShadow: tokens.shadow.raised,
          fontFamily: tokens.typography.family,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: tokens.colors.text.ink,
            ...tokens.typography.sectionTitle,
          }}
        >
          Hapus transaksi ini?
        </h2>
        <div
          style={{
            display: 'grid',
            gap: tokens.spacing.xs,
            padding: tokens.spacing.md,
            border: `1px solid ${tokens.colors.line.borderGray}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.surface.mistBlue,
            fontSize: 12,
          }}
        >
          <strong>{transaksi.kategori}</strong>
          <span>{fmtIDR(transaksi.nominal)} | {formatDate(transaksi.tanggal)}</span>
          <span style={{ color: tokens.colors.text.slate }}>
            {transaksi.catatan || 'Tanpa catatan'}
          </span>
        </div>
        <ActionButton onClick={onConfirm}>Ya, Hapus</ActionButton>
        <ActionButton variant="secondary" onClick={onCancel}>Batal</ActionButton>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

function EditProyek({ proyek, onCancel, onSaved, onDeleted }) {
  const [nama, setNama] = useState(proyek.nama || '')
  const [jenis, setJenis] = useState(proyek.jenis || JENIS_PROYEK_OPTIONS[0])
  const [klien, setKlien] = useState(proyek.klien || '')
  const [sumber, setSumber] = useState(proyek.sumber || SUMBER_PROYEK_OPTIONS[0])
  const [nilaiPesanan, setNilaiPesanan] = useState(String(proyek.nilaiPesanan || ''))
  const [status, setStatus] = useState(proyek.status || STATUS_PROYEK_OPTIONS[0])
  const [tanggalMulai, setTanggalMulai] = useState(proyek.tanggalMulai || todayId())
  const [catatan, setCatatan] = useState(proyek.catatan || '')
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const handleSave = () => {
    const nilai = Number(nilaiPesanan)
    if (!nama.trim()) {
      setError('Nama proyek wajib diisi.')
      return
    }
    if (!nilai || nilai <= 0) {
      setError('Nilai Pesanan wajib lebih dari 0.')
      return
    }

    const nextItem = {
      ...proyek,
      nama: nama.trim(),
      jenis,
      klien: klien.trim(),
      sumber,
      nilaiPesanan: nilai,
      status,
      tanggalMulai,
      catatan: catatan.trim(),
    }
    saveProyek(getProyek().map((item) => (item.id === proyek.id ? nextItem : item)))
    onSaved()
  }

  const handleDelete = () => {
    if (!deleteOpen) {
      setDeleteOpen(true)
      setDeleteText('')
      return
    }
    if (deleteText !== 'HAPUS') return
    deleteProyek(proyek.id)
    onDeleted()
  }

  return (
    <PageFrame
      title="Edit Proyek"
      subtitle={`${proyek.id} | data sudah pre-filled`}
      activePage="projects"
      onNavigate={() => {}}
    >
      <ActionButton variant="secondary" onClick={onCancel}>
        {'<-'} Kembali
      </ActionButton>

      <DetailCard title="Data proyek" note="pre-filled">
        <Field label="Nama Proyek">
          <input value={nama} onChange={(e) => setNama(e.target.value)} style={inputStyle} />
        </Field>
        <Segmented label="Jenis Transaksi" options={JENIS_PROYEK_OPTIONS} value={jenis} onChange={setJenis} />
        <Field label="Klien">
          <input value={klien} onChange={(e) => setKlien(e.target.value)} style={inputStyle} />
        </Field>
        <Segmented label="Sumber" options={SUMBER_PROYEK_OPTIONS} value={sumber} onChange={setSumber} />
        <Field label="Nilai Pesanan">
          <input
            type="number"
            inputMode="numeric"
            value={nilaiPesanan}
            onChange={(e) => setNilaiPesanan(e.target.value)}
            style={inputStyle}
          />
          <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
            {fmtIDR(Number(nilaiPesanan))}
          </span>
        </Field>
        <Segmented label="Status" options={STATUS_PROYEK_OPTIONS} value={status} onChange={setStatus} />
        <Field label="Tanggal Mulai">
          <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Catatan">
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            style={{ ...inputStyle, minHeight: 76, padding: 12, resize: 'none' }}
          />
        </Field>
      </DetailCard>

      {error ? (
        <div
          style={{
            padding: tokens.spacing.md,
            border: `1px solid ${tokens.colors.danger.border}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.danger.tint,
            color: tokens.colors.semantic.error,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}

      <ActionButton onClick={handleSave}>Simpan Perubahan</ActionButton>

      <DetailCard
        title="Zona bahaya"
        style={{
          background: tokens.colors.danger.tint,
          borderColor: tokens.colors.danger.border,
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <strong style={{ color: tokens.colors.semantic.error, fontSize: 13 }}>
            Hapus Proyek
          </strong>
          <span style={{ color: tokens.colors.text.slate, fontSize: 12 }}>
            Semua transaksi terkait proyek ini juga akan terhapus permanen.
          </span>
          <strong style={{ color: tokens.colors.text.ink, fontSize: 12 }}>{proyek.nama}</strong>
          {deleteOpen ? (
            <input
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              placeholder='Ketik "HAPUS" untuk konfirmasi'
              style={{ ...inputStyle, borderColor: tokens.colors.danger.border }}
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteOpen && deleteText !== 'HAPUS'}
          style={{
            width: '100%',
            minHeight: 50,
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.colors.semantic.error}`,
            background:
              deleteOpen && deleteText !== 'HAPUS'
                ? tokens.colors.danger.border
                : tokens.colors.surface.white,
            color:
              deleteOpen && deleteText !== 'HAPUS'
                ? tokens.colors.text.coolGray
                : tokens.colors.semantic.error,
            fontSize: 14,
            fontWeight: 900,
            fontFamily: tokens.typography.family,
          }}
        >
          {deleteOpen ? 'Konfirmasi Hapus Proyek' : 'Hapus Proyek'}
        </button>
      </DetailCard>
    </PageFrame>
  )
}

export default function DetailProyek({ proyekId, onNavigate }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [potOpsDraft, setPotOpsDraft] = useState('')
  const [potOpsEditing, setPotOpsEditing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editingDateId, setEditingDateId] = useState('')
  const [editingDateValue, setEditingDateValue] = useState('')

  const reload = () => {
    setProyek(getProyek())
    setTransaksi(getTransaksi())
  }

  useEffect(() => {
    reload()
  }, [])

  const selectedId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return proyekId || params.get('proyekId') || proyek[0]?.id
  }, [proyek, proyekId])

  const currentProyek = proyek.find((item) => item.id === selectedId)

  useEffect(() => {
    setPotOpsDraft(String(currentProyek?.potOpsPerush || 0))
  }, [currentProyek?.id, currentProyek?.potOpsPerush])

  const summary = currentProyek ? hitungProyek(currentProyek, transaksi) : null

  const transaksiProyek = transaksi
    .filter((item) => item.proyekId === currentProyek?.id)
    .sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))

  const filteredTransaksiProyek = transaksiProyek.filter((item) => {
    const query = normalizeText(searchTerm)
    const haystack = normalizeText(
      [
        item.kategori,
        item.catatan,
        item.tipe,
        item.arah,
        item.nominal,
        item.tanggal,
      ].join(' ')
    )
    const searchMatch = !query || haystack.includes(query)
    const fromMatch = !dateFrom || String(item.tanggal || '') >= dateFrom
    const toMatch = !dateTo || String(item.tanggal || '') <= dateTo
    return searchMatch && fromMatch && toMatch
  })

  const resetHistoryFilter = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
  }

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const handlePotOpsChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '')
    setPotOpsDraft(digitsOnly)
  }

  const savePotOps = () => {
    const nextValue = Math.max(0, Number(potOpsDraft) || 0)
    setPotOpsDraft(String(nextValue))
    setPotOpsEditing(false)
    saveProyek(
      getProyek().map((item) =>
        item.id === currentProyek.id ? { ...item, potOpsPerush: nextValue } : item
      )
    )
    reload()
    showToast('Potongan ops tersimpan')
  }

  const confirmDelete = () => {
    deleteTransaksi(deleteTarget.id)
    setDeleteTarget(null)
    reload()
    showToast('Transaksi dihapus')
  }

  const startEditTanggal = (item) => {
    setEditingDateId(item.id)
    setEditingDateValue(item.tanggal || todayId())
  }

  const saveTanggalTransaksi = () => {
    if (!editingDateId) return
    const currentItem = transaksi.find((item) => item.id === editingDateId)
    if (editingDateValue && currentItem?.tanggal !== editingDateValue) {
      updateTransaksi(editingDateId, { tanggal: editingDateValue })
      reload()
      showToast('Tanggal diperbarui ✓')
    }
    setEditingDateId('')
    setEditingDateValue('')
  }

  const cancelTanggalTransaksi = () => {
    setEditingDateId('')
    setEditingDateValue('')
  }

  if (!currentProyek) return <EmptyDetail onNavigate={onNavigate} />

  if (editMode) {
    return (
      <EditProyek
        proyek={currentProyek}
        onCancel={() => setEditMode(false)}
        onSaved={() => {
          reload()
          setEditMode(false)
          showToast('Perubahan tersimpan')
        }}
        onDeleted={() => {
          reload()
          setEditMode(false)
          showToast('Proyek dihapus')
          onNavigate?.('projects')
        }}
      />
    )
  }

  return (
    <PageFrame
      title="Detail Proyek"
      subtitle={`${currentProyek.id} | ${currentProyek.nama}`}
      activePage="projects"
      onNavigate={onNavigate}
    >
      <button
        type="button"
        onClick={() => onNavigate?.('projects')}
        style={{
          minHeight: 40,
          width: 'fit-content',
          padding: '0 2px',
          border: 0,
          background: 'transparent',
          color: tokens.colors.primary.actionBlue,
          fontFamily: tokens.typography.family,
          fontSize: 13,
          fontWeight: 800,
          textAlign: 'left',
        }}
      >
        ← Daftar Proyek
      </button>

      <DetailCard title="Info proyek" note="data utama">
        <LabelRow label="Jenis" value={<Badge>{currentProyek.jenis}</Badge>} />
        <LabelRow label="Klien" value={currentProyek.klien || '-'} />
        <LabelRow label="Sumber" value={currentProyek.sumber || '-'} />
        <LabelRow label="Status" value={<Badge>{currentProyek.status}</Badge>} />
        <LabelRow label="Tanggal mulai" value={formatDate(currentProyek.tanggalMulai)} />
        {currentProyek.catatan ? (
          <span style={{ color: tokens.colors.text.slate, fontSize: 12 }}>
            {currentProyek.catatan}
          </span>
        ) : null}
        <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
          Regular = transaksi sekolah berulang. Project = kerja khusus non-sekolah.
        </span>
      </DetailCard>

      <DetailCard title="Ringkasan keuangan" note="dihitung otomatis">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
          <NumberTile label="Total Dana Talangan" value={summary.totalModal} color={tokens.colors.primary.corporateBlue} />
          <NumberTile label="Total Ops Proyek" value={summary.totalOps} />
          <NumberTile label="Total Masuk" value={summary.totalMasuk} color={tokens.colors.semantic.success} />
          <NumberTile label="Potongan Ops Perusahaan" value={summary.potOps} />
          <NumberTile label="Total Biaya" value={summary.totalBiaya} />
          <NumberTile
            label="Profit Bersih"
            value={summary.profitBersih}
            color={summary.profitBersih >= 0 ? tokens.colors.semantic.success : tokens.colors.semantic.error}
          />
          <NumberTile label="Sisa Piutang" value={summary.sisaPiutang} />
        </div>
      </DetailCard>

      <DetailCard title="Potongan Ops Perusahaan" note="tersimpan otomatis">
        <input
          type="text"
          inputMode="numeric"
          value={potOpsEditing ? potOpsDraft : fmtIDR(Number(potOpsDraft))}
          onFocus={() => setPotOpsEditing(true)}
          onChange={handlePotOpsChange}
          onBlur={savePotOps}
          aria-label="Potongan Ops Perusahaan manual"
          style={{ ...inputStyle, fontSize: 16, fontWeight: 800 }}
        />
        <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
          Jangan otomatis persentase. Pengelola isi manual.
        </span>
      </DetailCard>

      <DetailCard title="Progress pembayaran" note="masuk dibanding nilai pesanan">
        <ProgressBar
          value={summary.progressPct}
          color={summary.progressPct >= 100 ? tokens.colors.semantic.success : tokens.colors.primary.actionBlue}
        />
        <strong style={{ color: tokens.colors.text.ink, fontSize: 13 }}>
          {fmtIDR(summary.totalMasuk)} dari {fmtIDR(currentProyek.nilaiPesanan)} ({summary.progressPct}%)
        </strong>
      </DetailCard>

      <DetailCard
        title="Histori transaksi"
        note={`${filteredTransaksiProyek.length} dari ${transaksiProyek.length}`}
      >
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari kategori, catatan, tipe..."
            style={inputStyle}
          />
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
                onChange={(event) => setDateFrom(event.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
              <span style={{ color: tokens.colors.text.coolGray, fontSize: 11 }}>
                Sampai tanggal
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          {(searchTerm || dateFrom || dateTo) ? (
            <button
              type="button"
              onClick={resetHistoryFilter}
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

        {filteredTransaksiProyek.length > 0 ? (
          filteredTransaksiProyek.map((item) => (
            <div
              key={item.id}
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
              <div>
                <strong style={{ display: 'block', fontSize: 12 }}>{item.kategori}</strong>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4,
                    color: tokens.colors.text.slate,
                    fontSize: 11,
                  }}
                >
                  {editingDateId === item.id ? (
                    <input
                      type="date"
                      value={editingDateValue}
                      autoFocus
                      onChange={(event) => setEditingDateValue(event.target.value)}
                      onBlur={saveTanggalTransaksi}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          saveTanggalTransaksi()
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          cancelTanggalTransaksi()
                        }
                      }}
                      style={{
                        minHeight: 32,
                        maxWidth: 150,
                        border: `1px solid ${tokens.colors.line.lineBlue}`,
                        borderRadius: tokens.radius.sm,
                        padding: '0 8px',
                        background: tokens.colors.surface.white,
                        color: tokens.colors.text.ink,
                        fontSize: 11,
                        fontFamily: tokens.typography.family,
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditTanggal(item)}
                      title="Edit tanggal transaksi"
                      style={{
                        padding: 0,
                        border: 0,
                        borderBottom: `1px dashed ${tokens.colors.text.coolGray}`,
                        background: 'transparent',
                        color: tokens.colors.text.coolGray,
                        fontSize: 11,
                        fontFamily: tokens.typography.family,
                        lineHeight: 1.35,
                      }}
                    >
                      {formatDate(item.tanggal)}
                    </button>
                  )}
                  <span>| {item.catatan || 'Tanpa catatan'}</span>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color:
                      item.arah === 'masuk'
                        ? tokens.colors.semantic.success
                        : tokens.colors.semantic.error,
                  }}
                >
                  {item.arah === 'masuk' ? '+' : '-'} {fmtIDR(item.nominal)}
                </strong>
                <button
                  type="button"
                  aria-label="Hapus transaksi"
                  title="Hapus transaksi"
                  onClick={() => setDeleteTarget(item)}
                  style={{
                    marginTop: 6,
                    minHeight: 44,
                    minWidth: 44,
                    border: `1px solid ${tokens.colors.line.borderGray}`,
                    borderRadius: tokens.radius.md,
                    background: tokens.colors.surface.white,
                    color: tokens.colors.text.coolGray,
                    display: 'inline-grid',
                    placeItems: 'center',
                  }}
                >
                  <TrashIcon color={tokens.colors.text.coolGray} />
                </button>
              </div>
            </div>
          ))
        ) : transaksiProyek.length > 0 ? (
          <EmptyState
            title="Tidak ada transaksi yang cocok."
            description="Ubah kata kunci atau rentang tanggal untuk melihat transaksi lain."
            ctaLabel="Reset Filter"
            onCta={resetHistoryFilter}
          />
        ) : (
          <EmptyHistory />
        )}
      </DetailCard>

      <ActionButton variant="secondary" onClick={() => setEditMode(true)}>
        Edit Proyek
      </ActionButton>

      <Toast visible={Boolean(toast)}>{toast || 'Perubahan tersimpan'}</Toast>

      <DeleteSheet
        transaksi={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </PageFrame>
  )
}
