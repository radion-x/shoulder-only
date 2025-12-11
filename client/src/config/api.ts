// API configuration
// Direct API calls to backend domain (set via VITE_SERVER_BASE_URL at build time)

export const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Fetch wrapper with credentials for cross-origin requests
export const fetchWithCredentials = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // CRITICAL: Sends cookies cross-origin
  });
};
