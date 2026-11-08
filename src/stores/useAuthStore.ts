import { create } from 'zustand';
import type { Organizer, AuthState, LoginCredentials } from '../types/auth.ts';
import { authService } from '../features/auth/services/authService.ts';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<Organizer>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  organizer: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const organizer = await authService.getCurrentSession();
      set({
        organizer,
        isAuthenticated: Boolean(organizer),
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        organizer: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const organizer = await authService.login(credentials);
      set({
        organizer,
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      });
    }
  },

  clearError: () => set({ error: null }),
}));
