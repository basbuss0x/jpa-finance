export const tokens = {
  colors: {
    primary: {
      jpaNavy: '#002B68',
      deepNavy: '#001A4A',
      corporateBlue: '#0046B8',
      actionBlue: '#0B63F6',
      skyBlue: '#33A8FF',
    },
    surface: {
      white: '#FFFFFF',
      mistBlue: '#F6FAFF',
      iceBlue: '#EAF3FF',
      page: '#F8FAFC',
    },
    text: {
      ink: '#111827',
      slate: '#334155',
      coolGray: '#64748B',
      inverse: '#FFFFFF',
    },
    line: {
      borderGray: '#E2E8F0',
      lineBlue: '#BBD7F5',
    },
    semantic: {
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
      talangan: '#0046B8',
    },
    danger: {
      tint: '#FEF2F2',
      border: '#FECACA',
    },
  },
  typography: {
    family:
      '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    pageTitle: { fontSize: 24, fontWeight: 800, lineHeight: 1.18 },
    sectionTitle: { fontSize: 17, fontWeight: 700, lineHeight: 1.3 },
    cardTitle: { fontSize: 15, fontWeight: 700, lineHeight: 1.35 },
    body: { fontSize: 14, fontWeight: 500, lineHeight: 1.45 },
    caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.35 },
    kpi: { fontSize: 28, fontWeight: 800, lineHeight: 1.1 },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  shadow: {
    soft: '0 4px 12px rgba(0, 43, 104, 0.08)',
    raised: '0 12px 32px rgba(0, 43, 104, 0.12)',
  },
  motion: {
    fast: '120ms',
    base: '180ms',
    slow: '240ms',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

export const componentStyles = {
  card: {
    background: tokens.colors.surface.white,
    border: `1px solid ${tokens.colors.line.borderGray}`,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadow.soft,
  },
  primaryButton: {
    minHeight: 52,
    border: 'none',
    borderRadius: tokens.radius.md,
    background: tokens.colors.primary.actionBlue,
    color: tokens.colors.text.inverse,
    fontWeight: 700,
    transition: `transform ${tokens.motion.fast} ${tokens.motion.easeOut}, opacity ${tokens.motion.fast} ${tokens.motion.easeOut}, background ${tokens.motion.base} ${tokens.motion.easeOut}`,
  },
  secondaryButton: {
    minHeight: 52,
    border: `1px solid ${tokens.colors.line.lineBlue}`,
    borderRadius: tokens.radius.md,
    background: tokens.colors.surface.white,
    color: tokens.colors.primary.jpaNavy,
    fontWeight: 700,
    transition: `transform ${tokens.motion.fast} ${tokens.motion.easeOut}, opacity ${tokens.motion.fast} ${tokens.motion.easeOut}, border-color ${tokens.motion.base} ${tokens.motion.easeOut}`,
  },
  dangerButton: {
    minHeight: 52,
    border: 'none',
    borderRadius: tokens.radius.md,
    background: tokens.colors.semantic.error,
    color: tokens.colors.text.inverse,
    fontWeight: 700,
    transition: `transform ${tokens.motion.fast} ${tokens.motion.easeOut}, opacity ${tokens.motion.fast} ${tokens.motion.easeOut}`,
  },
}
