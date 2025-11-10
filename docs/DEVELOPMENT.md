# Development Guidelines

## Core Principles

1. Always prefer simplicity over cleverness
2. Always use the SOLID principles
3. `.ts` and `.tsx` files should be kept under 250 lines
4. Use a hybrid spec-driven + test-driven development approach
5. Do NOT write unit tests — focus on integration and E2E tests
6. Avoid mocking in integration and E2E tests

---

## Testing Strategy: Hybrid Spec-Driven + Test-Driven Development

DevCaddy uses a **hybrid approach** that combines the strengths of both Spec-Driven Development (SDD) and Test-Driven Development (TDD).

### Why Hybrid?

- **Specs** provide the "what" and "why" in business terms
- **Tests** provide the "how" with technical validation
- **Collaboration** is improved when stakeholders can read specs
- **Confidence** comes from automated tests that validate behavior end-to-end

### The DevCaddy Testing Workflow

#### 1. Write High-Level Specs (BDD-Style)

For user-facing features, start with behavior specs using **Gherkin syntax** (Given/When/Then):

```gherkin
Feature: Reviewer Annotation Flow
  Scenario: Reviewer adds annotation to UI element
    Given a reviewer has opened a magic-link staging site
    When they click on a button element
    And they add the comment "Change this to blue"
    Then the annotation should appear on the element
    And the developer should see the annotation in real-time
```

**Purpose:** Defines acceptance criteria in plain language that product owners and designers can validate.

#### 2. Implement with E2E Tests (Playwright)

Convert specs into executable **Playwright tests** that validate the entire flow:

```typescript
// tests/e2e/reviewer-annotation.spec.ts
test('reviewer can add annotation to UI element', async ({ page }) => {
  // Given: reviewer opens magic-link staging site
  await page.goto('https://staging.app.com?magic_link=abc123');

  // When: they click on a button and add comment
  await page.click('button#submit');
  await page.fill('[data-testid="annotation-input"]', 'Change this to blue');
  await page.click('[data-testid="submit-annotation"]');

  // Then: annotation appears and syncs to developer
  await expect(page.locator('[data-testid="annotation"]')).toBeVisible();
  // ... additional assertions
});
```

**Purpose:** Validates real behavior in a browser, no mocks, testing the actual user experience.

#### 3. Use TDD for Internal Implementation (RED/GREEN/REFACTOR)

For lower-level utilities and libraries, use classic **TDD**:

```typescript
// Example: selector extraction utility
// 1. RED - Write failing test
test('getElementSelectors returns unique CSS selector', () => {
  const element = document.querySelector('#app button.primary');
  const selector = getElementSelectors(element);
  expect(selector).toBe('#app button.primary');
});

// 2. GREEN - Implement minimal code to pass
// 3. REFACTOR - Clean up implementation
```

**Purpose:** Drives good design for technical utilities while maintaining fast feedback loops.

---

## Test Types and When to Use Them

| Test Type           | When to Use                                      | Tools           | Mocking? |
| ------------------- | ------------------------------------------------ | --------------- | -------- |
| **Specs (Gherkin)** | User-facing features, acceptance criteria        | `.feature` files | N/A      |
| **E2E Tests**       | Full user flows, annotation sync, magic links    | Playwright      | ❌ No     |
| **Integration Tests** | Multi-component interactions (UI + Supabase)   | Playwright, Vitest | ❌ No   |
| **Component Tests** | Isolated React components (visual regression)    | Storybook       | Limited  |
| **Unit Tests**      | **DO NOT WRITE** — Prefer integration/E2E tests  | ❌ None         | N/A      |

---

## Development Workflow

### For New Features

1. **Write a spec** in `specs/` directory using Gherkin syntax
2. **Review spec** with stakeholders to validate requirements
3. **Write E2E test** in Playwright that validates the spec
4. **Watch test fail** (RED)
5. **Implement feature** until test passes (GREEN)
6. **Refactor** code while keeping tests green (REFACTOR)
7. **Update spec** if requirements change during implementation

### For Bug Fixes

1. **Write E2E test** that reproduces the bug
2. **Fix the bug** until test passes
3. **Ensure no regressions** by running full E2E suite

### For Internal Utilities

1. **Write integration test** that validates behavior
2. **Use TDD** (RED/GREEN/REFACTOR) for implementation
3. **Avoid unit tests** — test utilities in context of actual usage

---

## Example: Spec + Test Pairing

**Spec:** `specs/magic-link-access.feature`
```gherkin
Feature: Magic Link Access
  Scenario: Expired link shows error
    Given a magic link that expired 1 hour ago
    When a reviewer clicks the link
    Then they should see "This link has expired"
    And they should not be able to leave annotations
```

**E2E Test:** `tests/e2e/magic-link-access.spec.ts`
```typescript
test('expired magic link shows error', async ({ page }) => {
  const expiredToken = generateExpiredToken(); // Helper
  await page.goto(`/review?token=${expiredToken}`);

  await expect(page.locator('text=This link has expired')).toBeVisible();
  await expect(page.locator('[data-testid="annotation-toolbar"]')).not.toBeVisible();
});
```

---

## Anti-Patterns to Avoid

❌ **Don't mock Supabase in E2E tests** — Use a test database instance
❌ **Don't write unit tests for React components** — Use Storybook or E2E tests
❌ **Don't skip specs for complex features** — Specs prevent miscommunication
❌ **Don't write specs for trivial utilities** — TDD alone is fine for simple helpers
❌ **Don't let specs drift** — Keep them updated as requirements evolve

---

## Testing Setup

### Playwright (E2E)

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run in UI mode for debugging
npm run test:e2e:ui
```

### Storybook (Component Tests)

```bash
# Start Storybook
npm run storybook

# Run visual regression tests
npm run test:storybook
```

### Supabase Local Testing

```bash
# Start local Supabase instance
npx supabase start

# Run migrations
npx supabase db reset

# Seed test data
npm run db:seed
```

---

## Summary

**Hybrid = Best of Both Worlds**

- Start with **specs** for clarity on "what" and "why"
- Validate with **E2E tests** for confidence in real behavior
- Use **TDD** for implementation details and refactoring
- Avoid **unit tests** and excessive mocking
- Prioritize **real behavior testing** over isolated testing

This approach ensures DevCaddy delivers value to users while maintaining high code quality and team collaboration.

---

## Implementation Guidelines

### Type Safety

**Window Globals:**
- Define window type augmentation in `src/types/global.d.ts`
- Declare `__DEV_CADDY_ENABLED__` and `__DEV_CADDY_UI_MODE__` once globally
- Avoid casting window types repeatedly in components

**Annotation Types:**
- Types defined in `src/types/annotations.ts` mirror database schema from `schema.dbml`
- Provide convenience types: `CreateAnnotationInput`, `UpdateAnnotationInput`
- Use `Omit` and `Partial` utilities for derived types

**Avoid `any` Types:**
- Replace `any` with `Record<string, unknown>` for truly dynamic types
- Use `unknown` when type cannot be determined at compile time
- Constrain generic parameters properly

### Configuration Strategy

**Environment Variables:**
- Consumer's app: `VITE_DEVCADDY_ENABLED`, `VITE_DEVCADDY_SUPABASE_URL`, `VITE_DEVCADDY_SUPABASE_ANON_KEY`
- Developer tools (NOT bundled): `DEVCADDY_JWT_SECRET`, `DEVCADDY_SUPABASE_SERVICE_ROLE_KEY`
- Never include service role keys in client bundles

**Plugin Options:**
- Keep minimal: `enabled`, `context`, `debug` only
- No UI positioning options in plugin (handled by UI component props)
- Consumer provides Supabase credentials via `initDevCaddy()` call, not plugin config

**Client API:**
- `src/client/index.ts` may not need exports initially
- Export functions as they're implemented, not speculatively
- Functions: `initDevCaddy`, `createAnnotation`, `subscribeToAnnotations`

### UI/UX Implementation

**Toggle Button:**
- Use SVG icons instead of unicode characters
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

### Build Configuration

**External Dependencies:**
- Externalize: `react`, `react-dom`, `@supabase/supabase-js`
- Keep bundle size small
- Don't bundle peer dependencies

**Package Exports:**
- Order: `types` first, then `import`, then `require`
- Export CSS separately: `./dev-caddy.css`
- Follow TypeScript resolution conventions

**Type Declarations:**
- Generate with `vite-plugin-dts`
- Include in package with `insertTypesEntry: true`
- Consider `rollupTypes: true` for single declaration file

### Testing Setup Timing

**When to Set Up:**
- Playwright: Set up now, write specs early, implement tests after features exist
- Storybook: Set up after core UI components are stable
- Vitest: Only for integration tests of pure functions (selector utilities)

**What NOT to Test:**
- No unit tests for React components (use Storybook or E2E instead)
- No Vitest for full flow tests (use Playwright)
- No mocking Supabase in E2E tests (use local Supabase instance)

### Documentation Priorities

**Write First:**
1. README.md (root) — Quick start guide
2. Supabase Setup Guide — Database schema + RLS policies
3. Magic Link Guide — How to generate and use tokens
4. Troubleshooting — Common issues and solutions
5. API Reference — Generated from TSDoc comments

**Documentation Principle:**
- Document "how to use" before "how it works"
- Users need quick wins to adopt the tool

---

## Database Schema Management

### Setup Strategy

**Phase 1 (Current): Manual Setup**
- Provide SQL migration files in `packages/migrations/`
- User runs migrations via Supabase Dashboard or CLI
- No automatic schema creation from package

**Phase 2 (Future): CLI Tool**
- Create `@devcaddy/cli` package
- Command: `npx @devcaddy/cli setup`
- Reads service role key from local `.env.local` only
- Automates migration execution server-side

**Why Manual Setup First?**
1. **Security:** No risk of exposing service role keys in client code
2. **Simplicity:** Package stays focused on UI/annotations, not infrastructure
3. **Explicit:** Users understand what's being created in their database
4. **Control:** Users maintain full visibility into database changes

**Migration Files:**
- `001_initial_schema.sql` - Creates `annotation` and `annotation_status` tables
- `002_rls_policies.sql` - Sets up Row Level Security policies
- Located in `packages/migrations/` directory

**User Workflow:**
1. Create Supabase project
2. Run SQL migrations (Dashboard or CLI)
3. Enable Realtime on `annotation` table
4. Configure environment variables
5. Initialize DevCaddy client in their app

See `docs/SUPABASE_SETUP.md` for complete setup documentation.
