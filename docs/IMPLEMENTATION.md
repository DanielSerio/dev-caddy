# DevCaddy Implementation Guide

This document consolidates development principles, architectural decisions, and implementation details for DevCaddy.

---

## Table of Contents

1. [Core Development Principles](#core-development-principles)
2. [Testing Strategy](#testing-strategy)
3. [Key Architectural Decisions](#key-architectural-decisions)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Build Configuration](#build-configuration)

---

## Core Development Principles

1. **Always prefer simplicity over cleverness**
2. **Always use the SOLID principles**
3. **`.ts` and `.tsx` files should be kept under 250 lines**
4. **Use a hybrid spec-driven + test-driven development approach**
5. **Do NOT write unit tests** — focus on integration and E2E tests
6. **Avoid mocking in integration and E2E tests**

---

## Testing Strategy

### Hybrid Spec-Driven + Test-Driven Development

DevCaddy uses a **hybrid approach** combining Spec-Driven Development (SDD) and Test-Driven Development (TDD).

#### Why Hybrid?

- **Specs** provide the "what" and "why" in business terms
- **Tests** provide the "how" with technical validation
- **Collaboration** improves when stakeholders can read specs
- **Confidence** comes from automated tests validating behavior end-to-end

#### Test Types

| Test Type           | When to Use                                   | Tools           | Mocking? |
| ------------------- | --------------------------------------------- | --------------- | -------- |
| **Specs (Gherkin)** | User-facing features, acceptance criteria     | `.feature` files | N/A      |
| **E2E Tests**       | Full user flows, annotation sync, magic links | Playwright      | ❌ No     |
| **Integration Tests** | Multi-component interactions (UI + Supabase) | Playwright, Vitest | ❌ No   |
| **Component Tests** | Isolated React components (visual regression) | Storybook       | Limited  |
| **Unit Tests**      | **DO NOT WRITE** — Prefer integration/E2E     | ❌ None         | N/A      |

#### Workflow Example

**1. Write Spec (Gherkin)**
```gherkin
Feature: Reviewer Annotation Flow
  Scenario: Reviewer adds annotation to UI element
    Given a reviewer has authenticated via magic link
    When they click on a button element
    And they add the comment "Change this to blue"
    Then the annotation should appear on the element
    And the developer should see the annotation in real-time
```

**2. Implement E2E Test (Playwright)**
```typescript
test('reviewer can add annotation to UI element', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('button#submit');
  await page.fill('[data-testid="annotation-input"]', 'Change this to blue');
  await page.click('[data-testid="submit-annotation"]');

  await expect(page.locator('[data-testid="annotation"]')).toBeVisible();
});
```

**3. Use TDD for Utilities (RED/GREEN/REFACTOR)**
```typescript
// Test for selector extraction utility
test('getElementSelectors returns unique CSS selector', () => {
  const element = document.querySelector('#app button.primary');
  const selector = getElementSelectors(element);
  expect(selector).toBe('#app button.primary');
});
```

#### Anti-Patterns to Avoid

- ❌ **Don't mock Supabase in E2E tests** — Use a test database instance
- ❌ **Don't write unit tests for React components** — Use Storybook or E2E tests
- ❌ **Don't skip specs for complex features** — Specs prevent miscommunication
- ❌ **Don't write specs for trivial utilities** — TDD alone is fine
- ❌ **Don't let specs drift** — Keep them updated as requirements evolve

---

## Key Architectural Decisions

### Decision 1: Supabase Client Initialization

**Question:** Where should `initDevCaddy()` be called?

**Decision:** User must initialize in their app (Option A)

```typescript
// User's src/main.tsx or App.tsx
import { initDevCaddy } from 'dev-caddy';

initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEV_CADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY,
});
```

**Rationale:**
- Explicit and clear control
- Works with SSR/SSG frameworks
- Follows principle: explicit over implicit
- User controls when initialization happens

---

### Decision 2: Authentication Approach

**Question:** How do we identify users for `created_by` field?

**Decision:** Email Prompt + Magic Link (Option B)

**User Flow:**
1. Team lead creates all users upfront in Supabase Dashboard
2. Team lead assigns 'developer' role to appropriate users via SQL
3. User clicks DevCaddy toggle → email prompt appears
4. User enters email → receives magic link
5. User clicks magic link → authenticated with correct permissions
6. Session persists (user only authenticates once)

**Implementation:**
```typescript
// Check session
const { data: session } = await supabase.auth.getSession();

if (!session) {
  // Show email prompt modal
  const { error } = await supabase.auth.signInWithOtp({
    email: userEmail,
    options: {
      emailRedirectTo: window.location.href,
    }
  });
}

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    const userId = session.user.id;
    setCurrentUser({ id: userId, email: session.user.email });
  }
});
```

**Security:**
- Uses `app_metadata` for roles (admin-only, secure)
- `user_metadata` is user-editable and NEVER used for permissions
- RLS policies check: `(auth.jwt()->'app_metadata'->>'role')::text = 'developer'`

**Rationale:**
- Real authentication with proper user identity
- RLS policies work correctly out of the box
- Built into Supabase (no custom backend needed)
- Session persistence handled automatically
- Professional UX with email prompt modal

---

### Decision 3: URL Normalization Strategy

**Question:** How should we handle page URLs for annotation scoping?

**Decision:** Always use pathname only (Option A)

```typescript
// Creating annotation
page: window.location.pathname  // "/products"

// Subscribing to annotations
subscribeToAnnotations(window.location.pathname, callback)

// Querying annotations
getAnnotationsByPage(window.location.pathname)
```

**Rationale:**
- Simple and consistent
- Works for SPA routes
- Annotations work across query params (e.g., `/products?sort=price` and `/products?sort=name` share annotations)
- Meets 90% of use cases

**Trade-off:**
- Can't have different annotations for same route with different query params
- Can't scope by subdomain or port

---

### Decision 4: Realtime Subscription Management

**Question:** How should we handle realtime subscription cleanup and page changes?

**Decision:** Single project-wide subscription (Changed in v0.2.0)

**Implementation:**
```typescript
// Subscribe once to all annotations
useEffect(() => {
  const unsubscribe = subscribeToAllAnnotations(callback);
  return unsubscribe;
}, []); // No dependencies - subscribe once on mount

// No URL change tracking needed
// Users see all annotations and can filter/navigate as needed
```

**Rationale:**
- Simpler state management (no re-subscription on navigation)
- Better user experience (see all project feedback at once)
- Enables cross-page navigation to annotations
- Better collaboration (reviewers see full project context)

**Previous Approach (v0.1.0):**
- Page-scoped subscriptions that re-subscribed on URL changes
- Required URL change detection via `popstate` and `pushState` interception
- Changed to project-wide to meet user feedback for full project visibility

**See Also:** Decision 8 for annotation scoping rationale

---

### Decision 5: Environment Variables

**Question:** Should Supabase credentials be accessed directly or passed as props?

**Decision:** Keep explicit config (Option A)

```typescript
// User code
initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEV_CADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY,
});
```

**Rationale:**
- Explicit and testable
- User controls credential source
- Works with any config management approach

---

### Decision 6: Status Management

**Question:** Do we need a database table for annotation statuses?

**Decision:** No - use CHECK constraint + TypeScript constants

**Implementation:**
```typescript
// TypeScript constants
export const ANNOTATION_STATUS = {
  NEW: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  HOLD: 4,
  RESOLVED: 5,
} as const;

// Database CHECK constraint
ALTER TABLE annotation
ADD CONSTRAINT annotation_status_id_check
CHECK (status_id >= 1 AND status_id <= 5);
```

**Rationale:**
- Fixed set of 5 statuses (no dynamic values needed)
- Simpler schema, no seeding required
- Faster queries (no JOIN needed)
- TypeScript provides type safety

---

### Decision 7: State Management

**Question:** Which state management library should we use?

**Decision:** React Context (no external library)

**Rationale:**
- Sufficient for 1-2 levels of nesting
- No external dependencies
- Simple for current scope
- Can migrate to Zustand/Redux later if needed

---

### Decision 8: Annotation Scoping

**Question:** Should annotations be page-scoped or project-wide?

**Decision:** Project-Wide (Changed from page-scoped in v0.2.0)

**Implementation:**
```typescript
// Load all annotations on mount
const data = await getAllAnnotations();

// Subscribe to all changes (single subscription)
const unsubscribe = subscribeToAllAnnotations(callback);

// Cross-page navigation
function navigateToAnnotation(annotation: Annotation) {
  if (annotation.page !== window.location.pathname) {
    sessionStorage.setItem('devcaddy_pending_annotation', annotation.id.toString());
    window.location.pathname = annotation.page;
  } else {
    selectAnnotation(annotation);
  }
}
```

**Features Enabled:**
- View all annotations across entire project in single list
- Click annotation to navigate to that page and highlight element
- Page badges show which page each annotation belongs to
- Real-time updates across all pages (not just current)
- Developer mode: filter by page, status, and author
- Client mode: see all users' annotations (not just own)

**Rationale:**
- Users need to see full project context (not just current page)
- Enables cross-page navigation to annotations
- Simplifies state management (no re-subscription on navigation)
- Better collaboration (reviewers see all feedback at once)
- Aligns with user feedback: "I think we need the users to see ALL annotations all the time"

**Trade-offs:**
- More annotations loaded initially (performance consideration)
- More real-time updates (all pages, not just current)
- Acceptable up to ~500 annotations (performance baseline)
- Can add pagination/virtualization later if needed

**When Changed:** 2025-11-13 (v0.2.0)

**Why Changed:** User feedback indicated need for project-wide visibility and cross-page navigation

**Previous Approach (v0.1.0):**
- Annotations scoped to current page only
- Users could only see annotations on the page they were viewing
- Required page-scoped subscriptions with re-subscription on navigation

**See Also:**
- Decision 4 for realtime subscription changes
- `docs/PROJECT-WIDE-ANNOTATIONS-PLAN.md` for implementation plan
- `docs/specs/project-wide-annotations.feature` for specifications

---

## Implementation Guidelines

### Type Safety

**Window Globals:**
- Define window type augmentation in `src/types/global.d.ts`
- Declare `__DEV_CADDY_ENABLED__` and `__DEV_CADDY_UI_MODE__` once globally
- Avoid casting window types repeatedly in components

**Annotation Types:**
- Types defined in `src/types/annotations.ts` mirror database schema
- Provide convenience types: `CreateAnnotationInput`, `UpdateAnnotationInput`
- Use `Omit` and `Partial` utilities for derived types

**Avoid `any` Types:**
- Replace `any` with `Record<string, unknown>` for truly dynamic types
- Use `unknown` when type cannot be determined at compile time
- Constrain generic parameters properly

### Configuration Strategy

**Environment Variables:**
```bash
# Consumer's app (bundled with client)
VITE_DEV_CADDY_ENABLED=true
VITE_DEV_CADDY_SUPABASE_URL=https://xxx.supabase.co
VITE_DEV_CADDY_SUPABASE_ANON_KEY=eyJhbGc...

# Developer tools (NOT bundled, server-side only)
DEVCADDY_JWT_SECRET=your-secret-key
DEVCADDY_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Plugin Options:**
- Keep minimal: `enabled`, `context`, `debug` only
- No UI positioning options in plugin (handled by UI component props)
- Consumer provides Supabase credentials via `initDevCaddy()` call

### UI/UX Implementation

**Toggle Button:**
- Use SVG icons (not unicode characters)
- Add ARIA labels: `aria-label`, `aria-expanded`, `title`
- No localStorage persistence initially (ship simple first)

**Annotation Popover:**
- Position using `createPortal` near selected element
- Calculate position from element's `getBoundingClientRect()`
- Fixed positioning with `zIndex: 10000`

**Window Positioning:**
- Start with fixed corner positioning only
- No draggable/resizable features initially
- Ship simple, add features based on user feedback

### Security Best Practices

**JWT Metadata:**
- Always use `app_metadata` for permissions (admin-only)
- Never use `user_metadata` for security (user-editable)
- RLS policies: `(auth.jwt()->'app_metadata'->>'role')::text`

**Content Sanitization:**
- Use DOMPurify before rendering annotation content
- Plain text only, no HTML allowed
- Prevents XSS attacks

**Rate Limiting:**
- Implement in Supabase Edge Function
- In-memory map or Upstash Redis
- 10 attempts per IP per hour

### Database Schema Management

**Current Approach (Phase 1): Manual Setup**
- Provide SQL migration files in `packages/migrations/`
- User runs migrations via Supabase Dashboard or CLI
- No automatic schema creation from package

**Why Manual Setup?**
1. **Security:** No risk of exposing service role keys in client code
2. **Simplicity:** Package stays focused on UI/annotations, not infrastructure
3. **Explicit:** Users understand what's being created in their database
4. **Control:** Users maintain full visibility into database changes

**Migration Files:**
- `001_initial_schema.sql` - Creates `annotation` table
- `002_rls_policies.sql` - Sets up Row Level Security policies

**Future (Phase 2): CLI Tool**
- Create `@devcaddy/cli` package
- Command: `npx @devcaddy/cli setup`
- Reads service role key from local `.env.local` only
- Automates migration execution server-side

---

## Build Configuration

### External Dependencies

**Externalize these packages:**
- `react`
- `react-dom`
- `@supabase/supabase-js`

**Rationale:**
- Keep bundle size small
- Don't bundle peer dependencies
- Let consumer manage versions

### Package Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    },
    "./dev-caddy.css": "./dist/dev-caddy.css"
  }
}
```

**Order matters:** `types` first, then `import`, then `require`

### Type Declarations

- Generate with `vite-plugin-dts`
- Include in package with `insertTypesEntry: true`
- Consider `rollupTypes: true` for single declaration file

### Published Files

Include in package:
- `dist/` - All build outputs
- `migrations/` - SQL migration files for users
- `README.md` - Package documentation

---

## Testing Mode Override (Development)

### Quick Mode Testing

```bash
# From root directory
npm run dev:developer    # Developer mode + auto-open browser
npm run dev:client       # Client mode + auto-open browser
```

### Query Parameter Override

```
http://localhost:5173?devCaddyMode=client
http://localhost:5173?devCaddyMode=developer
```

**Features:**
- No server restart required
- URL is shareable with teammates
- Works in any project using DevCaddy
- Only works in development mode (security)

### Default Mode Detection

| Vite Config | UI Mode |
|-------------|---------|
| `mode: 'development'` + `command: 'serve'` | developer |
| `mode: 'production'` + `command: 'serve'` | client |
| `command: 'build'` | null (disabled) |

---

## Documentation Priorities

**Write First:**
1. README.md (root) — Quick start guide
2. SETUP.md — Supabase configuration and role assignment
3. Troubleshooting — Common issues and solutions
4. API Reference — Generated from TSDoc comments

**Principle:**
- Document "how to use" before "how it works"
- Users need quick wins to adopt the tool

---

## Summary

This guide captures all major architectural decisions and implementation guidelines for DevCaddy. When implementing new features:

1. Check this document for existing decisions
2. Follow established patterns and principles
3. Add new decisions to this document as they're made
4. Keep TASKS.md updated with active work

For setup instructions, see **SETUP.md**. For project overview, see **README.md**.
