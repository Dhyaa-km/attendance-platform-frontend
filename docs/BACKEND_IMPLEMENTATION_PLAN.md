# Backend Implementation Plan

**Status:** Proposed sequence for two developers working collaboratively, function by function. It is a plan only; backend code is not included.

## Working agreement

- Both developers review the API contract, database invariants, validation schemas, and tests for each milestone; avoid dividing the work into permanently isolated frontend/back-end layers.
- Pair on high-risk boundaries: auth/cookies, QR token handling, Mongo transactions, and imports.
- Agree request/response Zod schemas and error codes before parallel implementation. Keep API contract and tests as the shared source of truth.
- Use short-lived branches/PRs with one vertical slice at a time. Each PR includes tests and examples; the other developer reviews the implementation and updates the contract if needed.
- Do not expose a route until its authentication, authorization, validation, and error mapping are tested.

## Milestone 0 — Contract decisions and repository foundation

**Objective:** Resolve the few product/security decisions that change schema and API behavior; establish a runnable Node.js/Express 5/TypeScript/Mongoose/Zod backend skeleton.

**Models:** None in application routes; database connection readiness only.

**Endpoints:** Health/readiness endpoint may be added for deployment operations; it is not part of the frontend contract.

**Dependencies:** None.

**Collaborative work:** Developer A drafts project configuration, environment validation, logging/error middleware; Developer B writes API contract tests/types and reviews dependency/security choices. Pair-review every decision.

**Decisions required:** `participants:import` assignment; current event selection; import partial vs all-or-nothing; one-time/bulk badge printing; JWT cookie/refresh lifetime; CSRF approach; failed scan audit and retention; organizer access to participant PII; allowed event status transition.

**Tests:** TypeScript build; startup with missing/invalid environment variables fails clearly; CORS preflight with the actual frontend origin; request ID/error-envelope tests; health/readiness and database-unavailable behavior.

**Definition of done:** A documented versioned API base path and validated config; errors are normalized; no secret is checked into source; deployment and local CORS/cookie assumptions are explicit.

## Milestone 1 — Core schemas, indexes, seed strategy, and event bootstrap

**Objective:** Create core Mongoose schemas and a safe event seed/bootstrap flow before feature endpoints depend on them.

**Models:** `User`, `Event`, `Participant`, `AttendanceRecord`; supporting `AuthSession` and eventual `EventMembership` discussed in [DATABASE_DESIGN.md](./DATABASE_DESIGN.md).

**Endpoints:** `GET /api/v1/events/current`, `GET /api/v1/events/:eventId`.

**Dependencies:** Milestone 0 contract decisions.

**Collaborative work:** One developer implements the event/user schema and current-event bootstrap; the other implements participant/attendance schema definitions and index review; pair-review cross-references, unique constraints, safe DTO projections, and seed idempotency before merge.

**Tests:** Schema validation for enum, required fields and dates; event slug uniqueness; participant unique email per event; QR hash uniqueness; representative query plans for history/list indexes; event bootstrap denied to non-members; no sensitive field in JSON serialization.

**Definition of done:** One idempotently seeded Algiers 2026 event and organizer accounts; schema/index migrations documented; a safe event DTO is returned; raw QR and password fields are excluded from projections.

## Milestone 2 — Authentication and authorization vertical slice

**Objective:** Replace browser mock session behavior with real organizer login, session restore, refresh, logout, and event permission checks.

**Models:** `User`, `AuthSession` (recommended).

**Endpoints:** `GET /auth/csrf`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`.

**Dependencies:** Milestone 1 user/event and membership/permission decisions.

**Collaborative work:** Pair on cookie/CSRF/session design. One developer implements login/session functions; the other builds Zod request schemas and tests against the agreed envelope; exchange reviews and test replay/revocation behavior together.

**Tests:** Valid/invalid credentials with non-enumerating messages; inactive account; email normalization; rate limits; secure cookie flags; CSRF/origin rejection; `/me` with no/expired/valid cookie; refresh rotation/reuse detection; logout revocation and idempotency; unauthorized event membership.

**Definition of done:** Frontend can use credentialed Axios without storing JWTs; logout invalidates refresh session; `useAuthStore` can restore session and handle expected `401` distinctly from network failure.

## Milestone 3 — Participant roster read and CSV import

**Objective:** Implement the read path used by Participants and a safe administrator-only roster ingest.

**Models:** `Event`, `Participant`, `User`; optional `ImportBatch`; optional `AuthSession` middleware.

**Endpoints:** `GET /events/:eventId/participants`; `GET /events/:eventId/participants/:participantId`; `POST /events/:eventId/participants/import`; later one-time token issuance/rotation endpoint after the badge-print decision.

**Dependencies:** Milestones 1 and 2; agreed import/admin and QR issuance policy.

**Collaborative work:** Pair on row-level CSV schema and duplicate semantics. One developer implements list/detail query functions and index-backed filters; the other implements bounded streaming parse/validation/report. Review the shared public DTO and test invalid/duplicate/concurrent import cases together.

**Tests:** Search across name/email/team; allowlisted category/status filters; stable server paging and event-wide counts; unknown ID and cross-event ID; notes/PII projection; CSV MIME/size/row limits; malformed headers/encoding; normalized duplicate emails; duplicate rows within one upload; dry-run performs no writes; committed valid rows initialize `pending`; retries with same idempotency key; concurrent duplicate email; import permission denied.

**Definition of done:** Participant registration remains absent; authorized import is auditable; roster APIs paginate and return counts consistently; no API response reveals the raw QR token.

## Milestone 4 — QR token security and atomic attendance write

**Objective:** Make scanning a safe, idempotent, atomic attendance state transition.

**Models:** `Participant`, `AttendanceRecord`, `User`, `Event`; optional `ScanAttempt`.

**Endpoints:** `POST /events/:eventId/attendance/scans`; one-time credential issuance/rotation route if approved.

**Dependencies:** Milestones 1–3 and complete auth/authorization.

**Collaborative work:** Pair program the token-generation/hash/lookup and transaction algorithm. One developer writes the transition/service function, the other authors concurrency/idempotency/state tests first. Both inspect logs and public projections for credential leaks.

**Tests:** At least 256-bit unpredictable token generation; hash-at-rest and no raw token in logs/DTOs; valid check-in/out; pending check-out denied; repeated check-in/out conflict; checkout/re-entry preserves first and updates last timestamps; same-key retry returns one record; same key/different body conflict; concurrent same participant scans yield one legal transition; transaction rollback if ledger insert fails; unknown/cross-event/revoked token generic response; authenticated organizer snapshot is server-derived.

**Definition of done:** Every successful state mutation and exactly one immutable record commit in one transaction; failed attempts do not alter status/history; duplicate/concurrent scans cannot duplicate an operation; scan response maps cleanly to the existing scanner result UX.

## Milestone 5 — Dashboard and attendance history reads

**Objective:** Support dashboard telemetry and the history table/detail/filter workflows with scalable queries.

**Models:** `Participant`, `AttendanceRecord`, `Event`, `User`.

**Endpoints:** `GET /events/:eventId/dashboard`; `GET /events/:eventId/attendance/summary`; `GET /events/:eventId/attendance`; `GET /events/:eventId/attendance/:recordId`.

**Dependencies:** Milestones 1–4, because read results must agree with committed transitions.

**Collaborative work:** One developer builds dashboard and aggregate pipelines; the other builds history filtering/pagination/detail. Pair-review metric definitions and event-time-zone boundaries, then swap code reviews.

**Tests:** Current state counts sum to total; empty-roster percentage zero; lifetime action counts differ correctly from current state counts; repeated entries appear as separate records; stable tie-break sorting; inclusive local date range converted to half-open UTC; participant name/email and organizer/action filters compose; history detail snapshot remains stable after roster/user rename; pagination/count consistency; no raw token in recent activity.

**Definition of done:** Dashboard, summary, table, and detail share definitions and data source; filters/sorts are allowlisted and index-supported; history remains append-only.

## Milestone 6 — Frontend API service integration

**Objective:** Replace mock adapters with Axios-backed services without rewriting feature components unnecessarily.

**Models:** No schema changes expected; use agreed DTOs.

**Endpoints:** Auth, event, participants, scan, dashboard, attendance endpoints from milestones 2–5.

**Dependencies:** Stable endpoint and error contracts from those milestones.

**Collaborative work:** Both developers pair on Auth and scanner adapters first. Then one wires participant/dashboard service adapters while the other wires attendance service adapters; review each other's mapping and finish with an integrated browser run.

**Tests:** Type-check, lint, service unit tests with mocked HTTP responses, session restoration and intended-route redirect, scanner conflict/invalid/success mapping, idempotency retry, roster filters/pagination, dashboard totals, history filters and date handling, CSV all-filtered export, logout/protected routes, loading/error/retry states, responsive UI, no raw token in network logs or page errors.

**Definition of done:** No operational screen reads mock data; client/server DTOs are explicit; public UI handles 401/403/409/429/5xx states; camera and manual scan invoke the same secure endpoint.

## Milestone 7 — Hardening, deployment readiness, and acceptance

**Objective:** Validate cross-cutting security, operational behavior, and production configuration.

**Models:** All above; backups and indexes monitored.

**Endpoints:** Full API contract.

**Dependencies:** Milestones 0–6.

**Collaborative work:** Both developers run an acceptance checklist, independently review authorization and data exposure, inspect query plans/logging, and approve release together.

**Tests:** Integration tests against a replica-set test database; transaction/concurrency tests; CSRF/CORS/JWT/session tests; role matrix for every endpoint; file upload abuse tests; API contract/schema compatibility; time-zone boundary tests; load tests for paginated list/history/aggregate; backup/restore and Atlas connection failure runbook; frontend browser smoke suite.

**Definition of done:** Threat-sensitive paths have tests and documented failure behavior; import/QR print responsibilities are resolved; rate limits, secrets, CORS, logs, retention, indexes, monitoring, and recovery are configured; both developers sign off on the API contract and acceptance results.

## Suggested function-by-function pairing

For each endpoint, collaborate in this order:

1. Agree Zod input/output schemas, status codes, and permission function.
2. Write a failing service/route test for success, validation, authorization, and error behavior.
3. Implement the smallest model query/service function and transaction boundary.
4. Add the Express handler with standardized envelope and request ID.
5. Review the route for authorization placement, secret leakage, query injection, and error semantics.
6. Integrate the mock service adapter only after the backend test passes.
7. Run the milestone regression suite and update all four docs if a contract decision changes.

Do not split a shared state transition so that each developer independently decides its own transaction or error semantics.

## Cross-milestone acceptance checklist

- [ ] JWTs never appear in JSON, browser storage, logs, or URLs.
- [ ] Organizer identity, current status, action outcome, timestamps, and QR lookup are server-authoritative.
- [ ] All event queries include event authorization and event scope.
- [ ] Every successful transition is transactionally paired with one immutable record.
- [ ] Repeated scans, retries, and concurrent scans cannot create an invalid or duplicate transition.
- [ ] Participant counts use current state; action totals use history records.
- [ ] Date filters use the event's IANA timezone and UTC storage.
- [ ] CSV import cannot overwrite attendance state or bypass unique indexes.
- [ ] Participant DTOs, dashboard activity, history, errors, and logs contain no raw QR token.
- [ ] Frontend retains loading, empty, retry, duplicate-scan, invalid-token, logout, and protected-route behavior.
