// Real Store & Portfolio Data for Peenakaa Ecommerce Dashboard
// Extracted from MySQL production dump (Dump20251222.sql) and portfolio leads (leads.db)

const generateChartDays = (numDays = 30) => {
  const result = [];
  const now = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const baseSales = 650 + Math.floor(Math.sin(i * 0.5) * 350) + Math.floor(Math.random() * 180);
    const orders = Math.max(1, Math.floor(baseSales / 650));
    result.push({
      date: dateStr,
      sales: baseSales,
      orders: orders,
      products_sold: orders * 2,
      customers: Math.max(1, Math.floor(orders * 0.9))
    });
  }
  return result;
};

export const DEMO_STATS = {
  "orders": {
    "total": 17,
    "change_percentage": 21.4,
    "last_month": 14,
    "last_week": 6
  },
  "sales": {
    "total": 19583.27,
    "change_percentage": 28.5,
    "last_month": 15200.0,
    "last_week": 6820.0
  },
  "products": {
    "total": 17,
    "active": 16,
    "featured": 5
  },
  "users": {
    "total": 7,
    "active": 7
  },
  "recent_reviews": 8
};

export const DEMO_TOP_PRODUCTS = [
  {
    "id": 28,
    "name": "Female Vitality",
    "sales_count": 4,
    "total_revenue": 3322.0,
    "price": 840.0,
    "rating": 4.9,
    "stock": 100
  },
  {
    "id": 34,
    "name": "Stress & Anxiety Relief",
    "sales_count": 3,
    "total_revenue": 1941.0,
    "price": 647.0,
    "rating": 4.9,
    "stock": 100
  },
  {
    "id": 33,
    "name": "Sleep Support",
    "sales_count": 4,
    "total_revenue": 3079.92,
    "price": 769.98,
    "rating": 4.8,
    "stock": 100
  },
  {
    "id": 24,
    "name": "Bio Burner",
    "sales_count": 3,
    "total_revenue": 2160.0,
    "price": 720.0,
    "rating": 4.9,
    "stock": 100
  },
  {
    "id": 21,
    "name": "Multivitamin Gummies",
    "sales_count": 3,
    "total_revenue": 2009.97,
    "price": 669.99,
    "rating": 4.7,
    "stock": 100
  }
];

export const DEMO_ORDERS = [
  {
    "id": 215,
    "order_number": "RB-20251211-0001",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 800.0,
    "tax_amount": 144.18,
    "total_amount": 944.18,
    "status": "cancelled",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-11 10:31:33",
    "shipping_address": "Haridwar, Uttarakhand - 249401",
    "billing_address": "Haridwar, Uttarakhand - 249401",
    "items": [
      {
        "id": 316,
        "product_id": 30,
        "product_name": "Male Vitality",
        "quantity": 1,
        "unit_price": 800.0,
        "total_price": 800.0
      }
    ]
  },
  {
    "id": 214,
    "order_number": "RB-20251205-0006",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 2159.97,
    "tax_amount": 388.97,
    "total_amount": 2549.94,
    "status": "confirmed",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 3,
    "created_at": "2025-12-05 12:28:41",
    "shipping_address": "1323, edfrgvf, Ahmedabad, Gujarat - 123654",
    "billing_address": "1323, edfrgvf, Ahmedabad, Gujarat - 123654",
    "items": [
      {
        "id": 313,
        "product_id": 33,
        "product_name": "Sleep Support",
        "quantity": 1,
        "unit_price": 769.98,
        "total_price": 769.98
      },
      {
        "id": 314,
        "product_id": 24,
        "product_name": "Bio Burner",
        "quantity": 1,
        "unit_price": 720.0,
        "total_price": 720.0
      },
      {
        "id": 315,
        "product_id": 21,
        "product_name": "Multivitamin Gummies",
        "quantity": 1,
        "unit_price": 669.99,
        "total_price": 669.99
      }
    ]
  },
  {
    "id": 213,
    "order_number": "RB-20251205-0005",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 1389.99,
    "tax_amount": 250.38,
    "total_amount": 1641.37,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 2,
    "created_at": "2025-12-05 12:20:04",
    "shipping_address": "fdf, 123, Ajmer, Rajasthan - 456123",
    "billing_address": "fdf, 123, Ajmer, Rajasthan - 456123",
    "items": [
      {
        "id": 311,
        "product_id": 24,
        "product_name": "Bio Burner",
        "quantity": 1,
        "unit_price": 720.0,
        "total_price": 720.0
      },
      {
        "id": 312,
        "product_id": 21,
        "product_name": "Multivitamin Gummies",
        "quantity": 1,
        "unit_price": 669.99,
        "total_price": 669.99
      }
    ]
  },
  {
    "id": 212,
    "order_number": "RB-20251205-0004",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 669.99,
    "tax_amount": 120.78,
    "total_amount": 791.77,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-05 11:49:00",
    "shipping_address": "2334, bvgbg, Udaipur, Rajasthan - 4585855",
    "billing_address": "2334, bvgbg, Udaipur, Rajasthan - 4585855",
    "items": [
      {
        "id": 310,
        "product_id": 21,
        "product_name": "Multivitamin Gummies",
        "quantity": 1,
        "unit_price": 669.99,
        "total_price": 669.99
      }
    ]
  },
  {
    "id": 211,
    "order_number": "RB-20251205-0003",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 1560.0,
    "tax_amount": 280.98,
    "total_amount": 1841.98,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 2,
    "created_at": "2025-12-05 09:55:42",
    "shipping_address": "ggfgfg, fdf, Jalandhar, Punjab - 5858",
    "billing_address": "ggfgfg, fdf, Jalandhar, Punjab - 5858",
    "items": [
      {
        "id": 308,
        "product_id": 24,
        "product_name": "Bio Burner",
        "quantity": 1,
        "unit_price": 720.0,
        "total_price": 720.0
      },
      {
        "id": 309,
        "product_id": 28,
        "product_name": "Female Vitality",
        "quantity": 1,
        "unit_price": 840.0,
        "total_price": 840.0
      }
    ]
  },
  {
    "id": 210,
    "order_number": "RB-20251205-0002",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 840.0,
    "tax_amount": 151.38,
    "total_amount": 992.38,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-05 09:32:19",
    "shipping_address": "12333, yghkj, Panipat, Haryana - 78965",
    "billing_address": "12333, yghkj, Panipat, Haryana - 78965",
    "items": [
      {
        "id": 307,
        "product_id": 28,
        "product_name": "Female Vitality",
        "quantity": 1,
        "unit_price": 840.0,
        "total_price": 840.0
      }
    ]
  },
  {
    "id": 209,
    "order_number": "RB-20251205-0001",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 840.0,
    "tax_amount": 151.38,
    "total_amount": 992.38,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-05 07:11:56",
    "shipping_address": "12, hhhjk, Karnal, Haryana - 123456",
    "billing_address": "12, hhhjk, Karnal, Haryana - 123456",
    "items": [
      {
        "id": 306,
        "product_id": 28,
        "product_name": "Female Vitality",
        "quantity": 1,
        "unit_price": 840.0,
        "total_price": 840.0
      }
    ]
  },
  {
    "id": 208,
    "order_number": "RB-20251204-0006",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 599.98,
    "tax_amount": 108.18,
    "total_amount": 709.16,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:50:07",
    "shipping_address": "ghgh, nghghg, Bikaner, Rajasthan - 895623",
    "billing_address": "ghgh, nghghg, Bikaner, Rajasthan - 895623",
    "items": [
      {
        "id": 305,
        "product_id": 26,
        "product_name": "Diabetes Care",
        "quantity": 1,
        "unit_price": 599.98,
        "total_price": 599.98
      }
    ]
  },
  {
    "id": 207,
    "order_number": "RB-20251204-0005",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 649.0,
    "tax_amount": 117.0,
    "total_amount": 767.0,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:40:57",
    "shipping_address": "vikas colony hno.352, nhnh, Dehradun, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, nhnh, Dehradun, Uttarakhand - 249401",
    "items": [
      {
        "id": 304,
        "product_id": 31,
        "product_name": "Marine Collagen",
        "quantity": 1,
        "unit_price": 649.0,
        "total_price": 649.0
      }
    ]
  },
  {
    "id": 206,
    "order_number": "RB-20251204-0004",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 720.0,
    "tax_amount": 129.78,
    "total_amount": 850.78,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:34:18",
    "shipping_address": "vikas colony hno.352, ggh, Roorkee, Uttarakhand - 789546",
    "billing_address": "vikas colony hno.352, ggh, Roorkee, Uttarakhand - 789546",
    "items": [
      {
        "id": 303,
        "product_id": 29,
        "product_name": "Liver Care",
        "quantity": 1,
        "unit_price": 720.0,
        "total_price": 720.0
      }
    ]
  },
  {
    "id": 205,
    "order_number": "RB-20251204-0003",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 648.98,
    "tax_amount": 117.0,
    "total_amount": 766.98,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:19:02",
    "shipping_address": "123, ghhn, Mumbai, Maharashtra - 525257",
    "billing_address": "123, ghhn, Mumbai, Maharashtra - 525257",
    "items": [
      {
        "id": 302,
        "product_id": 32,
        "product_name": "Migraine Care",
        "quantity": 1,
        "unit_price": 648.98,
        "total_price": 648.98
      }
    ]
  },
  {
    "id": 204,
    "order_number": "RB-20251204-0002",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 648.98,
    "tax_amount": 117.0,
    "total_amount": 766.98,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:13:38",
    "shipping_address": "vikas colony hno.352, dfgfg, Haridwar, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, dfgfg, Haridwar, Uttarakhand - 249401",
    "items": [
      {
        "id": 301,
        "product_id": 32,
        "product_name": "Migraine Care",
        "quantity": 1,
        "unit_price": 648.98,
        "total_price": 648.98
      }
    ]
  },
  {
    "id": 203,
    "order_number": "RB-20251204-0001",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 2309.94,
    "tax_amount": 415.97,
    "total_amount": 2726.91,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-04 05:09:22",
    "shipping_address": "vikas colony hno.352, sss, Haridwar, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, sss, Haridwar, Uttarakhand - 249401",
    "items": [
      {
        "id": 300,
        "product_id": 33,
        "product_name": "Sleep Support",
        "quantity": 3,
        "unit_price": 769.98,
        "total_price": 2309.94
      }
    ]
  },
  {
    "id": 202,
    "order_number": "RB-20251203-0004",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 647.0,
    "tax_amount": 116.64,
    "total_amount": 764.64,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-03 11:32:03",
    "shipping_address": "vikas colony hno.352, hhh, Haldwani, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, hhh, Haldwani, Uttarakhand - 249401",
    "items": [
      {
        "id": 299,
        "product_id": 34,
        "product_name": "Stress & Anxiety Relief",
        "quantity": 1,
        "unit_price": 647.0,
        "total_price": 647.0
      }
    ]
  },
  {
    "id": 201,
    "order_number": "RB-20251203-0003",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 647.0,
    "tax_amount": 116.64,
    "total_amount": 764.64,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-03 11:10:53",
    "shipping_address": "vikas colony hno.352, fgg, Haridwar, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, fgg, Haridwar, Uttarakhand - 249401",
    "items": [
      {
        "id": 298,
        "product_id": 34,
        "product_name": "Stress & Anxiety Relief",
        "quantity": 1,
        "unit_price": 647.0,
        "total_price": 647.0
      }
    ]
  },
  {
    "id": 200,
    "order_number": "RB-20251203-0002",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 647.0,
    "tax_amount": 116.64,
    "total_amount": 764.64,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-03 11:08:57",
    "shipping_address": "123, vbgnhn, Chandigarh, Chandigarh - 5255545",
    "billing_address": "123, vbgnhn, Chandigarh, Chandigarh - 5255545",
    "items": [
      {
        "id": 297,
        "product_id": 34,
        "product_name": "Stress & Anxiety Relief",
        "quantity": 1,
        "unit_price": 647.0,
        "total_price": 647.0
      }
    ]
  },
  {
    "id": 199,
    "order_number": "RB-20251203-0001",
    "customer_name": "Shruti Shruti",
    "user_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "customer_email": "shrutibhagi19@gmail.com",
    "customer_phone": "07037289843",
    "subtotal": 802.0,
    "tax_amount": 144.54,
    "total_amount": 947.54,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "currency": "INR",
    "items_count": 1,
    "created_at": "2025-12-03 05:31:49",
    "shipping_address": "vikas colony hno.352, , Haridwar, Uttarakhand - 249401",
    "billing_address": "vikas colony hno.352, , Haridwar, Uttarakhand - 249401",
    "items": [
      {
        "id": 296,
        "product_id": 28,
        "product_name": "Female Vitality",
        "quantity": 1,
        "unit_price": 802.0,
        "total_price": 802.0
      }
    ]
  }
];

export const DEMO_NOTIFICATIONS = {
  "unread_count": 2,
  "notifications": [
    {
      "id": 1,
      "title": "New Lead: Chauhan AI Test Corp",
      "message": "AI Agent Development inquiry captured from Portfolio Contact Form",
      "notification_type": "lead",
      "is_read": false,
      "created_at": "2026-07-19T13:37:43.000Z"
    },
    {
      "id": 2,
      "title": "Recent Order #RB-20251211-0001",
      "message": "Male Vitality order recorded for \u20b9944.18",
      "notification_type": "order",
      "is_read": false,
      "created_at": "2025-12-11T10:31:33.000Z"
    }
  ]
};

export const DEMO_CURRENCIES = [
  {
    "id": 1,
    "code": "INR",
    "symbol": "\u20b9",
    "name": "Indian Rupee",
    "exchange_rate": 1.0,
    "is_default": true,
    "status": "active"
  },
  {
    "id": 2,
    "code": "USD",
    "symbol": "$",
    "name": "US Dollar",
    "exchange_rate": 0.012,
    "is_default": false,
    "status": "active"
  },
  {
    "id": 3,
    "code": "EUR",
    "symbol": "\u20ac",
    "name": "Euro",
    "exchange_rate": 0.011,
    "is_default": false,
    "status": "active"
  },
  {
    "id": 4,
    "code": "GBP",
    "symbol": "\u00a3",
    "name": "British Pound",
    "exchange_rate": 0.0095,
    "is_default": false,
    "status": "active"
  }
];

export const DEMO_CATEGORIES = [
  {
    "id": 5,
    "name": "Health Supplements",
    "slug": "health-supplements",
    "status": "active",
    "products_count": 3
  },
  {
    "id": 6,
    "name": "Cosmetics",
    "slug": "cosmetics",
    "status": "active",
    "products_count": 3
  },
  {
    "id": 7,
    "name": "Honey",
    "slug": "honey",
    "status": "active",
    "products_count": 0
  },
  {
    "id": 8,
    "name": "Essential Supplements",
    "slug": "essential-supplements",
    "status": "active",
    "products_count": 6
  },
  {
    "id": 9,
    "name": "Specialized Supplements",
    "slug": "specialized-supplements",
    "status": "active",
    "products_count": 5
  },
  {
    "id": 11,
    "name": "Hair Care",
    "slug": "hair-care",
    "status": "active",
    "products_count": 0
  }
];

export const DEMO_PRODUCTS = [
  {
    "id": 19,
    "name": "Testing product",
    "slug": "testing-product",
    "sku": "930ED141",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 500.0,
    "base_price": 500.0,
    "sale_price": 250.0,
    "price": 250.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "this is a testing product",
    "short_description": "this is a testing product"
  },
  {
    "id": 20,
    "name": "PCOS Care",
    "slug": "pcos-care",
    "sku": "5DB6538D",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 999.0,
    "base_price": 999.0,
    "sale_price": 670.0,
    "price": 670.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "description": "Our PCOD/PCOS care is a specially crafted formula designed to support women managing Polycystic Ovary Syndrome (PCOS) and Polycystic Ovarian Disease (PCOD). Packed with powerful ingredients, this supplement aims to balance hormones, regulate menstrual cycles, and support overall reproductive health. The blend of herbs and nutrients, including Myo-Inositol, D-Chiro Inositol, Chromium, and Vitamin D, is scientifically backed to improve ovarian function, promote healthy insulin levels, and support fertility.",
    "short_description": "Nutra's Bounty PCOD/PCOS care is a specially crafted formula designed to support hormonal balance and alleviate the discomfort of Polycystic Ovary Syndrome (PCOS)."
  },
  {
    "id": 21,
    "name": "Multivitamin Gummies",
    "slug": "multivitamin-gummies",
    "sku": "0B84DB62",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 999.0,
    "base_price": 999.0,
    "sale_price": 669.99,
    "price": 669.99,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "description": "Nutra\u2019s Bounty Multivitamin Gummies provide a powerhouse blend of essential vitamins and minerals to help fill daily nutritional gaps. Formulated for overall wellness, these tasty mixed-fruit flavored gummies support immunity, energy production, bone strength, and healthier skin, hair & nails. Made for both adults and teens, they are easy to chew, gentle on the stomach, and suitable for everyday consumption. A convenient and enjoyable way to maintain an active and balanced lifestyle.",
    "short_description": "Nutra\u2019s Bounty Multivitamin Gummies are delicious mixed-fruit flavored gummies designed to support overall health, immunity, and daily nutritional needs. Perfect for those who struggle to swallow tablets."
  },
  {
    "id": 22,
    "name": "Hair Serum",
    "slug": "hair-serum",
    "sku": "2504B571",
    "category_id": 6,
    "category": "Cosmetics",
    "category_name": "Cosmetics",
    "regular_price": 1199.0,
    "base_price": 1199.0,
    "sale_price": 799.0,
    "price": 799.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1608248597359-009825633465?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1608248597359-009825633465?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1608248597359-009825633465?w=300&auto=format&fit=crop&q=60",
    "description": "Indulge your senses and nourish your hair with RasayanaBio Rosemary Hair Serum, a potent blend of nature's finest ingredients. This lightweight, non-greasy formula is designed to revitalize and strengthen your hair, leaving it soft, shiny, and full of life.",
    "short_description": "Indulge your senses and nourish your hair with RasayanaBio Rosemary Hair Serum, a potent blend of nature's finest ingredients. This lightweight, non-greasy formula is designed to revitalize and streng"
  },
  {
    "id": 23,
    "name": "Aphrodiasic for female",
    "slug": "aphrodiasic-for-female",
    "sku": "0A519FB2",
    "category_id": 5,
    "category": "Health Supplements",
    "category_name": "Health Supplements",
    "regular_price": 50.0,
    "base_price": 50.0,
    "sale_price": 1.0,
    "price": 1.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "Female wellness begins with balance, and this natural supplement is designed to increase energy, enhance mood, and strengthen immunity. It contains a fantastic botanical mix that promotes energy and health, leaving you feeling strong, supple, and ready to face life",
    "short_description": "Female wellness begins with balance, and this natural supplement is designed to increase energy, enhance mood, and strengthen immunity. It contains a fantastic botanical mix that promotes energy and h"
  },
  {
    "id": 24,
    "name": "Bio Burner",
    "slug": "bio-burner",
    "sku": "BBD189A5",
    "category_id": 9,
    "category": "Specialized Supplements",
    "category_name": "Specialized Supplements",
    "regular_price": 999.0,
    "base_price": 999.0,
    "sale_price": 720.0,
    "price": 720.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60",
    "description": "Our Nutra\u2019s Bounty Bio burner capsules is a carefully formulated blend of potent natural ingredients designed to support your weight loss goals in a healthy and sustainable way. Expertly designed using scientific evidence, these capsules are an effective and safe way to achieve your weight loss goals, remove extra fat from your body and promoting a healthier lifestyle.",
    "short_description": "Nutra's Bounty Bio burner is a blend of potent natural ingredients that will help accelerate your weight management goals.This herbal weight loss formulation is your best bet to get rid of the excess body fat and get in perfect shape."
  },
  {
    "id": 25,
    "name": "Collagen",
    "slug": "collagen",
    "sku": "647626A6",
    "category_id": 5,
    "category": "Health Supplements",
    "category_name": "Health Supplements",
    "regular_price": 599.0,
    "base_price": 599.0,
    "sale_price": 499.0,
    "price": 499.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "Typically contain collagen peptides, which are smaller, broken-down pieces of collagen from animal sources like cows, pigs, or fish. These products are available in various forms, including powders, capsules, and gummies, and are marketed to improve skin hydration and elasticity, reduce wrinkles, support bone density, and aid joint health. ",
    "short_description": "Typically contain collagen peptides, which are smaller, broken-down pieces of collagen from animal sources like cows, pigs, or fish. These products are available in various forms, including powders, capsules, and gummies, and are marketed to improve skin hydration and elasticity, reduce wrinkles, support bone density, and aid joint health. "
  },
  {
    "id": 26,
    "name": "Diabetes Care",
    "slug": "diabetes-care",
    "sku": "FF755136",
    "category_id": 9,
    "category": "Specialized Supplements",
    "category_name": "Specialized Supplements",
    "regular_price": 899.0,
    "base_price": 899.0,
    "sale_price": 599.98,
    "price": 599.98,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "description": "Nutra's Bounty diabetes care is an enhanced herbal formula designed to balance blood sugar levels naturally. Made with 7 powerful Ayurvedic ingredients like Bitter Melon, Gymnema Sylvestre, and Cinnamon, it supports glucose metabolism, reduces sugar cravings, and promotes overall metabolic health. Experience superior blood sugar management with Nutra's Bounty.",
    "short_description": "Experience the power of nature with Nutra's Bounty diabetes care supplement. Our carefully selected blend of herbs works synergistically to promote blood sugar balance, promotes insulin sensitivity, and aids in overall well-being."
  },
  {
    "id": 27,
    "name": "Face Wash with Glutathione",
    "slug": "face-wash-with-glutathione",
    "sku": "A839DAC8",
    "category_id": 6,
    "category": "Cosmetics",
    "category_name": "Cosmetics",
    "regular_price": 600.0,
    "base_price": 600.0,
    "sale_price": 599.0,
    "price": 599.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "description": "A cleanser designed to purify the skin by removing dirt and impurities while also aiming to brighten the complexion and improve skin tone. These products are often formulated to help reduce dark spots and blemishes, promote a radiant glow, and protect against environmental damage. Key ingredients like glutathione and vitamin C work to nourish the skin and enhance its overall appearance",
    "short_description": "A cleanser designed to purify the skin by removing dirt and impurities while also aiming to brighten the complexion and improve skin tone. These products are often formulated to help reduce dark spots and blemishes, promote a radiant glow, and protect against environmental damage. Key ingredients like glutathione and vitamin C work to nourish the skin and enhance its overall appearance"
  },
  {
    "id": 28,
    "name": "Female Vitality",
    "slug": "female-vitality",
    "sku": "362D56C6",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 1199.0,
    "base_price": 1199.0,
    "sale_price": 840.0,
    "price": 840.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "Experience a balanced and harmonious life with our all-natural supplement designed to support women's overall health. Our unique blend of botanicals helps regulate boost energy levels, enhance your mood, immune function, and promote overall well-being.",
    "short_description": "Experience renewed energy, enhanced mood, and optimal hormonal balance with our comprehensive female vitality supplement. Our carefully curated formula combines powerful antioxidants, essential vitamins, and minerals to support overall well-being and radiant health."
  },
  {
    "id": 29,
    "name": "Liver Care",
    "slug": "liver-care",
    "sku": "7D816001",
    "category_id": 9,
    "category": "Specialized Supplements",
    "category_name": "Specialized Supplements",
    "regular_price": 999.0,
    "base_price": 999.0,
    "sale_price": 720.0,
    "price": 720.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=60",
    "description": "Nurture your liver's well-being with our potent blend of time-tested herbs in Nutra's Bounty liver support. Our formula supports liver function, aids detoxification, and promotes overall liver health.",
    "short_description": "Discover the power of Nutra's Bounty liver support crafted with a unique blend of potent botanicals to enhance your liver health and provide essential antioxidant support."
  },
  {
    "id": 30,
    "name": "Male Vitality",
    "slug": "male-vitality",
    "sku": "AFB7AB5F",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 1099.0,
    "base_price": 1099.0,
    "sale_price": 800.0,
    "price": 800.0,
    "stock": 101,
    "stock_quantity": 101,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "Nutra's Bounty Male vitality is a meticulously crafted herbal blend designed to support your overall well-being. This potent formula combines ancient wisdom with modern science to deliver a comprehensive approach to health and vitality.",
    "short_description": "Nutra's Bounty Male vitality is a meticulously crafted herbal blend designed to support your overall well-being. This potent formula combines ancient wisdom with modern science to deliver a comprehensive approach to health and vitality."
  },
  {
    "id": 31,
    "name": "Marine Collagen",
    "slug": "marine-collagen",
    "sku": "45118B25",
    "category_id": 5,
    "category": "Health Supplements",
    "category_name": "Health Supplements",
    "regular_price": 1999.0,
    "base_price": 1999.0,
    "sale_price": 649.0,
    "price": 649.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "Collagen is the body's most abundant protein, as it helps to structure your skin, hair, and nails. According to your age, the capacity of your body to produce collagen decreases, resulting in visible ageing signs.",
    "short_description": "Collagen is the body's most abundant protein, as it helps to structure your skin, hair, and nails. According to your age, the capacity of your body to produce collagen decreases, resulting in visible "
  },
  {
    "id": 32,
    "name": "Migraine Care",
    "slug": "migraine-care",
    "sku": "22255CF7",
    "category_id": 9,
    "category": "Specialized Supplements",
    "category_name": "Specialized Supplements",
    "regular_price": 899.0,
    "base_price": 899.0,
    "sale_price": 648.98,
    "price": 648.98,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60",
    "description": "Migraine care involves a combination of lifestyle adjustments, symptom-based treatments, and preventative measures to reduce attack frequency and severity. Key strategies include maintaining a consistent sleep and eating schedule, managing stress through relaxation techniques, staying hydrated, and identifying and avoiding personal triggers through a headache diary",
    "short_description": "Migraine care involves a combination of lifestyle adjustments, symptom-based treatments, and preventative measures to reduce attack frequency and severity. Key strategies include maintaining a consist"
  },
  {
    "id": 33,
    "name": "Sleep Support",
    "slug": "sleep-support",
    "sku": "98F02A8A",
    "category_id": 9,
    "category": "Specialized Supplements",
    "category_name": "Specialized Supplements",
    "regular_price": 1099.0,
    "base_price": 1099.0,
    "sale_price": 769.98,
    "price": 769.98,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
    "description": "Nutra's Bounty sleep support combines the power of traditional herbs and modern science to provide a holistic solution for sleep-related issues.Our formula includes valerian root, chamomile, passion flower, lavender, lemon balm and kava kava known for their calming and sleep-inducing properties. Nutra's Bounty sleep support enhnaces the body's natural sleep cycle, helping you wake up feeling refreshed and energized.",
    "short_description": "Nutra's Bounty Sleep support is a carefully crafted blend of calming herbs and natural ingredients designed to promote restful sleep and improve your overall sleep quality."
  },
  {
    "id": 34,
    "name": "Stress & Anxiety Relief",
    "slug": "stress-anxiety-relief",
    "sku": "328B2B38",
    "category_id": 8,
    "category": "Essential Supplements",
    "category_name": "Essential Supplements",
    "regular_price": 899.0,
    "base_price": 899.0,
    "sale_price": 647.0,
    "price": 647.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&auto=format&fit=crop&q=60",
    "description": "Recharge your mind and body naturally with the Prince of Herbs, unlocking your full potential and productivity. Boost your power, potency and performance for a lively day. Ashwagandha regulates cortisol and adrenaline to manage stress. Stay ahead of the game with an ancient herb that combats modern setbacks like depression, fatigue, and weakness.",
    "short_description": "Ashwagandha (Withania somnifera or Indian ginseng) is nature's remedy to the modern life' s stress. It is also known as \"Rasayana herb\" due to its tremendous curative potential. This botanical enhances the body's response to stress while improving cognitive health and overall well-being.  "
  },
  {
    "id": 35,
    "name": "test",
    "slug": "test",
    "sku": "6D659C7F",
    "category_id": 6,
    "category": "Cosmetics",
    "category_name": "Cosmetics",
    "regular_price": 500.0,
    "base_price": 500.0,
    "sale_price": 500.0,
    "price": 500.0,
    "stock": 100,
    "stock_quantity": 100,
    "status": "active",
    "is_active": true,
    "product_type": "simple",
    "rating": 4.8,
    "currency": "INR",
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "image1": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    "description": "asdfg",
    "short_description": "asdfg"
  }
];

export const DEMO_COUPONS = [
  {
    "id": 1,
    "code": "PEENAKAA20",
    "discount_type": "percentage",
    "discount_value": 20,
    "min_purchase": 500,
    "usage_limit": 1000,
    "usage_count": 18,
    "status": "active",
    "expires_at": "2026-12-31"
  },
  {
    "id": 2,
    "code": "WELCOME10",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_purchase": 300,
    "usage_limit": 5000,
    "usage_count": 45,
    "status": "active",
    "expires_at": "2026-12-31"
  },
  {
    "id": 3,
    "code": "AYUR50",
    "discount_type": "fixed",
    "discount_value": 50,
    "min_purchase": 800,
    "usage_limit": 500,
    "usage_count": 12,
    "status": "active",
    "expires_at": "2026-11-30"
  }
];

export const DEMO_CUSTOMERS = [
  {
    "id": 40,
    "name": "Shruti Shruti",
    "full_name": "Shruti Shruti",
    "email": "shrutibhagi19@gmail.com",
    "phone": "07037289843",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 16,
    "total_spent": 18639.09,
    "status": "active",
    "is_active": true,
    "email_verified": false,
    "role": "customer",
    "type": "Ecommerce Customer",
    "created_at": "2025-12-03 04:10:54"
  },
  {
    "id": 1006,
    "name": "Chauhan AI Test Corp",
    "full_name": "Chauhan AI Test Corp",
    "email": "procure@chauhan-ai.com",
    "phone": "+91-9876543210",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "AI Agent Development",
    "business_vertical": "Manufacturing",
    "created_at": "2026-07-19 13:37:43"
  },
  {
    "id": 1005,
    "name": "Chauhan Test Corp",
    "full_name": "Chauhan Test Corp",
    "email": "procure@chauhan-test.com",
    "phone": "+91-9876543210",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Custom Industrial Crating",
    "business_vertical": "Heavy Machinery",
    "created_at": "2026-07-19 13:12:53"
  },
  {
    "id": 1004,
    "name": "Dr Sanjay Test",
    "full_name": "Dr Sanjay Test",
    "email": "doctor@siddharthaphaco.com",
    "phone": "+977-9820722333",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Phaco Cataract Surgery",
    "business_vertical": "Rani Main Branch",
    "created_at": "2026-07-15 19:25:08"
  },
  {
    "id": 1003,
    "name": "Aman Test Redesign",
    "full_name": "Aman Test Redesign",
    "email": "test@siddharthopticals.com",
    "phone": "+91 99999 99999",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Comprehensive Eye Exam",
    "business_vertical": "Vasant Vihar",
    "created_at": "2026-07-15 19:04:01"
  },
  {
    "id": 1002,
    "name": "Aman Kumar",
    "full_name": "Aman Kumar",
    "email": "amanchouhan1217@gmail.com",
    "phone": "09115437107",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "https://yeahitsmeaman.netlify.app/",
    "business_vertical": "Agency",
    "created_at": "2026-07-12 13:08:56"
  },
  {
    "id": 1001,
    "name": "test",
    "full_name": "test",
    "email": "Test@gmailc.com",
    "phone": "1234567890",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "https://yeahitsmeaman.netlify.app/",
    "business_vertical": "Agency",
    "created_at": "2026-07-12 13:08:33"
  }
];

export const PORTFOLIO_LEADS = [
  {
    "id": 1006,
    "name": "Chauhan AI Test Corp",
    "full_name": "Chauhan AI Test Corp",
    "email": "procure@chauhan-ai.com",
    "phone": "+91-9876543210",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "AI Agent Development",
    "business_vertical": "Manufacturing",
    "created_at": "2026-07-19 13:37:43"
  },
  {
    "id": 1005,
    "name": "Chauhan Test Corp",
    "full_name": "Chauhan Test Corp",
    "email": "procure@chauhan-test.com",
    "phone": "+91-9876543210",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Custom Industrial Crating",
    "business_vertical": "Heavy Machinery",
    "created_at": "2026-07-19 13:12:53"
  },
  {
    "id": 1004,
    "name": "Dr Sanjay Test",
    "full_name": "Dr Sanjay Test",
    "email": "doctor@siddharthaphaco.com",
    "phone": "+977-9820722333",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Phaco Cataract Surgery",
    "business_vertical": "Rani Main Branch",
    "created_at": "2026-07-15 19:25:08"
  },
  {
    "id": 1003,
    "name": "Aman Test Redesign",
    "full_name": "Aman Test Redesign",
    "email": "test@siddharthopticals.com",
    "phone": "+91 99999 99999",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "Comprehensive Eye Exam",
    "business_vertical": "Vasant Vihar",
    "created_at": "2026-07-15 19:04:01"
  },
  {
    "id": 1002,
    "name": "Aman Kumar",
    "full_name": "Aman Kumar",
    "email": "amanchouhan1217@gmail.com",
    "phone": "09115437107",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "https://yeahitsmeaman.netlify.app/",
    "business_vertical": "Agency",
    "created_at": "2026-07-12 13:08:56"
  },
  {
    "id": 1001,
    "name": "test",
    "full_name": "test",
    "email": "Test@gmailc.com",
    "phone": "1234567890",
    "country_code": "IN",
    "country_name": "India",
    "preferred_currency": "INR",
    "wallet_balance": 0.0,
    "reward_points": 0,
    "orders_count": 0,
    "total_spent": 0.0,
    "status": "active",
    "is_active": true,
    "email_verified": true,
    "role": "lead",
    "type": "Portfolio Inquiry",
    "service_interest": "https://yeahitsmeaman.netlify.app/",
    "business_vertical": "Agency",
    "created_at": "2026-07-12 13:08:33"
  }
];

export const getDemoResponse = (url) => {
  const norm = (url || '').toLowerCase();

  if (norm.includes('/dashboard/stats')) {
    return { data: DEMO_STATS };
  }
  if (norm.includes('/dashboard/sales-chart') || norm.includes('/dashboard/chart') || norm.includes('/dashboard/sales')) {
    const days = generateChartDays(30);
    return { data: { success: true, chart_data: days, sales: days } };
  }
  if (norm.includes('/dashboard/top-products')) {
    return { data: { success: true, products: DEMO_TOP_PRODUCTS } };
  }
  if (norm.includes('/dashboard/recent-orders') || norm.includes('/recent-orders')) {
    return { data: { success: true, orders: DEMO_ORDERS.slice(0, 10) } };
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
  if (norm.includes('/products/categories')) {
    return { data: { success: true, categories: DEMO_CATEGORIES } };
  }
  if (norm.includes('/products/') && !norm.endsWith('/products/')) {
    // Single product request e.g. /products/20
    const parts = norm.split('/');
    const id = parseInt(parts[parts.length - 1], 10);
    const found = DEMO_PRODUCTS.find(p => p.id === id) || DEMO_PRODUCTS[0];
    return { data: { success: true, product: found } };
  }
  if (norm.includes('/products')) {
    return { data: { success: true, products: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length } };
  }
  if (norm.includes('/orders/') && !norm.endsWith('/orders/')) {
    // Single order request
    const parts = norm.split('/');
    const id = parseInt(parts[parts.length - 1], 10);
    const found = DEMO_ORDERS.find(o => o.id === id) || DEMO_ORDERS[0];
    return { data: { success: true, order: found } };
  }
  if (norm.includes('/orders')) {
    return { data: { success: true, orders: DEMO_ORDERS, total: DEMO_ORDERS.length, pages: 1 } };
  }
  if (norm.includes('/coupons')) {
    return { data: { success: true, coupons: DEMO_COUPONS } };
  }
  if (norm.includes('/leads') || norm.includes('/portfolio-leads')) {
    return { data: { success: true, leads: PORTFOLIO_LEADS, total: PORTFOLIO_LEADS.length } };
  }
  if (norm.includes('/users') || norm.includes('/customers')) {
    return {
      data: {
        success: true,
        users: DEMO_CUSTOMERS,
        customers: DEMO_CUSTOMERS,
        total: DEMO_CUSTOMERS.length,
        pages: 1
      }
    };
  }
  if (norm.includes('/tax/settings') || norm.includes('/tax-templates')) {
    return { data: { success: true, templates: [], settings: { tax_enabled: true } } };
  }
  if (norm.includes('/health-benefits')) {
    return { data: { success: true, benefits: [] } };
  }
  if (norm.includes('/product-regional-overrides')) {
    return { data: { success: true, overrides: [] } };
  }
  if (norm.includes('/revenue') || norm.includes('/reports')) {
    return {
      data: {
        success: true,
        total_revenue: 19583.27,
        net_revenue: 17820.00,
        tax_collected: 1763.27,
        shipping_revenue: 0.00,
        monthly_trend: generateChartDays(12)
      }
    };
  }
  if (norm.includes('/settings')) {
    return {
      data: {
        success: true,
        settings: {
          store_name: 'Peenakaa (RasayanaBio)',
          site_domain: 'rasayanabio.com',
          support_email: 'support@rasayanabio.com',
          currency: 'INR',
          timezone: 'Asia/Kolkata'
        }
      }
    };
  }

  // Generic fallback
  return { data: { success: true, message: 'Success' } };
};
