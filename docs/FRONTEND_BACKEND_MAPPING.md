# Frontend–Backend Mapping

This mapping was prepared from the current `src/types`, feature implementations, mock services/data, Zustand stores, routes, and `src/lib/axios.ts`. Every API path is proposed in [API_CONTRACT.md](./API_CONTRACT.md); none currently exists.

## 1. Feature mapping

| Frontend feature | Existing mock service/type | Proposed API endpoint | Expected response |
|---|---|---|---|
| Login form | `authService.login(LoginCredentials): Promise<Organizer>`; `loginSchema`; `Organizer`, `AuthResponse` in `src/types/auth.ts` | `POST /auth/login` | Envelope containing safe `organizer`; auth cookies set, never return JWT in JSON. |
| Auth initialization / protected routes | `useAuthStore.initialize()`, `ProtectedRoute`, `GuestRoute`; mock `getCurrentSession()` | `GET /auth/me`, optionally `POST /auth/refresh` | Safe current organizer or `401`; client initializes once and preserves intended route through login. |
| Logout (header/sidebar) | `authService.logout()`, `useAuthStore.logout()` | `POST /auth/logout` | `204`; server revokes refresh session and clears cookies. |
| Event overview / branding | Hard-coded `EVENT_DETAILS` in `src/utils/constants.ts`; `EventOverviewCard`, `Header`, `LoginPage` | `GET /events/current` | Event DTO with event ID, date-only schedule, timezone, location, URLs, and status. |
| Dashboard stats | `DashboardService.getStats(): DashboardStats`; `DashboardStats` | `GET /events/:eventId/dashboard` | `stats` with current status counts, attendance percentage, update timestamp. |
| Dashboard recent activity | `DashboardService.getRecentActivity(limit)`; `AttendanceRecord` | Same dashboard endpoint with `?recentLimit=5` | Newest safe attendance-record DTOs; no raw QR token. |
| Participant list | `ParticipantService.getParticipants(filters): Participant[]`; `Participant` | `GET /events/:eventId/participants?page&limit&search&status&category&sort` | `items`, event-wide `counts`, and pagination. The page must adopt server paging rather than expect an unbounded array. |
| Participant status-tab counts | `getParticipantCounts(): ParticipantCounts` called separately by `ParticipantsPage` | Counts included in `GET .../participants`; alternatively a dedicated endpoint only if independent refresh is needed | `all`, `checkedIn`, `checkedOut`, `pending`, always event-wide. |
| Participant detail | `ParticipantService.getParticipantById(id)` exists; modal currently uses selected list object | `GET /events/:eventId/participants/:participantId` | Safe participant detail, no recoverable QR secret. |
| CSV participant import | No import page/service. `Participant` fields show likely CSV roster data but no import behavior exists. | `POST /events/:eventId/participants/import` (multipart CSV) | Import row report/counts, dry-run/commit mode, duplicate and validation outcomes. Add admin UI or documented admin operation. |
| Camera/manual QR scan | `ScanService.verifyAndProcessCode(qrCode, mode, organizerId, organizerName)`; `ScanVerificationResult` | `POST /events/:eventId/attendance/scans` with `token`, `action`, `Idempotency-Key` | Successful result includes safe participant and immutable record; conflict maps to `already_processed`; invalid token maps to `invalid_code`. Organizer is derived from session. |
| Scanner audio/camera | `CameraViewfinder`, `playScanFeedback`, `useAppStore` preferences | No backend endpoint required | Camera capability and sound preferences remain browser/device concerns. No server attendance state is stored in Zustand. |
| Attendance summary | `AttendanceService.getSummary()` / `AttendanceSummary` in attendance mock service | `GET /events/:eventId/attendance/summary` | Lifetime action counts, current checked-in participant count, activity count/latest event, event-wide organizer options. |
| Attendance records list/search/filter | `AttendanceService.getRecords()`; `AttendanceRecord`; local state in `AttendancePage` | `GET /events/:eventId/attendance` with participant, organizer, action, date, sort, page, and limit filters | `items` plus pagination metadata; dates are interpreted in the event timezone. |
| Attendance record details | `selectedRecord` in `AttendancePage` | `GET /events/:eventId/attendance/:recordId` | Single immutable record including safe participant/organizer snapshots. Current UI can initially use row data, but detail fetch supports stale-safe/deep links. |
| Attendance CSV export | `AttendancePage.exportCsv()` uses `Blob` from all locally loaded filtered records | No endpoint required for initial v1 | Client exports all records matching filters after fetching all matching server pages. Add streaming server export only if volume warrants it. |
| Navigation and route protection | `APP_ROUTES`, `AppRouter`, `ProtectedRoute`, `GuestRoute`, `AppLayout` | Authenticated API calls are independently authorized server-side | Route guards are UX only; never use them as backend authorization. |

## 2. Existing data structures and required adaptations

### Organizer / User

Current `Organizer` fields: `id`, `name`, `email`, `role`, optional `callsign`, `badgeId`, optional `avatarUrl`. Current login credentials: email, password, optional `rememberMe`; `AuthResponse` exists but mock login returns only `Organizer`.

**Changes before integration:**

- Keep a safe `OrganizerDto`; never add password hash or JWT to it.
- Add `eventId`/event permissions to client context only after event bootstrap/membership is defined; the current user type does not express event membership.
- `rememberMe` currently persists only the email in local storage. Keep that opt-in behavior separate from server session lifetime and do not send a remembered email as auth evidence.
- Replace `getRememberedEmail()` mock-backed source with local storage UX and replace `getCurrentSession()` with cookie-backed `/auth/me`.
- `useAuthStore` currently catches initialization errors and leaves organizer unauthenticated. In production, distinguish an expected 401 from service-unavailable/network errors so a temporary outage is not silently represented as a definitely logged-out session.
- CSRF bootstrap/header and credentialed CORS behavior are not implemented in the Axios client.

### Participant

Current fields include `qrCode` as a plaintext predictable credential, current `status`, first/latest check-in, checkout time, and contact/team/category/notes. Participant search includes QR code; the details modal reveals and copies it.

**Security-required changes:**

- Remove raw `qrCode` from participant list/detail DTOs and from state/logging. Search should remain name/email/team only.
- Do not reveal/copy a token from a retrieved participant. Add an authorized one-time badge issuance/rotation flow (and possibly a batch print flow) that displays a newly generated raw credential once.
- The invalid scan modal currently displays the raw submitted code. Do not echo a QR secret from API responses or show it in telemetry/logs; if local UI retains the captured input temporarily, mask it and clear it after result dismissal.
- Keep `status` separate from history; preserve `firstCheckInAt`, `lastCheckInAt`, and most recent `checkOutAt` as UTC strings/null.
- Add event-scoped `eventId` in the API DTO/context. `id` remains an opaque participant ID, not QR material.
- Add actual server pagination and loading/error behavior. Current Participants page expects arrays and tabs with event-wide counts.
- Current `formatTime` and `formatFullTimestamp` use the browser's local timezone for at least part of their output; attendance history separately formats in `Africa/Algiers`. Standardize all participant, scanner, dashboard, and history timestamps on the event's IANA timezone after receiving UTC values.
- Participant role dropdown currently exposes only all/hacker/mentor/judge/volunteer although the type includes `organizer` and `vip`; either expose all backend values or state a deliberate UI restriction.

### AttendanceRecord and ScanVerificationResult

Current `AttendanceRecord` includes raw `qrCode`, lower-case hyphen action values, timestamp, organizer display values, optional terminal/notes, and `result`. Current mock log only contains successful records. `ScanVerificationResult` carries a `rawCode` and client-provided organizer name.

**Changes before integration:**

- Map UI `check-in`/`check-out` to API `CHECK_IN`/`CHECK_OUT`.
- Replace raw `qrCode` with no token field (or an explicitly non-secret display label if product approves one).
- Add `eventId` to history DTO or make event scoping explicit in service context.
- Map server `organizerId`/`organizerName` to existing `scannedByOrganizerId`/`scannedByOrganizerName` UI names, or update UI model to API names.
- Generate an idempotency UUID once per logical scan and reuse it for network retry.
- Stop sending `organizerId`/`organizerName`; the server derives the principal from the cookie session. Ignore client-provided result, timestamp, terminal, and status.
- Map HTTP `409` business conflicts into `ScanVerificationResult.status = 'already_processed'`; map unknown QR `404` to `invalid_code`; map successful operation to `success`.
- Remove `rawCode` from server responses and general browser logs. Existing frontend can temporarily retain a local input only for the life of the scan result; do not persist it.
- Keep committed AttendanceRecords as immutable successful transitions. Invalid and duplicate attempts are responses, not successful attendance events; if compliance requires failed-scan audit, introduce a separate security audit type.
- The record's `result` union currently allows `success`, `already_processed`, `invalid_code`, and `error`; successful attendance rows should use `success`. Failed scan statuses belong to the scan response/audit, not a committed transition.

### Dashboard stats and attendance summary

`DashboardStats` fields are totals by current participant state and a percentage. Scanner mock mutates these counters manually. The attendance page summary separately counts action documents. Preserve this distinction:

- Dashboard `checkedInParticipants`, `checkedOutParticipants`, and `notYetCheckedInParticipants` are current **participant** counts.
- Attendance history `totalCheckIns` and `totalCheckOuts` are successful **action** counts; one person can contribute multiple entries.
- Do not derive current presence by subtracting lifetime check-ins/check-outs. Query current participant state.
- `attendancePercentage` follows the existing formula `(checkedInParticipants + checkedOutParticipants) / totalParticipants`, rounded to one decimal; clarify/relabel if organizers intend a different product metric.
- Replace the fixed mock dashboard object and scanner-side increments with server-returned values. `lastUpdated` is server time.

### Event and organizer filter values

- `EVENT_DETAILS` has no ID and uses display-ready strings; add event bootstrap before fetching event-scoped routes.
- The attendance page derives organizer options from every locally loaded record. With paging, use the `organizers` collection supplied by attendance summary or another agreed filter-options response, so organizers absent from the current page remain selectable.
- History date inputs are local calendar dates interpreted/rendered in `Africa/Algiers`; send date-only values, and let the server resolve the timezone from the selected event rather than sending browser-local timestamps or trusting a client-supplied timezone.

## 3. Existing mock data caveats

`src/mocks/mockData.ts` contains three mock organizers, fifteen participants, ten attendance records, and dashboard counters of 120 total participants (the full roster is therefore not represented by the detailed sample). It contains deterministic QR strings and timestamps on November 14, 2026. These are illustrative values, not import fixtures or production credentials.

The mock dashboard numbers are not derived from the fifteen detailed mock participants and should not be used as backend seed truth. The attendance mock currently has ten independent successful records and some participants have multiple action records. On scanner success, `mockScanService` mutates participant state, increments mock dashboard counters, and prepends a record; failed/duplicate scans do not append a record.

`MockParticipantService.getParticipantCounts()` computes counts from the fifteen detailed participant objects; `MockDashboardService.getStats()` returns the separate fixed aggregate. This means those two views are intentionally not numerically coherent today. Production endpoints should derive counts from one authoritative event roster.

## 4. Existing service abstractions

| Service abstraction | Current active implementation | Backend integration point |
|---|---|---|
| `AuthService` | `mockAuthService` | Implement an Axios-backed service; adapt cookie responses and `/auth/me`/logout to `useAuthStore`. |
| `DashboardService` | `MockDashboardService` | Fetch `/dashboard`; map recent records and statistics. |
| `ParticipantService` | `mockParticipantService` | Add query/pagination response types; adapt list and event-wide counts. |
| `ScanService` | `mockScanService` | Send only token/action/idempotency key; map status/conflict response; remove local state mutation. |
| `AttendanceService` | `mockAttendanceService` | Add server filter/paging/detail methods; load summary and organizer options. |
| `apiClient` | Configured Axios instance, not used by feature services | Change base path to `/api/v1`; preserve credentials; add CSRF header and one controlled refresh/retry policy. |

No API endpoints are defined by these abstractions. They are client contracts that can be implemented without inventing endpoint behavior beyond this proposal.

## 5. Missing frontend representation / product decisions

1. **Event selection:** no event ID, active-event context, or event-switch UI.
2. **Admin permission:** current role union has no administrator/import permission and no import page exists.
3. **Credential printing:** no safe one-time QR credential distribution or badge-print flow; current predictable token reveal must be replaced.
4. **Idempotency:** no idempotency key is created or persisted across scan retries.
5. **Session refresh/CSRF:** no cookie refresh/CSRF workflow in current auth store/Axios interceptor.
6. **Server pagination:** participant and attendance services return all mock records; UI types do not model pagination.
7. **Server error semantics:** scan result model has statuses but no HTTP error-code mapping; generic service failure is converted to an error result.
8. **Current event date model:** display string only; backend needs date-only start/end and IANA timezone for filtering, but no exact event times should be inferred.
9. **Station identity:** `terminalId` is hardcoded in mock service; no station identity or authentication is represented.
10. **Failed scan auditing:** frontend displays invalid/duplicate results but only successful transitions enter attendance history. Decide whether to retain failures separately for security/compliance.
11. **Organizer history privacy:** history exposes participant email and possibly notes/phone in roster details. Decide event-wide organizer access, retention, and audit policy.
12. **Data scale and CSV behavior:** current client-side CSV exports all locally loaded filtered records. Server pagination needs fetch-all export or an approved streaming endpoint at higher volume.
