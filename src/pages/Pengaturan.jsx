import React, { useEffect, useRef, useState } from 'react'
import {
  exportBackup,
  exportExcel,
  getSettings,
  importBackup,
  resetAllData,
  saveSettings,
} from '../store'
import { LabelRow, PageFrame } from '../components/WireframeShared.jsx'
import { Toast } from '../components/ui.jsx'
import { componentStyles, tokens } from '../designTokens'

const inputStyle = {
  width: '100%',
  minHeight: 50,
  padding: '0 14px',
  border: `1px solid ${tokens.colors.line.borderGray}`,
  borderRadius: tokens.radius.md,
  background: tokens.colors.surface.white,
  boxSizing: 'border-box',
  color: tokens.colors.text.ink,
  fontSize: tokens.typography.body.fontSize,
  fontWeight: 600,
  fontFamily: tokens.typography.family,
}

function formatDateTime(value) {
  if (!value) return 'Belum pernah backup'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function SettingsCard({ title, note, children, style }) {
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

function PrimaryAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...componentStyles.primaryButton,
        width: '100%',
        background: tokens.colors.primary.actionBlue,
        fontFamily: tokens.typography.family,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...componentStyles.secondaryButton,
        width: '100%',
        background: tokens.colors.surface.white,
        borderColor: tokens.colors.primary.actionBlue,
        color: tokens.colors.primary.actionBlue,
        fontFamily: tokens.typography.family,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  )
}

export default function Pengaturan({ onNavigate }) {
  const fileInputRef = useRef(null)
  const [settings, setSettings] = useState(getSettings)
  const [companyName, setCompanyName] = useState('')
  const [importPayload, setImportPayload] = useState(null)
  const [importName, setImportName] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetText, setResetText] = useState('')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const reloadSettings = () => {
    const next = getSettings()
    setSettings(next)
    setCompanyName(next.namaPerusahaan || '')
  }

  useEffect(() => {
    reloadSettings()
  }, [])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const handleExport = () => {
    exportBackup()
    reloadSettings()
    showToast('Backup diexport')
  }

  const handleExportExcel = async () => {
    await exportExcel()
    showToast('Workbook Excel diexport')
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setError('')
    setImportPayload(null)
    setImportName('')
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || '{}'))
        if (!Array.isArray(payload.proyek) || !Array.isArray(payload.transaksi)) {
          setError('File backup tidak valid. Pastikan berisi proyek dan transaksi.')
          return
        }
        setImportPayload(payload)
        setImportName(file.name)
      } catch {
        setError('File JSON tidak bisa dibaca.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleImport = () => {
    if (!importPayload) {
      fileInputRef.current?.click()
      return
    }
    importBackup(importPayload)
    reloadSettings()
    setImportPayload(null)
    setImportName('')
    showToast('Backup diimport')
  }

  const saveCompanyName = () => {
    const nextName = companyName.trim() || settings.namaPerusahaan
    const next = { ...settings, namaPerusahaan: nextName }
    saveSettings(next)
    setSettings(next)
    setCompanyName(nextName)
    showToast('Info perusahaan tersimpan')
  }

  const handleReset = () => {
    if (!resetOpen) {
      setResetOpen(true)
      setResetText('')
      return
    }

    if (resetText !== 'HAPUS') return
    resetAllData()
    reloadSettings()
    setImportPayload(null)
    setImportName('')
    setResetOpen(false)
    setResetText('')
    showToast('Semua data dihapus')
  }

  return (
    <PageFrame
      title="Backup & Pengaturan"
      subtitle="Kelola data lokal dan info aplikasi."
      activePage="settings"
      onNavigate={onNavigate}
    >
      <SettingsCard title="Status Backup">
        <div
          style={{
            display: 'grid',
            gap: tokens.spacing.xs,
            padding: tokens.spacing.md,
            border: `1px solid ${tokens.colors.line.lineBlue}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.surface.mistBlue,
          }}
        >
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            Backup terakhir
          </span>
          <strong
            style={{
              color: tokens.colors.text.ink,
              fontSize: tokens.typography.cardTitle.fontSize,
            }}
          >
            {formatDateTime(settings.lastBackup)}
          </strong>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            Simpan backup rutin ke Google Drive atau folder aman.
          </span>
        </div>
      </SettingsCard>

      <SettingsCard title="Backup data">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <PrimaryAction onClick={handleExport}>Export Backup (JSON)</PrimaryAction>
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            Simpan file backup ke perangkat.
          </span>
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <SecondaryAction onClick={handleExportExcel}>
            Export Excel (.xlsx)
          </SecondaryAction>
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            Unduh workbook profesional berisi Dashboard, Proyek, Transaksi,
            Kas Masuk/Keluar, Ringkasan REG/PRJ, QA Checks, dan Settings.
          </span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: 78,
            padding: tokens.spacing.md,
            border: `1px dashed ${tokens.colors.line.lineBlue}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.surface.mistBlue,
            textAlign: 'center',
            color: tokens.colors.text.ink,
            fontFamily: tokens.typography.family,
          }}
        >
          <strong style={{ fontSize: 13 }}>
            {importName ? 'File siap diimport' : 'Area Upload Backup'}
          </strong>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            {importName || 'Tap untuk pilih file JSON dari HP'}
          </span>
        </button>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <SecondaryAction onClick={handleImport}>
            {importPayload ? 'Konfirmasi Import Backup' : 'Import Backup'}
          </SecondaryAction>
          <span
            style={{
              color: tokens.colors.text.coolGray,
              fontSize: tokens.typography.caption.fontSize,
            }}
          >
            Pulihkan data dari file backup. Import akan mengganti semua data lokal.
          </span>
        </div>
      </SettingsCard>

      <SettingsCard title="Pengingat backup mingguan" note="Disarankan">
        <p
          style={{
            margin: 0,
            color: tokens.colors.text.slate,
            fontFamily: tokens.typography.family,
            ...tokens.typography.body,
          }}
        >
          Karena data tersimpan di browser HP, export backup rutin membantu mencegah
          kehilangan data saat cache browser dibersihkan atau perangkat diganti.
        </p>
      </SettingsCard>

      <SettingsCard title="Info aplikasi">
        <label style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 800,
            }}
          >
            Nama perusahaan
          </span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            onBlur={saveCompanyName}
            style={inputStyle}
          />
        </label>
        <LabelRow label="Versi Aplikasi" value={settings.versi} />
        <LabelRow label="Storage" value="localStorage" />
      </SettingsCard>

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

      <SettingsCard
        title="Zona Berbahaya"
        style={{
          marginTop: tokens.spacing.xl,
          background: tokens.colors.danger.tint,
          borderColor: tokens.colors.danger.border,
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <strong
            style={{
              color: tokens.colors.semantic.error,
              fontSize: tokens.typography.cardTitle.fontSize,
            }}
          >
            Hapus Semua Data
          </strong>
          <span
            style={{
              color: tokens.colors.text.slate,
              fontSize: tokens.typography.body.fontSize,
              lineHeight: 1.45,
            }}
          >
            Tindakan ini akan menghapus semua data lokal dan tidak dapat dibatalkan.
          </span>
          {resetOpen ? (
            <input
              value={resetText}
              onChange={(event) => setResetText(event.target.value)}
              placeholder='Ketik "HAPUS"'
              style={{
                ...inputStyle,
                borderColor: tokens.colors.danger.border,
              }}
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetOpen && resetText !== 'HAPUS'}
          style={{
            width: '100%',
            minHeight: 52,
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.colors.semantic.error}`,
            background:
              resetOpen && resetText !== 'HAPUS'
                ? tokens.colors.danger.border
                : tokens.colors.surface.white,
            color:
              resetOpen && resetText !== 'HAPUS'
                ? tokens.colors.text.coolGray
                : tokens.colors.semantic.error,
            fontSize: 14,
            fontWeight: 900,
            fontFamily: tokens.typography.family,
          }}
        >
          {resetOpen ? 'Konfirmasi Hapus Semua Data' : 'Hapus Semua Data'}
        </button>
      </SettingsCard>

      <Toast visible={Boolean(toast)}>{toast || 'Pengaturan tersimpan'}</Toast>
    </PageFrame>
  )
}
