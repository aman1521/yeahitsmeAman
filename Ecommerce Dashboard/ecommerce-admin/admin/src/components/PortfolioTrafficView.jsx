import React, { useState } from 'react';
import { 
  FiGlobe, 
  FiUsers, 
  FiEye, 
  FiClock, 
  FiExternalLink, 
  FiTrendingUp, 
  FiCompass, 
  FiSmartphone, 
  FiMonitor,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { PORTFOLIO_TRAFFIC_DATA } from '../services/aiGrowthService';

const PortfolioTrafficView = () => {
  const [data] = useState(PORTFOLIO_TRAFFIC_DATA);
  const [chartMetric, setChartMetric] = useState('pageviews'); // 'visitors' or 'pageviews'

  const channelColors = ['#168CD6', '#0F828A', '#6366F1', '#0EA5E9', '#10B981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner: Connection & GA4 Status */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22, 140, 214, 0.08) 0%, rgba(15, 130, 138, 0.1) 100%)',
        border: '1px solid rgba(22, 140, 214, 0.25)',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #168CD6, #0F828A)',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 140, 214, 0.25)'
          }}>
            <FiGlobe size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Portfolio Traffic &amp; Web Analytics Intelligence
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: '#ECFDF5',
                color: '#065F46'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                GA4 Live Stream
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Linked Site: <strong style={{ color: '#0F172A' }}>{data.overview.site_domain}</strong> • Stream: <code style={{ color: '#168CD6' }}>{data.overview.ga_measurement_id}</code> • GTM: <code style={{ color: '#0F828A' }}>{data.overview.gtm_id}</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              background: '#FFFFFF',
              color: '#168CD6',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            Google Analytics 4 Console <FiExternalLink size={13} />
          </a>
          <a
            href="https://yeahitsmeaman.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #168CD6, #0F828A)',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(22, 140, 214, 0.3)'
            }}
          >
            Visit Live Portfolio <FiExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { title: 'Total Unique Visitors', value: data.overview.total_visitors.toLocaleString(), change: '+24.8%', icon: FiUsers, color: '#168CD6' },
          { title: 'Total Pageviews', value: data.overview.total_pageviews.toLocaleString(), change: '+31.2%', icon: FiEye, color: '#0F828A' },
          { title: 'Avg Session Duration', value: data.overview.avg_duration, change: '+18s', icon: FiClock, color: '#6366F1' },
          { title: 'Portfolio Consultation Rate', value: data.overview.conversion_rate, change: '+1.4%', icon: FiTrendingUp, color: '#10B981' }
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>{card.title}</span>
              <div style={{
                background: `${card.color}15`,
                color: card.color,
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <card.icon size={15} />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FiTrendingUp size={12} /> {card.change} vs previous 30 days
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Trend Chart + Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Trend Line Chart */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Portfolio Traffic Velocity
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Daily trend from live session analytics</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['pageviews', 'visitors'].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    background: chartMetric === m ? '#168CD6' : '#FFFFFF',
                    color: chartMetric === m ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  {m === 'pageviews' ? 'Pageviews' : 'Visitors'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.traffic_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={chartMetric}
                  stroke="#168CD6"
                  strokeWidth={2.5}
                  dot={{ fill: '#168CD6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Channels Breakdown */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 2px 0' }}>
            Acquisition Channels
          </h3>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 14px 0' }}>Where your portfolio visitors originate from</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.channels.map((ch, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>{ch.name}</span>
                  <span style={{ color: '#64748B' }}>
                    <strong style={{ color: '#0F172A' }}>{ch.visitors.toLocaleString()}</strong> ({ch.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ch.percentage}%`, height: '100%', background: ch.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {data.devices.map((d, i) => (
              <div key={i}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{d.name.split(' ')[0]}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{d.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Visited Portfolio Pages Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '18px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Top Visited Case Studies &amp; Pages
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Real pageviews tracked on yeahitsmeaman.netlify.app</p>
          </div>
          <span style={{ fontSize: '11px', color: '#0F828A', fontWeight: '600' }}>
            Live Heatmap &amp; Scroll Depth Active
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '8px 10px', fontWeight: '600' }}>Page Title</th>
                <th style={{ padding: '8px 10px', fontWeight: '600' }}>URL Path</th>
                <th style={{ padding: '8px 10px', fontWeight: '600' }}>Pageviews</th>
                <th style={{ padding: '8px 10px', fontWeight: '600' }}>Traffic Share</th>
                <th style={{ padding: '8px 10px', fontWeight: '600' }}>Avg Time</th>
                <th style={{ padding: '8px 10px', fontWeight: '600', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.top_pages.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px', fontWeight: '600', color: '#0F172A' }}>{p.title}</td>
                  <td style={{ padding: '10px', color: '#168CD6', fontFamily: 'monospace', fontSize: '11px' }}>{p.path}</td>
                  <td style={{ padding: '10px', fontWeight: '700', color: '#334155' }}>{p.views.toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(22, 140, 214, 0.08)',
                      color: '#168CD6',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>
                      {p.share}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#64748B' }}>{p.avg_time}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <a
                      href={`https://yeahitsmeaman.netlify.app${p.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#0F828A',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '11px'
                      }}
                    >
                      Inspect <FiExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTrafficView;

