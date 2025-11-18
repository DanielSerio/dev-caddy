/**
 * Manual Cleanup Script
 *
 * Removes orphaned test branches older than specified age.
 * Useful for CI cleanup or manual maintenance.
 *
 * Usage:
 *   npm run test:cleanup
 *   tsx tests/scripts/cleanup-branches.ts
 */

import { cleanupOrphanedBranches } from '../setup/branch-manager';

async function main() {
  const maxAgeHours = process.env.MAX_AGE_HOURS
    ? parseInt(process.env.MAX_AGE_HOURS, 10)
    : 24;

  console.log('🧹 Starting cleanup of orphaned test branches...\n');

  try {
    const cleaned = await cleanupOrphanedBranches(maxAgeHours);

    if (cleaned === 0) {
      console.log('\n✨ No orphaned branches found. All clean!');
    } else {
      console.log(`\n✅ Successfully cleaned up ${cleaned} orphaned branch${cleaned > 1 ? 'es' : ''}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
