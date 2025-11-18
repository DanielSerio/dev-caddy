/**
 * Supabase Branch Manager for Test Database Isolation
 *
 * Creates and manages ephemeral Supabase branches for testing.
 * Each branch provides an isolated database instance with:
 * - Independent data (no pollution between test runs)
 * - Automatic migration application
 * - Branch-specific API keys
 *
 * @see https://supabase.com/docs/guides/platform/branching
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Configuration for branch operations
 */
interface BranchConfig {
  /** Project reference (from Supabase dashboard) */
  projectRef?: string;
  /** Timeout for branch creation in ms (default: 90000) */
  createTimeout?: number;
  /** Timeout for branch deletion in ms (default: 30000) */
  deleteTimeout?: number;
}

/**
 * Branch information returned from Supabase CLI
 */
interface BranchInfo {
  name: string;
  created_at: string;
  id: string;
}

/**
 * Create a new ephemeral test branch
 *
 * Generates a unique branch name with timestamp and creates it via Supabase CLI.
 * The branch is automatically provisioned with all migrations applied.
 *
 * @param config - Optional configuration for branch creation
 * @returns Branch name
 * @throws {Error} If branch creation fails or times out
 *
 * @example
 * ```typescript
 * const branchName = await createTestBranch();
 * // Branch created: test-1699999999999
 * ```
 */
export async function createTestBranch(config: BranchConfig = {}): Promise<string> {
  const timestamp = Date.now();
  const branchName = `test-${timestamp}`;
  const timeout = config.createTimeout || 90000; // 90 seconds

  console.log(`[BranchManager] Creating test branch: ${branchName}`);

  try {
    const command = config.projectRef
      ? `npx supabase branches create ${branchName} --project-ref ${config.projectRef}`
      : `npx supabase branches create ${branchName}`;

    const { stdout, stderr } = await execAsync(command, {
      timeout,
      env: { ...process.env },
    });

    if (stderr && !stderr.includes('Created branch')) {
      throw new Error(`Branch creation warning: ${stderr}`);
    }

    console.log(`[BranchManager] ✅ Branch created: ${branchName}`);
    console.log(stdout);

    return branchName;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create test branch: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Delete a test branch
 *
 * Removes the specified branch and all associated data.
 * Safe to call even if branch doesn't exist (no-op).
 *
 * @param branchName - Name of branch to delete
 * @param config - Optional configuration for branch deletion
 * @throws {Error} If deletion fails (except for "not found")
 *
 * @example
 * ```typescript
 * await deleteTestBranch('test-1699999999999');
 * // Branch deleted: test-1699999999999
 * ```
 */
export async function deleteTestBranch(
  branchName: string,
  config: BranchConfig = {}
): Promise<void> {
  const timeout = config.deleteTimeout || 30000; // 30 seconds

  console.log(`[BranchManager] Deleting test branch: ${branchName}`);

  try {
    const command = config.projectRef
      ? `npx supabase branches delete ${branchName} --project-ref ${config.projectRef} --force`
      : `npx supabase branches delete ${branchName} --force`;

    const { stdout, stderr } = await execAsync(command, {
      timeout,
      env: { ...process.env },
    });

    // Ignore "not found" errors (branch already deleted)
    if (stderr && !stderr.toLowerCase().includes('not found')) {
      console.warn(`[BranchManager] Warning during deletion: ${stderr}`);
    }

    console.log(`[BranchManager] ✅ Branch deleted: ${branchName}`);
    if (stdout) console.log(stdout);
  } catch (error) {
    if (error instanceof Error) {
      // Ignore "not found" errors
      if (error.message.toLowerCase().includes('not found')) {
        console.log(`[BranchManager] Branch ${branchName} not found (already deleted)`);
        return;
      }
      throw new Error(`Failed to delete test branch: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Clean up orphaned test branches
 *
 * Lists all branches matching the "test-*" pattern and deletes those
 * older than the specified age. Useful for CI cleanup.
 *
 * @param maxAgeHours - Maximum age in hours before deletion (default: 24)
 * @param config - Optional configuration
 * @returns Number of branches cleaned up
 *
 * @example
 * ```typescript
 * // Delete test branches older than 2 hours
 * const cleaned = await cleanupOrphanedBranches(2);
 * console.log(`Cleaned up ${cleaned} orphaned branches`);
 * ```
 */
export async function cleanupOrphanedBranches(
  maxAgeHours: number = 24,
  config: BranchConfig = {}
): Promise<number> {
  console.log(`[BranchManager] Cleaning up branches older than ${maxAgeHours} hours`);

  try {
    const command = config.projectRef
      ? `npx supabase branches list --project-ref ${config.projectRef} --output json`
      : `npx supabase branches list --output json`;

    const { stdout } = await execAsync(command, {
      timeout: 10000, // 10 seconds
      env: { ...process.env },
    });

    const branches: BranchInfo[] = JSON.parse(stdout);
    const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const branch of branches) {
      // Only cleanup test branches
      if (!branch.name.startsWith('test-')) {
        continue;
      }

      const createdAt = new Date(branch.created_at).getTime();
      if (createdAt < cutoffTime) {
        console.log(`[BranchManager] Deleting orphaned branch: ${branch.name}`);
        await deleteTestBranch(branch.name, config);
        cleanedCount++;
      }
    }

    console.log(`[BranchManager] ✅ Cleaned up ${cleanedCount} orphaned branches`);
    return cleanedCount;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[BranchManager] Cleanup failed: ${error.message}`);
      // Don't throw - cleanup is best-effort
    }
    return 0;
  }
}

/**
 * Get connection string for a test branch
 *
 * Retrieves the database connection URL for the specified branch.
 * This URL can be used to connect to the isolated test database.
 *
 * @param branchName - Name of the branch
 * @param config - Optional configuration
 * @returns Database connection string
 *
 * @internal
 * Reserved for future use when direct database connections are needed.
 * Currently, tests use Supabase client API instead of direct connections.
 */
export async function getBranchConnectionString(
  branchName: string,
  config: BranchConfig = {}
): Promise<string> {
  try {
    const command = config.projectRef
      ? `npx supabase branches get ${branchName} --project-ref ${config.projectRef} --output json`
      : `npx supabase branches get ${branchName} --output json`;

    const { stdout } = await execAsync(command, {
      timeout: 10000,
      env: { ...process.env },
    });

    const branchInfo = JSON.parse(stdout);
    return branchInfo.database_url || '';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get branch connection string: ${error.message}`);
    }
    throw error;
  }
}
