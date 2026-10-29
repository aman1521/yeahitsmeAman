import axios from 'axios';
import resolveApiBaseUrl from './resolveApiBaseUrl';

const LEGACY_PORT =
  process.env.REACT_APP_API_LEGACY_URL ||
  process.env.REACT_APP_API_FALLBACK_URL ||
  'http://127.0.0.1:5000';

const CURRENT_PORT = resolveApiBaseUrl();

if (!axios.__legacyPortAdapterInstalled) {
  axios.interceptors.request.use((config) => {
    if (typeof config.url === 'string' && config.url.startsWith(LEGACY_PORT)) {
      config.url = CURRENT_PORT + config.url.slice(LEGACY_PORT.length);
    }
    return config;
  });

  axios.__legacyPortAdapterInstalled = true;
}

