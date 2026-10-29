/**
 * Date and time utility functions for consistent formatting across the admin panel
 */

/**
 * Format a date/timestamp for display in IST timezone
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateInput, options = {}) => {
  if (!dateInput) return 'N/A';
  
  // If the backend already formatted it with IST, return as is
  if (typeof dateInput === 'string' && dateInput.includes('IST')) {
    return dateInput;
  }
  
  let date;
  try {
    // Handle ISO format with timezone
    if (typeof dateInput === 'string') {
      // If it's an ISO string, parse it directly
      if (dateInput.includes('T')) {
        // ISO format string - ensure it has timezone info
        if (dateInput.includes('Z')) {
          // UTC timezone (Z suffix)
          date = new Date(dateInput);
        } else if (dateInput.includes('+') || dateInput.includes('-')) {
          // Has timezone offset (+05:30 or +00:00)
          const timezoneMatch = dateInput.match(/[+-]\d{2}:\d{2}$/);
          if (timezoneMatch) {
            // Has timezone, parse directly
            date = new Date(dateInput);
          } else {
            // No timezone suffix - assume UTC and add +00:00
            date = new Date(dateInput.endsWith('Z') ? dateInput : dateInput + 'Z');
          }
        } else {
          // ISO format without timezone - assume UTC (backend stores as UTC)
          date = new Date(dateInput + (dateInput.includes('Z') ? '' : 'Z'));
        }
      } else if (dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
        // MySQL datetime format: YYYY-MM-DD HH:MM:SS (assume UTC from database)
        date = new Date(dateInput.replace(' ', 'T') + 'Z');
      } else {
        // Try parsing as-is (might be a Date string)
        date = new Date(dateInput);
        // If parsing failed or resulted in invalid date, try adding UTC
        if (isNaN(date.getTime()) && typeof dateInput === 'string' && dateInput.length > 10) {
          date = new Date(dateInput + 'Z');
        }
      }
    } else {
      date = new Date(dateInput);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateInput);
      return 'N/A';
    }
  } catch (e) {
    console.error('Error parsing date:', dateInput, e);
    return 'N/A';
  }
  
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const formatted = date.toLocaleString('en-IN', formatOptions);
    return formatted + ' IST';
  } catch (e) {
    console.error('Error formatting date:', dateInput, e);
    return 'N/A';
  }
};

/**
 * Format a date for display (date only, no time)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a time for display (time only, no date)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' IST';
};

/**
 * Get current date/time in IST for form inputs
 * @returns {string} ISO string adjusted for IST
 */
export const getCurrentISTDateTime = () => {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().slice(0, 16); // Format for datetime-local input
};

/**
 * Convert UTC timestamp to IST for display
 * @param {string|Date} utcDateTime - UTC date/time
 * @returns {string} Formatted IST date/time
 */
export const convertUTCToIST = (utcDateTime) => {
  if (!utcDateTime) return 'N/A';
  
  const date = new Date(utcDateTime);
  
  if (isNaN(date.getTime())) return 'N/A';
  
  return formatDateTime(date);
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = new Date(dateInput);
  const now = new Date();
  
  if (isNaN(date.getTime())) return 'N/A';
  
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Format date range for display
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
};
