# DevCaddy Monorepo

This is the development repository for DevCaddy, a Vite plugin that enables in-context design feedback directly on live applications.

**Looking for usage documentation?** See [packages/README.md](./packages/README.md) for npm package installation and usage instructions.

---

## For Contributors

This README is for developers working on DevCaddy itself. If you want to use DevCaddy in your project, see the [package documentation](./packages/README.md).

## Project Structure

```
v2-dev-caddy/
├── packages/            # Main DevCaddy package
│   ├── src/            # TypeScript source
│   │   ├── client/    # Client API (Supabase operations)
│   │   ├── plugin/    # Vite plugin implementation
│   │   ├── types/     # TypeScript type definitions
│   │   └── ui/        # React UI components
│   ├── migrations/     # SQL database migrations
│   └── dist/          # Built package (generated)
├── examples/           # Example applications
│   └── simple/        # Simple React app example
└── docs/              # Project documentation
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    ├── SUPABASE_SETUP.md
    └── TASKS.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/dev-caddy.git
cd dev-caddy

# Install all dependencies (monorepo + workspaces)
npm install

# Build the package
npm run build
```

## Development Commands

All commands should be run from the **root directory** using npm workspaces:

### Build Commands

```bash
npm run build          # Build the packages workspace
npm run build:scss     # Compile SCSS to CSS only
npm run clean          # Remove all dist/ directories
```

### Development Servers

```bash
npm run dev              # Start example app (developer mode by default)
npm run dev:developer    # Start in developer mode + auto-open browser
npm run dev:client       # Start in client mode + auto-open browser
```

**What these do:**
- `dev:developer` - Full admin UI (all annotations, filters, editing)
- `dev:client` - Reviewer UI (own annotations only)
- Both automatically open your browser

### Linting

```bash
npm run lint           # Run ESLint on packages workspace
```

## Testing UI Modes

DevCaddy has two UI modes that you can test during development:

### Method 1: Mode-Specific Scripts (Recommended)

```bash
npm run dev:developer    # Test developer features
npm run dev:client       # Test reviewer experience
```

### Method 2: Query Parameters

Add to your dev server URL:
- `?devCaddyMode=developer` - Force developer mode
- `?devCaddyMode=client` - Force client mode

### Method 3: In-UI Switcher

When DevCaddy is running in development, use the mode switcher at the top of the UI window.

## Development Workflow

### For New Features

1. Read the feature requirements in [docs/TASKS.md](./docs/TASKS.md)
2. Write Gherkin spec in `specs/` directory (if user-facing)
3. Write E2E test in Playwright
4. Implement feature using TDD (RED/GREEN/REFACTOR)
5. Update documentation

### For Bug Fixes

1. Write E2E test that reproduces the bug
2. Fix the bug until test passes
3. Run full E2E suite to ensure no regressions

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for complete development guidelines.

## Architecture

DevCaddy consists of:

- **Vite Plugin** - Injects UI and detects environment
- **React UI** - Annotation interface (client & developer modes)
- **Client API** - Supabase operations (CRUD + real-time)
- **Type System** - Full TypeScript definitions

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical details.

## Database Setup

DevCaddy requires a Supabase project for backend:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration bundle script:
   ```bash
   npm run migrations:bundle
   ```
3. Copy the generated `devcaddy-migrations.sql` file
4. Paste into Supabase SQL Editor and run
5. Configure environment variables in `examples/simple/.env`

See [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for complete setup instructions.

## Testing Strategy

DevCaddy uses a **hybrid spec-driven + test-driven development approach**:

1. **Gherkin Specs** - Define acceptance criteria in plain language
2. **E2E Tests** - Validate behavior with Playwright (no mocks)
3. **TDD** - RED/GREEN/REFACTOR for implementation
4. **No Unit Tests** - Focus on integration and E2E tests

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for testing guidelines.

## Core Development Principles

1. **Simplicity over cleverness** - Prefer clear code over clever code
2. **SOLID principles** - Single responsibility, dependency injection
3. **Small files** - Keep `.ts` and `.tsx` files under 250 lines
4. **Real behavior testing** - No mocking in E2E tests
5. **Type safety** - Leverage TypeScript, avoid `any`
6. **Manual setup first** - Explicit over implicit (database, config)

## Contributing Guidelines

### Code Style

- Use TypeScript strict mode
- Follow existing patterns and conventions
- Add JSDoc comments for public APIs
- Keep files under 250 lines
- Use meaningful variable and function names

### Commit Messages

- Use conventional commits format
- Be descriptive and concise
- Reference issue numbers when applicable

Example:
```
feat: add query parameter mode override for testing

Allows developers to test both UI modes using ?devCaddyMode=client
or ?devCaddyMode=developer query parameters.

Closes #123
```

### Pull Requests

1. Create a feature branch from `main`
2. Implement your changes following the development workflow
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description

## Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design and technical implementation
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guidelines and testing strategy
- **[SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)** - Database setup instructions
- **[TASKS.md](./docs/TASKS.md)** - MVP development task tracking
- **[CLAUDE.md](./CLAUDE.md)** - Guidance for AI assistants working in this repo

## Package Documentation

For npm package usage instructions, see:
- **[packages/README.md](./packages/README.md)** - Installation and usage guide

## Release Process

(To be documented when package is ready for publishing)

1. Update version in `packages/package.json`
2. Update CHANGELOG.md
3. Build and test
4. Publish to npm
5. Create GitHub release

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dev-caddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dev-caddy/discussions)
- **Documentation**: [docs/](./docs/)
