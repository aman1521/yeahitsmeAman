import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Dark mode disabled - always use light theme
  const theme = 'light';
  const isDark = false;

  useEffect(() => {
    // Always set light theme
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.removeAttribute('data-theme'); // Remove dark mode attribute
    localStorage.setItem('admin-theme', 'light');
  }, []);

  const toggleTheme = () => {
    // Disabled - do nothing
  };

  const value = {
    theme: 'light',
    toggleTheme,
    isDark: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
