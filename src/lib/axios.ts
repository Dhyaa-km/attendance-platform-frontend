import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Base Axios client for NASA Space Apps Algiers Attendance Platform.
 * Configured with `withCredentials: true` for future HTTP-only cookie authentication.
 * No sensitive JWT tokens are stored or read from localStorage.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Response interceptor for unified response and error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized handling will be intercepted here once backend endpoints exist
    return Promise.reject(error);
  }
);
