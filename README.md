# TaskFlow web

Next.js App Router, React, TypeScript, and Tailwind CSS frontend for the existing
[TaskFlow API](https://taskflow-api-1-11gt.onrender.com).

## Development

1. Run `npm ci` to install the locked dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev` and open http://localhost:3000.

`TASKFLOW_API_URL` is the server-only backend **origin**, without `/api/v1`,
credentials, query, or fragment. API modules include `/api/v1` in their paths.
`APP_ORIGIN` is the frontend origin used to validate mutation requests. Update its
port if you run development on a port other than 3000. Neither variable should
use a `NEXT_PUBLIC_` prefix. The example contains no credentials.

For production, set both origins to their HTTPS deployment URLs. `APP_ORIGIN`
is required and is not inferred from forwarded headers. Production uses Secure
cookies; use HTTPS for full production-mode browser testing. Configuration is
resolved at request time, so builds do not require a running API.

## Implemented scope

- `/register`: creates an account and redirects to `/login?registered=1`.
- `/login`: logs in through a same-origin Route Handler and redirects to `/dashboard`.
- `/dashboard`: verifies the current user, lists paginated projects, and offers creation.
- `/projects/[id]`: authenticated project details, editing, and confirmed deletion. Tasks remain a placeholder.
- `/`: redirects to login/dashboard according to the verified session.
- `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`.

## Authentication and boundaries

The JWT is held in a host-only `taskflow_session` cookie: HttpOnly, SameSite=Lax,
Path=/, Secure in production, and Max-Age matching the API's `expires_in` seconds.
Tokens are never returned in handler response bodies or passed to Client Components.
The browser necessarily stores the HttpOnly cookie, but browser JavaScript cannot
read it. Server modules use Next.js's built-in `server-only` marker without an
additional dependency.

The server verifies sessions against `/api/v1/users/me`. React `cache` deduplicates
verification within a server render; it does not share sessions across requests.
Both protected pages and the protected layout check authentication. Project/task
read modules independently verify the session and read the token internally; callers
no longer pass tokens. FastAPI still enforces ownership and bearer authentication.

Anonymous/invalid sessions redirect to login. An unavailable backend shows a retry
state and preserves the cookie. Invalid cookies remain until replacement, logout,
or expiry because Server Components cannot modify cookies during rendering.
Logout works even when FastAPI is unavailable. Login/logout use full navigation to
clear the current tab's Next.js navigation cache. Already-open tabs are not actively
synchronized; their next request will recheck authentication.

All auth POST handlers require an exact trusted Origin and application/json content
type. There are no GET mutations or arbitrary redirect destinations. Form validation
runs in both browser and handlers; the backend remains authoritative. Passwords are
not trimmed or logged. Upstream error bodies/messages are never forwarded to the UI;
known errors map to safe field/form messages. Account responses and server fetches
use no-store. Next.js dynamically renders cookie-dependent pages (development uses
its own no-cache headers; production returns private/no-store headers).

There are no refresh tokens. Logout clears the browser credential but cannot revoke
a copied JWT without backend support. Authentication failures retain validated upstream request IDs in the X-Request-ID
response header; session-unavailable pages display a safe support reference. Raw
upstream errors and credentials are not logged or exposed. Native authentication
forms explicitly POST to their auth handler, keeping credentials out of URLs when
JavaScript is unavailable; form-encoded submissions are safely rejected with 415.

No new dependencies or backend changes were
introduced. Forms require JavaScript. Rate limits remain the backend's responsibility;
429 responses show a wait message, without automatic retries or a countdown.

## Structure

- `app/`: pages, layouts, loading/error states, and auth Route Handlers.
- `components/auth/`: forms, logout, and session-unavailable feedback.
- `components/ui/`: shared page heading.
- `types/`: API/domain contracts; UUIDs/date-times remain strings.
- `lib/auth/validation.ts`: shared credential validation and field errors.
- `lib/api/error.ts`: normalized API errors.
- `lib/server/config.ts`: lazy server configuration.
- `lib/server/auth/`: cookie helpers, session verification, origin checks, safe errors.
- `lib/server/api/`: fetch wrapper and API modules.

The fetch wrapper uses native fetch, encoded query parameters, a 30-second timeout
covering body reads, no-store, and no redirects or automatic retries. A failed body
read preserves any known HTTP status/request ID. Use `apiFetch<void>` for `204`.
Error envelopes are validated at runtime; general resource response types are
compile-time contracts. Authentication validates token shape/lifetime and explicitly
projects current-user fields. Lists contain items/limit/offset, without total counts.

## Verification

- `npm run lint`
- `npm run build`
- `git diff --check`

Milestone 2 was exercised locally with an in-memory API fixture: registration,
login, validation, duplicate email, cookie lifetime, session persistence, logout,
protected routes, origin/content-type rejection, invalid sessions, and outages.
Browser checks cover forms and navigation. Separate production-mode checks cover
Secure cookies, cache headers, and live FastAPI invalid-credential rejection.
No production accounts are created by these checks. The temporary test fixture is
not part of the app. The existing Google font integration can require network access
at build time.

## Milestone 3: projects

Project reads and mutations use non-redirecting `verifySession`/`authenticatedFetch`.
`requireSession` is a page-only adapter; pages handle project-read 401s with login
redirects. JSON project handlers return JSON 401s, never navigation responses.
Origin/JSON checks are shared with auth handlers. Every domain operation verifies
its session and forwards the bearer token; ownership remains enforced by FastAPI.
Only name/description are accepted from project forms. IDs are encoded as path
segments against a fixed upstream origin. Mutation responses expose only an ID or
success flag, and safe errors preserve request IDs. No tokens reach client props.

POST `/api/projects` creates; PATCH/DELETE `/api/projects/[id]` edit/delete.
The edit form submits both fields; PATCH also accepts individual fields and preserves omissions. Explicit null and empty descriptions are forwarded unchanged. Empty descriptions
are allowed; no undocumented maximum is imposed. Delete maps upstream 204 to an
empty 204 response. Mutations are not automatically retried, since a timeout can
occur after a successful write. Reload before retrying an uncertain change.

Dashboard pagination validates limit (1–100) and offset, defaults to 20/0, and
preserves other query parameters. There is no total count: Next is available for
full pages and can lead to an empty final page with Previous navigation. Creation
opens the new project. Saving refreshes uncached server data; deleting the current
project replaces navigation with the dashboard. Not-found reads use the backend's
404 response; 403, validation, conflict, and unavailable errors remain distinct.

Verification includes local fixture CRUD, authentication/ownership rejection,
JSON 401 responses, pagination, origin/content type checks, safe errors, and 204
handling. No production project data is created or changed by these checks.

### Project failure diagnostics

Mutation failures use allowlisted codes: UPSTREAM_TIMEOUT, UPSTREAM_NETWORK_ERROR,
and SERVICE_UNAVAILABLE distinguish uncertain transport failures from service errors.
Uncertain writes advise reloading/checking before retrying; there are no automatic
retries. Browser errors retain validated request IDs even on 401 and unreadable
response bodies. For a detail-page 404, the validated reference is recorded in the
server log as `project_unavailable`; the public not-found response stays identical
for missing/inaccessible projects. No resource IDs, tokens, bodies, or backend
messages are logged there.
