# DevCaddy

DevCaddy is a Vite plugin that enables **in-context design feedback** directly on live applications. It allows reviewers to click any UI element and leave annotations, while developers can manage feedback in real-time.

## Features

- **Dual Mode Operation**: Automatic switching between client (reviewer) and developer modes
- **Direct Element Annotation**: Click any element to create an annotation
- **Real-time Collaboration**: Built on Supabase for instant sync
- **Smart Element Selection**: Automatically generates robust selectors
- **Status Management**: Track annotation lifecycle (new, in-progress, resolved, etc.)
- **Secure Access Control**: Row Level Security with JWT authentication

## Installation

```bash
npm install dev-caddy
```

## Quick Start

### 1. Set up Supabase

You'll need a Supabase project with the DevCaddy tables.

**Option A: Use the Bundle Script (Easiest)**

If you have the DevCaddy source/repo:

```bash
# From DevCaddy repo root
npm run migrations:bundle

# This creates: devcaddy-migrations.sql
# Copy this file to Supabase SQL Editor and run
```

**Option B: Manual SQL Files**

Copy the SQL from these files into your Supabase SQL Editor:
- `node_modules/dev-caddy/migrations/001_initial_schema.sql`
- `node_modules/dev-caddy/migrations/002_rls_policies.sql`

**What This Creates:**
- `annotation_status` table (5 statuses: new, in-progress, in-review, hold, resolved)
- `annotation` table (stores all annotations)
- Row Level Security policies
- Indexes and triggers

See [Supabase Setup Guide](../docs/SUPABASE_SETUP.md) for detailed instructions.

### 2. Configure Environment Variables

Create a `.env` file in your project:

```bash
VITE_DEV_CADDY_SUPABASE_URL=https://your-project.supabase.co
VITE_DEV_CADDY_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Use the `DEV_CADDY_` prefix to avoid conflicts with your own Supabase configuration.

### 3. Add Vite Plugin

Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { DevCaddyPlugin } from 'dev-caddy';

export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: true,
    })
  ],
}));
```

### 4. Import CSS

In your app entry point (e.g., `main.tsx`):

```typescript
import 'dev-caddy/dev-caddy.css';
```

### 5. Initialize DevCaddy Client

In your app entry point:

```typescript
import { initDevCaddy } from 'dev-caddy';

initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEV_CADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY,
});
```

## Usage

### Developer Mode (Default in Development)

When running `npm run dev`, DevCaddy operates in developer mode:

- View all annotations from all users
- Filter by status, author, date
- Edit and delete any annotation
- Manage annotation workflow

### Client Mode (Reviewer Access)

When running `vite serve --mode production`, DevCaddy operates in client mode:

- View only your own annotations
- Create new annotations
- Mark annotations as resolved
- Delete your own annotations

### Creating Annotations

1. Open DevCaddy using the toggle button
2. Click "Add Annotation"
3. Click any element on your page
4. Enter your feedback in the popover
5. Submit

The annotation is saved to Supabase and syncs in real-time to all connected users.

## Configuration

### Plugin Options

```typescript
DevCaddyPlugin({
  enabled: boolean,       // Whether DevCaddy is active
  context: ConfigEnv,     // Vite configuration context (required)
  debug?: boolean,        // Enable verbose logging (optional)
})
```

### Environment Variables

**Required:**
- `VITE_DEV_CADDY_SUPABASE_URL` - Your DevCaddy Supabase project URL
- `VITE_DEV_CADDY_SUPABASE_ANON_KEY` - Your DevCaddy Supabase anonymous key

**Note:**
- Use `DEV_CADDY_` prefix to avoid conflicts with your app's own Supabase instance
- Never use service role keys in client environment variables

## UI Modes

DevCaddy automatically detects the environment and shows the appropriate UI:

| Vite Config | UI Mode | Description |
|-------------|---------|-------------|
| `mode: 'development'` + `command: 'serve'` | Developer | Full access to all annotations |
| `mode: 'production'` + `command: 'serve'` | Client | Limited to own annotations |
| `command: 'build'` | None | DevCaddy disabled |

### Testing Different Modes

During development, override the mode using query parameters:

```bash
http://localhost:5173?devCaddyMode=client      # Test client mode
http://localhost:5173?devCaddyMode=developer   # Test developer mode
```

## How It Works

DevCaddy automatically injects its UI into your application. **You don't need to build any annotation functionality yourself** - the plugin provides everything:

### What's Included

✅ **Complete UI** - Toggle button, annotation panel, and element selection
✅ **Automatic Mode Detection** - Switches between developer and client modes
✅ **Real-time Sync** - All annotations update instantly across users
✅ **Element Selection** - Click any element to annotate it
✅ **Status Management** - Built-in workflow (new → in-progress → resolved)

### What You Need to Provide

The only things you need to configure:

1. **Supabase Database** - For storing annotations (one-time setup)
2. **Environment Variables** - Connect to your Supabase project
3. **Plugin Configuration** - Add to `vite.config.ts`
4. **Initialization** - One `initDevCaddy()` call in your entry file

That's it! DevCaddy handles all annotation creation, editing, deletion, and synchronization automatically through its built-in UI.

## Advanced: Programmatic API

> **Note:** Most users don't need this section. The DevCaddy UI handles all annotation operations automatically.

If you need to integrate annotation functionality into your own UI or workflow, DevCaddy exports low-level functions:

```typescript
import {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationsByPage,
  subscribeToAnnotations,
} from 'dev-caddy';

// These are used internally by the DevCaddy UI
// Only use these if you're building custom annotation features
```

See the source code documentation for complete API details.

## TypeScript Support

DevCaddy is written in TypeScript and includes full type definitions. Your editor will provide autocomplete and type checking automatically when using `initDevCaddy()` and other exports.

## Security

DevCaddy uses Supabase Row Level Security (RLS) to ensure:

- **Reviewers** can only access their own annotations
- **Developers** have full access to all annotations
- All operations require JWT authentication
- Service role keys never exposed to client

See [Architecture Documentation](../docs/ARCHITECTURE.md) for security details.

## Documentation

- [Supabase Setup Guide](../docs/SUPABASE_SETUP.md) - Complete database setup instructions
- [Architecture Overview](../docs/ARCHITECTURE.md) - System design and technical details
- [Development Guide](../docs/DEVELOPMENT.md) - Contributing and testing guidelines
- [About DevCaddy](../docs/ABOUT.md) - Project overview and use cases

## Troubleshooting

**DevCaddy UI not appearing:**
- Verify `enabled: true` in plugin options
- Check that environment variables are set correctly
- Check browser console for initialization errors

**Cannot create annotations:**
- Verify Supabase connection with browser DevTools Network tab
- Ensure database migrations have been run
- Check that RLS policies are configured correctly

**Type errors:**
- Make sure you're importing from `'dev-caddy'` not `'dev-caddy/dist'`
- Run `npm install` to ensure all dependencies are installed

## Examples

See [examples/simple](../examples/simple) for a complete working example.

## License

MIT

## Support

For issues and questions:
- [GitHub Issues](https://github.com/yourusername/dev-caddy/issues)
- [Documentation](../docs/)
