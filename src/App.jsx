import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import InputCepat from './pages/InputCepat.jsx'
import DaftarProyek from './pages/DaftarProyek.jsx'
import DetailProyek from './pages/DetailProyek.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import TambahanWireframes from './pages/TambahanWireframes.jsx'

function GlobalAppStyles() {
  return (
    <style>
      {`
        html, body, #root {
          min-height: 100%;
          margin: 0;
        }

        body {
          background: #F8FAFC;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          overscroll-behavior-y: none;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .app-shell {
          min-height: 100dvh;
          background: #F8FAFC;
        }

        .app-stage {
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .app-frame {
          width: 100%;
          min-height: 100dvh;
          background: #F8FAFC;
          box-sizing: border-box;
          position: relative;
          overflow-x: hidden;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 20;
          padding-top: calc(14px + env(safe-area-inset-top));
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .app-content {
          padding-bottom: calc(96px + env(safe-area-inset-bottom));
        }

        .app-bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          z-index: 50;
          box-sizing: border-box;
          padding-bottom: calc(10px + env(safe-area-inset-bottom));
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        @media (min-width: 431px) {
          .app-shell {
            background: #e5e1d8;
          }

          .app-stage {
            padding: 16px;
          }

          .app-frame {
            max-width: 390px;
            min-height: calc(100vh - 32px);
            border: 1px solid #CBD5E1;
            box-shadow: 0 12px 32px rgba(0, 43, 104, 0.12);
          }

          .app-bottom-nav {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            max-width: 390px;
          }
        }
      `}
    </style>
  )
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
    <>
      <GlobalAppStyles />
      <main className="app-shell">
        <div className="app-stage">
          {screens[page]}
        </div>
      </main>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
