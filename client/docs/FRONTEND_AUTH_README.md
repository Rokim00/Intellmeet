# Frontend Integration — Auth & Project Members

**Base URL:** `http://localhost:5000/api/v1`
**Rule:** Set `withCredentials: true` on Axios.
**Reference:** `client/AGENTS.md` is binding. This doc does not override it.

> **Caveman mode** — commit messages for companion server work follow the repo root
> `AGENTS.md` format: what changed, why, what it affects. No jargon.

---

## 1. Types & DTOs

```typescript
// ---- Org-wide role. 'Admin' was REMOVED - it had no purpose and nothing granted it.
//      Do not reintroduce it, and do not build UI for it.
/** Org-wide role. Lives on the User document. */
export type UserRole = 'SuperAdmin' | 'Member';

/** Role scoped to ONE project. Lives on the Project document. */
export type ProjectRole = 'Member' | 'Host';

// Models
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

// Inputs (DTOs)
export interface SignupDTO {
  name?: string;
  userName?: string;
  email?: string;
  userEmail?: string;
  password: string;
  isCreatingOrg?: boolean;
  organizationName?: string;
  organizationLocation?: string;
  organizationSlug?: string;
  inviteCode?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
```

The server accepts **both** `name`/`userName` and `email`/`userEmail` aliases and prefers
the long form. Send the long form.

### Project member types (new — required by this feature)

```typescript
export interface ProjectMember {
  userId: string;
  projectRole: ProjectRole;
  user?: {
    _id: string;
    user_name: string;
    user_email: string;
    avatar_url: string;
    user_role: string;
    is_super_admin: boolean;
  } | null;
}

export interface ProjectMembersResponse {
  projectId: string;
  projectName: string;
  members: ProjectMember[];
  memberCount: number;
  hostCount: number;
  limits: { maxMembers: number; maxHosts: number };
}

export interface AddProjectMembersDTO {
  userIds: string[];
  projectRole?: ProjectRole; // default 'Member'
}

export interface UpdateProjectMemberRoleDTO {
  projectRole: ProjectRole;
}

/** POST /projects — roster is optional, sent as two flat id arrays. */
export interface CreateProjectDTO {
  projectName: string;              // required, min 2 chars
  projectDescription?: string;
  projectStatus?: 'active' | 'archived' | 'completed';  // default 'active'
  members?: string[];               // default role Member
  hosts?: string[];                 // role Host
}

/** All write endpoints return this shape. */
export interface ProjectMutationResponse {
  project: Project;
  members: ProjectMember[];
  member?: { userId: string; projectRole: ProjectRole };
}

export interface AuthResponse {
  success: boolean;
  data: { user: User; accessToken: string };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors: { field: string; message: string }[];
}
```

---

## 1b. Client migration required before you start

These are **existing client files that are now wrong**. Fix them first.

### 1b.1 Delete the merged `MemberRole` — split into two types

`src/types/member.types.ts` currently has one flat union that merges the org role and the
project role. That is a bug waiting to happen: it makes a per-project `Host` look org-wide.

```diff
-export type MemberRole = 'SuperAdmin' | 'Admin' | 'Host' | 'Member';
+// No merged union. Import from the right place instead:
+import type { UserRole } from '@/types/user.types';     // 'SuperAdmin' | 'Member'
+import type { ProjectRole } from '@/types/project.types'; // 'Member' | 'Host'
```

Grep for `MemberRole` and fix each usage. A `Member` role badge in the org table uses
`UserRole`; a Host badge in a project table uses `ProjectRole`.

### 1b.2 Remove `'Admin'` everywhere

The server enum is now `['SuperAdmin', 'Member']`. Sending or branching on `'Admin'` will
not typecheck and has no server meaning.

```diff
-type MemberRole = 'SuperAdmin' | 'Admin' | 'Host' | 'Member';
+type UserRole = 'SuperAdmin' | 'Member';
```

Delete any Admin-only UI, filter option, or role dropdown item. There is no middle tier.

### 1b.3 Fix `ProjectStatus`

`src/types/project.types.ts` includes `'planning'`. The server enum does **not** accept it —
`active | archived | completed` only. Sending `'planning'` returns a validation error.

```diff
-export type ProjectStatus = 'active' | 'archived' | 'completed' | 'planning';
+export type ProjectStatus = 'active' | 'archived' | 'completed';
```

### 1b.4 Add roster fields to `CreateProjectDTO`

```typescript
export interface CreateProjectDTO {
  projectName: string;
  projectDescription?: string;
  projectStatus?: ProjectStatus;
  members?: string[];
  hosts?: string[];
}
```

### 1b.5 Do not use `is_super_admin` for authorization

It is `true` only for org creators, and it is redundant with `role === 'SuperAdmin'`.
Check `role`. Read `is_super_admin` for display at most.

---

## 2. Routes — Auth

| Endpoint | Method | Body | Auth | Returns |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/signup` | `POST` | `SignupDTO` | ❌ | `{ user, accessToken }` |
| `/auth/login` | `POST` | `LoginDTO` | ❌ | `{ user, accessToken }` |
| `/auth/me` | `GET` | — | `Bearer` | `User` |
| `/auth/refresh-token` | `POST` | `{}` or cookie | ❌ | `{ accessToken }` |
| `/auth/logout` | `POST` | — | `Bearer` | `200 OK` |

---

## 3. Routes — Projects

| Endpoint | Method | Body | Auth | Returns |
| :--- | :--- | :--- | :--- | :--- |
| `/projects` | `GET` | — | `Bearer` | `Project[]` |
| `/projects` | `POST` | `CreateProjectDTO` | `SuperAdmin` | `Project` |
| `/projects/{id}` | `GET` | — | `Bearer` | `Project` |
| `/projects/{id}` | `PATCH` | `UpdateProjectDTO` | `SuperAdmin` | `Project` |
| `/projects/{id}` | `DELETE` | — | `SuperAdmin` | `null` |
| `/projects/{id}/members` | `GET` | — | `Bearer` | `ProjectMembersResponse` |
| `/projects/{id}/members` | `POST` | `AddProjectMembersDTO` | `SuperAdmin` | `ProjectMutationResponse` |
| `/projects/{id}/members/{userId}/role` | `PATCH` | `UpdateProjectMemberRoleDTO` | `SuperAdmin` | `ProjectMutationResponse` |
| `/projects/{id}/members/{userId}` | `DELETE` | — | `SuperAdmin` | `ProjectMutationResponse` |

### Create project with a roster

```json
{
  "projectName": "Mobile App v2",
  "projectDescription": "Next generation mobile conferencing app",
  "projectStatus": "active",
  "members": ["65f...1", "65f...2"],
  "hosts":   ["65f...3"]
}
```

`members` default to role `Member`, `hosts` get role `Host`. Omit both for an empty project.
Both arrays are validated against the caller's organization and against the caps.

### Bulk add (this is the multi-select endpoint)

```json
POST /projects/{id}/members
{ "userIds": ["65f...1", "65f...2"], "projectRole": "Member" }
```

One call covers **1, 20, 40, or 0** users. There is deliberately **no per-user POST
route** — do not build a second code path for single adds.

---

## 3b. Dummy responses

Every response uses the same envelope:

```json
{ "success": true, "statusCode": 200, "message": "…", "data": { }, "timestamp": "…" }
```

### `GET /projects` → `data` is an array

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "projectId": "6742a1b2c3d4e5f678901234",
      "projectName": "Mobile App v2",
      "projectCode": "ACME-MOB",
      "projectDescription": "Next generation mobile conferencing app",
      "projectStatus": "active",
      "organizationId": "6ab4329e0f1312617b11d27a",
      "hosts": ["6ab4329e0f1312617b11d2801"],
      "members": ["6ab4329e0f1312617b11d2802", "6ab4329e0f1312617b11d2803"],
      "createdBy": "6ab4329e0f1312617b11d27a8",
      "createdAt": "2026-09-25T10:00:00.000Z",
      "updatedAt": "2026-09-25T10:00:00.000Z"
    }
  ]
}
```

> `hosts` / `members` are **ObjectId strings** here, not objects.

### `GET /projects/{id}/members` → backs the members table

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project members retrieved successfully",
  "data": {
    "projectId": "6742a1b2c3d4e5f678901234",
    "projectName": "Mobile App v2",
    "members": [
      {
        "userId": "6ab4329e0f1312617b11d2801",
        "projectRole": "Host",
        "user": {
          "_id": "6ab4329e0f1312617b11d2801",
          "user_name": "Jane Member",
          "user_email": "jane.member@acmecorp.com",
          "avatar_url": "",
          "user_role": "Member",
          "is_super_admin": false
        }
      },
      {
        "userId": "6ab4329e0f1312617b11d2802",
        "projectRole": "Member",
        "user": {
          "_id": "6ab4329e0f1312617b11d2802",
          "user_name": "Alex SuperAdmin",
          "user_email": "alex.lead@acmecorp.com",
          "avatar_url": "",
          "user_role": "SuperAdmin",
          "is_super_admin": true
        }
      }
    ],
    "memberCount": 2,
    "hostCount": 1,
    "limits": { "maxMembers": 50, "maxHosts": 3 }
  }
}
```

Use `limits` to disable controls. `user` is `null` if that user was deleted.

### `POST /projects/{id}/members` → 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Members added to project successfully",
  "data": {
    "project": { "projectId": "6742a1b2c3d4e5f678901234", "…": "full project" },
    "members": [{ "userId": "6ab4329e0f1312617b11d2802", "projectRole": "Member" }]
  }
}
```

`data.members` here is a **flat `[{ userId, projectRole }]` list with no `user` object** —
the short form returned by the write endpoints. The populated form only comes from the GET.
If the table needs names after a write, re-fetch the GET.

### `PATCH /projects/{id}/members/{userId}/role` → 200

Request: `{ "projectRole": "Host" }`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project member role updated successfully",
  "data": {
    "project": { "projectId": "6742a1b2c3d4e5f678901234", "…": "full project" },
    "members": [{ "userId": "6ab4329e0f1312617b11d2801", "projectRole": "Host" }],
    "member": { "userId": "6ab4329e0f1312617b11d2801", "projectRole": "Host" }
  }
}
```

`data.member` is the single changed row — use it to update that row in place.

### `DELETE /projects/{id}/members/{userId}` → 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member removed from project successfully",
  "data": {
    "project": { "projectId": "6742a1b2c3d4e5f678901234", "…": "full project" },
    "members": []
  }
}
```

### Errors → 400 / 403 / 404

```json
{
  "success": false,
  "statusCode": 400,
  "message": "A project can have at most 3 hosts. Demote an existing host to Member before promoting another.",
  "errors": [{ "field": "projectRole", "message": "Host limit of 3 exceeded" }],
  "timestamp": "2026-09-25T10:05:00.000Z"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "message": "A project can have at most 50 members. This request would result in 62.",
  "errors": [{ "field": "userIds", "message": "Member limit of 50 exceeded" }],
  "timestamp": "2026-09-25T10:05:00.000Z"
}
```

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User is not a member of this project",
  "errors": [],
  "timestamp": "2026-09-25T10:05:00.000Z"
}
```

---

## 4. Hard limits

| Limit | Value | Behaviour |
| :--- | :--- | :--- |
| Members per project | **50** | Rejects the whole request. No silent truncation. |
| Hosts per project | **3** | Rejects the 4th. Demote one first. |

- Exceeding either returns **400** with a message naming the limit.
- **Demotion is always allowed.** `Host → Member` only frees a slot, so it never 400s.
  This is the intended recovery path: "can't promote? demote someone first."
- The server is the source of truth. Do not hardcode `50` or `3` — read `limits` from
  `GET /projects/{id}/members` and drive disabled states from it.

---

## 5. User flow

### 5.1 Create project → dedicated page

1. **New project** → navigate to `/projects/new` (a page, not a modal).
2. Form: name, description, status.
3. Optional roster: **multi-select checkboxes** + a **role dropdown** per selection.
   Default role is `Member`.
4. Show a host counter. At 3, the **Host option is disabled** with an inline hint — do not
   wait for a server 400.
5. Submit → `POST /projects` with `members` + `hosts`.
6. Success → toast → navigate to `/projects/{id}`.

### 5.2 List → detail

1. `GET /projects` renders the list.
2. Click a row → `/projects/{id}`.
3. Detail loads `GET /projects/{id}` and `GET /projects/{id}/members`.

### 5.3 Members table (CRUD, on the detail page)

| Action | Call | Notes |
| :--- | :--- | :--- |
| Promote / Demote | `PATCH .../role` | Row dropdown. Host disabled at 3. |
| Remove | `DELETE .../{userId}` | `AlertDialog` confirm. |

**Bulk add** lives in one dialog, not per-row buttons: multi-select org members → one role
dropdown → single `POST`. That is the "add 20–40 at once" path.

**Do not** put a Promote button, a Demote button, and a kebab menu in the same row. That is
three controls for two actions. Use **one** `DropdownMenu` per row containing the actions
that apply to that row's current state.

### 5.4 Delete project

`SuperAdmin` only. `AlertDialog` confirm naming the project → `DELETE /projects/{id}` →
toast → navigate to the list.

---

## 6. UI composition — shadcn

**Not yet installed.** Required before building:

```bash
npx shadcn@latest add select checkbox dialog alert-dialog table badge toast command popover
```

`sonner` backs the toast system. Already present and reusable as-is:
`button, input, label, card, dropdown-menu, tooltip, skeleton, separator, avatar, sheet,
collapsible, EmptyState, breadcrumb, sidebar`.

Follow existing patterns:

- **Forms** → React Hook Form + Zod (both already installed). Schemas in `src/schemas/`.
- **API** → the shared Axios client in `src/api/client.ts`. No ad-hoc `fetch`.
- **Loading** → `skeleton`, not spinners.
- **Empty states** → the existing `EmptyState` component.
- **Icons** → `lucide-react` (per `components.json`).

---

## 7. Design rules (from `client/AGENTS.md`)

- **No hardcoded colors.** Semantic tokens only:
  `bg-background text-foreground bg-card border-border text-muted-foreground
  bg-primary text-primary-foreground bg-accent text-accent-foreground bg-destructive
  ring-input`
  Never `bg-white text-[#111827] border-[#e5e7eb]`.
- **Never invent backgrounds or borders.** Reach for existing tokens first.
- Both themes must work. Root is light; `.dark` is defined in `src/index.css`.
- Spacing and radius come from the existing scale. No one-off values.
- Reuse before creating. No new component if one already does the job.

---

## 8. User feedback — validation & rejection

| Condition | Status | What to show |
| :--- | :--- | :--- |
| Malformed `id` / `userId` | 400 | Inline field error on the affected control |
| `userIds` empty | 400 | Inline on the picker: "Select at least one member" |
| Unknown user id | 400 | Inline, list the rejected ids |
| Cross-organization user | 400 | Inline: "All members must belong to your organization" |
| Over 50 members | 400 | Toast + keep the dialog open, show current count |
| Over 3 hosts | 400 | Toast: "Demote an existing host to promote another" |
| Not a project member | 404 | Toast, then refetch the table |
| Project not found | 404 | Toast + redirect to list |
| Not `SuperAdmin` | 403 | Toast. Hide the action; don't just 403 on click. |

Map `message` for the toast and `errors[]` by `field` for inline errors.

**Prevent client-side** what the server already rejects, so users aren't ping-ponged:
- Disable **Host** in the dropdown at `hostCount >= limits.maxHosts`, with a hint.
- Disable **Add** when `selection + memberCount > limits.maxMembers`.
- Show live counters: `Members 12/50`, `Hosts 2/3`.

Never swallow a silent failure. Every mutation gets success **and** error feedback.

---

## 9. Definition of done

- [ ] Types match the server; long-form aliases used (`userName`, `projectName`).
- [ ] Required shadcn components installed.
- [ ] Create project on its own page, with multi-select + role dropdown.
- [ ] Host option disabled at 3, with a visible reason.
- [ ] Member cap enforced from `limits`, not hardcoded.
- [ ] Members table: add (bulk), promote/demote, remove, delete project.
- [ ] One action surface per row — no duplicate buttons for the same action.
- [ ] Tokens only; no hardcoded colors or one-off spacing.
- [ ] Light **and** dark verified.
- [ ] Responsive at mobile / tablet / desktop.
- [ ] Loading, empty, error, and success states all present.
- [ ] Forms use React Hook Form + Zod.
- [ ] API calls go through the shared Axios client.
- [ ] Keyboard and focus behavior correct.
- [ ] `tsc` passes — **fix every error; do not silence with `any` or `@ts-ignore`.**
- [ ] Theme switch toggled and both modes re-checked after all styling is done.
- [ ] No existing config file modified to make the build pass.
- [ ] check `pnpm run lint`


