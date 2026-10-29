import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [passwordPolicy, setPasswordPolicy] = useState({
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special: false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    min_length: false,
    has_uppercase: false,
    has_lowercase: false,
    has_numbers: false,
    has_special: false
  });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate('/login');
      return;
    }

    // Fetch password policy from security settings
    // Use suppressErrorToast to prevent redirect on 401
    const fetchPasswordPolicy = async () => {
      try {
        const response = await apiClient.get('/api/settings/security', {
          suppressErrorToast: true // Prevent redirect on 401
        });
        if (response.data.success && response.data.settings) {
          const settings = response.data.settings;
          setPasswordPolicy({
            min_length: settings.password_min_length || 8,
            require_uppercase: settings.password_require_uppercase ?? true,
            require_lowercase: settings.password_require_lowercase ?? true,
            require_numbers: settings.password_require_numbers ?? true,
            require_special: settings.password_require_special ?? false
          });
        }
      } catch (error) {
        console.log('Password policy fetch failed (using defaults):', error.response?.status);
        // Use defaults if fetch fails - this is OK for password reset
        // The backend will still validate the password against security settings
      }
    };

    fetchPasswordPolicy();
    setValidatingToken(false);
    setTokenValid(true);
  }, [token, navigate]);

  const validatePassword = (password) => {
    setPasswordValidation({
      min_length: password.length >= passwordPolicy.min_length,
      has_uppercase: passwordPolicy.require_uppercase ? /[A-Z]/.test(password) : true,
      has_lowercase: passwordPolicy.require_lowercase ? /[a-z]/.test(password) : true,
      has_numbers: passwordPolicy.require_numbers ? /\d/.test(password) : true,
      has_special: passwordPolicy.require_special ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'new_password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend validation
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check password policy
    const validation = {
      min_length: formData.new_password.length >= passwordPolicy.min_length,
      has_uppercase: passwordPolicy.require_uppercase ? /[A-Z]/.test(formData.new_password) : true,
      has_lowercase: passwordPolicy.require_lowercase ? /[a-z]/.test(formData.new_password) : true,
      has_numbers: passwordPolicy.require_numbers ? /\d/.test(formData.new_password) : true,
      has_special: passwordPolicy.require_special ? /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) : true
    };

    if (!validation.min_length) {
      toast.error(`Password must be at least ${passwordPolicy.min_length} characters long`);
      setLoading(false);
      return;
    }

    if (passwordPolicy.require_uppercase && !validation.has_uppercase) {
      toast.error('Password must contain at least one uppercase letter');
      setLoading(false);
      return;
    }

    if (passwordPolicy.require_lowercase && !validation.has_lowercase) {
      toast.error('Password must contain at least one lowercase letter');
      setLoading(false);
      return;
    }

    if (passwordPolicy.require_numbers && !validation.has_numbers) {
      toast.error('Password must contain at least one number');
      setLoading(false);
      return;
    }

    if (passwordPolicy.require_special && !validation.has_special) {
      toast.error('Password must contain at least one special character');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        token: token,
        new_password: formData.new_password
      });

      if (response.data.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to reset password');
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading">Validating reset link...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null;
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <FiLock size={32} />
          </div>
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="new_password"
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={formData.new_password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {formData.new_password && (
              <div className="password-requirements">
                <div className={`requirement ${passwordValidation.min_length ? 'valid' : 'invalid'}`}>
                  {passwordValidation.min_length ? <FiCheck size={14} /> : <FiX size={14} />}
                  <span>At least {passwordPolicy.min_length} characters</span>
                </div>
                {passwordPolicy.require_uppercase && (
                  <div className={`requirement ${passwordValidation.has_uppercase ? 'valid' : 'invalid'}`}>
                    {passwordValidation.has_uppercase ? <FiCheck size={14} /> : <FiX size={14} />}
                    <span>One uppercase letter</span>
                  </div>
                )}
                {passwordPolicy.require_lowercase && (
                  <div className={`requirement ${passwordValidation.has_lowercase ? 'valid' : 'invalid'}`}>
                    {passwordValidation.has_lowercase ? <FiCheck size={14} /> : <FiX size={14} />}
                    <span>One lowercase letter</span>
                  </div>
                )}
                {passwordPolicy.require_numbers && (
                  <div className={`requirement ${passwordValidation.has_numbers ? 'valid' : 'invalid'}`}>
                    {passwordValidation.has_numbers ? <FiCheck size={14} /> : <FiX size={14} />}
                    <span>One number</span>
                  </div>
                )}
                {passwordPolicy.require_special && (
                  <div className={`requirement ${passwordValidation.has_special ? 'valid' : 'invalid'}`}>
                    {passwordValidation.has_special ? <FiCheck size={14} /> : <FiX size={14} />}
                    <span>One special character</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirm_password"
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={formData.confirm_password}
                onChange={handlePasswordChange}
                required
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {formData.confirm_password && formData.new_password !== formData.confirm_password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
                <FiAlertCircle size={14} />
                <span>Passwords do not match</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || formData.new_password !== formData.confirm_password}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="reset-password-footer">
          <p>
            Remember your password? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


