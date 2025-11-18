import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for DevCaddy Integration Tests
 *
 * Tests client API layer without browser (Supabase operations).
 * Uses setup file to manage ephemeral test branches.
 *
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    /* Test directory */
    include: ['tests/integration/**/*.test.ts'],

    /* Setup file for branch management */
    setupFiles: ['./tests/setup/vitest-setup.ts'],

    /* Environment for tests */
    environment: 'jsdom',

    /* Single fork to ensure setup runs once */
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    /* Timeouts */
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 120000, // 2 minutes for setup/teardown hooks

    /* Coverage configuration (optional) */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/src/client/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/types/**'],
    },
  },
});
