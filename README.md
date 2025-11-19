# DevCaddy

**In-context design feedback for live web applications** — Bridge the gap between developers and clients during the prototyping and staging phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)](https://vitejs.dev/)

---

## What is DevCaddy?

DevCaddy is a lightweight Vite plugin that enables **real-time, visual feedback** directly on your running application. Click any UI element, add a comment, and collaborate seamlessly — no screenshots, no back-and-forth emails, no confusion about "that button on the left."

### The Problem It Solves

Traditional design feedback workflows are broken:
- 📧 **Email ping-pong** with vague descriptions like "fix the button"
- 📸 **Screenshot chaos** that's outdated by the next deployment
- 🗣️ **Miscommunication** about which element needs changes
- ⏰ **Wasted time** context-switching between tools

### The DevCaddy Solution

**Point. Click. Annotate. Done.**

DevCaddy transforms your live application into a collaborative canvas where stakeholders can provide contextual feedback exactly where it's needed.

---

## ✨ Key Features

- 🎯 **Click-to-annotate** — Select any element and leave feedback directly on it
- 🔄 **Real-time sync** — Developers see client feedback instantly via Supabase
- 🎭 **Dual UI modes** — Automatically adapts for developers (local) and clients (staging)
- 🔐 **Magic link access** — Clients authenticate via time-limited email links (coming soon)
- 🏗️ **Framework agnostic** — Works with React, Vue, Svelte, and more (Vite-based)
- 📍 **Context-aware** — Annotations include element selectors, page URLs, and timestamps
- 🎨 **Compact & playful** — Beautiful, unobtrusive UI that doesn't get in the way
- 🔒 **Production-safe** — Only appears in development/staging, never in production

---

## 🎥 See It In Action

```typescript
// vite.config.ts
import { DevCaddyPlugin } from 'dev-caddy';

export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: process.env.NODE_ENV !== 'production'
    })
  ]
}));
```

**That's it.** Your app now has enterprise-grade design feedback built in.

Then in your app's root component:

```tsx
import { DevCaddy } from 'dev-caddy';
import 'dev-caddy/dev-caddy.css';

function App() {
  return (
    <>
      <YourApp />
      <DevCaddy corner="bottom-right" />
    </>
  );
}
```

---

## 💡 Perfect For

- **Agencies** shipping client work with tight feedback loops
- **Startups** iterating rapidly on prototypes
- **Design systems** teams coordinating across disciplines
- **Remote teams** needing async, contextual communication
- **Solo developers** working with non-technical stakeholders

---

## 🚀 Why DevCaddy Stands Out

Unlike generic feedback tools (Markup.io, Usersnap), DevCaddy is:

1. **Developer-first** — Installs as a Vite plugin, not a third-party script
2. **Self-hosted** — Your data stays in your Supabase instance
3. **Zero config** — Works out of the box with intelligent environment detection
4. **Open source** — Customize, extend, and contribute

---

## 🏗️ Technical Highlights

- **Monorepo architecture** with npm workspaces
- **Hybrid spec-driven + TDD** workflow with Playwright E2E tests
- **Row-level security** via Supabase RLS policies
- **Compact design system** — Unified button system, 4px spacing scale, playful interactions
- **TypeScript** throughout with full type safety
- **SCSS modules** with design tokens for easy theming
- **Real-time collaboration** powered by Supabase Realtime

---

## 📦 What's Inside

```
v2-dev-caddy/
├── packages/            # Core DevCaddy package
│   ├── src/            # TypeScript source
│   │   ├── client/    # Client API (Supabase operations)
│   │   ├── plugin/    # Vite plugin implementation
│   │   ├── types/     # TypeScript type definitions
│   │   └── ui/        # React UI components
│   ├── migrations/    # SQL database migrations
│   └── dist/          # Built package (generated)
├── examples/          # Integration examples
│   ├── simple/        # Basic Vite + React setup
│   └── tanstack/      # TanStack Start SSR example
├── tests/             # E2E tests with Playwright
└── docs/              # Comprehensive documentation
```

---

## 🎯 Current Status

DevCaddy is in active development for **v0.2.0** with:

- ✅ Environment-aware UI modes (developer/client)
- ✅ Click-to-select element annotation
- ✅ Supabase backend integration with RLS
- ✅ Real-time annotation sync across users
- ✅ Compact, playful design system with unified buttons
- ✅ Filter annotations by page, status, and author (developer mode)
- ✅ Status management and annotation lifecycle
- 🔄 Magic link authentication (in progress)
- 🔄 Comprehensive E2E test suite (in progress)

---

## 🚦 Getting Started

### For Users

**Looking for usage documentation?** See [packages/README.md](./packages/README.md) for npm package installation and usage instructions.

### For Contributors

This README covers development setup. If you want to contribute to DevCaddy:

#### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

#### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/dev-caddy.git
cd dev-caddy

# Install all dependencies (monorepo + workspaces)
npm install

# Build the package
npm run build
```

#### Development Commands

All commands should be run from the **root directory**:

```bash
# Build
npm run build          # Build the packages workspace
npm run build:scss     # Compile SCSS to CSS only
npm run clean          # Remove all dist/ directories

# Development
npm run dev              # Start example app (developer mode)
npm run dev:developer    # Start in developer mode + auto-open browser
npm run dev:client       # Start in client mode + auto-open browser

# Linting
npm run lint           # Run ESLint on packages workspace

# Testing
npm run test:e2e       # Run E2E tests with Playwright
npm run test:e2e:tanstack  # Run TanStack SSR E2E tests
```

---

## 📖 Documentation

- **[packages/README.md](./packages/README.md)** - npm package usage guide
- **[docs/README.md](./docs/README.md)** - Project overview and architecture
- **[docs/SETUP.md](./docs/SETUP.md)** - Complete Supabase setup guide
- **[docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)** - Development principles and testing strategy
- **[docs/TASKS.md](./docs/TASKS.md)** - Active development tasks
- **[CLAUDE.md](./CLAUDE.md)** - Guidance for AI assistants

---

## 🧪 Development Workflow

DevCaddy uses a **hybrid spec-driven + test-driven development approach**:

### For New Features

1. Read feature requirements in [docs/TASKS.md](./docs/TASKS.md)
2. Write Gherkin spec in `docs/specs/` (if user-facing)
3. Write E2E test with Playwright
4. Implement using TDD (RED/GREEN/REFACTOR)
5. Update documentation

### For Bug Fixes

1. Write E2E test that reproduces the bug
2. Fix the bug until test passes
3. Run full test suite to ensure no regressions

### Testing UI Modes

DevCaddy has two UI modes for different user types:

- **Developer mode** - Full access (filter, edit all, manage status)
- **Client mode** - Limited access (view all, edit own only)

Test modes using:
- `npm run dev:developer` or `npm run dev:client` (recommended)
- Query parameters: `?devCaddyMode=developer` or `?devCaddyMode=client`
- In-UI mode switcher (development only)

---

## 🏛️ Architecture

DevCaddy consists of:

- **Vite Plugin** - Environment detection, HTML injection, server configuration
- **React UI** - Dual-mode interface (client & developer)
- **Client API** - Supabase operations (CRUD + real-time subscriptions)
- **Type System** - Full TypeScript definitions with strict mode
- **Design System** - Compact, playful aesthetic with unified components

See [docs/README.md](./docs/README.md) for detailed architecture documentation.

---

## 🗄️ Database Setup

DevCaddy requires a Supabase project:

1. Create a project at [supabase.com](https://supabase.com)
2. Bundle migrations:
   ```bash
   npm run migrations:bundle
   ```
3. Copy `devcaddy-migrations.sql` to Supabase SQL Editor and run
4. Configure `.env` in your app:
   ```env
   VITE_DEVCADDY_ENABLED=true
   VITE_DEVCADDY_SUPABASE_URL=https://xxx.supabase.co
   VITE_DEVCADDY_SUPABASE_ANON_KEY=eyJhbGc...
   ```

See [docs/SETUP.md](./docs/SETUP.md) for complete setup instructions including RLS policies and role configuration.

---

## 🎨 Design Principles

DevCaddy follows these core principles:

1. **Compact & playful** - 4px spacing scale, soft rounded corners, spring animations
2. **Simplicity over cleverness** - Clear code beats clever code
3. **SOLID principles** - Single responsibility, proper separation of concerns
4. **Type safety** - Leverage TypeScript, avoid `any`
5. **Real behavior testing** - No mocking in E2E tests
6. **Files under 250 lines** - Keep modules focused and maintainable

---

## 🤝 Contributing

DevCaddy is built in the open. Whether you're fixing a typo or proposing a feature, contributions are welcome!

### Code Style

- Use TypeScript strict mode
- Follow existing patterns and conventions
- Add JSDoc comments for public APIs
- Keep files under 250 lines
- Use meaningful names (no `a`, `b`, `temp`)

### Commit Messages

Use conventional commits format:

```
feat: add icon to filter button

Makes the filter button match the unified button system with
consistent sizing and visual style.

Closes #123
```

### Pull Requests

1. Create a feature branch from `main`
2. Implement changes following the development workflow
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description

---

## 📄 License

MIT — Use it, fork it, ship it.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dev-caddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dev-caddy/discussions)
- **Documentation**: [docs/](./docs/)

---

**Built with ❤️ by a developer who got tired of "can you move that button 2px to the left?" emails.**
