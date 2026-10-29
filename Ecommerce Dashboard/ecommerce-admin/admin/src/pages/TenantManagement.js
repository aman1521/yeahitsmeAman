import React from 'react';
import { FiUsers, FiClock, FiZap, FiShield, FiSettings, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const TenantManagement = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: FiUsers,
      title: 'Multi-Tenant Support',
      description: 'Manage multiple tenants from a single admin panel with complete isolation and security.'
    },
    {
      icon: FiShield,
      title: 'Role-Based Access',
      description: 'Granular permissions and role management for each tenant organization.'
    },
    {
      icon: FiLayers,
      title: 'Resource Isolation',
      description: 'Complete data separation ensuring tenant privacy and security.'
    },
    {
      icon: FiSettings,
      title: 'Custom Configuration',
      description: 'Per-tenant settings, branding, and feature customization.'
    },
    {
      icon: FiZap,
      title: 'Performance Optimization',
      description: 'Optimized queries and caching for multi-tenant architecture.'
    },
    {
      icon: FiCheckCircle,
      title: 'Compliance Ready',
      description: 'Built with GDPR and data privacy regulations in mind.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      padding: '12px 14px',
      background: isDark ? '#0f172a' : '#f8fafc',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Main Icon */}
        <div style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: isDark 
              ? 'linear-gradient(135deg, #f97316 0%, #facc15 100%)'
              : 'linear-gradient(135deg, #f97316 0%, #facc15 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? '0 8px 24px rgba(249, 115, 22, 0.3)'
              : '0 8px 24px rgba(249, 115, 22, 0.2)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <FiUsers 
              size={24} 
              color="#ffffff"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '6px',
          color: isDark ? '#f1f5f9' : '#1e293b',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Tenant Management
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '11px',
          color: isDark ? '#94a3b8' : '#64748b',
          marginBottom: '12px',
          maxWidth: '600px',
          margin: '0 auto 12px',
          lineHeight: '1.4'
        }}>
          Coming Soon
        </p>

        {/* Description */}
        <div style={{
          background: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '12px',
          boxShadow: isDark
            ? '0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)'
            : '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '10px',
            color: isDark ? '#cbd5e1' : '#475569',
            lineHeight: '1.5',
            margin: 0
          }}>
            We're building a comprehensive tenant management system that will allow you to manage multiple 
            organizations, users, and resources from a single admin panel. This feature will include advanced 
            security, role-based access control, and complete data isolation.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '12px'
        }}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  boxShadow: isDark
                    ? '0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)'
                    : '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 4px 8px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 8px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)'
                    : '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isDark
                    ? 'linear-gradient(135deg, #f97316 0%, #facc15 100%)'
                    : 'linear-gradient(135deg, #f97316 0%, #facc15 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: isDark
                    ? '0 2px 6px rgba(249, 115, 22, 0.3)'
                    : '0 2px 6px rgba(249, 115, 22, 0.2)'
                }}>
                  <IconComponent size={16} color="#ffffff" />
                </div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  lineHeight: '1.3'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '9px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div style={{
          background: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '8px',
          padding: '12px 14px',
          boxShadow: isDark
            ? '0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)'
            : '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '8px'
          }}>
            <FiClock 
              size={12} 
              color={isDark ? '#94a3b8' : '#64748b'} 
            />
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: isDark ? '#f1f5f9' : '#1e293b',
              margin: 0,
              lineHeight: '1.3'
            }}>
              Estimated Launch
            </h3>
          </div>
          <p style={{
            fontSize: '9px',
            color: isDark ? '#cbd5e1' : '#475569',
            margin: 0,
            lineHeight: '1.4'
          }}>
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TenantManagement;

