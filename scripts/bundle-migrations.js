#!/usr/bin/env node

/**
 * Bundle DevCaddy Migrations
 *
 * This script combines all SQL migration files into a single file
 * that can be easily copied and pasted into Supabase SQL Editor.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql'
];

const migrationsDir = path.join(__dirname, '../packages/migrations');
const outputFile = path.join(__dirname, '../devcaddy-migrations.sql');

console.log('📦 Bundling DevCaddy migrations...\n');

// Start building the bundle
let bundle = `-- ============================================================================
-- DevCaddy Database Setup - Complete Migration Bundle
-- ============================================================================
--
-- This file contains all DevCaddy database migrations in a single file.
--
-- HOW TO USE:
-- 1. Copy this entire file
-- 2. Open your Supabase project dashboard
-- 3. Go to: SQL Editor → New Query
-- 4. Paste this file and click "Run"
--
-- WHAT THIS CREATES:
-- - annotation_status table (5 default statuses)
-- - annotation table (for storing annotations)
-- - RLS policies (security rules)
-- - Indexes (for performance)
-- - Triggers (for auto-updating timestamps)
--
-- ============================================================================

`;

// Read and append each migration file
migrations.forEach((filename, index) => {
  const filepath = path.join(migrationsDir, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`❌ Error: Migration file not found: ${filename}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filepath, 'utf-8');

  bundle += `-- ============================================================================
-- Migration ${index + 1}: ${filename}
-- ============================================================================

${content}

`;

  console.log(`✓ Added: ${filename}`);
});

bundle += `-- ============================================================================
-- End of DevCaddy Migrations
-- ============================================================================
--
-- ✓ If you see "Success. No rows returned" - migrations completed!
--
-- VERIFY SETUP:
-- 1. Go to: Table Editor
-- 2. You should see: annotation_status (5 rows) and annotation (empty)
--
-- TROUBLESHOOTING:
-- - "relation already exists": Tables already created, you're good!
-- - "permission denied": Use an admin/owner account
--
-- Need help? See: docs/SUPABASE_SETUP.md
-- ============================================================================
`;

// Write the bundle file
fs.writeFileSync(outputFile, bundle);

console.log(`\n✅ Success! Created: devcaddy-migrations.sql`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Open: https://supabase.com/dashboard`);
console.log(`   2. Go to: SQL Editor → New Query`);
console.log(`   3. Copy & paste: devcaddy-migrations.sql`);
console.log(`   4. Click: Run`);
console.log(`\n📖 See examples/simple/SETUP.md for detailed instructions\n`);
