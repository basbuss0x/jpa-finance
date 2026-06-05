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
} from '../store'
import { fmtIDR, hitungProyek } from '../utils'
import {
  Badge,
  Card,
  LabelRow,
  PageFrame,
  ProgressBar,
  WireButton,
  gray,
} from '../components/WireframeShared.jsx'

const fieldStyle = {
  width: '100%',
  minHeight: 48,
  border: `1px solid ${gray.mid}`,
  borderRadius: 6,
  padding: '0 12px',
  background: gray.bg,
  color: gray.ink,
  boxSizing: 'border-box',
  fontSize: 14,
}

const todayId = () => new Date().toISOString().slice(0, 10)

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function Segmented({ label, options, value, onChange }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>{label}</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: 6,
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
                border: `1px solid ${active ? gray.gold : gray.line}`,
                borderRadius: 6,
                background: active ? gray.primary : gray.bg,
                color: active ? '#fff' : gray.text,
                fontSize: 11,
                fontWeight: 800,
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

function NumberTile({ label, value, color }) {
  return (
    <div
      style={{
        minHeight: 72,
        padding: 10,
        border: `1px solid ${gray.line}`,
        borderRadius: 8,
        background: gray.bg,
      }}
    >
      <span style={{ display: 'block', color: gray.text, fontSize: 10 }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 8, fontSize: 13, color: color || gray.ink }}>
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
      <Card title="Belum ada proyek" note="empty state">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: 12 }}>
          <div
            aria-hidden="true"
            style={{
              width: 88,
              height: 64,
              border: `1px solid ${gray.mid}`,
              borderRadius: 8,
              background: gray.bg,
            }}
          />
          <strong style={{ color: gray.ink, fontSize: 16 }}>Belum ada proyek</strong>
          <span style={{ color: gray.text, fontSize: 12, textAlign: 'center' }}>
            Buat proyek dulu sebelum melihat detail keuangan.
          </span>
        </div>
        <WireButton onClick={() => onNavigate?.('projects')}>Ke Daftar Proyek</WireButton>
      </Card>
    </PageFrame>
  )
}

function EmptyHistory() {
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: 6,
        padding: 14,
        border: `1px dashed ${gray.mid}`,
        borderRadius: 8,
        background: gray.bg,
        textAlign: 'center',
      }}
    >
      <strong style={{ color: gray.ink, fontSize: 13 }}>
        Belum ada transaksi di proyek ini
      </strong>
      <span style={{ color: gray.text, fontSize: 11 }}>
        Tap Input untuk mulai mencatat
      </span>
    </div>
  )
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
        background: 'rgba(0,0,0,0.45)',
        zIndex: 20,
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 390,
          display: 'grid',
          gap: 10,
          padding: 16,
          borderRadius: '16px 16px 0 0',
          background: gray.card,
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ margin: 0, color: gray.ink, fontSize: 18 }}>
          Hapus transaksi ini?
        </h2>
        <div
          style={{
            display: 'grid',
            gap: 6,
            padding: 10,
            border: `1px solid ${gray.line}`,
            borderRadius: 8,
            background: gray.bg,
            fontSize: 12,
          }}
        >
          <strong>{transaksi.kategori}</strong>
          <span>{fmtIDR(transaksi.nominal)} | {formatDate(transaksi.tanggal)}</span>
          <span style={{ color: gray.text }}>{transaksi.catatan || 'Tanpa catatan'}</span>
        </div>
        <WireButton onClick={onConfirm}>Ya, Hapus</WireButton>
        <WireButton variant="secondary" onClick={onCancel}>Batal</WireButton>
        <span style={{ color: gray.mid, fontSize: 10 }}>
          Bottom sheet dipakai karena lebih natural untuk aksi konfirmasi di HP.
        </span>
      </section>
    </div>
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
    const nextProyek = getProyek().map((item) =>
      item.id === proyek.id ? nextItem : item
    )
    saveProyek(nextProyek)
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
      <WireButton variant="secondary" onClick={onCancel}>
        {'<-'} Kembali
      </WireButton>

      <Card title="Data proyek" note="pre-filled">
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Nama Proyek
          </span>
          <input value={nama} onChange={(e) => setNama(e.target.value)} style={fieldStyle} />
        </label>
        <Segmented
          label="Jenis Transaksi"
          options={JENIS_PROYEK_OPTIONS}
          value={jenis}
          onChange={setJenis}
        />
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>Klien</span>
          <input value={klien} onChange={(e) => setKlien(e.target.value)} style={fieldStyle} />
        </label>
        <Segmented
          label="Sumber"
          options={SUMBER_PROYEK_OPTIONS}
          value={sumber}
          onChange={setSumber}
        />
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Nilai Pesanan
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={nilaiPesanan}
            onChange={(e) => setNilaiPesanan(e.target.value)}
            style={fieldStyle}
          />
          <span style={{ color: gray.mid, fontSize: 10 }}>
            Terbaca: {fmtIDR(Number(nilaiPesanan))}
          </span>
        </label>
        <Segmented
          label="Status"
          options={STATUS_PROYEK_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Tanggal Mulai
          </span>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>Catatan</span>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, minHeight: 76, padding: 12, resize: 'none' }}
          />
        </label>
      </Card>

      {error ? (
        <div
          style={{
            padding: 10,
            border: `1px solid ${gray.ink}`,
            borderRadius: 8,
            background: gray.card,
            color: gray.ink,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}

      <WireButton onClick={handleSave}>Simpan Perubahan</WireButton>

      <Card title="Zona bahaya" note="konfirmasi 2 langkah">
        <div
          style={{
            display: 'grid',
            gap: 8,
            padding: 10,
            border: `1px solid ${gray.danger}`,
            borderRadius: 8,
            background: '#fff1f2',
          }}
        >
          <strong style={{ color: gray.danger, fontSize: 13 }}>Hapus Proyek</strong>
          <span style={{ color: gray.text, fontSize: 12 }}>
            Semua transaksi terkait proyek ini juga akan terhapus permanen.
          </span>
          <strong style={{ color: gray.ink, fontSize: 12 }}>{proyek.nama}</strong>
          {deleteOpen ? (
            <input
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              placeholder='Ketik "HAPUS" untuk konfirmasi'
              style={fieldStyle}
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteOpen && deleteText !== 'HAPUS'}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: 8,
            border: `1px solid ${gray.danger}`,
            background: deleteOpen && deleteText !== 'HAPUS' ? gray.line : gray.card,
            color: deleteOpen && deleteText !== 'HAPUS' ? gray.mid : gray.danger,
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {deleteOpen ? 'Konfirmasi Hapus Proyek' : 'Hapus Proyek'}
        </button>
      </Card>
    </PageFrame>
  )
}

export default function DetailProyek({ proyekId, onNavigate }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [potOpsDraft, setPotOpsDraft] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')

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

  const summary = currentProyek
    ? hitungProyek(currentProyek, transaksi)
    : null

  const transaksiProyek = transaksi
    .filter((item) => item.proyekId === currentProyek?.id)
    .sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const savePotOps = () => {
    const nextValue = Math.max(0, Number(potOpsDraft) || 0)
    const nextProyek = getProyek().map((item) =>
      item.id === currentProyek.id ? { ...item, potOpsPerush: nextValue } : item
    )
    saveProyek(nextProyek)
    reload()
    showToast('Potongan ops tersimpan')
  }

  const confirmDelete = () => {
    deleteTransaksi(deleteTarget.id)
    setDeleteTarget(null)
    reload()
    showToast('Transaksi dihapus')
  }

  if (!currentProyek) {
    return <EmptyDetail onNavigate={onNavigate} />
  }

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
      <WireButton variant="secondary" onClick={() => onNavigate?.('projects')}>
        Kembali ke Daftar Proyek
      </WireButton>

      <Card title="Header proyek" note="identitas ringkas">
        <LabelRow label="Jenis" value={<Badge>{currentProyek.jenis}</Badge>} />
        <LabelRow label="Klien" value={currentProyek.klien || '-'} />
        <LabelRow label="Sumber" value={currentProyek.sumber || '-'} />
        <LabelRow label="Status" value={<Badge>{currentProyek.status}</Badge>} />
        <LabelRow label="Tanggal mulai" value={formatDate(currentProyek.tanggalMulai)} />
        {currentProyek.catatan ? (
          <span style={{ color: gray.text, fontSize: 11 }}>{currentProyek.catatan}</span>
        ) : null}
        <span style={{ color: gray.mid, fontSize: 10 }}>
          Regular = transaksi sekolah berulang. Project = kerja khusus non-sekolah.
        </span>
      </Card>

      <Card title="Ringkasan keuangan" note="computed dari transaksi">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <NumberTile label="Total Dana Talangan" value={summary.totalModal} />
          <NumberTile label="Total Ops Proyek" value={summary.totalOps} />
          <NumberTile label="Total Masuk" value={summary.totalMasuk} color={gray.success} />
          <NumberTile label="Potongan Ops Perush" value={summary.potOps} />
          <NumberTile
            label="Profit Bersih"
            value={summary.profitBersih}
            color={summary.profitBersih >= 0 ? gray.success : gray.danger}
          />
          <NumberTile label="Sisa Piutang" value={summary.sisaPiutang} />
        </div>
      </Card>

      <Card title="Potongan Ops Perusahaan" note="manual, autosave on blur">
        <input
          type="number"
          inputMode="numeric"
          value={potOpsDraft}
          onChange={(event) => setPotOpsDraft(event.target.value)}
          onBlur={savePotOps}
          aria-label="Potongan Ops Perusahaan manual"
          style={{
            ...fieldStyle,
            fontSize: 16,
            fontWeight: 800,
          }}
        />
        <span style={{ color: gray.mid, fontSize: 10 }}>
          Jangan otomatis persentase. Pengelola isi manual.
        </span>
      </Card>

      <Card title="Progress pembayaran" note="Total Masuk / Nilai Pesanan">
        <ProgressBar
          value={summary.progressPct}
          color={summary.progressPct >= 100 ? gray.success : gray.gold}
        />
        <strong style={{ color: gray.ink, fontSize: 13 }}>
          {fmtIDR(summary.totalMasuk)} dari {fmtIDR(currentProyek.nilaiPesanan)} (
          {summary.progressPct}%)
        </strong>
      </Card>

      <Card title="Histori transaksi" note="terbaru di atas">
        {transaksiProyek.length > 0 ? (
          transaksiProyek.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                padding: 10,
                border: `1px solid ${gray.line}`,
                borderRadius: 8,
                background: gray.bg,
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: 12 }}>{item.kategori}</strong>
                <span style={{ color: gray.text, fontSize: 11 }}>
                  {formatDate(item.tanggal)} | {item.catatan || 'Tanpa catatan'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: item.arah === 'masuk' ? gray.success : gray.danger,
                  }}
                >
                  {item.arah === 'masuk' ? '+' : '-'} {fmtIDR(item.nominal)}
                </strong>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  style={{
                    marginTop: 6,
                    minHeight: 48,
                    minWidth: 64,
                    border: `1px solid ${gray.mid}`,
                    borderRadius: 6,
                    background: gray.card,
                    color: gray.danger,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyHistory />
        )}
      </Card>

      <WireButton variant="secondary" onClick={() => setEditMode(true)}>
        Edit Proyek
      </WireButton>

      {toast ? (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 74,
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 358,
            minHeight: 48,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 8,
            background: gray.primary,
            color: '#fff',
            fontSize: 13,
            fontWeight: 800,
            zIndex: 30,
          }}
        >
          {toast}
        </div>
      ) : null}

      <DeleteSheet
        transaksi={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </PageFrame>
  )
}
