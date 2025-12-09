// API configuration
// Uses relative paths - nginx proxies /api/* to the backend server

export const API_BASE_URL = '';

export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath;
};
