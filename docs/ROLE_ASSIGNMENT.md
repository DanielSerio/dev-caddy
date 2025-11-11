# DevCaddy Role Assignment Guide

This document explains how role-based permissions work in DevCaddy and how team leads should set up their team members.

---

## Overview

DevCaddy uses **Supabase Auth with JWT metadata** to distinguish between two types of users:

- **Developers**: Full access - can view, edit, and delete ALL annotations
- **Clients** (Reviewers): Limited access - can view ALL but only edit/delete their OWN annotations

The role is stored in the user's metadata and automatically included in their JWT token when they authenticate.

---

## How It Works

### 1. Complete Workflow (Team Lead Perspective)

```
Team lead creates all users in Supabase Dashboard
  ↓
Team lead assigns 'developer' role to appropriate users
  ↓
Team lead shares app URL with team
  ↓
User opens app and clicks DevCaddy toggle
  ↓
Email prompt appears → User enters their email
  ↓
Magic link sent to user's email
  ↓
User clicks magic link → Authenticated!
  ↓
JWT automatically includes their role (if set)
  ↓
Permissions applied based on role
  ↓
User only enters email ONCE (session persists)
```

### 2. JWT Structure

When a user authenticates, Supabase generates a JWT that includes their metadata:

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "app_metadata": {
    "role": "developer"  // ← This field determines permissions (SECURE - admin-only)
  },
  "user_metadata": {
    // Never use this for security! Users can edit this field.
  },
  "aud": "authenticated",
  "exp": 1234567890
}
```

### 3. RLS Policy Logic

The Row Level Security policies use this JWT to determine permissions:

```sql
-- Check if user has developer role
(auth.jwt()->'app_metadata'->>'role')::text = 'developer'

-- Check if user is a client (no role or different role)
COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') != 'developer'
```

**CRITICAL SECURITY NOTE:** We use `app_metadata` (NOT `user_metadata`) because:
- `app_metadata` is **READ-ONLY** for users (only writable via service role/admin)
- `user_metadata` is **USER-EDITABLE** and should NEVER be used for permissions
- This prevents users from giving themselves developer permissions via client code

---

## Setup Workflow for Team Leads

### Step 1: Create All Users Upfront

**Why upfront?** This allows you to assign roles BEFORE users authenticate, so they get the correct permissions immediately on first login. Users only need to enter their email once.

**Via Supabase Dashboard (Recommended):**

1. Open your Supabase project dashboard
2. Go to **Authentication** > **Users**
3. Click **Invite User** button
4. Enter each team member's email address:
   - `alice@company.com` (developer)
   - `bob@company.com` (developer)
   - `carol@company.com` (client/reviewer)
   - `david@company.com` (client/reviewer)
5. Repeat for all team members
6. Supabase creates user accounts (they don't receive emails yet)

**Via SQL Editor (For Bulk Creation):**

```sql
-- Create multiple users at once
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'alice@company.com',
    crypt('temporary-password-not-used', gen_salt('bf')),
    now(),
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'bob@company.com',
    crypt('temporary-password-not-used', gen_salt('bf')),
    now(),
    '{}',
    now(),
    now()
  );
-- Add more users as needed
```

**Note:** The SQL method is more complex. Dashboard method is recommended for most teams.

### Step 2: Assign Developer Roles

Now assign the `developer` role to team members who need full access.

**IMPORTANT:** The Supabase Dashboard does NOT provide a UI for editing `raw_app_meta_data`. You **must** use the SQL Editor.

**Via SQL Editor (ONLY Method):**

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New query**
4. Paste this SQL:

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

5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Verify the update worked:

```sql
SELECT email, raw_app_meta_data
FROM auth.users
WHERE email IN ('alice@company.com', 'bob@company.com');
```

You should see output like:
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

### Step 4: Verify Setup

After users authenticate, verify permissions are working:

1. Have a developer try to edit another user's annotation ✅ Should work
2. Have a client try to edit another user's annotation ❌ Should be blocked
3. Check that everyone can see all annotations ✅

---

## Permission Matrix

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

## Common Questions

### Q: What if I forgot to create a user upfront?

**A:** No problem! The user can still authenticate:

1. User enters their email in DevCaddy prompt
2. Supabase creates their account automatically
3. They get client permissions by default
4. If you want to make them a developer:
   - Find them in **Authentication** > **Users**
   - Add `{"role": "developer"}` to their `raw_app_meta_data` (NOT user_metadata)
   - They must sign out and back in to get the new role

### Q: What happens if I change a user's role while they're logged in?

**A:** The role in their JWT won't update until they authenticate again. To apply the change:

1. User should sign out (clear browser localStorage or wait for session expiry)
2. User signs in again
3. New JWT includes updated role

**Session expiry:** Default is 1 hour, configurable in Supabase settings.

### Q: How do I remove developer access from someone?

**Option A: Remove the role field entirely**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data - 'role'
WHERE email = 'former-dev@example.com';
```

**Option B: Change role to something else**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "client"}'::jsonb
WHERE email = 'former-dev@example.com';
```

Either approach gives them client permissions on next login.

### Q: Can I have other roles besides "developer"?

**A:** Currently, DevCaddy only recognizes `role: "developer"`. Any other value (or no role) is treated as a client.

If you need more granular permissions in the future:
1. Add new roles like `"admin"`, `"viewer"`, etc.
2. Update RLS policies in `packages/migrations/002_rls_policies.sql`
3. Re-run the migration

### Q: Can users see their own role in the UI?

**A:** Not in the current implementation. The role is used server-side by RLS policies.

If you want to show it in the UI:

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user } = useAuth();
  const role = user?.app_metadata?.role;  // Use app_metadata, not user_metadata
  const isDeveloper = role === 'developer';

  return <div>Mode: {isDeveloper ? 'Developer' : 'Client'}</div>;
}
```

**Note:** In the client code, `app_metadata` is read-only. Users cannot modify it.

### Q: What if a user tries to authenticate but wasn't created upfront?

**A:** Depends on your Supabase Auth settings:

**If "Enable email confirmations" is ON (default):**
- User enters email → Magic link sent
- User clicks link → Account created automatically
- They get client permissions (no role set)

**If you want to restrict to invited-only users:**
1. Go to **Authentication** > **Providers** > **Email**
2. Look for signup settings
3. Enable "Disable email signups" (if available)
4. Only manually created users can authenticate

**Recommendation:** Allow automatic signups for easier onboarding. Non-developers get client permissions by default, which is safe.

### Q: How secure is this approach?

**A:** Very secure:

- Magic links expire quickly (configurable, typically 10-60 minutes)
- JWTs are cryptographically signed by Supabase (cannot be forged)
- RLS policies run on the database server (cannot be bypassed from client)
- Role metadata is read-only from the client side
- Only authenticated users can access annotations
- Clients cannot escalate their own permissions

**Attack surface:** Compromising the Supabase project itself (requires admin credentials).

### Q: Do I need to configure email sending?

**A:** Supabase provides a built-in email service that works out of the box (with rate limits).

**For production:**
1. Go to **Authentication** > **Email Templates**
2. Customize the magic link email template
3. (Optional) Configure custom SMTP in **Settings** > **Auth** > **SMTP Settings**
4. Use your own email service (SendGrid, AWS SES, etc.) for better deliverability

---

## Troubleshooting

### User can't see "Edit" button on others' annotations

**Likely cause:** User doesn't have developer role assigned.

**Fix:**
```sql
-- Check user's metadata
SELECT email, raw_app_meta_data
FROM auth.users
WHERE email = 'user@example.com';

-- If role is missing, add it (use app_metadata for security)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'::jsonb
WHERE email = 'user@example.com';
```

User must sign out and back in to get new JWT with role.

### User has developer role but still can't edit others' annotations

**Likely causes:**

1. **RLS policies not applied**
   - Verify migration `002_rls_policies.sql` ran successfully
   - Check policies exist:
     ```sql
     SELECT * FROM pg_policies WHERE tablename = 'annotation';
     ```

2. **User hasn't re-authenticated after role assignment**
   - User needs to sign out and back in
   - Or wait for JWT to expire (default 1 hour)

3. **Role field in wrong format or wrong metadata field**
   - Check metadata structure:
     ```sql
     SELECT
       email,
       raw_app_meta_data->'role' as app_role,
       raw_user_meta_data->'role' as user_role
     FROM auth.users
     WHERE email = 'user@example.com';
     ```
   - `app_role` should show: `"developer"` (with quotes, as JSON string)
   - `user_role` should be NULL (we don't use this for security)

### Magic link emails not being sent

**Likely causes:**

1. **Email provider not configured**
   - Go to **Authentication** > **Providers** > **Email**
   - Verify email provider is enabled
   - Test with "Send Test Email" button

2. **Rate limits exceeded**
   - Supabase's built-in email has rate limits
   - Configure custom SMTP for higher limits

3. **Email in spam folder**
   - Check user's spam/junk folder
   - Customize email template to improve deliverability
   - Configure SPF/DKIM records if using custom SMTP

### User created but can't find them in Dashboard

**Solution:**
```sql
-- List all users with their roles
SELECT id, email, raw_app_meta_data, raw_user_meta_data, created_at
FROM auth.users
ORDER BY created_at DESC;
```

If user exists in database but not in Dashboard, try:
- Refresh the Dashboard page
- Check if you're looking at the correct Supabase project
- Verify Dashboard permissions (are you an admin?)

---

## Setup Checklist for Team Leads

**Before Team Uses DevCaddy:**
- [ ] Enable Supabase Auth in project settings
- [ ] Configure email provider (Supabase built-in or custom SMTP)
- [ ] Run migrations from `packages/migrations/` folder
- [ ] Create all team member accounts in Supabase Dashboard
- [ ] Assign `developer` role to appropriate team members
- [ ] Test with one developer account (can edit all annotations?)
- [ ] Test with one client account (can only edit own annotations?)
- [ ] Share access instructions with team
- [ ] (Optional) Customize magic link email template

**After Team Starts Using DevCaddy:**
- [ ] Monitor for authentication issues
- [ ] Add new team members as needed
- [ ] Update roles when team members change responsibilities

---

## Example: Setting Up a 5-Person Team

**Team:**
- Alice (Frontend Developer) → Developer role
- Bob (Backend Developer) → Developer role
- Carol (Designer) → Client role
- David (Product Manager) → Client role
- Eve (QA Engineer) → Client role

**Steps:**

1. **Create all users:**
   - Dashboard: **Authentication** > **Users** > **Invite User**
   - Enter each email: alice@company.com, bob@company.com, etc.
   - All 5 users now exist in Supabase

2. **Assign developer roles:**
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = '{"role": "developer"}'::jsonb
   WHERE email IN ('alice@company.com', 'bob@company.com');
   ```
   - Alice and Bob get developer role in `app_metadata` (secure, admin-only)
   - Carol, David, Eve remain without role (client permissions)

3. **Share instructions:**
   - Email team: "DevCaddy is ready! Open the app and click the toggle button."
   - Each person enters their email once
   - They click magic link → Authenticated with correct permissions

4. **Verify:**
   - Alice can edit Bob's annotations ✅
   - Carol can only edit her own annotations ✅
   - Everyone can see all annotations ✅

Done! Team is set up and ready to collaborate.

---

## Related Documentation

- [Supabase Auth Setup](./SUPABASE_SETUP.md) - Complete Supabase configuration guide
- [RLS Policies](../packages/migrations/002_rls_policies.sql) - Database security rules
- [Q&A Document](./Q&A.md) - Architectural decisions and rationale
