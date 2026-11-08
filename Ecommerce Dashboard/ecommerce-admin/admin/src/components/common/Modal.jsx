import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
  footer
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <FiX />
          </button>
        </div>

        <div style={{ padding: '18px', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: '12px 18px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

