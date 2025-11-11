# DevCaddy

DevCaddy is a lightweight collaboration layer that bridges the gap between product design feedback and developer workflows during the prototyping and staging phase. It enables stakeholders, designers, and clients to leave **in-context annotations directly on live UI elements** — no screenshots, no Figma exports, no messy email threads.

Developers then triage and resolve this feedback **inside their local dev environment**, with real-time sync powered by Supabase.

---

## ✨ Core Value Proposition

| For Reviewers / Clients                | For Developers                            |
| -------------------------------------- | ----------------------------------------- |
| Click any UI element to leave feedback | See annotations directly on UI during dev |
| No accounts — magic-link access        | Resolve / filter / inspect feedback       |
| Context stays with the live UI         | Real-time sync with local code            |
| No screenshots or tools required       | Minimal setup via Vite plugin             |

---

## 🚀 Key Features

- **Drop-in Vite plugin**
- **Automatic environment detection**
  - Local dev → developer UI
  - Staging / preview → reviewer UI
- **Magic-link reviewer access**
  - No login friction
  - Time-limited & revocable tokens
- **Supabase-powered backend**
  - Secure data storage
  - Realtime sync
  - RLS-protected annotation tables
- **Annotation intelligence**
  - DOM selector & bounding box
  - Fallback screenshot support
  - Handles element changes gracefully

---

## 🌐 Intended Workflow

1. Developer installs npm package & plugin
2. Runs project locally → Dev UI appears automatically
3. Deploys preview/staging → Reviewer UI auto-mounts
4. Developer generates **magic review link**
5. Client clicks link and annotates
6. Developer sees comments stream in live
7. Comments are resolved inside dev UI

---

## 🛡️ Security & Safety

- Reviewer access only via signed time-limited link
- No admin keys ever shipped to the browser
- RLS ensures reviewers can only modify their own annotations
- Dev UI **never appears in production**
- Optional CAPTCHA & rate limiting for public previews

---

## 🧪 Testing Strategy

DevCaddy uses a **hybrid spec-driven + test-driven development approach**:

### Spec-Driven Development (SDD)
- Write **Gherkin specs** (Given/When/Then) for user-facing features
- Provides clear acceptance criteria in plain language
- Enables non-technical stakeholders to validate requirements
- Stored in `specs/` directory as `.feature` files

**Example:**
```gherkin
Feature: Reviewer Annotation Flow
  Scenario: Add annotation to UI element
    Given a reviewer has opened a magic-link staging site
    When they click on a button and add "Fix this"
    Then the annotation appears on the element
    And the developer sees it in real-time
```

### Test-Driven Development (TDD)
- Convert specs into **Playwright E2E tests**
- Use **RED/GREEN/REFACTOR** cycle for implementation
- No unit tests — focus on integration and E2E tests
- No mocking — use real Supabase test instances

**Tools:**
- **Playwright** — Full annotation-flow E2E tests
- **Storybook** — UI component visual regression testing
- **Supabase CLI** — Local database testing & migrations

**Workflow:**
1. Write spec → 2. Review with stakeholders → 3. Write E2E test → 4. Implement (TDD) → 5. Refactor

_We prioritize real behavior testing over isolated unit tests._

---

## 🎯 Mode-Specific Features

| Feature                | Client Mode | Developer Mode |
| ---------------------- | ----------- | -------------- |
| Create annotations     | ✅          | ✅             |
| View own annotations   | ✅          | ✅             |
| View all annotations   | ❌          | ✅             |
| Mark as resolved       | ❌          | ✅             |
| Mark own as resolved   | ✅          | ✅             |
| Delete annotations     | ❌          | ✅             |
| Delete own annotations | ✅          | ✅             |
| Reply to annotations   | ❌          | ✅             |
| Filter by status       | ✅          | ✅             |
| Export annotations     | ❌          | ✅             |

**Access Control:**
- Client mode (reviewers) have limited permissions via magic links
- Developer mode (local dev) has full CRUD capabilities
- Enforced via Supabase Row Level Security (RLS) policies

---

## 🔮 Future Possibilities

- Annotation threading + mentions
- Integrations with GitHub / Linear / Jira
- Screenshot editing / markup tools
- AI feedback grouping & triage
- Hosted SaaS option (for teams who don’t want to manage Supabase)

---

With DevCaddy, feedback finally happens **where the product lives** — in the real interface, not in scattered screenshots.

Stop guessing what your client meant.
Start collaborating with clarity.
