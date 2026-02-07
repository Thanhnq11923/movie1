// Utility để tạo URL API từ endpoint
// Import và sử dụng trong các file thay vì hardcode URL

import { API_BASE_URL } from '../config/api';

export const createApiUrl = (endpoint: string): string => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// Helper để tạo headers với auth token
export const createAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper để fetch với auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  return fetch(createApiUrl(endpoint), {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...options.headers,
    },
  });
};
