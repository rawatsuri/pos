import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth';
import { networkService } from './network';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check network status
    if (!networkService.isOnline()) {
      return Promise.reject(new Error('No internet connection'));
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (!networkService.isOnline()) {
        // Don't show error toast for offline state
        return Promise.reject(new Error('Offline'));
      }
      toast.error('Network error. Please check your connection.');
    } else if (error.response.status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please login again.');
    } else if (error.response.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else {
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;