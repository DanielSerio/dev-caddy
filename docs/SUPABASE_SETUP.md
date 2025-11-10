# Supabase Setup Guide

This guide covers how to set up the Supabase database schema and Row Level Security (RLS) policies required for DevCaddy.

---

## Overview

DevCaddy requires a Supabase project with:
- Database tables for annotations and annotation statuses
- Row Level Security (RLS) policies for access control
- Realtime subscriptions enabled on annotation tables

---

## Setup Approach

### Current: Manual Setup (Phase 1)

DevCaddy provides SQL migration files that you run manually in your Supabase project. This approach:

- **Security:** No risk of exposing service role keys in client code
- **Control:** You maintain full visibility into what's created in your database
- **Simplicity:** Package focuses on UI/annotations, not infrastructure management
- **Explicit:** Clear separation between package functionality and database setup

### Future: CLI Tool (Phase 2)

A future `@devcaddy/cli` package will automate setup:
```bash
npx @devcaddy/cli setup
```

This CLI tool will:
- Read service role key from local `.env.local` (never bundled with client)
- Run migrations automatically against your Supabase project
- Verify RLS policies are correctly configured
- Seed default annotation status records

---

## Prerequisites

Before setting up DevCaddy, you need:

1. **Supabase Account:** Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project:** Create a new project or use an existing one
3. **Project Credentials:** Note your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (safe for client-side use)
   - Service Role Key (for setup only, never expose to client)

---

## Setup Steps

### Step 1: Locate Migration Files

Migration files are located in:
```
packages/migrations/
├── 001_initial_schema.sql
└── 002_rls_policies.sql
```

### Step 2: Run Migrations

**Option A: Supabase Dashboard (Easiest)**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy contents of `001_initial_schema.sql`
5. Click **Run**
6. Repeat for `002_rls_policies.sql`

**Option B: Supabase CLI (Recommended for Teams)**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or apply specific migration
psql $DATABASE_URL -f packages/migrations/001_initial_schema.sql
```

### Step 3: Verify Tables Created

Check that the following tables exist:
- `annotation_status`
- `annotation`

You can verify in:
- Supabase Dashboard → **Table Editor**
- Or run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

### Step 4: Verify RLS Policies

Check that RLS is enabled and policies exist:

1. Navigate to **Authentication** → **Policies** in Supabase Dashboard
2. Verify policies for `annotation` and `annotation_status` tables
3. Ensure policies differentiate between `reviewer` and `developer` JWT types

### Step 5: Enable Realtime

Enable Realtime for the `annotation` table:

1. Navigate to **Database** → **Replication** in Supabase Dashboard
2. Find `annotation` table
3. Enable **Realtime** toggle
4. Click **Save**

---

## Schema Overview

### Tables

**`annotation_status`**
- Stores possible annotation statuses (new, in-progress, in-review, hold, resolved)
- Pre-populated with default status records

**`annotation`**
- Stores annotation records with element selector information
- Links to `annotation_status` via foreign key
- Tracks page URL, element details, content, and resolution timestamp

See `docs/schema.dbml` for complete schema definition.

---

## Row Level Security (RLS)

### Policy Design

DevCaddy uses JWT claims to differentiate between user types:

**Reviewer (Client Mode):**
- JWT claim: `type = 'reviewer'`
- Permissions: INSERT only (create annotations)
- Can view and modify their own annotations

**Developer (Developer Mode):**
- JWT claim: `type = 'developer'`
- Permissions: Full CRUD access
- Can view, modify, and delete all annotations

### Policy Implementation

RLS policies check `auth.jwt()->>'type'` to determine access level:

- **INSERT policy:** Allows reviewers to create annotations
- **SELECT policy:** Reviewers see own annotations, developers see all
- **UPDATE policy:** Reviewers can update own annotations, developers can update all
- **DELETE policy:** Only developers can delete annotations

---

## Environment Variables

After setup, configure your application with:

```bash
# .env
VITE_DEVCADDY_ENABLED=true
VITE_DEVCADDY_SUPABASE_URL=https://your-project.supabase.co
VITE_DEVCADDY_SUPABASE_ANON_KEY=your-anon-key

# .env.local (NEVER commit to version control)
DEVCADDY_JWT_SECRET=your-jwt-secret
DEVCADDY_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Security Notes:**
- Anon key is safe for client-side use (protected by RLS)
- Service role key should ONLY be in `.env.local` for CLI tools
- Never commit service role key to version control
- Add `.env.local` to `.gitignore`

---

## Troubleshooting

### Annotations Not Appearing

**Check:**
1. RLS policies are correctly configured
2. Realtime is enabled on `annotation` table
3. JWT token includes correct `type` claim
4. User has proper permissions based on mode

### Permission Denied Errors

**Check:**
1. RLS policies exist and are enabled
2. JWT claim `type` matches expected value (`reviewer` or `developer`)
3. Anon key (not service role key) is used in client code

### Realtime Updates Not Working

**Check:**
1. Realtime replication is enabled for `annotation` table
2. Supabase client is properly initialized with `createClient()`
3. Subscription channel matches normalized page URL
4. No network/firewall blocking WebSocket connections

---

## Migration Strategy for Existing Projects

If you're adding DevCaddy to an existing Supabase project:

1. **Review schema conflicts:** Ensure no existing tables named `annotation` or `annotation_status`
2. **Namespace if needed:** Consider prefixing tables with `devcaddy_` to avoid conflicts
3. **Test in staging first:** Run migrations on staging environment before production
4. **Backup database:** Always backup before running migrations

---

## Uninstalling

To remove DevCaddy schema from your Supabase project:

1. Drop tables:
   ```sql
   DROP TABLE IF EXISTS annotation CASCADE;
   DROP TABLE IF EXISTS annotation_status CASCADE;
   ```

2. Remove RLS policies (automatically dropped with CASCADE)

3. Disable Realtime on dropped tables (automatic)

**Warning:** This will permanently delete all annotation data. Export annotations first if needed.

---

## Next Steps

After completing Supabase setup:

1. Configure environment variables in your application
2. Initialize DevCaddy client with `initDevCaddy()`
3. Generate magic links for reviewers (see `docs/MAGIC_LINKS.md`)
4. Start annotating!

For questions or issues, refer to:
- `docs/ARCHITECTURE.md` - Technical implementation details
- `docs/DEVELOPMENT.md` - Development guidelines
- `docs/Q&A.md` - Implementation decisions
