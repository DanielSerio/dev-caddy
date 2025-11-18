/**
 * Vitest Setup File
 *
 * Manages test branch lifecycle for integration tests.
 * Creates branch before tests, deletes after.
 */

import { beforeAll, afterAll } from 'vitest';
import { createTestBranch, deleteTestBranch } from './branch-manager';

let testBranchName: string | null = null;

beforeAll(async () => {
  console.log('\n🚀 [Vitest Setup] Creating test branch for integration tests...\n');

  try {
    testBranchName = await createTestBranch();
    process.env.TEST_BRANCH_NAME = testBranchName;

    console.log(`\n✅ [Vitest Setup] Test environment ready`);
    console.log(`   Branch: ${testBranchName}\n`);
  } catch (error) {
    console.error('\n❌ [Vitest Setup] Failed to create test branch:', error);
    throw error;
  }
}, 120000); // 2 minute timeout for branch creation

afterAll(async () => {
  if (!testBranchName) {
    console.log('⚠️  [Vitest Teardown] No test branch found to delete');
    return;
  }

  console.log('\n🧹 [Vitest Teardown] Cleaning up test branch...\n');

  try {
    await deleteTestBranch(testBranchName);
    console.log(`\n✅ [Vitest Teardown] Cleanup complete\n`);
  } catch (error) {
    console.error('\n❌ [Vitest Teardown] Failed to delete test branch:', error);
    // Don't throw - allow tests to complete even if cleanup fails
  }
}, 60000); // 1 minute timeout for branch deletion
