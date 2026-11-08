# Architecture & Codebase Documentation

## 1. System Overview

This repository hosts a hybrid web application ecosystem:
1. **Developer Portfolio & Proof Hub (`/`)**: Static website with embedded case studies, client analytics reports, and lead capture.
2. **Peenakaa Ecommerce Administrative Dashboard (`/ecommerce-dashboard/`)**: A React SPA with AI business optimization engines, product catalog management, order processing, and Google Analytics 4 traffic reporting.
3. **Modular API Backend (`Ecommerce Dashboard/ecommerce-admin/app/`)**: A Flask application structured with Blueprints, SQLAlchemy ORM, and JWT authentication.

```
                           +-------------------------------+
                           |      User Browser / Client    |
                           +---------------+---------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
            HTTP GET / (Portfolio)                       HTTP GET /ecommerce-dashboard/
                    |                                             |
         +----------v----------+                      +-----------v-----------+
         |     index.html      |                      |   React SPA Dashboard |
         |   (Portfolio Site)  |                      |   - UI Primitives     |
         +---------------------+                      |   - Custom Hooks      |
                                                      |   - Domain Services   |
                                                      +-----------+-----------+
                                                                  |
                                                           apiClient / Proxy
                                                                  |
                                                      +-----------v-----------+
                                                      |  Flask API (Blueprints)|
                                                      |  app/routes/*.py      |
                                                      +-----------+-----------+
                                                                  |
                                                  +---------------+---------------+
                                                  |                               |
                                           +------v------+                 +------v------+
                                           | MySQL (DO)  |                 |  leads.db   |
                                           | ecom_admin  |                 |  (SQLite)   |
                                           +-------------+                 +-------------+
```

---

## 2. Directory Structure

```
portfolio/
├── assets/                     # Portfolio images, certifications, and icons
├── case-studies/               # Deep-dive marketing and dev case studies
├── reports/                    # Client proof PDFs and performance reports
├── leads.db                    # SQLite database capturing contact form leads
├── netlify.toml                # Netlify deployment, redirect, and security header rules
├── ARCHITECTURE.md             # This architecture documentation
│
├── ecommerce-dashboard/        # Compiled production build served by Netlify
│   ├── index.html              # SPA entry point with GA4/GTM analytics tracker
│   └── static/                 # Versioned CSS, JS bundles, and source maps
│
└── Ecommerce Dashboard/
    └── ecommerce-admin/        # Full source code for dashboard and backend
        ├── app/                # Modular Flask Application Package
        │   ├── __init__.py     # Application factory create_app()
        │   ├── config.py       # Configuration classes (DB, JWT, Secrets)
        │   ├── extensions.py   # SQLAlchemy, JWTManager, CORS instances
        │   └── routes/         # Scalable Flask Blueprints
        │       ├── auth.py         # /api/auth/login, /api/auth/profile
        │       ├── products.py     # /api/products, /api/categories
        │       ├── orders.py       # /api/orders, /api/dashboard/recent-orders
        │       ├── customers.py    # /api/users, /api/customers
        │       ├── analytics.py    # /api/dashboard/stats, sales chart
        │       ├── portfolio.py    # /api/portfolio/leads
        │       └── settings.py     # /api/settings, /api/currencies
        ├── wsgi.py             # WSGI entry point for Gunicorn / Cloud hosts
        ├── Procfile            # Cloud runner process configuration
        ├── render.yaml         # 1-click Render blueprint specification
        ├── deploy_droplet.sh   # Automated DigitalOcean droplet systemd setup
        ├── database/           # Production database dumps
        │   └── Dump20251222.sql
        └── admin/              # React 18 Admin Dashboard Source
            ├── src/
            │   ├── config/     # Centralized environment configs (env.js)
            │   ├── components/ # UI components
            │   │   ├── common/ # Modular UI Primitives (Card, StatCard, Badge, Button, Modal, DataTable, ErrorBoundary)
            │   │   └── ...     # Domain components (AIGrowthBriefing, PortfolioTrafficView)
            │   ├── contexts/   # Global State (AuthContext, ThemeContext, GlobalCurrencyContext)
            │   ├── hooks/      # Custom Business Hooks (useProducts, useOrders, useCustomers, useDashboardStats)
            │   ├── services/   # Domain Services (authService, productService, orderService, customerService, analyticsService)
            │   ├── pages/      # View Routes (Dashboard, Products, Orders, Users, Analytics)
            │   └── utils/      # Utility helpers (formatters, session tracking)
            └── package.json
```

---

## 3. Frontend Architecture (React)

### Separation of Concerns
1. **Presentational Layer (`src/components/common/`)**:
   - Reusable primitives (`Card`, `StatCard`, `Badge`, `Button`, `Modal`, `DataTable`, `ErrorBoundary`) with zero business logic.
2. **Business Logic Layer (`src/hooks/`)**:
   - Custom hooks (`useProducts`, `useOrders`, `useCustomers`, `useDashboardStats`) encapsulate data fetching, pagination, filter states, and mutation actions.
3. **Data Access Layer (`src/services/`)**:
   - Decoupled API service modules (`productService`, `orderService`, etc.) using the centralized `apiClient`.
4. **Resilience & Offline Fallback (`src/services/demoMockData.js`)**:
   - Whenever the backend is unreachable or running on static hosting (Netlify), `apiClient` seamlessly falls back to real cached store metrics (17 products, 17 orders, 6 portfolio leads), guaranteeing **zero 404s and 100% uptime**.

---

## 4. Backend Architecture (Flask)

- **Application Factory Pattern**: `create_app()` initializes configurations, extensions, and registers all Blueprints.
- **Blueprints**: Each domain (`auth`, `products`, `orders`, `customers`, `analytics`, `portfolio`, `settings`) is completely isolated.
- **CORS & Multi-Origin**: Configured with wildcard origin permissions and credentials support for client communication.
- **Deployment Flexibility**:
  - Direct execution: `python wsgi.py` (binds to `PORT` or `8800`).
  - Production Gunicorn: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2`.
  - DigitalOcean: `deploy_droplet.sh` registers a persistent systemd service.

