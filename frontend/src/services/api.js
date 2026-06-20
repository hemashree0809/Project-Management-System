import axios from 'axios';

// Dynamically resolve API URL to support desktop, mobile local testing, and production
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const hostname = window.location.hostname;
  
  // Detect if running locally (localhost, 127.0.0.1, or local private IP blocks)
  const isLocal = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') || 
    hostname.startsWith('172.');

  if (isLocal) {
    const backendPort = '5001'; // Matches the backend PORT in .env
    return `${window.location.protocol}//${hostname}:${backendPort}/api`;
  }

  return 'https://project-management-system-sl4i.onrender.com/api';
};

// Create Axios client targeting our Express backend
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds (prevents mobile browsers from dropping requests prematurely during server cold start)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer token to all outgoing requests and watch latency
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set a timer to trigger an API latency warning if the request hangs (e.g. Render free tier cold start)
    config.latencyTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('api-latency-warning', { detail: { isSlow: true } }));
    }, 3500);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response logic and catch token expiry
api.interceptors.response.use(
  (response) => {
    // Clear latency warning since request succeeded
    if (response.config && response.config.latencyTimer) {
      clearTimeout(response.config.latencyTimer);
      window.dispatchEvent(new CustomEvent('api-latency-warning', { detail: { isSlow: false } }));
    }
    return response;
  },
  (error) => {
    // Clear latency warning
    if (error.config && error.config.latencyTimer) {
      clearTimeout(error.config.latencyTimer);
      window.dispatchEvent(new CustomEvent('api-latency-warning', { detail: { isSlow: false } }));
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Trigger a window event to let context update state
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
