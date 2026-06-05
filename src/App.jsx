import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import InputCepat from './pages/InputCepat.jsx'
import DaftarProyek from './pages/DaftarProyek.jsx'
import DetailProyek from './pages/DetailProyek.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import TambahanWireframes from './pages/TambahanWireframes.jsx'

const appShell = {
  minHeight: '100vh',
  margin: 0,
  background: '#e5e1d8',
  color: '#1c1917',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
}

const centerStage = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: 16,
  boxSizing: 'border-box',
}

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [screenDate, setScreenDate] = useState(today)
  const initialRoute = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('page')
    const page = ['input', 'projects', 'detail', 'dashboard', 'settings', 'wireframes'].includes(requested)
      ? requested
      : 'input'
    return {
      page,
      proyekId: params.get('proyekId') || '',
    }
  }, [])
  const [page, setPage] = useState(initialRoute.page)
  const [selectedProyekId, setSelectedProyekId] = useState(initialRoute.proyekId)

  const syncUrl = (nextPage, nextProyekId = '') => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', nextPage)
    if (nextPage === 'detail' && nextProyekId) {
      url.searchParams.set('proyekId', nextProyekId)
    } else {
      url.searchParams.delete('proyekId')
    }
    window.history.replaceState(null, '', url)
  }

  const handleNavigate = (nextPage, nextProyekId = '') => {
    setPage(nextPage)
    if (nextProyekId) setSelectedProyekId(nextProyekId)
    if (nextPage !== 'detail') setSelectedProyekId('')
    syncUrl(nextPage, nextProyekId)
  }

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const requested = params.get('page')
      setPage(['input', 'projects', 'detail', 'dashboard', 'settings', 'wireframes'].includes(requested)
        ? requested
        : 'input')
      setSelectedProyekId(params.get('proyekId') || '')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const screens = {
    input: (
      <InputCepat
        screenDate={screenDate}
        onDateChange={setScreenDate}
        onNavigate={handleNavigate}
      />
    ),
    projects: (
      <DaftarProyek
        onNavigate={handleNavigate}
        onOpenDetail={(proyekId) => handleNavigate('detail', proyekId)}
      />
    ),
    detail: <DetailProyek proyekId={selectedProyekId} onNavigate={handleNavigate} />,
    dashboard: <Dashboard onNavigate={handleNavigate} />,
    settings: <Pengaturan onNavigate={handleNavigate} />,
    wireframes: <TambahanWireframes onNavigate={handleNavigate} />,
  }

  return (
    <main style={appShell}>
      <div style={centerStage}>
        {screens[page]}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
