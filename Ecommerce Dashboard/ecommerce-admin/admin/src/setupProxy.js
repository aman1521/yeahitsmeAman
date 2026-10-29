const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const apiTarget =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://127.0.0.1:8800';

  // Proxy ALL /api requests to Flask backend at port 8800
  // This keeps the /api prefix in the path when forwarding
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      // Keep /api prefix - don't strip it when forwarding
      pathRewrite: function (path, req) {
        // path already has /api stripped by the middleware
        // Add it back so backend receives /api/auth/login
        return '/api' + path;
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('[PROXY] Forwarding:', req.method, req.originalUrl, '→', apiTarget + req.originalUrl);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[PROXY] Response:', proxyRes.statusCode, 'for', req.originalUrl);
      },
      onError: (err, req, res) => {
        console.log('[PROXY ERROR]', err.message);
      }
    })
  );
  
  const currencyTarget =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_EXCHANGE_API_URL ||
    process.env.REACT_APP_SECONDARY_API_URL ||
    'http://127.0.0.1:4000';

  app.use(
    '/currency-api',
    createProxyMiddleware({
      target: currencyTarget,
      changeOrigin: true,
    })
  );
};
