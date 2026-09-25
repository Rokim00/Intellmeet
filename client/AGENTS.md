# Client Development Rules

## Scope

This directory contains the **Intellmeet client application**.

Work only within the client unless a task explicitly requires backend changes.

The goal is a **clean, modern, consistent, maintainable UI** without unnecessary abstraction or visual complexity.

---

## 1. Before Changing Code

Before implementing a feature:

1. Inspect the existing project structure.
2. Search for existing components that can be reused.
3. Check existing design tokens and theme variables.
4. Check existing patterns for:

   * Forms
   * API calls
   * Error handling
   * Loading states
   * Toasts
   * Layouts
5. Follow the existing pattern before introducing a new one.

**Do not create a new component or utility if an appropriate existing one already exists.**

---

## 2. Design Consistency

The entire application must feel like **one product**.

Maintain consistency in:

* Spacing
* Typography
* Border radius
* Borders
* Shadows
* Button styles
* Input styles
* Card styles
* Icons
* Interactive states
* Empty states
* Error states
* Loading states
* Toasts
* Responsive behavior

Do not introduce a new visual pattern for a single page without a real reason.

---

## 3. Design Tokens

Use centralized design tokens.

Do not scatter hardcoded colors throughout components.

Prefer semantic tokens such as:

```text
background
foreground
primary
secondary
muted
accent
border
input
ring
destructive
```

Use the existing theme/token system before creating new tokens.

Example:

```tsx
className="bg-background text-foreground border-border"
```

Avoid:

```tsx
className="bg-white text-[#111827] border-[#e5e7eb]"
```

unless there is a specific design requirement that cannot be represented by an existing token.

---

## 4. Theme

The application supports:

* Light theme
* Dark theme

The root theme is the light theme.

Use:

```css
:root {
  /* light tokens */
}

.dark {
  /* dark tokens */
}
```

Every UI component must work correctly in both themes.

Do not create components that only look correct in light mode.

Check:

* Text contrast
* Borders
* Inputs
* Cards
* Dialogs
* Dropdowns
* Toasts
* Hover states
* Focus states
* Disabled states

---

## 5. Component Reuse

Use **shadcn/ui** components whenever an appropriate component already exists.

Prefer:

```text
Button
Input
Label
Card
Dialog
Sheet
DropdownMenu
Select
Form
Table
Alert
Toast
```

over creating custom versions.

Before creating a new shared component:

> Search the existing component library and project first.

Create a custom component only when the existing components cannot reasonably satisfy the requirement.

---

## 6. Component Responsibility

Follow:

> **SRP — Single Responsibility Principle**

Components should have clear responsibilities.

Avoid large components containing:

```text
UI
+ API calls
+ validation
+ business logic
+ data transformation
+ state management
```

Separate responsibilities where necessary.

Prefer:

```text
Page
 ↓
Feature Component
 ↓
Form / UI Component
 ↓
Hook
 ↓
API Service
```

Do not over-abstract simple UI.

---

## 7. KISS / DRY / YAGNI

### KISS

Keep implementations simple.

Do not introduce unnecessary:

* State management
* Abstraction layers
* Wrappers
* Hooks
* Utilities
* Libraries

### DRY

Reuse genuinely shared logic.

Do not duplicate:

* API configuration
* Validation schemas
* Theme tokens
* Common UI patterns
* Error handling

### YAGNI

Do not build something because it **might** be needed later.

Implement the actual requirement first.

---

## 8. User Feedback

Every user action that communicates with the server should provide appropriate feedback.

Examples:

```text
Submit
  ↓
Loading
  ↓
Success / Error
```

Provide feedback for:

* Login
* Registration
* Create
* Update
* Delete
* Upload
* Important settings changes
* Authentication actions

Use appropriate UI feedback such as:

* Toast
* Inline error
* Alert
* Disabled button
* Loading indicator
* Empty state

---

## 9. Toasts

Use the existing toast/notification system.

Do not create custom toast implementations for individual pages.

Use consistent messages.

Good:

```text
"Profile updated successfully."
"Unable to update profile."
```

Avoid:

```text
"Something went wrong!!!"
```

Do not expose raw server errors, stack traces, Axios errors, or technical implementation details to users.

---

## 10. Loading States

Use loading states **only when they provide meaningful feedback**.

Avoid unnecessary loading indicators for:

* Instant local state changes
* Very small UI operations
* Components where loading is not perceptible

For real API operations, provide appropriate feedback.

Prefer contextual loading:

```text
Saving...
Deleting...
Signing in...
```

instead of unnecessarily blocking the entire page.

Do not use a full-screen spinner unless the entire application/page genuinely cannot render without the data.

---

## 11. Error States

Errors must be intentional and user-friendly.

Handle:

* Validation errors
* Authentication errors
* Authorization errors
* Network errors
* Server errors
* Empty responses
* Unexpected API responses

Use the application's common API error structure.

Do not duplicate error parsing logic across components.

---

## 12. Forms

Use:

* **React Hook Form** for form state
* **Zod** for validation
* Existing shadcn form components

Validation should be:

```text
Input
 ↓
React Hook Form
 ↓
Zod
 ↓
API
 ↓
Structured API response
```

Show validation errors close to the relevant field.

Do not duplicate validation rules unnecessarily.

---

## 13. API Communication

Use the centralized Axios client.

Do not create individual Axios instances inside components.

Prefer:

```text
Component
 ↓
Hook
 ↓
API service
 ↓
Axios client
 ↓
Backend
```

API configuration, authentication headers, and common error handling should remain centralized.

---

## 14. Visual Style

The UI should be:

* Clean
* Modern
* Minimal
* Calm
* Consistent
* Functional

Avoid unnecessary:

* Gradients
* Excessive shadows
* Excessive animations
* Decorative elements
* Huge rounded containers
* Excessive colors
* Visual noise

Design should support the product rather than compete with it.

---

## 15. Animation

Use animation only when it improves usability.

Good uses:

* Dialog transitions
* Dropdown transitions
* Toast appearance
* Small state transitions
* Meaningful interaction feedback

Avoid animations that make normal application usage slower or distracting.

---

## 16. Accessibility

Follow **A11y** by default.

Ensure:

* Keyboard navigation
* Visible focus states
* Proper labels
* Semantic HTML
* Accessible buttons
* Accessible dialogs
* Appropriate ARIA usage
* Sufficient color contrast

Do not use visual styling as a replacement for semantic HTML.

---

## 17. Responsive Design

The UI must work across:

```text
Mobile
Tablet
Desktop
```

Use Tailwind responsive utilities.

Avoid unnecessary fixed widths and heights.

Prefer flexible layouts using:

```text
flex
grid
max-width
min-width
responsive breakpoints
```

---

## 18. File Organization

Keep the client file system predictable.

Use clear naming conventions.

Example:

```text
src/
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── users/
│
├── hooks/
├── lib/
├── api/
├── schemas/
├── types/
├── pages/
└── styles/
```

Organize feature-specific code together when appropriate.

Avoid dumping unrelated components into a single folder.

---

## 19. Naming

Use descriptive and consistent names.

Examples:

```text
LoginForm.tsx
UserTable.tsx
AuthGuard.tsx
useAuth.ts
auth.api.ts
auth.schema.ts
user.types.ts
```

Avoid unclear names such as:

```text
Comp.tsx
Helper.ts
Common.ts
Data.ts
Test.tsx
```

---

## 20. Before Creating Anything New

Ask:

```text
Does this already exist?
        ↓
Can I reuse it?
        ↓
Can I extend it safely?
        ↓
Is a new abstraction actually necessary?
        ↓
If yes → create it with a clear responsibility.
```

---

## 21. Final Quality Check

Before considering a feature complete, verify:

* [ ] Existing components were reused where appropriate.
* [ ] No unnecessary components were created.
* [ ] Design tokens are used instead of scattered colors.
* [ ] Light theme works.
* [ ] Dark theme works.
* [ ] Responsive layout works.
* [ ] Loading state is appropriate.
* [ ] Error state is handled.
* [ ] Success feedback is provided where appropriate.
* [ ] Toasts use the common system.
* [ ] Forms use React Hook Form + Zod.
* [ ] API calls use the common Axios client.
* [ ] No duplicated logic was introduced.
* [ ] No unnecessary abstraction was introduced.
* [ ] Keyboard/accessibility behavior works.
* [ ] Code follows existing project conventions.

## Core Principle

> **Build the simplest implementation that is clean, consistent, accessible, reusable, and actually required.**

Do not optimize for the amount of code written.

Optimize for **clarity, consistency, maintainability, and user experience**.
