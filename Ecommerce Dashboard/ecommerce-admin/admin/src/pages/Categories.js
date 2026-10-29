import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave,
  FiX,
  FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import ActionsDropdown from '../components/ActionsDropdown';
import SearchBar from '../components/SearchBar';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    display_order: 0,
    is_active: true
  });

  // Update debounced search immediately when searchTerm changes (on Enter press)
  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/products/categories', {
        params: { include_inactive: true }
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
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
  
  // Handle select changes (can update immediately)
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await apiClient.put(`/products/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await apiClient.post('/products/categories', formData);
        toast.success('Category created successfully!');
      }
      
      setShowAddForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        display_order: 0,
        is_active: true
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiClient.delete(`/products/categories/${categoryId}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      await apiClient.put(`/products/categories/${category.id}`, {
        is_active: !category.is_active
      });
      toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      display_order: 0,
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Product Categories</h1>
          <p className="page-subtitle">Organize products into categories and subcategories</p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus />
            Add Category
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories by name or description..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={formData.name}
                  onChange={() => {}} // No-op during typing
                  onBlur={handleInputBlur}
                  className="form-input"
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleSelectChange}
                  className="form-select"
                >
                  <option value="">No Parent (Root Category)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                defaultValue={formData.description}
                onChange={() => {}} // No-op during typing
                onBlur={handleInputBlur}
                className="form-input form-textarea"
                placeholder="Enter category description"
                rows="3"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  defaultValue={formData.display_order}
                  onChange={() => {}} // No-op during typing
                  onBlur={handleInputBlur}
                  className="form-input"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '25px' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                  />
                  <span>Active Category</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                <FiSave />
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="table-container" style={{ 
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>Description</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>Parent</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }} title="Display Order: Controls the sorting order of categories">Display Order</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap' }}>Created</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap', minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter(category => {
                  if (!debouncedSearchTerm) return true;
                  const search = debouncedSearchTerm.toLowerCase();
                  return (
                    category.name.toLowerCase().includes(search) ||
                    (category.description && category.description.toLowerCase().includes(search))
                  );
                })
                .map((category, index) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', color: '#64748b' }}>{category.id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: '#f1f5f9', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        flexShrink: 0
                      }}>
                        <FiPackage />
                      </div>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{category.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                    {category.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No description</span>}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                    {category.parent_id ? 
                      categories.find(c => c.id === category.parent_id)?.name || 'Unknown' : 
                      <span style={{ color: '#94a3b8' }}>Root Category</span>
                    }
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>{category.display_order}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span className={`status-badge ${category.is_active ? 'status-active' : 'status-inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                      <ActionsDropdown
                        onEdit={() => handleEdit(category)}
                        onDelete={() => handleDelete(category.id)}
                        onToggleStatus={() => toggleCategoryStatus(category)}
                        isActive={category.is_active}
                        itemName="category"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {categories.filter(category => {
                if (!debouncedSearchTerm) return false;
                const search = debouncedSearchTerm.toLowerCase();
                return (
                  category.name.toLowerCase().includes(search) ||
                  (category.description && category.description.toLowerCase().includes(search))
                );
              }).length === 0 && debouncedSearchTerm && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No categories found matching "{debouncedSearchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
