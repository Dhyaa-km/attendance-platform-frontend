import type { Organizer, LoginCredentials } from '../../../types/auth.ts';
import { MOCK_ORGANIZERS } from '../../../mocks/mockData.ts';
import { STORAGE_KEYS } from '../../../utils/constants.ts';

/**
 * Mock Authentication Service
 * 
 * Simulates a secure backend authentication process without sensitive tokens in localStorage.
 * Compatible with future HTTP-only cookie session handling.
 */
class MockAuthService {
  /**
   * Authenticate organizer credentials
   */
  async login(credentials: LoginCredentials): Promise<Organizer> {
    // Simulate real network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const normalizedEmail = credentials.email.trim().toLowerCase();

    // Check against authorized organizers roster
    const organizer = MOCK_ORGANIZERS.find(
      (org) => org.email.toLowerCase() === normalizedEmail
    );

    if (!organizer) {
      throw new Error(
        'Access Denied: Email is not registered among authorized NASA Space Apps Algiers organizers.'
      );
    }

    // In mock mode, any valid password with 6+ characters is accepted
    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Authentication Failed: Invalid password provided.');
    }

    // Handle "Remember Me" for email only (never tokens)
    if (credentials.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, credentials.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }

    // Persist active session in sessionStorage for seamless test navigation
    sessionStorage.setItem(STORAGE_KEYS.MOCK_SESSION_ACTIVE, organizer.id);

    return organizer;
  }

  /**
   * Terminate active session
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    sessionStorage.removeItem(STORAGE_KEYS.MOCK_SESSION_ACTIVE);
  }

  /**
   * Retrieve active session (simulates server-side session check via HTTP-only cookie)
   */
  async getCurrentSession(): Promise<Organizer | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const activeOrganizerId = sessionStorage.getItem(STORAGE_KEYS.MOCK_SESSION_ACTIVE);
    if (!activeOrganizerId) {
      return null;
    }

    const organizer = MOCK_ORGANIZERS.find((org) => org.id === activeOrganizerId);
    return organizer || null;
  }

  /**
   * Get previously remembered organizer email
   */
  getRememberedEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';
  }
}

export const mockAuthService = new MockAuthService();
