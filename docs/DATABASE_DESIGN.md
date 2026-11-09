# Database Design

**Status:** Proposed MongoDB Atlas/Mongoose design. No database or backend code exists in this frontend repository.

## 1. Modeling principles

- Scope event-owned records by `eventId` from the start. Version 1 can have one configured event; the schema and indexes must not make IDs globally ambiguous for later events.
- Store organizers as user identities, participants as event roster entries, and attendance actions as append-only records.
- Keep participant **current status** on the participant document for fast roster/dashboard reads. Keep every successful change as a separate AttendanceRecord. Never embed an unbounded history array in a participant.
- Store QR token hashes, never raw QR secrets. Keep password hashes private. API DTOs are allowlisted projections, not serialized Mongoose documents.
- Use UTC BSON dates for instants; keep the event's IANA timezone and date-only event dates separately.
- MongoDB ObjectIds can serve as document references and API `id` values, but never as bearer secrets.

## 2. Entity field catalog

Types below distinguish persisted fields from safe public DTO fields. Required means required when creating an active record unless noted otherwise.

### 2.1 User / Organizer

Existing public TypeScript fields are `id`, `name`, `email`, `role`, optional `callsign`, `badgeId`, and optional `avatarUrl`. `LoginCredentials` has email/password/optional rememberMe. Password is not a frontend Organizer field.

| Field | Type | Required | Validation / rationale | Example | Public? |
|---|---|---:|---|---|---|
| `_id` | ObjectId | yes | Mongoose primary key; opaque identifier only. | `6734a1c2f003f04e7d2a0001` | Yes as `id` |
| `name` | string | yes | Trim; non-empty; length limit. | `Amina Mansouri` | Yes |
| `email` | string | yes | Normalize trim/lowercase; valid email; unique globally unless account-per-event product decision changes this. Login lookup. | `lead@spaceapps-algiers.dz` | Yes |
| `emailNormalized` | string | yes | Derived lowercase normalized value used for case-insensitive login lookup and unique indexing. | `lead@spaceapps-algiers.dz` | No need separate exposure |
| `passwordHash` | string | yes for password login | Hash with a password-specific algorithm such as Argon2id; never persist plain text or return it. | `$argon2id$...` | **No** |
| `role` | enum | yes | Existing values: `lead_organizer`, `organizer`, `technical_lead`, `scanner_operator`. Permission assignment must authorize operations; CSV import needs explicit admin permission. | `lead_organizer` | Yes, safe role only |
| `callsign` | string | no | Trim; UI uses as display label. | `FLIGHT-LEAD` | Yes |
| `badgeId` | string | yes in current type | Existing human organizer badge identifier; unique if badge policy says so. It is not a password/token. | `NASA-ALG-01` | Yes |
| `avatarUrl` | string/URL or null | no | Validate URL/protocol; only if UI needs remote avatar. | `https://cdn.example/avatar.png` | Yes |
| `isActive` | boolean | yes | Default true; needed to disable accounts without deleting history. | `true` | No need to expose; derive access |
| `createdAt`, `updatedAt` | BSON Date | yes | Mongoose timestamps. | ISO timestamp | Usually no |

**Additional recommended collection:** `AuthSession` for refresh-token rotation/revocation. Store `userId`, refresh-token hash, expiry, revoked/rotated timestamp, and session metadata subject to privacy policy. Do not place an unlimited token/session array on the user.

**Future multi-event access:** model event-specific membership/permissions (e.g. `EventMembership` with `eventId`, `userId`, permission set, active state) rather than assuming a global user role grants rights in every event. It can be added when multiple events are enabled. The current `OrganizerRole` has no administrator value.

### 2.2 Event

`EVENT_DETAILS` currently supplies name, subtitle, year, dates label, location, venue, official/website URLs, timezone, edition, tagline, and a display status. It has no event ID. The proposed fields below persist those real values and add only fields needed for stable event selection and multi-event support.

| Field | Type | Required | Validation / rationale | Example | Public? |
|---|---|---:|---|---|---|
| `_id` | ObjectId | yes | Stable event scope. | `6734a1c2f003f04e7d2a1001` | Yes as `id` |
| `slug` | string | yes | Lowercase URL-safe unique event key. | `nasa-space-apps-algiers-2026` | Yes |
| `name` | string | yes | Existing `NAME`. | `NASA Space Apps Challenge` | Yes |
| `subtitle` | string | no | Existing `SUBTITLE`. | `Algiers Local Event` | Yes |
| `edition` | string | yes | Existing `EDITION`. | `NASA Space Apps Challenge — Algiers 2026` | Yes |
| `year` | integer | yes | Existing `YEAR`; valid bounded year. | `2026` | Yes |
| `startDate`, `endDate` | date-only strings | yes | Existing schedule is dates, not exact event opening times; `startDate <= endDate`. | `2026-11-14`, `2026-11-15` | Yes |
| `timezone` | IANA timezone string | yes | Controls local date filtering and display. | `Africa/Algiers` | Yes |
| `location` | string | yes | Existing `LOCATION`. | `Algiers, Algeria` | Yes |
| `venue` | string | no | Existing `VENUE`. | `Algiers Innovation & Technology Hub` | Yes |
| `officialUrl`, `websiteUrl` | URL string | no | Existing constants; HTTPS allowlist preferred. | `https://www.spaceappschallenge.org/...` | Yes |
| `tagline` | string | no | Existing `TAGLINE`. | `Operational Attendance & Telemetry System` | Yes |
| `status` | enum | yes | Normalize existing UI text to controlled values such as `planned`, `check_in_open`, `in_progress`, `completed`, `cancelled`. | `in_progress` | Yes |
| `createdAt`, `updatedAt` | BSON Date | yes | Mongoose timestamps. | ISO timestamp | Usually no |

The date-only values above are derived from the existing `November 14–15, 2026` display; no exact opening or closing times are inferred.

### 2.3 Participant

Existing `Participant` includes `id`, `qrCode`, `fullName`, `email`, optional phone/team, category, current status, optional first/last check-in and checkout timestamps, and notes. Current sample data uses event-specific mock IDs and predictable QR strings. These are not suitable for production QR credentials.

| Field | Type | Required | Validation / rationale | Example | Public? |
|---|---|---:|---|---|---|
| `_id` | ObjectId | yes | Stable participant ID; not a QR secret. | `6734a1c2f003f04e7d2a2001` | Yes as `id` |
| `eventId` | ObjectId ref Event | yes | Isolates roster and QR identity per event; justified by planned multi-event support. | Event ObjectId | Yes |
| `fullName` | string | yes | Trim; non-empty; max length. | `Yacine Brahimi` | Yes |
| `email` | string | yes | Valid normalized email; preserve display casing if desired but index normalized form. | `yacine@algiers-spaceapps.dz` | Yes |
| `emailNormalized` | string | yes | Derived lowercase normalized value, unique per event; supports stable duplicate/import detection. | `yacine@algiers-spaceapps.dz` | No need separate exposure |
| `phone` | string | no | Trim/length bound; do not assume one national format. | `+213 550 12 34 56` | Yes only to permitted event organizers |
| `teamName` | string | no | Trim/length bound. | `Orbital Voyagers` | Yes |
| `category` | enum | yes | Existing union: `hacker`, `mentor`, `judge`, `organizer`, `volunteer`, `vip`. | `hacker` | Yes |
| `status` | enum | yes | `pending` (no successful check-in), `checked_in` (present), `checked_out` (most recent transition was checkout). Initialize `pending`. | `checked_in` | Yes |
| `firstCheckInAt` | BSON Date/null | yes | Set only on first successful check-in; never reset. | `2026-11-14T08:45:12Z` | Yes |
| `lastCheckInAt` | BSON Date/null | yes | Set on each successful check-in, including re-entry. | `2026-11-14T12:30:00Z` | Yes |
| `checkOutAt` | BSON Date/null | yes | Latest successful check-out; retained after a later check-in. | `2026-11-14T12:00:00Z` | Yes |
| `qrTokenHash` | fixed-length keyed digest or null | no until credential issuance | HMAC-SHA-256 (or comparable keyed digest) over a high-entropy random token; never store the raw token. Unique within event when non-null. | `hmac-sha256:...` | **No** |
| `qrTokenVersion` | integer | yes | Starts at `0` (unissued); increment on first issue and each rotation. | `1` | No |
| `notes` | string | no | Existing field; define whether it is internal or organizer-visible and restrict/omit accordingly. | `Team Lead for Orbital Voyagers` | Conditional |
| `createdAt`, `updatedAt` | BSON Date | yes | Mongoose timestamps. | ISO timestamp | Usually no |

`qrCode` must not remain a raw QR secret in the public `Participant` DTO. Replace it with no token field; if badge printing is needed, use a one-time issuance flow. Searching the roster by QR token is removed; current public search by name/email/team remains.

### 2.4 AttendanceRecord

The existing record type represents one action and contains participant ID/name/category/QR string, action, timestamp, result, organizer ID/name, optional terminal and notes. The mock log contains successful check-in/out events only. Preserve an immutable action ledger; do not synthesize history from the participant's current status.

| Field | Type | Required | Validation / rationale | Example | Public? |
|---|---|---:|---|---|---|
| `_id` | ObjectId | yes | Record identifier used by history details. | `6734a1c2f003f04e7d2a3001` | Yes as `id` |
| `eventId` | ObjectId ref Event | yes | Event ownership and event-local indexes. | Event ObjectId | Yes |
| `participantId` | ObjectId ref Participant | yes | Target whose state changed. | Participant ObjectId | Yes |
| `participantName` | string snapshot | yes | Immutable display at action time; records remain historically readable after roster edits. | `Yacine Brahimi` | Yes |
| `participantEmail` | string snapshot | yes | Required by current history table/search. Privacy-protect and event-authorize. | `yacine@algiers-spaceapps.dz` | Yes |
| `participantCategory` | existing enum snapshot | no | Current table/detail context; snapshot category at action time. | `hacker` | Yes |
| `action` | enum | yes | API values `CHECK_IN`, `CHECK_OUT`; only valid state transitions are stored as ledger records. | `CHECK_IN` | Yes |
| `timestamp` | BSON Date | yes | Server clock in UTC; never client supplied. | `2026-11-14T08:15:00Z` | Yes |
| `result` | enum | yes | `success` for committed ledger transitions. Rejected/invalid scan attempts do not belong in this ledger. | `success` | Yes |
| `organizerId` | ObjectId ref User | yes | Derived from authenticated principal. | Organizer ObjectId | Yes |
| `organizerName` | string snapshot | yes | Immutable display name at action time. | `Amina Mansouri` | Yes |
| `idempotencyKey` | string | yes | Unique key scoped to event/request; prevents a retry from inserting another record. Limit length and avoid sensitive values. | `scan-01J...` | No |
| `terminalId` | string/ref | no | Current mock hardcodes this and has no trusted station identity. Include only after a station credential/registry exists. | `GATE-01` | If approved |
| `notes` | string | no | Not populated by current scan path; omit unless an audited use case is approved. | — | No by default |
| `createdAt` | BSON Date | yes | May equal timestamp; Mongoose timestamps are useful for DB audit. | ISO timestamp | Usually no |

Do not include raw QR tokens, token hashes, password/session data, or client-supplied organizer data in attendance records.

## 3. Status and calculation invariants

For each participant in an event:

| Current state | Meaning | Allowed successful next action |
|---|---|---|
| `pending` | No successful check-in ever. | `CHECK_IN` |
| `checked_in` | Present; latest successful transition was check-in. | `CHECK_OUT` |
| `checked_out` | Has checked in; latest successful transition was check-out. | `CHECK_IN` (re-entry) |

`firstCheckInAt` is set once, `lastCheckInAt` updates on each entry, and `checkOutAt` stores the latest exit time and remains after re-entry. A repeated action inconsistent with the current state yields a conflict and does not change state or append a successful record.

Dashboard roster counts derive from current `Participant.status`:

- `totalParticipants = checkedIn + checkedOut + pending`.
- `attendancePercentage = round((checkedIn + checkedOut) / totalParticipants * 100, 1)`; zero for an empty roster.
- History `totalCheckIns`/`totalCheckOuts` count action documents, not participants currently in that status.
- History `currentlyCheckedIn` counts current participant status `checked_in`.

## 4. Indexes and constraints

Recommended indexes (confirm names/collation during implementation):

### User

- Unique `{ emailNormalized: 1 }` for normalized login identity; `emailNormalized` is a persisted normalized field derived from the public `email`.
- If account identity becomes event-scoped, move uniqueness/authorization to an explicit membership model; do not allow ambiguous login accounts silently.

### Event

- Unique `{ slug: 1 }`.
- If there is a configured single current event, either a unique partial index on an `isCurrent` field or server configuration referencing the Event `_id`; avoid multiple current events.

### Participant

- Unique `{ eventId: 1, emailNormalized: 1 }` for CSV duplicate protection.
- Unique partial `{ eventId: 1, qrTokenHash: 1 }` for non-null token hashes (participants begin unissued, then receive or rotate a credential through the audited issue/rotate operation).
- `{ eventId: 1, status: 1, fullName: 1, _id: 1 }` for roster state/name queries.
- Search: case-insensitive prefix/Atlas Search index for normalized name/email/team or a deliberate search strategy; a naive regex over an unindexed field is not a safe large-roster search.
- Avoid a unique phone/category constraint; the frontend does not establish those as unique.

### AttendanceRecord

- `{ eventId: 1, timestamp: -1, _id: -1 }` for newest-first history.
- `{ eventId: 1, participantId: 1, timestamp: -1, _id: -1 }` for participant history.
- `{ eventId: 1, organizerId: 1, timestamp: -1, _id: -1 }` for organizer filtering.
- `{ eventId: 1, action: 1, timestamp: -1, _id: -1 }` for action/date filters.
- Unique `{ eventId: 1, idempotencyKey: 1 }`.
- Do not make a timestamp unique; multiple valid actions may happen in the same millisecond.

Validate all sort fields against an allowlist; never pass user-provided Mongo operators, paths, or raw filter objects into a Mongoose query. Add compound indexes based on measured query plans and production data.

## 5. Atomic check-in/check-out and idempotency

MongoDB Atlas supports transactions on a replica set. Use one session/transaction for a state transition and ledger append:

1. Validate/authenticate request and check event permission.
2. Look up participant by event and keyed QR digest; never query by raw token.
3. Check an existing `{eventId, idempotencyKey}`. If it is the same request, return the recorded result; if the same key names a different request, return conflict.
4. Conditionally update the participant using both `_id`/`eventId` and the expected current state. Example check-out filter: `{ _id, eventId, status: "checked_in" }`; set status and timestamps with the server clock.
5. If `matchedCount` is zero, distinguish the safe state conflict from a missing/invalid token without exposing whether a secret belongs to a different event.
6. Insert exactly one AttendanceRecord using the same transaction/session, with organizer identity from auth and event/participant display snapshots.
7. Commit. If the insert fails or the transaction aborts, the participant status update must also roll back.
8. Retry Mongo transient transaction/write conflicts safely. The conditional state predicate plus the idempotency unique index prevents concurrent operators from both creating the same transition. Resolve a duplicate-key retry by reading and returning the idempotent outcome when it is the same request.

Do not implement this as `read participant -> mutate in JS -> save -> append record` without a transaction/conditional update. Two scanners can observe the same status, and an insert failure after a save otherwise leaves state without history.

Idempotency keys protect transport retries; state preconditions protect distinct simultaneous scans that use separate keys. A repeat scan after a successful check-in with a new key returns `ALREADY_CHECKED_IN`, no new attendance record. Keep the idempotency record/unique key for at least as long as retries can reasonably arrive; if records themselves are permanent, the key can remain on the record.

## 6. Safe CSV import

Recommended workflow:

1. Authorize `participants:import`, enforce file size, row-count and request timeout limits, and parse streaming or bounded input.
2. Allow only the documented header set and required columns; reject malformed encoding, duplicate headers, malformed quoting, and unexpected columns.
3. Normalize and validate rows independently. Keep original row number and bounded validation codes, not a copy of the full uploaded file in logs.
4. Detect repeated normalized emails within the same file and duplicates in the event roster. Proposed policy is **skip; never overwrite participant state/history**.
5. With `dryRun=true` (default), return the validation report and perform no writes.
6. On commit, use the `Idempotency-Key`; insert valid unique rows, initialize state to `pending`, null attendance timestamps, and set `qrTokenHash` to null / `qrTokenVersion` to zero. Issue credentials separately through the audited one-time issue/rotate operation; store only their keyed hashes.
7. Ensure unique indexes settle concurrent duplicate imports. Handle duplicate-key races as skipped duplicates rather than partial silent corruption.
8. Return row counts and a bounded row error report. Add an import audit record (importer, event, digest, counts, time); establish retention/deletion policy for original uploads.
9. Do not issue raw tokens in a general list or import response. Define an admin-only badge-print flow that reveals each generated credential once. A one-by-one issue/rotate endpoint is documented as a minimum, but bulk printing remains a product decision.
10. Protect any CSV export from spreadsheet formula injection; prefix/escape cells beginning with formula-significant characters where applicable.

An all-or-nothing transaction is an alternative if the product rejects partial imports. Decide explicitly, test capacity/transaction limits, and keep the API response contract aligned with that choice.

## 7. Additional collections

Only User, Event, Participant, and AttendanceRecord are primary product models for v1. The following are supporting recommendations, not frontend-derived entities:

- `AuthSession`: hashed refresh credentials, revocation, rotation, expiry.
- `ImportBatch`: optional audit metadata and row counts; avoid storing raw CSV absent retention requirements.
- `ScanAttempt`/security audit: optional rejected scan logging, separate from attendance totals and protected by rate limits/retention.
- `EventMembership`: future multi-event permissions if a user may organize several events with different roles.

These are not substitutes for the four requested core schemas.
