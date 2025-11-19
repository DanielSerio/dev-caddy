/**
 * Playwright Global Setup
 *
 * Runs once before all E2E tests to create ephemeral test branch.
 * The branch name is stored in environment variable for use in tests.
 */

import { FullConfig } from '@playwright/test';
import { createTestBranch } from './branch-manager';

async function globalSetup(config: FullConfig) {
  console.log('\n🚀 [Global Setup] Starting Playwright test suite...\n');

  try {
    // Create ephemeral test branch
    const branchName = await createTestBranch();

    // Store branch name in environment for tests
    process.env.TEST_BRANCH_NAME = branchName;

    console.log(`\n✅ [Global Setup] Test environment ready`);
    console.log(`   Branch: ${branchName}\n`);
  } catch (error) {
    console.error('\n❌ [Global Setup] Failed to create test branch:', error);
    throw error;
  }
}

export default globalSetup;
