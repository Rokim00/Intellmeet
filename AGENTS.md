# Repository AI Agent Guidelines & Architecture Rules

## 1. Overview & Architecture Boundaries

This repository consists of two separate sub-projects:
- **`server/`**: Backend API, database connections, authentication, and core business logic (owned by the Server Lead).
- **`client/`**: Frontend user interface, client-side state, and UI components.

To maintain system stability, prevent breaking changes, and preserve architectural integrity, all AI coding agents (including Antigravity, Cursor, GitHub Copilot, Gemini Code Assist, ChatGPT, Claude, and related tools) must strictly adhere to the rules outlined below.

---

## 2. Server Codebase Protection & Role Verification

### 2.1 Role Verification Protocol (Local Role Token)
To verify whether the session is operated by the Server Lead or a Client Developer:
1. **Verification File**: The AI agent checks for the local file `.agents/role.local`.
2. **Authorized Role**: The file must exist and contain `ROLE=server_lead`.
3. **Session Behavior**:
   - **If `.agents/role.local` is present with `ROLE=server_lead`**: The session is verified as the Server Lead. Full server refactoring and feature development are authorized.
   - **If `.agents/role.local` is missing or unauthorized**: The session is identified as a Client / External Contributor. The session is subject to the **Limited Small Tweaks Policy** below.
4. **Git Protection**: `.agents/*.local` is strictly ignored by `.gitignore`. It remains only on the Server Lead's local machine and is never shared via Git.

---

## 3. Limited Small Tweaks Policy (For Client / Non-Server Sessions)

Client developers and their AI assistants are permitted to make **minor, non-breaking tweaks** in `server/` when strictly necessary to support client features, under these precise conditions:

### 3.1 Allowed Modifications
- Adding optional fields or properties to existing JSON responses.
- Minor client-facing bug fixes or formatting adjustments (e.g. date formatting).
- Adding CORS origins or minor query parameters.

### 3.2 Strictly Forbidden (Zero Breaking Changes)
AI agents assisting client developers **MUST NOT**:
1. **Never Break API Contracts**: Do not rename or remove existing endpoints, query params, or required payload fields.
2. **Never Touch Core Logic or Architecture**: Do not rewrite routing, middleware, controllers, services, or authentication flow.
3. **Never Alter Database Schemas**: Do not add, rename, or drop MongoDB collections, Mongoose schemas, or DB indexes.
4. **Never Refactor**: Do not perform automated restructuring, file renaming, or dependency changes in `server/package.json`.

---

## 4. Mandatory "Caveman" Git Commit Style for Server Tweaks

Whenever an AI agent or developer makes ANY tweak to `server/` from a client/non-lead session, the Git commit message **MUST** follow the **Caveman format**:
- Extremely simple, direct, punchy.
- No corporate jargon, no fluff, no vague summaries.
- Plainly state **WHAT changed**, **WHY**, and **WHAT IT AFFECTS**.

### Commit Format Template
```
server: <what changed in plain english>
why: <short direct reason>
affects: <exact client component, file, or endpoint affected>
```

### Examples
```
server: add avatarUrl to /api/users response
why: client profile needs user avatar
affects: client UserProfile.tsx
```

```
server: allow GET /api/meetings to accept ?status=upcoming
why: client needs to filter meetings tab
affects: client MeetingsList.tsx
```

```
server: fix timestamp format on /api/health
why: client parsing failed on raw date string
affects: client HealthCheck.tsx
```

---

## 5. Guidelines for Server Lead AI Sessions

When verified as the Server Lead via `.agents/role.local`:
- **Smallest Necessary Change**: Make targeted changes to fulfill requirements without collateral modifications.
- **Preserve Existing Architecture**: Respect project patterns and error handling conventions.
- **Security & Secrets**: Never expose database credentials, connection strings, JWT secrets, or tokens in logs or code files.
