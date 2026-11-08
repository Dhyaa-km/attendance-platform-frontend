# NASA Space Apps Algiers 2026 Attendance Platform

Responsive organizer interface for participant check-in and event attendance operations.

## Features

- Organizer login with protected application routes.
- Mission dashboard with attendance telemetry and recent activity.
- QR camera and manual-code scanning for check-in and check-out.
- Participant roster with search, status/category filters, and participant details.
- Attendance history of individual actions, including repeat check-ins after check-outs, with summary metrics, filters, sorting, pagination, CSV export, and record details.
- Shared dark, NASA-inspired UI primitives and design-system reference page.

## Architecture

- `src/routes/` defines lazy-loaded routes, guest access, and organizer-only access.
- `src/components/layout/` contains the authenticated application shell and navigation.
- `src/features/` groups pages, feature-specific components, and service interfaces/implementations.
- `src/types/` defines shared organizer, participant, and attendance data shapes.
- `src/mocks/mockData.ts` holds the in-memory sample roster, organizer accounts, attendance actions, and dashboard telemetry.
- Feature services currently use mock implementations. The attendance service returns action records independently of participant current status; scanner successes append records to the shared in-memory mock log.

Mock changes are held in memory and reset on a full page reload. No backend requests or API endpoints are implemented.

## Local development

```sh
npm install
npm run dev
```

Demo organizer: `lead@spaceapps-algiers.dz`
Demo password: `algiers2026`

Other authorized mock organizers are listed in the login form.

## Validation

```sh
npm run build
npm run lint
```

There is no automated test script configured in `package.json`.

## Backend integration

Replace the active mock service implementations with API-backed implementations when the backend contract is available. Keep the existing typed service interfaces and do not assume endpoint paths or request/response formats before that contract is defined.
