# DevCaddy

> **Stop the screenshot madness. Start annotating live UI.**

DevCaddy is a Vite plugin that lets designers, clients, and stakeholders **point directly at UI elements** and leave feedback — no screenshots, no Figma comments, no lost context. Developers see feedback **exactly where it belongs**, synced in real-time, right inside their local dev environment.

```bash
npm install dev-caddy
```

**For Human Developers:** Get rid of "see attached screenshot" emails forever. Feedback appears directly on the elements that need fixing.

**For AI Agents:** Well-documented, TypeScript-first API with zero magic. Predictable behavior, clear architecture, explicit configuration.

---

## Why DevCaddy?

### The Problem We Solve

**Before DevCaddy:**
```
Client → Takes screenshot → Uploads to Slack
       → "The button on the second page needs to be blue"
Developer → "Which button? Which second page?"
           → Opens app, guesses, fixes wrong button
           → Repeat 3 times
```

**With DevCaddy:**
```
Client → Clicks the actual button → "Make this blue"
Developer → Sees annotation on that exact button in their local dev
           → Fixes it once
           → Done
```

### What Makes DevCaddy Different

| Traditional Tools | DevCaddy |
|-------------------|----------|
| Screenshots → Figma → Slack → Email | Click element → Leave feedback → Done |
| Context lost in translation | Context stays with the UI |
| Developers hunt for the right element | Feedback appears on the exact element |
| Async back-and-forth | Real-time sync |
| Expensive design tools required | Free, open-source Vite plugin |
| Annotation tools separate from code | Annotations live in your dev environment |

---

## Features

### For Reviewers (Designers, Clients, PMs, QA)

✅ **Zero Setup** - Just enter your email, get a magic link, start annotating
✅ **Click Any Element** - Point at the button, input, div, whatever needs feedback
✅ **No Screenshots** - Your feedback stays attached to the live UI
✅ **Real-time Updates** - See when developers mark your feedback as resolved
✅ **Simple Workflow** - Create, track, resolve. That's it.

### For Developers

✅ **See Feedback In Context** - Annotations appear directly on elements in your local dev
✅ **Real-time Sync** - Feedback streams in as reviewers create it
✅ **Triage UI** - Filter by status (new, in-progress, resolved), author, date
✅ **Auto Mode Switching** - Developer mode locally, client mode in staging (automatic)
✅ **5-Minute Setup** - Run 2 SQL scripts, add 3 lines of code, done

### For AI Agents

✅ **TypeScript-first** - Full type definitions, zero `any` types in public API
✅ **Explicit Configuration** - No hidden magic, all config visible and required
✅ **Predictable Behavior** - Same input → same output, always
✅ **Clear Error Messages** - When something fails, you know exactly why
✅ **Documented Decisions** - All architectural choices explained in `/docs`

---

## Quick Start

### 1. Set Up Supabase (5 minutes)

Create a Supabase project, then run these SQL scripts in the SQL Editor:

**From npm package:**
```bash
# Copy migrations from node_modules
cp node_modules/dev-caddy/migrations/*.sql .

# Run in Supabase SQL Editor:
# 1. Copy/paste 001_initial_schema.sql → Run
# 2. Copy/paste 002_rls_policies.sql → Run
```

**From source/repo:**
```bash
npm run migrations:bundle
# Creates devcaddy-migrations.sql
# Copy/paste into Supabase SQL Editor → Run
```

**What this creates:**
- `annotation` table (stores feedback)
- Row Level Security policies (developers see all, clients see own)
- Realtime subscriptions (instant sync)

**Then:**
1. Go to **Database** > **Replication** → Enable Realtime on `annotation` table
2. Go to **Authentication** > **Providers** → Enable Email provider
3. Copy your Project URL and Anon Key from **Settings** > **API**

📖 Detailed setup: See [docs/SETUP.md](../docs/SETUP.md)

### 2. Configure Your App (2 minutes)

**.env**
```bash
VITE_DEVCADDY_SUPABASE_URL=https://your-project.supabase.co
VITE_DEVCADDY_SUPABASE_ANON_KEY=your-anon-key-here
```

**vite.config.ts**
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

**src/main.tsx** (or your entry point)
```typescript
import { initDevCaddy } from 'dev-caddy';
import 'dev-caddy/dev-caddy.css';

// Initialize DevCaddy with your environment variables
initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY,
});

// Then render your app
```

> **Note:** Environment variables must be passed from your app code. Vite replaces `import.meta.env.*` with actual values at build time in **your app**, not in libraries.

### 3. Start Using It

**Run your dev server:**
```bash
npm run dev
```

**You'll see a DevCaddy toggle button in the bottom-right corner.**

Click it → Enter your email → Get magic link → Start annotating!

**That's it.** No wrapper components, no route changes, no extra code. DevCaddy just works.

---

## How It Works

### The Magic: Zero UI Code Required

Most annotation tools make you build the UI yourself. DevCaddy **injects everything automatically**:

```
Your App
  ↓
Vite Build
  ↓
DevCaddyPlugin (auto-detects environment)
  ↓
Injects Complete UI:
  - Toggle button ✅
  - Annotation panel ✅
  - Element selector ✅
  - Real-time sync ✅
  ↓
You write ZERO annotation UI code
```

### Automatic Mode Switching

DevCaddy knows where it's running:

| Environment | Mode | Who Uses It | Permissions |
|-------------|------|-------------|-------------|
| `npm run dev` | **Developer** | You, the dev | View/edit/delete ALL annotations |
| Staging/preview | **Client** | Designers, clients, QA | View ALL, edit/delete OWN |
| Production build | **Disabled** | No one | DevCaddy completely removed |

**Override for testing:**
```
http://localhost:5173?devCaddyMode=client       # Test as client
http://localhost:5173?devCaddyMode=developer    # Test as developer
```

### Real-time Sync

Built on Supabase Realtime. When a reviewer adds feedback:

```
Reviewer clicks button → Creates annotation
  ↓
Saved to Supabase
  ↓
Supabase Realtime broadcasts
  ↓
Your dev environment updates instantly
  ↓
You see the annotation on that exact button
```

No polling, no refresh, no delay. WebSocket magic.

---

## Authentication

### For Team Leads (One-Time Setup)

1. Go to Supabase Dashboard → **Authentication** > **Users** > **Invite User**
2. Add all team members' emails
3. Assign developer roles via SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = '{"role": "developer"}'::jsonb
WHERE email IN (
  'alice@company.com',
  'bob@company.com'
);
-- Leave clients without a role
```

4. Share app URL with team

### For Users (One-Time Setup)

1. Open app → Click DevCaddy toggle
2. Enter your email → Check inbox
3. Click magic link → Authenticated!
4. **Session persists** - never authenticate again (until you clear browser data)

**Security:**
- Roles in `app_metadata` (admin-only, users can't edit)
- Magic links expire (configurable, default 60 min)
- JWTs signed by Supabase (can't be forged)
- RLS policies enforce permissions at database level

📖 Complete role setup: See [docs/SETUP.md](../docs/SETUP.md#role-assignment)

---

## TypeScript Support

DevCaddy is **100% TypeScript**. Every export is fully typed:

```typescript
import { initDevCaddy } from 'dev-caddy';

initDevCaddy({
  supabaseUrl: 'https://xxx.supabase.co',     // ✅ Type: string
  supabaseAnonKey: 'eyJhbGc...',              // ✅ Type: string
  // @ts-expect-error
  invalidOption: true,                         // ❌ Error: Unknown option
});
```

**For AI Agents:** All types exported, zero `any` in public API, every function documented with JSDoc.

---

## Advanced Usage

### Programmatic API (Optional)

Most users never need this — the DevCaddy UI handles everything. But if you're building custom workflows:

```typescript
import {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationsByPage,
  subscribeToAnnotations,
  ANNOTATION_STATUS,
} from 'dev-caddy';

// Create annotation programmatically
await createAnnotation({
  content: 'Fix this button color',
  page: '/products',
  element_tag: 'button',
  element_selector: '#submit-btn',
  created_by: currentUser.id,
  status_id: ANNOTATION_STATUS.NEW,
});

// Subscribe to changes
const unsubscribe = subscribeToAnnotations('/products', (annotations) => {
  console.log('New annotations:', annotations);
});
```

📖 Full API docs: See source code JSDoc comments (or TypeScript IntelliSense)

### Testing Different Modes

```bash
# Test client/reviewer mode
npm run dev -- --mode production
# Or add ?devCaddyMode=client to URL

# Test developer mode (default)
npm run dev
# Or add ?devCaddyMode=developer to URL
```

---

## Architecture

### Tech Stack

- **Frontend:** React, TypeScript, SCSS
- **Backend:** Supabase (PostgreSQL + Realtime + Auth)
- **Build:** Vite plugin system
- **Auth:** Magic links via Supabase Auth
- **Security:** Row Level Security (RLS) with JWT metadata

### How Annotations Work

```
1. User clicks element
   ↓
2. DevCaddy extracts:
   - CSS selector (#app > button.primary)
   - Element tag (button)
   - Parent selector (.container)
   - Data attributes (data-testid)
   - Page URL (/products)
   ↓
3. Saves to Supabase with:
   - Content (user's feedback)
   - Selector data (for re-highlighting)
   - Created by (user ID from JWT)
   - Status (new/in-progress/resolved/etc)
   ↓
4. Supabase Realtime broadcasts to all connected clients
   ↓
5. Other users see annotation appear on same element
```

### Security Model

**Permissions enforced at database level:**

```sql
-- RLS Policy: Everyone sees all annotations
CREATE POLICY "users_can_view_all_annotations"
  ON annotation FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Developers can edit any
CREATE POLICY "developers_can_update_any_annotation"
  ON annotation FOR UPDATE
  USING ((auth.jwt()->'app_metadata'->>'role')::text = 'developer');

-- RLS Policy: Clients can only edit own
CREATE POLICY "clients_can_update_own_annotations"
  ON annotation FOR UPDATE
  USING (
    created_by = auth.uid()::text
    AND (auth.jwt()->'app_metadata'->>'role')::text != 'developer'
  );
```

**Why this is secure:**
- `app_metadata` is **read-only** for users (only admins can edit via SQL)
- All queries go through RLS policies (can't be bypassed)
- Anon key is safe for client use (RLS protects data)
- Service role key never exposed to client

📖 Full architecture: See [docs/README.md](../docs/README.md#architecture-summary)

---

## Documentation

**Start here:**
- [docs/README.md](../docs/README.md) - Project overview, architecture, current state

**Specific guides:**
- [docs/SETUP.md](../docs/SETUP.md) - Complete Supabase setup and role assignment
- [docs/IMPLEMENTATION.md](../docs/IMPLEMENTATION.md) - Development principles and decisions
- [docs/TASKS.md](../docs/TASKS.md) - Current development roadmap

**For AI Agents:**
All architectural decisions documented with rationale. No "magic" - every choice explained.

---

## Troubleshooting

### DevCaddy UI not appearing

**Check:**
1. Plugin enabled in `vite.config.ts`: `enabled: true`
2. Environment variables set in `.env`
3. `initDevCaddy()` called in your entry point
4. CSS imported: `import 'dev-caddy/dev-caddy.css'`
5. Browser console for errors

### Can't create annotations

**Check:**
1. Supabase migrations ran successfully
2. Realtime enabled on `annotation` table
3. Browser Network tab - check Supabase API calls
4. User authenticated (check session exists)

### Permission denied errors

**Check:**
1. User authenticated (magic link clicked)
2. RLS policies exist: `SELECT * FROM pg_policies WHERE tablename = 'annotation';`
3. Using anon key (not service role key) in client
4. If developer: role assigned in `app_metadata`

### Type errors

**Check:**
1. Import from `'dev-caddy'` not `'dev-caddy/dist'`
2. TypeScript version >= 4.5
3. Run `npm install` to ensure deps installed

📖 More troubleshooting: See [docs/SETUP.md](../docs/SETUP.md#troubleshooting)

---

## Examples

**Complete working example:**
- [examples/simple](../examples/simple) - React app with DevCaddy fully configured

**Live demo:** (Coming soon)

---

## Roadmap

**Current:** Phase 3 - Authentication & UI
- ✅ Magic link authentication
- ✅ Role-based permissions
- ✅ Real-time sync
- 🚧 Element selection UI
- 🚧 Annotation creation flow

**Next:** Phase 4 - Element Highlighting
- Re-highlighting annotations on page load
- Confidence scoring for selector matching
- Fallback strategies when elements change

**Future:**
- Comment threads on annotations
- Screenshot attachments
- Export to CSV/Markdown
- Webhooks for notifications
- Browser extension (Chrome/Firefox)

📖 Full roadmap: See [docs/TASKS.md](../docs/TASKS.md)

---

## Contributing

DevCaddy is built with:
- **Simplicity over cleverness** - Code should be obvious
- **SOLID principles** - Each piece does one thing well
- **Files under 250 lines** - Easy to understand and maintain
- **Hybrid spec-driven + test-driven development** - Specs for "what", tests for "how"

📖 Development guide: See [docs/IMPLEMENTATION.md](../docs/IMPLEMENTATION.md)

---

## License

MIT - Use it however you want

---

## Why "DevCaddy"?

A caddy carries your golf clubs and tells you which one to use.

DevCaddy carries your feedback and tells you exactly where to fix it.

---

## Support

**Need help?**
- [GitHub Issues](https://github.com/yourusername/dev-caddy/issues)
- [Documentation](../docs/)

**For AI Agents:**
Check `/docs` first - every decision is documented with rationale. Clear, explicit, no magic.

---

**Made with ❤️ by developers who are tired of "see attached screenshot" emails**
