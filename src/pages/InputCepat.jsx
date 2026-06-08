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
import { BottomNav } from '../components/WireframeShared.jsx'
import { componentStyles, tokens } from '../designTokens'
import { QuickAmountChips, Toast } from '../components/ui.jsx'

const fieldStyle = {
  display: 'grid',
  gap: tokens.spacing.sm,
  ...componentStyles.card,
}

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
  fontWeight: tokens.typography.body.fontWeight,
  fontFamily: tokens.typography.family,
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
          gap: tokens.spacing.md,
        }}
      >
        <label
          style={{
            color: tokens.colors.text.ink,
            fontSize: tokens.typography.cardTitle.fontSize,
            fontWeight: tokens.typography.cardTitle.fontWeight,
          }}
        >
          {label}
        </label>
        {note ? (
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
              lineHeight: tokens.typography.caption.lineHeight,
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
  const [toast, setToast] = useState(false)
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
    setToast(true)
    resetForm()
    window.setTimeout(() => setToast(false), 2000)
  }

  return (
    <div
      className="app-frame"
      style={{
        background: tokens.colors.surface.page,
        boxSizing: 'border-box',
        fontFamily: tokens.typography.family,
      }}
    >
      <header
        className="app-header"
        style={{
          display: 'grid',
          gap: tokens.spacing.md,
          padding: '18px 16px 14px',
          borderBottom: `1px solid ${tokens.colors.line.borderGray}`,
          background: 'rgba(255, 255, 255, 0.92)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.md,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: tokens.colors.text.coolGray,
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: tokens.typography.caption.fontWeight,
              }}
            >
              JPA Finance System
            </p>
            <h1
              style={{
                margin: '4px 0 0',
                color: tokens.colors.text.ink,
                ...tokens.typography.pageTitle,
              }}
            >
              Input Cepat
            </h1>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: tokens.radius.md,
              background: tokens.colors.primary.jpaNavy,
              color: tokens.colors.text.inverse,
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
            gap: tokens.spacing.md,
            alignItems: 'center',
            color: tokens.colors.text.slate,
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: tokens.typography.caption.fontWeight,
          }}
        >
          <span>Tanggal transaksi</span>
          <input
            type="date"
            value={tanggal}
            onChange={(event) => handleTanggal(event.target.value)}
            style={{
              minHeight: 36,
              border: `1px solid ${tokens.colors.line.borderGray}`,
              borderRadius: tokens.radius.sm,
              padding: '0 8px',
              background: tokens.colors.surface.mistBlue,
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
              fontFamily: tokens.typography.family,
            }}
          />
        </label>
      </header>

      <section
        className="app-content motion-page"
        style={{
          display: 'grid',
          gap: tokens.spacing.md,
          padding: `${tokens.spacing.lg}px ${tokens.spacing.lg}px calc(96px + env(safe-area-inset-bottom))`,
        }}
      >
        {proyek.length === 0 ? (
          <section style={fieldStyle}>
            <strong
              style={{
                color: tokens.colors.text.ink,
                fontSize: tokens.typography.cardTitle.fontSize,
              }}
            >
              Buat proyek dulu
            </strong>
            <span
              style={{
                color: tokens.colors.text.slate,
                fontSize: tokens.typography.caption.fontSize,
                lineHeight: tokens.typography.caption.lineHeight,
              }}
            >
              Belum ada proyek aktif. Kamu masih bisa mencatat Ops Perusahaan
              Umum, tetapi transaksi proyek butuh proyek aktif.
            </span>
          </section>
        ) : null}

        <Field label="Masuk / Keluar">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing.sm,
            }}
          >
            {[ARAH_TRANSAKSI.masuk, ARAH_TRANSAKSI.keluar].map((item) => {
              const active = arah === item
              const activeColor =
                item === ARAH_TRANSAKSI.masuk
                  ? tokens.colors.semantic.success
                  : tokens.colors.semantic.error
              return (
                <button
                  key={item}
                  type="button"
                  className="motion-pressable"
                  onClick={() => handleArah(item)}
                  style={{
                    minHeight: 54,
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${active ? activeColor : tokens.colors.line.borderGray}`,
                    background: active ? activeColor : tokens.colors.surface.white,
                    color: active ? tokens.colors.text.inverse : tokens.colors.text.slate,
                    fontSize: 16,
                    fontWeight: 900,
                    fontFamily: tokens.typography.family,
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Proyek">
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
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            {selectedProject?.jenis || '-'} | {selectedProject?.klien || '-'}
          </span>
        </Field>

        <Field label="Nominal">
          <input
            type="number"
            inputMode="numeric"
            value={nominal}
            onChange={(event) => setNominal(event.target.value)}
            placeholder="Masukkan nominal"
            style={{
              ...inputStyle,
              minHeight: 52,
              fontSize: 24,
              fontWeight: 900,
            }}
          />
          <QuickAmountChips
            value={Number(nominal)}
            onChange={(value) => setNominal(String(value))}
          />
          <div
            style={{
              minHeight: 34,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              borderRadius: tokens.radius.sm,
              background: tokens.colors.surface.mistBlue,
              border: `1px dashed ${tokens.colors.line.lineBlue}`,
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.body.fontSize,
              fontWeight: 800,
            }}
          >
            {fmtIDR(Number(nominal))}
          </div>
        </Field>

        <Field label="Kategori">
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

        <Field label="Tipe transaksi" note="auto, bisa diubah">
          <div
            style={{
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: tokens.spacing.md,
              padding: '0 10px',
              border: `1px dashed ${tokens.colors.line.lineBlue}`,
              borderRadius: tokens.radius.sm,
              background: tokens.colors.surface.mistBlue,
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.body.fontSize,
            }}
          >
            <span>Auto</span>
            <strong style={{ color: tokens.colors.text.ink }}>{autoTipe}</strong>
          </div>
          <button
            type="button"
            className="motion-pressable"
            onClick={() => setShowOverride((value) => !value)}
            style={{
              minHeight: 48,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.line.lineBlue}`,
              background: tokens.colors.surface.white,
              color: tokens.colors.primary.jpaNavy,
              fontSize: tokens.typography.body.fontSize,
              fontWeight: 800,
              fontFamily: tokens.typography.family,
            }}
          >
            {showOverride ? 'Tutup ubah tipe' : 'Ubah tipe'}
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

        <Field label="Catatan">
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
          className="motion-pressable"
          onClick={handleSubmit}
          style={{
            ...componentStyles.primaryButton,
            width: '100%',
            fontSize: 15,
            fontFamily: tokens.typography.family,
          }}
        >
          Simpan Transaksi
        </button>

        <Toast visible={toast} />
      </section>

      <BottomNav activePage="input" onNavigate={onNavigate} />
    </div>
  )
}
