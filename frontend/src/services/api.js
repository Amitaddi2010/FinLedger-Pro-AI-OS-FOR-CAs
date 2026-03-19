import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Extremely important for JWT httpOnly cookies
  timeout: 30000 // 30 seconds timeout to prevent hanging UI
});

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return the full error so components can check error.response.status (e.g., 401 vs 500)
    return Promise.reject(error);
  }
);

export default api;
