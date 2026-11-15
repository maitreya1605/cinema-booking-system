// PIXORA Centralized API Configuration
// Resolves base URL from Vite environment variable (e.g. VITE_API_BASE_URL)
// Defaults to empty string for local Vite proxy / same-domain hosting.

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Clean base URL by stripping trailing slash
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Resolves an API endpoint with the configured base URL.
 * Example:
 *   apiUrl('/api/movies') -> 'https://pixora-backend.onrender.com/api/movies'
 *   apiUrl('/api/movies') -> '/api/movies' (if VITE_API_BASE_URL is not set)
 */
export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

export default apiUrl;

