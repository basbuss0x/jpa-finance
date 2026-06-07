import React from 'react'
import { componentStyles, tokens } from '../designTokens'

const quickAmounts = [
  { label: '50k', value: 50000 },
  { label: '100k', value: 100000 },
  { label: '250k', value: 250000 },
  { label: '500k', value: 500000 },
  { label: '1jt', value: 1000000 },
  { label: '5jt', value: 5000000 },
]

export function Toast({ visible, children = 'Transaksi tersimpan ✓' }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 84,
        zIndex: 40,
        transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        minHeight: 44,
        maxWidth: 390 - tokens.spacing.xl * 2,
        padding: '12px 20px',
        display: 'grid',
        placeItems: 'center',
        borderRadius: tokens.radius.md,
        background: tokens.colors.primary.jpaNavy,
        color: tokens.colors.text.inverse,
        boxShadow: tokens.shadow.raised,
        fontFamily: tokens.typography.family,
        fontSize: tokens.typography.body.fontSize,
        fontWeight: 700,
        transition: 'opacity 160ms ease, transform 160ms ease',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}

export function QuickAmountChips({ value, onChange, amounts = quickAmounts }) {
  return (
    <div
      aria-label="Pilih nominal cepat"
      style={{
        display: 'flex',
        gap: tokens.spacing.sm,
        overflowX: 'auto',
        paddingBottom: tokens.spacing.xs,
      }}
    >
      {amounts.map((item) => {
        const active = Number(value) === item.value
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onChange?.(item.value)}
            style={{
              minHeight: 40,
              minWidth: 58,
              padding: '0 14px',
              borderRadius: tokens.radius.full,
              border: `1px solid ${
                active ? tokens.colors.primary.actionBlue : tokens.colors.line.borderGray
              }`,
              background: active ? tokens.colors.surface.iceBlue : tokens.colors.surface.white,
              color: active ? tokens.colors.primary.actionBlue : tokens.colors.text.slate,
              fontFamily: tokens.typography.family,
              fontSize: tokens.typography.body.fontSize,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function StatusBanner({ label, description, color = tokens.colors.text.coolGray }) {
  return (
    <section
      style={{
        ...componentStyles.card,
        borderColor: color,
        background: tokens.colors.surface.white,
        display: 'grid',
        gap: tokens.spacing.sm,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 10,
            height: 10,
            borderRadius: tokens.radius.full,
            background: color,
            flex: '0 0 auto',
          }}
        />
        <strong
          style={{
            color,
            fontFamily: tokens.typography.family,
            ...tokens.typography.sectionTitle,
          }}
        >
          {label}
        </strong>
      </div>
      <p
        style={{
          margin: 0,
          color: tokens.colors.text.slate,
          fontFamily: tokens.typography.family,
          ...tokens.typography.body,
        }}
      >
        {description}
      </p>
    </section>
  )
}

export function InsightCard({ title = 'Insight', message, ctaLabel, onCta }) {
  return (
    <section
      style={{
        ...componentStyles.card,
        display: 'grid',
        gap: tokens.spacing.md,
        background: tokens.colors.surface.mistBlue,
        borderColor: tokens.colors.line.lineBlue,
      }}
    >
      <div style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span
          style={{
            color: tokens.colors.primary.corporateBlue,
            fontFamily: tokens.typography.family,
            ...tokens.typography.caption,
            fontWeight: 700,
          }}
        >
          {title}
        </span>
        <p
          style={{
            margin: 0,
            color: tokens.colors.text.ink,
            fontFamily: tokens.typography.family,
            ...tokens.typography.body,
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      </div>
      {ctaLabel ? (
        <button
          type="button"
          onClick={onCta}
          style={{
            justifySelf: 'start',
            minHeight: 40,
            border: 'none',
            background: 'transparent',
            color: tokens.colors.primary.actionBlue,
            fontFamily: tokens.typography.family,
            fontSize: tokens.typography.body.fontSize,
            fontWeight: 800,
            padding: 0,
          }}
        >
          {ctaLabel}
        </button>
      ) : null}
    </section>
  )
}

export function EmptyState({ title, description, ctaLabel, onCta }) {
  return (
    <section
      style={{
        ...componentStyles.card,
        display: 'grid',
        justifyItems: 'center',
        gap: tokens.spacing.md,
        textAlign: 'center',
        padding: tokens.spacing.xl,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.colors.line.lineBlue}`,
          background: tokens.colors.surface.iceBlue,
          boxShadow: tokens.shadow.soft,
        }}
      />
      <div style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <strong
          style={{
            color: tokens.colors.text.ink,
            fontFamily: tokens.typography.family,
            ...tokens.typography.cardTitle,
          }}
        >
          {title}
        </strong>
        {description ? (
          <p
            style={{
              margin: 0,
              color: tokens.colors.text.coolGray,
              fontFamily: tokens.typography.family,
              ...tokens.typography.body,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
      {ctaLabel ? (
        <button
          type="button"
          onClick={onCta}
          style={{
            ...componentStyles.secondaryButton,
            minHeight: 44,
            padding: '0 16px',
            fontFamily: tokens.typography.family,
          }}
        >
          {ctaLabel}
        </button>
      ) : null}
    </section>
  )
}

export { quickAmounts }
