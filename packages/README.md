# DevCaddy Package

DevCaddy is a Vite plugin that enables **in-context design feedback** directly on live applications during prototyping and staging.

## Overview

This package provides:

- **Vite Plugin** — Environment-aware plugin that auto-detects context
- **React UI Components** — Reviewer and Developer mode interfaces
- **TypeScript Support** — Full type definitions included

## Installation

```bash
npm install dev-caddy
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { DevCaddyPlugin } from 'dev-caddy';

export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: process.env.VITE_DEV_CADDY_ENABLED === 'true',
    })
  ],
}));
```

Import the CSS in your app:

```typescript
import 'dev-caddy/dev-caddy.css';
```

Initialize DevCaddy client (in your main.tsx or app entry):

```typescript
import { initDevCaddy } from 'dev-caddy/client';

initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY,
});
```

## Configuration

### Environment Variables

Create a `.env` file in your project:

```bash
VITE_DEVCADDY_ENABLED=true
VITE_DEVCADDY_SUPABASE_URL=https://your-project.supabase.co
VITE_DEVCADDY_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Service role keys should NEVER be in client environment variables. They are only used for CLI tools (magic link generation).

### Plugin Options

- `enabled: boolean` - Whether DevCaddy is active
- `context: ConfigEnv` - Vite configuration context (required)
- `debug?: boolean` - Enable verbose logging (optional)

## Development

### Building

```bash
npm run build       # Full build: TypeScript + SCSS + Vite
npm run build:scss  # Only compile SCSS to CSS
```

### Development

```bash
npm run dev         # Start Vite dev server
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

## Testing Strategy

DevCaddy uses a **hybrid spec-driven + test-driven development approach**:

### For User-Facing Features

1. Write **Gherkin specs** (Given/When/Then) in `specs/` directory
2. Convert to **Playwright E2E tests**
3. Implement using **TDD** (RED/GREEN/REFACTOR)

### For Internal Utilities

1. Write **integration tests** that validate behavior in context
2. Use **TDD** for implementation
3. **No unit tests** — focus on real behavior

### Tools

- **Playwright** — E2E tests for annotation flows
- **Storybook** — Component visual regression testing
- **Supabase CLI** — Local database testing

See [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) for detailed testing guidelines.

## Architecture

See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for system architecture details.

## Contributing

DevCaddy follows these core principles:

1. Prefer simplicity over cleverness
2. Follow SOLID principles
3. Keep `.ts` and `.tsx` files under 250 lines
4. Use hybrid spec-driven + test-driven development
5. No unit tests — focus on integration/E2E tests
6. Avoid mocking in tests

## License

MIT
