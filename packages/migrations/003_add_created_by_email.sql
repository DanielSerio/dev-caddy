-- Migration: 003_add_created_by_email.sql
-- Purpose: Add created_by_email column to store user email for display
-- Created: 2025-11-12

-- =============================================================================
-- ADD COLUMN: created_by_email
-- =============================================================================

-- Add a column to store the email of the user who created the annotation
-- This provides a human-readable identifier without requiring joins
ALTER TABLE annotation
ADD COLUMN created_by_email TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN annotation.created_by_email IS
  'Email address of the user who created the annotation. Used for display purposes. The created_by field remains the authoritative user identifier (UUID).';

-- =============================================================================
-- NOTES
-- =============================================================================

-- The created_by field (UUID) remains the authoritative user identifier
-- The created_by_email field is for display purposes only
-- Client code should populate created_by_email when creating annotations:
--   created_by: user.id,
--   created_by_email: user.email

-- For existing annotations, created_by_email will be NULL
-- The UI should fall back to showing created_by (UUID) if email is not available
