import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';
import { useTheme } from '../../contexts/ThemeContext';

const CurrencyRateTable = () => {
  const { isDark } = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/currency/rates');
      const list = res.data?.data?.rates || res.data?.rates || [];
      setRows(list);
    } catch (e) {
      console.error('Error fetching currency rates:', e);
      toast.error('Failed to load currency rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const updateRate = async (target_currency, rate) => {
    setSaving(true);
    try {
      // Find currency ID from the row
      const currencyRow = rows.find(r => r.target_currency === target_currency || r.currency_code === target_currency);
      
      if (currencyRow && currencyRow.id) {
        // Update using PUT endpoint
        await apiClient.put(`/api/currency/rates/${currencyRow.id}`, { 
          exchange_rate: rate,
          manual_override: true
        });
      } else {
        // Fallback to legacy endpoint
        await apiClient.post('/api/currency/update', { 
          target_currency, 
          rate 
        });
      }
      toast.success(`Rate updated (${target_currency}). Prices will be recalculated automatically.`);
      await fetchRates();
    } catch (e) {
      console.error('Error updating rate:', e);
      const message = e.response?.data?.message || e.response?.data?.error || 'Update failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Currency Rates</h3></div>
      <div className="card-body">
        {loading ? 'Loading...' : (
          <table className="table">
            <thead>
              <tr>
                <th>Base</th>
                <th>Currency</th>
                <th>API Rate</th>
                <th>Effective Rate</th>
                <th>Manual Override</th>
                <th>Last Updated</th>
                <th>Last Change</th>
                <th>Override Rate</th>
                <th>Change Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.target_currency}>
                  <td>{r.base_currency || 'INR'}</td>
                  <td>{r.target_currency || r.currency_code}</td>
                  <td>{Number(r.api_rate || r.rate || 0).toFixed(6)}</td>
                  <td>{Number(r.final_rate || r.effective_rate || r.exchange_rate || r.rate || 0).toFixed(6)}</td>
                  <td>{r.manual_override || r.overridden ? 'Yes' : 'No'}</td>
                  <td>{r.last_updated ? new Date(r.last_updated).toLocaleString() : '-'}</td>
                  <td>{r.last_api_update ? new Date(r.last_api_update).toLocaleString() : '-'}</td>
                  <td>
                    <input
                      key={`rate-${r.target_currency || r.currency_code}-${r.exchange_rate || r.rate}`}
                      type="number"
                      step="0.000001"
                      defaultValue={r.exchange_rate || r.rate}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateRate(r.target_currency || r.currency_code, val);
                        }
                      }}
                      disabled={saving}
                      style={{ width: 120 }}
                      className="form-input"
                    />
                  </td>
                  <td>{r.change_summary || '-'}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => updateRate(r.target_currency || r.currency_code, r.exchange_rate || r.rate)} disabled={saving}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CurrencyRateTable;


