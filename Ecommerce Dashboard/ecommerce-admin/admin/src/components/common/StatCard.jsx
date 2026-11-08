import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  accentColor = '#168CD6',
  loading = false,
  onClick
}) => {
  const isPositive = typeof change === 'number' ? change >= 0 : !String(change).startsWith('-');

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
            {loading ? '...' : value}
          </h2>
          {typeof change !== 'undefined' && change !== null && (
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              color: isPositive ? '#10b981' : '#ef4444',
              background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              {isPositive ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
              {Math.abs(Number(change))}%
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: `rgba(${accentColor === '#168CD6' ? '22, 140, 214' : '15, 130, 138'}, 0.1)`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
          marginLeft: '12px'
        }}>
          <Icon />
        </div>
      )}
    </div>
  );
};

export default StatCard;

