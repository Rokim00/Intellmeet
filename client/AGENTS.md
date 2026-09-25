# Client Rules — IntellMeet

React 19 + TypeScript + Vite + Tailwind v4 UI. Root `AGENTS.md` applies too.

## 1. Reuse Before Building

Search before you create. `src/components/ui/` already has Button, Input, Label,
Card, Dialog, Sheet, DropdownMenu, Tabs, Table, Sidebar, Breadcrumb, Avatar,
Tooltip, Skeleton, Separator, EmptyState, and more.

Decision order:
1. Does it already exist? → Reuse it.
2. Can an existing component take a prop? → Add the prop.
3. Is a new variant genuinely needed? → Add **one** variant.
4. Only then build something new, with one clear responsibility.

**Modifying a shared component must not change how existing pages look.** When a
variant is needed, add it alongside the current one — never edit the base classes
that current pages depend on. If shared behavior must change, check every
consumer first.

No page-local duplicate of an existing shared component.

## 2. Actions: One Place

The same user action gets **one** control in **one** place. Do not offer
"Create Project" in both the sidebar and the page header. If a control already
exists, do not add a second version of it elsewhere.

Actions belong in the surface where the user is already working. Primary actions
sit next to the content they affect; destructive actions (delete, remove) belong
in a row menu or a confirm dialog, never as a bare button beside a primary action.

## 3. Design Tokens Only

Semantic tokens, never literal values:

```tsx
className="bg-background text-foreground border-border text-muted-foreground"
```

```tsx
// avoid
className="bg-white text-[#111827] border-[#e5e7eb]"
```

Tokens live in `src/index.css` under `:root` (light) and `.dark` (dark). The accent
is emerald. Purple, blue, and amber are **data-status colors only** (live,
warning, high priority) — never a second brand color.

When a genuinely new semantic value is needed, add the token in **both** themes
first, then use it. Never introduce a one-off color.

## 4. Shape and Motion

- **Sharp, not soft.** Small radii (`rounded-md`, `rounded-lg`). No
  `rounded-3xl`, no pill-shaped containers.
- **Never over-curve corners.** `rounded-full` only on avatars, dots, badges.
- **Icons carry no background.** A bare Lucide icon at a consistent size and
  `strokeWidth`. Do not wrap icons in colored boxes or glows.
- Borders over shadows. Avoid stacked blurs.
- No background gradients behind content, no ambient glow layers.
- Transitions 150–200ms, `ease-out`, on color/opacity/transform only.
- No animation on data that changes often (lists, counters, live status).
- Respect `prefers-reduced-motion`.

---

## 5. Types

- No `any`. No non-null `!` on API data. No untyped `unknown` casts.
- Model the API response, not your assumption of it. If a field may be absent,
  make it optional in the type and handle the missing case in the UI.
- Use the existing accessors in `src/types/*.types.ts` (`getProjectName`,
  `getProjectStatus`, …) instead of re-deriving fields inline.
- Derive prop types from the element (`React.ComponentProps<'...'>`), never by
  redeclaring them.

## 6. Component Responsibility

One job per component. A component renders UI and holds view state; it does not
also call the API, validate forms, and transform data.

Split only when a file actually gets hard to read — page → feature component →
form/UI component → hook. Do not pre-emptively abstract simple UI.

## 7. API Layer

- All requests go through `src/api/client.ts` (Axios). It already attaches the
  bearer token, handles 401 → refresh → retry, and caches GETs. Never call Axios
  directly or create a second instance.
- One `<domain>.api.ts` per resource, named exports, no default export.
- The response envelope is `{ success, message, data, meta?, errors? }`. Type the
  `data` payload, not the envelope twice.
- Map errors with `parseApiError()` from `src/utils/apiError.ts` — it already
  covers network failures, 5xx, and field-level errors.
- **Verify the endpoint before using it.** Check the route file in `server/` or
  Swagger at `/api/docs`. Never invent a field or guess a path.
- Server state belongs in a provider; use local component state for everything else.

## 8. Server State — TanStack Query

All server state is cached by **TanStack Query v5**. Components must not fetch
directly, and must not fetch in a `useEffect`.

```tsx
// read
const { data, loading, error, refetch } = useQuery<Project[]>(
  queryKeys.projects.list(),
  () => getProjects(),
  { enabled: isAuthenticated }
);

// write
const { mutate, pending, error } = useMutation<Project, string>({
  mutationFn: (status) => createProject({ name, status }),
  invalidates: [queryKeys.projects.all],
  onSuccess: (project) => addProject(project),
});
```

The wrappers in `src/hooks/useApi.ts` unwrap the `{ success, message, data }`
envelope once and normalise the return shape. Use them, not TanStack directly.

Rules:
- **Query keys come from `queryKeys` in `src/api/queryClient.ts`.** Never write an
  inline string array — a typo is a silent cache miss that also breaks
  invalidation.
- Invalidate with the **prefix** key (`queryKeys.projects.all`), not the exact key,
  so sibling queries are covered.
- `enabled: false` until authenticated. Never gate on data you don't have yet.
- `loading` maps to `isPending` (first load only). A background refetch does not
  show a skeleton over content the user is reading — do not change this.
- Contexts are a thin wrapper over hooks. No fetching logic in a context.
- On sign-out call `queryClient.clear()` so the next user never reads cached data.
- Devtools (`ReactQueryDevtools`) are development-only and excluded from the
  production bundle automatically.

## 9. Validation

- React Hook Form + Zod, following the existing `src/schemas/` pattern.
- Validate on submit, re-validate on change after the first failed submit.
- Reuse the `zodResolver` wiring from `Login.tsx` / `Signup.tsx`.
- Messages are user-facing and specific. Never surface raw Zod output, stack
  traces, or Axios errors.
- Trim and normalize before submit; disable submit while pending.
- Never use `alert()`, `confirm()`, or a native `prompt()`.

## 10. Feedback and States

Every data-backed view handles four states: **loading** (skeleton matching the
final layout, not a full-screen spinner), **empty** (`EmptyState`), **error**
(message + retry), and **success** (mutation confirmation).

Use contextual labels — "Saving…", "Deleting…", "Signing in…" — instead of blocking
the page. Use the existing toast system; never build a second one, and never
write "Something went wrong!!!".

## 11. Accessibility

Semantic HTML first; ARIA only when semantics fall short. Every icon-only button
needs an accessible name, every input a `<Label>`, and every interactive element a
visible focus ring. Modals and menus must be fully keyboard operable.

## 12. Layout

- `SidebarLayout` owns the page frame; pages render their own content area only.
- Page structure: header (title + primary action) → toolbar/filters → content.
- Responsive by default: `flex`/`grid` with `max-width`, no fixed dimensions.
  Check 375px, 768px, and 1280px.
- Tables become stacked cards or horizontal scroll on mobile, never squashed into
  unreadable columns.
- Keep page padding (`p-6 lg:p-8`) and section spacing consistent everywhere.

## 13. Performance

- Lazy-load routes (already wired in `App.tsx`); keep it that way.
- `React.memo` / `useMemo` only after a measurable problem, not by default.
- Avoid effects that only derive state — compute during render instead.
- Size and lazy-load images; never ship oversized assets.

## 14. File Organization

```
src/
├── api/         # Axios client + per-resource modules
├── components/  # ui/ primitives, layout/, feature components
├── context/     # Auth, Project, Theme
├── hooks/       # shared hooks
├── lib/         # cn, cva, render helpers
├── pages/       # one folder per route
├── schemas/     # Zod schemas
├── types/       # shared TS types
└── utils/       # pure helpers
```

Feature components go in `components/<feature>/`, not scattered into `ui/`.
`ui/` holds genuine primitives only.

## 15. Naming

Descriptive and consistent: `LoginForm.tsx`, `MembersTable.tsx`, `useProject.ts`,
`project.api.ts`, `project.types.ts`. Avoid `Comp.tsx`, `Helper.ts`, `Common.ts`,
`Data.ts`.

## 16. Before You Finish

- [ ] Reused existing components; added at most one variant, and no existing page
      changed visually
- [ ] No duplicate UI for an action that already exists elsewhere
- [ ] No `useEffect` that fetches; data comes from `useQuery` / a domain hook
- [ ] Mutations use `useMutation` and invalidate the right resource
- [ ] Semantic tokens only; verified in light **and** dark
- [ ] Sharp corners, unboxed icons, no gradients or glows
- [ ] No `any`; API types match the real endpoint
- [ ] Loading, empty, error, and success states handled
- [ ] React Hook Form + Zod on every form
- [ ] Keyboard accessible with visible focus
- [ ] Mobile verified
- [ ] `pnpm build` and `pnpm lint` pass
- [ ] No unused imports or dead code

## Principle

Build the simplest thing that is **consistent, accessible, and reusable**. Do not
optimize for lines of code written — optimize for clarity and maintainability.

---

# Commands

See [`commands.md`](./commands.md) at the repository root for every command and
its purpose.


