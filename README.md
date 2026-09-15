# TaskFlow web

Next.js App Router, React, TypeScript, and Tailwind CSS frontend for the existing
[TaskFlow API](https://taskflow-api-1-11gt.onrender.com).

## Development

1. Run `npm ci` to install the locked dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev` and open http://localhost:3000.

`TASKFLOW_API_URL` is a server-only backend **origin**, without `/api/v1`, a query,
or credentials. Production requires HTTPS. Set it in the deployment environment;
do not rename it with a `NEXT_PUBLIC_` prefix. Configuration is validated on the
first API request, so placeholder pages can build without a configured backend.

## Milestone 1 scope

`/`, `/login`, `/register`, `/dashboard`, and `/projects/[id]` are placeholders.
The `(protected)` route group is organizational and **does not enforce access yet**.
Pages do not fetch or display private data. There are no login/registration flows,
cookies, mutation handlers, or CRUD controls.

## Structure and boundaries

- `app/`: server-rendered pages and route-group layouts.
- `components/ui/`: the shared page heading currently used by all pages.
- `types/`: documented API/domain contracts; UUIDs/date-times stay strings.
- `lib/api/error.ts`: shared normalized `ApiError`.
- `lib/server/config.ts`: lazy environment configuration.
- `lib/server/api/`: server-only fetch wrapper and profile/project/task reads.

Server modules use Next.js's built-in `server-only` marker (no added dependency).
Domain functions accept an explicit token; session storage and cookie access are
deferred to the authentication milestone. Do not pass tokens to Client Components.
Unused feature/session folders will be introduced with their first implementation.

The wrapper uses native fetch, JSON bodies, encoded query parameters, a 30-second
timeout covering body reads, `no-store`, and no redirects or automatic retries.
Use `apiFetch<void>` for endpoints returning `204`. Errors preserve HTTP status,
backend code, validation locations, and request ID; network errors have null status.
Malformed/non-JSON responses become normalized errors. Configuration errors remain
developer errors. Backend messages are data, not HTML; future UI should map known
codes to safe messages rather than indiscriminately displaying backend messages.

Types follow the OpenAPI contract inspected during planning. Success payload types
are compile-time contracts, not runtime schema validation. Error envelopes are
checked at runtime. Lists contain `items`, `limit`, and `offset`, with no total.
Refresh/revocation endpoints are not documented; no refresh behavior is assumed.

## Checks

- `npm run lint`
- `npm run build`

Neither command needs API credentials or makes requests to TaskFlow. The existing
Google font integration may require network access at build time.
