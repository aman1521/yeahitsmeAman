// AI Business Growth & Optimization Engine Service
// Analyzes store metrics, pricing elasticity, coupon leakage, and portfolio web traffic

import apiClient from './apiClient';
import realGa4Data from './portfolio_ga4_real_data.json';

export const AI_GROWTH_RECOMMENDATIONS = [
  {
    id: 'rec_price_01',
    category: 'pricing',
    impact_type: 'revenue_increase',
    projected_impact: '+$1,840 / mo',
    priority: 'high',
    title: 'Dynamic Price Elasticity Lift',
    badge: 'Margin Optimization',
    description: 'Peenakaa Herbal Hair Revitalizer (200ml) shows a 94% buy-box retention with zero conversion elasticity over the last 45 days.',
    action_label: 'Adjust Price to $43.50 (+8.7%)',
    applied_label: 'Price Adjusted to $43.50',
    applied: false,
    sku: 'PEEN-HR-200',
    current_val: '$40.00',
    target_val: '$43.50',
    metric_label: 'Projected Net Margin',
    metric_delta: '+12.5%'
  },
  {
    id: 'rec_aov_02',
    category: 'coupons',
    impact_type: 'aov_growth',
    projected_impact: '+18.4% Basket Size',
    priority: 'high',
    title: 'Discount Leakage & Basket Size Guard',
    badge: 'AOV Booster',
    description: 'Current coupon "WELCOME10" is cannibalizing gross margins on single-item carts below $45. Raising minimum cart threshold protects margins while lifting cart size.',
    action_label: 'Deploy Min-Spend $65 Rule (GROWTH20)',
    applied_label: 'Coupon GROWTH20 Active ($65 Min)',
    applied: false,
    sku: 'COUPON-RULE',
    current_val: '$0 Min Basket',
    target_val: '$65 Min Basket',
    metric_label: 'Avg Order Value',
    metric_delta: '+$14.20'
  },
  {
    id: 'rec_inventory_03',
    category: 'inventory',
    impact_type: 'stockout_prevention',
    projected_impact: '$3,200 Stockout Averted',
    priority: 'medium',
    title: 'Predictive Stockout & Run-Rate Alert',
    badge: 'Supply Chain',
    description: 'Peenakaa Daily Radiance Skincare Kit has 45 units remaining with a burn rate of 8.2 units/day. Out-of-stock projected in 5.4 days.',
    action_label: 'Draft Supplier Restock PO (150 Units)',
    applied_label: 'Restock Order Dispatched',
    applied: false,
    sku: 'PEEN-SKIN-KIT',
    current_val: '45 Units Left',
    target_val: '150 Units Reorder',
    metric_label: 'Lead Time Coverage',
    metric_delta: '28 Days'
  },
  {
    id: 'rec_churn_04',
    category: 'retention',
    impact_type: 'ltv_expansion',
    projected_impact: '+$950 LTV Winback',
    priority: 'medium',
    title: 'VIP Customer Winback Re-engagement',
    badge: 'Retention AI',
    description: '28 high-LTV customers have exceeded their average 32-day reorder cycle. Automated personalized replenishment prompt recommended.',
    action_label: 'Launch Automated Winback Pulse',
    applied_label: 'Winback Campaign Dispatched',
    applied: false,
    sku: 'VIP-SEGMENT',
    current_val: '28 Lapsed VIPs',
    target_val: 'Expected 38% Recovery',
    metric_label: 'Retention Recovery',
    metric_delta: '+38%'
  }
];

export const AI_PRICING_OPTIMIZATIONS = [
  {
    id: 1,
    name: 'Peenakaa Herbal Hair Revitalizer (200ml)',
    current_price: 40.00,
    recommended_price: 43.50,
    elasticity_score: 'Low Resistance (0.18)',
    projected_gain: '+$1,120/mo',
    stock: 142,
    velocity: '48 units/wk',
    reason: 'High customer repeat rate (42%) and top seller rank. Price increase will not affect demand.',
    applied: false
  },
  {
    id: 2,
    name: 'Peenakaa Organic Face Glow Elixir (50ml)',
    current_price: 35.00,
    recommended_price: 38.00,
    elasticity_score: 'Low Resistance (0.24)',
    projected_gain: '+$825/mo',
    stock: 86,
    velocity: '32 units/wk',
    reason: 'Premium formulation rating (4.8/5). Competitor benchmark is $42+.',
    applied: false
  },
  {
    id: 4,
    name: 'Peenakaa Daily Radiance Skincare Kit',
    current_price: 80.00,
    recommended_price: 89.00,
    elasticity_score: 'Inelastic Bundle (0.12)',
    projected_gain: '+$1,620/mo',
    stock: 45,
    velocity: '24 units/wk',
    reason: 'Highest perceived value bundle. Strong willingness to pay among gift and bundle shoppers.',
    applied: false
  },
  {
    id: 3,
    name: 'Peenakaa Golden Turmeric Wellness Blend',
    current_price: 30.00,
    recommended_price: 25.00,
    elasticity_score: 'High Elasticity (0.82)',
    projected_gain: 'Free up $2,750 capital',
    stock: 110,
    velocity: '6 units/wk',
    reason: 'Velocity slowing below holding cost threshold. 16% promotional discount will clear excess stock in 12 days.',
    applied: false
  }
];

export const PORTFOLIO_TRAFFIC_DATA = realGa4Data || {
  overview: {
    total_visitors: 5420,
    total_pageviews: 19840,
    avg_duration: '3m 48s',
    bounce_rate: '28.4%',
    conversion_rate: '4.8%',
    active_now: 7,
    ga_measurement_id: 'G-MZ23TJWG25',
    gtm_id: 'GTM-W7JH95Q',
    site_domain: 'yeahitsmeaman.netlify.app'
  },
  traffic_trend: [
    { date: 'Nov 02', visitors: 142, pageviews: 520, leads: 4 },
    { date: 'Nov 03', visitors: 168, pageviews: 610, leads: 5 },
    { date: 'Nov 04', visitors: 195, pageviews: 740, leads: 8 },
    { date: 'Nov 05', visitors: 240, pageviews: 890, leads: 11 },
    { date: 'Nov 06', visitors: 285, pageviews: 1040, leads: 14 },
    { date: 'Nov 07', visitors: 310, pageviews: 1180, leads: 16 },
    { date: 'Nov 08', visitors: 345, pageviews: 1320, leads: 19 }
  ],
  channels: [
    { name: 'Google Organic Search', percentage: 41, visitors: 2220, color: '#168CD6' },
    { name: 'Direct / Bookmarks', percentage: 26, visitors: 1410, color: '#0F828A' },
    { name: 'LinkedIn & Social', percentage: 18, visitors: 975, color: '#6366f1' },
    { name: 'GitHub Projects', percentage: 9, visitors: 490, color: '#0ea5e9' },
    { name: 'WhatsApp & Referrals', percentage: 6, visitors: 325, color: '#10b981' }
  ],
  top_pages: [
    { path: '/', title: 'Aman Kumar | Growth Architect & Mentor', views: 8920, avg_time: '4m 12s', share: '45.0%' },
    { path: '/ecommerce-dashboard/', title: 'Peenakaa Enterprise Ecommerce Dashboard', views: 3640, avg_time: '5m 30s', share: '18.3%' },
    { path: '/chauhanmis/', title: 'Chauhan MIS AI ERP Redesign', views: 2410, avg_time: '3m 15s', share: '12.1%' },
    { path: '/yexoria/', title: 'Yexoria AI SaaS Platform', views: 2150, avg_time: '3m 40s', share: '10.8%' },
    { path: '/sidharthopticals-in/', title: 'Siddharth Opticals Luxury Redesign', views: 1420, avg_time: '2m 50s', share: '7.2%' },
    { path: '/sidharthopticals-np/', title: 'Siddhartha Phaco Eye Care Redesign', views: 980, avg_time: '2m 10s', share: '4.9%' },
    { path: '/thankyou.html', title: 'Consultation Booked (Thank You)', views: 320, avg_time: '1m 05s', share: '1.7%' }
  ],
  devices: [
    { name: 'Desktop (macOS / Windows)', percentage: 62, count: 3360 },
    { name: 'Mobile (iOS / Android)', percentage: 34, count: 1840 },
    { name: 'Tablet (iPad / Galaxy)', percentage: 4, count: 220 }
  ]
};

export const fetchGrowthRecommendations = async () => {
  try {
    const res = await apiClient.get('/ai/growth-recommendations');
    if (res.data && res.data.recommendations) {
      return res.data.recommendations;
    }
  } catch (e) {
    // Falls back gracefully
  }
  return AI_GROWTH_RECOMMENDATIONS;
};
