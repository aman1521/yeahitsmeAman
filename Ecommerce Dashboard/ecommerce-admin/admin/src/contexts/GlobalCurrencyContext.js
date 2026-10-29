import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const GlobalCurrencyContext = createContext();

export const useGlobalCurrency = () => useContext(GlobalCurrencyContext);

export const GlobalCurrencyProvider = ({ children }) => {
  const { user, fetchUser } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyName, setCurrencyName] = useState('Indian Rupee');
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if we've loaded initial currency (prevent re-loading on user updates)
  const hasLoadedInitialCurrency = useRef(false);
  const isManualChange = useRef(false);

  // Load user's preferred currency ONLY on initial load
  useEffect(() => {
    console.log('[Global Currency] useEffect triggered, user:', user);
    console.log('[Global Currency] hasLoadedInitialCurrency:', hasLoadedInitialCurrency.current);
    console.log('[Global Currency] isManualChange:', isManualChange.current);
    
    // Skip if we've already loaded initial currency (unless it's a manual change completing)
    if (hasLoadedInitialCurrency.current && !isManualChange.current) {
      console.log('[Global Currency] ⏭️ Skipping - already loaded, not a manual change');
      return;
    }
    
    // Reset manual change flag
    isManualChange.current = false;
    
    if (user && user.preferred_currency) {
      console.log('[Global Currency] ✓ Loading preferred_currency:', user.preferred_currency);
      loadCurrency(user.preferred_currency);
      hasLoadedInitialCurrency.current = true;
    } else if (user) {
      console.log('[Global Currency] ⚠ User loaded but NO preferred_currency, defaulting to INR');
      loadCurrency('INR');
      hasLoadedInitialCurrency.current = true;
    } else {
      console.log('[Global Currency] ⏳ Waiting for user data...');
    }
  }, [user]);

  // Don't load INR by default - wait for user data
  // This prevents the "flash" of INR before user's currency loads

  const loadCurrency = async (currencyCode) => {
    try {
      setIsLoading(true);
      
      console.log('[Global Currency] Loading currency:', currencyCode);
      
      // Fetch ALL currencies with their exchange rates from database
      const response = await apiClient.get('/currencies/', {
        params: { include_inactive: true },
        suppressErrorToast: true // Suppress error toast for background requests
      });
      const currencies = response.data.currencies || [];
      
      console.log('[Global Currency] Fetched currencies from DB:', currencies.length);
      
      // Find selected currency details
      const currency = currencies.find(c => c.currency_code === currencyCode);
      
      if (currency) {
        setSelectedCurrency(currency.currency_code);
        setCurrencySymbol(currency.currency_symbol);
        setCurrencyName(currency.currency_name);
        
        console.log('[Global Currency] Currency loaded:', currency.currency_code, currency.currency_symbol);
        
        // Build exchange rates object from all currencies
        const rates = {};
        currencies.forEach(c => {
          rates[c.currency_code] = parseFloat(c.exchange_rate);
        });
        
        setExchangeRates(rates);
        console.log('[Global Currency] Exchange rates loaded from DB:', rates);
      } else {
        console.warn('[Global Currency] Currency not found:', currencyCode);
        const fallback = currencies.find(c => c.currency_code === 'INR');
        if (fallback) {
          setSelectedCurrency(fallback.currency_code);
          setCurrencySymbol(fallback.currency_symbol);
          setCurrencyName(fallback.currency_name);
        } else {
          setSelectedCurrency('INR');
          setCurrencySymbol('₹');
          setCurrencyName('Indian Rupee');
        }
        if (currencyCode !== 'INR') {
          toast.error(`Currency ${currencyCode} is unavailable. Reverting to INR.`);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('[Global Currency] Error loading currency:', error);
      setIsLoading(false);
    }
  };

  const updateGlobalCurrency = async (currencyCode) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to change currency');
        return;
      }

      console.log('[Global Currency] 🔄 Manual currency change to:', currencyCode);

      // Mark this as a manual change (prevent useEffect from reverting)
      isManualChange.current = true;

      // Step 1: Update local state IMMEDIATELY
      await loadCurrency(currencyCode);
      setSelectedCurrency(currencyCode);
      
      console.log('[Global Currency] ✓ UI updated to:', currencyCode);
      
      // Step 2: Save to backend (DON'T call fetchUser - it causes revert!)
      try {
        const updateResponse = await apiClient.put('/auth/update-currency', { currency_code: currencyCode });
        
        console.log('[Global Currency] ✓ Saved to backend:', updateResponse.data);
        
        // DON'T call fetchUser() here - it would trigger useEffect and revert!
        // The backend has saved it, and on next login it will load correctly
        
        toast.success(`✓ Currency changed to ${currencyCode}!`, {
          duration: 2000,
          icon: '💱'
        });
        
        // Reset manual change flag
        isManualChange.current = false;
        
        console.log('[Global Currency] ✅ Complete! Currency is now', currencyCode);
        
      } catch (error) {
        console.error('[Global Currency] Backend save failed:', error);
        toast.error('Currency changed but not saved. Will revert on next login.');
        isManualChange.current = false;
      }
      
    } catch (error) {
      console.error('[Global Currency] Error updating currency:', error);
      toast.error('Failed to update currency: ' + (error.response?.data?.error || error.message));
      isManualChange.current = false;
    }
  };

  // Convert amount from base currency (INR) to selected currency
  // Uses DYNAMIC rates from database (fetched in loadCurrency)
  const convertAmount = (amount, fromCurrency = 'INR') => {
    if (!amount) return 0;
    
    const numAmount = parseFloat(amount);
    
    if (fromCurrency === selectedCurrency) {
      return numAmount;
    }
    
    // Use exchangeRates from database (fetched dynamically)
    if (exchangeRates && exchangeRates[selectedCurrency]) {
      const rate = parseFloat(exchangeRates[selectedCurrency]);
      console.log(`[Conversion] ${fromCurrency} → ${selectedCurrency}: ${numAmount} × ${rate} = ${numAmount * rate}`);
      return numAmount * rate;
    }
    
    // Fallback: Use accurate rates if exchangeRates not loaded yet
    const fallbackRates = {
      'USD': 0.01127,
      'EUR': 0.01043,
      'GBP': 0.00895,
      'CAD': 0.01575,
      'AED': 0.04141,
      'AUD': 0.01732,
      'JPY': 1.7324,
      'INR': 1.0
    };
    
    const rate = fallbackRates[selectedCurrency] || 1;
    console.log(`[Conversion - Fallback] Using fallback rate for ${selectedCurrency}: ${rate}`);
    return numAmount * rate;
  };

  // Format amount with currency symbol
  const formatAmount = (amount, fromCurrency = 'INR') => {
    const converted = convertAmount(amount, fromCurrency);
    return `${currencySymbol}${converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const value = {
    selectedCurrency,
    currencySymbol,
    currencyName,
    isLoading,
    updateGlobalCurrency,
    convertAmount,
    formatAmount
  };

  return (
    <GlobalCurrencyContext.Provider value={value}>
      {children}
    </GlobalCurrencyContext.Provider>
  );
};

