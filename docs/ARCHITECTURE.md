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

## Summary

DevCaddy sits between the prototype UI and development workflow, providing:

- Instant reviewer feedback on real UI
- Local developer triage & resolution tools
- Secure, environment-aware runtime behavior
- Zero-friction client access via magic links

A lightweight architecture that accelerates iteration without polluting production.
