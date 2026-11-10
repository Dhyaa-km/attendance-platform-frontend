export type OrganizerRole =
  | 'admin'
  | 'organizer'
  | 'lead_organizer'
  | 'technical_lead'
  | 'scanner_operator';

export interface Organizer {
  id: string;
  name: string;
  email: string;
  role: OrganizerRole;
  callsign?: string;
  badgeId: string;
  avatarUrl?: string;
}

export interface AuthState {
  organizer: Organizer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  accessToken: string | null;
  csrfToken: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  organizer: Organizer;
  message?: string;
}
