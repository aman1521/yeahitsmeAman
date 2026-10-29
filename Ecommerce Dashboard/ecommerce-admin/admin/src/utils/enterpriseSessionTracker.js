import resolveApiBaseUrl from './resolveApiBaseUrl';

/**
 * ENTERPRISE SESSION TRACKING SYSTEM
 * Tracks: Sessions, Page Views, Clicks, Scrolls, Forms, Errors, Device Info
 * Works for both logged-in users and anonymous guests
 */

class EnterpriseSessionTracker {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.userId = null;
        this.deviceFingerprint = null;
        this.pageStartTime = Date.now();
        this.apiBaseUrl = `${resolveApiBaseUrl()}/api`;
        this.isInitialized = false;
        this.clickCount = 0;
        this.maxScrollDepth = 0;
        this.currentPage = window.location.pathname;
        
        // Queue for offline tracking
        this.eventQueue = [];
        this.isOnline = navigator.onLine;
    }

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('enterprise_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('enterprise_session_id', sessionId);
            console.log('[EnterpriseTracker] New session created:', sessionId);
        }
        return sessionId;
    }

    setUserId(userId) {
        this.userId = userId;
        console.log('[EnterpriseTracker] User ID set:', userId);
        // Update session with user ID
        this.trackSession(window.location.pathname);
    }

    // ========================================================================
    // DEVICE FINGERPRINTING
    // ========================================================================

    async generateDeviceFingerprint() {
        const components = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            colorDepth: window.screen.colorDepth,
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            vendor: navigator.vendor,
            plugins: this.getPluginsList(),
            canvas: await this.getCanvasFingerprint()
        };

        // Create hash from components
        const fingerprintString = JSON.stringify(components);
        this.deviceFingerprint = await this.simpleHash(fingerprintString);
        
        return {
            fingerprint: this.deviceFingerprint,
            components: components
        };
    }

    getPluginsList() {
        if (!navigator.plugins) return [];
        return Array.from(navigator.plugins).map(p => p.name);
    }

    async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const text = 'EnterpriseTracking123!';
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText(text, 2, 2);
            const dataURL = canvas.toDataURL();
            return await this.simpleHash(dataURL);
        } catch (e) {
            return 'unavailable';
        }
    }

    async simpleHash(str) {
        try {
            const cryptoObj = window.crypto || window.msCrypto;
            if (window.isSecureContext && cryptoObj?.subtle?.digest) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
                const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {
            console.warn('[EnterpriseTracker] Native digest unavailable, falling back to lightweight hash.', e);
        }

        // Fallback non-cryptographic hash for non-secure contexts
        let hash = 0;
        if (str.length === 0) return 'fallback_hash_0';
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return `fallback_${Math.abs(hash).toString(16)}`;
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'Tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Unknown';
    }

    getOSName() {
        const ua = navigator.userAgent;
        if (ua.includes('Win')) return 'Windows';
        if (ua.includes('Mac')) return 'MacOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }

    // ========================================================================
    // CORE TRACKING METHODS
    // ========================================================================

    async trackSession(pageUrl) {
        const deviceInfo = await this.generateDeviceFingerprint();
        
        const sessionData = {
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: pageUrl || window.location.pathname,
            referrer: document.referrer || '',
            device_type: this.getDeviceType(),
            browser: this.getBrowserName(),
            os: this.getOSName(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            device_fingerprint: deviceInfo.fingerprint
        };

        return await this.sendToBackend('/analytics/track-session', sessionData);
    }

    async trackPageView(pageUrl, pageTitle) {
        const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);

        const pageData = {
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: pageUrl || window.location.pathname,
            page_title: pageTitle || document.title,
            time_on_page: timeOnPage,
            scroll_depth: this.maxScrollDepth
        };

        await this.sendToBackend('/analytics/track-page-view', pageData);
        
        // Reset for next page
        this.pageStartTime = Date.now();
        this.maxScrollDepth = 0;
    }

    async trackClick(event) {
        this.clickCount++;
        
        const element = event.target;
        const clickData = {
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: window.location.pathname,
            element_type: element.tagName.toLowerCase(),
            element_id: element.id || null,
            element_class: element.className || null,
            element_text: element.textContent?.substring(0, 200) || null,
            click_x: event.clientX,
            click_y: event.clientY
        };

        console.log('[EnterpriseTracker] Click tracked:', {
            element: element.tagName,
            id: element.id,
            page: window.location.pathname,
            session: this.sessionId
        });

        await this.sendToBackend('/analytics/track-click', clickData);
    }

    async trackAction(actionType, actionDetails = {}) {
        const actionData = {
            session_id: this.sessionId,
            user_id: this.userId,
            action_type: actionType,
            action_details: JSON.stringify(actionDetails),
            page_url: window.location.pathname
        };

        await this.sendToBackend('/analytics/track-action', actionData);
        console.log('[EnterpriseTracker] Action tracked:', actionType);
    }

    async trackError(error, errorInfo = {}) {
        const errorData = {
            session_id: this.sessionId,
            user_id: this.userId,
            error_type: error.name || 'Error',
            error_message: error.message || String(error),
            error_stack: error.stack || '',
            page_url: window.location.pathname,
            ...errorInfo
        };

        await this.sendToBackend('/analytics/track-error', errorData);
        console.error('[EnterpriseTracker] Error tracked:', error);
    }

    trackScroll() {
        const scrollDepth = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollDepth / docHeight) * 100);
        
        if (scrollPercentage > this.maxScrollDepth) {
            this.maxScrollDepth = scrollPercentage;
        }
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Track all clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        }, true);

        // Track scrolling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 100);
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError(e.error || new Error(e.message), {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(new Error('Unhandled Promise Rejection'), {
                reason: String(e.reason)
            });
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackPageView(this.currentPage, document.title);
            this.flushQueue();
        });

        // Track online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackAction('page_hidden', { page: window.location.pathname });
            } else {
                this.trackAction('page_visible', { page: window.location.pathname });
            }
        });

        console.log('[EnterpriseTracker] Event listeners setup complete');
    }

    // ========================================================================
    // BACKEND COMMUNICATION
    // ========================================================================

    async sendToBackend(endpoint, data) {
        try {
            if (!this.isOnline) {
                this.eventQueue.push({ endpoint, data });
                return;
            }

            // Get auth token if available
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                keepalive: true
            });

            if (response.ok) {
                const result = await response.json();
                console.log('[EnterpriseTracker] Backend response:', result);
                return result;
            } else {
                console.error('[EnterpriseTracker] Backend error:', response.status);
                this.eventQueue.push({ endpoint, data });
            }
        } catch (error) {
            console.error('[EnterpriseTracker] Network error:', error);
            this.eventQueue.push({ endpoint, data });
        }
    }

    async flushQueue() {
        if (!this.isOnline || this.eventQueue.length === 0) return;

        const queue = [...this.eventQueue];
        this.eventQueue = [];

        for (const item of queue) {
            await this.sendToBackend(item.endpoint, item.data);
        }

        console.log('[EnterpriseTracker] Queue flushed:', queue.length, 'events');
    }

    // ========================================================================
    // PAGE NAVIGATION
    // ========================================================================

    onPageChange(location) {
        const newPage = location.pathname;
        
        if (this.currentPage !== newPage) {
            console.log('[EnterpriseTracker] Page changed:', this.currentPage, '→', newPage);
            
            // Track old page view
            if (this.currentPage) {
                this.trackPageView(this.currentPage, document.title);
            }
            
            // Update current page
            this.currentPage = newPage;
            
            // Track new session/page
            this.trackSession(newPage);
            
            // Track page visit action in user_actions table
            // Format: "PAGE_VISIT" or extract route name from path
            const routeName = newPage.replace(/^\//, '').replace(/\//g, '_').toUpperCase() || 'DASHBOARD';
            const actionType = `PAGE_VISIT_${routeName}`;
            const pageTitle = document.title || newPage;
            this.trackAction(actionType, { 
                page: newPage,
                page_title: pageTitle,
                route: routeName.toLowerCase()
            });
            
            console.log('[EnterpriseTracker] Page visit tracked:', actionType, 'for', newPage);
        }
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    async init() {
        if (this.isInitialized) return;

        console.log('[EnterpriseTracker] Initializing...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Track initial session
        await this.trackSession(window.location.pathname);
        
        // Flush queue periodically
        setInterval(() => this.flushQueue(), 30000); // Every 30 seconds
        
        this.isInitialized = true;
        console.log('[EnterpriseTracker] ✓ Fully initialized');
        console.log('[EnterpriseTracker] Session ID:', this.sessionId);
        console.log('[EnterpriseTracker] Device:', this.getDeviceType(), '/', this.getBrowserName(), '/', this.getOSName());
    }
}

// Create singleton instance
const enterpriseTracker = new EnterpriseSessionTracker();

export default enterpriseTracker;

