import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset link has been sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      // Don't reveal if email exists or not for security
      toast.error('If an account with that email exists, a password reset link has been sent.');
      // Still show success message to user (security best practice)
      setEmailSent(true);
    } finally {
      setLoading(false);
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

      <div className="login-card" style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div className="login-header" style={{ marginBottom: '32px' }}>
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FF8C00', margin: 0 }}>
              Peenakaa
            </h1>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', textAlign: 'center', margin: 0 }}>
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }}>
            {emailSent 
              ? 'We\'ve sent a password reset link to your email address.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'
            }
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Info Box */}
            <div style={{
              padding: '12px 16px',
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <FiAlertCircle style={{ color: '#3b82f6', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                Enter the email address associated with your admin account. You'll receive a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FiMail size={18} style={{ marginRight: '8px' }} />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="amanchouhan1217@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || !email}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
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
                  marginTop: '24px',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiMail size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Message */
          <div style={{
            padding: '24px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#065f46', fontSize: '18px', fontWeight: '600' }}>
              Email Sent!
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#047857', fontSize: '14px', lineHeight: '1.6' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ margin: 0, color: '#059669', fontSize: '13px', lineHeight: '1.6' }}>
              Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            <FiArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
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

export default ForgotPassword;

