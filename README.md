# DevCaddy

DevCaddy is a Vite plugin that provides contextual in-app annotation capabilities for web applications. It enables reviewers to create, view, and manage annotations directly within the running application, streamlining the feedback and review process.

## Features

- **Dual Mode Operation**: Supports both client (reviewer) and developer modes with appropriate permissions
- **Direct Element Annotation**: Click any element in your application to create an annotation
- **Real-time Collaboration**: Built on Supabase for real-time annotation updates
- **Secure Access Control**: Magic link authentication for reviewers, full access for developers
- **Smart Element Selection**: Automatically generates robust selectors for annotated elements
- **Status Management**: Track annotation lifecycle through customizable status workflows

## Quick Start

### Installation

```bash
npm install dev-caddy
```

### Setup

1. Set up your Supabase project following the [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)

2. Configure environment variables:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Add the plugin to your Vite configuration:

```typescript
import devCaddy from 'dev-caddy'

export default defineConfig({
  plugins: [
    devCaddy({
      enabled: true,
      context: env
    })
  ]
})
```

### Usage

**Developer Mode** (default in development):
- Full access to all annotations
- Can view, create, update, and delete any annotation
- Access to admin features

**Client Mode** (magic link access):
- Create and manage own annotations
- View only annotations created by the user
- Limited to review functionality

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Supabase Setup](./docs/SUPABASE_SETUP.md)
- [About DevCaddy](./docs/ABOUT.md)
- [Package Documentation](./packages/README.md)

## Project Structure

```
v2-dev-caddy/
├── packages/              # Main package source
│   ├── src/              # TypeScript source files
│   ├── migrations/       # Database migration files
│   └── dist/             # Built package
├── examples/             # Example implementations
│   └── simple/          # Simple example app
└── docs/                # Documentation
```

## Development

For detailed development instructions, see [DEVELOPMENT.md](./docs/DEVELOPMENT.md).

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run example app
cd examples/simple
npm install
npm run dev
```

## Testing Strategy

DevCaddy uses a hybrid spec-driven and test-driven development approach:

- **Gherkin Specifications**: Define acceptance criteria
- **E2E Tests**: Validate behavior with Playwright
- **Test-Driven Development**: RED/GREEN/REFACTOR cycle for implementation

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for complete testing guidelines.

## Security

DevCaddy implements Row Level Security (RLS) through Supabase to ensure:
- Reviewers can only access their own annotations
- Developers have full access to all annotations
- All database operations are authenticated via JWT tokens

See [RLS Policies](./packages/migrations/002_rls_policies.sql) for implementation details.

## License

MIT

## Contributing

This is currently in MVP development. Contributions welcome after initial release.
