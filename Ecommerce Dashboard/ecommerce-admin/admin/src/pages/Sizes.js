import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave,
  FiX,
  FiSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import ActionsDropdown from '../components/ActionsDropdown';
import SearchBar from '../components/SearchBar';

const Sizes = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  // Update debounced search immediately when searchTerm changes (on Enter press)
  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sizes/', {
        params: { include_inactive: true }
      });
      
      setSizes(response.data.sizes || []);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      toast.error('Failed to load sizes');
      setSizes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes - sync to state on blur to prevent rerendering
  const handleInputBlur = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value === '' ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value));
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox changes (can update immediately)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSize) {
        await apiClient.put(`/sizes/${editingSize.id}`, formData);
        toast.success('Size updated successfully!');
      } else {
        await apiClient.post('/sizes/', formData);
        toast.success('Size created successfully!');
      }
      
      setShowAddForm(false);
      setEditingSize(null);
      setFormData({
        name: '',
        description: '',
        sort_order: 0,
        is_active: true
      });
      fetchSizes();
    } catch (error) {
      console.error('Error saving size:', error);
      toast.error(error.response?.data?.error || 'Failed to save size');
    }
  };

  const handleEdit = (size) => {
    setEditingSize(size);
    const newFormData = {
      name: size.name,
      description: size.description,
      sort_order: size.sort_order,
      is_active: size.is_active
    };
    setFormData(newFormData);
    // Update input values using refs after form is shown
    setTimeout(() => {
      const nameInput = document.querySelector('input[name="name"]');
      const descInput = document.querySelector('input[name="description"]');
      const sortInput = document.querySelector('input[name="sort_order"]');
      if (nameInput) nameInput.value = newFormData.name;
      if (descInput) descInput.value = newFormData.description;
      if (sortInput) sortInput.value = newFormData.sort_order;
    }, 0);
    setShowAddForm(true);
  };

  const handleDelete = async (sizeId) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
      try {
        await apiClient.delete(`/sizes/${sizeId}`);
        toast.success('Size deleted successfully!');
        fetchSizes();
      } catch (error) {
        console.error('Error deleting size:', error);
        toast.error(error.response?.data?.error || 'Failed to delete size');
      }
    }
  };

  const toggleStatus = async (size) => {
    try {
      await apiClient.put(`/sizes/${size.id}`, {
        is_active: !size.is_active
      });
      toast.success(`Size ${size.is_active ? 'deactivated' : 'activated'} successfully!`);
      fetchSizes();
    } catch (error) {
      console.error('Error updating size status:', error);
      toast.error('Failed to update size status');
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingSize(null);
    setFormData({
      name: '',
      description: '',
      sort_order: 0,
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading sizes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Product Sizes</h1>
          <p className="page-subtitle">Define reusable pack sizes and variants for your catalog</p>
      </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus />
            Add Size
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search sizes by name or description..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingSize ? 'Edit Size' : 'Add New Size'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={cancelForm}
            >
              <FiX />
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Size Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={formData.name}
                  onChange={() => {}} // No-op during typing
                  onBlur={handleInputBlur}
                  className="form-input"
                  placeholder="e.g., S, M, L, 28, 30"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={formData.sort_order}
                  onChange={() => {}} // No-op during typing
                  onBlur={handleInputBlur}
                  className="form-input"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                defaultValue={formData.description}
                onChange={() => {}} // No-op during typing
                onBlur={handleInputBlur}
                className="form-input"
                placeholder="e.g., Small, Medium, Waist 28 inches"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                />
                <span>Active Size</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                <FiSave />
                {editingSize ? 'Update Size' : 'Create Size'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sizes Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes
              .filter(size => {
                if (!debouncedSearchTerm) return true;
                const search = debouncedSearchTerm.toLowerCase();
                return (
                  size.name.toLowerCase().includes(search) ||
                  (size.description && size.description.toLowerCase().includes(search))
                );
              })
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(size => (
              <tr key={size.id}>
                <td>{size.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: '#f1f5f9', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}>
                      <FiSquare />
                    </div>
                    <span style={{ fontWeight: '500' }}>{size.name}</span>
                  </div>
                </td>
                <td>{size.description || 'No description'}</td>
                <td>{size.sort_order}</td>
                <td>
                  <span className={`status-badge ${size.is_active ? 'status-active' : 'status-inactive'}`}>
                    {size.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(size.created_at).toLocaleDateString()}</td>
                <td>
                  <ActionsDropdown
                    onEdit={() => handleEdit(size)}
                    onDelete={() => handleDelete(size.id)}
                    onToggleStatus={() => toggleStatus(size)}
                    isActive={size.is_active}
                    itemName="size"
                  />
                </td>
              </tr>
            ))}
            {sizes.filter(size => {
              if (!debouncedSearchTerm) return false;
              const search = debouncedSearchTerm.toLowerCase();
              return (
                size.name.toLowerCase().includes(search) ||
                (size.description && size.description.toLowerCase().includes(search))
              );
            }).length === 0 && debouncedSearchTerm && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No sizes found matching "{debouncedSearchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sizes;
