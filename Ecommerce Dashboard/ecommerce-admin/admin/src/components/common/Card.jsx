import React from 'react';

export const Card = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  style = {},
  headerStyle = {},
  bodyStyle = {}
}) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        marginBottom: '16px',
        ...style
      }}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            ...headerStyle
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: '16px 18px', ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
};

export default Card;

