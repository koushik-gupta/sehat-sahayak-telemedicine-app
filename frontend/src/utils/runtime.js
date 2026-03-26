const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');
const WS_BASE_URL = trimTrailingSlash(import.meta.env.VITE_WS_BASE_URL || '');

const isRelativeBackendPath = (value) =>
  typeof value === 'string' && (value.startsWith('/api') || value.startsWith('/uploads'));

const withApiBaseUrl = (value) => {
  if (!API_BASE_URL || !isRelativeBackendPath(value)) {
    return value;
  }

  return `${API_BASE_URL}${value}`;
};

export const installFetchBaseUrl = () => {
  if (!API_BASE_URL || typeof window === 'undefined' || window.__SWASTHYASETU_FETCH_PATCHED__) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const nextInit = init?.credentials ? init : { ...init, credentials: 'include' };

    if (typeof input === 'string') {
      return originalFetch(withApiBaseUrl(input), nextInit);
    }

    if (input instanceof URL) {
      return originalFetch(new URL(withApiBaseUrl(input.toString())), nextInit);
    }

    return originalFetch(input, nextInit);
  };

  window.__SWASTHYASETU_FETCH_PATCHED__ = true;
};

export const resolveBackendAssetUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  if (value.startsWith('/uploads') && API_BASE_URL) {
    return `${API_BASE_URL}${value}`;
  }

  return value;
};

export const buildWebSocketUrl = (path = '/signal') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (WS_BASE_URL) {
    return `${WS_BASE_URL}${normalizedPath}`;
  }

  if (API_BASE_URL) {
    const derivedWsBaseUrl = API_BASE_URL.replace(/^http/i, 'ws');
    return `${derivedWsBaseUrl}${normalizedPath}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${normalizedPath}`;
};
