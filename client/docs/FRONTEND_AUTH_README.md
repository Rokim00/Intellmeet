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
  userName: string;
  userEmail: string;
  password: string;
  isCreatingOrg?: boolean;
  organizationName?: string;
  organizationLocation?: string;
  organizationSlug?: string;
  inviteCode?: string;
}

export interface LoginDTO {
  userEmail: string;
  password: string;
}
```

> `userName` / `userEmail` are the only accepted names. The old short aliases
> (`name` / `email`) were **removed** — the server rejects them.

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

### 1b.6 Use `userName` / `userEmail` only

The short aliases were removed. Sending `name` or `email` no longer works.

```diff
 export interface SignupDTO {
-  name: string;
-  userName: string;
-  email: string;
-  userEmail: string;
+  userName: string;
+  userEmail: string;
   password: string;
 }

 export interface LoginDTO {
-  email: string;
+  userEmail: string;
   password: string;
 }
```

Server validation errors now report `field: "userName"` / `field: "userEmail"`, so any
`errors[].field` → input mapping must use the long names.

---

## 2. Routes — Auth

| Endpoint | Method | Body | Auth | Returns |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/signup` | `POST` | `{ userName, userEmail, password, ... }` | ❌ | `{ user, accessToken }` |
| `/auth/login` | `POST` | `{ userEmail, password }` | ❌ | `{ user, accessToken }` |
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

## 3c. Pagination (all list endpoints)

Every list endpoint is paginated. Defaults to **10** per page.

| Endpoint | Params |
| :--- | :--- |
| `GET /projects` | `?page=&limit=` |
| `GET /projects/{id}/members` | `?page=&limit=` |
| `GET /organizations/members` | `?page=&limit=` |

`page` starts at 1. `limit` defaults to 10 and is **capped at 100**. Malformed values
(`?page=abc`, `?page=0`, negative) silently fall back to defaults — they never error.

### ⚠️ Response shape changed

List endpoints no longer return a bare array. `data` is now an object:

```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Projects retrieved successfully",
  "data": {
    "items": [ { "projectId": "…", "projectName": "Mobile App v2" } ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Update every caller:** `data` is now `data.items`, not an array. Code doing
`data.map(...)` breaks and must become `data.items.map(...)`.

`GET /projects/{id}/members` returns the paginated shape **plus** the existing fields:

```json
{
  "data": {
    "items": [ { "userId": "…", "projectRole": "Host", "user": { } } ],
    "pagination": { "page": 1, "limit": 10, "total": 12, "totalPages": 2, "hasNextPage": true, "hasPreviousPage": false },
    "projectId": "…",
    "projectName": "Mobile App v2",
    "memberCount": 12,
    "hostCount": 2,
    "limits": { "maxMembers": 50, "maxHosts": 3 }
  }
}
```

`memberCount` / `hostCount` are **totals across all pages**, not page counts — use them
for the `12/50` counter even while viewing page 2.

### Shared pagination component — do not build one per page

Page state is UI state, not per-page logic. One reusable component, driven by
`pagination` from the response:

```tsx
// src/components/shared/PaginationControls.tsx
interface Props {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const PaginationControls = ({ pagination, onPageChange, onLimitChange }: Props) => (
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm text-muted-foreground">
      Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
    </p>
    <div className="flex items-center gap-2">
      {onLimitChange && (
        <Select value={String(pagination.limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          {/* options: 10, 25, 50, 100 */}
        </Select>
      )}
      <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}>Previous</Button>
      <Button variant="outline" size="sm" disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}>Next</Button>
    </div>
  </div>
);
```

Rules:
- **Never hardcode** `10`, `50`, or `100` in a component. The default page size and the
  project limits (`maxMembers` / `maxHosts`) come from the API — read them, don't assume.
- Keep page/limit in component state or the URL query string. **Reset `page` to 1** when
  the filter or org changes, or you land on an empty page.
- The component renders `disabled` from `hasNextPage` / `hasPreviousPage` — don't compute
  those yourself.

---

## 3d. Data fetching — TanStack Query

### ⚠️ Not installed yet

`package.json` has `@tanstack/react-table` but **not** `@tanstack/react-query`. Install it
before using anything below:

```bash
pnpm add @tanstack/react-query
```

### Central QueryClient — do not create one per component

`src/lib/queryClient.ts`, created once:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});
```

Mount once in `main.tsx`:
```tsx
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Staleness rules — pick per query, not globally

| Data | `staleTime` | `refetchOnWindowFocus` | Why |
| :--- | :--- | :--- | :--- |
| Projects list, Org members | `30_000` | `false` | Changes rarely; focus-refetch reorders the list under the user's cursor |
| Project members table | `15_000` | `false` | Roster changes from other screens |
| Current user (`/auth/me`) | `5 * 60_000` | `true` | Auth state must be fresh |
| Mutations | — | — | Always invalidate; never cache |

`refetchOnWindowFocus: false` is deliberate. Your lists are paginated, so a background
refetch can swap page contents mid-click. Opt back in only where data is truly volatile.

### Query keys — always a factory, never an inline array

`src/api/projects/project.keys.ts`:
```ts
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: ProjectListParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  members: (id: string, params?: PageParams) =>
    [...projectKeys.detail(id), 'members', params ?? {}] as const,
};
```

Keys must include every param the response depends on — otherwise page 2 renders page 1's
cache.

### Unwrapping the envelope — do it once

The API returns `{ success, data, ... }`. Never unwrap per component:

`src/api/envelope.ts`:
```ts
export const unwrap = <T>(r: AxiosResponse<ApiEnvelope<T>>): T => r.data.data;
export const unwrapList = <T>(r: AxiosResponse<ApiEnvelope<PaginatedResult<T>>>): PaginatedResult<T> =>
  r.data.data;
```

### Safe migration from the old `data` array

`data` is now `data.items`. Do **not** rewrite call sites one at a time — that invites
partial migration. Add the hook first, migrate consumers, then remove the old path.

```ts
// src/api/projects/project.queries.ts
export const useProjects = (params: ProjectListParams) =>
  useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      const res = await client.get<ApiEnvelope<PaginatedResult<Project>>>('/projects', {
        params,
      });
      return unwrapList<Project>(res);
    },
    placeholderData: (prev) => prev,
  });
```

`placeholderData: (prev) => prev` stops the table flashing empty on every page change.

### Mutations — invalidate, don't patch

```ts
export const useAddProjectMembers = (projectId: string) =>
  useMutation({
    mutationFn: (vars: AddProjectMembersDTO) =>
      client.post(`/projects/${projectId}/members`, vars),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) }),
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
      ]);
    },
  });
```

Use the key factory for `invalidateQueries` too — a typo'd inline string silently fails to
invalidate, leaving stale data with no error.

### Errors

The Axios interceptor already handles 401 → refresh → retry. In components use the
`error` from `useQuery`; the server returns `{ message, errors[] }`. Show `message` in a
toast and map `errors[]` by `field` to inline errors (see §8). Don't re-derive error text in
the component.

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
- [ ] All list responses read `data.items`, never a bare `data` array.
- [ ] One `QueryClient` in `src/lib/queryClient.ts`, provided once in `main.tsx`.
- [ ] Query keys come from a key factory, and include every param used.
- [ ] `staleTime` / `refetchOnWindowFocus` set per query, not left to accident.
- [ ] Mutations invalidate via the key factory; no hand-edited cache patches.
- [ ] Envelope unwrapped through `unwrap` / `unwrapList`, not inline.
- [ ] One shared `PaginationControls`; no per-page reimplementation.
- [ ] No hardcoded page size or project limit anywhere in components.
- [ ] Page resets to 1 when filters or org change.
- [ ] check `pnpm run lint`


