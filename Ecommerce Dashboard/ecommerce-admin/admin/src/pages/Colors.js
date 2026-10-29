import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave,
  FiX,
  FiDroplet
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const Colors = () => {
  const { isDark } = useTheme();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hex_code: '#000000',
    description: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      // Colors table doesn't exist in database yet
      // Show empty state until colors table is created
      setColors([]);
      toast.info('Colors table not yet implemented in database. Add colors functionality requires backend table creation.');
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast.error('Failed to load colors');
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingColor) {
        // Update existing color
        setColors(prev => prev.map(color => 
          color.id === editingColor.id 
            ? { ...color, ...formData }
            : color
        ));
        toast.success('Color updated successfully!');
      } else {
        // Add new color
        const newColor = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString()
        };
        setColors(prev => [...prev, newColor]);
        toast.success('Color created successfully!');
      }
      
      setShowAddForm(false);
      setEditingColor(null);
      setFormData({
        name: '',
        hex_code: '#000000',
        description: '',
        sort_order: 0,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving color:', error);
      toast.error('Failed to save color');
    }
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hex_code: color.hex_code,
      description: color.description,
      sort_order: color.sort_order,
      is_active: color.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (colorId) => {
    if (window.confirm('Are you sure you want to delete this color?')) {
      try {
        setColors(prev => prev.filter(color => color.id !== colorId));
        toast.success('Color deleted successfully!');
      } catch (error) {
        console.error('Error deleting color:', error);
        toast.error('Failed to delete color');
      }
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingColor(null);
    setFormData({
      name: '',
      hex_code: '#000000',
      description: '',
      sort_order: 0,
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading colors...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: isDark ? '#8b949e' : '#64748b' }}>
        Dashboard &gt; Products &gt; Colors
      </div>

      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Product Colors</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus />
            Add Color
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingColor ? 'Edit Color' : 'Add New Color'}
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
                <label className="form-label">Color Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Black, Red, Blue"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Hex Code *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    name="hex_code"
                    value={formData.hex_code}
                    onChange={handleChange}
                    style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    name="hex_code"
                    value={formData.hex_code}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="#000000"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    required
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Deep black, Bright red"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Active Color</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                <FiSave />
                {editingColor ? 'Update Color' : 'Create Color'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Colors Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Color</th>
              <th>Hex Code</th>
              <th>Description</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.sort((a, b) => a.sort_order - b.sort_order).map(color => (
              <tr key={color.id}>
                <td>{color.id}</td>
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
                      <FiDroplet />
                    </div>
                    <span style={{ fontWeight: '500' }}>{color.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: color.hex_code,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
                </td>
                <td>
                  <code style={{ 
                    background: isDark ? '#161b22' : '#f1f5f9', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: isDark ? '#e6edf3' : '#1e293b',
                    border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`
                  }}>
                    {color.hex_code}
                  </code>
                </td>
                <td>{color.description || 'No description'}</td>
                <td>{color.sort_order}</td>
                <td>
                  <span className={`status-badge ${color.is_active ? 'status-active' : 'status-inactive'}`}>
                    {color.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(color.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '4px', fontSize: '12px' }}
                      onClick={() => handleEdit(color)}
                      title="Edit Color"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '4px', fontSize: '12px' }}
                      onClick={() => handleDelete(color.id)}
                      title="Delete Color"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Colors;


