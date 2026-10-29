import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiUser, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleLogin = async (e, forceDemo = false) => {
    e?.preventDefault();
    const userToLogin = forceDemo ? (username || 'amanchouhan1217@gmail.com') : username;
    const passToLogin = forceDemo ? (password || 'Legend@15') : password;
    if (!userToLogin || !passToLogin) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const result = await login(userToLogin, passToLogin, forceDemo);
      if (result.success) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        localStorage.removeItem('loginAttempts');
        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else if (result.locked) {
        // Account is locked - message already shown by AuthContext
        // Clear password field on lockout
        setPassword('');
        setAttemptCount(0);
        localStorage.removeItem('loginAttempts');
        // Don't reload - stay on page to show lockout message
      } else {
        // Failed login - increment attempt count
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        localStorage.setItem('loginAttempts', newAttemptCount.toString());
        console.log(`[FRONTEND] Failed login attempt #${newAttemptCount}`);
        
        // Clear password field on failed login (but keep username)
        setPassword('');
        // DON'T reload - stay on page so we can track attempts
        // The error message is already shown by AuthContext
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Login error:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      localStorage.setItem('loginAttempts', newAttemptCount.toString());
      setPassword('');
      // DON'T reload - stay on page
    } finally {
      setLoading(false);
    }
  };

  // Load attempt count from localStorage on mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
      const count = parseInt(savedAttempts, 10);
      setAttemptCount(count);
      console.log(`[FRONTEND] Loaded ${count} previous failed attempts`);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username && password) {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background Elements */}
      <div className="login-background-decoration">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="login-card" style={{ maxWidth: 380, width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Logo and Header */}
        <div className="login-header" style={{ marginBottom: '20px' }}>
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#FF8C00', margin: 0, letterSpacing: '-0.5px' }}>
              Peenakaa
            </h1>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              background: 'rgba(255, 140, 0, 0.1)',
              color: '#FF8C00'
            }}>
              Ecommerce Dashboard
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', textAlign: 'center', margin: 0 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginTop: '6px' }}>
            Enter your credentials or try instant demo access below
          </p>
        </div>

        {/* Credentials Info Badge */}
        <div style={{
          background: 'rgba(255, 140, 0, 0.08)',
          border: '1px solid rgba(255, 140, 0, 0.25)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#374151',
          lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 600, color: '#D97706', marginBottom: '2px' }}>
            🔑 Admin Credentials:
          </div>
          <div><strong>Email:</strong> <code style={{ color: '#1F2937' }}>amanchouhan1217@gmail.com</code></div>
          <div><strong>Password:</strong> <code style={{ color: '#1F2937' }}>Legend@15</code></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <FiUser size={16} style={{ marginRight: '6px' }} />
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="amanchouhan1217@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>
                <FiLock size={16} style={{ marginRight: '6px' }} />
                Password
              </label>
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
                style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Legend@15"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              background: loading ? '#D1D5DB' : '#FF8C00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '18px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn size={16} />
                Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setUsername('amanchouhan1217@gmail.com');
              setPassword('Legend@15');
              handleLogin({ preventDefault: () => {} }, true);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'transparent',
              color: '#4B5563',
              border: '1px dashed #D1D5DB',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF8C00';
              e.currentTarget.style.color = '#FF8C00';
              e.currentTarget.style.background = 'rgba(255, 140, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#4B5563';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ⚡ Quick Admin Login (amanchouhan1217@gmail.com)
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>
          <p>© 2026 Peenakaa Ecommerce Dashboard. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
