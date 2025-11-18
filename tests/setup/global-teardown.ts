/**
 * Playwright Global Teardown
 *
 * Runs once after all E2E tests to clean up ephemeral test branch.
 */

import { FullConfig } from '@playwright/test';
import { deleteTestBranch } from './branch-manager';

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 [Global Teardown] Cleaning up test environment...\n');

  const branchName = process.env.TEST_BRANCH_NAME;

  if (!branchName) {
    console.log('⚠️  [Global Teardown] No test branch found to delete');
    return;
  }

  try {
    await deleteTestBranch(branchName);
    console.log(`\n✅ [Global Teardown] Cleanup complete\n`);
  } catch (error) {
    console.error('\n❌ [Global Teardown] Failed to delete test branch:', error);
    // Don't throw - allow tests to complete even if cleanup fails
  }
}

export default globalTeardown;
