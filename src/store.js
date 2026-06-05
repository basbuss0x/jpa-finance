import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants'

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const getProyek = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.proyek), [])

export const getTransaksi = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.transaksi), [])

export const getSettings = () =>
  parseJSON(localStorage.getItem(STORAGE_KEYS.settings), DEFAULT_SETTINGS)

export const saveProyek = (data) =>
  localStorage.setItem(STORAGE_KEYS.proyek, JSON.stringify(data))

export const saveTransaksi = (data) =>
  localStorage.setItem(STORAGE_KEYS.transaksi, JSON.stringify(data))

export const saveSettings = (data) =>
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data))

export const addProyek = (item) => saveProyek([...getProyek(), item])

export const addTransaksi = (item) => saveTransaksi([...getTransaksi(), item])

export const deleteTransaksi = (id) =>
  saveTransaksi(getTransaksi().filter((item) => item.id !== id))

export const deleteProyek = (id) => {
  saveProyek(getProyek().filter((item) => item.id !== id))
  saveTransaksi(getTransaksi().filter((item) => item.proyekId !== id))
}

export const exportBackup = () => {
  const exportedAt = new Date().toISOString()
  const payload = {
    proyek: getProyek(),
    transaksi: getTransaksi(),
    settings: getSettings(),
    exportedAt,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `jpa-backup-${exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)

  saveSettings({ ...getSettings(), lastBackup: exportedAt })
}

export const importBackup = (payload) => {
  saveProyek(Array.isArray(payload?.proyek) ? payload.proyek : [])
  saveTransaksi(Array.isArray(payload?.transaksi) ? payload.transaksi : [])
  saveSettings({ ...DEFAULT_SETTINGS, ...(payload?.settings || {}) })
}

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.proyek)
  localStorage.removeItem(STORAGE_KEYS.transaksi)
  localStorage.removeItem(STORAGE_KEYS.settings)
}
