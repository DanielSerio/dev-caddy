# DevCaddy Documentation

**Current Phase:** Phase 3 - Authentication & UI Implementation
**Last Updated:** 2025-11-11

---

## Quick Start for AI Assistants

When working on DevCaddy, follow this hierarchy:

1. **Start here** - Read this file for project overview and current state
2. **TASKS.md** - Check active development tasks and phase progress
3. **IMPLEMENTATION.md** - Reference for development principles and architectural decisions
4. **SETUP.md** - Supabase configuration and role assignment (for team leads)

---

## Project Overview

DevCaddy is a lightweight collaboration layer that bridges the gap between product design feedback and developer workflows during prototyping and staging. It enables stakeholders, designers, and clients to leave **in-context annotations directly on live UI elements** — no screenshots, no Figma exports, no messy email threads.

Developers triage and resolve this feedback **inside their local dev environment**, with real-time sync powered by Supabase.

### Core Value Proposition

| For Reviewers / Clients                | For Developers                            |
| -------------------------------------- | ----------------------------------------- |
| Click any UI element to leave feedback | See annotations directly on UI during dev |
| Magic-link authentication (one time)   | Resolve / filter / inspect feedback       |
| Context stays with the live UI         | Real-time sync with local code            |
| No screenshots or tools required       | Minimal setup via Vite plugin             |

---

## Architecture Summary

### System Components

```
Team Lead (one-time setup)
  ↓ Creates users & assigns roles via SQL
Supabase Auth (app_metadata for roles)
  ↓
Reviewer (magic link)                Developer (local dev)
  ↓                                    ↓
Staging/Preview Build              Local Dev Server
  ↓                                    ↓
Client UI Mode                     Developer UI Mode
  ↓                                    ↓
  └────────→ Supabase (RLS) ←────────┘
           (Real-time sync)
```

### UI Modes

| Mode               | Trigger                    | UI Components        | Capabilities                                    |
| ------------------ | -------------------------- | -------------------- | ----------------------------------------------- |
| **Developer Mode** | Local dev (`vite dev`)     | Full UI + controls   | View ALL annotations, filter by page/status/author, edit/delete ALL |
| **Client Mode**    | Staging build              | Limited UI           | View ALL annotations across project, edit/delete OWN |
| **Disabled**       | Production build           | None                 | Production-safe by default                      |

### Authentication Flow

1. **Team Lead Setup (One-time)**
   - Creates all users in Supabase Dashboard (Auth > Users > Invite User)
   - Assigns developer role via SQL: `UPDATE auth.users SET raw_app_meta_data = '{"role": "developer"}'::jsonb WHERE email = ...`
   - Shares app URL with team

2. **User Authentication (One-time per user)**
   - User opens app → clicks DevCaddy toggle
   - Enters email → receives magic link
   - Clicks magic link → authenticated with correct permissions
   - Session persists across page refreshes

3. **Permission Enforcement**
   - JWT includes `app_metadata.role` (admin-only, secure)
   - RLS policies check role: `(auth.jwt()->'app_metadata'->>'role')::text = 'developer'`
   - Absence of role = client permissions

### Database Schema

**Tables:**
- `annotation` - Stores all annotations with element selectors, status, content

**Key Fields:**
- `created_by` - User UUID from `auth.uid()`
- `status_id` - 1=new, 2=in-progress, 3=in-review, 4=hold, 5=resolved
- `page` - URL pathname (used for cross-page navigation and filtering)
- `element_*` - Selector data for re-highlighting elements

**Security:**
- Row Level Security (RLS) enabled on all tables
- Policies use `auth.jwt()->'app_metadata'->>'role'` for permissions
- `app_metadata` is admin-only (cannot be modified by users)

---

## File Guide

### Active Documentation

- **README.md** (this file) - Project overview, architecture, current state
- **TASKS.md** - Active development tasks organized by phase
- **IMPLEMENTATION.md** - Development principles, decisions, testing strategy
- **SETUP.md** - Complete setup guide for Supabase and role assignment

### Archived Documentation

Located in `docs/archive/`:
- **ABOUT.md** - Marketing copy and feature descriptions
- **AUDIT.md** - Code quality audit (snapshot from 2025-11-11)
- **ARCHITECTURE.md** - Detailed architecture (superseded by README.md)
- **INJECTION_STRATEGY.md** - Early phase planning document
- **ELEMENT_RESELECTION_PLAN.md** - Future feature planning
- **RESELECTION_FEASIBILITY.md** - Research document

---

## Current State

### Completed Phases

#### ✅ Phase 1: Database Foundation
- Schema design with single `annotation` table
- Migrations in `packages/migrations/`
- Removed unnecessary `annotation_status` lookup table
- Simplified status handling with CHECK constraint + TypeScript constants

#### ✅ Phase 2: Security & Permissions
- RLS policies using `app_metadata` (admin-only, secure)
- Fixed security vulnerability (changed from `user_metadata`)
- Permission matrix: developers can edit ALL, clients can edit OWN
- All users can view ALL annotations (collaboration)

#### ✅ Phase 3: Authentication & UI (In Progress)
- Magic link authentication via Supabase Auth
- `useAuth` hook for session management
- `AuthPrompt` component for email input
- Session persistence across navigation
- SPA navigation detection (popstate + history API intercepts)
- URL normalization using pathname only

### Current Work

See **TASKS.md** for detailed task breakdown.

**Phase 3 Remaining:**
- Element selection UI
- Annotation creation flow
- Annotation display/highlighting
- Status management UI

**Next Phases:**
- Phase 4: Annotation rendering and element highlighting
- Phase 5: Developer triage UI
- Phase 6: Realtime sync refinement
- Phase 7+: Magic link generation, advanced features

---

## Key Technology Decisions

### Authentication: Magic Links (Supabase Auth)
- **Why:** No passwords, minimal friction, built-in session management
- **How:** Team lead creates users → assigns roles → users authenticate once
- **Security:** `app_metadata` for roles (admin-only), JWT-based RLS

### URL Scoping: Pathname Only
- **Why:** Simpler, works across query params, meets 90% of use cases
- **How:** `window.location.pathname` used consistently
- **Trade-off:** Can't distinguish same route with different query params

### Status Management: Constants (Not Lookup Table)
- **Why:** Fixed set of 5 statuses, no need for database table
- **How:** CHECK constraint + TypeScript `ANNOTATION_STATUS` constants
- **Benefit:** Simpler schema, no seeding required, faster queries

### State Management: React Context
- **Why:** Sufficient for 1-2 levels of nesting, no external dependencies
- **How:** `AnnotationProvider` with Supabase Realtime subscriptions
- **Scope:** Project-wide (single subscription to all annotations, v0.2.0)

---

## Development Setup

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Installation

```bash
# From project root
npm install

# Build package
npm run build
```

### Development

```bash
# Run example app in developer mode
npm run dev

# Run in client mode
npm run dev:client
```

### Testing

```bash
# Linting
npm run lint

# E2E tests (planned)
npm run test:e2e
```

---

## Package Structure

```
packages/
├── src/
│   ├── client/          # Client-side API (Supabase operations)
│   ├── plugin/          # Vite plugin implementation
│   ├── types/           # TypeScript type definitions
│   └── ui/              # React UI components
│       ├── Core/        # Main DevCaddy UI (DevCaddy.tsx, CaddyWindow)
│       ├── Client/      # Client-mode specific components
│       ├── Developer/   # Developer-mode specific components
│       ├── components/  # Shared components (AuthPrompt, etc.)
│       ├── context/     # React Context (AnnotationContext)
│       ├── hooks/       # Custom hooks (useAuth, useElementSelector)
│       └── styles/      # SCSS stylesheets
├── migrations/          # SQL migration files
└── dist/                # Build output (gitignored)
```

---

## Monorepo Structure

```
v2-dev-caddy/
├── packages/            # Main DevCaddy package
├── examples/
│   └── simple/          # Example React app using DevCaddy
├── docs/                # Documentation (this file)
└── scripts/             # Build and utility scripts
```

---

## Contributing

### Development Principles

See **IMPLEMENTATION.md** for detailed principles, including:
- Prefer simplicity over cleverness
- Follow SOLID principles
- Keep files under 250 lines
- Use hybrid spec-driven + test-driven development
- No unit tests (focus on integration/E2E)

### Before Starting Work

1. Read **TASKS.md** to understand current phase
2. Check **IMPLEMENTATION.md** for architectural decisions
3. Verify Supabase setup in **SETUP.md** if working with auth/database

---

## Support

- **Issues:** [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- **Documentation:** Start with this README, then reference other docs as needed
- **Examples:** See `examples/simple/` for working implementation

---

## License

[Add license information]
