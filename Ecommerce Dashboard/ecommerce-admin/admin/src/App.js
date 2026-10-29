import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalCurrencyProvider } from './contexts/GlobalCurrencyContext';
import enterpriseTracker from './utils/enterpriseSessionTracker';
import SessionTracker from './utils/sessionTracker';
import Layout from './components/Layout';
import './App.css';
import './Typography.css';

// Import all pages directly (no lazy loading for better performance)
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CurrencyManagement from './pages/CurrencyManagement';
import TaxManagement from './pages/TaxManagement';
import EnterprisePricing from './pages/EnterprisePricing';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import RevenueAnalytics from './pages/RevenueAnalytics';
import RevenueReports from './pages/RevenueReports';
import RevenueSettings from './pages/RevenueSettings';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Categories from './pages/Categories';
import ProductPacks from './pages/ProductPacks';
import Colors from './pages/Colors';
import Sizes from './pages/Sizes';
import Coupons from './pages/Coupons';
import AddCoupon from './pages/AddCoupon';
import EditCoupon from './pages/EditCoupon';
import Payment from './pages/Payment';
import Invoices from './pages/Invoices';
import RewardsManagement from './pages/RewardsManagementV2';
import HealthBenefits from './pages/HealthBenefits';
import UserSessions from './pages/UserSessions';
import UserActions from './pages/UserActions';
import TenantManagement from './pages/TenantManagement';
import ResetPassword from './pages/ResetPassword';

// Component to track route changes
function RouteTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const DEFAULT_TITLE = 'Peenakaa Ecommerce Dashboard';

  useEffect(() => {
    // Set user ID if logged in
    if (user && user.id) {
      enterpriseTracker.setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Track route change
    enterpriseTracker.onPageChange(location);
  }, [location]);

  useEffect(() => {
    // Multi-tenancy removed - no site name in title
    document.title = DEFAULT_TITLE;
  }, []);

  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show minimal loading state - only if truly loading (not just validating)
  if (loading && !user) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '14px',
        color: '#94a3b8',
        background: 'var(--bg-primary, #f8fafc)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', fontSize: '18px' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }
  
  // If no user after loading completes, redirect to login
  // Preserve the intended destination so user can be redirected back after login
  if (!user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated and session is valid (or cached user while validating)
  return children;
}

function App() {
  // Initialize enterprise session tracker on app mount
  useEffect(() => {
    enterpriseTracker.init();
    
    // Also initialize our enhanced session tracker
    if (!window.sessionTracker) {
      const SessionTrackerClass = SessionTracker.default || SessionTracker;
      window.sessionTracker = new SessionTrackerClass();
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalCurrencyProvider>
          <Router>
            <RouteTracker />
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="revenue" element={<RevenueAnalytics />} />
                  <Route path="revenue/analytics" element={<RevenueAnalytics />} />
                  <Route path="revenue/reports" element={<RevenueReports />} />
                  <Route path="revenue/settings" element={<RevenueSettings />} />
                  <Route path="tenants" element={<TenantManagement />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="products/categories" element={<Categories />} />
                  <Route path="products/packs" element={<ProductPacks />} />
                  <Route path="products/colors" element={<Colors />} />
                  <Route path="products/sizes" element={<Sizes />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="users" element={<Users />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="coupons/add" element={<AddCoupon />} />
                  <Route path="coupons/edit/:id" element={<EditCoupon />} />
                  <Route path="coupons/view" element={<Coupons />} />
                  <Route path="customers" element={<Users />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="reports" element={<Analytics />} />
                  <Route path="payment" element={<Payment />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="rewards" element={<RewardsManagement />} />
                  <Route path="currency-management" element={<CurrencyManagement />} />
                  <Route path="tax-management" element={<TaxManagement />} />
                  <Route path="enterprise-pricing" element={<EnterprisePricing />} />
                  <Route path="health-benefits" element={<HealthBenefits />} />
                  <Route path="sessions" element={<UserSessions />} />
                  <Route path="activity-log" element={<UserActions />} />
                </Route>
              </Routes>
            </div>
      </Router>
        </GlobalCurrencyProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;