# DevCaddy MVP Development Tasks

**Purpose:** Primary task tracking for MVP development
**Status Key:** ❌ Not Started | 🔄 In Progress | ✅ Complete | 🚫 Blocked

---

## MVP Definition

**Core Functionality:**
- Vite plugin that injects DevCaddy UI based on environment detection
- Click-to-select annotation creation on UI elements
- Annotation storage in Supabase with RLS
- Real-time sync between reviewer (client mode) and developer (developer mode)
- Manual database setup with provided SQL migrations

**Out of Scope for MVP:**
- Magic link generation (manual JWT creation documented instead)
- CLI tools for automation
- Advanced annotation features (threading, mentions, screenshots)
- Storybook component library
- Comprehensive test coverage

---

## Phase 1: Foundation & Critical Blockers ✅

### 1.1 Database Schema & Setup ✅

**Priority:** CRITICAL (blocks all other features)

- [x] Create `packages/migrations/` directory
- [x] Generate `001_initial_schema.sql` from schema.dbml
  - [x] annotation_status table with default records
  - [x] annotation table with all fields from schema.dbml
  - [x] Add created_at, updated_at, created_by fields
  - [x] Add indexes for performance (page, status_id, created_by, created_at)
  - [x] Add triggers for auto-updating updated_at
  - [x] Add triggers for managing resolved_at based on status
- [x] Generate `002_rls_policies.sql`
  - [x] Enable RLS on both tables
  - [x] Policy: Reviewers can INSERT annotations
  - [x] Policy: Reviewers can SELECT/UPDATE own annotations
  - [x] Policy: Developers can SELECT all annotations
  - [x] Policy: Developers can UPDATE/DELETE all annotations
  - [x] Policy: All users can SELECT annotation_status
- [ ] Verify migrations work in local Supabase instance (deferred to Phase 6)
- [x] SUPABASE_SETUP.md already exists with detailed instructions

**Dependencies:** None
**Blocks:** All annotation features (2.x, 3.x)
**Aligns with:** Manual setup first, explicit database schema

---

### 1.2 Type System Alignment ✅

**Priority:** CRITICAL (prevents type errors)

- [x] Update `packages/src/types/annotations.ts`
  - [x] Add `created_at: string` (ISO 8601 format)
  - [x] Add `updated_at: string` (ISO 8601 format)
  - [x] Add `created_by: string` (user identifier)
  - [x] Update `resolved_at` type to `string | null` (ISO 8601 format)
  - [x] Add comprehensive JSDoc comments for all fields
  - [x] Update CreateAnnotationInput to omit auto-generated fields
  - [x] Update UpdateAnnotationInput with better documentation
- [x] Update `packages/src/types/plugin.ts`
  - [x] Change `DevCaddyMode` to include `null`: `'client' | 'developer' | null`
  - [x] Add JSDoc to all types and interfaces
- [x] Fix `packages/src/types/global.d.ts`
  - [x] Verify Window interface augmentation is correct (already correct)
  - [x] Export empty object to make it a module (already present)
- [x] Update `docs/schema.dbml` to match final TypeScript types

**Dependencies:** 1.1 (schema must be finalized)
**Blocks:** 2.1, 2.2 (client API needs correct types)
**Aligns with:** Types mirror database schema

---

### 1.3 Root Documentation ✅

**Priority:** HIGH (user experience, first impression)

- [x] Create root `README.md`
  - [x] Project overview and purpose
  - [x] Quick start guide with installation
  - [x] Monorepo structure (packages/ vs examples/)
  - [x] Link to all documentation in docs/
  - [x] Development setup instructions
  - [x] Testing strategy overview
  - [x] Security information
  - [x] License information (MIT)
- [x] Update `examples/simple/README.md`
  - [x] Remove generic Vite template content
  - [x] Explain example purpose and what it demonstrates
  - [x] How to run locally with prerequisites
  - [x] Environment variable setup instructions
  - [x] Usage guide for developer and client modes
  - [x] Troubleshooting section
- [x] Update `.gitignore` at root
  - [x] Better organization with comments
  - [x] Added build outputs, test coverage, temp files

**Dependencies:** None
**Blocks:** None (but improves developer experience)
**Aligns with:** Documentation-first approach

---

### 1.4 Build Configuration ✅

**Priority:** HIGH (needed to publish package)

- [x] Add `files` field to `packages/package.json`
  - [x] `["dist", "migrations", "README.md"]`
- [x] Add `prepublishOnly` script
  - [x] `"prepublishOnly": "npm run build"`
- [x] Verify build process works correctly
  - [x] Test build and verify dist/ contents
  - [x] Confirmed outputs: index.es.js, index.cjs.js, index.d.ts, dev-caddy.css, type directories
- [x] Document build output structure in CLAUDE.md
  - [x] Added build output structure section
  - [x] Added published files section
  - [x] Updated externals list

**Note:** SCSS import is handled correctly - CSS is compiled separately and exported via package.json exports field. No changes needed.

**Dependencies:** None
**Blocks:** Publishing to npm
**Aligns with:** Explicit build configuration

---

## Phase 2: Client API Implementation ✅

### 2.1 Supabase Client Initialization ✅

**Priority:** CRITICAL (core dependency)

- [x] Install dependencies
  - [x] Verify `@supabase/supabase-js` is in dependencies (v2.79.0)
- [x] Create `packages/src/client/api/init.ts`
  - [x] Implement `initDevCaddy(config)` function
    - [x] Accept `supabaseUrl` and `supabaseAnonKey`
    - [x] Create Supabase client singleton
    - [x] Validate config parameters (URL format, required fields)
    - [x] Throw clear error if missing config
  - [x] Implement `getSupabaseClient()` function
    - [x] Return existing client
    - [x] Throw error if not initialized
  - [x] Add `resetDevCaddy()` internal function for testing
  - [x] Add comprehensive JSDoc comments with examples
  - [x] Keep under 100 lines (91 lines)
- [x] Update `packages/src/client/index.ts`
  - [x] Export `initDevCaddy` and `getSupabaseClient`
  - [x] Export `DevCaddyConfig` type
  - [x] Add JSDoc module comment

**Dependencies:** 1.1 (database must exist), 1.2 (types)
**Blocks:** 2.2, 2.3 (all API functions need client)
**Aligns with:** Singleton pattern, explicit initialization

---

### 2.2 Annotation API Functions ✅

**Priority:** CRITICAL (core feature)

- [x] Create `packages/src/client/api/annotations.ts`
  - [x] Implement `createAnnotation(input: CreateAnnotationInput)`
    - [x] Use `getSupabaseClient()`
    - [x] Insert into annotations table
    - [x] Return created annotation
    - [x] Handle errors with clear messages
  - [x] Implement `updateAnnotation(id, input: UpdateAnnotationInput)`
    - [x] Update specific annotation
    - [x] Handle "not found" case (PGRST116 error code)
  - [x] Implement `deleteAnnotation(id: number)`
    - [x] Delete annotation by ID
    - [x] Handle "not found" case
  - [x] Implement `getAnnotationsByPage(pageUrl: string)`
    - [x] Fetch all annotations for a page
    - [x] Order by created_at descending
  - [x] Add comprehensive JSDoc comments with examples to all functions
  - [x] Each function under 50 lines
- [x] Update `packages/src/client/index.ts`
  - [x] Export annotation functions
  - [x] Export types: `CreateAnnotationInput`, `UpdateAnnotationInput`, `Annotation`
  - [x] Export additional types: `AnnotationStatus`, `AnnotationStatusName`, `AnnotationWithStatus`

**Dependencies:** 2.1 (needs Supabase client)
**Blocks:** 3.2 (state management needs API)
**Aligns with:** SOLID - single responsibility per function

---

### 2.3 Realtime Subscriptions ✅

**Priority:** CRITICAL (core feature)

- [x] Create `packages/src/client/api/subscriptions.ts`
  - [x] Implement `normalizeUrl(url: string)` utility
    - [x] Strip protocol (`https://` → ``)
    - [x] Strip default ports (`:80`, `:443`)
    - [x] Keep path
    - [x] Strip query params (`?foo=bar`)
    - [x] Strip hash (`#section`)
    - [x] Remove trailing slashes
    - [x] Return normalized string
    - [x] Handle invalid URLs gracefully
    - [x] Add JSDoc with examples
  - [x] Implement `subscribeToAnnotations(pageUrl, callback)`
    - [x] Use `getSupabaseClient()`
    - [x] Normalize page URL
    - [x] Create channel: `annotations:${normalizedUrl}`
    - [x] Subscribe to postgres_changes on annotations table
    - [x] Filter by normalized page URL
    - [x] Handle INSERT, UPDATE, DELETE events
    - [x] Call callback with annotation data
    - [x] Return unsubscribe function
  - [x] Add comprehensive JSDoc comments with examples
  - [x] Keep under 100 lines total (109 lines including comments)
  - [x] Export `AnnotationChangeCallback` type
- [x] Update `packages/src/client/index.ts`
  - [x] Export `subscribeToAnnotations`
  - [x] Export `normalizeUrl` utility
  - [x] Export `AnnotationChangeCallback` type

**Dependencies:** 2.1 (needs Supabase client)
**Blocks:** 3.2 (AnnotationProvider needs subscriptions)
**Aligns with:** Real behavior > mocks (use real Supabase Realtime)

---

## Phase 3: UI Implementation

### 3.1 Element Selection Hook ❌

**Priority:** HIGH (core UX)

- [ ] Create `packages/src/ui/hooks/useElementSelector.ts`
  - [ ] State: `mode` ('idle' | 'selecting'), `selectedElement` (HTMLElement | null)
  - [ ] Effect: add/remove event listeners when mode === 'selecting'
    - [ ] Click handler: select element, prevent default, stop propagation
    - [ ] Mouseover handler: apply outline style (`2px dashed #0066ff`)
    - [ ] Mouseout handler: remove outline style
    - [ ] Cleanup on unmount
  - [ ] Return: `{ mode, setMode, selectedElement, clearSelection }`
  - [ ] Add JSDoc comments
  - [ ] Keep under 100 lines
- [ ] Create `packages/src/ui/hooks/index.ts`
  - [ ] Export `useElementSelector`

**Dependencies:** None
**Blocks:** 3.4 (annotation creation UI needs element selection)
**Aligns with:** Custom hooks for reusable logic

---

### 3.2 Annotation State Management ❌

**Priority:** HIGH (core feature)

- [ ] Create `packages/src/ui/context/AnnotationContext.tsx`
  - [ ] Define `AnnotationContext` interface
    - [ ] `annotations: Annotation[]`
    - [ ] `addAnnotation: (input) => Promise<void>`
    - [ ] `updateAnnotation: (id, input) => Promise<void>`
    - [ ] `deleteAnnotation: (id) => Promise<void>`
    - [ ] `loading: boolean`
    - [ ] `error: Error | null`
  - [ ] Create `AnnotationContext` with React.createContext
  - [ ] Implement `AnnotationProvider` component
    - [ ] State: annotations array, loading, error
    - [ ] Effect: subscribe to realtime updates on mount
    - [ ] `addAnnotation`: call client API, realtime updates state
    - [ ] `updateAnnotation`: call client API
    - [ ] `deleteAnnotation`: call client API
    - [ ] Cleanup subscription on unmount
  - [ ] Implement `useAnnotations()` hook
    - [ ] Use context, throw error if outside provider
  - [ ] Add JSDoc comments
  - [ ] Keep under 250 lines (split if needed)
- [ ] Create `packages/src/ui/context/index.ts`
  - [ ] Export context, provider, hook

**Dependencies:** 2.2 (annotation API), 2.3 (subscriptions)
**Blocks:** 3.3, 3.4 (UI components need state)
**Aligns with:** React Context over external libraries

---

### 3.3 Mode-Specific UI Components ❌

**Priority:** HIGH (core feature)

- [ ] Create `packages/src/ui/Client/AnnotationList.tsx`
  - [ ] Show list of annotations for current page
  - [ ] Filter to show only user's own annotations
  - [ ] Display: element selector, content, status, timestamp
  - [ ] Actions: Mark as resolved, Delete (own only)
  - [ ] Empty state message
  - [ ] Keep under 200 lines
- [ ] Create `packages/src/ui/Developer/AnnotationManager.tsx`
  - [ ] Show all annotations for current page
  - [ ] Filter controls: status, author, date range
  - [ ] Display: full annotation details
  - [ ] Actions: Resolve, Delete, Edit content
  - [ ] Batch actions (resolve multiple, export)
  - [ ] Keep under 250 lines (split if needed)
- [ ] Update `packages/src/ui/index.ts`
  - [ ] Export mode-specific components
- [ ] Wire into DevCaddy.tsx based on UI_MODE
  - [ ] Render AnnotationList when mode === 'client'
  - [ ] Render AnnotationManager when mode === 'developer'

**Dependencies:** 3.2 (needs AnnotationContext)
**Blocks:** None (but completes dual-mode UI)
**Aligns with:** Ship simple first - basic list before advanced features

---

### 3.4 Annotation Creation UI ❌

**Priority:** HIGH (core UX)

- [ ] Create `packages/src/ui/components/AnnotationPopover.tsx`
  - [ ] Props: selectedElement, onSubmit, onCancel
  - [ ] Position using `createPortal` near element
  - [ ] Calculate position from `getBoundingClientRect()`
  - [ ] Textarea for annotation content
  - [ ] Submit and Cancel buttons
  - [ ] Auto-focus textarea on mount
  - [ ] Handle Enter key (with Shift for newline)
  - [ ] Validation: require non-empty content
  - [ ] Keep under 150 lines
- [ ] Update DevCaddy.tsx to integrate
  - [ ] Use `useElementSelector` hook
  - [ ] Show "Add Annotation" button
  - [ ] Toggle selection mode on button click
  - [ ] Show popover when element selected
  - [ ] Call `addAnnotation` on submit
  - [ ] Extract element selector using get-element-selectors utility
- [ ] Add ARIA labels for accessibility
  - [ ] Button: "Add annotation to UI element"
  - [ ] Popover: role="dialog"

**Dependencies:** 3.1 (element selector), 3.2 (state management)
**Blocks:** None (completes core annotation workflow)
**Aligns with:** Popover near element > modal in center

---

### 3.5 Toggle Button Improvements ❌

**Priority:** MEDIUM (UX polish)

- [ ] Create SVG icon components
  - [ ] `packages/src/ui/components/icons/AnnotationIcon.tsx`
  - [ ] `packages/src/ui/components/icons/CloseIcon.tsx`
  - [ ] Use semantic SVG paths
  - [ ] Make accessible with title/aria-label
- [ ] Update `packages/src/ui/Core/ModeToggle.tsx`
  - [ ] Replace unicode icons with SVG components
  - [ ] Add ARIA attributes:
    - [ ] `aria-label`: "Open DevCaddy" / "Close DevCaddy"
    - [ ] `aria-expanded`: true/false
    - [ ] `title`: "DevCaddy Annotations"
  - [ ] Consider keyboard shortcut (e.g., Cmd/Ctrl+K)
- [ ] Update styles for better visibility

**Dependencies:** None
**Blocks:** None
**Aligns with:** Accessibility is not optional

---

### 3.6 Error Handling & Boundaries ❌

**Priority:** MEDIUM (stability)

- [ ] Create `packages/src/ui/components/ErrorBoundary.tsx`
  - [ ] React Error Boundary class component
  - [ ] Catch errors in DevCaddy component tree
  - [ ] Display user-friendly error message
  - [ ] Log error to console with context
  - [ ] Provide "Reset" button to recover
  - [ ] Keep under 100 lines
- [ ] Wrap DevCaddy component in ErrorBoundary
  - [ ] Update `packages/src/ui/index.ts`
- [ ] Add try/catch to async functions
  - [ ] Annotation API calls
  - [ ] Supabase operations
  - [ ] Set error state in context
- [ ] Show error messages in UI
  - [ ] Toast notifications for transient errors
  - [ ] Inline errors for form validation

**Dependencies:** None
**Blocks:** None
**Aligns with:** Fail gracefully with clear messages

---

## Phase 4: Plugin & Configuration

### 4.1 Fix Plugin Architecture Issues ❌

**Priority:** CRITICAL (broken logic)

- [ ] Fix `packages/src/plugin/index.ts`
  - [ ] Remove build command check from `configureServer()` hook
  - [ ] Simplify: configureServer only runs during serve
  - [ ] Move global variable injection to `<head>` using `transformIndexHtml`
    - [ ] Insert script before other scripts
    - [ ] OR use Vite's `define` option for compile-time injection
  - [ ] Remove race condition with React app rendering
- [ ] Implement `packages/src/plugin/configure/configureServe.ts`
  - [ ] Check if enabled
  - [ ] Add middleware for `/api/devcaddy/validate-token` (stub for future)
  - [ ] Log when DevCaddy active (if debug mode)
  - [ ] Keep under 100 lines
- [ ] Update `packages/src/plugin/utility/get-ui-mode.ts`
  - [ ] Fix mode detection logic:
    - [ ] `mode: 'development' + command: 'serve'` → 'developer'
    - [ ] `mode: 'production' + command: 'preview'` → 'client'
    - [ ] Everything else → null
  - [ ] Add JSDoc comments explaining logic
  - [ ] Add example usage comment

**Dependencies:** None
**Blocks:** Plugin won't work correctly
**Aligns with:** Vite plugin lifecycle, avoid race conditions

---

### 4.2 Environment Variable Integration ❌

**Priority:** HIGH (configuration)

- [ ] Update `packages/src/client/api/init.ts`
  - [ ] `initDevCaddy()` can accept config object OR read from env
  - [ ] Default to reading `import.meta.env.VITE_DEVCADDY_SUPABASE_URL`
  - [ ] Default to reading `import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY`
  - [ ] Validate required vars present
  - [ ] Throw clear error if missing with setup instructions
- [ ] Create `.env.example` in packages/
  - [ ] Show required VITE_ prefixed variables
  - [ ] Show optional debug variables
- [ ] Update examples/simple/
  - [ ] Remove `dotenv` import from vite.config.ts
  - [ ] Create `.env` file with example values
  - [ ] Update README.md with env var setup
- [ ] Document in packages/README.md
  - [ ] Environment variable requirements
  - [ ] Where to get Supabase credentials

**Dependencies:** 2.1 (client initialization)
**Blocks:** None (but needed for configuration)
**Aligns with:** Explicit configuration, fail fast with clear errors

---

### 4.3 Window Type Safety ❌

**Priority:** LOW (code quality)

- [ ] Fix `packages/src/ui/Core/DevCaddy.tsx`
  - [ ] Remove local `DevCaddyWindow` type definition
  - [ ] Use `window.__DEV_CADDY_UI_MODE__` directly
  - [ ] TypeScript recognizes from global.d.ts
  - [ ] Simplify useMemo to just read from window
- [ ] Verify global.d.ts is included in tsconfig
  - [ ] Check `include` array in tsconfig.app.json

**Dependencies:** 1.2 (global.d.ts must be correct)
**Blocks:** None
**Aligns with:** Don't repeat type definitions

---

## Phase 5: Security & Polish

### 5.1 Content Sanitization ❌

**Priority:** MEDIUM (security)

- [ ] Install DOMPurify
  - [ ] `npm install dompurify`
  - [ ] `npm install -D @types/dompurify`
- [ ] Create `packages/src/ui/utility/sanitize.ts`
  - [ ] Wrapper function for DOMPurify.sanitize
  - [ ] Configure to allow plain text only (no HTML)
  - [ ] Add JSDoc with security warning
  - [ ] Keep under 50 lines
- [ ] Use in annotation rendering
  - [ ] AnnotationList.tsx
  - [ ] AnnotationManager.tsx
  - [ ] Any component displaying annotation content
- [ ] Add to security documentation
  - [ ] Update ARCHITECTURE.md with implementation details

**Dependencies:** None
**Blocks:** None
**Aligns with:** Never trust user input, XSS prevention

---

### 5.2 Input Validation ❌

**Priority:** MEDIUM (stability)

- [ ] Add validation utility
  - [ ] Create `packages/src/plugin/utility/validate.ts`
  - [ ] Function: `validatePluginOptions(options)`
    - [ ] Check context exists and is ConfigEnv
    - [ ] Check enabled is boolean
    - [ ] Check debug is boolean if present
    - [ ] Throw clear errors for invalid config
- [ ] Use in plugin initialization
  - [ ] Call validation before using options
- [ ] Add form validation
  - [ ] Annotation content: non-empty, max length
  - [ ] Element selector: valid CSS selector format
- [ ] Document validation rules

**Dependencies:** None
**Blocks:** None
**Aligns with:** Fail fast with clear errors

---

### 5.3 Production Safety Guard ❌

**Priority:** MEDIUM (security)

- [ ] Update plugin to not inject anything when disabled
  - [ ] Only inject script when `isEnabled === true`
  - [ ] Don't expose DevCaddy existence in production
- [ ] Add warning if enabled in production mode
  - [ ] Console.warn if NODE_ENV === 'production' && enabled === true
  - [ ] Suggest environment-specific configuration
- [ ] Document production safety in ARCHITECTURE.md

**Dependencies:** None
**Blocks:** None
**Aligns with:** Secure by default, production-safe

---

## Phase 6: Documentation & Testing Setup

### 6.1 Documentation Cleanup ❌

**Priority:** MEDIUM (user experience)

- [ ] Archive or delete INJECTION_STRATEGY.md
  - [ ] Move to `docs/archive/` if keeping for reference
  - [ ] Update CLAUDE.md to remove references
- [ ] Create `docs/MAGIC_LINKS.md`
  - [ ] Explain magic link concept
  - [ ] Manual JWT generation instructions
  - [ ] Example payload structure
  - [ ] Security considerations
  - [ ] Future CLI tool mention
- [ ] Fix documentation inconsistencies from AUDIT.md
  - [ ] Standardize terminology (reviewer vs client)
  - [ ] Remove references to unimplemented features
  - [ ] Update feature status markers
- [ ] Update all cross-references
  - [ ] Verify all file paths in documentation exist
  - [ ] Fix broken links

**Dependencies:** All features implemented
**Blocks:** None
**Aligns with:** Documentation matches implementation

---

### 6.2 Testing Infrastructure Setup ❌

**Priority:** LOW (future-proofing)

- [ ] Create `specs/` directory
  - [ ] Add `specs/README.md` explaining Gherkin format
  - [ ] Create example spec: `reviewer-annotation.feature`
  - [ ] Don't write comprehensive specs until features stable
- [ ] Create `tests/` directory structure
  - [ ] `tests/e2e/` for Playwright tests
  - [ ] `tests/integration/` for Vitest tests
  - [ ] `tests/setup/` for test utilities
  - [ ] Add README.md in each explaining purpose
- [ ] Install Playwright
  - [ ] `npm install -D @playwright/test`
  - [ ] Create `playwright.config.ts`
  - [ ] Add npm script: `test:e2e`
- [ ] Install Vitest
  - [ ] `npm install -D vitest`
  - [ ] Create `vitest.config.ts`
  - [ ] Add npm script: `test:integration`
- [ ] Don't write tests yet (features first per docs)

**Dependencies:** None
**Blocks:** None
**Aligns with:** Set up infrastructure, tests after implementation

---

### 6.3 JSDoc & API Documentation ❌

**Priority:** LOW (polish)

- [ ] Add JSDoc comments to all exported functions
  - [ ] @param descriptions with types
  - [ ] @returns descriptions
  - [ ] @throws if applicable
  - [ ] @example for complex functions
- [ ] Install typedoc
  - [ ] `npm install -D typedoc`
  - [ ] Create typedoc.json config
  - [ ] Add npm script: `docs:api`
- [ ] Generate API documentation
  - [ ] Run typedoc
  - [ ] Verify output
  - [ ] Add to .gitignore (docs/api/)
- [ ] Link from README.md

**Dependencies:** All code complete
**Blocks:** None
**Aligns with:** Self-documenting code, generated documentation

---

## Phase 7: Example & Polish

### 7.1 Complete Working Example ❌

**Priority:** MEDIUM (demonstrates functionality)

- [ ] Update `examples/simple/` to be functional
  - [ ] Install built package from packages/
  - [ ] Configure with real .env values
  - [ ] Add multiple pages to demonstrate page-scoped annotations
  - [ ] Add sample UI elements to annotate
  - [ ] Show both modes (developer and client)
- [ ] Create example documentation
  - [ ] Update examples/simple/README.md
  - [ ] How to set up Supabase for example
  - [ ] How to run in developer mode
  - [ ] How to simulate client mode
  - [ ] Screenshots of functionality
- [ ] Consider creating video walkthrough

**Dependencies:** All features complete (1.x - 5.x)
**Blocks:** None
**Aligns with:** Working example > extensive docs

---

### 7.2 Performance & Optimization ❌

**Priority:** LOW (polish)

- [ ] Audit bundle size
  - [ ] Check dist/ file sizes
  - [ ] Ensure external dependencies not bundled
  - [ ] Consider code splitting if too large
- [ ] Optimize realtime subscriptions
  - [ ] Debounce rapid updates if needed
  - [ ] Cleanup subscriptions properly
  - [ ] Test with many annotations
- [ ] Optimize re-renders
  - [ ] Use React.memo where appropriate
  - [ ] Optimize context value creation
  - [ ] Profile with React DevTools

**Dependencies:** All features complete
**Blocks:** None
**Aligns with:** Ship simple first, optimize based on usage

---

## MVP Completion Checklist

### Absolutely Required (Blockers):
- [ ] Phase 1: Foundation & Critical Blockers (1.1 - 1.4)
- [ ] Phase 2: Client API Implementation (2.1 - 2.3)
- [ ] Phase 3: Core UI Implementation (3.1 - 3.4)
- [ ] Phase 4: Plugin Fixes (4.1 - 4.2)

### Strongly Recommended:
- [ ] Phase 3: Error Handling (3.6)
- [ ] Phase 4: Window Type Safety (4.3)
- [ ] Phase 5: Security (5.1 - 5.3)
- [ ] Phase 6: Documentation Cleanup (6.1)

### Nice to Have:
- [ ] Phase 3: Toggle Button Improvements (3.5)
- [ ] Phase 3: Mode-Specific UI (3.3)
- [ ] Phase 6: Testing Infrastructure (6.2)
- [ ] Phase 6: JSDoc Documentation (6.3)
- [ ] Phase 7: Complete Example (7.1)
- [ ] Phase 7: Performance (7.2)

---

## Definition of Done

**MVP is complete when:**

1. ✅ Users can run provided SQL migrations to set up database
2. ✅ Users can install package and configure via environment variables
3. ✅ Plugin correctly detects environment and injects appropriate UI
4. ✅ Reviewers can click UI elements to create annotations
5. ✅ Annotations are saved to Supabase with proper RLS
6. ✅ Developers can view all annotations in real-time
7. ✅ Reviewers can view their own annotations in real-time
8. ✅ Both modes can mark annotations as resolved
9. ✅ Error handling prevents UI crashes
10. ✅ Documentation accurately reflects implementation
11. ✅ Example app demonstrates all features
12. ✅ Build process produces publishable package

**Success Metrics:**
- Package installs without errors
- Database setup completes in < 10 minutes
- Core annotation workflow works end-to-end
- No critical security vulnerabilities
- Documentation has no broken references
- Code follows all core principles (simplicity, SOLID, etc.)

---

## Post-MVP Roadmap

**Not in MVP but documented for future:**
- Magic link CLI tool (`@devcaddy/cli`)
- Supabase Edge Functions for validation and rate limiting
- Annotation threading and replies
- Screenshot capture and attachment
- User mentions (@username)
- Integration with issue trackers (GitHub, Linear, Jira)
- Advanced filtering and search
- Annotation export (CSV, JSON)
- Storybook component library
- Comprehensive E2E test coverage
- Hosted SaaS option

---

## Task Tracking Legend

**Status:**
- ❌ Not Started
- 🔄 In Progress
- ✅ Complete
- 🚫 Blocked (note blocker in task)

**Priority:**
- CRITICAL: Blocks all other work
- HIGH: Core functionality
- MEDIUM: Important but not blocking
- LOW: Nice to have

**Update this file as you work.** Check off tasks, update statuses, add notes.
