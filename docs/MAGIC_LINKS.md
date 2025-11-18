# Magic Link Authentication

Complete guide to understanding and implementing magic link authentication in DevCaddy.

---

## Table of Contents

1. [What Are Magic Links?](#what-are-magic-links)
2. [How DevCaddy Uses Magic Links](#how-devcaddy-uses-magic-links)
3. [Authentication Flow](#authentication-flow)
4. [Implementation Details](#implementation-details)
5. [Security Considerations](#security-considerations)
6. [Troubleshooting](#troubleshooting)
7. [Future: CLI Tool](#future-cli-tool)

---

## What Are Magic Links?

**Magic links** are passwordless authentication links sent to a user's email address. Instead of remembering and typing a password, users:

1. Enter their email address
2. Receive a time-limited link via email
3. Click the link to authenticate
4. Session persists with secure JWT tokens

**Benefits:**
- ✅ No passwords to remember or manage
- ✅ Reduces security risks (no password leaks)
- ✅ Better user experience (one click to authenticate)
- ✅ Built-in email verification
- ✅ Time-limited tokens (auto-expire for security)

---

## How DevCaddy Uses Magic Links

DevCaddy uses **Supabase Auth** for magic link authentication. The workflow is:

### Initial Setup (Team Lead)
1. Team lead creates Supabase users via SQL (see [SETUP.md](./SETUP.md))
2. Team lead assigns roles (`developer` or `client`) via `app_metadata`
3. Users are ready to authenticate

### User Authentication
1. User opens the application
2. DevCaddy UI shows authentication prompt
3. User enters their email address
4. Supabase sends magic link to their email
5. User clicks magic link
6. Supabase authenticates and redirects back to app
7. DevCaddy detects authenticated session
8. User sees appropriate UI based on role

### Session Persistence
- Session stored in browser's local storage
- Automatically restored on page refresh
- No need to re-authenticate until token expires
- Default expiration: 1 hour (configurable in Supabase)

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Opens App                                               │
│    ↓                                                             │
│    DevCaddy checks for existing session (useAuth hook)          │
│    ↓                                                             │
│    ┌─────────────┐           ┌──────────────┐                   │
│    │ Authenticated│          │ Not Authenticated │              │
│    └──────┬──────┘           └────────┬─────┘                   │
│           │                           │                          │
│           ↓                           ↓                          │
│    Show DevCaddy UI         Show AuthPrompt component           │
│    (based on role)                    │                          │
│                                       ↓                          │
│                         2. User Enters Email                     │
│                                       ↓                          │
│                         3. Supabase Sends Magic Link             │
│                                       ↓                          │
│                         4. User Clicks Link in Email             │
│                                       ↓                          │
│                         5. Supabase Validates Token              │
│                                       ↓                          │
│                         6. Redirect Back to App                  │
│                                       ↓                          │
│                         7. Session Established                   │
│                                       ↓                          │
│                         Show DevCaddy UI (based on role)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Code Location

**Authentication Hook:**
- File: `packages/src/ui/Core/hooks/useAuth.ts`
- Exports:
  - `useAuth()` - Hook for session management
  - `sendMagicLink(email, redirectTo?)` - Send magic link
  - `signOut()` - Sign out current user

**Authentication UI:**
- File: `packages/src/ui/Core/AuthPrompt.tsx`
- Component for email input and magic link sending

### Using the Authentication Hook

```typescript
import { useAuth, sendMagicLink } from 'dev-caddy';

function YourComponent() {
  const { user, isAuthenticated, loading, session } = useAuth();

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div>
      <p>Welcome {user.email}!</p>
      <p>Your role: {user.app_metadata?.role || 'client'}</p>
    </div>
  );
}
```

### Sending Magic Links Programmatically

```typescript
import { sendMagicLink } from 'dev-caddy';

async function handleSendLink() {
  try {
    await sendMagicLink('user@example.com');
    alert('Check your email for the magic link!');
  } catch (error) {
    alert('Failed to send magic link. Please try again.');
  }
}
```

### Custom Redirect URL

By default, magic links redirect back to the current URL. You can customize this:

```typescript
await sendMagicLink(
  'user@example.com',
  'https://staging.yourapp.com/welcome'
);
```

---

## Security Considerations

### Token Expiration
- Magic link tokens are **time-limited** (default: 1 hour)
- Expired tokens cannot be used to authenticate
- Configure expiration in Supabase Dashboard:
  - **Authentication** > **Settings** > **Auth Sessions**

### HTTPS Required
- Magic links **must** use HTTPS in production
- Supabase enforces this for security
- Local development uses HTTP (allowed for localhost)

### Email Verification
- Magic links serve as email verification
- If user receives link, they control that email address
- No separate verification step needed

### Role-Based Access Control (RBAC)
- User roles stored in `app_metadata` (admin-only field)
- Users cannot modify their own roles
- Only SQL queries by admins can change roles
- See [SETUP.md](./SETUP.md#role-assignment) for details

### Session Storage
- Sessions stored in browser's local storage
- Automatically cleared on sign out
- Cleared when token expires
- Use `signOut()` to manually clear session

---

## Troubleshooting

### Magic Link Not Arriving

**Check email spam folder:**
- Supabase emails may be flagged as spam
- Add `noreply@supabase.io` to safe senders

**Check Supabase email limits:**
- Free tier: Limited emails per hour
- Configure custom SMTP for production
- **Authentication** > **Settings** > **SMTP Settings**

**Check email provider settings:**
- Some providers block automated emails
- Test with different email address

### "Invalid or Expired Link" Error

**Possible causes:**
- Link expired (default: 1 hour)
- Link already used (one-time use)
- User not created in Supabase (see [SETUP.md](./SETUP.md))

**Solutions:**
- Request new magic link
- Verify user exists in **Authentication** > **Users**
- Check token expiration settings

### Wrong Permissions After Login

**Check user's `app_metadata`:**

```sql
-- Run in Supabase SQL Editor
SELECT
  email,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'user@example.com';
```

**Fix incorrect role:**

```sql
-- Run in Supabase SQL Editor (ADMIN ONLY)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"developer"'  -- or "client"
)
WHERE email = 'user@example.com';
```

### Session Not Persisting

**Check browser storage:**
- Ensure cookies enabled
- Ensure local storage enabled
- Clear browser cache and try again

**Check redirect URL:**
- Ensure redirect URL matches app URL
- Check for CORS issues

---

## Future: CLI Tool

**Status:** Planned for post-MVP

The DevCaddy CLI tool will automate magic link generation and user management:

```bash
# Create user and send magic link (future)
npx @devcaddy/cli user:add user@example.com --role developer

# List all users (future)
npx @devcaddy/cli user:list

# Update user role (future)
npx @devcaddy/cli user:update user@example.com --role client

# Delete user (future)
npx @devcaddy/cli user:delete user@example.com
```

### Why Not Now?

For MVP, we prioritize:
- ✅ Core functionality working end-to-end
- ✅ Clear manual setup documentation
- ✅ Security and stability

Manual SQL setup ensures:
- Explicit understanding of what's created
- Full control and visibility
- No hidden magic or service dependencies

The CLI tool will be added once the core product is stable and we understand real-world usage patterns.

---

## Additional Resources

- **Supabase Auth Documentation:** https://supabase.com/docs/guides/auth
- **Magic Link Deep Dive:** https://supabase.com/docs/guides/auth/auth-magic-link
- **DevCaddy Setup Guide:** [SETUP.md](./SETUP.md)
- **DevCaddy Implementation Decisions:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

## Summary

Magic links provide a secure, passwordless authentication experience for DevCaddy users:

1. **Team lead** creates users and assigns roles via SQL
2. **Users** authenticate by entering email and clicking magic link
3. **Sessions** persist automatically with secure JWT tokens
4. **Roles** control permissions (developer vs client)

No passwords, no friction, no security risks from password leaks.
