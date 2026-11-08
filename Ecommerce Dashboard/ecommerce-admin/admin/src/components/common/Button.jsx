import React from 'react';

const VARIANTS = {
  primary: {
    bg: '#168CD6',
    hoverBg: '#1170AB',
    color: '#ffffff',
    border: 'none'
  },
  secondary: {
    bg: '#f1f5f9',
    hoverBg: '#e2e8f0',
    color: '#334155',
    border: '1px solid #cbd5e1'
  },
  outline: {
    bg: 'transparent',
    hoverBg: 'rgba(22, 140, 214, 0.08)',
    color: '#168CD6',
    border: '1px solid #168CD6'
  },
  danger: {
    bg: '#ef4444',
    hoverBg: '#dc2626',
    color: '#ffffff',
    border: 'none'
  }
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  className = ''
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const padding = size === 'small' ? '4px 10px' : size === 'large' ? '12px 22px' : '8px 16px';
  const fontSize = size === 'small' ? '10px' : size === 'large' ? '14px' : '12px';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: '600',
        borderRadius: '6px',
        background: disabled ? '#cbd5e1' : v.bg,
        color: v.color,
        border: v.border,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && v.hoverBg) {
          e.currentTarget.style.background = v.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = v.bg;
        }
      }}
    >
      {loading ? (
        <span style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      ) : Icon ? (
        <Icon size={size === 'small' ? 12 : 14} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

