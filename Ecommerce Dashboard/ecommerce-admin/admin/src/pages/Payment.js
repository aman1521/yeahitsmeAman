import React, { useState, useEffect } from 'react';
import { FiEye, FiCreditCard, FiEdit, FiX, FiSettings, FiCheckCircle, FiAlertCircle, FiZap, FiSave, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const Payment = () => {
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    gateway_code: '',
    gateway_name: '',
    mode: 'test',
    currency: 'INR',
    is_enabled: false,
    api_key_public: '',
    api_key_secret: '',
    webhook_secret: ''
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      // Try the standard endpoint first
      let res;
      try {
        res = await apiClient.get('/payments/gateways');
      } catch (firstError) {
        // If that fails, try the settings endpoint
        console.log('First endpoint failed, trying alternative...');
        res = await apiClient.get('/settings/payment-gateways');
      }
      
      if (res.data.success) {
        const data = res.data.gateways || res.data.payment_gateways || [];
        setPaymentGateways(data);
      } else {
        setPaymentGateways([]);
      }
    } catch (e) {
      console.error('Failed to load gateways', e);
      const errorMessage = e.response?.data?.message || e.response?.data?.error || 'Failed to load payment gateways';
      toast.error(errorMessage);
      setPaymentGateways([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (gateway) => {
    // Open quickly with basic info, then hydrate with full config
    setViewModal(gateway);
      apiClient
      .get(`/payments/gateways/${gateway.gateway_code}`)
      .then((res) => {
        if (res.data.success && res.data.gateway) {
          setViewModal((prev) => ({ ...prev, ...res.data.gateway }));
        }
      })
      .catch((error) => {
        // Silent – we still show the basic info
        console.error('Failed to load gateway details:', error);
      });
  };

  const handleEdit = (gateway) => {
    setEditModal(gateway);
    setEditFormData({ ...gateway });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const gatewayCode = editFormData.gateway_code || editModal.gateway_code;
      if (!gatewayCode) {
        toast.error('Gateway code is required');
        setSaving(false);
        return;
      }
      
      // Map frontend fields to backend format
      const payload = {
        gateway_name: editFormData.gateway_name || editFormData.name,
        is_enabled: editFormData.is_enabled !== undefined ? editFormData.is_enabled : (editFormData.status === 'Active'),
        mode: editFormData.mode || 'test',
        currency: editFormData.currency || 'INR',
        api_key_public: editFormData.api_key_public || editFormData.api_key || '',
        merchant_id: editFormData.merchant_id || '',
        // Backend expects the raw secret in `api_key_secret` and will encrypt it before saving
        // Only send if user entered a new value (not the encrypted one)
        api_key_secret: editFormData.api_key_secret && !editFormData.api_key_secret.startsWith('encrypted:') 
          ? editFormData.api_key_secret 
          : (editFormData.secret_key || ''),
        // Store webhook secret (URL is derived on the backend)
        webhook_secret: editFormData.webhook_secret || ''
      };
      
      // Try the standard endpoint first, fallback to settings endpoint
      let response;
      try {
        response = await apiClient.put(`/payments/gateways/${gatewayCode}`, payload);
      } catch (firstError) {
        console.log('First endpoint failed, trying alternative...');
        response = await apiClient.put(`/settings/payment-gateways/${gatewayCode}`, payload);
      }
      
      if (response.data.success) {
        toast.success('Gateway updated successfully!');
        setEditModal(null);
        fetchGateways(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to save gateway', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save gateway';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setSaving(true);
      const gatewayCode = editFormData.gateway_code || editModal.gateway_code;
      if (!gatewayCode) {
        toast.error('Gateway code is required');
        setSaving(false);
        return;
      }
      
      // Prepare test payload with current credentials
      const gatewayCodeLower = gatewayCode.toLowerCase();
      const testPayload = {
        api_key_public: editFormData.api_key_public || editFormData.api_key || '',
        api_key_secret: editFormData.api_key_secret && !editFormData.api_key_secret.startsWith('encrypted:') 
          ? editFormData.api_key_secret 
          : (editFormData.secret_key || ''),
        merchant_id: editFormData.merchant_id || '',
        mode: editFormData.mode || 'test'
      };
      
      // PhonePe requires Merchant ID and Salt Key
      if (gatewayCodeLower === 'phonepe') {
        if (!testPayload.merchant_id || !testPayload.api_key_secret) {
          toast.error('Please enter both Merchant ID and Salt Key before testing');
          setSaving(false);
          return;
        }
      } else {
        if (!testPayload.api_key_public || !testPayload.api_key_secret) {
          toast.error('Please enter both API Key and Secret Key before testing');
          setSaving(false);
          return;
        }
      }
      
      // Try to test the connection
      let response;
      try {
        response = await apiClient.post(`/payments/gateways/${gatewayCode}/test`, testPayload);
      } catch (firstError) {
        console.log('First endpoint failed, trying alternative...');
        try {
          response = await apiClient.post(`/settings/payment-gateways/${gatewayCode}/test`, testPayload);
        } catch (secondError) {
          // If test endpoint doesn't exist, we'll save first then test via actual API call
          toast.info('Testing connection... Please save credentials first, then we will verify them.');
          setSaving(false);
          return;
        }
      }
      
      if (response.data.success) {
        toast.success(response.data.message || 'Connection test successful! Your credentials are valid.');
      } else {
        toast.error(response.data.error || response.data.message || 'Connection test failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Failed to test connection', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to test connection. Please ensure credentials are correct.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData({
      ...addFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddSave = async () => {
    try {
      setSaving(true);
      if (!addFormData.gateway_code) {
        toast.error('Gateway code is required');
        setSaving(false);
        return;
      }
      
      const payload = {
        gateway_code: addFormData.gateway_code.toLowerCase(),
        gateway_name: addFormData.gateway_name || addFormData.gateway_code,
        mode: addFormData.mode || 'test',
        currency: addFormData.currency || 'INR',
        is_enabled: addFormData.is_enabled || false,
        api_key_public: addFormData.api_key_public || '',
        api_key_secret: addFormData.api_key_secret || '',
        webhook_secret: addFormData.webhook_secret || ''
      };
      
      // Try the standard endpoint first, fallback to settings endpoint
      let response;
      try {
        response = await apiClient.post('/payments/gateways', payload);
      } catch (firstError) {
        console.log('First endpoint failed, trying alternative...');
        response = await apiClient.post('/settings/payment-gateways', payload);
      }
      
      if (response.data.success) {
        toast.success('Gateway added successfully!');
        setAddModal(false);
        setAddFormData({
          gateway_code: '',
          gateway_name: '',
          mode: 'test',
          currency: 'INR',
          is_enabled: false,
          api_key_public: '',
          api_key_secret: '',
          webhook_secret: ''
        });
        fetchGateways(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to add gateway', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add gateway';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Payment Gateways Section */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              backgroundColor: '#eff6ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <FiCreditCard size={16} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Payment Gateways
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Configure and manage your payment gateway integrations
              </p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setAddModal(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <FiCreditCard size={14} />
            Add New Gateway
          </button>
        </div>

        <div className="table-container" style={{ padding: '12px' }}>
          <table className="table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>#</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Gateway</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Mode</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Currency</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Status</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Configured</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Created</th>
                <th style={{ padding: '10px 12px', fontSize: '11px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '3px solid #f1f5f9',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                        Loading payment gateways...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paymentGateways.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '12px', 
                        backgroundColor: '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#94a3b8'
                      }}>
                        <FiCreditCard size={28} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                          No payment gateways configured
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '400px' }}>
                          Get started by adding your first payment gateway. Configure API keys and start accepting payments.
                        </p>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setAddModal(true)}
                        style={{
                          marginTop: '6px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FiCreditCard size={14} />
                        Add Your First Gateway
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paymentGateways.map((gateway) => (
                  <tr key={gateway.id} style={{ fontSize: '12px' }}>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{gateway.id}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiCreditCard style={{ color: '#3b82f6', fontSize: '14px' }} />
                          <span className="font-medium" style={{ fontSize: '13px', fontWeight: '500' }}>{gateway.gateway_name || gateway.name}</span>
                        </div>
                        <div>
                          {(() => {
                            const mode = (gateway.mode || 'test').toLowerCase();
                            const isConfigured = !!gateway.is_configured;
                            let label = 'Mock mode · No keys configured';
                            let bg = '#eef2ff';
                            let color = '#3730a3';
                            
                            if (mode === 'live' && isConfigured) {
                              label = 'Live mode · Keys configured';
                              bg = '#ecfdf3';
                              color = '#166534';
                            } else if (mode === 'test' && isConfigured) {
                              label = 'Test mode · Keys configured';
                              bg = '#eff6ff';
                              color = '#1d4ed8';
                            }
                            
                            return (
                              <span style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                backgroundColor: bg,
                                color,
                                fontWeight: 500
                              }}>
                                {label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: (gateway.mode === 'live' || gateway.mode === 'Live') ? '#16a34a' : '#a855f7',
                        backgroundColor: (gateway.mode === 'live' || gateway.mode === 'Live') ? '#dcfce7' : '#f3e8ff'
                      }}>
                        {gateway.mode || 'test'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{gateway.currency || 'INR'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: gateway.is_configured ? '#15803d' : '#92400e',
                        backgroundColor: gateway.is_configured ? '#dcfce7' : '#ffedd5'
                      }}>
                        {gateway.is_configured ? 'Configured' : 'Not configured'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px' }}>
                      {gateway.created_at ? new Date(gateway.created_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleEdit(gateway)}
                        >
                          <FiSettings size={12} />
                          Configure
                        </button>
                        <button
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = '#e2e8f0'; e.target.style.borderColor = '#cbd5e1'; }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.borderColor = '#e2e8f0'; }}
                          onClick={() => handleView(gateway)}
                        >
                          <FiEye size={12} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>

      {/* View Modal */}
      {viewModal && (
        <div style={{
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
        }} onClick={() => setViewModal(null)}>
          <div style={{
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
          }} onClick={(e) => e.stopPropagation()}>
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
                  {viewModal.gateway_name || viewModal.name}
                </h2>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  color: '#64748b', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Gateway Configuration Details
                </p>
              </div>
              <button
                onClick={() => setViewModal(null)}
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
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Status Badge */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: viewModal.is_enabled ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${viewModal.is_enabled ? '#d1fae5' : '#fee2e2'}`
              }}>
                {viewModal.is_enabled ? (
                  <FiCheckCircle size={20} color="#10b981" />
                ) : (
                  <FiAlertCircle size={20} color="#ef4444" />
                )}
                <div>
                  <div style={{ fontWeight: '600', color: viewModal.is_enabled ? '#065f46' : '#991b1b', fontSize: '14px' }}>
                    {viewModal.is_enabled ? 'Gateway Enabled' : 'Gateway Disabled'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {viewModal.is_enabled ? 'This gateway is active and ready to process payments' : 'This gateway is currently disabled'}
                  </div>
                </div>
              </div>

              {/* Configuration Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mode
                  </label>
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    color: 'var(--text-primary, #1e293b)', 
                    borderRadius: '10px',
                    fontWeight: '500',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: (viewModal.mode || 'test').toLowerCase() === 'live' ? '#dcfce7' : '#f3e8ff',
                      color: (viewModal.mode || 'test').toLowerCase() === 'live' ? '#166534' : '#7c3aed',
                      marginRight: '8px'
                    }}>
                      {(viewModal.mode || 'test').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Currency
                  </label>
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    color: 'var(--text-primary, #1e293b)', 
                    borderRadius: '10px',
                    fontWeight: '500',
                    border: '1px solid #e2e8f0'
                  }}>
                    {viewModal.currency || '—'}
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Public API Key
                </label>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f8fafc', 
                  color: 'var(--text-primary, #1e293b)', 
                  borderRadius: '10px', 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {viewModal.api_key_public ? (
                    <>
                      <span style={{ color: '#10b981' }}>●</span>
                      <span>{viewModal.api_key_public.substring(0, 12)}••••{viewModal.api_key_public.substring(viewModal.api_key_public.length - 4)}</span>
                    </>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>
                  )}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Webhook URL
                </label>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f8fafc', 
                  color: 'var(--text-primary, #1e293b)', 
                  borderRadius: '10px', 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  wordBreak: 'break-all',
                  border: '1px solid #e2e8f0'
                }}>
                  {viewModal.webhook_url ? (
                    <span style={{ color: '#3b82f6' }}>{viewModal.webhook_url}</span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>
                  )}
                </div>
              </div>

              {viewModal.created_at && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Created
                  </label>
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    color: 'var(--text-primary, #1e293b)', 
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {new Date(viewModal.created_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            </div>
            
            {/* Footer */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '20px 32px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              flexShrink: 0
            }}>
              <button 
                onClick={() => {
                  setViewModal(null);
                  handleEdit(viewModal);
                }}
                className="btn btn-primary"
                style={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontWeight: '600'
                }}
              >
                <FiSettings size={18} />
                Configure Gateway
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setViewModal(null)}
                style={{ padding: '12px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={{
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
        }} onClick={() => setEditModal(null)}>
          <div style={{
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
          }} onClick={(e) => e.stopPropagation()}>
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
                  Configure Gateway
                </h2>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  color: '#64748b', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {editFormData.gateway_name || editFormData.name || 'Payment Gateway'}
                </p>
              </div>
              <button
                onClick={() => setEditModal(null)}
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
              handleSave(e);
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
                  value={editFormData.gateway_code || editFormData.code || ''}
                  disabled={true}
                  style={{ 
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    textTransform: 'lowercase',
                    transition: 'all 0.2s',
                    outline: 'none'
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
                  name="gateway_name"
                  value={editFormData.gateway_name || editFormData.name || ''}
                  onChange={handleChange}
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
                    name="mode"
                    value={editFormData.mode || 'test'}
                    onChange={handleChange}
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
                    name="currency"
                    value={editFormData.currency || 'INR'}
                    onChange={handleChange}
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
                <input
                  type="text"
                  name="api_key_public"
                  value={editFormData.api_key_public || editFormData.api_key || ''}
                  onChange={handleChange}
                  placeholder="pk_live_xxxxxxxxxxxx or your public API key"
                  required
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
                  {editFormData.gateway_code === 'phonepe' ? 'Salt Key' : 'Secret Key'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  name="api_key_secret"
                  value={editFormData.api_key_secret || ''}
                  onChange={handleChange}
                  placeholder={editFormData.gateway_code === 'phonepe' ? 'Enter your Salt Key' : 'sk_live_xxxxxxxxxxxx or your secret key'}
                  required={!editFormData.api_key_encrypted}
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
                  {editFormData.api_key_encrypted 
                    ? 'Enter your secret key (will be encrypted and stored securely). Leave empty to keep existing key.'
                    : 'Enter your secret key (will be encrypted and stored securely)'
                  }
                </small>
              </div>

              {(editFormData.gateway_code === 'phonepe' || editFormData.gateway_code?.includes('phonepe')) && (
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
                    name="merchant_id"
                    value={editFormData.merchant_id || ''}
                    onChange={handleChange}
                    placeholder="Enter your Merchant ID"
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
                  name="webhook_secret"
                  value={editFormData.webhook_secret || ''}
                  onChange={handleChange}
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
                    checked={editFormData.is_enabled !== undefined ? editFormData.is_enabled : (editFormData.status === 'Active')}
                    onChange={(e) => setEditFormData({ ...editFormData, is_enabled: e.target.checked })}
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
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={
                  saving || 
                  (editFormData.gateway_code === 'phonepe' 
                    ? (!editFormData.merchant_id || !(editFormData.api_key_secret || editFormData.secret_key))
                    : (!editFormData.api_key_public || !(editFormData.api_key_secret || editFormData.secret_key)))
                }
                style={{
                  background: (saving || 
                    (editFormData.gateway_code === 'phonepe' 
                      ? (!editFormData.merchant_id || !(editFormData.api_key_secret || editFormData.secret_key))
                      : (!editFormData.api_key_public || !(editFormData.api_key_secret || editFormData.secret_key)))
                  ) ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (saving || 
                    (editFormData.gateway_code === 'phonepe' 
                      ? (!editFormData.merchant_id || !(editFormData.api_key_secret || editFormData.secret_key))
                      : (!editFormData.api_key_public || !(editFormData.api_key_secret || editFormData.secret_key)))
                  ) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: (saving || 
                    (editFormData.gateway_code === 'phonepe' 
                      ? (!editFormData.merchant_id || !(editFormData.api_key_secret || editFormData.secret_key))
                      : (!editFormData.api_key_public || !(editFormData.api_key_secret || editFormData.secret_key)))
                  ) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  const canTest = !saving && 
                    (editFormData.gateway_code === 'phonepe' 
                      ? (editFormData.merchant_id && (editFormData.api_key_secret || editFormData.secret_key))
                      : (editFormData.api_key_public && (editFormData.api_key_secret || editFormData.secret_key)));
                  if (canTest) {
                    e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                    e.target.style.boxShadow = '0 6px 12px -2px rgba(16, 185, 129, 0.4)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  const canTest = !saving && 
                    (editFormData.gateway_code === 'phonepe' 
                      ? (editFormData.merchant_id && (editFormData.api_key_secret || editFormData.secret_key))
                      : (editFormData.api_key_public && (editFormData.api_key_secret || editFormData.secret_key)));
                  if (canTest) {
                    e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <FiZap size={16} />
                {saving ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
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
                disabled={saving}
                style={{
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: saving ? 'none' : '0 4px 6px -1px rgba(249, 115, 22, 0.3)',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.background = 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)';
                    e.target.style.boxShadow = '0 6px 12px -2px rgba(249, 115, 22, 0.4)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <FiSave size={16} />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div style={{
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
        }} onClick={() => setAddModal(false)}>
          <div style={{
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
          }} onClick={(e) => e.stopPropagation()}>
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
                  Add Payment Gateway
                </h2>
              </div>
              <button
                onClick={() => setAddModal(false)}
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
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label className="form-label">Gateway Code <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  name="gateway_code"
                  value={addFormData.gateway_code}
                  onChange={handleAddChange}
                  className="form-input"
                  placeholder="e.g., razorpay, stripe, paypal"
                  required
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>Unique identifier (lowercase, no spaces)</small>
              </div>
              
              <div>
                <label className="form-label">Gateway Name</label>
                <input
                  type="text"
                  name="gateway_name"
                  value={addFormData.gateway_name}
                  onChange={handleAddChange}
                  className="form-input"
                  placeholder="e.g., Razorpay, Stripe, PayPal"
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_enabled"
                    checked={addFormData.is_enabled}
                    onChange={handleAddChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Enable Gateway</span>
                </label>
              </div>
              
              <div>
                <label className="form-label">Mode</label>
                <select
                  name="mode"
                  value={addFormData.mode}
                  onChange={handleAddChange}
                  className="form-select"
                >
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Currency</label>
                <select
                  name="currency"
                  value={addFormData.currency}
                  onChange={handleAddChange}
                  className="form-select"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Public API Key</label>
                <input
                  type="text"
                  name="api_key_public"
                  value={addFormData.api_key_public}
                  onChange={handleAddChange}
                  className="form-input"
                  placeholder="pk_live_xxxxxxxxxxxx"
                />
              </div>
              
              <div>
                <label className="form-label">Secret Key</label>
                <input
                  type="password"
                  name="api_key_secret"
                  value={addFormData.api_key_secret}
                  onChange={handleAddChange}
                  className="form-input"
                  placeholder="sk_live_xxxxxxxxxxxx"
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>Will be encrypted before storing</small>
              </div>
              
              <div>
                <label className="form-label">Webhook Secret (Optional)</label>
                <input
                  type="text"
                  name="webhook_secret"
                  value={addFormData.webhook_secret}
                  onChange={handleAddChange}
                  className="form-input"
                  placeholder="whsec_xxxxxxxxxxxx"
                />
              </div>
              
            </div>
            </div>
            
            {/* Footer */}
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <button className="btn btn-primary" onClick={handleAddSave} disabled={saving} style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}>
                {saving ? 'Adding...' : 'Add Gateway'}
              </button>
              <button className="btn btn-secondary" onClick={() => setAddModal(false)} style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                background: '#fff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
};

export default Payment;
