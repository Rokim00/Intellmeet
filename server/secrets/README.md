# Secrets

This directory holds **local, git-ignored** secret files that Docker Compose mounts
into the API container at `/run/secrets/`. Nothing here is ever committed, and no
secret is ever baked into an image layer or passed as a plain environment value.

## Files

| File | Mounted as | Purpose |
| --- | --- | --- |
| `mongo_uri.txt` | `/run/secrets/mongo_uri` | MongoDB connection string |
| `jwt_access_secret.txt` | `/run/secrets/jwt_access_secret` | Signs access tokens |
| `jwt_refresh_secret.txt` | `/run/secrets/jwt_refresh_secret` | Signs refresh tokens |

## Generate them

From the repository root:

```bash
node server/scripts/generate-secrets.mjs
```

This writes cryptographically random values (64 bytes, hex) and creates
`mongo_uri.txt` from `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` when they are unset.
Re-running the script only regenerates secrets that do not already exist, so it is
safe to call before every `docker compose up`.

To point at MongoDB Atlas instead of the local container, replace the contents of
`mongo_uri.txt` with your Atlas connection string.

## How the app reads them

`server/src/config/env.ts` resolves every secret in this order:

1. `<NAME>_FILE` — read the file at that path (Docker / Kubernetes)
2. `<NAME>` — plain environment variable (local development)

There is no third fallback. A missing value stops the server with an error that
names every missing key, so a misconfigured deploy fails fast instead of running
on a publicly known signing key.

## Deployment

For anything beyond a local machine, generate the values in your platform's secret
manager (GitHub Actions secrets, AWS Secrets Manager, Kubernetes Secrets) and mount
them the same way — the app only needs the `*_FILE` path to be readable.

## Rotate

```bash
node server/scripts/generate-secrets.mjs --force
docker compose up -d --force-recreate server
```

Rotating the JWT secrets invalidates all existing access and refresh tokens, so
users must sign in again.
