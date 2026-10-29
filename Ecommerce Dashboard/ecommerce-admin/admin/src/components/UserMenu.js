import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const userInitials = (user?.full_name || user?.username || 'SA')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentSiteLabel = user?.site?.name || user?.site?.site_name || 'Default';
  const userName = user?.full_name || user?.username || 'System Administrator';
  const userRole = formatRole(user?.role);

  return (
    <div className="user-menu-pill" ref={userMenuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`pill-switcher ${theme === 'dark' ? 'pill-switcher--dark' : ''}`}
        onClick={() => setUserMenuOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={userMenuOpen}
      >
        <div className="user-menu__avatar">
          {userInitials}
        </div>
        <div className="user-menu__details">
          <span className="user-menu__label">System Administrator</span>
          <span className="user-menu__value">
            {userName}
          </span>
        </div>
        <FiChevronDown 
          size={16} 
          style={{ 
            color: theme === 'dark' ? '#cbd5e1' : '#64748b',
            transition: 'transform 0.2s ease',
            transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {userMenuOpen && (
        <div
          className="user-menu-dropdown"
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            minWidth: 220,
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#fff',
            borderRadius: 12,
            boxShadow: theme === 'dark' 
              ? '0 20px 45px rgba(0, 0, 0, 0.8)' 
              : '0 20px 45px rgba(15, 23, 42, 0.15)',
            border: theme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(148,163,184,0.2)',
            zIndex: 1200,
            padding: '12px',
            marginTop: '8px',
          }}
        >
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(148,163,184,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>
              {userName}
            </div>
            <div style={{ fontSize: 12, color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
              {userRole}
            </div>
            {user?.email && (
              <div style={{ fontSize: 12, color: theme === 'dark' ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                {user.email}
              </div>
            )}
          </div>
          <button
            className="user-menu-item"
            onClick={() => {
              navigate('/profile');
              setUserMenuOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: theme === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
              color: theme === 'dark' ? '#cbd5e1' : '#111827',
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            <FiUser />
            View Profile
          </button>
          <button
            className="user-menu-item"
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: theme === 'dark' 
                ? '1px solid rgba(248,113,113,0.4)' 
                : '1px solid rgba(248,113,113,0.4)',
              background: 'transparent',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

