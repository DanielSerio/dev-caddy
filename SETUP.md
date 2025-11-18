# DevCaddy Setup Guide

Complete guide for setting up Supabase, running migrations, and assigning user roles.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Running Migrations](#running-migrations)
4. [Role Assignment](#role-assignment)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

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

## Supabase Project Setup

### Step 1: Create or Access Project

1. Log into Supabase Dashboard
2. Create new project or select existing one
3. Wait for project provisioning to complete
4. Note your project URL and API keys from **Settings** > **API**

### Step 2: Enable Supabase Auth

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - Use Supabase's built-in email service (with rate limits)
   - Or configure custom SMTP for production use
4. (Optional) Customize magic link email template in **Authentication** > **Email Templates**

### Step 3: Locate Migration Files

Migration files are in your DevCaddy package:
```
packages/migrations/
├── 001_initial_schema.sql
└── 002_rls_policies.sql
```

---

## Running Migrations

### Option A: Supabase Dashboard (Easiest)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in left sidebar
3. Click **New query**
4. Copy entire contents of `001_initial_schema.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Repeat for `002_rls_policies.sql`

### Option B: Supabase CLI (Recommended for Teams)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
psql $DATABASE_URL -f packages/migrations/001_initial_schema.sql
psql $DATABASE_URL -f packages/migrations/002_rls_policies.sql
```

### Step 4: Verify Tables

Check that the `annotation` table exists:

**Via Dashboard:**
- Navigate to **Table Editor**
- Look for `annotation` table

**Via SQL:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'annotation';
```

### Step 5: Verify RLS Policies

Check that policies are applied:

1. Navigate to **Authentication** > **Policies** in dashboard
2. Verify 6 policies exist for `annotation` table:
   - `authenticated_users_can_insert_annotations`
   - `users_can_view_all_annotations`
   - `developers_can_update_any_annotation`
   - `clients_can_update_own_annotations`
   - `developers_can_delete_any_annotation`
   - `clients_can_delete_own_annotations`

**Via SQL:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'annotation';
```

### Step 6: Enable Realtime

Enable Realtime for real-time annotation sync:

1. Navigate to **Database** > **Replication** in dashboard
2. Find `annotation` table in the list
3. Toggle **Realtime** to enabled
4. Click **Save**

---

## Role Assignment

### Overview

DevCaddy uses **Supabase Auth with app metadata** for role-based permissions:

- **Developers**: Full access - can view/edit/delete ALL annotations
- **Clients** (Reviewers): Limited access - can view ALL but only edit/delete OWN annotations

**Security:** Roles are stored in `app_metadata` which is **admin-only** and can only be modified via SQL Editor (not editable by users).

### Complete Workflow

```
Team Lead Setup:
├─ Step 1: Create all users in Dashboard (Auth > Users > Invite User)
├─ Step 2: Assign 'developer' role via SQL Editor
└─ Step 3: Share app URL with team

User Experience:
├─ Step 1: Opens app → clicks DevCaddy toggle
├─ Step 2: Enters email → receives magic link
├─ Step 3: Clicks magic link → authenticated!
└─ Session persists (users only authenticate ONCE)
```

### Step 1: Create All Users Upfront

**Why upfront?** This allows you to assign roles BEFORE users authenticate, so they get correct permissions immediately on first login.

**Via Supabase Dashboard:**

1. Open your Supabase project dashboard
2. Go to **Authentication** > **Users**
3. Click **Invite User** button
4. Enter each team member's email address:
   - `alice@company.com` (developer)
   - `bob@company.com` (developer)
   - `carol@company.com` (client/reviewer)
5. Repeat for all team members
6. Supabase creates user accounts (they don't receive emails yet)

### Step 2: Assign Developer Roles

**IMPORTANT:** Supabase Dashboard does NOT provide a UI for editing `app_metadata`. You MUST use SQL Editor.

**Via SQL Editor (ONLY Method):**

1. Open Supabase Dashboard > **SQL Editor** > **New query**
2. Paste this SQL:

```sql
-- Assign developer role to a single user
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'::jsonb
WHERE email = 'alice@company.com';

-- OR assign to multiple users at once (recommended for teams)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'::jsonb
WHERE email IN (
  'alice@company.com',
  'bob@company.com',
  'charlie@company.com'
);
```

3. Click **Run** (or press Ctrl/Cmd + Enter)
4. Verify the update worked:

```sql
SELECT email, raw_app_meta_data
FROM auth.users
WHERE email IN ('alice@company.com', 'bob@company.com');
```

Expected output:
```
email               | raw_app_meta_data
--------------------+------------------------
alice@company.com   | {"role": "developer"}
bob@company.com     | {"role": "developer"}
```

**Important Notes:**
- `raw_app_meta_data` can ONLY be edited via SQL (service role access)
- This is intentional for security - prevents users from editing their own roles
- Never use `raw_user_meta_data` for permissions (user-editable, insecure)
- Leave client/reviewer users WITHOUT a role (absence of role = client permissions)

### Step 3: Share Access Instructions

Send these instructions to your team:

```
DevCaddy is now set up for our project!

To access it:
1. Open [your app URL here]
2. Click the DevCaddy toggle button (bottom-right corner)
3. Enter your email address: [their email]
4. Check your email for a magic link
5. Click the magic link - you're in!

Your session will persist, so you only need to do this once.

Questions? Contact [your name]
```

### Step 4: Verify Permissions

After users authenticate, verify permissions work correctly:

1. Have a developer try to edit another user's annotation ✅ Should work
2. Have a client try to edit another user's annotation ❌ Should be blocked
3. Check that everyone can see all annotations ✅

### Permission Matrix

| Action                     | Developer Role | Client (No Role) |
|----------------------------|----------------|------------------|
| View all annotations       | ✅             | ✅               |
| Create annotations         | ✅             | ✅               |
| Edit own annotations       | ✅             | ✅               |
| Edit others' annotations   | ✅             | ❌               |
| Delete own annotations     | ✅             | ✅               |
| Delete others' annotations | ✅             | ❌               |
| Change annotation status   | ✅ (any)       | ✅ (own only)    |

---

## Environment Configuration

### Application Configuration

Create `.env` file in your project root:

```bash
# DevCaddy Configuration
VITE_DEV_CADDY_ENABLED=true
VITE_DEV_CADDY_SUPABASE_URL=https://your-project.supabase.co
VITE_DEV_CADDY_SUPABASE_ANON_KEY=your-anon-key-here
```

### Initialize DevCaddy Client

In your app's entry point (`src/main.tsx` or `App.tsx`):

```typescript
import { initDevCaddy } from 'dev-caddy';

initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEV_CADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY,
});

// Then render your app
```

### Security Notes

- **Anon key is safe** for client-side use (protected by RLS)
- **Service role key** should ONLY be in `.env.local` for setup/CLI tools
- **Never commit** service role key to version control
- Add `.env.local` to `.gitignore`

---

## Troubleshooting

### Common Questions

#### Q: What if I forgot to create a user upfront?

**A:** No problem! The user can still authenticate:

1. User enters their email in DevCaddy prompt
2. Supabase creates their account automatically
3. They get client permissions by default
4. If you want to make them a developer:
   - Find them in **Authentication** > **Users**
   - Add `{"role": "developer"}` to their `raw_app_meta_data` via SQL
   - They must sign out and back in to get the new role

#### Q: How do I change a user's role while they're logged in?

**A:** Role changes in `app_metadata` won't take effect until they authenticate again:

1. Update their role via SQL Editor
2. User must sign out (clear browser localStorage) or wait for session to expire
3. User signs in again → new JWT includes updated role

**Session expiry:** Default is 1 hour (configurable in Supabase settings)

#### Q: How do I remove developer access from someone?

**Remove the role field:**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data - 'role'
WHERE email = 'former-dev@example.com';
```

**Or change it:**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "client"}'::jsonb
WHERE email = 'former-dev@example.com';
```

### Debugging Issues

#### Annotations Not Appearing

**Check:**
1. RLS policies are correctly configured: `SELECT * FROM pg_policies WHERE tablename = 'annotation';`
2. Realtime is enabled on `annotation` table (Database > Replication)
3. User is authenticated: Check `supabase.auth.getSession()` returns a session
4. Browser console for errors

#### Permission Denied Errors

**Check:**
1. RLS policies exist and are enabled
2. User has authenticated (check session exists)
3. Using anon key (not service role key) in client code
4. Role is set correctly in `app_metadata` if user should be a developer

#### User Can't Edit Others' Annotations (Should Be Developer)

**Check:**
1. Role is assigned:
   ```sql
   SELECT email, raw_app_meta_data
   FROM auth.users
   WHERE email = 'user@example.com';
   ```
2. Role is in `app_metadata` (not `user_metadata`)
3. User has signed out and back in after role assignment
4. RLS policies are checking `auth.jwt()->'app_metadata'->>'role'`

#### Realtime Updates Not Working

**Check:**
1. Realtime replication is enabled for `annotation` table
2. Supabase client is properly initialized with `initDevCaddy()`
3. Subscription channel matches page URL
4. No network/firewall blocking WebSocket connections
5. Browser console for WebSocket errors

#### Magic Link Emails Not Being Sent

**Check:**
1. Email provider is enabled: **Authentication** > **Providers** > **Email**
2. SMTP settings configured (if using custom SMTP)
3. Test with "Send Test Email" button in dashboard
4. Check spam/junk folder
5. Supabase email rate limits not exceeded

---

## Setup Checklist

### Team Lead Setup (One-time)

- [ ] Create Supabase project
- [ ] Enable Supabase Auth (Email provider)
- [ ] Run migration `001_initial_schema.sql`
- [ ] Run migration `002_rls_policies.sql`
- [ ] Verify tables and policies exist
- [ ] Enable Realtime on `annotation` table
- [ ] Create all team member user accounts
- [ ] Assign developer roles via SQL
- [ ] Test with one developer account (can edit all annotations?)
- [ ] Test with one client account (can only edit own annotations?)
- [ ] Configure environment variables in project
- [ ] Initialize DevCaddy in app entry point
- [ ] Share app URL and access instructions with team

### User Setup (One-time per user)

- [ ] Receive app URL from team lead
- [ ] Open app and click DevCaddy toggle
- [ ] Enter email address
- [ ] Check email for magic link
- [ ] Click magic link → authenticated!
- [ ] Verify can create annotations
- [ ] Session persists on refresh

---

## Example: 5-Person Team Setup

**Team:**
- Alice (Frontend Dev) → Developer role
- Bob (Backend Dev) → Developer role
- Carol (Designer) → Client role
- David (PM) → Client role
- Eve (QA) → Client role

**Steps:**

1. **Create all users** via Dashboard: **Authentication** > **Users** > **Invite User**
   - Enter each email: alice@company.com, bob@company.com, etc.

2. **Assign developer roles** via SQL Editor:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = '{"role": "developer"}'::jsonb
   WHERE email IN ('alice@company.com', 'bob@company.com');
   ```

3. **Share instructions**: "DevCaddy is ready! Click the toggle and enter your email."

4. **Verify**:
   - Alice can edit Bob's annotations ✅
   - Carol can only edit her own annotations ✅
   - Everyone can see all annotations ✅

---

## Next Steps

After completing setup:

1. Users authenticate via magic link (one time)
2. Start creating annotations on UI elements
3. Developers triage and resolve feedback
4. Real-time sync keeps everyone in sync

For development guidelines, see **IMPLEMENTATION.md**.
For project overview, see **README.md**.
