import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiSettings,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiGlobe,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiShield,
  FiCreditCard,
  FiKey,
  FiActivity,
  FiClock,
  FiZap,
  FiMessageSquare,
  FiFileText,
  FiFlag,
  FiCamera,
  FiPhone,
  FiLogOut,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiAlertCircle,
  FiRefreshCw,
  FiCopy,
  FiTrash,
  FiToggleLeft,
  FiToggleRight,
  FiMail
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Get tab from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    store_name: '',
    store_email: '',
    store_phone: '',
    legal_name: '',
    address: {
      street: '',
      apartment: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    timezone: 'UTC',
    currency: 'USD',
    weight_unit: 'kg',
    order_prefix: '#',
    order_suffix: '',
    locale: 'en'
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  const [generalLastUpdated, setGeneralLastUpdated] = useState(null);

  // Billing Settings State
  const [billingSettings, setBillingSettings] = useState({
    plan_name: 'Enterprise Starter',
    plan_status: 'active',
    billing_cycle: 'monthly',
    next_billing_date: '',
    amount: '29.00',
    currency: 'USD',
    payment_method: {
      brand: 'Visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2028
    }
  });

  // Account/Profile State
  const [profileData, setProfileData] = useState({
    email: '',
    full_name: '',
    phone: '',
    avatar_url: '',
    role: '',
    last_login: '',
    password_last_changed: '',
    profile_last_updated: '',
    created_at: '',
    active_sessions_count: 0
  });
  const [preferences, setPreferences] = useState({});
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Security Settings State - Initialize with null/empty to show placeholders

  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: null,
    password_require_uppercase: false,
    password_require_lowercase: false,
    password_require_numbers: false,
    password_require_special: false,
    login_max_attempts: null,
    login_lockout_duration: null,
    session_timeout: null,
    ip_whitelist_enabled: false,
    captcha_enabled: false
  });
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [refreshingLoginAttempts, setRefreshingLoginAttempts] = useState(false);
  const [loginAttemptsLastRefreshed, setLoginAttemptsLastRefreshed] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState({});

  // System Settings State
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showFeatureFlagModal, setShowFeatureFlagModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [newApiKey, setNewApiKey] = useState({ key_name: '', key_type: 'read', permissions: [] });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });
  const [newFeatureFlag, setNewFeatureFlag] = useState({ flag_key: '', flag_name: '', description: '', is_enabled: false });
  const [newIntegration, setNewIntegration] = useState({ integration_name: '', integration_type: '', config: {} });
  const [createdApiKey, setCreatedApiKey] = useState(null);

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    gdpr_enabled: false,
    cookie_consent_enabled: false,
    cookie_consent_message: 'We use cookies to enhance your experience.',
    data_retention_days: 365,
    auto_delete_inactive_users: false,
    require_privacy_policy_acceptance: true
  });
  
  // Localization Settings State
  const [localizationSettings, setLocalizationSettings] = useState({
    default_language: 'en',
    default_currency: 'INR',
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    time_format: '24h'
  });

  // Advanced Settings State
  const [advancedSettings, setAdvancedSettings] = useState({
    debug_mode: false,
    cache_enabled: true,
    cache_ttl: 3600,
    api_rate_limit: 1000,
    enable_analytics: true
  });

  // Payment Gateways State
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [gatewayForm, setGatewayForm] = useState({
    gateway_code: '',
    gateway_name: '',
    is_enabled: false,
    mode: 'test',
    currency: 'USD',
    api_key: '',
    secret_key: '',
    webhook_secret: '',
    merchant_id: ''
  });
  const [savingGateway, setSavingGateway] = useState(false);
  const [testingGateway, setTestingGateway] = useState(false);
  const [credentialErrors, setCredentialErrors] = useState({});
  
  // Test credentials for common payment gateways
  const getTestCredentials = (gatewayCode) => {
    const testCreds = {
      stripe: {
        api_key: 'pk_test_sample_key_placeholder',
        secret_key: 'sk_test_sample_key_placeholder',
        webhook_secret: 'whsec_sample_secret_placeholder'
      },
      razorpay: {
        api_key: 'rzp_test_1234567890ABCDEF',
        secret_key: 'rzp_test_1234567890abcdefghijklmnopqrstuvwxyz',
        webhook_secret: 'whsec_test_1234567890abcdefghijklmnopqrstuvwxyz'
      },
      phonepe: {
        api_key: 'PGTESTPAYUAT',
        secret_key: '099eb0cd-02cf-4e2a-8aca-3e6c6a41d3d3',
        merchant_id: 'M2210OV261MKE'
      },
      paypal: {
        api_key: 'A21AAFEpi4_w8bWWhcQKz3bVl7yB5hkOviXdC2M7XQv0-DpE8xYz1234567890abcdefghijklmnopqrstuvwxyz',
        secret_key: 'EFI6D7KLNQOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz1234567890'
      }
    };
    return testCreds[gatewayCode?.toLowerCase()] || {};
  };
  
  // Validate credentials based on gateway type
  const validateCredentials = (gatewayCode, apiKey, secretKey, merchantId) => {
    const errors = {};
    const code = gatewayCode?.toLowerCase();
    
    if (!apiKey || !apiKey.trim()) {
      errors.api_key = 'API Key is required';
      return errors;
    }
    
    if (code === 'stripe') {
      if (!apiKey.startsWith('pk_test_') && !apiKey.startsWith('pk_live_')) {
        errors.api_key = 'Invalid Stripe API key format. Must start with pk_test_ or pk_live_';
      }
      if (secretKey && !secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        errors.secret_key = 'Invalid Stripe secret key format. Must start with sk_test_ or sk_live_';
      }
      if (apiKey.startsWith('pk_test_') && secretKey && !secretKey.startsWith('sk_test_')) {
        errors.secret_key = 'Test API key requires test secret key (sk_test_)';
      }
      if (apiKey.startsWith('pk_live_') && secretKey && !secretKey.startsWith('sk_live_')) {
        errors.secret_key = 'Live API key requires live secret key (sk_live_)';
      }
    } else if (code === 'razorpay') {
      if (!apiKey.startsWith('rzp_test_') && !apiKey.startsWith('rzp_live_')) {
        errors.api_key = 'Invalid Razorpay API key format. Must start with rzp_test_ or rzp_live_';
      }
      if (secretKey && !secretKey.startsWith('rzp_test_') && !secretKey.startsWith('rzp_live_')) {
        errors.secret_key = 'Invalid Razorpay secret key format. Must start with rzp_test_ or rzp_live_';
      }
      if (apiKey.startsWith('rzp_test_') && secretKey && !secretKey.startsWith('rzp_test_')) {
        errors.secret_key = 'Test API key requires test secret key (rzp_test_)';
      }
      if (apiKey.startsWith('rzp_live_') && secretKey && !secretKey.startsWith('rzp_live_')) {
        errors.secret_key = 'Live API key requires live secret key (rzp_live_)';
      }
    } else if (code === 'phonepe') {
      if (!merchantId || !merchantId.trim()) {
        errors.merchant_id = 'Merchant ID is required for PhonePe';
      } else if (merchantId.length < 5) {
        errors.merchant_id = 'Merchant ID seems too short (minimum 5 characters)';
      }
      if (!secretKey || !secretKey.trim()) {
        errors.secret_key = 'Salt Key is required for PhonePe';
      } else if (secretKey.length < 10) {
        errors.secret_key = 'Salt Key seems too short (minimum 10 characters)';
      }
      // Check for wrong gateway credentials
      if (apiKey.startsWith('pk_test_') || apiKey.startsWith('pk_live_')) {
        errors.api_key = 'Invalid: Stripe credentials detected. PhonePe does not use pk_test_/pk_live_ format.';
      }
      if (apiKey.startsWith('rzp_test_') || apiKey.startsWith('rzp_live_')) {
        errors.api_key = 'Invalid: Razorpay credentials detected. PhonePe does not use rzp_test_/rzp_live_ format.';
      }
      if (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_')) {
        errors.secret_key = 'Invalid: Stripe secret key detected. PhonePe uses Salt Key, not sk_test_/sk_live_ format.';
      }
      if (secretKey.startsWith('rzp_test_') || secretKey.startsWith('rzp_live_')) {
        errors.secret_key = 'Invalid: Razorpay secret key detected. PhonePe uses Salt Key, not rzp_test_/rzp_live_ format.';
      }
    }
    
    return errors;
  };
  
  // Website Management State
  const [websites, setWebsites] = useState([]);
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [websiteForm, setWebsiteForm] = useState({
    site_name: '',
    site_domain: '',
    site_subdomain: '',
    logo_url: '',
    primary_color: '#3b82f6',
    is_active: true
  });

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'general') {
      fetchGeneralSettings();
    } else if (activeTab === 'security') {
      fetchSecuritySettings();
    } else if (activeTab === 'plan') {
      fetchBillingSettings();
    } else if (activeTab === 'system') {
      fetchApiKeys();
      fetchWebhooks();
      fetchFeatureFlags();
      fetchIntegrations();
    } else if (activeTab === 'websites') {
      fetchWebsites();
    } else if (activeTab === 'localization') {
      fetchLocalizationSettings();
    } else if (activeTab === 'payments') {
      fetchPaymentGateways();
    } else if (activeTab === 'logs') {
      fetchSystemLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || '',
        full_name: user.full_name || ''
      }));
    }
  }, [user]);

  const fetchWebsites = async () => {
    try {
      const response = await apiClient.get('/api/sites');
      if (response.data.success) {
        setWebsites(response.data.sites || []);
      } else {
        setWebsites([]);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
      setWebsites([]);
    }
  };

  const fetchLocalizationSettings = async () => {
    try {
      const response = await apiClient.get('/api/settings/localization');
      if (response.data.success && response.data.settings) {
        setLocalizationSettings(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching localization settings:', error);
    }
  };

  const fetchAdvancedSettings = async () => {
    try {
      const response = await apiClient.get('/api/settings/advanced');
      if (response.data.success && response.data.settings) {
        setAdvancedSettings(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching advanced settings:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await apiClient.get('/api/settings/logs');
      if (response.data.success) {
        // Logs are displayed in the Activity Log page, this is just a placeholder
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      setLoadingSettings(true);
      // Add cache-busting parameter
      const response = await apiClient.get('/api/settings?_t=' + Date.now());
      console.log('[GENERAL SETTINGS] Fetch response:', response.data);
      if (response.data.success && response.data.settings) {
        console.log('[GENERAL SETTINGS] Received settings:', response.data.settings);
        // Completely replace state, don't merge - ensures we get fresh data
        setGeneralSettings({
          store_name: response.data.settings.store_name || '',
          store_email: response.data.settings.store_email || '',
          store_phone: response.data.settings.store_phone || '',
          legal_name: response.data.settings.legal_name || '',
          address: response.data.settings.address || {
            street: '',
            apartment: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
          },
          timezone: response.data.settings.timezone || 'UTC',
          currency: response.data.settings.currency || 'USD',
          weight_unit: response.data.settings.weight_unit || 'kg',
          order_prefix: response.data.settings.order_prefix || '#',
          order_suffix: response.data.settings.order_suffix || '',
          locale: response.data.settings.locale || 'en'
        });
        if (response.data.meta?.last_updated_at) {
          setGeneralLastUpdated(response.data.meta.last_updated_at);
        }
      }
    } catch (error) {
      console.error('[GENERAL SETTINGS] Error fetching:', error);
      console.error('[GENERAL SETTINGS] Error response:', error.response?.data);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchBillingSettings = async () => {
    try {
      const response = await apiClient.get('/api/settings/billing');
      console.log('[BILLING] Fetch response:', response.data);
      if (response.data.success && response.data.billing) {
        // Completely replace state, don't merge - ensures we get fresh data
        setBillingSettings({
          plan_name: response.data.billing.plan_name || 'Free',
          plan_status: response.data.billing.plan_status || 'active',
          billing_cycle: response.data.billing.billing_cycle || 'monthly',
          next_billing_date: response.data.billing.next_billing_date || '',
          amount: response.data.billing.amount || '0.00',
          currency: response.data.billing.currency || 'USD',
          payment_method: response.data.billing.payment_method || null
        });
        console.log('[BILLING] Updated state:', {
          plan_name: response.data.billing.plan_name,
          amount: response.data.billing.amount,
          plan_status: response.data.billing.plan_status
        });
      }
    } catch (error) {
      console.error('Error fetching billing settings:', error);
    }
  };

  const handleUpgradePlan = async () => {
    if (!window.confirm('Are you sure you want to upgrade your plan? This will change your billing amount.')) {
      return;
    }
    try {
      console.log('[BILLING] Upgrading plan with:', {
        plan_name: 'Enterprise Pro',
        amount: 99.00,
        billing_cycle: billingSettings.billing_cycle
      });
      const response = await apiClient.post('/api/settings/billing/upgrade', {
        plan_name: 'Enterprise Pro',
        amount: 99.00,
        billing_cycle: billingSettings.billing_cycle || 'monthly'
      });
      console.log('[BILLING] Upgrade response:', response.data);
      if (response.data.success) {
        toast.success(response.data.message || 'Plan upgraded successfully!');
        // Force a fresh fetch after a small delay to ensure DB commit
        setTimeout(async () => {
          await fetchBillingSettings();
        }, 300);
      } else {
        toast.error(response.data.error || 'Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to upgrade plan');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }
    try {
      console.log('[BILLING] Cancelling subscription');
      const response = await apiClient.post('/api/settings/billing/cancel');
      console.log('[BILLING] Cancel response:', response.data);
      if (response.data.success) {
        toast.success(response.data.message || 'Subscription canceled successfully!');
        // Force a fresh fetch after a small delay to ensure DB commit
        setTimeout(async () => {
          await fetchBillingSettings();
        }, 300);
      } else {
        toast.error(response.data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleEditPaymentMethod = async () => {
    const brand = prompt('Enter card brand (e.g., Visa, Mastercard):', billingSettings.payment_method?.brand || 'Visa');
    if (!brand) return;
    
    const last4 = prompt('Enter last 4 digits:', billingSettings.payment_method?.last4 || '4242');
    if (!last4 || last4.length !== 4) {
      toast.error('Please enter exactly 4 digits');
      return;
    }
    
    const expMonth = prompt('Enter expiration month (1-12):', billingSettings.payment_method?.exp_month || 12);
    const expYear = prompt('Enter expiration year (YYYY):', billingSettings.payment_method?.exp_year || 2028);
    
    if (!expMonth || !expYear) return;
    
    try {
      const response = await apiClient.put('/api/settings/billing/payment-method', {
        payment_method: {
          brand: brand,
          last4: last4,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear)
        }
      });
      if (response.data.success) {
        toast.success('Payment method updated successfully!');
        await fetchBillingSettings();
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment method');
    }
  };

  const handleWebsiteSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: websiteForm.site_name,
        site_name: websiteForm.site_name,  // Also send for compatibility
        domain: websiteForm.site_domain,
        site_domain: websiteForm.site_domain,  // Also send for compatibility
        subdomain: websiteForm.site_subdomain,
        site_subdomain: websiteForm.site_subdomain,  // Also send for compatibility
        logo_url: websiteForm.logo_url || null,
        primary_color: websiteForm.primary_color || null,
        status: websiteForm.is_active ? 'active' : 'inactive',
        is_active: websiteForm.is_active  // Also send for compatibility
      };

      if (editingWebsite) {
        const response = await apiClient.put(`/api/sites/${editingWebsite.id}`, payload);
        if (response.data.success) {
        toast.success('Website updated successfully!');
        }
      } else {
        const response = await apiClient.post('/api/sites', payload);
        if (response.data.success) {
        toast.success('Website added successfully!');
        }
      }
      setShowWebsiteModal(false);
      setEditingWebsite(null);
      setWebsiteForm({
        site_name: '',
        site_domain: '',
        site_subdomain: '',
        logo_url: '',
        primary_color: '#3b82f6',
        is_active: true
      });
      fetchWebsites();
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error(error.response?.data?.message || 'Failed to save website');
    }
  };

  const handleEditWebsite = (website) => {
    setEditingWebsite(website);
    setWebsiteForm({
      site_name: website.name || website.site_name || '',
      site_domain: website.domain || website.site_domain || '',
      site_subdomain: website.site_subdomain || '',
      logo_url: website.logo_url || '',
      primary_color: website.primary_color || '#3b82f6',
      is_active: website.status === 'active' || website.is_active
    });
    setShowWebsiteModal(true);
  };

  const handleDeleteWebsite = async (id) => {
    if (!window.confirm('Are you sure you want to delete this website?')) {
      return;
    }
    try {
      const response = await apiClient.delete(`/api/sites/${id}`);
      if (response.data.success) {
      toast.success('Website deleted successfully!');
      fetchWebsites();
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error(error.response?.data?.message || 'Failed to delete website');
    }
  };

  const handleGeneralSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoadingSettings(true);
      console.log('[GENERAL SETTINGS] Sending update:', generalSettings);
      const response = await apiClient.put('/api/settings', { settings: generalSettings });
      console.log('[GENERAL SETTINGS] Update response:', response.data);
      if (response.data.success) {
        toast.success('General settings updated successfully!');
        // Wait a bit before refetching to ensure DB commit
        setTimeout(async () => {
          await fetchGeneralSettings();
        }, 500);
      } else {
        toast.error(response.data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('[GENERAL SETTINGS] Error updating:', error);
      console.error('[GENERAL SETTINGS] Error response:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // Preserve current avatar preview before update
    const currentAvatarPreview = avatarPreview;
    const currentAvatarUrl = profileData.avatar_url;
    console.log('[Profile Update] Current avatar preview exists:', !!currentAvatarPreview);
    console.log('[Profile Update] Current avatar URL:', currentAvatarUrl);
    
    try {
      const response = await apiClient.put('/api/admin/profile', {
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        // Include avatar_url if it exists to preserve it
        ...(currentAvatarUrl && { avatar_url: currentAvatarUrl.split('?')[0].split('&')[0] })
      });
      if (response.data.success) {
      toast.success('Profile updated successfully!');
        // Refetch profile data to get updated timestamps, but preserve avatar
        await fetchProfileData(true); // Pass true to preserve avatar during refetch
        // Double-check: if preview was cleared, restore it
        setTimeout(() => {
          if (!avatarPreview && currentAvatarPreview) {
            console.log('[Profile Update] Restoring avatar preview after refetch');
            setAvatarPreview(currentAvatarPreview);
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      // Restore avatar preview on error
      if (currentAvatarPreview && !avatarPreview) {
        console.log('[Profile Update] Restoring avatar preview on error');
        setAvatarPreview(currentAvatarPreview);
      }
    }
  };

  const handleSecuritySettingsUpdate = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      // Prepare data - convert null to actual values or use defaults
      const dataToSend = {
        password_min_length: securitySettings.password_min_length ?? 8,
        password_require_uppercase: securitySettings.password_require_uppercase ?? true,
        password_require_lowercase: securitySettings.password_require_lowercase ?? true,
        password_require_numbers: securitySettings.password_require_numbers ?? true,
        password_require_special: securitySettings.password_require_special ?? false,
        login_max_attempts: securitySettings.login_max_attempts ?? 5,
        login_lockout_duration: securitySettings.login_lockout_duration ?? 30,
        session_timeout: securitySettings.session_timeout ?? 3600,
        ip_whitelist_enabled: securitySettings.ip_whitelist_enabled ?? false,
        captcha_enabled: securitySettings.captcha_enabled ?? false
      };
      
      console.log('[Security Settings] Saving:', dataToSend);
      
      const response = await apiClient.put('/api/settings/security', dataToSend);
      if (response.data.success) {
        toast.success('Security settings saved successfully!');
        // Refetch to get updated values
        await fetchSecuritySettings();
      } else {
        toast.error(response.data.message || 'Failed to save security settings');
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save security settings');
    }
  };

  const handleAvatarUpload = async (e) => {
    console.log('[Avatar Upload] Handler triggered', e.target.files);
    const file = e.target.files[0];
    if (!file) {
      console.log('[Avatar Upload] No file selected');
      return;
    }

    console.log('[Avatar Upload] File selected:', file.name, file.size, file.type);

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Set uploading state
    setAvatarUploading(true);
    toast.loading('Processing image...', { id: 'avatar-upload' });

    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error('[Avatar Upload] FileReader error:', error);
      toast.error('Failed to read image file', { id: 'avatar-upload' });
      setAvatarUploading(false);
    };

    reader.onload = async () => {
      const base64String = reader.result;
      console.log('[Avatar Upload] FileReader loaded, base64 length:', base64String?.length || 0);
      console.log('[Avatar Upload] Base64 starts with:', base64String?.substring(0, 30));
      
      if (!base64String || !base64String.startsWith('data:image/')) {
        console.error('[Avatar Upload] Invalid base64 string');
        toast.error('Failed to process image', { id: 'avatar-upload' });
        setAvatarUploading(false);
        return;
      }
      
      // Store previous preview in case we need to revert
      const previousPreview = avatarPreview;
      
      // Update preview immediately for instant feedback
      console.log('[Avatar Upload] Setting avatar preview immediately');
      setAvatarPreview(base64String);
      toast.loading('Uploading to server...', { id: 'avatar-upload' });
      
      try {
        console.log('[Avatar Upload] Sending to server...');
        const response = await apiClient.post('/api/admin/profile/avatar', {
          avatar: base64String
        });
        console.log('[Avatar Upload] Server response:', response.data);
        
        if (response.data.success) {
          toast.success('Avatar updated successfully!', { id: 'avatar-upload' });
          // Update profile data with new avatar URL
          const newAvatarUrl = response.data.avatar_url || base64String;
          
          // Helper function to check if URL is a data URI
          const isDataUri = (url) => url && url.startsWith('data:');
          
          // Only add cache-busting to non-data URIs (regular URLs)
          // Data URIs cannot have query parameters
          let finalAvatarUrl = newAvatarUrl;
          if (!isDataUri(newAvatarUrl)) {
            finalAvatarUrl = newAvatarUrl + (newAvatarUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
          }
          
          setProfileData(prev => ({
            ...prev,
            avatar_url: finalAvatarUrl
          }));
          
          // Set preview to base64 string (data URIs work directly)
          setAvatarPreview(base64String);
          console.log('[Avatar Upload] ✅ Avatar preview set and saved to server');
          
          // Don't call updateProfile here - it causes 401 error and we already updated the avatar
          // The avatar is already saved via the /api/admin/profile/avatar endpoint
        } else {
          throw new Error(response.data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('[Avatar Upload] Error uploading:', error);
        console.error('[Avatar Upload] Error details:', error.response?.data);
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to upload avatar', { id: 'avatar-upload' });
        // Revert to previous avatar on error
        setAvatarPreview(previousPreview || null);
      } finally {
        setAvatarUploading(false);
        // Reset file input to allow re-uploading the same file
        e.target.value = '';
      }
    };
    
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put('/api/admin/profile/preferences', preferences);
      if (response.data.success) {
        toast.success('Preferences updated successfully!');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session? You will be logged out from that device.')) {
      return;
    }
    try {
      // Fix: Use /close endpoint instead of /revoke
      const response = await apiClient.post(`/api/admin/sessions/${sessionId}/close`);
      if (response.data.success) {
        toast.success('Session revoked successfully!');
        // Refetch both sessions and profile to update counts
        await fetchActiveSessions();
        await fetchProfileData();
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < securitySettings.password_min_length) {
      toast.error(`Password must be at least ${securitySettings.password_min_length} characters long`);
      return;
    }
    
    try {
      const response = await apiClient.post('/api/auth/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Password changed successfully! Please login again with your new password.');
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });

        // Always force logout after password change for security
        // Clear tokens and redirect to login
        setTimeout(() => {
          logout();
          navigate('/login');
          toast.success('Please login with your new password');
        }, 1500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!profileData.email) {
      toast.error('Email address is required. Please update your profile email first.');
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email: profileData.email
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Password reset link has been sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error(error.response?.data?.message || 'Failed to send password reset link');
    }
  };

  const handlePrivacySettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put('/api/settings/privacy', { settings: privacySettings });
      if (response.data.success) {
        toast.success('Privacy settings updated successfully!');
        // Refetch to get updated values
        const fetchResponse = await apiClient.get('/api/settings/privacy');
        if (fetchResponse.data.success && fetchResponse.data.settings) {
          setPrivacySettings(prev => ({
            ...prev,
            ...fetchResponse.data.settings
          }));
        }
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    }
  };

  // System Section Handlers
  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/settings/api-keys', {
        key_name: newApiKey.key_name,
        permissions: newApiKey.permissions || []
      });
      if (response.data.success) {
        setCreatedApiKey(response.data.api_key);
        // Don't close modal yet - user needs to copy the keys
        setNewApiKey({ key_name: '', key_type: 'read', permissions: [] });
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error(error.response?.data?.error || 'Failed to create API key');
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      const webhookUrl = newWebhook.url || newWebhook.webhook_url || '';
      const eventType = newWebhook.event_type || newWebhook.events?.[0] || '';
      
      if (!webhookUrl || !eventType) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Build payload - backend expects 'url' and 'events' array
      const payload = {
        url: webhookUrl,
        webhook_url: webhookUrl,  // Also send for compatibility
        events: [eventType],  // Send as array
        event_type: eventType  // Also send for compatibility
      };
      
      console.log('Creating webhook with payload:', payload);
      
      const data = editingWebhook 
        ? await apiClient.put(`/api/settings/webhooks/${editingWebhook.id}`, payload)
        : await apiClient.post('/api/settings/webhooks', payload);
      
      if (data.data.success) {
        toast.success(editingWebhook ? 'Webhook updated successfully!' : 'Webhook created successfully!');
        setShowWebhookModal(false);
        setEditingWebhook(null);
        setNewWebhook({ name: '', url: '', events: [] });
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error(error.response?.data?.error || 'Failed to save webhook');
    }
  };

  const handleCreateFeatureFlag = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/settings/feature-flags', {
        flag_key: newFeatureFlag.flag_key || newFeatureFlag.feature_key || newFeatureFlag.key,
        feature_key: newFeatureFlag.flag_key || newFeatureFlag.feature_key || newFeatureFlag.key,
        key: newFeatureFlag.flag_key || newFeatureFlag.feature_key || newFeatureFlag.key,
        flag_name: newFeatureFlag.flag_name || newFeatureFlag.feature_name || newFeatureFlag.description,
        feature_name: newFeatureFlag.flag_name || newFeatureFlag.feature_name || newFeatureFlag.description,
        description: newFeatureFlag.description || newFeatureFlag.flag_name || newFeatureFlag.feature_name || '',
        is_enabled: newFeatureFlag.is_enabled !== undefined ? newFeatureFlag.is_enabled : false,
        enabled: newFeatureFlag.is_enabled !== undefined ? newFeatureFlag.is_enabled : false
      });
      if (response.data.success) {
        toast.success('Feature flag created successfully!');
        setShowFeatureFlagModal(false);
        setNewFeatureFlag({ flag_key: '', flag_name: '', description: '', is_enabled: false });
        fetchFeatureFlags();
      }
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast.error(error.response?.data?.error || 'Failed to create feature flag');
    }
  };

  const handleCreateIntegration = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/settings/integrations', {
        integration_name: newIntegration.integration_name,
        name: newIntegration.integration_name,  // Also send for compatibility
        integration_type: newIntegration.integration_type || '',
        config: {
          ...(newIntegration.config || {}),
          integration_type: newIntegration.integration_type || '',
          webhook_url: newIntegration.webhook_url || ''
        },
        webhook_url: newIntegration.webhook_url || '',
        is_enabled: false,
        enabled: false
      });
      if (response.data.success) {
        toast.success('Integration created successfully!');
        setShowIntegrationModal(false);
        setNewIntegration({ integration_name: '', integration_type: '', config: {} });
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error(error.response?.data?.error || 'Failed to create integration');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      // Parse date string - handle both ISO format and MySQL datetime format
      let date;
      if (typeof dateString === 'string') {
        // If it's a string without timezone, assume UTC
        if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z') && !dateString.includes('-', 10)) {
          date = new Date(dateString + 'Z'); // Add Z for UTC
        } else if (!dateString.includes('T')) {
          // MySQL datetime format: YYYY-MM-DD HH:MM:SS
          date = new Date(dateString.replace(' ', 'T') + 'Z'); // Convert to ISO and add UTC
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      const now = new Date();
      if (isNaN(date.getTime())) {
        console.error('[formatTimeAgo] Invalid date:', dateString);
        return 'Invalid date';
      }

      const diffMs = now.getTime() - date.getTime();
      
      // If difference is negative or less than 10 seconds, show "Just now"
      if (diffMs < 0) {
        return 'Just now';
      }
      if (diffMs < 10000) {
        return 'Just now';
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffSecs < 60) return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
      if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;

      // For dates older than 30 days, show formatted date
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
    } catch (e) {
      console.error('[formatTimeAgo] Error formatting date:', dateString, e);
      return 'Invalid date';
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await apiClient.get('/api/settings/notifications');
      console.log('[NOTIFICATIONS] Fetched preferences:', response.data);
      if (response.data.success && response.data.preferences) {
        setNotifications(response.data.preferences);
        
        // If we have available_types but no preferences saved, initialize them
        if (response.data.available_types && Object.keys(response.data.preferences).length === 0) {
          console.log('[NOTIFICATIONS] No preferences found, initializing defaults...');
          const defaultPreferences = {};
          Object.keys(response.data.available_types).forEach(key => {
            defaultPreferences[key] = response.data.available_types[key].default !== false;
          });
          
          // Save defaults to backend
          try {
            const saveResponse = await apiClient.put('/api/settings/notifications', {
              preferences: defaultPreferences
            });
            if (saveResponse.data.success && saveResponse.data.preferences) {
              setNotifications(saveResponse.data.preferences);
              console.log('[NOTIFICATIONS] ✅ Initialized and saved default preferences');
            }
          } catch (saveError) {
            console.error('[NOTIFICATIONS] Error saving default preferences:', saveError);
          }
        }
      } else {
        // Initialize with defaults if no preferences exist
        setNotifications({});
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      setNotifications({});
    }
  };

  const handleNotificationToggle = async (notificationType) => {
    // Safety check
    if (!notifications) {
      console.error('Invalid notification state:', { notifications, notificationType });
      return;
    }
    
    // Get current value - default to true if undefined (opt-in behavior)
    const currentValue = notifications[notificationType];
    const isCurrentlyEnabled = currentValue === undefined ? true : currentValue !== false;
    
    // Optimistically update UI
    const newValue = !isCurrentlyEnabled;
    setNotifications(prev => ({
      ...prev,
      [notificationType]: newValue
    }));
    
    // Save to backend
    try {
      const updatedPreferences = {
        ...notifications,
        [notificationType]: newValue
      };
      
      console.log('[NOTIFICATIONS] Saving preferences:', updatedPreferences);
      console.log('[NOTIFICATIONS] Toggling', notificationType, 'from', isCurrentlyEnabled, 'to', newValue);
      
      const response = await apiClient.put('/api/settings/notifications', {
        preferences: updatedPreferences
      });
      
      console.log('[NOTIFICATIONS] Save response:', response.data);
      
      if (response.data.success) {
        // Update with server response to ensure consistency
        if (response.data.preferences) {
          setNotifications(response.data.preferences);
          console.log('[NOTIFICATIONS] ✅ Preferences updated successfully');
        }
        toast.success('Notification preference updated');
      } else {
        throw new Error(response.data.error || 'Failed to update preferences');
      }
    } catch (error) {
      // Revert on error
      setNotifications(prev => ({
        ...prev,
        [notificationType]: isCurrentlyEnabled
      }));
      console.error('[NOTIFICATIONS] Error updating notification preference:', error);
      console.error('[NOTIFICATIONS] Error details:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update notification preference');
    }
  };

  // Fetch Functions
  const fetchProfileData = async (preserveAvatar = false) => {
    try {
      // Preserve current avatar preview if requested (for auto-refresh)
      const currentAvatarPreview = preserveAvatar ? avatarPreview : null;
      
      const response = await apiClient.get('/api/admin/profile');
      if (response.data.success && response.data.profile) {
        const profile = response.data.profile;
        // Handle avatar URL - only add cache-busting to non-data URIs
        const avatarUrl = profile.avatar_url || '';
        
        // Helper function to check if URL is a data URI
        const isDataUri = (url) => url && url.startsWith('data:');
        
        // Only add cache-busting to regular URLs, not data URIs
        let finalAvatarUrl = avatarUrl;
        if (avatarUrl && !isDataUri(avatarUrl)) {
          finalAvatarUrl = avatarUrl + (avatarUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
        }
        
        setProfileData({
          email: profile.email || '',
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          avatar_url: finalAvatarUrl,
          role: profile.role || 'admin',
          last_login: profile.last_login || '',
          password_last_changed: profile.password_last_changed || '',
          profile_last_updated: profile.profile_last_updated || '',
          created_at: profile.created_at || '',
          active_sessions_count: profile.active_sessions_count || 0
        });
        setPreferences(profile.preferences || {});
        setActiveSessions(profile.active_sessions_list || []);
        setLoginHistory(profile.login_history || []);
        const activities = profile.recent_activity || [];
        console.log('[Profile] Recent Activity loaded:', activities);
        setRecentActivity(activities);
        
        // Avatar preview handling - preserve if needed, otherwise update with server data
        if (avatarUrl && avatarUrl.trim()) {
          // Server has avatar URL - use it directly (data URIs work, regular URLs have cache-busting)
          setAvatarPreview(finalAvatarUrl);
        } else {
          // If server doesn't have avatar URL, preserve existing preview (don't clear it)
          // This is important for:
          // 1. Auto-refresh (preserveAvatar=true) - keep current preview
          // 2. After upload - keep base64 preview until server confirms
          // 3. Normal refresh - don't clear if we have a preview set
          if (preserveAvatar && currentAvatarPreview) {
            setAvatarPreview(currentAvatarPreview);
          } else if (avatarPreview) {
            // Even if not preserving explicitly, don't clear existing preview if server returns empty
            // Only update if server has a valid URL
            setAvatarPreview(avatarPreview);
          }
        }
        // Never set to null - always preserve existing preview if server doesn't have URL
        // This prevents clearing the avatar after upload or during any refresh
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // On error, preserve avatar preview if requested
      if (preserveAvatar && avatarPreview) {
        setAvatarPreview(avatarPreview);
      }
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await apiClient.get('/api/admin/sessions');
      if (response.data.success) {
        setActiveSessions(response.data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };


  const fetchSecuritySettings = async () => {
    try {
      const response = await apiClient.get('/api/settings/security');
      if (response.data.success && response.data.settings) {
        // Only set values that are explicitly returned (not defaults)
        const settings = response.data.settings;
        setSecuritySettings({
          password_min_length: settings.password_min_length ?? null,
          password_require_uppercase: settings.password_require_uppercase ?? false,
          password_require_lowercase: settings.password_require_lowercase ?? false,
          password_require_numbers: settings.password_require_numbers ?? false,
          password_require_special: settings.password_require_special ?? false,
          login_max_attempts: settings.login_max_attempts ?? null,
          login_lockout_duration: settings.login_lockout_duration ?? null,
          session_timeout: settings.session_timeout ?? null,
          ip_whitelist_enabled: settings.ip_whitelist_enabled ?? false,
          captcha_enabled: settings.captcha_enabled ?? false
        });
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const fetchLoginAttempts = async (showToast = false) => {
    setRefreshingLoginAttempts(true);
    try {
      console.log('[SETTINGS] Fetching login attempts...');
      // Add cache-busting parameter and no-cache headers to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/api/settings/security/login-attempts?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('[SETTINGS] Login attempts response:', response.data);
      if (response.data.success) {
        const attempts = response.data.attempts || [];
        setLoginAttempts(attempts);
        setLoginAttemptsLastRefreshed(new Date());
        console.log('[SETTINGS] Set login attempts:', attempts.length);
        if (showToast) {
          toast.success(`Refreshed: ${attempts.length} login attempts loaded`);
        }
      } else {
        console.warn('[SETTINGS] Login attempts response not successful:', response.data);
        setLoginAttempts([]);
        if (showToast) {
          toast.error('Failed to load login attempts');
        }
      }
    } catch (error) {
      console.error('[SETTINGS] Error fetching login attempts:', error);
      setLoginAttempts([]);
      if (showToast) {
        toast.error('Failed to refresh login attempts');
      }
    } finally {
      setRefreshingLoginAttempts(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await apiClient.get('/api/settings/api-keys');
      if (response.data.success) {
        setApiKeys(response.data.api_keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setApiKeys([]);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await apiClient.get('/api/settings/webhooks');
      if (response.data.success) {
        setWebhooks(response.data.webhooks || []);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks([]);
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      const response = await apiClient.get('/api/settings/feature-flags');
      if (response.data.success) {
        setFeatureFlags(response.data.feature_flags || []);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      setFeatureFlags([]);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await apiClient.get('/api/settings/integrations');
      if (response.data.success) {
        setIntegrations(response.data.integrations || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations([]);
    }
  };

  const fetchPaymentGateways = async () => {
    setLoadingGateways(true);
    
    try {
      console.log('[PAYMENT GATEWAYS] Fetching from /payments/gateways...');
      // Try /payments/gateways first (same as Payment.js page)
      let response;
      try {
        response = await apiClient.get('/payments/gateways?_t=' + Date.now());
      } catch (firstError) {
        // If that fails, try the settings endpoint
        console.log('[PAYMENT GATEWAYS] First endpoint failed, trying alternative...', firstError.response?.data);
        response = await apiClient.get('/settings/payment-gateways?_t=' + Date.now());
      }
      
      console.log('[PAYMENT GATEWAYS] Response:', response.data);
      
      if (response.data.success) {
        const gateways = response.data.gateways || response.data.payment_gateways || [];
        console.log('[PAYMENT GATEWAYS] Setting gateways:', gateways);
        setPaymentGateways(gateways);
        if (gateways.length === 0) {
          console.warn('[PAYMENT GATEWAYS] ⚠️ Response was successful but gateways array is empty');
        }
      } else {
        console.warn('[PAYMENT GATEWAYS] Response success=false:', response.data);
        setPaymentGateways([]);
      }
    } catch (error) {
      console.error('[PAYMENT GATEWAYS] Error fetching payment gateways:', error);
      console.error('[PAYMENT GATEWAYS] Error response:', error.response?.data);
          setPaymentGateways([]);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load payment gateways';
      toast.error(errorMessage);
    } finally {
      setLoadingGateways(false);
    }
  };

  const handleSaveGateway = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setSavingGateway(true);
    try {
      const gatewayCode = gatewayForm.gateway_code || (editingGateway && (editingGateway.gateway_code || editingGateway.id));
      if (!gatewayCode) {
        toast.error('Gateway code is required');
        return;
      }

      if (!gatewayForm.gateway_name || !gatewayForm.gateway_name.trim()) {
        toast.error('Gateway name is required');
        setSavingGateway(false);
        return;
      }

      if (!gatewayForm.api_key || !gatewayForm.api_key.trim()) {
        toast.error('API Key / Public Key is required');
        setSavingGateway(false);
        return;
      }

      // Validate credentials before saving
      const validationErrors = validateCredentials(
        gatewayCode,
        gatewayForm.api_key,
        gatewayForm.secret_key,
        gatewayForm.merchant_id
      );
      
      if (Object.keys(validationErrors).length > 0) {
        setCredentialErrors(validationErrors);
        const firstError = Object.values(validationErrors)[0];
        toast.error(firstError || 'Please fix credential validation errors');
        setSavingGateway(false);
        return;
      }
      
      // Clear errors if validation passes
      setCredentialErrors({});

      // PhonePe specific validation
      const isPhonePe = gatewayCode === 'phonepe' || gatewayCode.includes('phonepe');
      if (isPhonePe) {
        if (!gatewayForm.merchant_id || !gatewayForm.merchant_id.trim()) {
          toast.error('Merchant ID is required for PhonePe');
          setSavingGateway(false);
          return;
        }
      }

      // Prepare payload with all necessary fields
      const payload = {
        gateway_code: gatewayCode,
        gateway_name: gatewayForm.gateway_name.trim(),
        is_enabled: gatewayForm.is_enabled !== undefined ? gatewayForm.is_enabled : false,
        mode: gatewayForm.mode || 'test',
        currency: gatewayForm.currency || 'USD',
        api_key_public: gatewayForm.api_key.trim(),
        merchant_id: gatewayForm.merchant_id ? gatewayForm.merchant_id.trim() : '',
        webhook_secret: gatewayForm.webhook_secret ? gatewayForm.webhook_secret.trim() : ''
      };

      // Handle secret key - only include if user provided a new value
      const secretKeyValue = gatewayForm.secret_key || '';
      if (secretKeyValue && secretKeyValue.trim() && !secretKeyValue.startsWith('encrypted:')) {
        // User entered a new secret key
        payload.api_key_secret = secretKeyValue.trim();
      } else if (!editingGateway) {
        // For new gateways, secret is required
        if (!secretKeyValue || !secretKeyValue.trim()) {
          toast.error('Secret key is required for new gateways');
          setSavingGateway(false);
          return;
        }
      }
      // For updates, if secret is empty, we don't send it (backend will keep existing)

      console.log('Saving gateway configuration:', { gatewayCode, isNew: !editingGateway, payload: { ...payload, api_key_secret: payload.api_key_secret ? '***HIDDEN***' : '' } });

      // Try multiple endpoints to ensure compatibility
      let response;
      let lastError = null;
      
      if (editingGateway) {
        // Update existing gateway
        try {
          response = await apiClient.put(`/payments/gateways/${gatewayCode}`, payload);
        } catch (error) {
          lastError = error;
          console.log('First endpoint failed, trying alternative...', error.response?.data);
          try {
            response = await apiClient.put(`/settings/payment-gateways/${gatewayCode}`, payload);
          } catch (altError) {
            lastError = altError;
            throw altError;
          }
        }
      } else {
        // Create new gateway
        try {
          response = await apiClient.post('/payments/gateways', payload);
        } catch (error) {
          lastError = error;
          console.log('First endpoint failed, trying alternative...', error.response?.data);
          try {
            response = await apiClient.post('/settings/payment-gateways', payload);
          } catch (altError) {
            lastError = altError;
            throw altError;
          }
        }
      }

      if (response && response.data && response.data.success) {
        toast.success(`Payment gateway ${editingGateway ? 'updated' : 'created'} successfully!`);
        setShowGatewayModal(false);
        setEditingGateway(null);
        setGatewayForm({
          gateway_code: '',
          gateway_name: '',
          is_enabled: false,
          mode: 'test',
          currency: 'USD',
          api_key: '',
          secret_key: '',
          webhook_secret: '',
          merchant_id: ''
        });
        // Refresh the gateways list
        await fetchPaymentGateways();
      } else {
        const errorMsg = response?.data?.error || response?.data?.message || 'Failed to save gateway configuration';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save payment gateway configuration. Please check your input and try again.';
      toast.error(errorMessage);
    } finally {
      setSavingGateway(false);
    }
  };

  const handleTestGatewayConnection = async () => {
    setTestingGateway(true);
    try {
      const gatewayCode = gatewayForm.gateway_code || (editingGateway && (editingGateway.gateway_code || editingGateway.id));
      if (!gatewayCode) {
        toast.error('Gateway code is required');
        setTestingGateway(false);
        return;
      }

      // Prepare test payload
      const testPayload = {
        api_key_public: gatewayForm.api_key || '',
        api_key_secret: gatewayForm.secret_key || '',
        merchant_id: gatewayForm.merchant_id || '',
        mode: gatewayForm.mode || 'test'
      };

      // Basic validation
      const isPhonePe = gatewayCode.toLowerCase() === 'phonepe';
      if (isPhonePe) {
        if (!testPayload.merchant_id || !testPayload.merchant_id.trim()) {
          toast.error('PhonePe requires Merchant ID for testing');
          setTestingGateway(false);
          return;
        }
        // If editing and secret_key is empty, backend will use existing secret from DB
        if (!testPayload.api_key_secret || !testPayload.api_key_secret.trim()) {
          if (!editingGateway) {
            toast.error('PhonePe requires Salt Key for testing. If editing an existing gateway, the stored key will be used.');
            setTestingGateway(false);
            return;
          }
          // For editing, remove secret_key from payload - backend will use existing one
          delete testPayload.api_key_secret;
        }
      } else {
        if (!testPayload.api_key_public || !testPayload.api_key_public.trim()) {
          toast.error('API Key is required for testing');
          setTestingGateway(false);
          return;
        }
        // If editing and secret_key is empty, backend will use existing secret from DB
        if (!testPayload.api_key_secret || !testPayload.api_key_secret.trim()) {
          if (!editingGateway) {
            toast.error('Secret Key is required for testing. If editing an existing gateway, the stored key will be used.');
            setTestingGateway(false);
            return;
          }
          // For editing, remove secret_key from payload - backend will use existing one
          delete testPayload.api_key_secret;
        }
      }

      console.log('Testing gateway connection:', { gatewayCode, testMode: true });

      // Test the connection
      let response;
      try {
        response = await apiClient.post(`/payments/gateways/${gatewayCode}/test`, testPayload);
      } catch (error) {
        console.log('First endpoint failed, trying alternative...', error.response?.data);
        try {
          response = await apiClient.post(`/settings/payment-gateways/${gatewayCode}/test`, testPayload);
        } catch (altError) {
          throw altError;
        }
      }

      if (response && response.data) {
        if (response.data.success) {
          // Show success with validation details
          const validation = response.data.validation;
          let message = response.data.message || 'Connection test successful!';
          
          if (validation && validation.warnings && validation.warnings.length > 0) {
            toast.success(message, { duration: 5000 });
            // Show warnings separately
            setTimeout(() => {
              toast(`⚠️ Format warnings: ${validation.warnings.join('; ')}`, {
                icon: '⚠️',
                duration: 6000
              });
            }, 500);
          } else {
            toast.success(message, { duration: 4000 });
          }
          
          if (response.data.note) {
            setTimeout(() => {
              toast(response.data.note, {
                icon: '💡',
                duration: 5000
              });
            }, 1000);
          }
        } else {
          toast.error(response.data.error || 'Connection test failed');
        }
      }
    } catch (error) {
      console.error('Error testing gateway connection:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to test connection. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setTestingGateway(false);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const response = await apiClient.get('/api/settings/privacy');
      if (response.data.success && response.data.settings) {
        setPrivacySettings(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    }
  };

  // Fetch data when Account tab is active
  useEffect(() => {
  }, [activeTab]);

  // Fetch data when Security tab is active
  useEffect(() => {
    if (activeTab === 'security') {
      fetchSecuritySettings();
      fetchLoginAttempts(false); // Don't show toast on initial load
    }
  }, [activeTab]);

  // Fetch data when System tab is active
  useEffect(() => {
    if (activeTab === 'system') {
      fetchApiKeys();
      fetchWebhooks();
      fetchFeatureFlags();
      fetchIntegrations();
    }
  }, [activeTab]);


  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'plan', label: 'Plan & Subscription', icon: FiCreditCard },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'payments', label: 'Payments', icon: FiCreditCard },
    { id: 'system', label: 'System', icon: FiZap },
    { id: 'logs', label: 'Logs', icon: FiActivity },
    { id: 'localization', label: 'Localization', icon: FiGlobe },
    { id: 'websites', label: 'Sites', icon: FiGlobe }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '12px' }}>
        <h1 className="page-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>Settings</h1>
        <p className="page-subtitle" style={{ fontSize: '11px', margin: 0 }}>Manage your account settings and preferences</p>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
      {/* Settings Sidebar */}
      <div style={{ 
        width: '180px',
        background: 'white', 
        borderRadius: '6px',
        padding: '8px',
        height: 'fit-content',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '6px', color: '#1e293b', fontSize: '11px', fontWeight: '600', padding: '0 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  border: 'none',
                  background: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '11px',
                  fontWeight: isActive ? '600' : '400',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.color = '#475569';
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#475569';
                    if (span) span.style.color = '#475569';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#64748b';
                    if (span) span.style.color = '#64748b';
                  } else {
                    // Ensure active state colors are maintained
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = '#ffffff';
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }
                }}
              >
                <tab.icon style={{ 
                  fontSize: '14px', 
                  flexShrink: 0, 
                  width: '14px', 
                  height: '14px',
                  color: isActive ? '#ffffff' : '#64748b',
                  stroke: isActive ? '#ffffff' : '#64748b'
                }} />
                <span style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  flex: 1,
                  color: isActive ? '#ffffff' : '#64748b'
                }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div style={{ flex: 1 }}>
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>General Settings</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b' }}>
                  <FiClock style={{ fontSize: '11px' }} />
                  <span>Last updated: <strong>{generalLastUpdated ? formatTimeAgo(generalLastUpdated) : 'Never'}</strong></span>
                </div>
              </div>

              {/* Store Details Card */}
              <div className="card" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '9px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', marginTop: 0 }}>Store Details</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Store Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalSettings.store_name}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, store_name: e.target.value })}
                      placeholder="My Store"
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0', 
                        fontSize: '12px',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Store Contact Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={generalSettings.store_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, store_email: e.target.value })}
                        placeholder="contact@example.com"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          fontSize: '12px',
                          width: '100%',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Store Phone</label>
                      <input
                        type="text"
                        className="form-input"
                        value={generalSettings.store_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, store_phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          fontSize: '12px',
                          width: '100%',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information Card */}
              <div className="card" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '9px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', marginTop: 0 }}>Billing Information</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Legal Business Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalSettings.legal_name}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, legal_name: e.target.value })}
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0', 
                        fontSize: '12px',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Country/Region</label>
                    <select
                      className="form-select"
                      value={generalSettings.address?.country || ''}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        address: { ...generalSettings.address, country: e.target.value }
                      })}
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0', 
                        width: '100%', 
                        fontSize: '12px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalSettings.address?.street || ''}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        address: { ...generalSettings.address, street: e.target.value }
                      })}
                      placeholder="Street address"
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0', 
                        fontSize: '12px',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Apartment, suite, etc. <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '10px' }}>(Optional)</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalSettings.address?.apartment || ''}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        address: { ...generalSettings.address, apartment: e.target.value }
                      })}
                      placeholder="Apartment, suite, etc."
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0', 
                        fontSize: '12px',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={generalSettings.address?.city || ''}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          address: { ...generalSettings.address, city: e.target.value }
                        })}
                        placeholder="City"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          fontSize: '12px',
                          width: '100%',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>State</label>
                      <input
                        type="text"
                        className="form-input"
                        value={generalSettings.address?.state || ''}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          address: { ...generalSettings.address, state: e.target.value }
                        })}
                        placeholder="State"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          fontSize: '12px',
                          width: '100%',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>PIN / Postal Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={generalSettings.address?.postal_code || ''}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          address: { ...generalSettings.address, postal_code: e.target.value }
                        })}
                        placeholder="Postal code"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          fontSize: '12px',
                          width: '100%',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Standards and Formats Card */}
              <div className="card" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '9px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', marginTop: 0 }}>Standards and Formats</h3>

                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Timezone</label>
                      <select
                        className="form-select"
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          width: '100%', 
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="UTC">UTC</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Default Currency</label>
                      <select
                        className="form-select"
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          width: '100%', 
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Default Weight Unit</label>
                      <select
                        className="form-select"
                        value={generalSettings.weight_unit}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, weight_unit: e.target.value })}
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          width: '100%', 
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'block', fontWeight: '500', color: '#475569', marginBottom: '3px', fontSize: '11px' }}>Order ID Format</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={generalSettings.order_prefix}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, order_prefix: e.target.value })}
                            placeholder="#"
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              border: '1px solid #e2e8f0', 
                              width: '100%', 
                              fontSize: '12px',
                              outline: 'none',
                              transition: 'all 0.2s',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#FF8C00';
                              e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={generalSettings.order_suffix}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, order_suffix: e.target.value })}
                            placeholder="Suffix"
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              border: '1px solid #e2e8f0', 
                              width: '100%', 
                              fontSize: '12px',
                              outline: 'none',
                              transition: 'all 0.2s',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#FF8C00';
                              e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>
                      <p className="form-hint" style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', marginBottom: 0 }}>
                        Example: {generalSettings.order_prefix}1001{generalSettings.order_suffix}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGeneralSettingsUpdate}
                  disabled={loadingSettings}
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiSave size={13} />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Plan & Subscription Tab */}
          {activeTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: '0 0 2px 0' }}>Plan & Subscription</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '10px' }}>
                  Manage your subscription plan and billing information
                    </p>
                  </div>

              {/* Current Plan Card */}
              <div className="card" style={{ 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                background: '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                        {billingSettings.plan_name || 'Enterprise Pro'}
                      </h3>
                  <span style={{
                        padding: '2px 6px',
                        borderRadius: '5px',
                        background: billingSettings.plan_status === 'active' ? '#dcfce7' : billingSettings.plan_status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                        color: billingSettings.plan_status === 'active' ? '#166534' : billingSettings.plan_status === 'cancelled' ? '#991b1b' : '#92400e',
                        fontSize: '9px',
                    fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>{billingSettings.plan_status || 'active'}</span>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: '1.4' }}>
                      Everything you need to run your commerce business efficiently
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', lineHeight: '1', marginBottom: '2px' }}>
                      {billingSettings.currency === 'USD' ? '$' : '₹'}{parseFloat(billingSettings.amount || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 500 }}>
                      per {billingSettings.billing_cycle === 'monthly' ? 'month' : 'year'}
                    </div>
                  </div>
                </div>

                {/* Billing Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '6px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '5px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      fontSize: '8px',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: '#64748b', 
                      marginBottom: '3px', 
                      fontWeight: '600' 
                    }}>Billing Cycle</p>
                    <p style={{ 
                      fontWeight: 600, 
                      color: '#1e293b', 
                      margin: 0, 
                      fontSize: '11px',
                      textTransform: 'capitalize'
                    }}>
                      {billingSettings.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                    </p>
                  </div>
                  <div style={{
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '5px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      fontSize: '8px',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: '#64748b', 
                      marginBottom: '3px', 
                      fontWeight: '600' 
                    }}>Next Billing Date</p>
                    <p style={{ 
                      fontWeight: 600, 
                      color: '#1e293b', 
                      margin: 0, 
                      fontSize: '11px'
                    }}>
                      {billingSettings.next_billing_date 
                        ? new Date(billingSettings.next_billing_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div style={{
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '5px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      fontSize: '8px',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: '#64748b', 
                      marginBottom: '3px', 
                      fontWeight: '600' 
                    }}>Status</p>
                    <p style={{ 
                      fontWeight: 600, 
                      color: '#1e293b', 
                      margin: 0, 
                      fontSize: '11px',
                      textTransform: 'capitalize'
                    }}>
                      {billingSettings.plan_status === 'active' ? 'Active' : billingSettings.plan_status || 'Active'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button 
                    onClick={handleUpgradePlan}
                    style={{
                      padding: '5px 12px',
                      background: '#667eea',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#5568d3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#667eea';
                    }}
                  >
                    Upgrade Plan
                  </button>
                  <button 
                    onClick={handleCancelSubscription}
                    style={{
                      padding: '5px 12px',
                      background: 'white',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8fafc';
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#e2e8f0';
                    }}
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="card" style={{ 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                background: '#ffffff'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', margin: '0 0 2px 0' }}>
                    Payment Method
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '10px' }}>
                    The payment method used for your subscription billing
                  </p>
                </div>

                {billingSettings.payment_method ? (
                    <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}>
                    {/* Card Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-20%',
                      width: '150px',
                      height: '150px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      borderRadius: '50%'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-30%',
                      left: '-10%',
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                      borderRadius: '50%'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          width: '38px', 
                          height: '24px', 
                          background: 'rgba(255,255,255,0.25)',
                          borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          marginBottom: '8px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                          <span style={{
                      color: '#ffffff !important',
                            fontSize: '8px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            textShadow: 'none',
                            opacity: 1
                          }}>CARD</span>
                        </div>
                        <div style={{ marginBottom: '6px' }}>
                          <p style={{ 
                            margin: '0 0 3px 0', 
                            fontWeight: 600, 
                            color: '#ffffff !important',
                            fontSize: '12px',
                            letterSpacing: '0.2px',
                            textShadow: 'none',
                            opacity: 1
                          }}>
                            •••• •••• •••• {billingSettings.payment_method?.last4 || '4242'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '10px', 
                              color: '#ffffff !important',
                              fontWeight: 600,
                              textShadow: 'none',
                              opacity: 1
                            }}>
                              {billingSettings.payment_method?.brand || 'Visa'}
                            </p>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '10px', 
                              color: '#ffffff !important',
                              fontWeight: 600,
                              textShadow: 'none',
                              opacity: 1
                            }}>
                              Expires {String(billingSettings.payment_method?.exp_month || 12).padStart(2, '0')}/{billingSettings.payment_method?.exp_year || 2028}
                            </p>
                          </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleEditPaymentMethod}
                        style={{ 
                          background: 'rgba(255,255,255,0.25)',
                          border: '1px solid rgba(255,255,255,0.5)',
                          color: '#ffffff !important',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '10px',
                          transition: 'all 0.2s',
                          backdropFilter: 'blur(10px)',
                          whiteSpace: 'nowrap',
                          textShadow: 'none',
                          opacity: 1
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.35)';
                          e.target.style.color = '#ffffff';
                          e.target.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.25)';
                          e.target.style.color = '#ffffff';
                          e.target.style.opacity = '1';
                        }}
                  >
                    Edit
                  </button>
                </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px 12px',
                    border: '2px dashed #cbd5e0',
                    borderRadius: '6px',
                    textAlign: 'center',
                    background: '#f8fafc'
                  }}>
                    <FiCreditCard style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '8px' }} />
                    <p style={{ margin: '0 0 3px 0', color: '#475569', fontWeight: 600, fontSize: '11px' }}>
                      No payment method on file
                    </p>
                    <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '10px' }}>
                      Add a payment method to continue your subscription
                    </p>
                <button 
                  onClick={handleEditPaymentMethod}
                      style={{
                        padding: '5px 12px',
                        background: '#667eea',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FiPlus size={12} /> Add Payment Method
                </button>
                  </div>
                )}

                {billingSettings.payment_method && (
                  <button 
                    onClick={handleEditPaymentMethod}
                    style={{ 
                      width: '100%',
                      padding: '6px',
                      color: '#667eea',
                      background: '#f0f4ff',
                      border: '1px solid #c7d2fe',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '11px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e0e7ff';
                      e.target.style.borderColor = '#a5b4fc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f0f4ff';
                      e.target.style.borderColor = '#c7d2fe';
                    }}
                  >
                    <FiPlus size={12} /> Add New Payment Method
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="card" style={{ padding: '10px', marginBottom: '10px' }}>
                <div>
                  <h2 className="card-title" style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Password Policy</h2>
                  <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px' }}>
                    Configure password requirements for admin accounts. These rules will be enforced when users change their passwords.
                  </p>
                </div>
                <form onSubmit={handleSecuritySettingsUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Minimum Password Length</label>
                      <input
                        type="text"
                        className="form-input"
                        value={securitySettings.password_min_length ?? ''}
                        onChange={(e) => {
                          const inputVal = e.target.value;
                          // Allow empty or numeric input
                          if (inputVal === '' || /^\d+$/.test(inputVal)) {
                            const numVal = inputVal === '' ? null : parseInt(inputVal);
                            setSecuritySettings({ 
                              ...securitySettings, 
                              password_min_length: numVal
                            });
                          }
                        }}
                        onBlur={(e) => {
                          if (!e.target.value || e.target.value.trim() === '') {
                            setSecuritySettings({ ...securitySettings, password_min_length: null });
                            return;
                          }
                          let val = parseInt(e.target.value);
                          if (isNaN(val) || val < 1) {
                            val = 1;  // Allow minimum of 1 character
                          } else if (val > 32) {
                            val = 32;
                          }
                          setSecuritySettings({ ...securitySettings, password_min_length: val });
                        }}
                        placeholder="Enter value (default: 8)"
                        style={{ 
                          WebkitAppearance: 'textfield', 
                          MozAppearance: 'textfield',
                          padding: '5px 8px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                      <small style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', display: 'block' }}>
                        Minimum 1, Maximum 32 characters. Current: {securitySettings.password_min_length ?? 'Not set (default: 8)'}
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Session Timeout (seconds)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={securitySettings.session_timeout ?? ''}
                        onChange={(e) => {
                          const inputVal = e.target.value;
                          // Allow empty or numeric input
                          if (inputVal === '' || /^\d+$/.test(inputVal)) {
                            const numVal = inputVal === '' ? null : parseInt(inputVal);
                            setSecuritySettings({ 
                              ...securitySettings, 
                              session_timeout: numVal
                            });
                          }
                        }}
                        onBlur={(e) => {
                          if (!e.target.value || e.target.value.trim() === '') {
                            setSecuritySettings({ ...securitySettings, session_timeout: null });
                            return;
                          }
                          let val = parseInt(e.target.value);
                          if (isNaN(val) || val < 300) {
                            val = 300;
                          }
                          setSecuritySettings({ ...securitySettings, session_timeout: val });
                        }}
                        placeholder="Enter value (default: 3600)"
                        style={{ 
                          WebkitAppearance: 'textfield', 
                          MozAppearance: 'textfield',
                          padding: '5px 8px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                      <small style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', display: 'block' }}>
                        Minimum 300 seconds (5 minutes). Current: {securitySettings.session_timeout ? `${Math.floor(securitySettings.session_timeout / 60)} minutes` : 'Not set (default: 60 minutes)'}
                      </small>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.password_require_uppercase}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, password_require_uppercase: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Require uppercase letters</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.password_require_lowercase}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, password_require_lowercase: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Require lowercase letters</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.password_require_numbers}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, password_require_numbers: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Require numbers</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.password_require_special}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, password_require_special: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Require special characters</span>
                    </label>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '11px', marginBottom: '6px', color: '#1e293b', fontWeight: '600' }}>Login Protection</h3>
                    <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px' }}>
                      Configure protection against brute-force login attempts. After exceeding the maximum attempts, the account will be temporarily locked.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Max Login Attempts</label>
                        <input
                          type="text"
                          className="form-input"
                          value={securitySettings.login_max_attempts ?? ''}
                          onChange={(e) => {
                            const inputVal = e.target.value;
                            // Allow empty or numeric input
                            if (inputVal === '' || /^\d+$/.test(inputVal)) {
                              const numVal = inputVal === '' ? null : parseInt(inputVal);
                              setSecuritySettings({ 
                                ...securitySettings, 
                                login_max_attempts: numVal
                              });
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || e.target.value.trim() === '') {
                              setSecuritySettings({ ...securitySettings, login_max_attempts: null });
                              return;
                            }
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 3) {
                              val = 3;
                            } else if (val > 10) {
                              val = 10;
                            }
                            setSecuritySettings({ ...securitySettings, login_max_attempts: val });
                          }}
                          placeholder="Enter value (default: 5)"
                          style={{ 
                            WebkitAppearance: 'textfield', 
                            MozAppearance: 'textfield',
                            padding: '5px 8px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <small style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', display: 'block' }}>
                          After {securitySettings.login_max_attempts ?? 5} failed attempts, account will be locked
                        </small>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Lockout Duration (minutes)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={securitySettings.login_lockout_duration ?? ''}
                          onChange={(e) => {
                            const inputVal = e.target.value;
                            // Allow empty or numeric input
                            if (inputVal === '' || /^\d+$/.test(inputVal)) {
                              const numVal = inputVal === '' ? null : parseInt(inputVal);
                              setSecuritySettings({ 
                                ...securitySettings, 
                                login_lockout_duration: numVal
                              });
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || e.target.value.trim() === '') {
                              setSecuritySettings({ ...securitySettings, login_lockout_duration: null });
                              return;
                            }
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 5) {
                              val = 5;
                            } else if (val > 60) {
                              val = 60;
                            }
                            setSecuritySettings({ ...securitySettings, login_lockout_duration: val });
                          }}
                          placeholder="Enter value (default: 30)"
                          style={{ 
                            WebkitAppearance: 'textfield', 
                            MozAppearance: 'textfield',
                            padding: '5px 8px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <small style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', display: 'block' }}>
                          Account will be locked for {securitySettings.login_lockout_duration ?? 30} minutes after max attempts reached
                        </small>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.captcha_enabled}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, captcha_enabled: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Enable CAPTCHA on login</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={securitySettings.ip_whitelist_enabled}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, ip_whitelist_enabled: e.target.checked })}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px' }}>Enable IP whitelisting</span>
                    </label>
                  </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '11px', fontWeight: '500', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiSave size={12} />
                    Save Security Settings
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="card" style={{ padding: '10px', marginTop: '10px' }}>
            <h2 className="card-title" style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Change Password</h2>
            <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px' }}>
              Update your account password. Make sure it meets the password policy requirements above.
            </p>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    className="form-input"
                    style={{ 
                      paddingRight: '32px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPasswords.old ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    className="form-input"
                    style={{ 
                      paddingRight: '32px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    minLength={securitySettings.password_min_length || 8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPasswords.new ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  </button>
                </div>
                <small style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', display: 'block' }}>
                  Minimum {securitySettings.password_min_length || 8} characters
                  {securitySettings.password_require_uppercase && ', uppercase'}
                  {securitySettings.password_require_lowercase && ', lowercase'}
                  {securitySettings.password_require_numbers && ', numbers'}
                  {securitySettings.password_require_special && ', special characters'}
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '10px', fontWeight: '500', color: '#475569', marginBottom: '2px', display: 'block' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    className="form-input"
                    style={{ 
                      paddingRight: '32px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPasswords.confirm ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '11px', fontWeight: '500', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiSave size={12} />
                  Change Password
                </button>
                {profileData.email && (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleRequestPasswordReset}
                    style={{ 
                      padding: '5px 12px', 
                      fontSize: '11px', 
                      fontWeight: '500', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FiMail size={12} />
                    Request Password Reset Email
                  </button>
                )}
              </div>
              {profileData.email && (
                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', marginBottom: 0 }}>
                  Need to reset your password? Click "Request Password Reset Email" to receive a reset link at <strong>{profileData.email}</strong>
                </p>
              )}
            </form>
          </div>

            </>
          )}

          {/* Messages & Notifications Tab - Removed (covered in General Settings) */}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <>
              <div className="card" style={{ padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <h2 className="card-title" style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>Payment Gateways</h2>
                    <p style={{ color: '#64748b', marginTop: '2px', marginBottom: 0, fontSize: '8px', lineHeight: '1.3' }}>
                      Configure and manage payment gateway integrations. Enable or disable payment methods.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingGateway(null);
                      setGatewayForm({
                        gateway_code: '',
                        gateway_name: '',
                        is_enabled: false,
                        mode: 'test',
                        currency: 'USD',
                        api_key: '',
                        secret_key: '',
                        webhook_secret: '',
                        merchant_id: ''
                      });
                      setShowGatewayModal(true);
                    }}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '3px 8px',
                      fontSize: '8px',
                      fontWeight: '500',
                      borderRadius: '4px',
                      lineHeight: '1.2'
                    }}
                  >
                    <FiPlus size={9} />
                    Add Gateway
                  </button>
                </div>
                
                {paymentGateways.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 12px', color: '#94a3b8' }}>
                    <FiCreditCard size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
                    {loadingGateways ? (
                      <div style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <div style={{ 
                          display: 'inline-block',
                          width: '24px',
                          height: '24px',
                          border: '2px solid #e2e8f0',
                          borderTop: '2px solid #FF8C00',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginBottom: '8px'
                        }} />
                        <h3 style={{ color: '#64748b', marginBottom: '3px', fontSize: '10px', lineHeight: '1.2' }}>Loading payment gateways...</h3>
                        <p style={{ color: '#94a3b8', fontSize: '8px', lineHeight: '1.2' }}>
                          Please wait while we fetch your payment gateway configurations
                        </p>
                      </div>
                    ) : (
                      <>
                    <h3 style={{ color: '#64748b', marginBottom: '4px', fontSize: '10px', fontWeight: '600', lineHeight: '1.2' }}>No payment gateways configured</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '8px', lineHeight: '1.2' }}>
                      Add a payment gateway to start accepting payments
                    </p>
                      </>
                    )}
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={async () => {
                          console.log('[PAYMENT GATEWAYS] Force refreshing...');
                          await fetchPaymentGateways();
                        }}
                        className="btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '3px 8px',
                          fontSize: '8px',
                          background: '#64748b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: '500',
                          lineHeight: '1.2'
                        }}
                      >
                        <FiRefreshCw size={9} />
                        Refresh
                      </button>
                      <button
                        onClick={() => {
                          setEditingGateway(null);
                          setGatewayForm({
                            gateway_code: '',
                            gateway_name: '',
                            is_enabled: false,
                            mode: 'test',
                            currency: 'USD',
                            api_key: '',
                            secret_key: '',
                            webhook_secret: '',
                            merchant_id: ''
                          });
                          setShowGatewayModal(true);
                        }}
                        className="btn btn-primary"
                        style={{
                          padding: '3px 8px',
                          fontSize: '8px',
                          borderRadius: '4px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          lineHeight: '1.2'
                        }}
                      >
                        <FiPlus size={9} />
                        Add Your First Gateway
                      </button>
                    </div>
                  </div>
                ) : (
                <div style={{ display: 'grid', gap: '4px' }}>
                  {paymentGateways.map(gateway => (
                    <div key={gateway.gateway_code || gateway.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 8px',
                      background: '#f8fafc',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '9px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
                            {gateway.gateway_name || gateway.name}
                          </h3>
                          <span style={{
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '6px',
                            fontWeight: '600',
                            lineHeight: '1.2',
                            background: (gateway.is_enabled || gateway.status === 'active') ? '#dcfce7' : '#fee2e2',
                            color: (gateway.is_enabled || gateway.status === 'active') ? '#166534' : '#991b1b'
                          }}>
                            {(gateway.is_enabled || gateway.status === 'active') ? 'Active' : 'Inactive'}
                          </span>
                          <span style={{
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '6px',
                            fontWeight: '600',
                            lineHeight: '1.2',
                            background: gateway.mode === 'live' ? '#fef3c7' : '#e0e7ff',
                            color: gateway.mode === 'live' ? '#92400e' : '#3730a3'
                          }}>
                            {gateway.mode || 'test'}
                          </span>
                        </div>
                        <p style={{ margin: '1px 0', fontSize: '8px', color: '#64748b', lineHeight: '1.3' }}>
                          Currency: {gateway.currency || 'USD'} • API Key: {gateway.api_key_public ? `${gateway.api_key_public.substring(0, 10)}...` : 'Not configured'}
                        </p>
                        {gateway.created && (
                          <p style={{ margin: '1px 0 0 0', fontSize: '7px', color: '#94a3b8', lineHeight: '1.2' }}>
                            Created: {gateway.created}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          onClick={async () => {
                            setEditingGateway(gateway);
                            setGatewayForm({
                              gateway_code: gateway.gateway_code || gateway.id,
                              gateway_name: gateway.gateway_name || gateway.name || '',
                              is_enabled: gateway.is_enabled !== undefined ? gateway.is_enabled : (gateway.status === 'active'),
                              mode: gateway.mode || 'test',
                              currency: gateway.currency || 'USD',
                              api_key: gateway.api_key_public || gateway.api_key || '',
                              secret_key: '', // Never show secret key - user must re-enter if updating
                              webhook_secret: gateway.webhook_secret || '',
                              merchant_id: gateway.merchant_id || ''
                            });
                            setShowGatewayModal(true);
                            
                            // Fetch full gateway details to ensure we have latest data
                            try {
                              const gatewayCode = gateway.gateway_code || gateway.id;
                              const response = await apiClient.get(`/api/payments/gateways/${gatewayCode}`);
                              if (response.data.success && response.data.gateway) {
                                const fullGateway = response.data.gateway;
                                setEditingGateway(fullGateway);
                                setGatewayForm(prev => ({
                                  ...prev,
                                  gateway_name: fullGateway.gateway_name || fullGateway.name || prev.gateway_name,
                                  is_enabled: fullGateway.is_enabled !== undefined ? fullGateway.is_enabled : prev.is_enabled,
                                  mode: fullGateway.mode || prev.mode,
                                  currency: fullGateway.currency || prev.currency,
                                  api_key: fullGateway.api_key_public || fullGateway.api_key || prev.api_key,
                                  webhook_secret: fullGateway.webhook_secret || prev.webhook_secret,
                                  merchant_id: fullGateway.merchant_id || prev.merchant_id || '',
                                  // Don't update secret_key - keep it empty for security
                                  secret_key: '' // Always keep secret key empty when editing
                                }));
                              }
                            } catch (error) {
                              console.log('Could not fetch full gateway details, using provided data');
                            }
                          }}
                          style={{
                            padding: '3px 7px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            lineHeight: '1.2',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#2563eb';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#3b82f6';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FiEdit2 size={8} /> Configure
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus = !(gateway.is_enabled || gateway.status === 'active');
                            try {
                              const response = await apiClient.put(`/api/settings/payment-gateways/${gateway.gateway_code || gateway.id}`, {
                                is_enabled: newStatus
                              });
                              if (response.data.success) {
                                toast.success(`Payment gateway ${newStatus ? 'enabled' : 'disabled'} successfully!`);
                                fetchPaymentGateways();
                              }
                            } catch (error) {
                              console.error('Error updating payment gateway:', error);
                              toast.error(error.response?.data?.message || 'Failed to update gateway');
                            }
                          }}
                          style={{
                            padding: '3px 7px',
                            border: 'none',
                            borderRadius: '4px',
                            background: (gateway.is_enabled || gateway.status === 'active') ? '#ef4444' : '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: '500',
                            lineHeight: '1.2',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'translateY(0)';
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                          }}
                        >
                          {(gateway.is_enabled || gateway.status === 'active') ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* Gateway Configuration Modal */}
              {showGatewayModal && (
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    zIndex: 10000,
                    paddingTop: '80px',
                    paddingBottom: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                  onClick={() => {
                    setShowGatewayModal(false);
                    setEditingGateway(null);
                    setCredentialErrors({});
                    setGatewayForm({
                      gateway_code: '',
                      gateway_name: '',
                      is_enabled: false,
                      mode: 'test',
                      currency: 'USD',
                      api_key: '',
                      secret_key: '',
                      webhook_secret: '',
                      merchant_id: ''
                    });
                  }}
                >
                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      width: '100%',
                      maxWidth: '700px',
                      maxHeight: 'calc(100vh - 100px)',
                      margin: '0 auto',
                      overflow: 'hidden',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'slideUp 0.3s ease-out',
                      position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{
                      padding: '24px 32px',
                      borderBottom: '1px solid #e2e8f0',
                      background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0,
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}>
                      <div>
                        <h2 style={{ 
                          margin: 0, 
                          fontSize: '24px', 
                          fontWeight: '700', 
                          color: '#0f172a',
                          letterSpacing: '-0.025em'
                        }}>
                          {editingGateway ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
                        </h2>
                        {editingGateway && (
                          <p style={{ 
                            margin: '6px 0 0 0', 
                            color: '#64748b', 
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {gatewayForm.gateway_name || editingGateway.gateway_name || editingGateway.name || 'Gateway'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setShowGatewayModal(false);
                          setEditingGateway(null);
                          setGatewayForm({
                            gateway_code: '',
                            gateway_name: '',
                            is_enabled: false,
                            mode: 'test',
                            currency: 'USD',
                            api_key: '',
                            secret_key: '',
                            webhook_secret: '',
                            merchant_id: ''
                          });
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#e2e8f0';
                          e.target.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f1f5f9';
                          e.target.style.color = '#475569';
                        }}
                      >
                        <FiX />
                      </button>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div style={{
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      flex: 1,
                      padding: '32px',
                      minHeight: 0
                    }}>
                    <form id="gateway-form" onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveGateway(e);
                    }}>
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#0f172a',
                          letterSpacing: '0.01em'
                        }}>
                          Gateway Code <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={gatewayForm.gateway_code}
                          onChange={(e) => {
                            const newCode = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                            setGatewayForm({ ...gatewayForm, gateway_code: newCode });
                            // Clear credential errors when gateway code changes
                            setCredentialErrors({});
                            // Auto-fill gateway name if empty
                            if (!gatewayForm.gateway_name && newCode) {
                              const nameMap = {
                                'stripe': 'Stripe',
                                'razorpay': 'Razorpay',
                                'phonepe': 'PhonePe',
                                'paypal': 'PayPal',
                                'payu': 'PayU',
                                'instamojo': 'Instamojo'
                              };
                              if (nameMap[newCode]) {
                                setGatewayForm(prev => ({ ...prev, gateway_name: nameMap[newCode] }));
                              }
                            }
                          }}
                          placeholder="e.g., razorpay, stripe, paypal"
                          required
                          disabled={!!editingGateway}
                          style={{ 
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: editingGateway ? '#f8fafc' : '#fff',
                            color: '#0f172a',
                            textTransform: 'lowercase',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <small style={{ 
                          color: '#64748b', 
                          fontSize: '12px',
                          marginTop: '6px',
                          display: 'block'
                        }}>
                          Unique identifier (lowercase, alphanumeric and underscores only)
                        </small>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#0f172a',
                          letterSpacing: '0.01em'
                        }}>
                          Gateway Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={gatewayForm.gateway_name}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, gateway_name: e.target.value })}
                          placeholder="e.g., Razorpay, Stripe, PayPal"
                          required
                          style={{ 
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: '#fff',
                            color: '#0f172a',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            fontSize: '14px',
                            color: '#0f172a',
                            letterSpacing: '0.01em'
                          }}>
                            Mode <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={gatewayForm.mode}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, mode: e.target.value })}
                            required
                            style={{ 
                              width: '100%',
                              padding: '12px 16px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: '#fff',
                              color: '#0f172a',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#3b82f6';
                              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#cbd5e1';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="test">Test / Sandbox</option>
                            <option value="live">Live / Production</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            fontSize: '14px',
                            color: '#0f172a',
                            letterSpacing: '0.01em'
                          }}>
                            Currency <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={gatewayForm.currency}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, currency: e.target.value })}
                            required
                            style={{ 
                              width: '100%',
                              padding: '12px 16px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: '#fff',
                              color: '#0f172a',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#3b82f6';
                              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#cbd5e1';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#0f172a',
                          letterSpacing: '0.01em'
                        }}>
                          API Key / Public Key <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={gatewayForm.api_key}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setGatewayForm({ ...gatewayForm, api_key: newValue });
                              // Validate on change
                              const errors = validateCredentials(
                                gatewayForm.gateway_code,
                                newValue,
                                gatewayForm.secret_key,
                                gatewayForm.merchant_id
                              );
                              setCredentialErrors(prev => ({ ...prev, api_key: errors.api_key }));
                            }}
                          placeholder="pk_live_xxxxxxxxxxxx or your public API key"
                          required
                          style={{ 
                            width: '100%',
                            padding: '12px 16px',
                              paddingRight: gatewayForm.gateway_code ? '120px' : '16px',
                              border: credentialErrors.api_key ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                            fontSize: '13px',
                            backgroundColor: '#fff',
                            color: '#0f172a',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                              e.target.style.borderColor = credentialErrors.api_key ? '#ef4444' : '#3b82f6';
                              e.target.style.boxShadow = credentialErrors.api_key 
                                ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
                                : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                              e.target.style.borderColor = credentialErrors.api_key ? '#ef4444' : '#cbd5e1';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                          {gatewayForm.gateway_code && (
                            <button
                              type="button"
                              onClick={() => {
                                const testCreds = getTestCredentials(gatewayForm.gateway_code);
                                if (testCreds.api_key) {
                                  setGatewayForm(prev => ({
                                    ...prev,
                                    api_key: testCreds.api_key,
                                    secret_key: testCreds.secret_key || prev.secret_key,
                                    merchant_id: testCreds.merchant_id || prev.merchant_id,
                                    webhook_secret: testCreds.webhook_secret || prev.webhook_secret
                                  }));
                                  toast.success('Test credentials loaded!');
                                } else {
                                  toast.error('No test credentials available for this gateway');
                                }
                              }}
                              style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '6px 12px',
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#0369a1',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#e0f2fe';
                                e.target.style.borderColor = '#7dd3fc';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#f0f9ff';
                                e.target.style.borderColor = '#bae6fd';
                              }}
                            >
                              Use Test
                            </button>
                          )}
                        </div>
                        {credentialErrors.api_key && (
                          <small style={{ 
                            color: '#ef4444', 
                            fontSize: '12px',
                            marginTop: '6px',
                            display: 'block'
                          }}>
                            {credentialErrors.api_key}
                          </small>
                        )}
                        <small style={{ 
                          color: '#64748b', 
                          fontSize: '12px',
                          marginTop: '6px',
                          display: 'block'
                        }}>
                          Enter your public API key (this will be stored securely)
                        </small>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#0f172a',
                          letterSpacing: '0.01em'
                        }}>
                          {gatewayForm.gateway_code === 'phonepe' ? 'Salt Key' : 'Secret Key'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="password"
                          value={gatewayForm.secret_key}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setGatewayForm({ ...gatewayForm, secret_key: newValue });
                            // Validate on change
                            const errors = validateCredentials(
                              gatewayForm.gateway_code,
                              gatewayForm.api_key,
                              newValue,
                              gatewayForm.merchant_id
                            );
                            setCredentialErrors(prev => ({ ...prev, secret_key: errors.secret_key }));
                          }}
                          placeholder={gatewayForm.gateway_code === 'phonepe' ? 'Enter your Salt Key' : 'sk_live_xxxxxxxxxxxx or your secret key'}
                          required={!editingGateway}
                          style={{ 
                            width: '100%',
                            padding: '12px 16px',
                            border: credentialErrors.secret_key ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                            fontSize: '13px',
                            backgroundColor: '#fff',
                            color: '#0f172a',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = credentialErrors.secret_key ? '#ef4444' : '#3b82f6';
                            e.target.style.boxShadow = credentialErrors.secret_key 
                              ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
                              : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = credentialErrors.secret_key ? '#ef4444' : '#cbd5e1';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        {credentialErrors.secret_key && (
                          <small style={{ 
                            color: '#ef4444', 
                            fontSize: '12px',
                            marginTop: '6px',
                            display: 'block'
                          }}>
                            {credentialErrors.secret_key}
                          </small>
                        )}
                        <small style={{ 
                          color: '#64748b', 
                          fontSize: '12px',
                          marginTop: '6px',
                          display: 'block'
                        }}>
                          {editingGateway 
                            ? 'Enter your secret key (will be encrypted and stored securely). Leave empty to keep existing key.'
                            : 'Enter your secret key (will be encrypted and stored securely)'
                          }
                        </small>
                      </div>

                      {(gatewayForm.gateway_code === 'phonepe' || gatewayForm.gateway_code.includes('phonepe')) && (
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            fontSize: '14px',
                            color: '#0f172a',
                            letterSpacing: '0.01em'
                          }}>
                            Merchant ID <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={gatewayForm.merchant_id || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setGatewayForm({ ...gatewayForm, merchant_id: newValue });
                              // Validate on change
                              const errors = validateCredentials(
                                gatewayForm.gateway_code,
                                gatewayForm.api_key,
                                gatewayForm.secret_key,
                                newValue
                              );
                              setCredentialErrors(prev => ({ ...prev, merchant_id: errors.merchant_id }));
                            }}
                            placeholder="Enter your Merchant ID"
                            required
                            style={{ 
                              width: '100%',
                              padding: '12px 16px',
                              border: credentialErrors.merchant_id ? '1px solid #ef4444' : '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: '#fff',
                              color: '#0f172a',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = credentialErrors.merchant_id ? '#ef4444' : '#3b82f6';
                              e.target.style.boxShadow = credentialErrors.merchant_id 
                                ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
                                : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = credentialErrors.merchant_id ? '#ef4444' : '#cbd5e1';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                          {credentialErrors.merchant_id && (
                            <small style={{ 
                              color: '#ef4444', 
                              fontSize: '12px',
                              marginTop: '6px',
                              display: 'block'
                            }}>
                              {credentialErrors.merchant_id}
                            </small>
                          )}
                        </div>
                      )}

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#0f172a',
                          letterSpacing: '0.01em'
                        }}>
                          Webhook Secret <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '400' }}>(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={gatewayForm.webhook_secret}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, webhook_secret: e.target.value })}
                          placeholder="whsec_xxxxxxxxxxxx or webhook secret"
                          style={{ 
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                            fontSize: '13px',
                            backgroundColor: '#fff',
                            color: '#0f172a',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <small style={{ 
                          color: '#64748b', 
                          fontSize: '12px',
                          marginTop: '6px',
                          display: 'block'
                        }}>
                          Optional: Enter webhook secret for secure webhook verification
                        </small>
                      </div>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1px solid #93c5fd',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          <FiLock size={14} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <p style={{ 
                            margin: 0, 
                            color: '#1e40af', 
                            fontSize: '13px',
                            lineHeight: '1.6',
                            fontWeight: '500'
                          }}>
                            <strong style={{ fontWeight: '600' }}>Security Note:</strong> Your secret keys will be encrypted before storage. Never share your secret keys with anyone.
                          </p>
                        </div>
                      </div>

                      <div style={{ 
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '24px'
                      }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          cursor: 'pointer',
                          margin: 0
                        }}>
                          <input
                            type="checkbox"
                            checked={gatewayForm.is_enabled}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, is_enabled: e.target.checked })}
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              cursor: 'pointer',
                              accentColor: '#3b82f6'
                            }}
                          />
                          <div>
                            <span style={{ 
                              color: '#0f172a', 
                              fontWeight: '600',
                              fontSize: '14px',
                              display: 'block'
                            }}>
                              Enable this gateway
                            </span>
                            <small style={{ 
                              color: '#64748b', 
                              fontSize: '12px',
                              display: 'block',
                              marginTop: '2px'
                            }}>
                              Enable this gateway to accept payments
                            </small>
                          </div>
                        </label>
                      </div>

                    </form>
                    </div>
                    
                    {/* Footer */}
                    <div style={{
                      padding: '20px 32px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={handleTestGatewayConnection}
                        disabled={(() => {
                          // Can't test if already testing or saving
                          if (testingGateway || savingGateway) return true;
                          // Need API key
                          if (!gatewayForm.api_key || !gatewayForm.api_key.trim()) return true;
                          
                          // For PhonePe, need merchant_id and salt key (or existing secret in DB for editing)
                          const isPhonePe = gatewayForm.gateway_code === 'phonepe' || gatewayForm.gateway_code?.includes('phonepe');
                          if (isPhonePe) {
                            if (!gatewayForm.merchant_id || !gatewayForm.merchant_id.trim()) return true;
                            // Allow testing if secret_key is provided OR if editing (existing gateway has secret in DB)
                            if (!gatewayForm.secret_key || !gatewayForm.secret_key.trim()) {
                              // If editing, allow testing (will use existing secret from DB)
                              if (editingGateway) return false;
                              // If not editing, need secret key
                              return true;
                            }
                            return false;
                          }
                          
                          // For other gateways, need secret key OR allow if editing (existing secret in DB)
                          if (!gatewayForm.secret_key || !gatewayForm.secret_key.trim()) {
                            // If editing, allow testing (will use existing secret from DB)
                            if (editingGateway) return false;
                            // If not editing, need secret key
                            return true;
                          }
                          
                          return false;
                        })()}
                        style={{
                          background: (testingGateway || savingGateway || !gatewayForm.api_key || (!gatewayForm.secret_key && !editingGateway && gatewayForm.gateway_code !== 'phonepe') || (gatewayForm.gateway_code === 'phonepe' && !gatewayForm.merchant_id)) ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: (testingGateway || savingGateway || !gatewayForm.api_key || (!gatewayForm.secret_key && !editingGateway && gatewayForm.gateway_code !== 'phonepe') || (gatewayForm.gateway_code === 'phonepe' && !gatewayForm.merchant_id)) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: (testingGateway || savingGateway || !gatewayForm.api_key || (!gatewayForm.secret_key && !editingGateway && gatewayForm.gateway_code !== 'phonepe') || (gatewayForm.gateway_code === 'phonepe' && !gatewayForm.merchant_id)) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const canTest = !testingGateway && !savingGateway && gatewayForm.api_key && 
                            (editingGateway || gatewayForm.secret_key || (gatewayForm.gateway_code === 'phonepe' && gatewayForm.merchant_id));
                          if (canTest) {
                            e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                            e.target.style.boxShadow = '0 6px 12px -2px rgba(16, 185, 129, 0.4)';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const canTest = !testingGateway && !savingGateway && gatewayForm.api_key && 
                            (editingGateway || gatewayForm.secret_key || (gatewayForm.gateway_code === 'phonepe' && gatewayForm.merchant_id));
                          if (canTest) {
                            e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <FiZap size={16} />
                        {testingGateway ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGatewayModal(false);
                          setEditingGateway(null);
                          setGatewayForm({
                            gateway_code: '',
                            gateway_name: '',
                            is_enabled: false,
                            mode: 'test',
                            currency: 'USD',
                            api_key: '',
                            secret_key: '',
                            webhook_secret: '',
                            merchant_id: ''
                          });
                        }}
                        style={{
                          background: '#fff',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f1f5f9';
                          e.target.style.borderColor = '#94a3b8';
                          e.target.style.color = '#334155';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fff';
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.color = '#475569';
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="gateway-form"
                        disabled={savingGateway || testingGateway}
                        style={{
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: savingGateway ? '#94a3b8' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          color: 'white',
                          cursor: savingGateway ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: savingGateway ? 'none' : '0 4px 6px -1px rgba(249, 115, 22, 0.3)',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!savingGateway) {
                            e.target.style.background = 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)';
                            e.target.style.boxShadow = '0 6px 12px -2px rgba(249, 115, 22, 0.4)';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!savingGateway) {
                            e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <FiSave size={16} />
                        {savingGateway ? 'Saving...' : 'Save Configuration'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <>
              <div className="card" style={{ marginBottom: '8px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 className="card-title" style={{ fontSize: '9px', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>API Keys</h2>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="btn btn-primary"
                    style={{
                      padding: '3px 9px',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      lineHeight: '1.2',
                      borderRadius: '4px'
                    }}
                  >
                    <FiPlus size={10} /> Create API Key
                  </button>
                </div>
                {apiKeys.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '12px', fontSize: '9px', margin: 0, lineHeight: '1.3' }}>No API keys created</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {apiKeys.map(key => (
                      <div key={key.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: '5px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '10px', lineHeight: '1.2' }}>{key.key_name || key.name || 'Unnamed API Key'}</p>
                          <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            Key: {key.key_prefix || key.prefix || 'N/A'}
                          </p>
                          <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            {(key.is_active !== undefined ? key.is_active : (key.active !== undefined ? key.active : true)) ? 'Active' : 'Inactive'} • Created {formatTimeAgo(key.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                              try {
                                const response = await apiClient.delete(`/api/settings/api-keys/${key.id}`);
                                if (response.data.success) {
                                  toast.success('API key revoked successfully!');
                                  fetchApiKeys();
                                }
                              } catch (error) {
                                console.error('Error revoking API key:', error);
                                toast.error(error.response?.data?.message || 'Failed to revoke API key');
                              }
                            }
                          }}
                          style={{
                            padding: '3px 7px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#ef4444',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            lineHeight: '1.2'
                          }}
                        >
                          <FiTrash2 size={9} /> Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ marginBottom: '8px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 className="card-title" style={{ fontSize: '9px', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>Webhooks</h2>
                  <button
                    onClick={() => setShowWebhookModal(true)}
                    className="btn btn-primary"
                    style={{
                      padding: '3px 9px',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      lineHeight: '1.2',
                      borderRadius: '4px'
                    }}
                  >
                    <FiPlus size={10} /> Add Webhook
                  </button>
                </div>
                {webhooks.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '12px', fontSize: '9px', margin: 0, lineHeight: '1.3' }}>No webhooks configured</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {webhooks.map(webhook => (
                      <div key={webhook.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: '5px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '10px', lineHeight: '1.2' }}>{webhook.webhook_url || webhook.url || 'No URL'}</p>
                          <p style={{ margin: '1px 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            Events: {webhook.event_type || (webhook.events && webhook.events.length > 0 ? webhook.events.join(', ') : 'None')}
                          </p>
                          <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            {(webhook.is_active !== undefined ? webhook.is_active : (webhook.active !== undefined ? webhook.active : true)) ? 'Active' : 'Inactive'} • Created {formatTimeAgo(webhook.created_at)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                            setEditingWebhook(webhook);
                            setNewWebhook({
                              name: webhook.webhook_url,
                              url: webhook.webhook_url,
                              event_type: webhook.event_type,
                              events: [webhook.event_type]
                            });
                            setShowWebhookModal(true);
                            }}
                            style={{
                              padding: '3px 7px',
                              border: 'none',
                              borderRadius: '4px',
                              background: '#3b82f6',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '9px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              lineHeight: '1.2'
                            }}
                          >
                            <FiEdit2 size={9} /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this webhook?')) {
                                try {
                                  const response = await apiClient.delete(`/api/settings/webhooks/${webhook.id}`);
                                  if (response.data.success) {
                                    toast.success('Webhook deleted successfully!');
                                    fetchWebhooks();
                                  }
                                } catch (error) {
                                  console.error('Error deleting webhook:', error);
                                  toast.error(error.response?.data?.message || 'Failed to delete webhook');
                                }
                              }
                            }}
                            style={{
                              padding: '3px 7px',
                              border: 'none',
                              borderRadius: '4px',
                              background: '#ef4444',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '9px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              lineHeight: '1.2'
                            }}
                          >
                            <FiTrash2 size={9} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ marginBottom: '8px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 className="card-title" style={{ fontSize: '9px', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>Feature Flags</h2>
                  <button
                    onClick={() => {
                      setNewFeatureFlag({ flag_key: '', flag_name: '', description: '', is_enabled: false });
                      setShowFeatureFlagModal(true);
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: '3px 9px',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      lineHeight: '1.2',
                      borderRadius: '4px'
                    }}
                  >
                    <FiPlus size={10} /> Create Feature Flag
                  </button>
                </div>
                {featureFlags.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '12px', fontSize: '9px', margin: 0, lineHeight: '1.3' }}>No feature flags configured</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {featureFlags.map(flag => (
                      <div key={flag.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: '5px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '10px', lineHeight: '1.2' }}>{flag.flag_name || flag.name || flag.flag_key || flag.key || 'Unnamed Flag'}</p>
                          <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            Key: {flag.flag_key || flag.key || 'N/A'}
                          </p>
                          {flag.description && (
                            <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>{flag.description}</p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            const currentEnabled = flag.is_enabled !== undefined ? flag.is_enabled : (flag.enabled !== undefined ? flag.enabled : false);
                            const newStatus = !currentEnabled;
                            try {
                              // Use flag_key (which is the flag_key from database) as the ID
                              const flagKey = flag.flag_key || flag.key || flag.id;
                              const response = await apiClient.put(`/api/settings/feature-flags/${flagKey}`, {
                                is_enabled: newStatus
                              });
                              if (response.data.success) {
                                toast.success(`Feature flag ${newStatus ? 'enabled' : 'disabled'} successfully!`);
                                fetchFeatureFlags();
                              }
                            } catch (error) {
                              console.error('Error toggling feature flag:', error);
                              toast.error(error.response?.data?.message || 'Failed to update feature flag');
                            }
                          }}
                          style={{
                            width: '36px',
                            height: '20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: flag.is_enabled ? '#3b82f6' : '#d1d5db',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: flag.is_enabled ? '18px' : '2px',
                            transition: 'all 0.3s ease'
                          }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 className="card-title" style={{ fontSize: '9px', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>Integrations</h2>
                  <button
                    onClick={() => {
                      setNewIntegration({ integration_name: '', integration_type: '', config: {} });
                      setShowIntegrationModal(true);
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: '3px 9px',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      lineHeight: '1.2',
                      borderRadius: '4px'
                    }}
                  >
                    <FiPlus size={10} /> Add Integration
                  </button>
                </div>
                {integrations.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '12px', fontSize: '9px', margin: 0, lineHeight: '1.3' }}>No integrations configured</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {integrations.map(integration => (
                      <div key={integration.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: '5px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '10px', lineHeight: '1.2' }}>{integration.integration_name || integration.name || 'Unnamed Integration'}</p>
                          {integration.integration_type && (
                            <p style={{ margin: '1px 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>Type: {integration.integration_type}</p>
                          )}
                          <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
                            {(integration.is_active !== undefined ? integration.is_active : (integration.active !== undefined ? integration.active : false)) ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            const currentActive = integration.is_active !== undefined ? integration.is_active : (integration.active !== undefined ? integration.active : false);
                            const newStatus = !currentActive;
                            try {
                              // Use integration_name as the ID (it's the primary key)
                              const integrationName = integration.integration_name || integration.name || integration.id;
                              const response = await apiClient.put(`/api/settings/integrations/${integrationName}`, {
                                is_active: newStatus,
                                is_enabled: newStatus
                              });
                              if (response.data.success) {
                                toast.success(`Integration ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                                fetchIntegrations();
                              }
                            } catch (error) {
                              console.error('Error toggling integration:', error);
                              toast.error(error.response?.data?.message || 'Failed to update integration');
                            }
                          }}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '8px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            background: integration.is_active ? '#dcfce7' : '#fee2e2',
                            color: integration.is_active ? '#166534' : '#991b1b',
                            lineHeight: '1.2'
                          }}
                        >
                          {integration.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}


          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="card">
              <h2 className="card-title">Activity Logs</h2>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>
                View system activity logs and audit trails. Track all changes and actions in the admin panel.
              </p>
              <button
                onClick={() => navigate('/activity-log')}
                className="btn btn-primary"
              >
                <FiActivity />
                Go to Activity Logs
              </button>
            </div>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <div className="card">
              <h2 className="card-title">Localization Settings</h2>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Configure languages, currencies, and regional settings for your store.
              </p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await apiClient.put('/api/settings/localization', {
                    settings: localizationSettings
                  });
                  if (response.data.success) {
                    toast.success('Localization settings updated successfully!');
                  }
                } catch (error) {
                  console.error('Error updating localization settings:', error);
                  toast.error(error.response?.data?.message || 'Failed to update settings');
                }
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Default Language</label>
                    <select 
                      className="form-select" 
                      value={localizationSettings.default_language}
                      onChange={(e) => setLocalizationSettings({ ...localizationSettings, default_language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select 
                      className="form-select"
                      value={localizationSettings.default_currency}
                      onChange={(e) => setLocalizationSettings({ ...localizationSettings, default_currency: e.target.value })}
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select 
                      className="form-select"
                      value={localizationSettings.timezone}
                      onChange={(e) => setLocalizationSettings({ ...localizationSettings, timezone: e.target.value })}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select 
                      className="form-select"
                      value={localizationSettings.date_format}
                      onChange={(e) => setLocalizationSettings({ ...localizationSettings, date_format: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  <FiSave />
                  Save Localization Settings
                </button>
              </form>
            </div>
          )}


          {/* Password Tab - Moved to Account tab, but keeping this for direct access */}
          {activeTab === 'password' && (
            <div className="card">
              <h2 className="card-title">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingRight: '40px' }}
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
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
                      {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingRight: '40px' }}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                      minLength={securitySettings.password_min_length || 8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
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
                  <small style={{ color: '#64748b', fontSize: '12px' }}>
                    Minimum {securitySettings.password_min_length || 8} characters
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingRight: '40px' }}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
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
                </div>

                <button type="submit" className="btn btn-primary">
                  <FiSave />
                  Change Password
                </button>
              </form>
          </div>
        )}

        {/* Websites Tab */}
        {activeTab === 'websites' && (
          <div className="card" style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>Site Management</h2>
                <p style={{ color: '#64748b', marginTop: '2px', marginBottom: 0, fontSize: '10px', lineHeight: '1.3' }}>
                  Manage website links whose data will be displayed on this portal
                </p>
              </div>
              <button 
                onClick={() => {
                  setEditingWebsite(null);
                  setWebsiteForm({
                    site_name: '',
                    site_domain: '',
                    site_subdomain: '',
                    logo_url: '',
                    primary_color: '#3b82f6',
                    is_active: true
                  });
                  setShowWebsiteModal(true);
                }}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: '500',
                  borderRadius: '5px',
                  lineHeight: '1.2'
                }}
              >
                <FiPlus size={11} /> Add Website
              </button>
            </div>

            {/* Websites List */}
            <div style={{ display: 'grid', gap: '6px' }}>
              {websites.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px 12px', 
                  color: '#94a3b8',
                  background: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <FiGlobe size={28} style={{ marginBottom: '6px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.3', fontWeight: '500' }}>No websites added yet</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '10px', lineHeight: '1.3' }}>Click "Add Website" to get started</p>
                </div>
              ) : (
                websites.map(website => (
                  <div key={website.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '5px',
                        background: website.primary_color || '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {website.logo_url ? (
                            <img src={website.logo_url} alt={website.name || website.site_name} style={{ width: '100%', height: '100%', borderRadius: '5px', objectFit: 'cover' }} />
                        ) : (
                            (website.name || website.site_name || 'W').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '9px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>{website.name || website.site_name}</h3>
                          <span style={{
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: '600',
                            lineHeight: '1.2',
                              background: (website.status === 'active' || website.is_active) ? '#dcfce7' : '#fee2e2',
                              color: (website.status === 'active' || website.is_active) ? '#166534' : '#991b1b'
                          }}>
                              {(website.status === 'active' || website.is_active) ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          <a 
                              href={`https://${website.domain || website.site_domain}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#3b82f6', 
                              fontSize: '11px',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              lineHeight: '1.3'
                            }}
                          >
                              {website.domain || website.site_domain}
                            <FiExternalLink size={10} />
                          </a>
                        </div>
                        {website.site_subdomain && (
                          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748b', lineHeight: '1.3' }}>
                            Subdomain: {website.site_subdomain}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEditWebsite(website)}
                        style={{
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          background: '#3b82f6',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2563eb';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#3b82f6';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <FiEdit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWebsite(website.id)}
                        style={{
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          background: '#ef4444',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: '500',
                          lineHeight: '1.2',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '0.9';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <FiTrash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
      </div >

    {/* Website Modal */}
      {
        showWebsiteModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>
              {editingWebsite ? 'Edit Website' : 'Add New Website'}
            </h2>
            <button
              onClick={() => {
                setShowWebsiteModal(false);
                setEditingWebsite(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FiX />
            </button>
          </div>

          <form onSubmit={handleWebsiteSubmit}>
            <div className="form-group">
              <label className="form-label">Website Name *</label>
              <input
                type="text"
                className="form-input"
                value={websiteForm.site_name}
                onChange={(e) => setWebsiteForm({ ...websiteForm, site_name: e.target.value })}
                placeholder="e.g., Peenakaa"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website Domain *</label>
              <input
                type="text"
                className="form-input"
                value={websiteForm.site_domain}
                onChange={(e) => setWebsiteForm({ ...websiteForm, site_domain: e.target.value })}
                placeholder="e.g., peenakaa.com"
                required
              />
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                Enter domain without http:// or https://
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Subdomain (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={websiteForm.site_subdomain}
                onChange={(e) => setWebsiteForm({ ...websiteForm, site_subdomain: e.target.value })}
                placeholder="e.g., shop, admin, portal"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                value={websiteForm.logo_url}
                onChange={(e) => setWebsiteForm({ ...websiteForm, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={websiteForm.primary_color}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, primary_color: e.target.value })}
                  style={{ width: '60px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={websiteForm.primary_color}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, primary_color: e.target.value })}
                  placeholder="#3b82f6"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={websiteForm.is_active}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Active (Display data from this website)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <FiSave /> {editingWebsite ? 'Update Website' : 'Add Website'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWebsiteModal(false);
                  setEditingWebsite(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
        )
      }

    {/* OLD MODAL - REMOVED - Using the new one above */}
      {false && showGatewayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>
                Configure {gatewayForm.gateway_name || 'Payment Gateway'}
              </h2>
              <button
                onClick={() => {
                  setShowGatewayModal(false);
                  setEditingGateway(null);
                  setGatewayForm({
                    gateway_code: '',
                    gateway_name: '',
                    is_enabled: false,
                    mode: 'test',
                    currency: 'USD',
                    api_key: '',
                    secret_key: ''
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  name: gatewayForm.gateway_name,
                  is_enabled: gatewayForm.is_enabled,
                  mode: gatewayForm.mode,
                  currency: gatewayForm.currency,
                  api_key: gatewayForm.api_key
                };
                
                if (gatewayForm.secret_key) {
                  payload.secret_key = gatewayForm.secret_key;
                }

                const response = await apiClient.put(`/api/settings/payment-gateways/${gatewayForm.gateway_code}`, payload);
                if (response.data.success) {
                  toast.success('Payment gateway configured successfully!');
                  setShowGatewayModal(false);
                  setEditingGateway(null);
                  setGatewayForm({
                    gateway_code: '',
                    gateway_name: '',
                    is_enabled: false,
                    mode: 'test',
                    currency: 'USD',
                    api_key: '',
                    secret_key: ''
                  });
                  fetchPaymentGateways();
                }
              } catch (error) {
                console.error('Error saving payment gateway:', error);
                toast.error(error.response?.data?.message || 'Failed to save gateway configuration');
              }
            }}>
              <div className="form-group">
                <label className="form-label">Gateway Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={gatewayForm.gateway_name}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, gateway_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gatewayForm.is_enabled}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, is_enabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Enable this payment gateway</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Mode</label>
                  <select
                    className="form-select"
                    value={gatewayForm.mode}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, mode: e.target.value })}
                    required
                  >
                    <option value="test">Test</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={gatewayForm.currency}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, currency: e.target.value })}
                    required
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">API Key (Public Key)</label>
                <input
                  type="text"
                  className="form-input"
                  value={gatewayForm.api_key}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, api_key: e.target.value })}
                  placeholder="Enter your public API key"
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  This is your public API key that can be safely exposed in frontend code
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Secret Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={gatewayForm.secret_key}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, secret_key: e.target.value })}
                  placeholder="Enter your secret key (leave blank to keep existing)"
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Your secret key is encrypted and stored securely. Leave blank to keep existing key.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGatewayModal(false);
                    setEditingGateway(null);
                    setGatewayForm({
                      gateway_code: '',
                      gateway_name: '',
                      is_enabled: false,
                      mode: 'test',
                      currency: 'USD',
                      api_key: '',
                      secret_key: ''
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Creation Modal */}
      {showApiKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Create API Key</h2>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setNewApiKey({ key_name: '', key_type: 'read', permissions: [] });
                  setCreatedApiKey(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            {createdApiKey ? (
              <div>
                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '20px', border: '1px solid #86efac' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#166534', marginBottom: '10px' }}>API Key Created Successfully!</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#166534', marginBottom: '15px' }}>
                    ⚠️ Copy these keys now. You won't be able to see them again.
                  </p>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '5px', display: 'block' }}>API Key:</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={createdApiKey.full_key || createdApiKey.api_key || createdApiKey.key_prefix || createdApiKey.prefix || createdApiKey}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          background: 'white'
                        }}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdApiKey.full_key || createdApiKey.api_key || createdApiKey.key_prefix || createdApiKey.prefix || createdApiKey);
                          toast.success('API key copied to clipboard!');
                        }}
                        style={{
                          padding: '10px 15px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#3b82f6',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                  </div>
                  {createdApiKey.api_secret && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '5px', display: 'block' }}>API Secret:</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          readOnly
                          value={createdApiKey.api_secret}
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #86efac',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: 'white'
                          }}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(createdApiKey.api_secret);
                            toast.success('API secret copied to clipboard!');
                          }}
                          style={{
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <FiCopy size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setNewApiKey({ key_name: '', key_type: 'read', permissions: [] });
                    setCreatedApiKey(null);
                    fetchApiKeys();
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <div className="form-group">
                  <label className="form-label">Key Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newApiKey.key_name}
                    onChange={(e) => setNewApiKey({ ...newApiKey, key_name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Type *</label>
                  <select
                    className="form-select"
                    value={newApiKey.key_type}
                    onChange={(e) => setNewApiKey({ ...newApiKey, key_type: e.target.value })}
                    required
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <FiSave /> Create API Key
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setNewApiKey({ key_name: '', key_type: 'read', permissions: [] });
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>
                {editingWebhook ? 'Edit Webhook' : 'Add Webhook'}
              </h2>
              <button
                onClick={() => {
                  setShowWebhookModal(false);
                  setEditingWebhook(null);
                  setNewWebhook({ name: '', url: '', events: [] });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook}>
              <div className="form-group">
                <label className="form-label">Webhook URL *</label>
                <input
                  type="url"
                  className="form-input"
                  value={newWebhook.url || newWebhook.webhook_url || ''}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value, webhook_url: e.target.value })}
                  placeholder="https://example.com/webhook"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select
                  className="form-select"
                  value={newWebhook.event_type || newWebhook.events?.[0] || ''}
                  onChange={(e) => setNewWebhook({ ...newWebhook, event_type: e.target.value, events: [e.target.value] })}
                  required
                >
                  <option value="">Select an event type</option>
                  <option value="order.created">Order Created</option>
                  <option value="order.updated">Order Updated</option>
                  <option value="order.cancelled">Order Cancelled</option>
                  <option value="payment.success">Payment Success</option>
                  <option value="payment.failed">Payment Failed</option>
                  <option value="product.created">Product Created</option>
                  <option value="product.updated">Product Updated</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWebhookModal(false);
                    setEditingWebhook(null);
                    setNewWebhook({ name: '', url: '', events: [] });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Flag Modal */}
      {showFeatureFlagModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Create Feature Flag</h2>
              <button
                onClick={() => {
                  setShowFeatureFlagModal(false);
                  setNewFeatureFlag({ flag_key: '', flag_name: '', description: '', is_enabled: false });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await apiClient.post('/api/settings/feature-flags', {
                  flag_key: newFeatureFlag.flag_key,
                  flag_name: newFeatureFlag.flag_name,
                  description: newFeatureFlag.description,
                  is_enabled: newFeatureFlag.is_enabled
                });
                if (response.data.success) {
                  toast.success('Feature flag created successfully!');
                  setShowFeatureFlagModal(false);
                  setNewFeatureFlag({ flag_key: '', flag_name: '', description: '', is_enabled: false });
                  fetchFeatureFlags();
                }
              } catch (error) {
                console.error('Error creating feature flag:', error);
                toast.error(error.response?.data?.message || 'Failed to create feature flag');
              }
            }}>
              <div className="form-group">
                <label className="form-label">Flag Key *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFeatureFlag.flag_key}
                  onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, flag_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g., new_checkout_flow"
                  required
                  pattern="[a-z0-9_]+"
                  title="Only lowercase letters, numbers, and underscores allowed"
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Use lowercase letters, numbers, and underscores only (e.g., new_checkout_flow)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Flag Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFeatureFlag.flag_name}
                  onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, flag_name: e.target.value })}
                  placeholder="e.g., New Checkout Flow"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={newFeatureFlag.description}
                  onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, description: e.target.value })}
                  placeholder="Describe what this feature flag controls..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newFeatureFlag.is_enabled}
                    onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, is_enabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Enable this feature flag immediately</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> Create Feature Flag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeatureFlagModal(false);
                    setNewFeatureFlag({ flag_key: '', flag_name: '', description: '', is_enabled: false });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add Integration</h2>
              <button
                onClick={() => {
                  setShowIntegrationModal(false);
                  setNewIntegration({ integration_name: '', integration_type: '', config: {} });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateIntegration}>
              <div className="form-group">
                <label className="form-label">Integration Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newIntegration.integration_name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, integration_name: e.target.value })}
                  placeholder="e.g., Stripe Payment Gateway"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Integration Type *</label>
                <select
                  className="form-select"
                  value={newIntegration.integration_type}
                  onChange={(e) => setNewIntegration({ ...newIntegration, integration_type: e.target.value })}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="payment">Payment Gateway</option>
                  <option value="shipping">Shipping Provider</option>
                  <option value="analytics">Analytics</option>
                  <option value="email">Email Service</option>
                  <option value="sms">SMS Service</option>
                  <option value="crm">CRM</option>
                  <option value="erp">ERP</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Configuration (JSON - Optional)</label>
                <textarea
                  className="form-input"
                  value={typeof newIntegration.config === 'string' ? newIntegration.config : JSON.stringify(newIntegration.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setNewIntegration({ ...newIntegration, config: parsed });
                    } catch {
                      setNewIntegration({ ...newIntegration, config: e.target.value });
                    }
                  }}
                  placeholder='{"api_key": "your_key", "api_secret": "your_secret"}'
                  rows="5"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Enter configuration as JSON object (optional)
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> Add Integration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIntegrationModal(false);
                    setNewIntegration({ integration_name: '', integration_type: '', config: {} });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OLD MODAL - REMOVED - Using the new one above */}
      {false && showGatewayModal && editingGateway && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => {
          setShowGatewayModal(false);
          setEditingGateway(null);
        }}>
          <div style={{
            backgroundColor: 'var(--modal-bg, #fff)',
            color: 'var(--text-primary, #1e293b)',
            padding: '30px',
            borderRadius: '12px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary, #1e293b)', fontSize: '24px', fontWeight: '600' }}>
                  Configure Payment Gateway
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                  {editingGateway.gateway_name || editingGateway.name || 'Gateway'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowGatewayModal(false);
                  setEditingGateway(null);
                }} 
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontSize: '24px', 
                  color: 'var(--text-primary, #1e293b)',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSaveGateway}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Gateway Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={gatewayForm.gateway_name || ''}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, gateway_name: e.target.value })}
                    placeholder="e.g., Stripe, PayPal, Razorpay"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={gatewayForm.is_enabled !== undefined ? gatewayForm.is_enabled : false}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, is_enabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>Enable Gateway</span>
                  </label>
                  <small style={{ color: '#64748b', fontSize: '12px', marginLeft: '28px', display: 'block' }}>
                    Enable this gateway to accept payments
                  </small>
                </div>
                
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Mode
                  </label>
                  <select
                    className="form-select"
                    value={gatewayForm.mode || 'test'}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, mode: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="test">Test / Sandbox</option>
                    <option value="live">Live / Production</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Use "Test" for development and "Live" for production
                  </small>
                </div>
                
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Currency
                  </label>
                  <select
                    className="form-select"
                    value={gatewayForm.currency || 'USD'}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Public API Key <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={gatewayForm.api_key || ''}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, api_key: e.target.value })}
                    placeholder="pk_live_xxxxxxxxxxxx or your public API key"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Enter your public API key (this will be stored securely)
                  </small>
                </div>
                
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Secret Key <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={gatewayForm.secret_key || ''}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, secret_key: e.target.value })}
                    placeholder="sk_live_xxxxxxxxxxxx or your secret key"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Enter your secret key (will be encrypted and stored securely). Leave empty to keep existing key.
                  </small>
                </div>
                
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                    Webhook Secret (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={gatewayForm.webhook_secret || ''}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, webhook_secret: e.target.value })}
                    placeholder="whsec_xxxxxxxxxxxx or webhook secret"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Optional: Enter webhook secret for secure webhook verification
                  </small>
                </div>
                
                <div style={{ 
                  background: '#eff6ff', 
                  border: '1px solid #bfdbfe', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '10px' 
                }}>
                  <p style={{ margin: 0, color: '#1e40af', fontSize: '13px', lineHeight: '1.6' }}>
                    <strong>🔒 Security Note:</strong> Your secret keys will be encrypted before storage. Never share your secret keys with anyone.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ 
                      flex: 1, 
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiSave /> Save Configuration
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowGatewayModal(false);
                      setEditingGateway(null);
                      setGatewayForm({
                        gateway_code: '',
                        gateway_name: '',
                        is_enabled: false,
                        mode: 'test',
                        currency: 'USD',
                        api_key: '',
                        secret_key: ''
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1,
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div >
  );
};

export default Settings;

// Add CSS for spinner animation and override font scaling
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Override font scaling for Payment Method Card - Force White Text */
    .card [style*="background: linear-gradient(135deg, #1e293b"] p,
    .card [style*="background: linear-gradient(135deg, #1e293b"] span,
    .card [style*="background: linear-gradient(135deg, #1e293b"] button {
      color: #ffffff !important;
      opacity: 1 !important;
    }
    
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*="fontSize: '12px'"],
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*='fontSize: "12px"'],
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*="fontSize: 12px"] {
      font-size: 12px !important;
      color: #ffffff !important;
    }
    
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*="fontSize: '10px'"],
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*='fontSize: "10px"'],
    .card [style*="background: linear-gradient(135deg, #1e293b"] p[style*="fontSize: 10px"] {
      font-size: 10px !important;
      color: #ffffff !important;
    }
    
    .card [style*="background: linear-gradient(135deg, #1e293b"] span[style*="fontSize: '8px'"],
    .card [style*="background: linear-gradient(135deg, #1e293b"] span[style*='fontSize: "8px"'],
    .card [style*="background: linear-gradient(135deg, #1e293b"] span[style*="fontSize: 8px"] {
      font-size: 8px !important;
      color: #ffffff !important;
    }
    
    .card [style*="background: linear-gradient(135deg, #1e293b"] button[style*="fontSize: '10px'"],
    .card [style*="background: linear-gradient(135deg, #1e293b"] button[style*='fontSize: "10px"'],
    .card [style*="background: linear-gradient(135deg, #1e293b"] button[style*="fontSize: 10px"] {
      font-size: 10px !important;
      color: #ffffff !important;
    }
    
    /* Override font scaling for Site Management Section */
    .card h2.card-title[style*="fontSize: '13px'"],
    .card h2.card-title[style*='fontSize: "13px"'],
    .card h2.card-title[style*="fontSize: 13px"] {
      font-size: 13px !important;
    }
    
    .card p[style*="fontSize: '10px'"],
    .card p[style*='fontSize: "10px"'],
    .card p[style*="fontSize: 10px"] {
      font-size: 10px !important;
    }
    
    .card h3[style*="fontSize: '9px'"],
    .card h3[style*='fontSize: "9px"'],
    .card h3[style*="fontSize: 9px"],
    .card h3[style*="fontSize: '12px'"],
    .card h3[style*='fontSize: "12px"'],
    .card h3[style*="fontSize: 12px"] {
      font-size: 9px !important;
    }
    
    .card a[style*="fontSize: '11px'"],
    .card a[style*='fontSize: "11px"'],
    .card a[style*="fontSize: 11px"] {
      font-size: 11px !important;
    }
    
    .card span[style*="fontSize: '9px'"],
    .card span[style*='fontSize: "9px"'],
    .card span[style*="fontSize: 9px"] {
      font-size: 9px !important;
    }
    
    .card button[style*="fontSize: '11px'"],
    .card button[style*='fontSize: "11px"'],
    .card button[style*="fontSize: 11px"] {
      font-size: 11px !important;
    }
    
    .card p[style*="fontSize: '11px'"],
    .card p[style*='fontSize: "11px"'],
    .card p[style*="fontSize: 11px"] {
      font-size: 11px !important;
    }
  `;
  if (!document.getElementById('settings-spinner-styles')) {
    style.id = 'settings-spinner-styles';
    document.head.appendChild(style);
  }
}
