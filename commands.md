# Commands

Every command used in this repo, with a one-line explanation. Run workspace
commands from the repository root.

## Setup

| Command | What it does |
| --- | --- |
| `pnpm install` | Installs dependencies for all workspace packages |
| `cp .env.example .env` | Creates the root env file from the template |
| `cp server/.env.example server/.env` | Creates the server env file from the template |

## Development

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the API server and the web client together |
| `pnpm dev:server` | Runs only the API server with hot reload |
| `pnpm dev:client` | Runs only the Vite dev server for the client |
| `pnpm build` | Builds the server and client for production |
| `pnpm build:server` | Compiles the server TypeScript to `server/dist` |
| `pnpm build:client` | Type-checks and builds the client bundle |
| `pnpm lint` | Runs ESLint across both packages |
| `pnpm lint:fix` | Runs ESLint with auto-fix |
| `pnpm lint:server` / `pnpm lint:client` | Lints one package |

## API

| Command | What it does |
| --- | --- |
| `pnpm openapi` | Dumps the OpenAPI spec to `server/openapi.json` |
| `GET /api/v1/health` | Liveness check for the API |
| `GET /api/docs` | Swagger UI for every documented endpoint |

## Secrets

| Command | What it does |
| --- | --- |
| `pnpm secrets:generate` | Generates `server/secrets/*.txt` for Docker |
| `node server/scripts/generate-secrets.mjs --force` | Regenerates all secrets (invalidates existing tokens) |

Secrets live in `server/secrets/` and are git-ignored. The API reads them from
`/run/secrets/*_FILE` in Docker, or from `server/.env` in local development.
There are no default secret values in code — a missing one stops the server.

## Docker

| Command | What it does |
| --- | --- |
| `pnpm docker:up` | Generates secrets, then builds and starts the full stack |
| `pnpm docker:down` | Stops and removes the containers |
| `pnpm docker:logs` | Follows container logs |
| `pnpm docker:tools` | Starts the stack plus mongo-express and the S3 emulator |
| `docker compose up --build` | Same as `docker:up` without the secret step |
| `docker compose --profile tools up -d` | Starts only the optional tooling services |
| `docker compose down -v` | Stops everything and deletes the database volume |

| Service | URL |
| --- | --- |
| Web client | http://localhost:3000 |
| API + Swagger | http://localhost:5000 |
| MongoDB UI (optional) | http://localhost:8081 |
| S3 emulator (optional) | http://localhost:4566 |

Ports are configurable in `.env` via `CLIENT_PORT`, `SERVER_PORT`, and
`MONGO_EXPRESS_PORT`.

## Per-package

Run from inside `client/` or `server/`:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm lint` | Lint the package |
