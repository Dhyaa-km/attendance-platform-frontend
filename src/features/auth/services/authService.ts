import type { Organizer, LoginCredentials } from '../../../types/auth.ts';
import { apiClient, clearAuthSessionTokens, getStoredCsrfToken, setAuthSessionTokens } from '../../../lib/axios.ts';
import { STORAGE_KEYS } from '../../../utils/constants.ts';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<Organizer>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<Organizer | null>;
  getRememberedEmail(): string;
  refreshSession(): Promise<boolean>;
}

const normalizeRole = (role: string | undefined): Organizer['role'] => {
  if (role === 'admin' || role === 'organizer') {
    return role;
  }

  return 'organizer';
};

const normalizeOrganizer = (user: {
  id: string;
  name: string;
  email: string;
  role?: string;
}): Organizer => {
  const role = normalizeRole(user.role);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    callsign: role === 'admin' ? 'ADMIN' : 'OPS',
    badgeId: role === 'admin' ? 'ADMIN-OPS-01' : 'ORG-OPS-01',
  };
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  const maybeError = error as {
    response?: {
      status?: number;
      data?: { error?: { message?: string } };
      headers?: { 'retry-after'?: string | string[] };
    };
  };

  const retryAfterHeader = maybeError.response?.headers?.['retry-after'];
  const retryAfterValue = Array.isArray(retryAfterHeader)
    ? retryAfterHeader[0]
    : retryAfterHeader;

  if (maybeError.response?.status === 429 && retryAfterValue) {
    return `Too many attempts. Please retry in ${retryAfterValue} seconds.`;
  }

  if (maybeError.response?.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (maybeError.response?.data?.error?.message) {
    return maybeError.response.data.error.message;
  }

  if (maybeError.response?.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  return fallback;
};

class ApiAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<Organizer> {
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, credentials.email.trim());
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }

      const { accessToken, csrfToken, user } = response.data;
      setAuthSessionTokens({ accessToken, csrfToken });
      return normalizeOrganizer(user);
    } catch (error) {
      const message = extractErrorMessage(error, 'Authentication failed. Please verify your credentials.');
      throw new Error(message, { cause: error });
    }
  }

  async logout(): Promise<void> {
    const csrfToken = getStoredCsrfToken();

    try {
      await apiClient.post(
        '/api/v1/auth/logout',
        {},
        {
          headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
        }
      );
    } catch (error) {
      const maybeError = error as { response?: { status?: number } };
      if (maybeError.response?.status === 401 || maybeError.response?.status === 403) {
        return;
      }
      throw error;
    } finally {
      clearAuthSessionTokens();
    }
  }

  async getCurrentSession(): Promise<Organizer | null> {
    try {
      const csrfToken = getStoredCsrfToken();
      if (!csrfToken) {
        const csrfResponse = await apiClient.get('/api/v1/auth/csrf');
        const nextCsrfToken = csrfResponse.data?.csrfToken;
        if (!nextCsrfToken) {
          return null;
        }
        const refreshResponse = await apiClient.post(
          '/api/v1/auth/refresh',
          {},
          {
            headers: { 'X-CSRF-Token': nextCsrfToken },
          }
        );

        const { accessToken, csrfToken: recoveredCsrfToken, user } = refreshResponse.data;
        setAuthSessionTokens({ accessToken, csrfToken: recoveredCsrfToken });
        return normalizeOrganizer(user);
      }

      const response = await apiClient.post(
        '/api/v1/auth/refresh',
        {},
        {
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );

      const { accessToken, csrfToken: refreshedCsrfToken, user } = response.data;
      setAuthSessionTokens({ accessToken, csrfToken: refreshedCsrfToken });
      return normalizeOrganizer(user);
    } catch (error) {
      clearAuthSessionTokens();
      const maybeError = error as { response?: { status?: number } };
      if (maybeError.response?.status === 401 || maybeError.response?.status === 403) {
        return null;
      }

      throw new Error(
        extractErrorMessage(error, 'Unable to restore the organizer session. Please sign in again.'),
        { cause: error }
      );
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      const csrfToken = getStoredCsrfToken() ?? (await apiClient.get('/api/v1/auth/csrf')).data?.csrfToken;
      if (!csrfToken) {
        clearAuthSessionTokens();
        return false;
      }

      const response = await apiClient.post(
        '/api/v1/auth/refresh',
        {},
        {
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );

      const { accessToken, csrfToken: refreshedCsrfToken } = response.data;
      setAuthSessionTokens({ accessToken, csrfToken: refreshedCsrfToken });
      return true;
    } catch (error) {
      clearAuthSessionTokens();
      const maybeError = error as { response?: { status?: number } };
      if (maybeError.response?.status === 401 || maybeError.response?.status === 403) {
        return false;
      }

      return false;
    }
  }

  getRememberedEmail(): string {
    return localStorage.getItem('nasa_remembered_email') || '';
  }
}

export const authService: AuthService = new ApiAuthService();
