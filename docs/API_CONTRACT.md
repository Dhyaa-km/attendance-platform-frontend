# Backend API Contract

**Status:** Proposed contract for review. This is documentation only; endpoints and response examples are recommendations, not existing backend behavior.

## 1. Scope and observed frontend behavior

The current React application has protected routes for login, dashboard, scanner, participants, and attendance history. Its active feature services are all in-memory mocks:

- Authentication resolves a mock organizer, stores a mock session identifier in `sessionStorage`, and remembers an email in `localStorage` only when requested.
- Participant management searches mock name, email, QR value, and team; filters status/category; retrieves counts independently; and opens a detail modal.
- The scanner sends a raw QR string, selected action, **and client-supplied organizer ID/name** to `ScanService`. The mock mutates current participant status and appends a record only for successful actions. Invalid and duplicate scans return a result but do not append an attendance record.
- Dashboard stats are a fixed snapshot mutated by the scanner mock.
- Attendance history loads all records and a separate summary, then filters, sorts, paginates, and exports in the browser.
- `src/lib/axios.ts` already configures `withCredentials: true` and a default base URL of `http://localhost:3000/api`, but no feature service currently calls it.

The API below supplies the capabilities required by these workflows while adding event scoping, server-side pagination, and import support. It does not imply that any API already exists.

## 2. Conventions

### Base URL and versioning

Recommended base URL: `/api/v1`. Configure the frontend's `VITE_API_URL` to the backend origin plus this prefix, for example `http://localhost:3000/api/v1`.

All event-owned resources use `/events/:eventId/...`, including the first single event. `GET /events/current` is the bootstrap endpoint for the event currently selected by server configuration. The frontend presently has no event selector and sends no event ID; it must retain the resolved event ID and scope subsequent requests. A future event selector can change that context without redesigning resource URLs.

### JSON envelope

Successful JSON response:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Paginated responses additionally include `meta.pagination`. Errors use one shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": {
      "fieldErrors": [
        { "field": "email", "message": "Enter a valid email address." }
      ]
    },
    "requestId": "req_01J..."
  }
}
```

`details` is an object when present. Validation errors use `details.fieldErrors` (an array); scan conflicts may use `details.scanResult`. Do not return stack traces, password hashes, JWTs, raw QR tokens, or database internals. Use stable machine-readable `code` values; the frontend maps them to its scan-result and form states.

### Data formats

- IDs are opaque string representations of MongoDB ObjectIds. They are identifiers, never authentication or QR credentials.
- Timestamps are ISO 8601 UTC strings with an explicit `Z`, e.g. `2026-11-14T08:15:00.000Z`.
- Date-only filters are `YYYY-MM-DD` **in the event timezone**. Current event timezone is `Africa/Algiers`; the backend converts local day boundaries to UTC using the event's IANA timezone.
- API action values are `CHECK_IN` and `CHECK_OUT`. The frontend currently uses `'check-in'` and `'check-out'`; map between the API and UI representations.
- Participant status values remain `pending`, `checked_in`, and `checked_out`.
- API requests are validated on the server with Zod (or equivalent shared validation); client validation is not a security boundary.

## 3. Authentication, cookies, and authorization

### Recommended browser session

Use signed JWT access credentials in `HttpOnly`, `Secure` cookies (short access lifetime, e.g. 10–15 minutes) and a rotated refresh credential backed by a server-side session record. Never put JWTs in `localStorage`, `sessionStorage`, response JSON, URLs, or logs. Store only a one-way hash of refresh tokens. Logout revokes the session/refresh token and clears cookies. Short-lived access JWTs may remain usable until expiry unless the server also checks a session/version; document and select the desired revocation guarantee.

For `rememberMe: true`, issue a persistent refresh cookie with a bounded lifetime; for false, use a browser-session refresh cookie. It is also acceptable for policy to use the same bounded session lifetime for both, but then the checkbox semantics must be updated. The existing remembered-email behavior is client-side UX and must not affect authentication or authorize a session.

Because Axios uses credentialed requests:

- Configure CORS for explicit frontend origins and `Access-Control-Allow-Credentials: true`; never use wildcard origin with credentials.
- Set cookies with `HttpOnly`, `Secure` in production, and an appropriate `SameSite` policy (normally `Lax` when deployment topology allows).
- Validate `Origin`/`Referer` on unsafe requests and use a CSRF token/header strategy for cookie-authenticated mutations. The current Axios client has no CSRF header behavior and needs an integration change.
- Rate-limit login and other abuse-prone routes. Return the same generic login failure for unknown email and wrong password.

### Authorization policy (proposed)

- All protected routes require an active authenticated user and membership/permission for the requested event.
- Active event organizers may read the event, roster, dashboard, and attendance history and perform check-in/check-out.
- CSV import requires an explicit `participants:import` permission.
- Existing `OrganizerRole` values are `lead_organizer`, `organizer`, `technical_lead`, and `scanner_operator`; none is named administrator. The project must decide which provisioned user receives `participants:import` or add an event-admin permission/role before import ships. Do not infer this permission from a role name in frontend code.
- A future multi-event product should model event membership and permissions separately from a global user identity. Version 1 may provision a permission assignment for the one configured event.

## 4. Endpoints

All endpoints below are proposals. `{eventId}` is required for event-scoped operations and must be authorized against the authenticated user.

### 4.1 Authentication

#### `GET /auth/csrf`

Bootstrap a CSRF token before login or other cookie-authenticated mutations. Public, but should validate origin. Sets a CSRF cookie and returns its matching token; subsequent unsafe requests send `X-CSRF-Token`.

Success `200`:

```json
{
  "data": { "csrfToken": "opaque-random-value" },
  "meta": { "requestId": "req_01J..." }
}
```

Frontend impact: add bootstrap and CSRF-header handling. If the deployment chooses a different CSRF mechanism, preserve the same protection.

#### `POST /auth/login`

- **Authentication:** none; CSRF/origin protection and rate limiting apply.
- **Body:**

```json
{
  "email": "lead@spaceapps-algiers.dz",
  "password": "example-password",
  "rememberMe": false
}
```

- **Validation:** trimmed, normalized email; non-empty password. Login should not disclose whether an email exists. The current Zod form requires a syntactically valid email and six password characters; coordinate any stronger password policy with credential provisioning and update the form.
- **Success:** `200`, sets access/refresh cookies; returns the safe organizer DTO, not tokens.

```json
{
  "data": {
    "organizer": {
      "id": "6734a1c2f003f04e7d2a0001",
      "name": "Amina Mansouri",
      "email": "lead@spaceapps-algiers.dz",
      "role": "lead_organizer",
      "callsign": "FLIGHT-LEAD",
      "badgeId": "NASA-ALG-01",
      "avatarUrl": null
    }
  },
  "meta": { "requestId": "req_01J..." }
}
```

- **Errors:** `400 VALIDATION_ERROR`; `401 INVALID_CREDENTIALS`; `429 RATE_LIMITED`.
- `rememberMe` controls only the server session lifetime, not whether the email is saved. The frontend may separately persist the email only after opt-in.

#### `GET /auth/me`

- **Authentication:** valid access cookie, or an access-token refresh flow performed by middleware/client before retry.
- **Authorization:** active account.
- **Success:** `200` with `{ "data": { "organizer": OrganizerDto } }`.
- **Errors:** `401 UNAUTHENTICATED`; `403 ACCOUNT_DISABLED`.
- Used by `useAuthStore.initialize()` to restore the current organizer. `401` should clear client auth state and let `ProtectedRoute` redirect to login while preserving the original path.

#### `POST /auth/refresh`

- **Authentication:** valid refresh cookie and CSRF/origin validation.
- **Body:** none.
- **Success:** `200`, rotates refresh cookie, sets new access cookie, returns the safe organizer DTO.
- **Errors:** `401 SESSION_EXPIRED`; `403 ACCOUNT_DISABLED`.
- Refresh tokens are one-use/rotated; concurrent refresh handling and replay detection must be specified in implementation.

#### `POST /auth/logout`

- **Authentication:** current session if available; CSRF/origin validation.
- **Body:** none.
- **Success:** `204 No Content`; revokes refresh session and expires auth cookies. Make logout idempotent for an already expired session.
- **Errors:** `401` may be treated as already logged out by the client; unexpected server errors must remain visible.
- Called by both header and sidebar logout controls.

### 4.2 Event information

#### `GET /events/current`

- **Authentication:** required.
- **Authorization:** current organizer must have access to the configured event.
- **Success:** `200` with `EventDto`.
- **Errors:** `401`, `403`, `404 CURRENT_EVENT_NOT_CONFIGURED`.
- Current frontend source is `EVENT_DETAILS` in `src/utils/constants.ts`; replace these hard-coded event display values with this response.

```json
{
  "data": {
    "id": "6734a1c2f003f04e7d2a1001",
    "slug": "nasa-space-apps-algiers-2026",
    "name": "NASA Space Apps Challenge",
    "subtitle": "Algiers Local Event",
    "edition": "NASA Space Apps Challenge — Algiers 2026",
    "year": 2026,
    "startDate": "2026-11-14",
    "endDate": "2026-11-15",
    "timezone": "Africa/Algiers",
    "location": "Algiers, Algeria",
    "venue": "Algiers Innovation & Technology Hub",
    "officialUrl": "https://www.spaceappschallenge.org/2026/local-events/algiers/",
    "websiteUrl": "https://nasa-space-app-algiers.vercel.app/",
    "tagline": "Operational Attendance & Telemetry System",
    "status": "in_progress"
  },
  "meta": { "requestId": "req_01J..." }
}
```

`status` is a backend enum such as `planned`, `check_in_open`, `in_progress`, `completed`, or `cancelled`; the frontend maps it to display text such as its current `CHECK-IN IN PROGRESS`. The date values are calendar dates, not fabricated event opening/closing times.

#### `GET /events/:eventId`

- **Authentication/authorization:** required; active organizer with access to that event.
- **Query/body:** none.
- **Success:** `200` with the same `EventDto` as `/events/current`.
- **Errors:** `400 INVALID_ID`; `401 UNAUTHENTICATED`; `403 EVENT_ACCESS_DENIED`; `404 EVENT_NOT_FOUND`.
- This is useful once the UI supports switching events; it is not required for the current one-event screen if `/events/current` supplies the ID.

### 4.3 Participants

#### `GET /events/:eventId/participants`

- **Authentication/authorization:** active event organizer with roster-read permission.
- **Query parameters:**
  - `page` (1-based, default `1`), `limit` (default `25`, max `100`).
  - `search` (optional; case-insensitive partial match against name, email, team; **not** against the secret QR token).
  - `status`: `pending | checked_in | checked_out`.
  - `category`: current enum `hacker | mentor | judge | organizer | volunteer | vip`.
  - `sort`: allowlisted values such as `name_asc`, `name_desc`, `created_desc`; default `name_asc`.
- **Success:** `200`.

```json
{
  "data": {
    "items": [
      {
        "id": "6734a1c2f003f04e7d2a2001",
        "eventId": "6734a1c2f003f04e7d2a1001",
        "fullName": "Yacine Brahimi",
        "email": "yacine@algiers-spaceapps.dz",
        "phone": "+213 550 12 34 56",
        "teamName": "Orbital Voyagers",
        "category": "hacker",
        "status": "checked_in",
        "firstCheckInAt": "2026-11-14T08:45:12.000Z",
        "lastCheckInAt": "2026-11-14T08:45:12.000Z",
        "checkOutAt": null,
        "notes": "Team Lead for Orbital Voyagers"
      }
    ],
    "counts": {
      "all": 120,
      "checkedIn": 74,
      "checkedOut": 12,
      "pending": 34
    }
  },
  "meta": {
    "pagination": { "page": 1, "limit": 25, "total": 120, "totalPages": 5 },
    "requestId": "req_01J..."
  }
}
```

`counts` are event-wide status counts, not counts after the active search/category/status filters; the Participants tabs display event-wide counts. `total` is the filtered result count. The current UI loads all matching records and paginates locally; it must adopt server pagination and reconcile the response shape.

- **Errors:** `400 VALIDATION_ERROR`; `401`; `403`; `404 EVENT_NOT_FOUND`.
- Do not return the raw QR token, password, token hash, internal notes marked private, or Mongo-only fields. Decide whether participant notes are operator-visible and represent that decision consistently.

#### `GET /events/:eventId/participants/:participantId`

- **Authentication/authorization:** event roster-read.
- **Success:** `200` with the same safe participant detail DTO, including phone, team, notes if permitted, current status, and timestamps.
- **Errors:** `400 INVALID_ID`; `401`; `403`; `404 PARTICIPANT_NOT_FOUND`.
- The existing `ParticipantService.getParticipantById()` is defined but the current details modal is opened from an already-loaded row and does not call it. Use this endpoint for future direct links, refresh-safe detail pages, or pagination-safe detail fetching.

### 4.4 CSV participant import (required backend capability; no current UI)

#### `POST /events/:eventId/participants/import`

- **Authentication:** required.
- **Authorization:** event-specific `participants:import` permission; see role decision above.
- **Content type:** `multipart/form-data`, one UTF-8 `.csv` file; optional text fields `dryRun` (default `true`) and `duplicatePolicy` (v1 fixed to `skip`).
- **Headers:** `Idempotency-Key` required for a commit; `X-CSRF-Token` required for cookie auth.
- **CSV columns:** required `fullName,email,category`; optional `phone,teamName,notes`. QR-token columns are not accepted; credential issuance happens separately.
- **Validation:** strict file size/row limits, encoding and header allowlist; trim strings, normalize email, validate enum; reject formula execution risk on exports; validate all rows before writes. Do not trust filename, MIME type, row values, or formulas.
- **Duplicate policy (proposed):** do not overwrite a participant or attendance status on duplicate normalized email within the event. Report duplicates by row. Duplicate emails inside the same file are also reported. `dryRun=true` performs validation only. On commit, insert each valid unique row, skip invalid/duplicate rows, and return a per-row report; never silently merge.
- **Success:** `200` with import counts and bounded row outcomes. A report containing rejected rows is still `200` with `status: "completed_with_errors"`; invalid file structure/size is an HTTP error.

```json
{
  "data": {
    "status": "completed_with_errors",
    "dryRun": false,
    "totalRows": 3,
    "created": 1,
    "skipped": 1,
    "invalid": 1,
    "rows": [
      { "row": 2, "status": "created", "participantId": "6734a1c2f003f04e7d2a2002" },
      { "row": 3, "status": "skipped", "code": "DUPLICATE_EMAIL" },
      { "row": 4, "status": "invalid", "code": "INVALID_CATEGORY", "field": "category" }
    ]
  },
  "meta": { "requestId": "req_01J..." }
}
```

- **Errors:** `400 VALIDATION_ERROR`; `401`; `403`; `413 FILE_TOO_LARGE`; `415 UNSUPPORTED_MEDIA_TYPE`; `409 IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_FILE`; `500` only for unexpected failures.
- Persist an import-batch audit record (recommended additional collection) with importing user, event, file digest, counts, and timestamp; do not retain uploaded files unless a defined retention policy requires it.
- If an all-or-nothing import is preferred, that is a product decision and changes the partial-row contract above.

#### Participant badge-token issuance (required operational decision)

The current participant detail modal reveals/copies `participant.qrCode`. That is incompatible with a secret token that must not be re-readable. A secure approach is:

- Imported participants start without an issued QR credential (`qrTokenHash: null`, `qrTokenVersion: 0`) and cannot be checked in until one is issued.
- Provide an admin-authorized, audited, one-time issue/rotate operation returning a newly generated raw token once for badge printing. Proposed endpoint: `POST /events/:eventId/participants/:participantId/qr-token/rotate`. It issues the first credential when none exists and rotates/invalidate the old credential otherwise.
- Require `participants:issue-qr` permission, invalidate the old hash atomically, never include the token in participant list/detail/history, and never write it to logs.
- **Body:** none. **Success:** `200` with the one-time token response below. **Errors:** `400 INVALID_ID`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 EVENT_NOT_FOUND` or `PARTICIPANT_NOT_FOUND`; `500 INTERNAL_ERROR` for unexpected failures. Repeating the operation intentionally rotates again, so the latest returned token is the only valid credential.
- Return `200 { "data": { "token": "<one-time-secret>", "issuedAt": "..." } }`; subsequent reads cannot recover that token. Whether a bulk badge-print/export workflow is needed is unresolved and must be decided before CSV import is operationally complete.

### 4.5 QR scan and attendance state transitions

#### `POST /events/:eventId/attendance/scans`

One atomic operation replaces the mock `verifyAndProcessCode(qrCode, action, organizerId, organizerName)`. Do not split token validation from the mutation in the normal scanner flow: a preflight-then-write sequence races with concurrent scanners.

- **Authentication/authorization:** active event organizer with `attendance:scan`.
- **Headers:** `Idempotency-Key` unique per logical scan request and reused verbatim when retrying after a network timeout; CSRF header when cookie-authenticated.
- **Body:**

```json
{
  "token": "random-opaque-qr-secret",
  "action": "CHECK_IN"
}
```

- **Validation:** `token` non-empty and bounded; action exactly `CHECK_IN` or `CHECK_OUT`; idempotency key valid/bounded. Do not accept participant ID, organizer identity, timestamps, terminal ID, result, or new status from the client.
- **Server behavior:** hash/lookup the token within the event; resolve the participant; derive organizer from the authenticated session; enforce current state; commit a state change and immutable attendance record together. Never echo the token.
- **Success:** `201 Created` for a new transition. An exact retry with the same idempotency key returns the original successful result (prefer `200` on replay) and does not create another record.

```json
{
  "data": {
    "status": "success",
    "action": "CHECK_IN",
    "timestamp": "2026-11-14T08:15:00.000Z",
    "participant": {
      "id": "6734a1c2f003f04e7d2a2001",
      "fullName": "Yacine Brahimi",
      "email": "yacine@algiers-spaceapps.dz",
      "category": "hacker",
      "teamName": "Orbital Voyagers",
      "status": "checked_in",
      "firstCheckInAt": "2026-11-14T08:15:00.000Z",
      "lastCheckInAt": "2026-11-14T08:15:00.000Z",
      "checkOutAt": null
    },
    "record": {
      "id": "6734a1c2f003f04e7d2a3001",
      "eventId": "6734a1c2f003f04e7d2a1001",
      "participantId": "6734a1c2f003f04e7d2a2001",
      "participantName": "Yacine Brahimi",
      "participantEmail": "yacine@algiers-spaceapps.dz",
      "participantCategory": "hacker",
      "action": "CHECK_IN",
      "timestamp": "2026-11-14T08:15:00.000Z",
      "result": "success",
      "organizerId": "6734a1c2f003f04e7d2a0001",
      "organizerName": "Amina Mansouri"
    }
  },
  "meta": { "requestId": "req_01J..." }
}
```

- **State rules:** `pending -> checked_in`; `checked_out -> checked_in` (re-entry); `checked_in -> checked_out`; never `pending -> checked_out`. A `CHECK_IN` while already `checked_in` and `CHECK_OUT` unless currently `checked_in` are rejected with no state transition and no successful attendance record.
- **Errors:** `400 VALIDATION_ERROR`; `401`; `403`; `404 INVALID_QR_TOKEN` (generic; do not reveal token or participant); `404 EVENT_NOT_FOUND`; `409 ALREADY_CHECKED_IN`; `409 ALREADY_CHECKED_OUT`; `409 CHECK_IN_REQUIRED`; `409 IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST`; `429 RATE_LIMITED`.
- For scan-specific `409` responses, include a safe `details.scanResult` with `status: "already_processed"`, `action`, user-facing `message`, optional safe participant summary, and current state. The client maps it to `ScanVerificationResult`. For unknown tokens, map `INVALID_QR_TOKEN` to `invalid_code` without echoing `rawCode`. Avoid different messages that enable token enumeration.
- Only committed state transitions are AttendanceRecords. If invalid/duplicate attempts need a security audit, store them in a separate rate-limited `ScanAttempt`/security audit collection with retention and access controls; do not pollute attendance totals or the successful history ledger.
- `terminalId` is not currently a trustworthy user input (the mock hardcodes `GATE-01`). If terminal attribution is required, provision/register station credentials and derive the station server-side; otherwise omit it.

### 4.6 Dashboard

#### `GET /events/:eventId/dashboard`

- **Authentication/authorization:** active event member with dashboard-read permission.
- **Query:** `recentLimit` optional integer `0..20`, default `5`.
- **Success:** `200` with current state aggregates and recent successful events sorted newest first.

```json
{
  "data": {
    "stats": {
      "totalParticipants": 120,
      "checkedInParticipants": 74,
      "checkedOutParticipants": 12,
      "notYetCheckedInParticipants": 34,
      "attendancePercentage": 71.7,
      "lastUpdated": "2026-11-14T11:42:00.000Z"
    },
    "recentActivity": [
      {
        "id": "6734a1c2f003f04e7d2a3001",
        "participantId": "6734a1c2f003f04e7d2a2001",
        "participantName": "Yacine Brahimi",
        "participantEmail": "yacine@algiers-spaceapps.dz",
        "participantCategory": "hacker",
        "action": "CHECK_IN",
        "timestamp": "2026-11-14T08:15:00.000Z",
        "result": "success",
        "organizerId": "6734a1c2f003f04e7d2a0001",
        "organizerName": "Amina Mansouri"
      }
    ]
  },
  "meta": { "requestId": "req_01J..." }
}
```

Dashboard counts are **current participant states**: checked-in and checked-out are mutually exclusive roster counts, pending is never successfully checked in, and all three sum to total participants. `attendancePercentage = round((checkedIn + checkedOut) / total * 100, 1)`; return zero when total is zero. This is not the lifetime count of check-in actions. The dashboard should query/recompute from persisted participant state, not increment counters independently.

- **Errors:** `401`; `403`; `404 EVENT_NOT_FOUND`.

### 4.7 Attendance history

#### `GET /events/:eventId/attendance/summary`

- **Authentication/authorization:** active event member with attendance-read permission.
- **Success:** `200`.

```json
{
  "data": {
    "totalCheckIns": 6,
    "totalCheckOuts": 4,
    "currentlyCheckedIn": 74,
    "activityCount": 10,
    "latestActivityAt": "2026-11-14T12:30:00.000Z",
    "organizers": [
      { "id": "6734a1c2f003f04e7d2a0001", "name": "Amina Mansouri" }
    ]
  },
  "meta": { "requestId": "req_01J..." }
}
```

`totalCheckIns`/`totalCheckOuts` count successful immutable actions in the selected event; `currentlyCheckedIn` counts participants whose current status is `checked_in`; `activityCount` counts successful attendance ledger records. `organizers` supplies filter options across the entire event, not only the current page. For large events, summary may be cached briefly, with cache invalidation/versioning after attendance writes.

- **Errors:** `401`; `403`; `404 EVENT_NOT_FOUND`.

#### `GET /events/:eventId/attendance`

- **Authentication/authorization:** active event member with attendance-read permission.
- **Query parameters:**
  - `page` (1-based, default `1`), `limit` (default `25`, max `100`).
  - `participantId` exact ID filter; `participant` case-insensitive partial name/email search (matches the history UI, bounded to a documented maximum length).
  - `organizerId` exact filter.
  - `action=CHECK_IN|CHECK_OUT`.
  - `fromDate`, `toDate`: inclusive `YYYY-MM-DD` boundaries in the event timezone. Convert server-side to UTC interval `[local start of fromDate, local start of day after toDate)`; reject malformed dates and `fromDate > toDate`.
  - `sort=timestamp_desc|timestamp_asc|participant_asc`, default `timestamp_desc`. A stable tie-break by `_id` is required.
- **Success:** `200` with page items and pagination metadata.

```json
{
  "data": {
    "items": [
      {
        "id": "6734a1c2f003f04e7d2a3001",
        "eventId": "6734a1c2f003f04e7d2a1001",
        "participantId": "6734a1c2f003f04e7d2a2001",
        "participantName": "Yacine Brahimi",
        "participantEmail": "yacine@algiers-spaceapps.dz",
        "participantCategory": "hacker",
        "action": "CHECK_IN",
        "timestamp": "2026-11-14T08:15:00.000Z",
        "result": "success",
        "organizerId": "6734a1c2f003f04e7d2a0001",
        "organizerName": "Amina Mansouri"
      }
    ]
  },
  "meta": {
    "pagination": { "page": 1, "limit": 25, "total": 10, "totalPages": 1 },
    "requestId": "req_01J..."
  }
}
```

- **Errors:** `400 VALIDATION_ERROR`; `401`; `403`; `404 EVENT_NOT_FOUND`.
- Records are append-only and represent successful state changes, not participant snapshots. Do not include a QR token in records. The current frontend's `qrCode` record field should be removed or replaced with a non-secret display value if the UI truly requires one.

#### `GET /events/:eventId/attendance/:recordId`

- **Authentication/authorization:** attendance-read.
- **Success:** `200` with one safe record DTO; historical participant and organizer display values come from immutable snapshots.
- **Errors:** `400 INVALID_ID`; `401`; `403`; `404 ATTENDANCE_RECORD_NOT_FOUND`.
- Detail endpoint serves the current history modal and supports future deep links.

### 4.8 Export

No server CSV endpoint is required for v1. The current UI builds CSV locally. After server pagination is adopted, the frontend must fetch all pages matching the active filters (bounded and with a stable sort) before producing an all-filtered-record export. If roster size/event history makes that impractical, add a separately approved streaming export endpoint with the same authorization and filters; do not silently export only the visible page.

## 5. Error/status summary

| HTTP | Stable error codes (examples) | Client behavior |
|---|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_ID` | Show field/filter validation; do not retry unchanged request. |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED` | For protected calls restore/refresh once, then clear session and redirect. Login failures show a generic error. |
| 403 | `FORBIDDEN`, `ACCOUNT_DISABLED`, `EVENT_ACCESS_DENIED` | Show access denied; do not loop login refresh. |
| 404 | `EVENT_NOT_FOUND`, `PARTICIPANT_NOT_FOUND`, `INVALID_QR_TOKEN` | Show not found/invalid badge; never echo token. |
| 409 | `ALREADY_CHECKED_IN`, `ALREADY_CHECKED_OUT`, `CHECK_IN_REQUIRED`, `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST` | Show duplicate/inconsistent scan; refresh current participant state if useful. |
| 413 / 415 | `FILE_TOO_LARGE` / `UNSUPPORTED_MEDIA_TYPE` | Correct import file and retry. |
| 429 | `RATE_LIMITED` | Respect `Retry-After`; avoid automatic scan replay with a new key. |
| 5xx | `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE` | Show recoverable error; attendance retries reuse the original idempotency key. |

## 6. Cross-endpoint business rules

1. Event membership is checked on every event-scoped read and write; ObjectId possession is not authorization.
2. The server derives organizer ID/name and timestamps. It never trusts the UI's organizer props, status, result, QR identity, or local clock.
3. Participant current status is a summary of the last successful transition. Attendance records are immutable individual transitions, including repeated check-ins after check-outs.
4. `firstCheckInAt` is set once; `lastCheckInAt` changes on each successful check-in; `checkOutAt` records the latest successful check-out and is retained after a later re-entry. This matches the fields currently displayed by participant detail/table.
5. Unknown tokens, cross-event tokens, revoked tokens, and malformed tokens should not reveal whether a participant exists. Return the same public invalid-token result.
6. Only a committed state transition increments lifetime action totals. `pending -> checked_out`, duplicate same-state scans, and invalid tokens never create successful attendance records.
7. Imported participants with an existing normalized email are reported, not overwritten; importing never resets status/history.
