import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

const SearchBar = memo(({
  value,
  onChange,
  placeholder = 'Search products by name or SKU...',
  onClear,
  style = {},
  inputProps = {},
  debounceMs = 300,
  isLoading = false
}) => {
  // Local state for the input value to prevent cursor jumping
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const previousValueRef = useRef(value);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync with external value changes (but not during typing)
  useEffect(() => {
    // NEVER sync if the input is currently focused - user is typing/deleting
    if (isFocused) {
      return;
    }

    // Only update if the value actually changed
    if (previousValueRef.current !== value) {
      setLocalValue(value || '');
      previousValueRef.current = value;
    } else {
      // Update ref to track current state
      previousValueRef.current = value;
    }
  }, [value, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    // Update local state immediately - this prevents cursor jumping
    setLocalValue(newValue);
    
    // NO automatic onChange - user must press Enter to search
    // Clear any pending debounce timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // NO automatic search on blur - user must press Enter
    previousValueRef.current = localValue;
  }, [localValue]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    setIsFocused(false);
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    if (onClear) {
      onClear();
    }
    // Also trigger onChange with empty value immediately to show all results
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' }
      };
      onChange(syntheticEvent);
    }
    previousValueRef.current = '';
    
    // Focus the input after clearing
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, [onClear, onChange]);

  const handleKeyDown = useCallback((e) => {
    // Clear search on Escape key
    if (e.key === 'Escape' && localValue) {
      handleClear();
    }
    // Submit search on Enter - trigger onChange immediately
    if (e.key === 'Enter') {
      e.preventDefault();
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // Trigger onChange with current value
      if (onChange) {
        const syntheticEvent = {
          target: { value: localValue },
          currentTarget: { value: localValue }
        };
        onChange(syntheticEvent);
      }
      // Blur the input
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [localValue, handleClear, onChange]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const showClear = Boolean(localValue?.length);
  const hasValue = Boolean(localValue?.trim());

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        marginBottom: '10px',
        ...style
      }}
    >
      {/* Main Search Container */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff',
          border: `1px solid ${isFocused ? '#3b82f6' : '#e2e8f0'}`,
          borderRadius: '6px',
          padding: '8px 14px',
          transition: 'all 0.2s ease',
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.1)'
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
          ...(hasValue && !isFocused && {
            borderColor: '#cbd5e1',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          })
        }}
      >
        {/* Search Icon */}
        <FiSearch 
          style={{
            fontSize: '14px',
            color: isFocused ? '#3b82f6' : '#94a3b8',
            marginRight: '10px',
            flexShrink: 0,
            transition: 'color 0.2s'
          }}
        />
        
        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder.includes('Enter') ? placeholder : `${placeholder} (Press Enter to search)`}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '11px',
            color: '#1e293b',
            background: 'transparent',
            padding: 0,
            fontWeight: '400',
            lineHeight: '1.5',
            ...inputProps.style
          }}
          {...(Object.fromEntries(
            Object.entries(inputProps).filter(([key]) => key !== 'style')
          ))}
        />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            marginLeft: '10px',
            marginRight: showClear ? '8px' : '0',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <FiLoader 
              style={{
                fontSize: '15px',
                color: '#3b82f6',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
        )}
        
        {/* Clear Button */}
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#94a3b8',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <FiX style={{ fontSize: '14px' }} />
          </button>
        )}
      </div>
      
      {/* Search Status Indicator */}
      {hasValue && (
        <div style={{
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          paddingLeft: '4px',
          fontSize: '10px',
          color: '#64748b',
          lineHeight: '1.4'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLoading ? '#f59e0b' : '#10b981',
            flexShrink: 0
          }} />
          <span>
            {isLoading ? (
              <>Searching for: <strong style={{ color: '#1e293b', fontWeight: '600' }}>"{localValue}"</strong></>
            ) : (
              <>Showing results for: <strong style={{ color: '#1e293b', fontWeight: '600' }}>"{localValue}"</strong></>
            )}
          </span>
        </div>
      )}
      
      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
