# DevCaddy MVP Development Tasks

**Purpose:** Primary task tracking for MVP development
**Status Key:** ❌ Not Started | 🔄 In Progress | ✅ Complete | 🚫 Blocked

---

## Current Status (Updated 2025-11-12)

**✅ Completed:**
- Phase 1: Database schema, migrations, RLS policies (with security fixes)
- Phase 2: Complete client API (Supabase integration)
- Phase 3: **UI Implementation** ✅ 100% Complete
  - Phase 3.0: Authentication & security (magic links, role-based permissions) ✅
  - Phase 3.1: Element selection hook (`useElementSelector`) ✅
  - Phase 3.2: Annotation state management (`AnnotationContext`) ✅
  - Phase 3.3: Mode-specific UI (AnnotationList, AnnotationManager) ✅
  - Phase 3.4: Annotation creation UI (AnnotationPopover) ✅
  - Phase 3.5: Toggle button improvements (SVG icons + ARIA labels) ✅
  - Phase 3.6: Error handling & boundaries (ErrorBoundary + try/catch) ✅
  - **Reorganized UI structure** (modular Client/Developer/Core folders)
  - **Added data-testid attributes to all interactive elements for testing**
- Phase 4: **Plugin & Configuration** 🔄 67% Complete
  - Phase 4.1: Plugin architecture fixes ✅
    - Fixed transformIndexHtml to inject in `<head>` (eliminates race conditions)
    - Removed incorrect build command check from configureServer()
    - Updated mode detection logic with comprehensive JSDoc
  - Phase 4.2: Environment variable integration ✅
    - Environment variables must be passed from consumer's app code
    - Updated all examples and documentation
    - Build verified successful (58.64 KB ES + 5.02 KB CSS)
  - Phase 4.3: Window type safety ❌
- **Documentation consolidation** (11 files → 4 files, 59% reduction)
- **Security audit fixes** (app_metadata, SQL-only role assignment)
- **Package README rewrite** (engaging, targets humans + AI agents)
- **Test plan audit and improvements** (high-priority fixes applied)

**🔄 In Progress:**
- Phase 5: Security & Polish (1 of 3 sub-phases complete)

**Next Up:**
- Input validation (Phase 5.2)
- Production safety guard (Phase 5.3)
- Testing infrastructure setup (Phase 6.2)

**📊 Overall Progress:**
- **Phase 1:** ✅ 100% Complete (Foundation & Critical Blockers)
- **Phase 2:** ✅ 100% Complete (Client API Implementation)
- **Phase 3:** ✅ 100% Complete (UI Implementation & Authentication)
  - ✅ Phase 3.0: Authentication & security
  - ✅ Phase 3.1: Element selection hook
  - ✅ Phase 3.2: Annotation state management
  - ✅ Phase 3.3: Mode-specific UI components
  - ✅ Phase 3.4: Annotation creation UI
  - ✅ Phase 3.5: Toggle button improvements (SVG icons + accessibility)
  - ✅ Phase 3.6: Error handling & boundaries
- **Phase 4:** ✅ 100% Complete (Plugin & Configuration)
  - ✅ Phase 4.1: Plugin architecture fixes
  - ✅ Phase 4.2: Environment variable integration
  - ✅ Phase 4.3: Window type safety
- **Phase 5:** 🔄 33% Complete (Security & Polish)
  - ✅ Phase 5.1: Content sanitization
  - ❌ Phase 5.2: Input validation
  - ❌ Phase 5.3: Production safety guard
- **Phase 6:** 📋 Planned (Documentation & Testing Setup)
- **Testing Infrastructure:** 📋 Planned (see Phase 6.2 and docs/TEST_PLAN.md)

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
  - [x] ~~annotation_status table with default records~~ (REMOVED - simplified to CHECK constraint)
  - [x] annotation table with all fields from schema.dbml
  - [x] Add created_at, updated_at, created_by fields
  - [x] Add indexes for performance (page, status_id, created_by, created_at)
  - [x] Add triggers for auto-updating updated_at
  - [x] Add triggers for managing resolved_at based on status
  - [x] Add CHECK constraint for status_id (1-5)
  - [x] Add TypeScript constants ANNOTATION_STATUS (replaces lookup table)
- [x] Generate `002_rls_policies.sql`
  - [x] Enable RLS on annotation table
  - [x] Policy: Everyone can view ALL annotations (collaboration)
  - [x] Policy: Developers can UPDATE/DELETE ANY annotation
  - [x] Policy: Clients can UPDATE/DELETE OWN annotations only
  - [x] Use app_metadata for roles (admin-only, secure)
  - [x] Add comprehensive setup notes and permission matrix
- [ ] Verify migrations work in local Supabase instance (deferred to Phase 6)
- [x] SUPABASE_SETUP.md consolidated into docs/SETUP.md

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

## Phase 3: UI Implementation & Authentication

### 3.0 Authentication & Security ✅

**Priority:** CRITICAL (security foundation)

- [x] Implement magic link authentication
  - [x] Create `packages/src/ui/hooks/useAuth.ts`
    - [x] `useAuth()` hook for session management
    - [x] `sendMagicLink()` function
    - [x] `signOut()` function
    - [x] Auto-detect existing session
    - [x] Subscribe to auth state changes
  - [x] Create `packages/src/ui/components/AuthPrompt.tsx`
    - [x] Email input modal
    - [x] Loading, error, and success states
    - [x] "Check your email" message after sending
  - [x] Update `packages/src/ui/Core/DevCaddy.tsx`
    - [x] Integrate `useAuth` hook
    - [x] Show `AuthPrompt` if not authenticated
    - [x] Use real user ID from session (replaced hardcoded "dev-user")
- [x] Fix security vulnerabilities in RLS policies
  - [x] Change from `user_metadata` to `app_metadata` (admin-only)
  - [x] Update all 4 policies in `002_rls_policies.sql`
  - [x] Add security warnings in migration comments
  - [x] Document SQL-only role assignment method
- [x] Implement upfront user creation workflow
  - [x] Document team lead creates ALL users before authentication
  - [x] Update `examples/simple/.env.example` with workflow
  - [x] Create comprehensive role assignment guide
- [x] Update URL normalization strategy
  - [x] Use `window.location.pathname` consistently
  - [x] Remove URL normalization inconsistencies
  - [x] Update `AnnotationContext` to use pathname only
- [x] Implement SPA navigation detection
  - [x] Add `popstate` listener for browser back/forward
  - [x] Intercept `history.pushState` and `history.replaceState`
  - [x] Re-subscribe to annotations on route change
  - [x] Update `AnnotationContext` with navigation detection
- [x] Add authentication styles
  - [x] Create `packages/src/ui/styles/critical/_auth.scss`
  - [x] Modal overlay and prompt styles
  - [x] Form, button, and success states
  - [x] Animations (fadeIn, slideIn)
  - [x] Add to `_index.scss` imports
- [x] Consolidate and update documentation
  - [x] Create `docs/README.md` (single entry point)
  - [x] Create `docs/IMPLEMENTATION.md` (principles + decisions)
  - [x] Create `docs/SETUP.md` (Supabase + role assignment)
  - [x] Move historical docs to `docs/archive/`
  - [x] Update `CLAUDE.md` with new structure
  - [x] Update `packages/README.md` (engaging, targets humans + AI)
  - [x] Delete redundant docs (Q&A.md, DEVELOPMENT.md, etc.)

**Dependencies:** 2.1, 2.2 (Supabase client API)
**Blocks:** All user-facing features require authentication
**Aligns with:** Security-first approach, real auth before mock auth

---

### 3.1 Element Selection Hook ✅

**Priority:** HIGH (core UX)

- [x] Create `packages/src/ui/hooks/useElementSelector.ts`
  - [x] State: `mode` ('idle' | 'selecting'), `selectedElement` (HTMLElement | null)
  - [x] Effect: add/remove event listeners when mode === 'selecting'
    - [x] Click handler: select element, prevent default, stop propagation
    - [x] Mouseover handler: apply outline style (`2px dashed #0066ff`)
    - [x] Mouseout handler: remove outline style
    - [x] Cleanup on unmount
  - [x] Return: `{ mode, setMode, selectedElement, clearSelection }`
  - [x] Add JSDoc comments
  - [x] Keep under 100 lines (124 lines including comments)
- [x] Create `packages/src/ui/hooks/index.ts`
  - [x] Export `useElementSelector`

**Dependencies:** None
**Blocks:** 3.4 (annotation creation UI needs element selection)
**Aligns with:** Custom hooks for reusable logic

---

### 3.2 Annotation State Management ✅

**Priority:** HIGH (core feature)

- [x] Create `packages/src/ui/context/AnnotationContext.tsx`
  - [x] Define `AnnotationContext` interface
    - [x] `annotations: Annotation[]`
    - [x] `addAnnotation: (input) => Promise<void>`
    - [x] `updateAnnotation: (id, input) => Promise<void>`
    - [x] `deleteAnnotation: (id) => Promise<void>`
    - [x] `loading: boolean`
    - [x] `error: Error | null`
  - [x] Create `AnnotationContext` with React.createContext
  - [x] Implement `AnnotationProvider` component
    - [x] State: annotations array, loading, error
    - [x] Effect: subscribe to realtime updates on mount
    - [x] `addAnnotation`: call client API, realtime updates state
    - [x] `updateAnnotation`: call client API
    - [x] `deleteAnnotation`: call client API
    - [x] Cleanup subscription on unmount
  - [x] Implement `useAnnotations()` hook
    - [x] Use context, throw error if outside provider
  - [x] Add JSDoc comments
  - [x] Keep under 250 lines (196 lines)
- [x] Create `packages/src/ui/context/index.ts`
  - [x] Export context, provider, hook

**Dependencies:** 2.2 (annotation API), 2.3 (subscriptions)
**Blocks:** 3.3, 3.4 (UI components need state)
**Aligns with:** React Context over external libraries

---

### 3.3 Mode-Specific UI Components ✅

**Priority:** HIGH (core feature)

- [x] Create `packages/src/ui/Client/AnnotationList.tsx`
  - [x] Show list of annotations for current page
  - [x] Filter to show only user's own annotations
  - [x] Display: element selector, content, status, timestamp
  - [x] Actions: Mark as resolved, Delete (own only)
  - [x] Empty state message
- [x] Create `packages/src/ui/Developer/AnnotationManager.tsx`
  - [x] Show all annotations for current page
  - [x] Filter controls: status, author, date range
  - [x] Display: full annotation details
  - [x] Actions: Resolve, Delete, Edit content
- [x] Update `packages/src/ui/index.ts`
  - [x] Export mode-specific components
- [x] Wire into DevCaddy.tsx based on UI_MODE
  - [x] Render AnnotationList when mode === 'client'
  - [x] Render AnnotationManager when mode === 'developer'

**Dependencies:** 3.2 (needs AnnotationContext)
**Blocks:** None (but completes dual-mode UI)
**Aligns with:** Ship simple first - basic list before advanced features

---

### 3.4 Annotation Creation UI ✅

**Priority:** HIGH (core UX)

- [x] Create `packages/src/ui/components/AnnotationPopover.tsx`
  - [x] Props: selectedElement, onSubmit, onCancel
  - [x] Position using `createPortal` near element
  - [x] Calculate position from `getBoundingClientRect()`
  - [x] Textarea for annotation content
  - [x] Submit and Cancel buttons
  - [x] Auto-focus textarea on mount
  - [x] Handle Enter key (with Shift for newline)
  - [x] Validation: require non-empty content
  - [x] Keep under 150 lines (187 lines)
- [x] Update DevCaddy.tsx to integrate
  - [x] Use `useElementSelector` hook
  - [x] Show "Add Annotation" button
  - [x] Toggle selection mode on button click
  - [x] Show popover when element selected
  - [x] Call `addAnnotation` on submit
  - [x] Extract element selector using get-element-selectors utility
- [x] Add ARIA labels for accessibility
  - [x] Button: "Add annotation to UI element"
  - [x] Popover: role="dialog"

**Dependencies:** 3.1 (element selector), 3.2 (state management)
**Blocks:** None (completes core annotation workflow)
**Aligns with:** Popover near element > modal in center

---

### 3.5 Toggle Button Improvements ✅

**Priority:** MEDIUM (UX polish)

- [x] Create SVG icon components
  - [x] `packages/src/ui/Core/icons/AnnotationIcon.tsx`
  - [x] `packages/src/ui/Core/icons/CloseIcon.tsx`
  - [x] Use semantic SVG paths
  - [x] Make accessible with title/aria-label
- [x] Update `packages/src/ui/Core/ModeToggle.tsx`
  - [x] Replace unicode icons with SVG components
  - [x] Add ARIA attributes:
    - [x] `aria-label`: "Open DevCaddy" / "Close DevCaddy"
    - [x] `aria-expanded`: true/false
    - [x] `title`: "DevCaddy Annotations"
- [x] Update styles for better visibility
  - [x] Added hover and active state animations
  - [x] Added icon sizing and stroke-width control

**Dependencies:** None
**Blocks:** None
**Aligns with:** Accessibility is not optional

---

### 3.6 Error Handling & Boundaries ✅

**Priority:** MEDIUM (stability)

- [x] Create `packages/src/ui/Core/ErrorBoundary.tsx`
  - [x] React Error Boundary class component
  - [x] Catch errors in DevCaddy component tree
  - [x] Display user-friendly error message
  - [x] Log error to console with context
  - [x] Provide "Reset" button to recover
  - [x] Keep under 150 lines (145 lines)
- [x] Wrap DevCaddy component in ErrorBoundary
  - [x] Created `DevCaddyWithBoundary.tsx`
  - [x] Updated `packages/src/ui/Core/index.ts` to export wrapped version
- [x] Add try/catch to async functions
  - [x] Annotation API calls (already present in AnnotationContext)
  - [x] Supabase operations (already present in useAuth)
  - [x] Set error state in context (already implemented)
- [x] Show error messages in UI
  - [x] Alert for annotation creation errors
  - [x] Error boundary UI for component errors
  - [x] Console logging for all errors

**Dependencies:** None
**Blocks:** None
**Aligns with:** Fail gracefully with clear messages

---

## Phase 4: Plugin & Configuration

### 4.1 Fix Plugin Architecture Issues ✅

**Priority:** CRITICAL (broken logic)

- [x] Fix `packages/src/plugin/index.ts`
  - [x] Remove build command check from `configureServer()` hook
  - [x] Simplify: configureServer only runs during serve
  - [x] Move global variable injection to `<head>` using `transformIndexHtml`
    - [x] Insert script in `<head>` with `order: 'pre'`
    - [x] Wrap in IIFE to avoid global scope pollution
  - [x] Remove race condition with React app rendering
  - [x] Remove unused `configureBuild` import
- [x] Update `packages/src/plugin/utility/get-ui-mode.ts`
  - [x] Fix mode detection logic:
    - [x] `mode: 'development' + command: 'serve'` → 'developer'
    - [x] `mode: 'production' + command: 'serve'` → 'client'
    - [x] Everything else → null (including build command)
  - [x] Add comprehensive JSDoc comments explaining logic
  - [x] Add example usage with all scenarios
  - [x] Remove unused `developmentMode` parameter
- [x] Test build successfully compiles

**Note:** configureServe.ts remains a stub for now (will be implemented when middleware is needed)

**Dependencies:** None
**Blocks:** Plugin won't work correctly
**Aligns with:** Vite plugin lifecycle, avoid race conditions

---

### 4.2 Environment Variable Integration ✅

**Priority:** HIGH (configuration)

- [x] Update `packages/src/client/api/init.ts`
  - [x] `initDevCaddy()` can accept config object OR read from env
  - [x] Default to reading `import.meta.env.VITE_DEVCADDY_SUPABASE_URL`
  - [x] Default to reading `import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY`
  - [x] Validate required vars present
  - [x] Throw clear error if missing with setup instructions
- [x] Create `.env.example` in packages/
  - [x] Show required VITE_ prefixed variables
  - [x] Show optional debug variables
- [x] Update examples/simple/
  - [x] Remove `dotenv` import from vite.config.ts
  - [x] Update environment variable names to use VITE_DEVCADDY_ prefix
  - [x] Update main.tsx to call initDevCaddy() without arguments
- [x] Document in packages/README.md
  - [x] Environment variable requirements
  - [x] Where to get Supabase credentials
  - [x] Show both explicit and automatic configuration methods

**Dependencies:** 2.1 (client initialization)
**Blocks:** None (but needed for configuration)
**Aligns with:** Explicit configuration, fail fast with clear errors

---

### 4.3 Window Type Safety ✅

**Priority:** LOW (code quality)

- [x] Fix `packages/src/ui/Core/DevCaddy.tsx`
  - [x] Remove local `DevCaddyWindow` type definition
  - [x] Use `window.__DEV_CADDY_UI_MODE__` directly
  - [x] TypeScript recognizes from global.d.ts
  - [x] Simplify useMemo to just read from window
- [x] Verify global.d.ts is included in tsconfig
  - [x] Check `include` array in tsconfig.app.json (confirmed: `"src"` includes all .d.ts files)

**Dependencies:** 1.2 (global.d.ts must be correct)
**Blocks:** None
**Aligns with:** Don't repeat type definitions
**Completed:** 2025-11-12

---

## Phase 5: Security & Polish

### 5.1 Content Sanitization ✅

**Priority:** MEDIUM (security)

- [x] Install DOMPurify
  - [x] `npm install dompurify`
  - [x] `npm install -D @types/dompurify`
- [x] Create `packages/src/ui/Core/utility/sanitize.ts`
  - [x] Wrapper function for DOMPurify.sanitize
  - [x] Configure to allow plain text only (no HTML)
  - [x] Add JSDoc with security warning
  - [x] Keep under 50 lines (48 lines including comments)
  - [x] Export from `packages/src/ui/Core/utility/index.ts`
- [x] Use in annotation rendering
  - [x] Client/AnnotationList.tsx
  - [x] Client/AnnotationDetail.tsx
  - [x] Developer/AnnotationManager.tsx
  - [x] Developer/AnnotationDetail.tsx
- [x] Verified build successful (105KB ES + 21.8KB CSS)

**Note:** Bundle size increased ~30KB due to DOMPurify (acceptable for security). All user-generated content is now sanitized before rendering.

**Dependencies:** None
**Blocks:** None
**Aligns with:** Never trust user input, XSS prevention
**Completed:** 2025-11-12

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

### 6.2 Testing Infrastructure Setup 📋

**Priority:** MEDIUM (quality assurance)

**Status:** Planned - comprehensive 4-week testing strategy created in `docs/TEST_PLAN.md`

**Plan Summary:**
- **Week 1:** Setup & Foundation (Playwright, Vitest, test database)
- **Week 2:** Integration Tests (client API, CRUD, realtime)
- **Week 3-4:** E2E Tests (auth flow, annotation creation, real-time sync)
- **Week 4:** RLS Policy Tests (permission matrix validation)

**Phase 1: Setup & Foundation** ❌
- [ ] Install testing dependencies
  - [ ] Playwright: `npm install -D @playwright/test`
  - [ ] Vitest: `npm install -D vitest @vitest/ui jsdom`
  - [ ] Testing Library: `npm install -D @testing-library/react @testing-library/user-event`
  - [ ] Supabase CLI: `npm install -g supabase`
  - [ ] tsx for running TypeScript scripts: `npm install -D tsx`
- [ ] Create directory structure
  - [ ] `tests/e2e/` - Playwright E2E tests
  - [ ] `tests/integration/` - Vitest integration tests
  - [ ] `tests/fixtures/` - Shared test data and utilities
  - [ ] `tests/setup/` - Setup/teardown scripts
  - [ ] `tests/scripts/` - Utility scripts
- [ ] Implement test automation scripts
  - [ ] Create `tests/setup/branch-manager.ts`
    - [ ] `createTestBranch()` - Creates ephemeral branch with timestamp
    - [ ] `deleteTestBranch()` - Deletes branch by name
    - [ ] `cleanupOrphanedBranches()` - Removes old test branches
  - [ ] Create `tests/setup/global-setup.ts` (Playwright)
    - [ ] Calls `createTestBranch()` before all E2E tests
    - [ ] Stores branch name in environment variable
  - [ ] Create `tests/setup/global-teardown.ts` (Playwright)
    - [ ] Calls `deleteTestBranch()` after all E2E tests
  - [ ] Create `tests/setup/vitest-setup.ts` (Vitest)
    - [ ] `beforeAll` hook creates branch
    - [ ] `afterAll` hook deletes branch
  - [ ] Create `tests/scripts/cleanup-branches.ts`
    - [ ] Script to manually cleanup orphaned branches
- [ ] Configure test environments
  - [ ] Create `playwright.config.ts` with global setup/teardown
  - [ ] Create `vitest.config.ts` with setup file and single fork
  - [ ] Environment variables set automatically by branch manager
- [ ] Initialize Supabase (one-time)
  - [ ] `npx supabase init`
  - [ ] `npx supabase link --project-ref your-ref`
- [ ] Add npm scripts
  - [ ] `"test:integration": "vitest"` (auto-creates/deletes branch)
  - [ ] `"test:e2e": "playwright test"` (auto-creates/deletes branch)
  - [ ] `"test:e2e:ui": "playwright test --ui"`
  - [ ] `"test:all": "npm run test:integration && npm run test:e2e"`
  - [ ] `"test:cleanup": "tsx tests/scripts/cleanup-branches.ts"`
  - [ ] Manual scripts for debugging (create persistent branch):
    - [ ] `"test:branch:create": "npx supabase branches create testing"`
    - [ ] `"test:branch:delete": "npx supabase branches delete testing --force"`
    - [ ] `"test:branch:reset": "npx supabase db reset --branch testing"`
- [ ] Verify automation works
  - [ ] Run `npm run test:integration` - branch auto-created and deleted
  - [ ] Run `npm run test:e2e` - branch auto-created and deleted
  - [ ] Check no orphaned branches remain

**Phase 2: Integration Tests (Client API)** ❌
- [ ] Test Supabase client initialization
  - [ ] File: `tests/integration/client-init.test.ts`
  - [ ] Happy path: valid config initializes client
  - [ ] Error path: missing config throws clear error
  - [ ] Singleton: multiple calls return same instance
- [ ] Test annotation CRUD operations
  - [ ] File: `tests/integration/annotations-crud.test.ts`
  - [ ] Create annotation: saves to database
  - [ ] Update annotation: modifies status/content AND verifies `updated_by` field
  - [ ] Delete annotation: removes from database
  - [ ] Get annotations by page: filters correctly
- [ ] Test URL normalization ⚠️ NEW
  - [ ] File: `tests/integration/url-normalization.test.ts`
  - [ ] Clean paths: `/products` stays `/products`
  - [ ] Strip query params: `/products?sort=price` → `/products`
  - [ ] Strip hash: `/products#reviews` → `/products`
  - [ ] Remove trailing slash: `/products/` → `/products`
  - [ ] Combined edge cases
- [ ] Test realtime subscriptions
  - [ ] File: `tests/integration/realtime-subscriptions.test.ts`
  - [ ] Subscribe to page: receives INSERT events
  - [ ] Subscribe to page: receives UPDATE events
  - [ ] Subscribe to page: receives DELETE events
  - [ ] Unsubscribe: stops receiving events
  - [ ] Multiple subscriptions: independent channels

**Phase 3: E2E Tests (User Flows)** ❌
- [ ] Test authentication flow
  - [ ] File: `tests/e2e/auth.spec.ts`
  - [ ] Unauthenticated: shows AuthPrompt
  - [ ] Enter email: sends magic link
  - [ ] Click magic link: authenticates user
  - [ ] Session persists: survives page refresh
- [ ] Test annotation creation
  - [ ] File: `tests/e2e/annotation-creation.spec.ts`
  - [ ] Developer mode: can create annotation
  - [ ] Client mode: can create annotation
  - [ ] Click element: shows annotation popover
  - [ ] Submit annotation: saves to database
  - [ ] Annotation appears: visible in UI
- [ ] Test real-time sync between users
  - [ ] File: `tests/e2e/realtime-sync.spec.ts`
  - [ ] Two browsers: developer and client
  - [ ] Client creates annotation: developer sees it (< 3s)
  - [ ] Developer resolves: client sees update (< 3s)
  - [ ] Developer deletes: client sees removal (< 3s)

**Phase 4: RLS Policy Tests** ❌
- [ ] Test unauthenticated access ⚠️ NEW
  - [ ] File: `tests/e2e/permissions.spec.ts`
  - [ ] Unauthenticated user cannot create annotation
  - [ ] Unauthenticated user cannot view annotations
  - [ ] Verify error messages are clear (not just generic)
- [ ] Test permission matrix
  - [ ] File: `tests/e2e/permissions.spec.ts` (same file)
  - [ ] Everyone can view ALL annotations
  - [ ] Developer can update ANY annotation
  - [ ] Developer can delete ANY annotation
  - [ ] Client can only update OWN annotations (verify specific error message)
  - [ ] Client can only delete OWN annotations
  - [ ] Unauthenticated users: blocked from all operations

**Deliverables:**
- [ ] Working test suite covering critical paths
- [ ] Test documentation in `tests/README.md`
- [ ] CI/CD integration plan (GitHub Actions)
- [ ] Coverage report showing >70% for client API

**Dependencies:** None (can start immediately)
**Blocks:** None (parallel to feature development)
**Aligns with:** Hybrid spec-driven + test-driven development, no unit tests, no mocking Supabase

**Testing Approach:** Uses **Supabase branches** for test database isolation instead of local Docker instance. Benefits:
- ✅ Isolated test database (no production data affected)
- ✅ Hosted infrastructure (realistic testing)
- ✅ Fast reset between runs
- ✅ No Docker setup required
- ✅ Migrations auto-applied to branch
- ✅ Branch-specific API keys

**Test Terminology:**
- **Integration Tests (Vitest):** API layer only, no browser (client API, subscriptions)
- **E2E Tests (Playwright):** Full browser, complete user flows

**Recent Audit Findings (2025-11-11):**
- ✅ Added URL normalization tests (critical for SPA routing)
- ✅ Added `updated_by` field verification in CRUD tests
- ✅ Added unauthenticated user tests (security)
- ✅ Added timeouts to all branch operations (90s create, 30s delete, 10s list)
- ✅ Improved RLS error message assertions (specific patterns)
- ✅ Clarified integration vs E2E terminology

**See:**
- `docs/TEST_PLAN.md` for complete strategy with example code
- `docs/TEST_PLAN_AUDIT.md` for detailed audit findings and recommendations

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
