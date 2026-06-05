import React, { useEffect, useRef, useState } from 'react'
import {
  exportBackup,
  getSettings,
  importBackup,
  resetAllData,
  saveSettings,
} from '../store'
import {
  Card,
  LabelRow,
  PageFrame,
  WireButton,
  gray,
} from '../components/WireframeShared.jsx'

const inputStyle = {
  width: '100%',
  minHeight: 48,
  padding: '0 12px',
  border: `1px solid ${gray.mid}`,
  borderRadius: 6,
  background: gray.bg,
  boxSizing: 'border-box',
  color: gray.ink,
  fontSize: 14,
  fontWeight: 700,
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

function Toast({ children }) {
  if (!children) return null

  return (
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
        fontWeight: 800,
        zIndex: 30,
      }}
    >
      {children}
    </div>
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
      title="Pengaturan & Backup"
      subtitle="Backup data lokal dan info aplikasi."
      activePage="settings"
      onNavigate={onNavigate}
    >
      <Card title="Backup data" note="JSON untuk disimpan di HP/Drive">
        <div
          style={{
            display: 'grid',
            gap: 4,
            padding: 10,
            border: `1px dashed ${gray.mid}`,
            borderRadius: 8,
            background: gray.bg,
          }}
        >
          <span style={{ color: gray.text, fontSize: 11 }}>Backup terakhir</span>
          <strong style={{ color: gray.ink, fontSize: 14 }}>
            {formatDateTime(settings.lastBackup)}
          </strong>
        </div>
        <WireButton onClick={handleExport}>Export Backup (JSON)</WireButton>
        <span style={{ color: gray.mid, fontSize: 10 }}>
          File: jpa-backup-{new Date().toISOString().slice(0, 10)}.json
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: 76,
            padding: 10,
            border: `1px dashed ${gray.mid}`,
            borderRadius: 8,
            background: gray.bg,
            textAlign: 'center',
            color: gray.ink,
          }}
        >
          <strong style={{ fontSize: 13 }}>
            {importName ? 'File siap diimport' : 'Area Upload Backup'}
          </strong>
          <span style={{ color: gray.text, fontSize: 11 }}>
            {importName || 'Tap untuk pilih file JSON dari HP'}
          </span>
        </button>
        <WireButton variant="secondary" onClick={handleImport}>
          {importPayload ? 'Konfirmasi Import Backup' : 'Import Backup'}
        </WireButton>
        <span style={{ color: gray.mid, fontSize: 10 }}>
          Upload JSON, replace semua data setelah konfirmasi.
        </span>
      </Card>

      <Card title="Reset data" note="konfirmasi 2 langkah">
        <div
          style={{
            display: 'grid',
            gap: 8,
            padding: 10,
            border: `2px solid ${gray.ink}`,
            borderRadius: 8,
            background: gray.card,
          }}
        >
          <strong style={{ color: gray.ink, fontSize: 13 }}>Hapus Semua Data</strong>
          <span style={{ color: gray.text, fontSize: 12 }}>
            Step 1: tap tombol reset. Step 2: ketik HAPUS untuk konfirmasi.
          </span>
          {resetOpen ? (
            <input
              value={resetText}
              onChange={(event) => setResetText(event.target.value)}
              placeholder='Ketik "HAPUS"'
              style={inputStyle}
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetOpen && resetText !== 'HAPUS'}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: 8,
            border: `2px solid ${gray.ink}`,
            background: resetOpen && resetText !== 'HAPUS' ? gray.line : '#fff',
            color: resetOpen && resetText !== 'HAPUS' ? gray.mid : gray.ink,
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {resetOpen ? 'Konfirmasi Hapus Semua Data' : 'Hapus Semua Data'}
        </button>
      </Card>

      <Card title="Info perusahaan" note="editable">
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: gray.text, fontSize: 12 }}>Nama perusahaan</span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            onBlur={saveCompanyName}
            style={inputStyle}
          />
        </label>
        <LabelRow label="Versi app" value={settings.versi} />
        <LabelRow label="Storage" value="localStorage" />
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

      <Card title="Catatan" note="Phase 1">
        <p style={{ margin: 0, color: gray.text, fontSize: 12, lineHeight: 1.45 }}>
          Backup berisi proyek, transaksi, settings, dan waktu export. Import akan
          mengganti seluruh data lokal setelah tombol konfirmasi ditekan.
        </p>
      </Card>

      <Toast>{toast}</Toast>
    </PageFrame>
  )
}
