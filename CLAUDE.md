# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Documentation Structure

DevCaddy uses a feature-based documentation structure with active development docs and archived historical docs.

### Documentation Workflow

Feature development uses 3 directories under `docs/`:

1. **`docs/specs/`** - Gherkin specs for features currently in development
2. **`docs/implementations/`** - Implementation details for active features
3. **`docs/tasks/`** - Progress tracking for active features

**When features are completed:**

1. Specs are summarized and added to `archive/specs/YYYY-MM-DD.md` (all specs completed on that date)
2. Implementations are summarized and added to `archive/implementations/YYYY-MM-DD.md`
3. Tasks are summarized and added to `archive/tasks/YYYY-MM-DD.md`
4. Original files are removed from `docs/specs/`, `docs/implementations/`, and `docs/tasks/`

### Archive Structure

Docs in the `archive/` folder are **no longer considered in-scope** for active development context:

- **`archive/PROTOTYPE.md`** - Summary of all information used during prototyping
- **`archive/specs/YYYY-MM-DD.md`** - Completed specs by date
- **`archive/implementations/YYYY-MM-DD.md`** - Completed implementations by date
- **`archive/tasks/YYYY-MM-DD.md`** - Completed tasks by date

### Active Documentation (docs/)

Docs in `docs/` represent the current development context/scope:

- **`docs/README.md`** - START HERE - Project overview, architecture, current state
- **`docs/AUDIT.md`** - Current audit status information
- **`docs/TASKS.md`** - Active development tasks organized by phase
- **`docs/IMPLEMENTATION.md`** - Development principles, decisions, testing strategy
- **`docs/SETUP.md`** - Complete setup guide (Supabase + role assignment)
- **`docs/MAGIC_LINKS.md`** - Magic link authentication guide and troubleshooting
- **`docs/specs/`** - Gherkin specs for features in development
- **`docs/implementations/`** - Implementation details for active features
- **`docs/tasks/`** - Task tracking for active features

### Root Documentation

Docs in the root are primarily for human users and repository developers:

- **`README.md`** - Main repository readme file
- **`CLAUDE.md`** - Guidance for Claude Code (this file)
- **`MARKETING.md`** - Marketing information about the project
- **`SETUP.md`** - How to set up this project
- **`packages/README.md`** - How users use the package

### Quick Reference

**When to use each document:**
- **Starting work?** Read `docs/README.md` for context
- **Current audit status?** Check `docs/AUDIT.md`
- **Need to understand a decision?** Check `docs/IMPLEMENTATION.md`
- **Setting up Supabase or roles?** See `docs/SETUP.md`
- **Looking for specific tasks?** Check `docs/TASKS.md` or `docs/tasks/`
- **Magic link issues?** See `docs/MAGIC_LINKS.md`
- **Need feature specs?** Check `docs/specs/`
- **Historical context?** See `archive/PROTOTYPE.md`

---

## Project Overview

**DevCaddy** is a Vite plugin that enables in-context design feedback directly on live applications. It provides environment-aware UI modes for clients and developers to collaborate on design iterations during prototyping and staging phases.

### Key Concepts

- **Two UI Modes**: Automatically switches between `developer` mode (local dev) and `client` mode (staging/preview) based on Vite environment
- **Environment-aware**: Plugin detects context and injects appropriate UI automatically
- **Magic-link access**: Clients access via time-limited magic links with authentication
- **Supabase backend**: Stores annotations with Row Level Security (RLS)
- **Production-safe**: UI only appears in development or when explicitly enabled

---

## Monorepo Structure

This is a **npm workspaces** monorepo with:
- `packages/` - The main DevCaddy package
- `examples/` - Example applications using DevCaddy

### Initial Setup

```bash
# From root directory (required once)
npm install         # Installs all workspace dependencies
```

## Development Commands

### Building the Package

```bash
# From root directory (recommended)
npm run build       # Build the packages workspace

# Or from packages/ directory
cd packages
npm run build       # Full build: TypeScript + SCSS + Vite
npm run build:scss  # Only compile SCSS to CSS
```

### Development

```bash
# From root directory (recommended)
npm run dev              # Start example app (developer mode by default)
npm run dev:developer    # Start in developer mode + auto-open browser
npm run dev:client       # Start in client mode + auto-open browser

# Or from specific directories
cd packages
npm run dev              # Start Vite dev server for package

cd examples/simple
npm run dev              # Test the plugin with example app
```

**Testing Different UI Modes:**
- `npm run dev:developer` - Opens with full developer access (view all annotations, filter by page/status/author, edit/delete all)
- `npm run dev:client` - Opens in client mode (view all annotations, edit/delete own only)
- Both commands automatically open the browser and use environment-based mode detection
- For manual mode switching, add `?devCaddyMode=client` or `?devCaddyMode=developer` to URL

### Linting

```bash
# From root directory (recommended)
npm run lint        # Lint the packages workspace

# Or from packages/ directory
cd packages
npm run lint        # Run ESLint on TypeScript files
```

### Clean Build Artifacts

```bash
# From root directory
npm run clean       # Remove all dist/ directories
```

### Database Migrations

```bash
# From root directory
npm run migrations:bundle    # Bundle all migrations into single SQL file

# Output: devcaddy-migrations.sql
# Then copy this file to Supabase SQL Editor and run
```

---

## Architecture

### Plugin Entry Point

The main plugin is exported from `packages/src/plugin/index.ts` as `DevCaddyPlugin`. It:

1. Detects environment via `getUIMode()` (packages/src/plugin/utility/get-ui-mode.ts:19)
2. Injects global variables into HTML via `transformIndexHtml`
3. Configures server behavior based on command (`serve` vs `build`)

**Plugin Options** (packages/src/types/plugin.ts):
- `enabled: boolean` - Whether DevCaddy is active
- `context: ConfigEnv` - Vite configuration context
- `debug?: boolean` - Enable verbose logging (optional)

### UI Mode Detection

Logic in `packages/src/plugin/utility/get-ui-mode.ts`:

- `mode: 'development'` + `command: 'serve'` → **developer** UI
- `mode: 'production'` + `command: 'serve'` → **client** UI
- Otherwise → `null` (disabled)

### UI Components

Main React UI components live in `packages/src/ui/Core/`:

- **DevCaddy.tsx** - Root component that reads `window.__DEV_CADDY_UI_MODE__` and conditionally renders UI
- **CaddyWindow/** - Main window UI component with header
- **ModeToggle.tsx** - Toggle button to show/hide DevCaddy UI

### Build Configuration

The package builds as both ESM and CommonJS via Vite library mode (packages/vite.config.ts):

- Entry: `src/index.ts`
- Formats: `es` and `cjs`
- External: `react`, `react-dom`, `@supabase/supabase-js` (peer and runtime dependencies)
- Includes TypeScript declarations via `vite-plugin-dts`

**Build Output Structure** (packages/dist/):
- `index.es.js` - ES module format
- `index.cjs.js` - CommonJS format
- `index.d.ts` - TypeScript declarations
- `dev-caddy.css` - Compiled styles
- `client/` - Client API type definitions
- `plugin/` - Plugin type definitions
- `types/` - Core type definitions
- `ui/` - UI component type definitions

**Published Files** (defined in packages/package.json):
- `dist/` - All build outputs
- `migrations/` - SQL migration files for users
- `README.md` - Package documentation

### Styling

SCSS files in `packages/src/ui/styles/` are compiled to `dist/dev-caddy.css`:

- Exported as `dev-caddy/dev-caddy.css` for consumers
- Compiled during build via `sass` CLI

### Example Integration

See `examples/simple/vite.config.ts` for plugin usage:

```ts
import { DevCaddyPlugin } from 'dev-caddy';

export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: process.env.VITE_DEVCADDY_ENABLED !== 'false', // enabled by default
    })
  ],
}));
```

---

## Code Organization

### Package Structure

```
packages/
├── src/
│   ├── client/          # Client-side API (currently minimal)
│   ├── plugin/          # Vite plugin implementation
│   │   ├── configure/   # Server/build configuration
│   │   └── utility/     # Plugin utilities (logging, mode detection)
│   ├── types/           # TypeScript type definitions
│   └── ui/              # React UI components
│       ├── Core/        # Main UI components
│       ├── lib/         # Utilities (selector extraction)
│       ├── styles/      # SCSS stylesheets
│       └── utility/     # UI utilities (positioning)
└── dist/                # Build output (gitignored)
```

### Type System

Key types in `packages/src/types/`:

- **plugin.ts** - `DevCaddyPluginOptions`, `BuildOptions`, `DevCaddyMode`
- **ui.ts** - `DevCaddyProps`, positioning types
- **logging.ts** - Logging configuration types
- **annotations.ts** - `Annotation`, `AnnotationStatus`, `CreateAnnotationInput`, `UpdateAnnotationInput`
- **global.d.ts** - Window type augmentation for `__DEV_CADDY_ENABLED__` and `__DEV_CADDY_UI_MODE__`

---

## Development Principles (from docs/DEVELOPMENT.md)

1. **Prefer simplicity over cleverness**
2. **Follow SOLID principles**
3. **Keep `.ts` and `.tsx` files under 250 lines**
4. **Use hybrid spec-driven + test-driven development**
5. **Do NOT write unit tests** - focus on integration/E2E tests
6. **Avoid mocking in integration and E2E tests**

---

## Testing Strategy: Hybrid Spec-Driven + Test-Driven Development

DevCaddy uses a **hybrid approach** combining Spec-Driven Development (SDD) and Test-Driven Development (TDD):

### High-Level Workflow

1. **Write Gherkin specs** for user-facing features (Given/When/Then)
2. **Review specs** with stakeholders for alignment
3. **Write Playwright E2E tests** that validate the specs
4. **Implement using TDD** (RED/GREEN/REFACTOR)
5. **Refactor** while keeping tests green

### Test Layers

| Layer                | Tool           | Purpose                                    | Mocking? |
| -------------------- | -------------- | ------------------------------------------ | -------- |
| **Specs**            | Gherkin        | Business requirements & acceptance criteria | N/A      |
| **E2E Tests**        | Playwright     | Full user flows (annotation sync, etc.)     | ❌ No     |
| **Integration Tests** | Playwright/Vitest | Multi-component behavior               | ❌ No     |
| **Component Tests**  | Storybook      | Visual regression for isolated components   | Limited  |
| **Unit Tests**       | ❌ None        | **DO NOT WRITE** — Prefer integration/E2E   | N/A      |

### Example: Spec + E2E Test Pairing

**Spec:** `specs/client-annotation.feature`
```gherkin
Feature: Client Annotation Flow
  Scenario: Add annotation to UI element
    Given a client has opened a magic-link staging site
    When they click on a button and add "Fix this button"
    Then the annotation appears on the element
    And the developer sees it in real-time
```

**E2E Test:** `tests/e2e/client-annotation.spec.ts`
```typescript
test('annotation syncs from client to developer', async ({ browser }) => {
  const clientPage = await browser.newPage();
  const devPage = await browser.newPage();

  // Given: client on staging, developer on localhost
  await clientPage.goto('/staging?token=abc123');
  await devPage.goto('http://localhost:5173');

  // When: client adds annotation
  await clientPage.click('button#submit');
  await clientPage.fill('[data-annotation-input]', 'Fix this button');
  await clientPage.click('[data-submit-annotation]');

  // Then: developer sees it in real-time
  await expect(devPage.locator('[data-annotation="Fix this button"]'))
    .toBeVisible({ timeout: 3000 });
});
```

### Testing Commands (Planned)

```bash
# E2E tests
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run with Playwright UI

# Component tests
npm run storybook             # Start Storybook
npm run test:storybook        # Visual regression tests

# Database testing
npx supabase start            # Start local Supabase
npx supabase db reset         # Reset & run migrations
npm run db:seed               # Seed test data
```

### Key Principles

- **Specs provide the "what" and "why"** in business language
- **E2E tests validate real behavior** without mocks
- **TDD for utilities** using RED/GREEN/REFACTOR
- **No unit tests** — test components in context
- **No mocking Supabase** — use test database instances

---

## Security Notes

- Admin/service role keys NEVER shipped to browser
- Client access via time-limited magic links with authentication
- Row Level Security (RLS) on Supabase tables
- Dev UI never appears in production unless explicitly enabled

---

## Key Features in Development

Current implementation includes:

- ✅ Environment detection
- ✅ UI mode switching (developer/client)
- ✅ Basic UI toggle and window
- ✅ Vite plugin with HTML injection
- ✅ SCSS compilation pipeline
- ✅ TypeScript types for annotations (based on schema.dbml)
- ✅ Window type definitions for global variables
- ⏳ Element selector extraction (packages/src/ui/lib/selector/get-element-selectors.ts)
- ⏳ Supabase integration
- ⏳ Magic link generation
- ⏳ Annotation storage and realtime sync

---

## Implementation Decisions

### Empty Implementations

**`configureBuild()`** - Remains minimal/empty since DevCaddy is disabled in production builds.

**`configureServe()`** - Should handle development server setup:
- Add middleware for magic link validation endpoint (`/api/devcaddy/validate-token`)
- Optional logging when DevCaddy is active

**Client API (`src/client/index.ts`)** - May not need exports initially. Export functions as implemented.

### Architecture

**Supabase Client Initialization:**
- Client-side initialization in `src/client/api/init.ts`
- Singleton pattern prevents multiple instances
- Anon key safe to use client-side with RLS

**Real-time Annotation Sync:**
- Use Supabase Realtime with project-wide channel (v0.2.0)
- Channel format: `annotations:all` (single subscription)
- All users see all annotations across entire project
- Cross-page navigation via sessionStorage + window.location

**Magic Links:**
- **Generation:** Server-side only via CLI tool (not bundled with client)
- **Token format:** JWT with short expiration
- **Validation:** Client-side with Supabase Edge Function
- Never bundle service keys in client code

**Element Selection:**
- Click-to-select mode with visual feedback
- Hover shows `outline: 2px dashed blue`
- Click selects element
- Popover appears next to element for annotation input

**Developer vs Client Mode Features:**

| Feature                        | Client Mode | Developer Mode |
| ------------------------------ | ----------- | -------------- |
| Create annotations             | ✅          | ✅             |
| View own annotations           | ✅          | ✅             |
| View all annotations (project) | ✅          | ✅             |
| Navigate to annotation page    | ✅          | ✅             |
| Filter by page                 | ❌          | ✅             |
| Filter by status               | ✅          | ✅             |
| Filter by author               | ❌          | ✅             |
| Edit all annotations           | ❌          | ✅             |
| Edit own annotations           | ✅          | ✅             |
| Delete all annotations         | ❌          | ✅             |
| Delete own annotations         | ✅          | ✅             |
| Change status                  | ❌          | ✅             |
| Reply to annotations           | ❌          | ✅             |
| Export annotations             | ❌          | ✅             |

### Configuration

**Environment Variables:**
```bash
# .env (consumer's app)
VITE_DEVCADDY_ENABLED=true
VITE_DEVCADDY_SUPABASE_URL=https://xxx.supabase.co
VITE_DEVCADDY_SUPABASE_ANON_KEY=eyJhbGc...

# .env.local (developer tools, NOT bundled)
DEVCADDY_JWT_SECRET=your-secret-key
DEVCADDY_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Plugin Configuration:**
- Keep minimal: `enabled`, `context`, `debug` only
- Consumer provides Supabase credentials via `initDevCaddy()` in app code, not plugin config

### State Management

Use **React Context** for annotation state:
- No external dependencies (Zustand, Redux)
- Context sufficient for 1-2 levels of nesting
- Subscribe to Supabase Realtime for updates

### UI/UX Decisions

**Toggle Button:**
- Use SVG icons (not unicode characters)
- Add ARIA labels for accessibility
- No localStorage persistence initially

**Annotation Input:**
- Popover positioned near selected element using `createPortal`
- Fixed position based on element's bounding rect

**Window Positioning:**
- Start with fixed corner positioning
- No draggable/resizable features initially
- Ship simple first, add features based on feedback

### Security

**Rate Limiting:**
- Implement in Supabase Edge Function
- In-memory map or Upstash Redis
- 10 attempts per IP per hour

**Content Sanitization:**
- Use DOMPurify before rendering annotation content
- Plain text only, no HTML allowed
- Prevents XSS attacks

**RLS Policies:**
- Clients (magic link users) can only insert
- Developers (local env) have full access
- Implement via `auth.jwt()->>'type'` checks

---

## Database Schema Setup

### Approach: Manual Setup (Phase 1)

DevCaddy uses **manual database setup** for the MVP:

**How it works:**
- SQL migration files provided in `packages/migrations/`
- User runs migrations manually via Supabase Dashboard or CLI
- No automatic schema creation (security and explicitness)

**Setup process:**
1. User creates Supabase project
2. User runs provided SQL migrations
3. User enables Realtime on annotation table
4. User configures environment variables in their app

**Why manual?**
- Security: No service role keys in client code
- Simplicity: Package focuses on UI, not infrastructure
- Explicit: Users understand what's created in their database
- Control: Users maintain full visibility and control

**Future enhancement (Phase 2):**
- CLI tool: `npx @devcaddy/cli setup`
- Reads service role key from local `.env.local` only
- Automates migration execution
- Still server-side only, never bundled with client

See `docs/SUPABASE_SETUP.md` for complete setup guide.
