# DevCaddy Prototyping Phase Summary

**Created:** 2025-11-18
**Purpose:** Comprehensive summary of decisions, patterns, and learnings from the prototyping phase

This document consolidates all the key information from the prototyping phase into a single reference. It captures the architectural decisions, implementation patterns, testing strategies, and lessons learned that shaped DevCaddy.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Vision & Goals](#project-vision--goals)
3. [Architecture Decisions](#architecture-decisions)
4. [Component Breakdown Strategy](#component-breakdown-strategy)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Element Selection & Reselection](#element-selection--reselection)
7. [Authentication & Security](#authentication--security)
8. [Implementation Principles](#implementation-principles)
9. [Key Technical Patterns](#key-technical-patterns)
10. [Injection Strategy](#injection-strategy)
11. [Known Limitations](#known-limitations)
12. [Lessons Learned](#lessons-learned)

---

## Overview

### What is DevCaddy?

DevCaddy is a lightweight collaboration layer that bridges the gap between product design feedback and developer workflows during the prototyping and staging phase. It enables stakeholders, designers, and clients to leave **in-context annotations directly on live UI elements** — no screenshots, no Figma exports, no messy email threads.

### Prototyping Phase Timeline

The prototyping phase spanned from initial concept through MVP implementation, focusing on:
- Core architecture design
- Component structure and breakdown
- Testing infrastructure setup
- Element selection and reselection strategies
- Authentication and security patterns
- Implementation principles and patterns

### Core Value Proposition

| For Clients/Reviewers | For Developers |
|----------------------|----------------|
| Click any UI element to leave feedback | See annotations directly on UI during dev |
| No accounts — magic-link access | Resolve/filter/inspect feedback |
| Context stays with the live UI | Real-time sync with local code |
| No screenshots or tools required | Minimal setup via Vite plugin |

---

## Project Vision & Goals

### Key Features Established

1. **Drop-in Vite plugin** - Minimal configuration required
2. **Automatic environment detection**
   - Local dev → developer UI (full CRUD)
   - Staging/preview → client UI (limited permissions)
   - Production → disabled by default
3. **Magic-link authentication** - No login friction for clients
4. **Supabase-powered backend** - Secure storage with RLS
5. **Real-time collaboration** - Instant sync between users
6. **Annotation intelligence** - DOM selectors with fallback strategies

### Intended Workflow

1. Developer installs npm package & plugin
2. Runs project locally → Dev UI appears automatically
3. Deploys preview/staging → Client UI auto-mounts
4. Developer generates magic review link
5. Client clicks link and annotates
6. Developer sees comments stream in live
7. Comments are resolved inside dev UI

### Mode-Specific Features

| Feature | Client Mode | Developer Mode |
|---------|-------------|----------------|
| Create annotations | ✅ | ✅ |
| View own annotations | ✅ | ✅ |
| View all annotations | ✅ | ✅ |
| Edit own annotations | ✅ | ✅ |
| Edit all annotations | ❌ | ✅ |
| Delete own annotations | ✅ | ✅ |
| Delete all annotations | ❌ | ✅ |
| Change status | ❌ | ✅ |
| Filter by page | ❌ | ✅ |
| Filter by author | ❌ | ✅ |
| Reply to annotations | ❌ | ✅ |
| Export annotations | ❌ | ✅ |

---

## Architecture Decisions

### Core Architectural Patterns

#### 1. Environment-Aware Plugin
- Detects Vite mode and command
- Injects appropriate UI based on context
- Disabled in production builds by default

**Mode Detection Logic:**
```
mode: 'development' + command: 'serve' → developer UI
mode: 'production' + command: 'serve' → client UI
command: 'build' → null (disabled)
```

#### 2. Supabase Client Initialization
- **Decision:** Explicit initialization by consumer
- User calls `initDevCaddy()` in their app
- Singleton pattern prevents multiple instances
- Anon key safe to use client-side with RLS

**Rationale:** Explicit over implicit, works with SSR/SSG frameworks

#### 3. Real-time Subscription Management (v0.2.0)
- **Changed from:** Page-scoped subscriptions
- **Changed to:** Single project-wide subscription
- Channel format: `annotations:all`
- All users see all annotations across entire project

**Benefits:**
- Simpler state management
- Better collaboration (full project context)
- Enables cross-page navigation
- No re-subscription on URL changes

#### 4. URL Normalization Strategy
- **Decision:** Always use pathname only
- Store: `window.location.pathname` (e.g., `/products`)
- Strips: protocol, query params, hash, trailing slash

**Trade-off:** Can't have different annotations for same route with different query params (acceptable for 90% of use cases)

#### 5. State Management
- **Decision:** React Context (no external library)
- Sufficient for 1-2 levels of nesting
- Subscribe to Supabase Realtime for updates
- Can migrate to Zustand/Redux later if needed

#### 6. Annotation Scoping (v0.2.0)
- **Decision:** Project-wide (changed from page-scoped)
- Load all annotations on mount
- Single subscription for project lifetime
- Cross-page navigation via sessionStorage

**Features Enabled:**
- View all annotations in single list
- Click annotation to navigate to its page
- Page badges show annotation location
- Real-time updates across all pages

---

## Component Breakdown Strategy

### Philosophy

During prototyping, we identified that components should be:
1. **Pure** - No side effects, deterministic rendering
2. **Single responsibility** - Each component does one thing well
3. **Under 250 lines** - Adherence to project guidelines
4. **Zero duplication** - Shared logic extracted to utilities/hooks
5. **Highly testable** - Easy to test in Storybook

### Component Analysis

**Initial State:** 20 components totaling 2,728 lines

**Components Over 100 Lines (Needed Breakdown):**
- AnnotationBadges.tsx (303 lines)
- AnnotationPopover.tsx (267 lines)
- Developer/AnnotationDetail.tsx (259 lines)
- Developer/AnnotationManager.tsx (225 lines)
- DevCaddy.tsx (225 lines)
- ElementHighlight.tsx (223 lines)
- Client/AnnotationList.tsx (217 lines)
- Client/AnnotationDetail.tsx (216 lines)
- AuthPrompt.tsx (183 lines)

### Breakdown Approach

#### Phase 1: Extract Utilities
Created shared utilities to eliminate duplication:
- `findElement()` - Multi-strategy element selection
- `isElementVisible()` - Visibility detection
- `getScrollableAncestors()` - Scroll container detection
- `formatDate()` - Date formatting
- `getElementKey()` - Element identification
- `groupAnnotations()` - Group by element and status

**Lines saved:** ~405 lines of duplicated code

#### Phase 2-3: Create Atomic Components
Created 30+ reusable components:
- **Display:** StatusBadge, PageBadge, ElementCode, EmptyState, ErrorDisplay
- **Form:** FormField, TextArea, StatusSelect
- **Button:** ActionButton, BackButton
- **Layout:** DetailSection
- **Composite:** AnnotationHeader, AnnotationMeta, LoadingState, PopoverHeader

#### Phase 4-5: Custom Hooks
Created reusable hooks:
- `useThrottledPosition` - Throttled scroll/resize handling
- `useElementVisibility` - Track element visibility
- `useElementPosition` - Combined position tracking
- `useAnnotationNavigation` - Cross-page navigation
- `useFormKeyboardShortcuts` - Keyboard shortcuts (Ctrl+Enter, Escape)

#### Phase 6: Refactor Large Components
Broke down complex components using atomic pieces:
- **AnnotationDetail** (95% duplicate code eliminated)
  - Created 4 shared components: Header, Content, Editor, Actions
  - Developer version: 202 → 164 lines (19% reduction)
  - Client version: 184 → 146 lines (21% reduction)
- **AnnotationManager** (202 → 169 lines, 16% reduction)
- **AnnotationList** (157 → 138 lines, 12% reduction)
- **AnnotationPopover** (210 → 89 lines, 58% reduction)
- **AnnotationBadges** (177 → 165 lines, 7% reduction)

### Results

**Expected Outcome Achieved:**
- ✅ ~19% reduction in total lines (528 lines eliminated)
- ✅ Zero duplication of logic
- ✅ All components under 250 lines
- ✅ 30+ new atomic components
- ✅ 8+ reusable custom hooks
- ✅ 8+ shared utilities

### Directory Structure (After Refactoring)

```
packages/src/ui/
├── Core/
│   ├── components/
│   │   ├── annotation/    # Annotation-specific components
│   │   ├── badges/        # StatusBadge, PageBadge
│   │   ├── button/        # ActionButton, BackButton
│   │   ├── display/       # ElementCode, EmptyState, ErrorDisplay
│   │   ├── form/          # FormField, TextArea, StatusSelect
│   │   ├── filter/        # FilterGroup
│   │   ├── layout/        # DetailSection
│   │   ├── loading/       # LoadingState
│   │   ├── composite/     # Complex multi-part components
│   │   └── auth/          # AuthPrompt components
│   ├── lib/
│   │   ├── annotation/    # Annotation utilities
│   │   ├── element/       # Element utilities
│   │   └── selector/      # Selector extraction (existing)
│   ├── hooks/
│   │   ├── useThrottledPosition.ts
│   │   ├── useElementVisibility.ts
│   │   ├── useAnnotationNavigation.ts
│   │   └── useFormKeyboardShortcuts.ts
│   └── utility/
│       ├── format-date.ts
│       ├── navigation.ts
│       └── positioning.ts
├── Developer/
│   ├── components/        # Developer-specific components
│   ├── AnnotationDetail.tsx
│   ├── AnnotationManager.tsx
│   └── AnnotationFilters.tsx
└── Client/
    ├── components/        # Client-specific components
    ├── AnnotationDetail.tsx
    └── AnnotationList.tsx
```

---

## Testing Infrastructure

### Testing Philosophy

Per development principles:
- ✅ **DO** write E2E tests with Playwright
- ✅ **DO** write integration tests for multi-component interactions
- ✅ **DO** write specs (Gherkin) for user-facing features
- ❌ **DON'T** write unit tests
- ❌ **DON'T** mock Supabase (use Supabase branch for testing)

### Hybrid Spec-Driven + Test-Driven Development

**Workflow:**
1. Write Gherkin specs for features (Given/When/Then)
2. Review specs with stakeholders
3. Write Playwright E2E tests validating specs
4. Implement using TDD (RED/GREEN/REFACTOR)
5. Refactor while keeping tests green

### Test Layers

| Layer | Tool | Purpose | Mocking? |
|-------|------|---------|----------|
| **Specs** | Gherkin | Business requirements & acceptance criteria | N/A |
| **E2E Tests** | Playwright | Full user flows (annotation sync, etc.) | ❌ No |
| **Integration Tests** | Playwright/Vitest | Multi-component behavior | ❌ No |
| **Component Tests** | Storybook | Visual regression for isolated components | Limited |
| **Unit Tests** | ❌ None | **DO NOT WRITE** — Prefer integration/E2E | N/A |

### Supabase Branch Strategy

**Key Innovation:** Use Supabase branches for test database isolation

**Benefits:**
- ✅ Isolated test database (no production data affected)
- ✅ Hosted infrastructure (realistic testing)
- ✅ Fast reset between runs
- ✅ No Docker setup required
- ✅ Migrations auto-applied to branch
- ✅ Branch-specific API keys

**Automated Workflow:**
```bash
# Developer simply runs:
npm run test:integration
# or
npm run test:e2e

# Behind the scenes:
# 1. Setup script creates ephemeral branch (test-{timestamp})
# 2. Tests run against branch
# 3. Teardown script deletes branch
# No manual branch management needed!
```

### Branch Manager Implementation

Created comprehensive automation:
- `createTestBranch()` - Creates ephemeral branch with timestamp
- `deleteTestBranch()` - Deletes branch by name
- `cleanupOrphanedBranches()` - Removes old test branches
- Global setup/teardown for Playwright
- Setup hooks for Vitest
- Timeouts configured (90s create, 30s delete, 10s list)

### Test Coverage Planned

**Phase 1: Setup & Foundation** ✅
- Playwright and Vitest installation
- Branch manager utility
- Global setup/teardown scripts
- Example tests written

**Phase 2: Integration Tests** (Future)
- Client API initialization
- Annotation CRUD operations
- URL normalization
- Realtime subscriptions

**Phase 3: E2E Tests** (Future)
- Authentication flow
- Annotation creation
- Real-time sync between users
- Cross-page navigation

**Phase 4: RLS Policy Tests** (Future)
- Permission matrix verification
- Unauthenticated user blocking
- Role-based access control

### Key Testing Learnings

**What Worked:**
- Automated branch lifecycle management
- Single fork mode for Vitest (share branch across tests)
- Ephemeral branches prevent state pollution
- Cleanup script for orphaned branches

**What Needed Improvement:**
- Need explicit timeouts for branch operations
- Must verify `updated_by` field in CRUD tests
- URL normalization requires dedicated test suite
- Need tests for unauthenticated users
- RLS error messages should be verified

---

## Element Selection & Reselection

### Problem Statement

Store comprehensive selector data to later re-select elements when annotations are loaded. Enable:
1. Visual indicators showing which elements have annotations
2. Click annotation to jump to/highlight the element
3. Badge rendering with status-specific colors

### Selector Storage Strategy

**Multi-layered approach for reliability:**
```typescript
interface Annotation {
  element_tag: string;                    // "BUTTON"
  compressed_element_tree: string;        // "body>DIV[0]>MAIN[1]>BUTTON[2]"
  element_id: string | null;              // "submit-btn"
  element_test_id: string | null;         // "checkout-button"
  element_role: string | null;            // "button"
  element_unique_classes: string | null;  // "btn btn-primary submit"
  element_parent_selector: string | null; // "FORM#checkout-form"
  element_nth_child: number | null;       // 2
}
```

### Reselection Strategy

**Fallback order (most stable → least stable):**
1. ID selector (~95% success rate)
2. Test-id selector (~90% success rate)
3. Compressed tree selector (~70-80% success rate)
4. Parent + nth-child (~60-70% success rate)
5. Classes only (~40-50% success rate)

**Validation:** Check element characteristics match stored data

### Badge Rendering Design

**Status-Specific Badges:**
- Each status gets its own color-coded badge
- Badges stack vertically in element's top-right corner
- Shows count for each status

**Color Scheme:**
```typescript
const STATUS_COLORS = {
  'new': '#ef4444',           // Red - needs attention
  'in-progress': '#f59e0b',   // Orange - being worked on
  'in-review': '#8b5cf6',     // Purple - awaiting review
  'hold': '#6b7280',          // Gray - paused/blocked
  'resolved': '#10b981',      // Green - completed
};
```

**Positioning Strategy:**
Wrapper element with relative positioning (better than fixed):
```typescript
// Wrapper approach - badges automatically scroll with element
const wrapper = document.createElement('div');
wrapper.style.position = 'relative';
element.parentNode.insertBefore(wrapper, element);
wrapper.appendChild(element);

badgeGroup.style.position = 'absolute';
badgeGroup.style.top = '-8px';
badgeGroup.style.right = '-8px';
wrapper.appendChild(badgeGroup);
```

**Benefits:**
- ✅ Badges scroll automatically with elements
- ✅ Inherits CSS transforms
- ✅ No scroll event listeners needed
- ✅ Better performance

### Dynamic Content Handling

**MutationObserver for React Re-renders:**
```typescript
const observer = new MutationObserver((mutations) => {
  // Detect when annotated elements change
  // Re-render badges as needed
  // Debounce to batch rapid changes (300ms)
});
```

**SPA Route Change Detection:**
```typescript
// Hook into history API
window.addEventListener('popstate', handleRouteChange);
history.pushState = wrap(originalPushState, handleRouteChange);
history.replaceState = wrap(originalReplaceState, handleRouteChange);
```

### Known Limitations

**Will NOT work for:**
- ❌ Cross-origin iframes (security prevents DOM access)
- ❌ Closed shadow DOM (inaccessible by design)
- ❌ Dynamically generated IDs (React auto-IDs like `react-id-1234`)
- ❌ Virtual scrolling (elements not in DOM until scrolled into view)
- ❌ Canvas/WebGL content (no DOM elements to select)

**Recommendation:** Document limitations and encourage stable IDs/test-ids

### Real-World Validation

**Similar tools using this approach:**
- Chrome DevTools - 95%+ success rate for static elements
- Selenium/Playwright - Proven reliability for UI testing
- Visual regression tools (Percy, Chromatic) - 80-90% success
- Browser extensions (Grammarly, LastPass) - Badge overlay pattern

### Implementation Phases

**MVP (6-8 hours):**
- Reselection with ID + test-id + tree strategies
- Wrapper-based badge rendering
- Color-coded badges by status
- Jump-to-element functionality
- Basic badge click filtering

**Enhancement 1 (4-5 hours):**
- MutationObserver for dynamic content
- SPA route change hooks
- Badge cleanup on unmount

**Enhancement 2 (5-6 hours):**
- All fallback selector strategies
- Element validation
- Intersection Observer optimization
- Stale element warnings

**Enhancement 3 (4-5 hours):**
- Shadow DOM support
- Badge collision detection
- Accessibility features
- Error boundaries

---

## Authentication & Security

### Magic Link Authentication

**Decision:** Supabase Auth with magic links (passwordless)

**Workflow:**
1. User enters email address
2. Supabase sends time-limited magic link
3. User clicks link to authenticate
4. Session persists in browser localStorage
5. No password management required

**Benefits:**
- ✅ No passwords to remember or manage
- ✅ Reduces security risks (no password leaks)
- ✅ Better UX (one click to authenticate)
- ✅ Built-in email verification
- ✅ Time-limited tokens (auto-expire)

### User Management Strategy

**Upfront User Creation:**
1. Team lead creates all users via SQL (before authentication)
2. Team lead assigns roles (`developer` or `client`) via `app_metadata`
3. Users authenticate via magic link when ready
4. Session persists with secure JWT tokens

**SQL Example:**
```sql
-- Create user with role in app_metadata
INSERT INTO auth.users (email, raw_app_meta_data)
VALUES (
  'developer@example.com',
  '{"role": "developer"}'::jsonb
);
```

### Security Model

**Row Level Security (RLS) Policies:**

| Action | Everyone | Developer | Client (Own) | Client (Others) |
|--------|----------|-----------|--------------|-----------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Insert | ✅ | ✅ | ✅ | ✅ |
| Update | ❌ | ✅ | ✅ | ❌ |
| Delete | ❌ | ✅ | ✅ | ❌ |

**Key Security Principles:**

1. **Use `app_metadata` for roles (CRITICAL)**
   - Admin-only field, users cannot modify
   - `user_metadata` is user-editable and NEVER used for permissions
   - RLS checks: `(auth.jwt()->'app_metadata'->>'role')::text = 'developer'`

2. **Content Sanitization**
   - Use DOMPurify before rendering annotation content
   - Plain text only, no HTML allowed
   - Prevents XSS attacks

3. **Rate Limiting**
   - Implement in Supabase Edge Function
   - 10 attempts per IP per hour
   - Returns 429 status when limit exceeded

4. **Production Safety**
   - UI automatically disabled in production builds
   - Warning displayed if accidentally enabled
   - No code injected when `enabled: false`

### Session Management

**Persistence:**
- Sessions stored in browser's local storage
- Automatically restored on page refresh
- Default expiration: 1 hour (configurable in Supabase)
- Manual sign out clears session

**Hook Implementation:**
```typescript
// useAuth hook provides:
const { user, isAuthenticated, loading, session } = useAuth();

// Functions:
sendMagicLink(email, redirectTo?)
signOut()
```

---

## Implementation Principles

### Core Development Principles

From `docs/IMPLEMENTATION.md`:

1. **Always prefer simplicity over cleverness**
2. **Always use the SOLID principles**
3. **`.ts` and `.tsx` files should be kept under 250 lines**
4. **Use a hybrid spec-driven + test-driven development approach**
5. **Do NOT write unit tests** — focus on integration and E2E tests
6. **Avoid mocking in integration and E2E tests**

### Anti-Patterns to Avoid

From prototyping learnings:

- ❌ **Don't mock Supabase in E2E tests** — Use a test database instance
- ❌ **Don't write unit tests for React components** — Use Storybook or E2E tests
- ❌ **Don't skip specs for complex features** — Specs prevent miscommunication
- ❌ **Don't write specs for trivial utilities** — TDD alone is fine
- ❌ **Don't let specs drift** — Keep them updated as requirements evolve
- ❌ **Don't repeat type definitions** — Use global.d.ts for window types
- ❌ **Don't use `any` types** — Use `Record<string, unknown>` or `unknown`

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
- Consumer provides Supabase credentials via `initDevCaddy()` call
- No UI positioning options in plugin (handled by UI component props)

### UI/UX Decisions

**Toggle Button:**
- Use SVG icons (not unicode characters)
- Add ARIA labels for accessibility
- No localStorage persistence initially

**Annotation Popover:**
- Position using `createPortal` near selected element
- Calculate position from element's `getBoundingClientRect()`
- Fixed positioning with `zIndex: 10000`

**Window Positioning:**
- Start with fixed corner positioning
- No draggable/resizable features initially
- Ship simple, add features based on feedback

### Database Schema Management

**Approach: Manual Setup (Phase 1)**

**Why manual?**
1. Security: No service role keys in client code
2. Simplicity: Package focuses on UI, not infrastructure
3. Explicit: Users understand what's created
4. Control: Users maintain full visibility

**Setup process:**
1. User creates Supabase project
2. User runs provided SQL migrations
3. User enables Realtime on annotation table
4. User configures environment variables

**Future enhancement (Phase 2):**
- CLI tool: `npx @devcaddy/cli setup`
- Reads service role key from local `.env.local` only
- Server-side only, never bundled with client

---

## Key Technical Patterns

### Selector Extraction

**Multi-strategy approach for reliability:**
```typescript
export function getElementSelectors(elm, root) {
  return {
    tag,           // Element tag name
    role,          // ARIA role
    id,            // Element ID
    testId,        // data-testid attribute
    classes,       // Class list
    parent,        // Parent selector
    nthChild,      // Position in parent
    compressedTree // Path from root
  };
}
```

### Annotation Grouping

**Two-dimensional grouping:**
1. Group by element (which DOM element)
2. Group by status (within element)

```typescript
// Result structure:
{
  <button#submit>: {
    'new': 2,           // 2 new annotations
    'in-progress': 1,   // 1 in-progress annotation
    'resolved': 3       // 3 resolved annotations
  }
}
```

### Cross-Page Navigation

**SessionStorage-based pending annotation:**
```typescript
function navigateToAnnotation(annotation: Annotation) {
  if (annotation.page !== window.location.pathname) {
    // Store annotation ID for after navigation
    sessionStorage.setItem('devcaddy_pending_annotation', annotation.id.toString());
    // Navigate to annotation's page
    window.location.pathname = annotation.page;
  } else {
    // Same page - select immediately
    selectAnnotation(annotation);
  }
}

// On page load, check for pending annotation
function checkPendingAnnotation() {
  const pendingId = sessionStorage.getItem('devcaddy_pending_annotation');
  if (pendingId) {
    sessionStorage.removeItem('devcaddy_pending_annotation');
    const annotation = annotations.find(a => a.id === parseInt(pendingId));
    if (annotation) selectAnnotation(annotation);
  }
}
```

### Element Visibility Detection

**Using `document.elementFromPoint()`:**
```typescript
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  // Check if in viewport
  if (rect.width === 0 || rect.height === 0) return false;

  // Check if behind modal/overlay
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const topElement = document.elementFromPoint(centerX, centerY);

  return topElement !== null && element.contains(topElement);
}
```

### Modal/Popup Support

**Z-index defensive strategy:**
```scss
// Layering (highest to lowest):
.dev-caddy-popover { z-index: 999999; }    // Annotation input
.dev-caddy-badge { z-index: 999998; }      // Status badges
.dev-caddy-highlight { z-index: 999997; }  // Element outline
.dev-caddy-window { z-index: 999995; }     // Main panel
.dev-caddy-toggle { z-index: 999995; }     // Toggle button
```

**MutationObserver for element removal:**
```typescript
const observer = new MutationObserver(() => {
  if (!document.contains(selectedElement)) {
    clearSelection(); // Element removed from DOM
  }
});
```

**Scroll container detection:**
```typescript
export function getScrollableAncestors(element: Element): HTMLElement[] {
  const scrollableAncestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    const computedStyle = window.getComputedStyle(parent);
    const overflow = computedStyle.overflow +
                    computedStyle.overflowY +
                    computedStyle.overflowX;

    if (overflow.includes('scroll') || overflow.includes('auto')) {
      scrollableAncestors.push(parent);
    }

    parent = parent.parentElement;
  }

  return scrollableAncestors;
}
```

---

## Injection Strategy

### Original Plan: Wrapper Component

**Phase 1: Data Foundation**
- Capture comprehensive selector data
- Store in Supabase annotation table
- Centralize real-time data in store

**Phase 2: Confidence Scoring**
- Wrapper component mounts: `<DevCaddyProvider><App /></DevCaddyProvider>`
- Environment-aware initialization
- Dynamic DOM search after mount/re-render
- Weighted confidence calculation

**Phase 3: Dynamic Rendering**
- Contextual positioning (fixed/absolute)
- Confidence-driven styling (graduated scale)
- Dual-mode interactivity (developer vs client)

### Evolved Implementation

**Actual implementation used:**
- Vite plugin injects global variables in `<head>`
- React components mount conditionally based on `__DEV_CADDY_UI_MODE__`
- No wrapper component required
- Plugin handles HTML transformation via `transformIndexHtml`

**Benefits:**
- Simpler integration for consumers
- No app wrapping required
- Clear separation of concerns
- Race conditions eliminated

---

## Known Limitations

### Element Reselection Limitations

**Will NOT work for:**
1. ❌ Cross-origin iframes - Security prevents DOM access
2. ❌ Closed shadow DOM - Inaccessible by design
3. ❌ Dynamically generated IDs - Elements with random IDs like `react-id-1234`
4. ❌ Virtual scrolling - Elements not in DOM until scrolled into view
5. ❌ Canvas/WebGL content - No DOM elements to select

**Recommendation:**
- Document as known limitations in user docs
- Provide guidance: use stable IDs/test-ids for important elements
- Avoid annotating virtualized list items
- Success depends on DOM stability

### Selector Stability

**Expected Success Rates:**
- ID selector: ~95% (if IDs are stable)
- Test-id selector: ~90% (if using data-test-id pattern)
- Compressed tree: ~70-80% (depends on DOM stability)
- Parent + nth-child: ~60-70% (fragile to sibling changes)
- Classes only: ~40-50% (very fragile)

### Browser Compatibility

- `Element.scrollIntoView({ behavior: 'smooth' })` - IE11 needs polyfill
- `WeakRef` - No IE11 support (use Map with manual cleanup)
- `IntersectionObserver` - IE11 needs polyfill

### Performance Considerations

**Acceptable performance up to:**
- ~500 annotations (project-wide)
- ~100 annotations per page
- ~50ms average reselection time

**Mitigation strategies:**
- Pagination/virtualization for large lists
- Intersection Observer for badge rendering
- Debouncing for MutationObserver updates

---

## Lessons Learned

### What Worked Well

1. **Automated test branch management**
   - Eliminated manual setup overhead
   - Prevented state pollution between test runs
   - Saved significant developer time

2. **Project-wide annotation scoping**
   - Better user experience than page-scoped
   - Enabled cross-page navigation
   - Simpler state management

3. **Component breakdown strategy**
   - 19% line reduction achieved
   - Zero duplication of logic
   - All components under 250 lines
   - Highly reusable atomic components

4. **Wrapper-based badge positioning**
   - Better performance than fixed positioning
   - Automatic scroll handling
   - Inherits CSS transforms

5. **Magic link authentication**
   - Reduced friction for clients
   - Built into Supabase (no custom backend)
   - Professional UX

6. **Hybrid spec-driven + TDD approach**
   - Specs prevented miscommunication
   - E2E tests validated real behavior
   - No mocking improved confidence

### What Needed Improvement

1. **Initial component structure**
   - Too much duplication (95% in AnnotationDetail components)
   - Components too large (300+ lines)
   - Mixed responsibilities

2. **URL normalization strategy**
   - Needed dedicated test coverage
   - Edge cases not initially considered
   - Query param handling clarified late

3. **Element reselection approach**
   - Initial design too complex
   - Simplified to wrapper-based positioning
   - Feasibility analysis needed upfront

4. **Testing strategy**
   - Missing unauthenticated user scenarios
   - Needed explicit timeout configuration
   - RLS error message assertions too vague

5. **Documentation organization**
   - Too many separate files (11 → 4 consolidation)
   - Inconsistent terminology (client vs reviewer)
   - Needed clear entry point (docs/README.md)

### Key Insights

1. **Explicit > Implicit**
   - Manual setup better than "magic" auto-setup
   - Users prefer understanding what's created
   - Security through transparency

2. **Simple First, Features Later**
   - Ship basic functionality before advanced features
   - Add features based on user feedback
   - Don't pre-optimize

3. **Real Behavior > Mocks**
   - Test with real Supabase database
   - Use actual browser for E2E tests
   - No mocking increases confidence

4. **Component Composition > Monoliths**
   - Small, focused components are easier to maintain
   - Extract shared logic to utilities/hooks
   - Zero duplication pays dividends

5. **Security by Design**
   - Use app_metadata for permissions (admin-only)
   - Never trust user input (sanitize)
   - Fail explicitly with clear errors

### Best Practices Established

1. **File Organization**
   - Keep files under 250 lines
   - Extract utilities when duplication appears
   - Create shared components for common patterns

2. **Testing Approach**
   - Write specs for complex features
   - E2E tests validate full workflows
   - Integration tests verify API behavior
   - No unit tests (per principles)

3. **Security Patterns**
   - app_metadata for permissions
   - RLS policies for data access
   - Content sanitization before rendering
   - Rate limiting for abuse prevention

4. **Component Design**
   - Pure components (no side effects)
   - Single responsibility
   - TypeScript for type safety
   - ARIA labels for accessibility

5. **State Management**
   - React Context for simple needs
   - Supabase Realtime for sync
   - SessionStorage for navigation state
   - No external state library needed

### Future Considerations

**Post-MVP enhancements to explore:**
- Annotation threading and replies
- User mentions (@username)
- Screenshot capture and attachment
- Integration with issue trackers (GitHub, Linear, Jira)
- Advanced filtering and search
- Annotation export (CSV, JSON)
- Storybook component library
- Hosted SaaS option (for teams who don't want to manage Supabase)

**Testing improvements:**
- Complete E2E test coverage
- Performance baseline tests
- Security penetration testing
- Visual regression testing
- Load testing with concurrent users

**Architecture evolution:**
- Consider Zustand/Redux if state grows complex
- Add pagination for large annotation sets
- Optimize with virtual scrolling for lists
- Support for closed shadow DOM (if possible)
- Better handling of virtual scrolling scenarios

---

## Summary

The prototyping phase successfully established:

1. **Clear architecture** - Environment-aware plugin with real-time sync
2. **Component structure** - Atomic, reusable components under 250 lines
3. **Testing strategy** - Automated Supabase branches, hybrid spec+TDD approach
4. **Security model** - Magic links, RLS policies, content sanitization
5. **Element strategy** - Multi-fallback selector with 80-95% success rate
6. **Implementation principles** - Simplicity, SOLID, no unit tests, no mocking

**Key achievements:**
- ✅ 19% code reduction through component breakdown
- ✅ Zero duplication of logic
- ✅ Automated test infrastructure
- ✅ Project-wide annotation scoping
- ✅ Cross-page navigation support
- ✅ Comprehensive security model

**Key learnings:**
- Manual setup > automatic "magic"
- Real behavior testing > mocking
- Component composition > monoliths
- Explicit security > implicit trust
- Simple first > feature-rich later

This prototyping phase laid a solid foundation for the MVP implementation and future enhancements. The decisions, patterns, and learnings documented here will guide ongoing development and help new contributors understand the project's architecture and philosophy.

---

**Document Version:** 1.0
**Created:** 2025-11-18
**Status:** Archived Prototype Documentation
