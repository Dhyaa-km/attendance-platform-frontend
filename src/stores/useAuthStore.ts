import { create } from 'zustand';
import type { Organizer, AuthState, LoginCredentials } from '../types/auth.ts';
import { authService } from '../features/auth/services/authService.ts';
import { getStoredAccessToken, getStoredCsrfToken } from '../lib/axios.ts';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<Organizer>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  organizer: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  accessToken: null,
  csrfToken: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const organizer = await authService.getCurrentSession();
      const nextState = {
        organizer,
        isAuthenticated: Boolean(organizer),
        isInitialized: true,
        isLoading: false,
        error: null,
        accessToken: getStoredAccessToken(),
        csrfToken: getStoredCsrfToken(),
      };

      set(nextState);
    } catch (err: unknown) {
      set({
        organizer: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        accessToken: null,
        csrfToken: null,
        error:
          err instanceof Error
            ? `Unable to restore organizer session: ${err.message}`
            : 'Unable to restore the organizer session. Please sign in again.',
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const organizer = await authService.login(credentials);
      const currentState = get();
      set({
        organizer,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: currentState.accessToken ?? getStoredAccessToken(),
        csrfToken: currentState.csrfToken ?? getStoredCsrfToken(),
      });
      return organizer;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify your credentials.';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        organizer: null,
        accessToken: null,
        csrfToken: null,
      });
      throw new Error(errorMessage, { cause: err });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
    } finally {
      set({
        organizer: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
        csrfToken: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
