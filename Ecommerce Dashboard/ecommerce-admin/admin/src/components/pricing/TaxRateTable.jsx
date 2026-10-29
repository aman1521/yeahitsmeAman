import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';
import { useTheme } from '../../contexts/ThemeContext';

const countries = [
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'UK' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' },
];

const TaxRateTable = () => {
  const { isDark } = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/tax/rates');
      setRows(res.data?.data?.taxes || res.data?.taxes || []);
    } catch (e) {
      console.error('Error fetching taxes:', e);
      toast.error('Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTaxes(); }, []);

  const updateTax = async (country_code, tax_rate, tax_name = 'TAX') => {
    setSaving(true);
    try {
      // First, try to find existing tax for this country
      const existingTax = rows.find(r => r.country_code === country_code);
      
      if (existingTax && existingTax.id) {
        // Update existing tax
        await apiClient.put(`/api/tax/rates/${existingTax.id}`, { 
          tax_rate, 
          tax_name,
          country_code 
        });
      } else {
        // Create new tax
        await apiClient.post('/api/tax/rates', { 
          country_code, 
          country_name: countries.find(c => c.code === country_code)?.name || country_code,
          tax_rate, 
          tax_name,
          tax_type: 'GST'
        });
      }
      toast.success('Tax saved. Prices will be recalculated automatically.');
      fetchTaxes();
    } catch (e) {
      console.error('Error updating tax:', e);
      const message = e.response?.data?.message || e.response?.data?.error || 'Save failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const ensureRow = (code) => rows.find(r => r.country_code === code) || { country_code: code, tax_name: 'TAX', tax_rate: 0 };

  return (
    <div className="card">
      <div className="card-header"><h3>Regional Taxes</h3></div>
      <div className="card-body">
        {loading ? 'Loading...' : (
          <table className="table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Code</th>
                <th>Tax Name</th>
                <th>Tax %</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {countries.map(c => {
                const r = ensureRow(c.code);
                return (
                  <tr key={c.code}>
                    <td>{c.name}</td>
                    <td>{c.code}</td>
                    <td>
                      <input 
                        className="form-input"
                        defaultValue={r.tax_name || 'TAX'} 
                        onBlur={(e) => updateTax(c.code, r.tax_rate, e.target.value)} 
                        disabled={saving} 
                      />
                    </td>
                    <td>
                      <input 
                        className="form-input"
                        type="number" 
                        step="0.01" 
                        defaultValue={r.tax_rate} 
                        onBlur={(e) => updateTax(c.code, parseFloat(e.target.value), r.tax_name)} 
                        disabled={saving} 
                        style={{ width: 100 }} 
                      />
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => updateTax(c.code, r.tax_rate, r.tax_name)} disabled={saving}>Save</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TaxRateTable;


