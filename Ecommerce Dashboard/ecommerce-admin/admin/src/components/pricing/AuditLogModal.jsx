import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const AuditLogModal = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/pricing/admin/audit-logs');
        setLogs(res.data?.data?.logs || []);
      } catch (e) {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Audit Logs</h3>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body" style={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? 'Loading...' : (
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>By</th>
                  <th>New Value</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.timestamp}</td>
                    <td>{l.action_type}</td>
                    <td>{l.performed_by}</td>
                    <td><pre style={{ whiteSpace: 'pre-wrap' }}>{l.new_value}</pre></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;


