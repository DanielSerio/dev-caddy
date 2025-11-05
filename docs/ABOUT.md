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

## 🧪 Testing

- Storybook for UI component testing
- Playwright for full annotation-flow E2E tests
- Local DB migration test harness (Supabase CLI)

_Unit tests optional — we prioritize real behavior testing._

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
