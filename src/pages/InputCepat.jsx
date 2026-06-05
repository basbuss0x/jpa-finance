import React, { useEffect, useMemo, useState } from 'react'
import {
  ARAH_TRANSAKSI,
  KATEGORI,
  KATEGORI_BY_ARAH,
  PROYEK_UMUM_ID,
  TIPE_TRANSAKSI,
} from '../constants'
import { addTransaksi, getProyek } from '../store'
import { fmtIDR } from '../utils'
import { BottomNav, WireButton, gray } from '../components/WireframeShared.jsx'

const fieldStyle = {
  display: 'grid',
  gap: 8,
  padding: 12,
  border: `1px solid ${gray.line}`,
  background: gray.card,
  borderRadius: 8,
}

const inputStyle = {
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

const tipeOptions = [
  TIPE_TRANSAKSI.modal,
  TIPE_TRANSAKSI.opsProyek,
  TIPE_TRANSAKSI.opsPerusahaan,
  TIPE_TRANSAKSI.penerimaan,
  TIPE_TRANSAKSI.pengembalian,
]

const opsiUmum = {
  id: PROYEK_UMUM_ID,
  nama: 'Ops Perusahaan (Umum)',
  klien: 'Overhead perusahaan',
  jenis: 'Ops Umum',
  status: 'Aktif',
}

function inferTipe(arah, kategori, proyekId) {
  if (arah === ARAH_TRANSAKSI.masuk) return TIPE_TRANSAKSI.penerimaan
  if (proyekId === PROYEK_UMUM_ID) return TIPE_TRANSAKSI.opsPerusahaan
  if (kategori === KATEGORI.bayarVendor) return TIPE_TRANSAKSI.modal
  if (
    [
      KATEGORI.meetingEntertain,
      KATEGORI.sewa,
      KATEGORI.pinjamanKeluar,
    ].includes(kategori)
  ) {
    return TIPE_TRANSAKSI.opsPerusahaan
  }
  return TIPE_TRANSAKSI.opsProyek
}

function Field({ label, note, children }) {
  return (
    <section style={fieldStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        <label style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
          {label}
        </label>
        {note ? (
          <span
            style={{
              color: gray.mid,
              fontSize: 10,
              lineHeight: 1.25,
              textAlign: 'right',
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

export default function InputCepat({ screenDate, onDateChange, onNavigate }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [tanggal, setTanggal] = useState(screenDate || today)
  const [proyek, setProyek] = useState([])
  const [arah, setArah] = useState(ARAH_TRANSAKSI.keluar)
  const [proyekId, setProyekId] = useState('')
  const [nominal, setNominal] = useState('')
  const [kategori, setKategori] = useState(KATEGORI.bayarVendor)
  const [manualTipe, setManualTipe] = useState('')
  const [showOverride, setShowOverride] = useState(false)
  const [catatan, setCatatan] = useState('')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const activeProjects = getProyek().filter((item) => item.status === 'Aktif')
    setProyek(activeProjects)
    setProyekId(activeProjects[0]?.id || PROYEK_UMUM_ID)
  }, [])

  useEffect(() => {
    if (screenDate && screenDate !== tanggal) setTanggal(screenDate)
  }, [screenDate, tanggal])

  const projectOptions = useMemo(() => [...proyek, opsiUmum], [proyek])
  const selectedProject = projectOptions.find((item) => item.id === proyekId)
  const categories = KATEGORI_BY_ARAH[arah]
  const autoTipe = inferTipe(arah, kategori, proyekId)
  const tipe = manualTipe || autoTipe

  const handleArah = (nextArah) => {
    setArah(nextArah)
    setKategori(KATEGORI_BY_ARAH[nextArah][0])
    setManualTipe('')
    setShowOverride(false)
  }

  const handleTanggal = (nextTanggal) => {
    setTanggal(nextTanggal)
    onDateChange?.(nextTanggal)
  }

  const resetForm = () => {
    setArah(ARAH_TRANSAKSI.keluar)
    setProyekId(proyek[0]?.id || PROYEK_UMUM_ID)
    setNominal('')
    setKategori(KATEGORI.bayarVendor)
    setManualTipe('')
    setShowOverride(false)
    setCatatan('')
  }

  const handleSubmit = () => {
    const nominalNumber = Number(nominal)
    if (!proyekId) {
      setError('Pilih proyek dulu.')
      return
    }
    if (!nominalNumber || nominalNumber <= 0) {
      setError('Nominal wajib lebih dari 0.')
      return
    }

    addTransaksi({
      id: String(Date.now()),
      proyekId,
      tanggal,
      arah,
      tipe,
      kategori,
      nominal: nominalNumber,
      catatan,
    })

    setError('')
    setToast('Tersimpan ✓')
    resetForm()
    window.setTimeout(() => setToast(''), 2000)
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 390,
        minHeight: 'calc(100vh - 32px)',
        background: gray.bg,
        border: `1px solid ${gray.mid}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        boxSizing: 'border-box',
      }}
    >
      <header
        style={{
          display: 'grid',
          gap: 12,
          padding: '16px 16px 12px',
          borderBottom: `1px solid ${gray.line}`,
          background: gray.card,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p style={{ margin: 0, color: gray.mid, fontSize: 11 }}>
              JPA Finance System
            </p>
            <h1 style={{ margin: '4px 0 0', color: gray.ink, fontSize: 22 }}>
              Input Cepat
            </h1>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              background: gray.primary,
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            JPA
          </div>
        </div>

        <label
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 10,
            alignItems: 'center',
            color: gray.text,
            fontSize: 12,
          }}
        >
          <span>Tanggal transaksi</span>
          <input
            type="date"
            value={tanggal}
            onChange={(event) => handleTanggal(event.target.value)}
            style={{
              minHeight: 36,
              border: `1px solid ${gray.line}`,
              borderRadius: 6,
              padding: '0 8px',
              background: gray.bg,
              color: gray.text,
              fontSize: 12,
            }}
          />
        </label>
      </header>

      <section style={{ display: 'grid', gap: 10, padding: 12 }}>
        {proyek.length === 0 ? (
          <section style={fieldStyle}>
            <strong style={{ color: gray.ink, fontSize: 14 }}>Buat proyek dulu</strong>
            <span style={{ color: gray.text, fontSize: 12, lineHeight: 1.4 }}>
              Belum ada proyek aktif. Kamu masih bisa mencatat Ops Perusahaan
              Umum, tetapi transaksi proyek butuh proyek aktif.
            </span>
          </section>
        ) : null}

        <Field label="1. Masuk / Keluar" note="tap besar, full width">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[ARAH_TRANSAKSI.masuk, ARAH_TRANSAKSI.keluar].map((item) => {
              const active = arah === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleArah(item)}
                  style={{
                    minHeight: 54,
                    borderRadius: 6,
                    border: `2px solid ${active ? (item === ARAH_TRANSAKSI.masuk ? gray.success : gray.danger) : gray.line}`,
                    background: active ? (item === ARAH_TRANSAKSI.masuk ? gray.success : gray.danger) : gray.bg,
                    color: active ? '#fff' : gray.text,
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="2. Proyek" note="aktif + Ops Umum">
          <select
            value={proyekId}
            onChange={(event) => {
              setProyekId(event.target.value)
              setManualTipe('')
            }}
            style={inputStyle}
          >
            {projectOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id === PROYEK_UMUM_ID
                  ? item.nama
                  : `${item.id} - ${item.nama}`}
              </option>
            ))}
          </select>
          <span style={{ color: gray.mid, fontSize: 11 }}>
            {selectedProject?.jenis || '-'} | {selectedProject?.klien || '-'}
          </span>
        </Field>

        <Field label="3. Nominal" note="keyboard angka">
          <input
            type="number"
            inputMode="numeric"
            value={nominal}
            onChange={(event) => setNominal(event.target.value)}
            placeholder="Contoh: 25000000"
            style={{
              ...inputStyle,
              minHeight: 52,
              fontSize: 22,
              fontWeight: 900,
            }}
          />
          <div
            style={{
              minHeight: 34,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              borderRadius: 6,
              background: gray.bg,
              border: `1px dashed ${gray.mid}`,
              color: gray.text,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Terbaca: {fmtIDR(Number(nominal))}
          </div>
        </Field>

        <Field label="4. Kategori" note="filter ikut arah">
          <select
            value={kategori}
            onChange={(event) => {
              setKategori(event.target.value)
              setManualTipe('')
            }}
            style={inputStyle}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="5. Tipe" note="auto, bisa override">
          <div
            style={{
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '0 10px',
              border: `1px dashed ${gray.mid}`,
              borderRadius: 6,
              background: gray.bg,
              color: gray.text,
              fontSize: 13,
            }}
          >
            <span>Auto</span>
            <strong style={{ color: gray.ink }}>{autoTipe}</strong>
          </div>
          <button
            type="button"
            onClick={() => setShowOverride((value) => !value)}
            style={{
              minHeight: 48,
              borderRadius: 6,
              border: `1px solid ${gray.mid}`,
              background: gray.card,
              color: gray.ink,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {showOverride ? 'Tutup override' : 'Override manual'}
          </button>
          {showOverride ? (
            <select
              value={tipe}
              onChange={(event) => setManualTipe(event.target.value)}
              style={inputStyle}
            >
              {tipeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : null}
        </Field>

        <Field label="6. Catatan" note="opsional">
          <input
            type="text"
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            placeholder="Keterangan (opsional)"
            style={inputStyle}
          />
        </Field>

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

        <WireButton onClick={handleSubmit}>Simpan Transaksi</WireButton>

        {toast ? (
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 74,
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)',
              maxWidth: 358,
              minHeight: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              background: gray.primary,
              color: '#fff',
              fontSize: 13,
              fontWeight: 900,
              zIndex: 30,
            }}
          >
            {toast}
          </div>
        ) : null}
      </section>

      <BottomNav activePage="input" onNavigate={onNavigate} />
    </div>
  )
}
