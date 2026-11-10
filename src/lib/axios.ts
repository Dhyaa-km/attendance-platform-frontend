import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string | undefined> }).env : undefined;
const API_BASE_URL = (viteEnv?.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

let currentAccessToken: string | null = null;
let currentCsrfToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export const getStoredAccessToken = (): string | null => currentAccessToken;
export const getStoredCsrfToken = (): string | null => currentCsrfToken;

export const setAuthSessionTokens = ({
  accessToken,
  csrfToken,
}: {
  accessToken?: string | null;
  csrfToken?: string | null;
}): void => {
  currentAccessToken = accessToken ?? null;
  currentCsrfToken = csrfToken ?? null;
};

export const clearAuthSessionTokens = (): void => {
  currentAccessToken = null;
  currentCsrfToken = null;
};

export const isAuthEndpoint = (url?: string | null): boolean => {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.replace(/^https?:\/\/[^/]+/i, '').replace(/^\//, '');
  return [
    'api/v1/auth/login',
    'api/v1/auth/csrf',
    'api/v1/auth/refresh',
    'api/v1/auth/logout',
  ].includes(normalizedUrl);
};

/**
 * Base Axios client for the attendance platform.
 * It keeps tokens in memory only and uses credentialed requests for the refresh cookie.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const requestUrl = config.url ?? '';
  const headers = config.headers ?? {};

  if (!isAuthEndpoint(requestUrl) && currentAccessToken) {
    config.headers = {
      ...headers,
      Authorization: `Bearer ${currentAccessToken}`,
    } as typeof headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as (AxiosRequestConfig & { __isRetry?: boolean }) | undefined;
    const responseStatus = error?.response?.status;
    const requestUrl = config?.url ?? '';

    if (!config) {
      return Promise.reject(error);
    }

    if (responseStatus !== 401 || isAuthEndpoint(requestUrl) || config.__isRetry === true) {
      return Promise.reject(error);
    }

    if (refreshInFlight) {
      await refreshInFlight;
      const retryConfig = {
        ...config,
        __isRetry: true,
        headers: {
          ...(config.headers ?? {}),
          Authorization: currentAccessToken ? `Bearer ${currentAccessToken}` : undefined,
        } as typeof config.headers,
      };
      return apiClient.request(retryConfig);
    }

    refreshInFlight = (async () => {
      try {
        const { authService } = await import('../features/auth/services/authService.ts');
        return await authService.refreshSession();
      } catch {
        return false;
      }
    })();

    try {
      const refreshed = await refreshInFlight;
      if (!refreshed) {
        return Promise.reject(error);
      }

      const retryConfig = {
        ...config,
        __isRetry: true,
        headers: {
          ...(config.headers ?? {}),
          Authorization: currentAccessToken ? `Bearer ${currentAccessToken}` : undefined,
        } as typeof config.headers,
      };
      return apiClient.request(retryConfig);
    } finally {
      refreshInFlight = null;
    }
  }
);

export { API_BASE_URL };
