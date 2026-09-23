# Server Codebase Protection & Client Tweak Rule

## Scope
Applies to all AI agent interactions within this workspace.

## Role Verification Protocol
Before modifying files in `server/`, check `.agents/role.local`:
- **Server Lead**: If `.agents/role.local` exists with `ROLE=server_lead`, full server development is authorized.
- **Client / External Dev**: If missing, only **minor non-breaking tweaks** are permitted under the policy below.

## Client Developer Scope in `server/`
1. **Allowed**:
   - Small non-breaking tweaks (e.g. adding optional response field, minor bug fix, client-specific query param).
2. **Strictly Forbidden**:
   - Do NOT break existing API contracts or response schemas.
   - Do NOT touch database schemas, collections, or Mongoose models.
   - Do NOT modify authentication, core architecture, routing structure, or server dependencies.
   - Do NOT perform sweeping refactoring.

## Mandatory "Caveman" Commit Format for Server Tweaks
When committing server tweaks from a client session, the commit message MUST be direct and plain:
```
server: <what changed>
why: <short direct reason>
affects: <exact client component or file affected>
```
No filler words, no corporate jargon. Clearly state what was touched and what it affects.
