import React, { useState } from 'react';
import { 
  FiX, 
  FiZap, 
  FiCheck, 
  FiTrendingUp, 
  FiDollarSign, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiArrowUpRight,
  FiArrowDownRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AI_PRICING_OPTIMIZATIONS } from '../services/aiGrowthService';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';

const AIPriceOptimizerModal = ({ isOpen, onClose, onPriceUpdated }) => {
  const { formatAmount } = useGlobalCurrency();
  const [items, setItems] = useState(AI_PRICING_OPTIMIZATIONS);
  const [applyingAll, setApplyingAll] = useState(false);

  if (!isOpen) return null;

  const handleApplySingle = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        toast.success(`Updated ${item.name} to $${item.recommended_price.toFixed(2)}!`, {
          icon: '🏷️'
        });
        if (onPriceUpdated) onPriceUpdated(item);
        return { ...item, applied: true, current_price: item.recommended_price };
      }
      return item;
    }));
  };

  const handleApplyAll = () => {
    setApplyingAll(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        applied: true,
        current_price: item.recommended_price
      })));
      setApplyingAll(false);
      toast.success('All 4 SKUs updated with AI-optimized pricing! Total projected gain: +$3,565/mo', {
        icon: '🚀',
        duration: 5000
      });
      if (onPriceUpdated) onPriceUpdated();
    }, 600);
  };

  const totalProjectedGain = '+$3,565 / month';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(22, 140, 214, 0.04), rgba(15, 130, 138, 0.06))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #168CD6, #0F828A)',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiZap size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                AI Dynamic Price &amp; Margin Optimizer
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                Algorithmic elasticity scoring based on sales velocity, conversion resilience, and holding costs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#0F828A',
              background: 'rgba(15, 130, 138, 0.1)',
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              Net Impact: {totalProjectedGain}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {items.map(item => {
              const isIncrease = item.recommended_price > item.current_price;
              const diffPercent = Math.abs(((item.recommended_price - item.current_price) / item.current_price) * 100).toFixed(1);

              return (
                <div
                  key={item.id}
                  style={{
                    border: item.applied ? '1px solid #10B981' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    background: item.applied ? 'rgba(16, 185, 129, 0.02)' : '#FFFFFF',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                        {item.name}
                      </h4>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#475569',
                        fontWeight: '600'
                      }}>
                        {item.velocity}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {item.reason}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                      <span style={{ color: '#64748B' }}>
                        Elasticity: <strong style={{ color: '#0F828A' }}>{item.elasticity_score}</strong>
                      </span>
                      <span style={{ color: '#64748B' }}>
                        Stock: <strong>{item.stock} units</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Price Comparison */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: item.applied ? 'none' : 'line-through' }}>
                        ${item.current_price.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                          ${item.recommended_price.toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: isIncrease ? '#10B981' : '#D97706',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {isIncrease ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />}
                          {diffPercent}%
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#0F828A' }}>
                        {item.projected_gain}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {item.applied ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#065F46',
                          background: '#ECFDF5',
                          borderRadius: '8px'
                        }}>
                          <FiCheckCircle size={14} />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplySingle(item.id)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#168CD6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FiZap size={13} />
                          Apply Price
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Prices sync instantly with product catalog, cart logic, and multi-currency exchange tables.
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={handleApplyAll}
              disabled={applyingAll || items.every(i => i.applied)}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '600',
                background: items.every(i => i.applied) ? '#94A3B8' : 'linear-gradient(135deg, #168CD6, #0F828A)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: items.every(i => i.applied) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiZap size={14} />
              {items.every(i => i.applied) ? 'All Prices Applied' : 'Apply All Optimizations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPriceOptimizerModal;

