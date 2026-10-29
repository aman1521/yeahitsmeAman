/**
 * REAL-TIME VISITOR SESSION TRACKING
 * Add this script to your customer-facing website (storefront)
 * Tracks every visitor for accurate conversion rate calculation
 */

import resolveApiBaseUrl from "../src/utils/resolveApiBaseUrl";

(function () {
    'use strict';

    // Configuration
    const getApiHost = () => {
        const normalize = (url) => url.replace(/\/+$/, '');

        const globalOverride =
            resolveApiBaseUrl() ||
            window.APP_API_BASE_URL ||
            window.REACT_APP_API_BASE_URL ||
            window.__APP_API_URL ||
            window.__ENV_API_URL;
        if (globalOverride && typeof globalOverride === 'string') {
            return normalize(globalOverride);
        }

        if (window.location && window.location.origin) {
            let origin = normalize(window.location.origin);
            try {
                const parsed = new URL(origin);
                if (parsed.port === '4600') {
                    parsed.port = '8800';
                    origin = parsed.origin;
                }
            } catch (e) {
                // ignore parsing errors, fall back to normalized origin
            }
            return origin;
        }

        return 'http://127.0.0.1:8800';
    };

    const API_BASE_URL = `${getApiHost()}/api`;  // Direct backend URL

    // Generate or retrieve session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('visitor_session_id', sessionId);
        }
        return sessionId;
    }

    // Get user ID if logged in (check localStorage/cookies)
    function getUserId() {
        // Modify this based on how you store user info
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || null;
    }

    // Track visitor session
    function trackSession() {
        const sessionId = getSessionId();
        const userId = getUserId();

        const sessionData = {
            session_id: sessionId,
            user_id: userId,
            page_url: window.location.pathname,
            referrer: document.referrer || ''
        };

        // Send to backend
        fetch(`${API_BASE_URL}/analytics/track-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        }).then(response => {
            if (response.ok) {
                console.log('[Analytics] Session tracked:', sessionId);
            }
        }).catch(err => {
            console.error('[Analytics] Tracking failed:', err);
        });
    }

    // Track page view with time on page
    let pageStartTime = Date.now();

    function trackPageView() {
        const sessionId = getSessionId();
        const timeOnPage = Math.floor((Date.now() - pageStartTime) / 1000);  // Seconds

        const pageData = {
            session_id: sessionId,
            page_url: window.location.pathname,
            page_title: document.title,
            time_on_page: timeOnPage
        };

        // Send to backend
        fetch(`${API_BASE_URL}/analytics/track-page-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pageData),
            keepalive: true  // Ensure request completes even if page unloads
        }).catch(err => {
            console.error('[Analytics] Page view tracking failed:', err);
        });
    }

    // Initialize tracking when page loads
    window.addEventListener('load', function () {
        trackSession();
        pageStartTime = Date.now();
    });

    // Track page view when visitor leaves page
    window.addEventListener('beforeunload', function () {
        trackPageView();
    });

    // Track page view when navigating within SPA
    window.addEventListener('popstate', function () {
        trackPageView();
        pageStartTime = Date.now();
        trackSession();
    });

    // For React Router navigation (if using React)
    if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function () {
            trackPageView();
            originalPushState.apply(window.history, arguments);
            pageStartTime = Date.now();
            trackSession();
        };
    }

    console.log('[Analytics] Visitor tracking initialized');
})();

