import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import ActionsDropdown from '../components/ActionsDropdown';
import SearchBar from '../components/SearchBar';

const HealthBenefits = () => {
  const [healthBenefits, setHealthBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchHealthBenefits();
  }, []);

  const fetchHealthBenefits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/health-benefits/', {
        params: { include_inactive: true }
      });
      setHealthBenefits(response.data.health_benefits || []);
    } catch (error) {
      console.error('Error fetching health benefits:', error);
      toast.error('Failed to load health benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current form values from the form inputs directly
    const form = e.target;
    const formDataObj = new FormData(form);
    
    const submitData = {
      name: formDataObj.get('name')?.trim() || '',
      description: formDataObj.get('description')?.trim() || '',
      is_active: formDataObj.get('is_active') === 'on' || formData.is_active
    };
    
    // Validate required fields
    if (!submitData.name) {
      toast.error('Name is required');
      return;
    }
    
    try {
      if (editingId) {
        await apiClient.put(`/health-benefits/${editingId}`, submitData);
        toast.success('Health benefit updated successfully!');
      } else {
        await apiClient.post('/health-benefits/', submitData);
        toast.success('Health benefit created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchHealthBenefits();
    } catch (error) {
      console.error('Error saving health benefit:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save health benefit';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (hb) => {
    setEditingId(hb.id);
    setFormData({
      name: hb.name,
      description: hb.description || '',
      is_active: hb.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will remove it from all products.`)) {
      return;
    }

    try {
      await apiClient.delete(`/health-benefits/${id}`);
      toast.success('Health benefit deleted successfully!');
      fetchHealthBenefits();
    } catch (error) {
      console.error('Error deleting health benefit:', error);
      toast.error(error.response?.data?.error || 'Failed to delete health benefit');
    }
  };

  const toggleStatus = async (hb) => {
    try {
      await apiClient.put(`/health-benefits/${hb.id}`, {
        is_active: !hb.is_active
      });
      toast.success(`Health benefit ${hb.is_active ? 'deactivated' : 'activated'} successfully!`);
      fetchHealthBenefits();
    } catch (error) {
      console.error('Error updating health benefit:', error);
      toast.error('Failed to update health benefit status');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
  };

  // Filter by search term - empty search shows all
  const filteredBenefits = healthBenefits.filter(hb => {
    // If search is empty, show all
    if (!searchTerm || searchTerm.trim() === '') return true;
    const search = searchTerm.toLowerCase().trim();
    return (
      hb.name.toLowerCase().includes(search) ||
      (hb.description && hb.description.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading health benefits...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Health Benefits Management</h1>
          <p className="page-subtitle">Manage health benefits that can be assigned to products</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Health Benefit
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value || '')}
          placeholder="Search health benefits..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <div className="card" style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  Name
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  Description
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', minWidth: '100px', letterSpacing: '-0.01em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBenefits.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    {searchTerm ? 'No health benefits found matching your search' : 'No health benefits found. Create one to get started.'}
                  </td>
                </tr>
              ) : (
                filteredBenefits.map((hb, index) => (
                  <tr 
                    key={hb.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                      {hb.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', maxWidth: '400px' }}>
                      {hb.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No description</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: hb.is_active ? '#dcfce7' : '#fee2e2',
                          color: hb.is_active ? '#16a34a' : '#dc2626',
                          display: 'inline-block',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {hb.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                        <ActionsDropdown
                          onEdit={() => handleEdit(hb)}
                          onDelete={() => handleDelete(hb.id, hb.name)}
                          onToggleStatus={() => toggleStatus(hb)}
                          isActive={hb.is_active}
                          itemName="health benefit"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 10001,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1e293b', letterSpacing: '-0.01em' }}>
                {editingId ? 'Edit Health Benefit' : 'New Health Benefit'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '13px', letterSpacing: '-0.01em' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={formData.name}
                  onChange={() => {}} // No-op during typing - prevents rerendering
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="e.g., Immunity Booster"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '13px', letterSpacing: '-0.01em' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={formData.description}
                  onChange={() => {}} // No-op during typing - prevents rerendering
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                  }}
                  placeholder="Brief description of this health benefit..."
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: 'background 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                  />
                  <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HealthBenefits;

