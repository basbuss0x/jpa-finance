import React from 'react'

export const gray = {
  primary: '#1B2A4A',
  gold: '#C9A84C',
  success: '#10b981',
  danger: '#f43f5e',
  warning: '#f59e0b',
  bg: '#f8f7f4',
  line: '#e5e1d8',
  mid: '#78716c',
  text: '#1c1917',
  ink: '#1B2A4A',
  card: '#ffffff',
}

export const fmtIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export function PageFrame({ title, subtitle, children, activePage, onNavigate }) {
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
          padding: '16px 16px 12px',
          borderBottom: `1px solid ${gray.line}`,
          background: gray.card,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: gray.mid }}>
          JPA Finance System
        </p>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, color: gray.ink }}>
          {title}
        </h1>
        {subtitle ? (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: gray.text }}>
            {subtitle}
          </p>
        ) : null}
      </header>
      <section style={{ display: 'grid', gap: 10, padding: 12 }}>{children}</section>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  )
}

export function Card({ title, note, children }) {
  return (
    <section
      style={{
        display: 'grid',
        gap: 8,
        padding: 12,
        border: `1px solid ${gray.line}`,
        background: gray.card,
        borderRadius: 8,
      }}
    >
      {(title || note) ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          {title ? (
            <h2 style={{ margin: 0, fontSize: 14, color: gray.ink }}>{title}</h2>
          ) : null}
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
      ) : null}
      {children}
    </section>
  )
}

export function LabelRow({ label, value, strong }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8,
        alignItems: 'baseline',
        minHeight: 28,
        borderBottom: `1px solid ${gray.line}`,
        paddingBottom: 6,
      }}
    >
      <span style={{ color: gray.text, fontSize: 12 }}>{label}</span>
      <span
        style={{
          color: gray.ink,
          fontSize: strong ? 14 : 12,
          fontWeight: strong ? 800 : 600,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function WireButton({ children, variant = 'primary', onClick }) {
  const primary = variant === 'primary'
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 48,
        width: '100%',
        borderRadius: 8,
        border: `1px solid ${primary ? gray.primary : gray.mid}`,
        background: primary ? gray.primary : gray.bg,
        color: primary ? '#fff' : gray.ink,
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  )
}

export function ProgressBar({ value, color }) {
  const safeValue = Math.max(0, Math.min(100, value))
  const fillColor = color || (safeValue >= 100 ? gray.success : gray.gold)

  return (
    <div
      style={{
        height: 10,
        borderRadius: 6,
        border: `1px solid ${gray.mid}`,
        background: gray.bg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${safeValue}%`,
          height: '100%',
          background: fillColor,
        }}
      />
    </div>
  )
}

export function Badge({ children }) {
  const text = String(children)
  const palette =
    text === 'Aktif'
      ? { border: gray.success, bg: '#ecfdf5', color: '#047857' }
      : text === 'Menunggu Bayar'
        ? { border: gray.warning, bg: '#fffbeb', color: '#92400e' }
        : text === 'Selesai'
          ? { border: gray.mid, bg: gray.bg, color: gray.text }
          : { border: gray.mid, bg: gray.bg, color: gray.text }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 24,
        padding: '0 8px',
        borderRadius: 6,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.color,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  )
}

export function BottomNav({ activePage, onNavigate }) {
  const items = [
    { id: 'input', label: 'Input' },
    { id: 'projects', label: 'Proyek' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Backup' },
  ]

  return (
    <nav
      aria-label="Navigasi utama wireframe"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
        padding: 10,
        borderTop: `1px solid ${gray.line}`,
        background: gray.card,
      }}
    >
      {items.map((item) => {
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item.id)}
            style={{
              minHeight: 48,
              borderRadius: 6,
              border: `1px solid ${active ? gray.gold : gray.line}`,
              background: active ? gray.primary : gray.bg,
              color: active ? '#fff' : gray.text,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
