export const EVENT_DETAILS = {
  NAME: 'NASA Space Apps Challenge',
  SUBTITLE: 'Algiers Local Event',
  YEAR: '2026',
  DATES: 'November 14–15, 2026',
  LOCATION: 'Algiers, Algeria',
  VENUE: 'Algiers Innovation & Technology Hub',
  OFFICIAL_URL: 'https://www.spaceappschallenge.org/2026/local-events/algiers/',
  WEBSITE_URL: 'https://nasa-space-app-algiers.vercel.app/',
  TIMEZONE: 'Africa/Algiers',
  EDITION: 'NASA Space Apps Challenge — Algiers 2026',
  TAGLINE: 'Operational Attendance & Telemetry System',
  STATUS: 'CHECK-IN IN PROGRESS',
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
  ADMIN_ORGANIZERS: '/admin/organizers',
} as const;
