import React from 'react';
import { FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  keyExtractor = (row, index) => row.id || index
}) => {
  if (loading) {
    return (
      <div style={{
        padding: '36px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#168CD6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>Loading data...</span>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '10px 14px',
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: col.width,
                  textAlign: col.align || 'left',
                  ...col.headerStyle
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <FiInbox size={24} style={{ color: '#cbd5e1' }} />
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '10px 14px',
                      fontSize: '10px',
                      color: '#1e293b',
                      textAlign: col.align || 'left',
                      ...col.cellStyle
                    }}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.dataIndex || col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && onPageChange && (
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#64748b',
          background: '#ffffff'
        }}>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                color: currentPage <= 1 ? '#94a3b8' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <FiChevronLeft /> Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

