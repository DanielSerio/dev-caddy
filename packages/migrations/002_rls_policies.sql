-- DevCaddy Row Level Security Policies
-- Uses Supabase Auth with auth.uid() and role metadata for permissions

-- Enable Row Level Security on annotation table
ALTER TABLE annotation ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert annotations
-- Any authenticated user (developer or client) can create annotations
CREATE POLICY "authenticated_users_can_insert_annotations"
  ON annotation
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Anyone can view all annotations
-- All authenticated users can see all annotations (needed for collaboration)
CREATE POLICY "users_can_view_all_annotations"
  ON annotation
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Developers can update any annotation
-- Uses app_metadata (admin-only, secure) instead of user_metadata (user-editable, insecure)
CREATE POLICY "developers_can_update_any_annotation"
  ON annotation
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (auth.jwt()->'app_metadata'->>'role')::text = 'developer'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.jwt()->'app_metadata'->>'role')::text = 'developer'
  );

-- Policy: Clients can update their own annotations only
-- Users without developer role can only modify annotations they created
CREATE POLICY "clients_can_update_own_annotations"
  ON annotation
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') != 'developer'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') != 'developer'
  );

-- Policy: Developers can delete any annotation
-- Users with role='developer' can delete any annotation
CREATE POLICY "developers_can_delete_any_annotation"
  ON annotation
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (auth.jwt()->'app_metadata'->>'role')::text = 'developer'
  );

-- Policy: Clients can delete their own annotations only
-- Users without developer role can only delete annotations they created
CREATE POLICY "clients_can_delete_own_annotations"
  ON annotation
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') != 'developer'
  );

-- Setup Notes:
-- See docs/ROLE_ASSIGNMENT.md for comprehensive role assignment guide
--
-- Quick Start:
-- 1. Enable Supabase Auth in project settings
-- 2. Configure email provider (Supabase default or custom SMTP)
-- 3. Users authenticate via magic link (email prompt in DevCaddy UI)
-- 4. Assign developer role to team members who need full access:
--
--    Via SQL Editor (ONLY METHOD - Dashboard has no UI for app_metadata):
--    1. Open Supabase Dashboard > SQL Editor > New query
--    2. Run this SQL:
--       UPDATE auth.users
--       SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'::jsonb
--       WHERE email = 'developer@example.com';
--    3. For multiple users:
--       UPDATE auth.users
--       SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'::jsonb
--       WHERE email IN ('dev1@example.com', 'dev2@example.com');
--
--    IMPORTANT: raw_app_meta_data can ONLY be edited via SQL (not in Dashboard UI)
--    This is intentional for security - prevents users from editing their own roles
--
-- 5. Clients (reviewers) don't need role assignment - absence of role means client
--
-- How It Works:
-- - Team lead creates all users upfront in Supabase Dashboard
-- - Team lead assigns roles before users authenticate for first time
-- - User authenticates → Supabase generates JWT with app metadata
-- - JWT includes 'role' field if set in raw_app_meta_data (SECURE - admin-only)
-- - RLS policies check JWT: (auth.jwt()->'app_metadata'->>'role')::text = 'developer'
-- - Absence of role (or any other value) = client permissions
-- - Role changes take effect on next login (JWT refresh needed)
--
-- SECURITY NOTE:
-- We use app_metadata (NOT user_metadata) because:
-- - app_metadata is READ-ONLY for users (only writable via service role)
-- - user_metadata is USER-EDITABLE and should never be used for permissions
-- - This prevents users from giving themselves developer permissions
--
-- Permission Matrix:
-- ┌─────────────┬────────────┬─────────────┬─────────────┬─────────────┐
-- │ Action      │ Developer  │ Client      │ Description                │
-- ├─────────────┼────────────┼─────────────┼─────────────────────────────┤
-- │ View        │ All        │ All         │ Everyone sees all           │
-- │ Create      │ Yes        │ Yes         │ Both can create             │
-- │ Update Own  │ Yes        │ Yes         │ Both can edit own           │
-- │ Update Any  │ Yes        │ No          │ Only devs edit others'      │
-- │ Delete Own  │ Yes        │ Yes         │ Both can delete own         │
-- │ Delete Any  │ Yes        │ No          │ Only devs delete others'    │
-- └─────────────┴────────────┴─────────────┴─────────────────────────────┘
