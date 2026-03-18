import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true // Extremely important for JWT httpOnly cookies
});

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data?.message || error.message);
  }
);

export default api;
