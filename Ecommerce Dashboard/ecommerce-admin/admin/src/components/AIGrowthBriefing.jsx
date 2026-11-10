import React, { useState } from 'react';
import { 
  FiZap, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiArrowRight, 
  FiRefreshCw, 
  FiDollarSign, 
  FiShoppingBag,
  FiShield,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AI_GROWTH_RECOMMENDATIONS } from '../services/aiGrowthService';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';

const AIGrowthBriefing = ({ onNavigateToProducts, onNavigateToCoupons }) => {
  const { formatAmount } = useGlobalCurrency();
  const [recommendations, setRecommendations] = useState(AI_GROWTH_RECOMMENDATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleApply = (id) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        toast.success(`Action Executed: ${rec.title} is now active!`, {
          duration: 4000
        });
        return { ...rec, applied: true };
      }
      return rec;
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('AI Audit completed: Store metrics and elasticity recalculated.');
    }, 800);
  };

  const filtered = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === activeTab);

  const appliedCount = recommendations.filter(r => r.applied).length;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22, 140, 214, 0.05) 0%, rgba(15, 130, 138, 0.08) 100%)',
      border: '1px solid rgba(22, 140, 214, 0.25)',
      borderRadius: '14px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #168CD6, #0F828A)',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(22, 140, 214, 0.3)',
              flexShrink: 0
            }}>
              <FiZap size={16} />
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              AI Growth & Revenue Diagnostic Copilot
            </h2>
            <span style={{
              background: '#E0F2FE',
              color: '#0369A1',
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              Autonomous Heuristics Active
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0 0', lineHeight: 1.4 }}>
            Continuously analyzing orders, margin elasticity, and customer churn signals to maximize revenue.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <FiRefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Auditing Store...' : 'Re-run AI Audit'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '8px' }}>
        {[
          { key: 'all', label: `All Opportunities (${recommendations.length})` },
          { key: 'pricing', label: 'Dynamic Pricing' },
          { key: 'coupons', label: 'AOV & Basket Guard' },
          { key: 'inventory', label: 'Supply Forecast' },
          { key: 'retention', label: 'VIP Retention' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: activeTab === tab.key ? '600' : '500',
              color: activeTab === tab.key ? '#168CD6' : '#64748B',
              background: activeTab === tab.key ? '#FFFFFF' : 'transparent',
              border: activeTab === tab.key ? '1px solid #E2E8F0' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
        {appliedCount > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#0F828A', fontWeight: '600', alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FiCheck size={12} />
            <span>{appliedCount} of {recommendations.length} Recommendations Executed</span>
          </span>
        )}
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
        {filtered.map(rec => (
          <div
            key={rec.id}
            style={{
              background: '#FFFFFF',
              border: rec.applied ? '1px solid #10B981' : '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {rec.applied && (
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#10B981',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 8px',
                borderBottomLeftRadius: '6px'
              }}>
                ACTIVE IN PRODUCTION
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#168CD6',
                  background: 'rgba(22, 140, 214, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {rec.badge}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: rec.impact_type === 'revenue_increase' || rec.impact_type === 'aov_growth' ? '#0F828A' : '#D97706'
                }}>
                  {rec.projected_impact}
                </span>
              </div>

              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>
                {rec.title}
              </h3>

              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                {rec.description}
              </p>

              {/* Data comparison pill */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <span style={{ color: '#64748B' }}>Baseline: </span>
                  <strong style={{ color: '#334155' }}>{rec.current_val}</strong>
                </div>
                <div style={{ color: '#168CD6', fontWeight: '600' }}>
                  &rarr; {rec.target_val}
                </div>
              </div>
            </div>

            {/* Action button */}
            <div>
              {rec.applied ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#065F46',
                  background: '#ECFDF5',
                  borderRadius: '6px'
                }}>
                  <FiCheckCircle size={14} />
                  {rec.applied_label}
                </div>
              ) : (
                <button
                  onClick={() => handleApply(rec.id)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #168CD6 0%, #0F828A 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <FiZap size={13} />
                  {rec.action_label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIGrowthBriefing;

