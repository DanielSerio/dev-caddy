# DevCaddy Simple Example

This example demonstrates how to integrate DevCaddy into a basic React + Vite application.

## What This Example Shows

- Basic DevCaddy plugin integration with Vite
- Environment variable configuration for Supabase
- Developer mode setup for local development
- Simple React application with DevCaddy annotation capabilities

## Prerequisites

Before running this example, you must:

1. Set up a Supabase project (see [Supabase Setup Guide](../../docs/SUPABASE_SETUP.md))
2. Run the database migrations from `packages/migrations/`
3. Configure your environment variables

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings.

### 3. Run the Example

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or next available port).

## Using DevCaddy in the Example

### Developer Mode (Default)

When running locally, DevCaddy operates in developer mode:

1. Open the application in your browser
2. The DevCaddy UI will be available
3. Click any element to create an annotation
4. View all annotations regardless of creator
5. Update and delete any annotation

### Testing Client Mode

To test client/reviewer mode:

1. Generate a magic link JWT token (manual process during MVP)
2. Add the token to your URL or configure your auth system
3. The UI will switch to client mode with limited permissions

## Project Structure

```
simple/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite type definitions
├── vite.config.ts           # Vite configuration with DevCaddy
├── package.json             # Dependencies
└── .env                     # Environment variables (create this)
```

## Key Configuration

The Vite configuration in `vite.config.ts` shows how to integrate DevCaddy:

The plugin is configured with environment-aware settings that enable DevCaddy in development mode.

## Learn More

- [DevCaddy Documentation](../../README.md)
- [Architecture Overview](../../docs/ARCHITECTURE.md)
- [Development Guide](../../docs/DEVELOPMENT.md)
- [Supabase Setup](../../docs/SUPABASE_SETUP.md)

## Troubleshooting

**DevCaddy UI not appearing:**
- Check that environment variables are set correctly
- Verify the plugin is enabled in `vite.config.ts`
- Check browser console for errors

**Cannot create annotations:**
- Verify Supabase connection is working
- Check that database migrations have been run
- Ensure RLS policies are configured correctly

**Type errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that `dev-caddy` types are available
