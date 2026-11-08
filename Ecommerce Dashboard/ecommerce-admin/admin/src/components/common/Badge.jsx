import React from 'react';

const BADGE_VARIANTS = {
  success: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.25)' },
  danger: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.25)' },
  info: { bg: 'rgba(22, 140, 214, 0.1)', color: '#168CD6', border: 'rgba(22, 140, 214, 0.25)' },
  neutral: { bg: 'rgba(148, 163, 184, 0.15)', color: '#475569', border: 'rgba(148, 163, 184, 0.3)' },
  primary: { bg: 'rgba(22, 140, 214, 0.15)', color: '#1170AB', border: 'rgba(22, 140, 214, 0.3)' }
};

export const Badge = ({
  children,
  variant = 'neutral',
  status,
  size = 'medium',
  style = {}
}) => {
  // Map common status words to variants automatically
  let resolvedVariant = variant;
  if (status) {
    const s = String(status).toLowerCase();
    if (['active', 'completed', 'delivered', 'paid', 'success', 'confirmed'].includes(s)) {
      resolvedVariant = 'success';
    } else if (['pending', 'processing', 'shipped'].includes(s)) {
      resolvedVariant = 'warning';
    } else if (['inactive', 'cancelled', 'refunded', 'blocked', 'failed'].includes(s)) {
      resolvedVariant = 'danger';
    } else if (['lead', 'portfolio', 'inquiry'].includes(s)) {
      resolvedVariant = 'info';
    }
  }

  const colors = BADGE_VARIANTS[resolvedVariant] || BADGE_VARIANTS.neutral;
  const isSmall = size === 'small';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '1px 6px' : '2px 8px',
        fontSize: isSmall ? '8px' : '9px',
        fontWeight: '600',
        borderRadius: '4px',
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        letterSpacing: '0.2px',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {children || status}
    </span>
  );
};

export default Badge;

