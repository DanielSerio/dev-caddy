# Example App Setup

This example app demonstrates DevCaddy integration. Follow these steps to get it running.

## Prerequisites

You must set up a Supabase database before running this example.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Note your project URL and anon key

## Step 2: Run Database Migrations

You need to create the `annotation` and `annotation_status` tables in your Supabase database.

### Option A: Bundle Script (Recommended - Easiest!)

1. From the **root directory**, run:
   ```bash
   npm run migrations:bundle
   ```

2. This creates a file: `devcaddy-migrations.sql` (single file with all migrations)

3. Open your Supabase project dashboard

4. Go to **SQL Editor** → **New Query**

5. Open `devcaddy-migrations.sql`, copy all contents, and paste into SQL Editor

6. Click **Run** (or press Ctrl/Cmd + Enter)

7. You should see: "Success. No rows returned"

**That's it!** One command, one copy-paste. Much easier than copying multiple files!

### Option B: Manual Migration Files

If you prefer to run each migration separately:

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `../../packages/migrations/001_initial_schema.sql`
4. Click **Run**
5. Create another new query
6. Copy and paste the contents of `../../packages/migrations/002_rls_policies.sql`
7. Click **Run**

### Option C: Supabase CLI (Advanced)

```bash
# From the root directory
cd packages/migrations

# Login to Supabase
npx supabase login

# Link to your project (get project ref from dashboard URL)
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```bash
   VITE_DEV_CADDY_ENABLED=true
   VITE_DEV_CADDY_SUPABASE_URL=https://your-project.supabase.co
   VITE_DEV_CADDY_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from:
   - Dashboard → Settings → API
   - Project URL
   - Project API keys → anon public

## Step 4: Install Dependencies

From the **root directory**:

```bash
npm install
```

This installs all workspace dependencies.

## Step 5: Run the Example

From the **root directory**:

```bash
# Developer mode (full access)
npm run dev:developer

# Client mode (limited access)
npm run dev:client

# Or just dev (developer mode by default)
npm run dev
```

Your browser should open automatically to `http://localhost:5173`

## Step 6: Test DevCaddy

1. Click the DevCaddy toggle button (bottom-left corner)
2. DevCaddy window should open
3. Click "Add Annotation"
4. Click any element on the page
5. Enter annotation text in the popover
6. Submit

The annotation should be saved to your Supabase database!

## Troubleshooting

### Error: "GET .../annotation?... 404 (Not Found)"

**Cause:** Database migrations haven't been run.

**Solution:** Follow Step 2 above to create the tables.

### Error: "DevCaddy has not been initialized"

**Cause:** Missing or incorrect environment variables.

**Solution:**
1. Check `.env` file exists
2. Verify `VITE_DEV_CADDY_SUPABASE_URL` and `VITE_DEV_CADDY_SUPABASE_ANON_KEY` are set
3. Restart dev server after changing `.env`

### Error: "Failed to create annotation"

**Cause:** RLS policies not configured or permissions issue.

**Solution:**
1. Ensure `002_rls_policies.sql` was run
2. Check Supabase logs: Dashboard → Logs → Postgres
3. Verify JWT token is being sent (check Network tab)

### DevCaddy UI not appearing

**Cause:** Plugin not enabled or environment issue.

**Solution:**
1. Check `VITE_DEV_CADDY_ENABLED=true` in `.env`
2. Verify browser console for errors
3. Check that `initDevCaddy()` is called in `main.tsx`

## Verify Setup

To verify everything is working:

1. Open browser DevTools → Network tab
2. Toggle DevCaddy on
3. Look for requests to `https://your-project.supabase.co/rest/v1/annotation`
4. Should see 200 status (not 404)
5. Click "Add Annotation" and select an element
6. Should see POST request to create annotation
7. Check Supabase Dashboard → Table Editor → annotation
8. Your annotation should appear in the table!

## Next Steps

- See [../../packages/README.md](../../packages/README.md) for package usage
- See [../../docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for development guidelines
- See [../../docs/SUPABASE_SETUP.md](../../docs/SUPABASE_SETUP.md) for detailed database setup
