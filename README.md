# Intellmeet

AI-Powered Enterprise Meeting & Collaboration Platform

> Progress-tracked README: what the product is, the feature list, and how much of it is implemented today.
>
> All commands and their purpose: [`commands.md`](./commands.md).

---

## Status Legend

| Icon | Meaning |
| --- | --- |
| ✅ | Implemented and wired end-to-end |
| 🟡 | Partially implemented (UI or scaffolding only) |
| ⬜ | Not started |

---

## Current Progress — ~35%

Weeks 1–2 of the 4-week plan are largely done on the **backend foundation** side.
Auth, org/team management and project management are live. Real-time video/chat and
AI meeting intelligence are the remaining bulk of the work.

| Area | Status | Notes |
| --- | --- | --- |
| Monorepo + tooling | ✅ | pnpm workspaces, TypeScript, ESLint, dev/build scripts |
| API server core | ✅ | Express, helmet, CORS, cookie parser, 16 kb body limit, Swagger UI at `/api/docs` |
| Response/error layer | ✅ | `ApiResponse`, `ApiError`, `notFoundHandler`, `errorHandler`, `asyncHandler` |
| Auth (F01) | ✅ | Register, login, refresh, logout, `/auth/me`; JWT + bcrypt, httpOnly refresh cookie |
| Organizations / teams (F06) | ✅ | Org details, member list, invite-code verify & regenerate |
| Projects (F06) | ✅ | CRUD, project members, role update, remove member |
| Socket.io bootstrap | 🟡 | Typed Socket.io server attached; only connect/disconnect handled |
| WebRTC video meetings (F02) | ⬜ | No signaling or peer logic yet |
| In-meeting chat (F04) | ⬜ | Page shell only |
| AI intelligence (F03) | ⬜ | Transcription, summary, action items not started |
| Post-meeting dashboard (F05) | 🟡 | UI page exists, no recordings/summaries data |
| Analytics (F07) | ⬜ | Not started |
| Docker / CI-CD | 🟡 | Multi-stage Dockerfiles, Compose stacks and file-based secrets done; CI/CD pipeline pending |

---

## Features

### F01 — Authentication & Profiles ✅
- Signup, login, token refresh, logout
- Password hashing with `bcryptjs`
- Access token + rotating refresh token in an `httpOnly`, `sameSite=strict` cookie
- Protected route middleware and `GET /api/v1/auth/me`
- Client: `AuthContext`, zod-validated Login/Signup forms, protected/guest route guards

### F02 — Real-Time Video Meetings ⬜
- WebRTC peer mesh with Socket.io signaling
- Screen sharing, recording, mute/camera controls
- Participant presence list

### F03 — AI Meeting Intelligence ⬜
- Live transcription
- Auto-generated summary
- Action-item extraction with assignees

### F04 — Real-Time Chat & Collaboration ⬜
- In-meeting chat over Socket.io
- Shared notes, task creation during a meeting

### F05 — Post-Meeting Dashboard 🟡
- Meeting history, recordings, summaries, action items
- Searchable history and export

### F06 — Team & Project Management ✅
- Organization workspace with invite codes
- Project CRUD with status filters
- Project member management and roles
- Client: dashboard, projects list, member table with edit/remove modals, team switcher

### F07 — Analytics & Insights ⬜
- Meeting frequency and productivity metrics
- Exportable reports

### Platform / Cross-cutting ✅
- OpenAPI + Swagger UI documentation
- Health checks (`/api/v1/health`, legacy `/api/health`)
- Centralized logging, typed socket event contracts, tolerant JSON parser in dev
- Light/dark theme, responsive sidebar layout, reusable UI primitives

---

## Implemented API Surface

```
GET    /                       Welcome
GET    /api                   Welcome
GET    /api/health            Legacy health
GET    /api/docs              Swagger UI
GET    /api/docs/json         OpenAPI spec

GET    /api/v1/health
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/organizations/me
GET    /api/v1/organizations/members
GET    /api/v1/organizations/invite/:code
POST   /api/v1/organizations/invite/regenerate

POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
GET    /api/v1/projects/:id/members
POST   /api/v1/projects/:id/members
PATCH  /api/v1/projects/:id/members/:userId
DELETE /api/v1/projects/:id/members/:userId
```

---

## Next Up
1. Meeting model + CRUD and WebRTC signaling over the existing Socket.io server
2. Real-time chat and in-meeting presence
3. AI transcription → summary → action item pipeline
4. Persist meetings/tasks behind the existing Meetings and Tasks pages (currently local state)
5. Kubernetes manifests/Helm chart and a GitHub Actions CI pipeline on top of the Docker setup
6. Prometheus/Grafana/Sentry observability

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 |
| UI | Base UI / shadcn-style primitives, Lucide icons |
| Forms & Validation | React Hook Form, Zod |
| Backend | Node.js, Express 4, TypeScript |
| Database | MongoDB (Mongoose 8, Typegoose) |
| Real-Time | Socket.io 4 (typed events) |
| Auth | JWT + bcryptjs |
| Docs | Swagger / OpenAPI |

---

## Getting Started

```bash
pnpm install
pnpm dev            # server + client together
pnpm dev:server     # API only
pnpm dev:client     # web client only
pnpm build
pnpm lint
pnpm openapi        # dump OpenAPI spec
```

Environment configuration lives in `server/src/config/env.ts` (see `.env.example`).

---

## Docker

```bash
pnpm secrets:generate   # writes server/secrets/*.txt (git-ignored)
pnpm docker:up          # builds and starts client + server + mongo
pnpm docker:logs
pnpm docker:down

pnpm docker:tools       # also starts mongo-express (8081) and the S3 emulator (4566)
```

| URL | Service |
| --- | --- |
| http://localhost:3000 | Web client (nginx, proxies `/api` to the server) |
| http://localhost:5000 | API + Swagger UI (`/api/docs`) |
| http://localhost:8081 | MongoDB UI (optional profile) |

**Images**
- `server/Dockerfile` — build TypeScript, then run `dist/server.js` on Node 22 Alpine as a non-root user with a healthcheck on `/api/v1/health`
- `client/Dockerfile` — build the Vite bundle, serve it from `nginx:alpine` with SPA fallback, immutable asset caching and a WebSocket-capable `/api` reverse proxy

**Compose files**
- `docker-compose.yml` (root) — full stack: client, server, MongoDB, plus optional `tools` profile
- `server/docker-compose.yml` — server + MongoDB only

**Secrets**
Credentials are never passed as plain environment values and never baked into an
image. Compose mounts them as read-only files under `/run/secrets`, and
`server/src/config/env.ts` reads each value from `<NAME>_FILE` first, then falls
back to `<NAME>`. There are **no default secret values in code** — a missing
`MONGO_URI`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` stops the server with a
clear error instead of running on a known key. See `server/secrets/README.md`.

**Build config**
`VITE_API_BASE_URL` is a public build-time variable, not a secret. Compose defaults
it to `/api/v1` so the client calls the nginx proxy on its own origin; override it
in `.env` when the API lives on a different host.


---

Zidio Development
