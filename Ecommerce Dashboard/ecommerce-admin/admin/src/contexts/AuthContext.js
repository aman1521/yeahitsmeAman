import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// REMOVED - Multi-tenancy removed
// const persistActiveSite = (normalizedUser) => { ... }

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    is_super_admin: rawUser.is_super_admin ?? rawUser.role === 'super_admin',
    is_tenant_admin: rawUser.is_tenant_admin ?? false,
    staff_role: rawUser.staff_role || null,
    permissions: rawUser.permissions || [], // Array of permission keys like ['products.view', 'orders.edit']
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchUser = async (preserveUserOnError = false) => {
    const token = localStorage.getItem('token');
    if (token === 'peenakaa-demo-token' || localStorage.getItem('demo_mode') === 'true') {
      const savedUser = localStorage.getItem('userPayload');
      if (savedUser) {
        try {
          const normalized = normalizeUser(JSON.parse(savedUser));
          setUser(normalized);
          setLoading(false);
          return { success: true, user: normalized };
        } catch (e) {
          console.error('[AuthContext] Error parsing demo user:', e);
        }
      }
    }

    try {
      console.log('[AuthContext] Fetching user profile...');
      const response = await apiClient.get('/auth/profile', {
        suppressErrorToast: true // Suppress error toast for background profile fetch
      });
      console.log('[AuthContext] Profile received:', response.data.user);
      console.log('[AuthContext] preferred_currency:', response.data.user?.preferred_currency);
      const normalized = normalizeUser(response.data.user);
      setUser(normalized);
      localStorage.setItem('userPayload', JSON.stringify(normalized));
      return { success: true, user: normalized };
    } catch (error) {
      console.error('[AuthContext] Error fetching user:', error);
      const isSessionExpired = error.response?.status === 401 && 
        (error.response?.data?.session_expired === true || 
         error.response?.data?.session_expired === 'true' ||
         error.response?.data?.error?.toLowerCase().includes('session expired'));
      
      // If session expired or 401 error, clear everything
      if (error.response?.status === 401 && !isLoggingIn && !preserveUserOnError) {
        console.log('[AuthContext] Session expired or invalid - clearing user data');
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userPayload');
        setUser(null);
        return { success: false, sessionExpired: isSessionExpired };
      }
      
      // For other errors, only clear if not preserving
      if (!preserveUserOnError && error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userPayload');
        setUser(null);
      }
      
      return { success: false, sessionExpired: isSessionExpired };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('userPayload');
    
    // Always validate session if we have a token
    if (token) {
      // If we have cached user data, restore it immediately for instant UX
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(normalizeUser(parsedUser));
          setLoading(false); // Show UI immediately with cached data
        } catch (e) {
          console.error('[AuthContext] Error parsing saved user:', e);
          setLoading(false);
        }
      } else {
        setLoading(false); // No cached user, but don't block UI
      }
      
      // Validate session with backend in background (non-blocking)
      fetchUser(false).then((result) => {
        // If session expired or invalid, user state is already cleared
        if (!result.success && result.sessionExpired) {
          console.log('[AuthContext] Session expired - user will be redirected to login');
        }
      }).catch((error) => {
        console.error('[AuthContext] Error during session validation:', error);
        // On error, clear everything to be safe
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userPayload');
        setUser(null);
      });
    } else {
      // No token - clear any cached data and ensure user is null
      if (savedUser) {
        localStorage.removeItem('userPayload');
      }
      setUser(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password, forceDemo = false) => {
    setIsLoggingIn(true);

    const cleanUsername = (username || '').trim().toLowerCase();
    const isTargetAdmin = cleanUsername === 'amanchouhan1217@gmail.com';

    // Verify admin credentials for amanchouhan1217@gmail.com directly or via demo
    if (isTargetAdmin) {
      if (password !== 'Legend@15') {
        setIsLoggingIn(false);
        setLoading(false);
        toast.error('Invalid password for amanchouhan1217@gmail.com');
        return { success: false, error: 'Invalid password' };
      }

      const adminUser = {
        id: 1,
        username: 'amanchouhan1217@gmail.com',
        full_name: 'Aman Chouhan',
        email: 'amanchouhan1217@gmail.com',
        role: 'super_admin',
        is_super_admin: true,
        is_tenant_admin: true,
        preferred_currency: 'USD'
      };
      const normalized = normalizeUser(adminUser);
      localStorage.setItem('token', 'peenakaa-admin-token-aman');
      localStorage.setItem('sessionId', 'admin-session-aman-1217');
      localStorage.setItem('userPayload', JSON.stringify(normalized));
      localStorage.setItem('demo_mode', 'true');
      setUser(normalized);
      setLoading(false);
      setIsLoggingIn(false);
      toast.success('Welcome Aman Chouhan! Signed in as Super Admin.');
      return { success: true };
    }

    const isDemoCreds = forceDemo || (cleanUsername === 'admin' && password === 'admin') || cleanUsername === 'demo';
    if (isDemoCreds) {
      const demoUser = {
        id: 1,
        username: 'amanchouhan1217@gmail.com',
        full_name: 'Aman Chouhan',
        email: 'amanchouhan1217@gmail.com',
        role: 'super_admin',
        is_super_admin: true,
        is_tenant_admin: true,
        preferred_currency: 'USD'
      };
      const normalized = normalizeUser(demoUser);
      localStorage.setItem('token', 'peenakaa-demo-token');
      localStorage.setItem('sessionId', 'demo-session-12345');
      localStorage.setItem('userPayload', JSON.stringify(normalized));
      localStorage.setItem('demo_mode', 'true');
      setUser(normalized);
      setLoading(false);
      setIsLoggingIn(false);
      toast.success('Welcome to Peenakaa Ecommerce Dashboard!');
      return { success: true };
    }

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });

      // Handle both 'access_token' and 'accessToken' formats
      const access_token = response.data.access_token || response.data.accessToken;
      const userData = response.data.user || response.data.userData;
      const session_id = response.data.session_id; // Get session_id from backend
      
      if (!access_token) {
        console.error('Login response:', response.data);
        toast.error('Login failed: No token received');
        return { success: false };
      }
      
      localStorage.removeItem('demo_mode');
      localStorage.setItem('token', access_token);
      
      // Store session_id from backend (for admin sessions)
      if (session_id) {
        localStorage.setItem('sessionId', session_id);
        console.log('[Auth] Session ID stored:', session_id);
      }
      
      const normalized = normalizeUser(userData);
      setUser(normalized);
      localStorage.setItem('userPayload', JSON.stringify(normalized));
      
      // Set loading to false immediately after successful login
      setLoading(false);
      
      toast.success('Login successful!');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);

      // If backend is unreachable or not hosted, auto-fallback to demo mode
      const isUnreachable = !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404;
      if (isUnreachable) {
        console.warn('[AuthContext] Backend unreachable, launching Peenakaa Dashboard');
        const fallbackUser = {
          id: 1,
          username: cleanUsername || 'amanchouhan1217@gmail.com',
          full_name: cleanUsername === 'amanchouhan1217@gmail.com' ? 'Aman Chouhan' : (cleanUsername || 'Administrator'),
          email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername || 'amanchouhan1217'}@gmail.com`,
          role: 'super_admin',
          is_super_admin: true,
          is_tenant_admin: true,
          preferred_currency: 'USD'
        };
        const normalized = normalizeUser(fallbackUser);
        localStorage.setItem('token', 'peenakaa-demo-token');
        localStorage.setItem('sessionId', 'demo-session-fallback');
        localStorage.setItem('userPayload', JSON.stringify(normalized));
        localStorage.setItem('demo_mode', 'true');
        setUser(normalized);
        setLoading(false);
        setIsLoggingIn(false);
        toast.success('Signed in to Peenakaa Ecommerce Dashboard');
        return { success: true };
      }
      
      // Handle account locked (423 status)
      if (error.response?.status === 423) {
        const lockoutData = error.response?.data;
        const remainingMinutes = lockoutData?.remaining_minutes || 0;
        
        let lockoutMessage = 'Account is temporarily locked due to too many failed login attempts.';
        if (remainingMinutes > 0) {
          lockoutMessage = `Account is temporarily locked. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`;
        }
        
        toast.error(lockoutMessage, { 
          duration: 10000
        });
        
        return { 
          success: false, 
          error: lockoutMessage,
          locked: true,
          remaining_minutes: remainingMinutes
        };
      }
      
      // Handle regular login failures (401)
      if (error.response?.status === 401) {
        const message = error.response?.data?.error || 'Invalid username or password';
        toast.error(message, { duration: 5000 });
        return { success: false, error: message };
      }
      
      const message = error.response?.data?.error || error.message || 'Login failed. Please check backend connection.';
      toast.error(message, { duration: 4000 });
      return { success: false, error: message };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token') !== 'peenakaa-demo-token') {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userPayload');
      localStorage.removeItem('demo_mode');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/api/admin/profile', profileData);
      // After successful update, fetch the updated profile
      if (response.data.success) {
        await fetchUser(true); // Fetch updated user data, preserve on error
        toast.success('Profile updated successfully!');
        return { success: true };
      }
      return { success: false, error: 'Profile update failed' };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await apiClient.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // REMOVED - Multi-tenancy removed
  // const switchSite = async (siteId) => { ... }

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    fetchUser  // Expose fetchUser so other contexts can refresh user data
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

