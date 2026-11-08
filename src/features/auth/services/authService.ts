import type { Organizer, LoginCredentials } from '../../../types/auth.ts';
import { mockAuthService } from './mockAuthService.ts';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<Organizer>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<Organizer | null>;
  getRememberedEmail(): string;
}

/**
 * Active authentication service singleton.
 * To integrate with real backend endpoints in the future, implement `AuthService`
 * with Axios and swap the export here.
 */
export const authService: AuthService = mockAuthService;
