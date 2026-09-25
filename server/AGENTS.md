# Server Rules — IntellMeet

Express + TypeScript + MongoDB API. Root `AGENTS.md` applies too.

## 1. Architecture

Layered, one direction only. A layer never imports from a layer above it.

```
routes/ → middlewares/ → controllers/ → services/ → models/
             ↓                              ↓
     (auth, error, 404)              (Mongoose models)
```

- `routes/` — path, method, middleware chain, OpenAPI JSDoc. No logic.
- `controllers/` — read `req`, call one service, return `ApiResponse`. No queries.
- `services/` — all business logic and database access. The only place that
  touches a model.
- `models/` — Typegoose schema, indexes, virtuals.
- `middlewares/` — auth, error, 404. Applied in `app.ts`.
- `utils/` — stateless helpers (`ApiResponse`, `ApiError`, `asyncHandler`,
  `pagination`, `validation`, `logger`, `codeGenerator`).

## 2. Response Contract

Every response goes through `ApiResponse.success` / `ApiResponse.error`:

```json
{ "success": true, "message": "...", "data": {}, "meta": {}, "errors": [] }
```

`ApiError` carries an HTTP status and an optional field-level `errors` array. The
client's `parseApiError()` reads exactly this shape — changing it breaks the UI.

Use `asyncHandler` on every async route. Never let a rejected promise reach
Express unhandled.

## 3. Validation

Validate every input at the route or service boundary before it reaches a model.
Reject unknown fields rather than persisting them.

## 4. Auth and Secrets

- Access tokens are short-lived and stateless; refresh tokens rotate and live in
  an `httpOnly`, `sameSite=strict` cookie.
- `authenticateUser` guards protected routes. `authorizeRoles(...)` guards
  role-restricted routes. Apply both where relevant — never one alone.
- **`env.ts` has no fallback values for secrets.** Do not add one. A missing
  `MONGO_URI`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` must exit the process,
  not resolve to a default.
- Secrets come from `<NAME>_FILE` (Docker/Kubernetes) or `<NAME>` (env var).
  Never log them, never return them, never put them in an error message or a
  health response.
- Health endpoints expose liveness only — no version strings, no connection
  strings, no hostnames.

## 5. API Documentation

Every route carries an `@openapi` JSDoc block with summary, tags, parameters,
request body, and responses. `/api/docs` is generated from these, so an
undocumented route is invisible to the client team and to reviewers.

Regenerate the spec with `pnpm openapi` after changing routes.

## 6. Database

- One model file per collection. Schemas via Typegoose with explicit types.
- Indexes must be declared in the schema, not created ad hoc.
- Never rename or drop a collection, field, or index without an explicit
  migration plan and approval.
- Prefer `lean()` on read-only queries.
- Populate only the fields the client actually renders.

## 7. Real-Time

Socket.io is initialized once in `server.ts` via `initSocket`, and accessed
through `getIO()`. Never create a second server or import the instance directly.

Event payloads are typed in `src/types/socket.types.ts` (`ClientToServerEvents`,
`ServerToClientEvents`). Add new events there, not as ad-hoc strings.

Every socket handler authenticates the connection and validates its payload.

## 8. Errors and Logging

- Throw `ApiError` for expected failures; let unexpected errors reach
  `errorHandler`, which hides internals and returns a generic 500.
- Log through `logger`. Never use `console.log` outside bootstrap and config
  validation, which runs before the logger exists.
- Never log tokens, passwords, request bodies containing credentials, or PII
  beyond what the feature needs.

## 9. Shutdown

`SIGINT` / `SIGTERM` close the HTTP server, then the DB connection, with a 10s
forced-exit guard. Keep that intact when adding background work.

## 10. Docker

Secrets arrive as files under `/run/secrets`, never as build args or image
layers. The image runs as the non-root `node` user and must keep its healthcheck
on `/api/v1/health`. If you add an outbound dependency, add it as a health-gated
service in Compose.

## 11. Before You Finish

- [ ] Layering respected; no logic in routes, no queries in controllers
- [ ] Responses use `ApiResponse`; errors use `ApiError`
- [ ] Every input validated; every async route wrapped in `asyncHandler`
- [ ] Protected routes have both `authenticateUser` and `authorizeRoles` as needed
- [ ] No secret default, no secret logged, no secret in a response
- [ ] Route documented with `@openapi`; `pnpm openapi` regenerated
- [ ] New socket events typed in `socket.types.ts`
- [ ] Graceful shutdown unaffected
- [ ] `pnpm build` and `pnpm lint` pass

## Principle

Smallest correct change, clear layering, fail loudly on bad configuration.
