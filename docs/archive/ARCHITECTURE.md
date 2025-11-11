# DevCaddy Architecture

DevCaddy enables structured, in-context design feedback directly on live applications during prototyping and staging. It automatically switches between **Reviewer Mode** (clients, via magic link) and **Developer Mode** (engineers, local dev) based on the environment.

---

## System Overview

Reviewer (via magic link)
↓  
Staging Build → Reviewer UI → Supabase (anon, RLS)
↑ realtime updates  
Local Dev → Developer UI → Supabase (anon + dev capabilities)
Admin CLI → Supabase (admin access for migrations & config)

---

## Core Components

### 🧠 DevCaddy NPM Package

- Environment-aware Vite plugin
- Injects correct UI automatically
- Exposes a virtual module: `devcaddy/client`
- Bundles:
  - Reviewer UI (annotations)
  - Developer UI (annotation inbox & tools)

### 🌐 Frontend Modes

| Mode               | Trigger                    | UI Injected      | Capabilities                      |
| ------------------ | -------------------------- | ---------------- | --------------------------------- |
| **Reviewer Mode**  | Staging build + magic-link | Reviewer Toolbar | Leave annotations, screenshots    |
| **Developer Mode** | Local dev (`vite dev`)     | Dev Panel        | View, triage, resolve annotations |
| **Disabled**       | Production                 | None             | Production-safe by default        |

### 🔐 Magic-Link Access

- No accounts needed for reviewers
- Single-use or time-bound link
- Grants limited access to leave feedback only

### 💾 Supabase (Backend)

- Stores annotations & sessions securely
- Realtime sync: reviewer ↔ developer
- RLS ensures isolation and safety
- Admin API only via CLI (never in browser)

### 🛠 Migration + Administration CLI

- Uses Supabase service role (secure, server-only)
- Handles DB setup and updates
- Optional: push/pull config & seed dev data

---

## Runtime Data Flow

### ⭐ Reviewer Feedback Flow

1. Open magic-link staging site
2. Reviewer selects element & adds annotation
3. DevCaddy client sends data to Supabase
4. Supabase pushes realtime update to dev devices
5. Developers see & resolve feedback in Dev UI

### 🧑‍💻 Developer Resolution Flow

1. Work locally on app with DevCaddy active
2. Resolve annotations in Dev Panel
3. Updates sync back to reviewers in real-time

---

## Environment Behavior

| Environment       | Behavior                                  |
| ----------------- | ----------------------------------------- |
| `dev`             | Developer Panel enabled                   |
| `preview/staging` | Reviewer UI enabled (magic link required) |
| `prod`            | DevCaddy disabled by default (opt-in)     |

---

## Key Design Principles

- **Non-intrusive** – no login friction for reviewers
- **Production-safe** – UI only activates intentionally
- **Environment-smart** – plugin auto-detects context
- **Realtime collaboration** – feedback sync instantly
- **Secure by design** – admin keys never shipped to browser

---

## Testing Architecture

DevCaddy uses a **hybrid spec-driven + test-driven development approach** that ensures quality at multiple levels:

### Testing Layers

```
┌─────────────────────────────────────────────────┐
│  Specs (Gherkin)                                │
│  "What" and "Why" in business language          │
│  - Feature: Reviewer Annotation Flow            │
│  - Scenario: Add annotation to UI element       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  E2E Tests (Playwright)                         │
│  Full user flows in real browser                │
│  - Magic link access & validation               │
│  - Annotation creation & sync                   │
│  - Real-time updates between reviewer/dev       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Integration Tests                              │
│  Multi-component behavior                       │
│  - UI Mode detection + injection                │
│  - Supabase RLS policies                        │
│  - Element selector extraction                  │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Component Tests (Storybook)                    │
│  Visual regression & isolated components        │
│  - CaddyWindow variations                       │
│  - ModeToggle states                            │
└─────────────────────────────────────────────────┘
```

### Test Environment Strategy

| Environment         | Database           | Purpose                          |
| ------------------- | ------------------ | -------------------------------- |
| **Local Dev**       | Supabase Local     | Development & manual testing     |
| **CI/CD**           | Supabase Test DB   | Automated E2E & integration tests |
| **Staging**         | Supabase Staging   | Pre-production validation        |
| **Production**      | Supabase Prod      | Live usage (DevCaddy disabled)   |

### Key Testing Principles

1. **No unit tests** — Focus on integration and E2E tests that validate real behavior
2. **No mocking in E2E** — Use actual Supabase test instances with RLS enabled
3. **Specs first for features** — Write Gherkin specs before implementation
4. **TDD for utilities** — Use RED/GREEN/REFACTOR for internal libraries
5. **Real browser testing** — Playwright validates actual DOM manipulation and realtime sync

### Example Test Flow

**Spec:** Reviewer adds annotation
```gherkin
Given a reviewer with valid magic link
When they click a UI element and add "Fix this button"
Then annotation appears on element
And developer sees it in real-time
```

**E2E Test:** Validates the spec end-to-end
```typescript
test('annotation syncs reviewer to developer', async ({ browser }) => {
  const reviewerPage = await browser.newPage();
  const devPage = await browser.newPage();

  // Setup reviewer session
  await reviewerPage.goto('/staging?token=abc123');

  // Setup developer session
  await devPage.goto('http://localhost:5173');

  // Reviewer adds annotation
  await reviewerPage.click('button#submit');
  await reviewerPage.fill('[data-annotation-input]', 'Fix this button');
  await reviewerPage.click('[data-submit-annotation]');

  // Developer sees it in real-time (via Supabase Realtime)
  await expect(devPage.locator('[data-annotation="Fix this button"]'))
    .toBeVisible({ timeout: 3000 });
});
```

This validates the **entire stack**: magic link auth, element selection, Supabase storage, RLS policies, and realtime sync.

---

## Technical Implementation Details

### Supabase Integration

**Client Initialization:**
- Client-side initialization in `src/client/api/init.ts`
- Singleton pattern prevents multiple instances
- Anon key is safe to use client-side with RLS protection

**Realtime Subscriptions:**
- Use Supabase Realtime with page-scoped channels
- Channel format: `annotations:${normalizedUrl}`
- Normalize URLs by stripping protocol, query params, and hash fragments
- Subscriptions automatically update React state via callback

### Magic Link System

**Generation (CLI Tool - NOT bundled):**
- Server-side only via CLI tool (never bundled with client code)
- JWT token format with short expiration (e.g., 24h)
- Signed with service role secret
- Command: `npx devcaddy generate-link --expires 24h --project my-app`

**Validation (Supabase Edge Function):**
- Client-side validation via Supabase Edge Function
- Verifies JWT signature using jose library
- Returns 401 for invalid/expired tokens
- Never exposes service role key to client

### Element Selection Flow

**Click-to-Select Mode:**
1. User clicks "Add Annotation" button in DevCaddy window
2. Cursor changes, mode switches to "selecting"
3. Hover shows element outline with CSS `outline: 2px dashed blue`
4. Click selects element and extracts selector
5. Popover appears next to element for annotation input
6. Submit saves annotation with generated selector

**Hook Implementation:**
- Custom `useElementSelector` hook manages selection state
- Event listeners for click, mouseover, mouseout
- Cleanup on unmount prevents memory leaks

### State Management Pattern

**React Context for Annotations:**
- No external dependencies (Zustand, Redux)
- Context sufficient for 1-2 levels of nesting
- Subscribe to Supabase Realtime for updates
- Annotations state automatically syncs across reviewer and developer

**Provider Structure:**
- `AnnotationProvider` wraps app components
- Provides `annotations`, `addAnnotation`, `resolveAnnotation`
- Real-time subscription updates state automatically

### Security Implementation

**Row Level Security (RLS) Policies:**
- Clients (magic link users) can only INSERT annotations
- Developers (local env) have full CRUD access
- Policies check `auth.jwt()->>'type'` to determine permissions
- Prevents reviewers from deleting or modifying others' annotations

**Content Sanitization:**
- Use DOMPurify before rendering annotation content
- Plain text only, no HTML tags allowed
- Prevents XSS attacks from malicious input

**Rate Limiting:**
- Implemented in Supabase Edge Function
- In-memory map or Upstash Redis for tracking
- 10 attempts per IP per hour
- Returns 429 status when limit exceeded

### Plugin Server Configuration

**configureBuild():**
- Remains minimal/empty
- DevCaddy disabled in production builds by default

**configureServe():**
- Add middleware for magic link validation endpoint (`/api/devcaddy/validate-token`)
- Optional logging when DevCaddy is active
- No special server configuration needed beyond middleware

---

## Summary

DevCaddy sits between the prototype UI and development workflow, providing:

- Instant reviewer feedback on real UI
- Local developer triage & resolution tools
- Secure, environment-aware runtime behavior
- Zero-friction client access via magic links
- Comprehensive testing at spec, E2E, and integration levels

A lightweight architecture that accelerates iteration without polluting production.
