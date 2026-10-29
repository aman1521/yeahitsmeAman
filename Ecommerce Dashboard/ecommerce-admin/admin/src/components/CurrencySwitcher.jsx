import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiChevronDown, FiCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrencies, fetchProductsForCurrency, setSelected } from '../store/currencySlice';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CurrencySwitcher() {
  const dispatch = useDispatch();
  const { currencies, selected, lastUpdatedByCurrency } = useSelector((s) => s.currency);
  const { updateGlobalCurrency } = useGlobalCurrency();
  const { theme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch currencies on mount
  useEffect(() => {
    dispatch(fetchCurrencies());
  }, [dispatch]);

  // Refresh currencies when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      dispatch(fetchCurrencies());
    }
  }, [dropdownOpen, dispatch]);

  // Fetch products for selected currency
  useEffect(() => {
    if (selected) {
      dispatch(fetchProductsForCurrency(selected));
    }
  }, [dispatch, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleCurrencyChange = async (currencyCode) => {
    // Update Redux state
    dispatch(setSelected(currencyCode));
    
    // Update GlobalCurrencyContext (updates all sales displays and saves to backend)
    await updateGlobalCurrency(currencyCode);
    
    setDropdownOpen(false);
    setSearchTerm('');
  };

  const activeCurrency = currencies.find((currency) => currency.currency_code === selected);
  const lastUpdatedLabel = lastUpdatedByCurrency[selected]
    ? new Date(lastUpdatedByCurrency[selected]).toLocaleString()
    : null;
  const currencyLabel = activeCurrency
    ? `${activeCurrency.currency_code} · ${activeCurrency.country_name || activeCurrency.countryName || ''}`.trim()
    : selected || 'Select currency';
  const currencyGlyph = activeCurrency?.symbol || (selected || '$').slice(0, 1);

  const filteredCurrencies = useMemo(() => {
    if (!currencies || currencies.length === 0) return [];
    if (!searchTerm) {
      return currencies.filter((c) => c.is_active !== false);
    }
    return currencies.filter((currency) => {
      if (currency.is_active === false) return false;
      const label = `${currency.currency_code} ${currency.country_name || currency.countryName || currency.currency_name || ''}`;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [currencies, searchTerm]);

  // Calculate position for portal
  const getPortalPosition = () => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };

  const portalPosition = dropdownOpen ? getPortalPosition() : null;

  return (
    <>
      <div className="currency-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        <button
          ref={buttonRef}
          type="button"
          className={`pill-switcher ${theme === 'dark' ? 'pill-switcher--dark' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(prev => !prev);
          }}
          aria-label="Currency switcher"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          title={lastUpdatedLabel ? `Last synced ${lastUpdatedLabel}` : undefined}
        >
          <div className="currency-switcher__chip">
            {currencyGlyph}
          </div>
          <div className="currency-switcher__details">
            <span className="currency-switcher__label">Currency</span>
            <span className="currency-switcher__value">{currencyLabel}</span>
          </div>
          <FiChevronDown 
            size={16} 
            style={{ 
              color: theme === 'dark' ? '#cbd5e1' : '#64748b',
              transition: 'transform 0.2s ease',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} 
          />
          {lastUpdatedLabel && <span className="currency-switcher__status-dot" aria-hidden="true" />}
        </button>
      </div>

      {dropdownOpen && portalPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${portalPosition.top}px`,
            left: `${portalPosition.left}px`,
            width: '300px',
            maxWidth: '90vw',
            background: '#ffffff',
            border: '1px solid #FF8C00',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 999999,
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            pointerEvents: 'auto',
            margin: 0,
            padding: 0
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ 
            padding: '8px', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            background: '#ffffff'
          }}>
            <FiSearch size={12} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '6px',
                padding: '5px 10px',
                outline: 'none',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '10px',
                width: '100%',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF8C00';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            maxHeight: '280px', 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            padding: '6px',
            background: '#ffffff'
          }}>
            {filteredCurrencies && filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.currency_code}
                  type="button"
                  onClick={() => handleCurrencyChange(currency.currency_code)}
                  title={`${currency.country_name || currency.countryName || currency.currency_name || currency.currency_code} (${currency.currency_code})`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: currency.currency_code === selected ? 'rgba(255, 140, 0, 0.05)' : 'transparent',
                    color: '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '2px',
                    fontSize: '10px',
                    minHeight: '36px',
                    boxSizing: 'border-box',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currency.currency_code !== selected) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currency.currency_code !== selected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#FF8C00', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      {currency.symbol || currency.currency_code?.slice(0, 1) || '$'}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currency.country_name || currency.countryName || currency.currency_name || currency.currency_code}
                      </span>
                      <span style={{ fontSize: '9px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currency.currency_code}
                      </span>
                    </div>
                  </div>
                  {currency.currency_code === selected && (
                    <FiCheck size={14} style={{ color: '#22c55e', flexShrink: 0, marginLeft: '6px' }} />
                  )}
                </button>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>
                {currencies.length === 0 ? 'Loading currencies...' : 'No currencies match your search'}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
