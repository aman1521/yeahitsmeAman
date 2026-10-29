const normalize = (url) => url.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return normalize(envUrl.trim());
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = normalize(window.location.origin);
    if (origin.includes(':4600')) {
      return origin.replace(':4600', ':8800');
    }
    return origin;
  }

  return 'http://127.0.0.1:8800';
};

export default resolveApiBaseUrl;

