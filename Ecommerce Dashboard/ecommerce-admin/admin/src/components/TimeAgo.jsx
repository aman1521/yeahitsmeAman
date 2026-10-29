import React, { useState, useEffect } from 'react';

/**
 * Real-time time ago display component
 * Updates automatically every 30 seconds to show current relative time
 */
const TimeAgo = ({ dateString, className = '', style = {} }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!dateString) {
      setTimeAgo('');
      return;
    }

    const calculateTime = () => {
      try {
        // Parse date string - handle both ISO format and MySQL datetime format
        let date;
        if (typeof dateString === 'string') {
          // If it's a string without timezone, assume UTC
          if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z') && !dateString.includes('-', 10)) {
            date = new Date(dateString + 'Z'); // Add Z for UTC
          } else if (!dateString.includes('T')) {
            // MySQL datetime format: YYYY-MM-DD HH:MM:SS
            date = new Date(dateString.replace(' ', 'T') + 'Z'); // Convert to ISO and add UTC
          } else {
            date = new Date(dateString);
          }
        } else {
          date = new Date(dateString);
        }
        
        const now = new Date();
        
        // Handle invalid dates
        if (isNaN(date.getTime())) {
          console.error('[TimeAgo] Invalid date:', dateString);
          setTimeAgo('');
          return;
        }
        
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        
        if (diffSecs < 60) {
          setTimeAgo('Just now');
        } else if (diffMins < 60) {
          setTimeAgo(`${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
        } else if (diffHours < 24) {
          setTimeAgo(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
        } else if (diffDays < 7) {
          setTimeAgo(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
        } else if (diffWeeks < 4) {
          setTimeAgo(`${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`);
        } else if (diffMonths < 12) {
          setTimeAgo(`${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`);
        } else {
          // For very old notifications, show the actual date
          setTimeAgo(date.toLocaleDateString());
        }
      } catch (error) {
        console.error('Error calculating time ago:', error);
        setTimeAgo('');
      }
    };

    // Calculate immediately
    calculateTime();

    // Update every 10 seconds for more responsive real-time display
    const interval = setInterval(calculateTime, 10000);

    return () => clearInterval(interval);
  }, [dateString]);

  if (!timeAgo) return null;

  return (
    <span className={className} style={style}>
      {timeAgo}
    </span>
  );
};

export default TimeAgo;

