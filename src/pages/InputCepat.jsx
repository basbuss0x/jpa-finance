import React, { useEffect, useMemo, useState } from 'react'
import {
  ARAH_TRANSAKSI,
  KATEGORI,
  KATEGORI_BY_ARAH,
  PROYEK_UMUM_ID,
  TIPE_TRANSAKSI,
} from '../constants'
import { addTransaksi, getProyek } from '../store'
import { fmtIDR, labelTipeTransaksi } from '../utils'
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

const sourcePromptOptions = [
  {
    label: 'Uang pribadi saya',
    tipe: TIPE_TRANSAKSI.modal,
  },
  {
    label: 'Dari kas / sekolah',
    tipe: TIPE_TRANSAKSI.opsProyek,
  },
]

const opsiUmum = {
  id: PROYEK_UMUM_ID,
  nama: 'Ops Perusahaan (Umum)',
  klien: 'Overhead perusahaan',
  jenis: 'Ops Umum',
  status: 'Aktif',
}

const dateIdFromOffset = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatFullDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
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

function SourcePrompt({ tipe, onSelect }) {
  const helperText =
    tipe === TIPE_TRANSAKSI.opsProyek
      ? 'Pakai ini jika uang sudah ada dari sekolah atau dari laba proyek sebelumnya.'
      : 'Pakai ini jika uang keluar dari kantong pribadi Anda sebelum pembayaran dari sekolah masuk.'

  return (
    <div
      style={{
        display: 'grid',
        gap: tokens.spacing.sm,
        opacity: 1,
        transition: `opacity ${tokens.motion.base} ${tokens.motion.easeOut}`,
      }}
    >
      <span
        style={{
          color: tokens.colors.text.slate,
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        Sumber dana untuk pembelian ini?
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing.sm,
        }}
      >
        {sourcePromptOptions.map((option) => {
          const active = tipe === option.tipe
          return (
            <button
              key={option.tipe}
              type="button"
              className="motion-pressable"
              onClick={() => onSelect(option.tipe)}
              style={{
                minHeight: 36,
                borderRadius: tokens.radius.full,
                border: `1px solid ${
                  active ? tokens.colors.primary.actionBlue : tokens.colors.line.lineBlue
                }`,
                background: active ? tokens.colors.primary.actionBlue : tokens.colors.surface.white,
                color: active ? tokens.colors.text.inverse : tokens.colors.primary.jpaNavy,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: tokens.typography.family,
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <span
        style={{
          padding: '8px 12px',
          borderRadius: tokens.radius.sm,
          background: tokens.colors.surface.iceBlue,
          color: tokens.colors.text.coolGray,
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {helperText}
      </span>
    </div>
  )
}

export default function InputCepat({ screenDate, onDateChange, onNavigate }) {
  const today = useMemo(() => dateIdFromOffset(0), [])
  const dateShortcuts = useMemo(
    () => [
      { label: 'Hari ini', value: today },
      { label: 'Kemarin', value: dateIdFromOffset(-1) },
      { label: '2 hari lalu', value: dateIdFromOffset(-2) },
    ],
    [today]
  )
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
  const showSourcePrompt =
    arah === ARAH_TRANSAKSI.keluar && kategori === KATEGORI.bayarVendor
  const isNotToday = tanggal && tanggal !== today

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

        <Field label="Tanggal transaksi">
          <input
            type="date"
            value={tanggal}
            onChange={(event) => handleTanggal(event.target.value)}
            style={inputStyle}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: tokens.spacing.sm,
            }}
          >
            {dateShortcuts.map((item) => {
              const active = tanggal === item.value
              return (
                <button
                  key={item.label}
                  type="button"
                  className="motion-pressable"
                  onClick={() => handleTanggal(item.value)}
                  style={{
                    minHeight: 32,
                    padding: '0 12px',
                    borderRadius: tokens.radius.full,
                    border: `1px solid ${
                      active ? tokens.colors.primary.actionBlue : tokens.colors.line.borderGray
                    }`,
                    background: active ? tokens.colors.primary.actionBlue : tokens.colors.surface.white,
                    color: active ? tokens.colors.text.inverse : tokens.colors.text.coolGray,
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: tokens.typography.family,
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {isNotToday ? (
            <span
              style={{
                color: tokens.colors.semantic.warning,
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              Mencatat untuk {formatFullDate(tanggal)}
            </span>
          ) : null}
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
          {showSourcePrompt ? (
            <SourcePrompt tipe={tipe} onSelect={(nextTipe) => setManualTipe(nextTipe)} />
          ) : null}
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
            <strong style={{ color: tokens.colors.text.ink }}>
              {labelTipeTransaksi(autoTipe)}
            </strong>
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
                  {labelTipeTransaksi(item)}
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
