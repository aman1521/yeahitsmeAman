import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiDollarSign,
  FiPercent,
  FiGlobe
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const TaxSettings = () => {
  const [activeTab, setActiveTab] = useState('tax-rules');
  const [taxRules, setTaxRules] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaxRule, setShowAddTaxRule] = useState(false);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [editingTaxRule, setEditingTaxRule] = useState(null);
  const [editingCurrency, setEditingCurrency] = useState(null);
  
  const [taxRuleForm, setTaxRuleForm] = useState({
    rule_name: '',
    country_code: '',
    tax_rate: '',
    tax_type: 'product',
    priority: 1,
    is_active: true
  });
  
  const [currencyForm, setCurrencyForm] = useState({
    currency_code: '',
    currency_name: '',
    currency_symbol: '',
    exchange_rate: '',
    is_base_currency: false,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Always fetch countries on mount for tax rule dropdown
  useEffect(() => {
    const fetchCountriesOnMount = async () => {
      try {
        const response = await apiClient.get('/countries/');
          setCountries(response.data.countries || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountriesOnMount();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tax-rules') {
        await fetchTaxRules();
      } else if (activeTab === 'currencies') {
        await fetchCurrencies();
      } else if (activeTab === 'countries') {
        await fetchCountries();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxRules = async () => {
    const response = await apiClient.get('/taxes/');
    setTaxRules(response.data.tax_rules || []);
  };

  const fetchCurrencies = async () => {
    const response = await apiClient.get('/currencies/', { params: { all: true } });
    setCurrencies(response.data.currencies || []);
  };

  const fetchCountries = async () => {
    const response = await apiClient.get('/countries/');
    setCountries(response.data.countries || []);
  };

  // Tax Rule Handlers
  const handleTaxRuleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaxRuleForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTaxRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaxRule) {
        await apiClient.put(`/taxes/${editingTaxRule.id}`, taxRuleForm);
        toast.success('Tax rule updated successfully!');
      } else {
        await apiClient.post('/taxes/', taxRuleForm);
        toast.success('Tax rule created successfully!');
      }
      
      setShowAddTaxRule(false);
      setEditingTaxRule(null);
      resetTaxRuleForm();
      fetchTaxRules();
    } catch (error) {
      console.error('Error saving tax rule:', error);
      toast.error(error.response?.data?.error || 'Failed to save tax rule');
    }
  };

  const handleDeleteTaxRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this tax rule?')) return;
    
    try {
      await apiClient.delete(`/taxes/${ruleId}`);
      toast.success('Tax rule deleted successfully!');
      fetchTaxRules();
    } catch (error) {
      console.error('Error deleting tax rule:', error);
      toast.error('Failed to delete tax rule');
    }
  };

  const resetTaxRuleForm = () => {
    setTaxRuleForm({
      rule_name: '',
      country_code: '',
      tax_rate: '',
      tax_type: 'product',
      priority: 1,
      is_active: true
    });
  };

  // Currency Handlers
  const handleCurrencyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrencyForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCurrencySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCurrency) {
        await apiClient.put(`/currencies/${editingCurrency.id}`, currencyForm);
        toast.success('Currency updated successfully!');
      } else {
        await apiClient.post('/currencies/', currencyForm);
        toast.success('Currency created successfully!');
      }
      
      setShowAddCurrency(false);
      setEditingCurrency(null);
      resetCurrencyForm();
      fetchCurrencies();
    } catch (error) {
      console.error('Error saving currency:', error);
      toast.error(error.response?.data?.error || 'Failed to save currency');
    }
  };

  const handleDeleteCurrency = async (currencyId) => {
    if (!window.confirm('Are you sure you want to delete this currency?')) return;
    
    try {
      await apiClient.delete(`/currencies/${currencyId}`);
      toast.success('Currency deleted successfully!');
      fetchCurrencies();
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error(error.response?.data?.error || 'Failed to delete currency');
    }
  };

  const resetCurrencyForm = () => {
    setCurrencyForm({
      currency_code: '',
      currency_name: '',
      currency_symbol: '',
      exchange_rate: '',
      is_base_currency: false,
      is_active: true
    });
  };

  const handleUpdateCountryTax = async (countryCode, taxData) => {
    try {
      await apiClient.put(`/countries/${countryCode}`, taxData);
      toast.success('Country tax rates updated successfully!');
      fetchCountries();
    } catch (error) {
      console.error('Error updating country tax:', error);
      toast.error('Failed to update country tax rates');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Tax & Currency Settings</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'tax-rules' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetTaxRuleForm();
                  setEditingTaxRule(null);
                  setShowAddTaxRule(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiPlus />
                Add Tax Rule
              </button>
            )}
            {activeTab === 'currencies' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetCurrencyForm();
                  setEditingCurrency(null);
                  setShowAddCurrency(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiPlus />
                Add Currency
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '10px', display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0' }}>
          <button
            className={`btn ${activeTab === 'tax-rules' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('tax-rules')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FiPercent />
            Tax Rules
          </button>
          <button
            className={`btn ${activeTab === 'currencies' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('currencies')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FiDollarSign />
            Currencies
          </button>
          <button
            className={`btn ${activeTab === 'countries' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('countries')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FiGlobe />
            Countries
          </button>
        </div>
      </div>

      {/* Tax Rules Tab */}
      {activeTab === 'tax-rules' && (
        <>
          {showAddTaxRule && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3 className="card-title">
                  {editingTaxRule ? 'Edit Tax Rule' : 'Add New Tax Rule'}
                </h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddTaxRule(false);
                    setEditingTaxRule(null);
                    resetTaxRuleForm();
                  }}
                >
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleTaxRuleSubmit} style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="form-label">Rule Name *</label>
                    <input
                      type="text"
                      name="rule_name"
                      value={taxRuleForm.rule_name}
                      onChange={handleTaxRuleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Country *</label>
                    <select
                      name="country_code"
                      value={taxRuleForm.country_code}
                      onChange={handleTaxRuleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.country_code} value={country.country_code}>
                          {country.country_name} ({country.country_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Tax Rate (%) *</label>
                    <input
                      type="number"
                      name="tax_rate"
                      value={taxRuleForm.tax_rate}
                      onChange={handleTaxRuleChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Tax Type</label>
                    <select
                      name="tax_type"
                      value={taxRuleForm.tax_type}
                      onChange={handleTaxRuleChange}
                      className="form-select"
                    >
                      <option value="product">Product Tax</option>
                      <option value="shipping">Shipping Tax</option>
                      <option value="total">Total Order Tax</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Priority</label>
                    <input
                      type="number"
                      name="priority"
                      value={taxRuleForm.priority}
                      onChange={handleTaxRuleChange}
                      className="form-input"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={taxRuleForm.is_active}
                        onChange={handleTaxRuleChange}
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowAddTaxRule(false);
                    setEditingTaxRule(null);
                    resetTaxRuleForm();
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiSave />
                    {editingTaxRule ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>RULE NAME</th>
                  <th>COUNTRY</th>
                  <th>TAX RATE</th>
                  <th>TYPE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {taxRules.map((rule) => (
                  <tr key={rule.id}>
                    <td style={{ fontWeight: '500' }}>{rule.rule_name}</td>
                    <td>{rule.country_code}</td>
                    <td>{rule.tax_rate}%</td>
                    <td>
                      <span className="status-badge status-processing">
                        {rule.tax_type}
                      </span>
                    </td>
                    <td>{rule.priority}</td>
                    <td>
                      <span className={`status-badge ${rule.is_active ? 'status-active' : 'status-inactive'}`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px', fontSize: '12px' }}
                          onClick={() => {
                            setEditingTaxRule(rule);
                            setTaxRuleForm({
                              rule_name: rule.rule_name,
                              country_code: rule.country_code,
                              tax_rate: rule.tax_rate,
                              tax_type: rule.tax_type,
                              priority: rule.priority,
                              is_active: rule.is_active
                            });
                            setShowAddTaxRule(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px', fontSize: '12px' }}
                          onClick={() => handleDeleteTaxRule(rule.id)}
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
        </>
      )}

      {/* Currencies Tab */}
      {activeTab === 'currencies' && (
        <>
          {showAddCurrency && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3 className="card-title">
                  {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
                </h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddCurrency(false);
                    setEditingCurrency(null);
                    resetCurrencyForm();
                  }}
                >
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleCurrencySubmit} style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="form-label">Currency Code *</label>
                    <input
                      type="text"
                      name="currency_code"
                      value={currencyForm.currency_code}
                      onChange={handleCurrencyChange}
                      className="form-input"
                      maxLength="3"
                      placeholder="USD"
                      required
                      disabled={editingCurrency}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Currency Name *</label>
                    <input
                      type="text"
                      name="currency_name"
                      value={currencyForm.currency_name}
                      onChange={handleCurrencyChange}
                      className="form-input"
                      placeholder="US Dollar"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Currency Symbol</label>
                    <input
                      type="text"
                      name="currency_symbol"
                      value={currencyForm.currency_symbol}
                      onChange={handleCurrencyChange}
                      className="form-input"
                      placeholder="$"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Exchange Rate (to base) *</label>
                    <input
                      type="number"
                      name="exchange_rate"
                      value={currencyForm.exchange_rate}
                      onChange={handleCurrencyChange}
                      className="form-input"
                      step="0.000001"
                      min="0"
                      placeholder="0.012"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        name="is_base_currency"
                        checked={currencyForm.is_base_currency}
                        onChange={handleCurrencyChange}
                      />
                      Base Currency
                    </label>
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={currencyForm.is_active}
                        onChange={handleCurrencyChange}
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowAddCurrency(false);
                    setEditingCurrency(null);
                    resetCurrencyForm();
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiSave />
                    {editingCurrency ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>NAME</th>
                  <th>SYMBOL</th>
                  <th>EXCHANGE RATE</th>
                  <th>BASE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency) => (
                  <tr key={currency.id}>
                    <td style={{ fontWeight: '600' }}>{currency.currency_code}</td>
                    <td>{currency.currency_name}</td>
                    <td style={{ fontSize: '18px' }}>{currency.currency_symbol}</td>
                    <td>{currency.exchange_rate}</td>
                    <td>
                      {currency.is_base_currency && (
                        <span className="status-badge status-active">BASE</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${currency.is_active ? 'status-active' : 'status-inactive'}`}>
                        {currency.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px', fontSize: '12px' }}
                          onClick={() => {
                            setEditingCurrency(currency);
                            setCurrencyForm({
                              currency_code: currency.currency_code,
                              currency_name: currency.currency_name,
                              currency_symbol: currency.currency_symbol,
                              exchange_rate: currency.exchange_rate,
                              is_base_currency: currency.is_base_currency,
                              is_active: currency.is_active
                            });
                            setShowAddCurrency(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        {!currency.is_base_currency && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px', fontSize: '12px' }}
                            onClick={() => handleDeleteCurrency(currency.id)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Countries Tab */}
      {activeTab === 'countries' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>COUNTRY</th>
                <th>CODE</th>
                <th>CURRENCY</th>
                <th>DEFAULT TAX (%)</th>
                <th>SHIPPING TAX (%)</th>
                <th>TAX RULES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td style={{ fontWeight: '500' }}>{country.country_name}</td>
                  <td>{country.country_code}</td>
                  <td>{country.currency_code}</td>
                  <td>{country.default_tax_rate}%</td>
                  <td>{country.shipping_tax_rate}%</td>
                  <td>
                    <span className="status-badge status-pending">
                      {country.tax_rule_count || 0} rules
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${country.is_active ? 'status-active' : 'status-inactive'}`}>
                      {country.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaxSettings;


