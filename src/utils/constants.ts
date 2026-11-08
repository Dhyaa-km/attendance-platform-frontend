export const EVENT_DETAILS = {
  NAME: 'NASA Space Apps Challenge',
  SUBTITLE: 'Algiers Local Event',
  YEAR: '2026',
  LOCATION: 'Algiers, Algeria',
  OFFICIAL_URL: 'https://www.spaceappschallenge.org/2026/local-events/algiers/',
  WEBSITE_URL: 'https://nasa-space-app-algiers.vercel.app/',
  TIMEZONE: 'Africa/Algiers',
  EDITION: 'NASA International Space Apps 2026',
  TAGLINE: 'Operational Attendance & Telemetry System',
} as const;

export const STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'nasa_remembered_email',
  SCANNER_AUDIO: 'nasa_scanner_audio_enabled',
  SCANNER_CAMERA_FACING: 'nasa_scanner_camera_facing',
  MOCK_SESSION_ACTIVE: 'nasa_mock_session_active',
} as const;

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SCANNER: '/scanner',
  PARTICIPANTS: '/participants',
  ATTENDANCE: '/attendance',
  DESIGN_SYSTEM: '/design-system',
} as const;
