/**
 * Enhanced Session Tracker for Admin Panel
 * Automatically tracks user interactions, page views, clicks, and time spent
 */

class SessionTracker {
  constructor() {
    this.sessionId = null;
    this.userId = null;
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.pageViewCount = 0;
    this.clickCount = 0;
    this.isActive = true;
    
    this.init();
  }
  
  init() {
    // Get session info from localStorage or create new
    this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
    localStorage.setItem('sessionId', this.sessionId);
    
    // Get user ID from token if available
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const identity = payload.sub || payload.user_id || payload.identity;
        // Extract integer ID from formats like 'admin_1' or 'user_1' or just integer
        if (identity) {
          if (typeof identity === 'string' && identity.includes('_')) {
            // Extract number from 'admin_1' or 'user_1'
            const parts = identity.split('_');
            if (parts.length > 1 && !isNaN(parts[1])) {
              this.userId = parseInt(parts[1], 10);
            } else {
              this.userId = identity;
            }
          } else if (!isNaN(identity)) {
            this.userId = parseInt(identity, 10);
          } else {
            this.userId = identity;
          }
        }
      } catch (e) {
        console.warn('Could not parse user ID from token:', e);
      }
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Track initial page view
    this.trackPageView();
    
    // Send session updates every 30 seconds
    this.startSessionUpdates();
    
    console.log(`[SessionTracker] Initialized - Session: ${this.sessionId}, User: ${this.userId}`);
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
        this.sendSessionUpdate();
      } else {
        this.isActive = true;
        this.lastActivityTime = Date.now();
      }
    });
    
    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.sendSessionUpdate();
    });
    
    // Track route changes (for SPA)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(() => window.sessionTracker?.trackPageView(), 100);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(() => window.sessionTracker?.trackPageView(), 100);
    };
    
    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 100);
    });
  }
  
  trackPageView() {
    this.pageViewCount++;
    this.lastActivityTime = Date.now();
    
    const data = {
      session_id: this.sessionId,
      user_id: this.userId,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAPI('/api/analytics/track-page-view', data);
    console.log(`[SessionTracker] Page view tracked: ${window.location.pathname}`);
  }
  
  trackClick(event) {
    this.clickCount++;
    this.lastActivityTime = Date.now();
    
    const element = event.target;
    const data = {
      session_id: this.sessionId,
      user_id: this.userId,
      element_type: element.tagName.toLowerCase(),
      element_id: element.id || null,
      element_class: element.className || null,
      element_text: element.textContent?.substring(0, 100) || null,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAPI('/api/analytics/track-click', data);
    console.log(`[SessionTracker] Click tracked: ${element.tagName} ${element.id || element.className}`);
  }
  
  sendSessionUpdate() {
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    
    const data = {
      session_id: this.sessionId,
      user_id: this.userId,
      time_spent: timeSpent,
      is_active: this.isActive,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAPI('/api/analytics/track-session', data);
    console.log(`[SessionTracker] Session updated - Time: ${timeSpent}s, Active: ${this.isActive}`);
  }
  
  startSessionUpdates() {
    // Send session updates every 30 seconds, but ONLY if:
    // 1. User is active (has interacted recently)
    // 2. Tab is visible (not hidden)
    // This applies to both logged-in users AND guest sessions
    setInterval(() => {
      const isTabVisible = !document.hidden;
      const timeSinceActivity = Date.now() - this.lastActivityTime;
      const isRecentlyActive = timeSinceActivity < 120000; // Active in last 2 minutes
      
      // Send updates if tab is visible AND user is recently active
      // Works for both logged-in users (userId) and guest sessions (no userId)
      if (this.isActive && isTabVisible && isRecentlyActive) {
        this.sendSessionUpdate();
      }
    }, 30000);
    
    // Update activity status every 5 seconds
    setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - this.lastActivityTime;
      
      // Consider inactive after 2 minutes of no activity
      if (timeSinceActivity > 120000) {
        this.isActive = false;
      }
    }, 5000);
  }
  
  async sendToAPI(endpoint, data) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        console.warn(`[SessionTracker] Failed to send to ${endpoint}:`, response.status);
      }
    } catch (error) {
      console.warn(`[SessionTracker] Error sending to ${endpoint}:`, error);
    }
  }
  
  // Public methods for manual tracking
  trackCustomEvent(eventType, details = {}) {
    const data = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: eventType,
      details: details,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAPI('/api/analytics/track-custom-event', data);
    console.log(`[SessionTracker] Custom event tracked: ${eventType}`, details);
  }
  
  updateUserId(userId) {
    this.userId = userId;
    console.log(`[SessionTracker] User ID updated: ${userId}`);
  }
}

// Initialize session tracker when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.sessionTracker = new SessionTracker();
    });
  } else {
    window.sessionTracker = new SessionTracker();
  }
}

export default SessionTracker;
