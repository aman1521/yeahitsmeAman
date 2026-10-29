// Demo Mock Data for Peenakaa Ecommerce Dashboard
// Provides full, realistic ecommerce responses when running in demo/offline mode on Netlify

const generateChartDays = (numDays = 30) => {
  const result = [];
  const now = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const baseSales = 2200 + Math.floor(Math.sin(i * 0.5) * 800) + Math.floor(Math.random() * 400);
    const orders = Math.floor(baseSales / 70);
    result.push({
      date: dateStr,
      sales: baseSales,
      orders: orders,
      products_sold: orders * 2,
      customers: Math.max(1, Math.floor(orders * 0.85))
    });
  }
  return result;
};

export const DEMO_STATS = {
  orders: { total: 1248, change_percentage: 14.5, last_month: 1090, last_week: 280 },
  sales: { total: 84950, change_percentage: 18.2, last_month: 71800, last_week: 19400 },
  products: { total: 42, active: 38, featured: 12 },
  users: { total: 950, active: 820 },
  recent_reviews: 24
};

export const DEMO_TOP_PRODUCTS = [
  { id: 1, name: 'Peenakaa Herbal Hair Revitalizer (200ml)', sales_count: 320, total_revenue: 12800, price: 40, rating: 4.9, stock: 142 },
  { id: 2, name: 'Peenakaa Organic Face Glow Elixir (50ml)', sales_count: 275, total_revenue: 9625, price: 35, rating: 4.8, stock: 86 },
  { id: 3, name: 'Peenakaa Golden Turmeric Wellness Blend', sales_count: 210, total_revenue: 6300, price: 30, rating: 4.9, stock: 110 },
  { id: 4, name: 'Peenakaa Daily Radiance Skincare Kit', sales_count: 180, total_revenue: 14400, price: 80, rating: 5.0, stock: 45 },
  { id: 5, name: 'Peenakaa Pure Ashwagandha Vitality Drops', sales_count: 154, total_revenue: 4620, price: 30, rating: 4.7, stock: 95 }
];

export const DEMO_ORDERS = [
  {
    id: 101,
    order_number: 'ORD-9421',
    customer_name: 'Aarav Sharma',
    user_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    total_amount: 145.00,
    status: 'completed',
    payment_status: 'paid',
    payment_method: 'Stripe',
    items_count: 3,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { id: 1, product_name: 'Peenakaa Herbal Hair Revitalizer', quantity: 2, unit_price: 40.00, total_price: 80.00 },
      { id: 2, product_name: 'Peenakaa Organic Face Glow Elixir', quantity: 1, unit_price: 35.00, total_price: 35.00 }
    ]
  },
  {
    id: 102,
    order_number: 'ORD-9420',
    customer_name: 'Sophia Patel',
    user_name: 'Sophia Patel',
    email: 'sophia.p@example.com',
    total_amount: 78.50,
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'Razorpay',
    items_count: 2,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      { id: 3, product_name: 'Peenakaa Golden Turmeric Blend', quantity: 2, unit_price: 30.00, total_price: 60.00 }
    ]
  },
  {
    id: 103,
    order_number: 'ORD-9419',
    customer_name: 'Liam Chen',
    user_name: 'Liam Chen',
    email: 'liam.chen@example.com',
    total_amount: 210.00,
    status: 'shipped',
    payment_status: 'paid',
    payment_method: 'PayPal',
    items_count: 4,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      { id: 4, product_name: 'Peenakaa Daily Radiance Skincare Kit', quantity: 2, unit_price: 80.00, total_price: 160.00 }
    ]
  },
  {
    id: 104,
    order_number: 'ORD-9418',
    customer_name: 'Emma Watson',
    user_name: 'Emma Watson',
    email: 'emma.w@example.com',
    total_amount: 55.00,
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'Credit Card',
    items_count: 1,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { id: 5, product_name: 'Peenakaa Pure Ashwagandha Drops', quantity: 1, unit_price: 30.00, total_price: 30.00 }
    ]
  },
  {
    id: 105,
    order_number: 'ORD-9417',
    customer_name: 'Rohan Gupta',
    user_name: 'Rohan Gupta',
    email: 'rohan.g@example.com',
    total_amount: 130.00,
    status: 'completed',
    payment_status: 'paid',
    payment_method: 'Stripe',
    items_count: 2,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      { id: 1, product_name: 'Peenakaa Herbal Hair Revitalizer', quantity: 3, unit_price: 40.00, total_price: 120.00 }
    ]
  }
];

export const DEMO_NOTIFICATIONS = {
  unread_count: 3,
  notifications: [
    {
      id: 1,
      title: 'New Order #ORD-9421',
      message: 'Aarav Sharma placed a new order for $145.00',
      notification_type: 'order',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 2,
      title: 'Stock Alert',
      message: 'Peenakaa Daily Radiance Skincare Kit is running low (45 units left)',
      notification_type: 'inventory',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 3,
      title: 'Target Reached',
      message: 'Peenakaa Ecommerce monthly revenue reached 85% of target!',
      notification_type: 'revenue',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    }
  ]
};

export const DEMO_CURRENCIES = [
  { id: 1, code: 'USD', symbol: '$', name: 'US Dollar', exchange_rate: 1.0, is_default: true, status: 'active' },
  { id: 2, code: 'INR', symbol: '₹', name: 'Indian Rupee', exchange_rate: 83.25, is_default: false, status: 'active' },
  { id: 3, code: 'EUR', symbol: '€', name: 'Euro', exchange_rate: 0.92, is_default: false, status: 'active' },
  { id: 4, code: 'GBP', symbol: '£', name: 'British Pound', exchange_rate: 0.79, is_default: false, status: 'active' }
];

export const DEMO_CATEGORIES = [
  { id: 1, name: 'Skincare', slug: 'skincare', status: 'active', products_count: 14 },
  { id: 2, name: 'Haircare', slug: 'haircare', status: 'active', products_count: 10 },
  { id: 3, name: 'Wellness & Vitality', slug: 'wellness', status: 'active', products_count: 12 },
  { id: 4, name: 'Organic Combos & Bundles', slug: 'bundles', status: 'active', products_count: 6 }
];

export const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Peenakaa Herbal Hair Revitalizer (200ml)',
    sku: 'PNK-HR-001',
    category_id: 2,
    category_name: 'Haircare',
    regular_price: 49.99,
    sale_price: 40.00,
    price: 40.00,
    stock: 142,
    status: 'active',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1608248597359-009825633465?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Peenakaa Organic Face Glow Elixir (50ml)',
    sku: 'PNK-SK-002',
    category_id: 1,
    category_name: 'Skincare',
    regular_price: 45.00,
    sale_price: 35.00,
    price: 35.00,
    stock: 86,
    status: 'active',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Peenakaa Golden Turmeric Wellness Blend',
    sku: 'PNK-WL-003',
    category_id: 3,
    category_name: 'Wellness & Vitality',
    regular_price: 38.00,
    sale_price: 30.00,
    price: 30.00,
    stock: 110,
    status: 'active',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Peenakaa Daily Radiance Skincare Kit',
    sku: 'PNK-BN-004',
    category_id: 4,
    category_name: 'Organic Combos & Bundles',
    regular_price: 99.00,
    sale_price: 80.00,
    price: 80.00,
    stock: 45,
    status: 'active',
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: 'Peenakaa Pure Ashwagandha Vitality Drops',
    sku: 'PNK-WL-005',
    category_id: 3,
    category_name: 'Wellness & Vitality',
    regular_price: 35.00,
    sale_price: 30.00,
    price: 30.00,
    stock: 95,
    status: 'active',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=60'
  }
];

export const DEMO_COUPONS = [
  { id: 1, code: 'PEENAKAA20', discount_type: 'percentage', discount_value: 20, min_purchase: 50, usage_limit: 1000, usage_count: 342, status: 'active', expires_at: '2026-12-31' },
  { id: 2, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_purchase: 25, usage_limit: 5000, usage_count: 1240, status: 'active', expires_at: '2026-12-31' },
  { id: 3, code: 'FESTIVE50', discount_type: 'fixed', discount_value: 50, min_purchase: 200, usage_limit: 500, usage_count: 189, status: 'active', expires_at: '2026-11-30' }
];

export const DEMO_CUSTOMERS = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', orders_count: 8, total_spent: 890.00, status: 'active', created_at: '2026-03-12' },
  { id: 2, name: 'Sophia Patel', email: 'sophia.p@example.com', orders_count: 5, total_spent: 420.50, status: 'active', created_at: '2026-04-18' },
  { id: 3, name: 'Liam Chen', email: 'liam.chen@example.com', orders_count: 11, total_spent: 1240.00, status: 'active', created_at: '2026-01-22' },
  { id: 4, name: 'Emma Watson', email: 'emma.w@example.com', orders_count: 3, total_spent: 195.00, status: 'active', created_at: '2026-06-05' },
  { id: 5, name: 'Rohan Gupta', email: 'rohan.g@example.com', orders_count: 7, total_spent: 670.00, status: 'active', created_at: '2026-02-14' }
];

export const getDemoResponse = (url) => {
  const norm = (url || '').toLowerCase();

  if (norm.includes('/dashboard/stats')) {
    return { data: DEMO_STATS };
  }
  if (norm.includes('/dashboard/chart') || norm.includes('/dashboard/sales')) {
    return { data: generateChartDays(30) };
  }
  if (norm.includes('/dashboard/top-products')) {
    return { data: DEMO_TOP_PRODUCTS };
  }
  if (norm.includes('/dashboard/recent-orders') || norm.includes('/recent-orders')) {
    return { data: DEMO_ORDERS };
  }
  if (norm.includes('/admin/notifications') || norm.includes('/notifications')) {
    return { data: DEMO_NOTIFICATIONS };
  }
  if (norm.includes('/currencies') || norm.includes('/currency')) {
    return { data: { success: true, currencies: DEMO_CURRENCIES } };
  }
  if (norm.includes('/categories')) {
    return { data: { success: true, categories: DEMO_CATEGORIES } };
  }
  if (norm.includes('/products')) {
    return { data: { success: true, products: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length } };
  }
  if (norm.includes('/orders')) {
    return { data: { success: true, orders: DEMO_ORDERS, total: DEMO_ORDERS.length } };
  }
  if (norm.includes('/coupons')) {
    return { data: { success: true, coupons: DEMO_COUPONS } };
  }
  if (norm.includes('/users') || norm.includes('/customers')) {
    return { data: { success: true, users: DEMO_CUSTOMERS, customers: DEMO_CUSTOMERS } };
  }
  if (norm.includes('/revenue') || norm.includes('/reports')) {
    return {
      data: {
        success: true,
        total_revenue: 84950,
        net_revenue: 78200,
        tax_collected: 4250,
        shipping_revenue: 2500,
        monthly_trend: generateChartDays(12)
      }
    };
  }
  if (norm.includes('/settings')) {
    return {
      data: {
        success: true,
        settings: {
          store_name: 'Peenakaa',
          site_domain: 'peenakaa.com',
          support_email: 'support@peenakaa.com',
          currency: 'USD',
          timezone: 'UTC'
        }
      }
    };
  }

  // Generic fallback
  return { data: { success: true, message: 'Success' } };
};
