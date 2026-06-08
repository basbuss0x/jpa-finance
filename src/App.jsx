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
          height: 100%;
          margin: 0;
        }

        body {
          background: #F8FAFC;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          overflow: hidden;
          overscroll-behavior-y: none;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .app-shell {
          height: 100dvh;
          background: #F8FAFC;
          overflow: hidden;
        }

        .app-stage {
          height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
          overflow: hidden;
        }

        .app-frame {
          width: 100%;
          height: 100dvh;
          background: #F8FAFC;
          box-sizing: border-box;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
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
          padding-bottom: calc(112px + env(safe-area-inset-bottom)) !important;
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

        @keyframes motion-page-enter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes motion-card-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .motion-page {
          animation: motion-page-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .motion-card,
        .motion-list-item {
          animation: motion-card-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .motion-pressable {
          transition:
            transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
            background-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
            color 180ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 120ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .motion-pressable:active {
          transform: scale(0.98);
        }

        .motion-nav-active {
          transform: translateY(-1px);
        }

        .motion-progress-fill,
        .motion-bar-fill {
          transition:
            width 240ms cubic-bezier(0.16, 1, 0.3, 1),
            height 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 1ms !important;
          }

          .motion-page,
          .motion-card,
          .motion-list-item,
          .motion-nav-active,
          .motion-pressable:active {
            transform: none !important;
          }
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
            height: calc(100dvh - 32px);
            border: 1px solid #CBD5E1;
            box-shadow: 0 12px 32px rgba(0, 43, 104, 0.12);
          }

          .app-bottom-nav {
            left: 50%;
            right: auto;
            bottom: 16px;
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
