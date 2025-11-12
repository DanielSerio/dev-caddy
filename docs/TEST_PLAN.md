# DevCaddy Testing Plan

**Created:** 2025-11-11
**Status:** Planning Phase
**Approach:** Hybrid Spec-Driven + Test-Driven Development

---

## Overview

DevCaddy currently has **zero tests**. This document outlines a pragmatic testing strategy focusing on integration and E2E tests (no unit tests per development principles).

### Testing Philosophy

Per `docs/IMPLEMENTATION.md`:
- ✅ **DO** write E2E tests with Playwright
- ✅ **DO** write integration tests for multi-component interactions
- ✅ **DO** write specs (Gherkin) for user-facing features
- ❌ **DON'T** write unit tests
- ❌ **DON'T** mock Supabase (use Supabase branch for testing)

### Test Type Definitions

**To avoid confusion, we use these specific definitions:**

| Test Type | Tool | Scope | Browser? |
|-----------|------|-------|----------|
| **Integration Tests** | Vitest | API layer only (client API, subscriptions) | ❌ No |
| **E2E Tests** | Playwright | Full user flows with browser | ✅ Yes |

**Integration Tests:**
- Test individual modules with real Supabase
- No browser, no UI rendering
- Example: `createAnnotation()` saves to database correctly

**E2E Tests:**
- Test complete user journeys
- Real browser, full UI
- Example: User clicks button, creates annotation, sees it in list

---

## Current State Analysis

### What We Have (Testable)

**✅ Authentication Flow:**
- Magic link email sending
- Session management
- Auth state changes
- Role-based permissions

**✅ Client API:**
- `initDevCaddy()` - Supabase client initialization
- `createAnnotation()` - Create new annotations
- `updateAnnotation()` - Update existing annotations
- `deleteAnnotation()` - Delete annotations
- `getAnnotationsByPage()` - Query annotations
- `subscribeToAnnotations()` - Realtime subscriptions

**✅ UI Components:**
- `AuthPrompt` - Email input and magic link flow
- `DevCaddy` - Main component with auth integration
- `useAuth` - Authentication hook

**✅ Plugin Logic:**
- Mode detection (developer/client/disabled)
- Environment variable handling
- HTML injection

### What We Don't Have Yet

- ❌ Element selection UI
- ❌ Annotation creation UI
- ❌ Annotation display/highlighting
- ❌ Mode-specific components (AnnotationList, AnnotationManager)

---

## Testing Strategy

### Phase 1: Setup & Foundation (Week 1)

**Goal:** Get testing infrastructure working

**Tools:**
- Playwright for E2E tests
- Vitest for integration tests
- Supabase branches for test database isolation
- No mocking libraries

**Setup Tasks:**

1. **Install Playwright**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Install Vitest**
   ```bash
   npm install -D vitest @vitest/ui
   ```

3. **Create Test Structure**
   ```
   packages/
   ├── tests/
   │   ├── e2e/
   │   │   ├── auth.spec.ts
   │   │   ├── annotations.spec.ts
   │   │   └── realtime.spec.ts
   │   ├── integration/
   │   │   ├── client-api.test.ts
   │   │   ├── supabase-client.test.ts
   │   │   └── plugin.test.ts
   │   ├── fixtures/
   │   │   └── supabase-test.ts
   │   ├── setup/
   │   │   ├── global-setup.ts        # Playwright global setup
   │   │   ├── global-teardown.ts     # Playwright global teardown
   │   │   ├── vitest-setup.ts        # Vitest setup hooks
   │   │   └── branch-manager.ts      # Branch creation/deletion logic
   │   └── scripts/
   │       ├── test-with-branch.sh    # Wrapper script for automated tests
   │       └── cleanup-branches.sh    # Cleanup orphaned branches
   └── playwright.config.ts
   └── vitest.config.ts
   ```

4. **Set Up Supabase Test Branch**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Initialize Supabase in project (if not done)
   npx supabase init

   # Link to your Supabase project
   npx supabase link --project-ref your-project-ref

   # Create a test branch (isolated database)
   npx supabase branches create testing

   # Get branch credentials
   npx supabase branches get testing
   ```

5. **Create Test Environment Variables**
   ```bash
   # .env.test
   # Use credentials from your Supabase test branch
   VITE_DEV_CADDY_SUPABASE_URL=https://your-project-testing.supabase.co
   VITE_DEV_CADDY_SUPABASE_ANON_KEY=test-branch-anon-key
   SUPABASE_SERVICE_ROLE_KEY=test-branch-service-key
   ```

**Why Supabase Branches?**
- ✅ Isolated test database (won't affect production or development data)
- ✅ Same hosted infrastructure as production (realistic testing)
- ✅ Fast reset between test runs (`npx supabase db reset`)
- ✅ No local Docker setup required
- ✅ Migrations automatically applied to branch
- ✅ Branch-specific API keys (security isolation)
- ✅ Can create multiple branches for different test suites (e.g., `testing-e2e`, `testing-integration`)

**Automated Test Workflow (Recommended):**

Tests automatically create, use, and cleanup branches via setup/teardown scripts:

```bash
# Developer simply runs:
npm run test:integration
# or
npm run test:e2e

# Behind the scenes:
# 1. Setup script creates ephemeral branch
# 2. Tests run against branch
# 3. Teardown script deletes branch
# No manual branch management needed!
```

**Manual Test Workflow (Optional):**

For debugging or when you need to inspect test data:

```bash
# 1. Create persistent test branch (one-time setup)
npx supabase branches create testing

# 2. Get credentials and add to .env.test
npx supabase branches get testing

# 3. Run tests against branch
npm run test:integration

# 4. Reset branch between test runs (clean slate)
npx supabase db reset --branch testing

# 5. Keep branch alive for debugging
# Delete when done: npx supabase branches delete testing
```

**Branch Management Strategy:**
- **Automated (CI/CD & local development)**: Ephemeral branches created per test run, auto-deleted after
- **Manual (debugging)**: Persistent branch kept alive for inspection
- **Naming convention**: `test-{timestamp}` for ephemeral, `testing` for persistent
- **Cleanup**: Automated teardown ensures no orphaned branches

---

## Test Automation Scripts

### Branch Manager Utility

**File:** `tests/setup/branch-manager.ts`

```typescript
import { execSync } from 'child_process';

export interface BranchCredentials {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

/**
 * Creates an ephemeral Supabase branch for testing
 * @returns Branch name and credentials
 */
export async function createTestBranch(): Promise<{
  branchName: string;
  credentials: BranchCredentials
}> {
  const timestamp = Date.now();
  const branchName = `test-${timestamp}`;

  console.log(`Creating Supabase branch: ${branchName}`);

  try {
    // Create branch (can take 30-60 seconds)
    execSync(`npx supabase branches create ${branchName}`, {
      stdio: 'inherit',
      timeout: 90000, // 90 seconds
    });

    // Get credentials
    const output = execSync(`npx supabase branches get ${branchName} --json`, {
      encoding: 'utf-8',
      timeout: 10000, // 10 seconds
    });

    const branchInfo = JSON.parse(output);

    const credentials: BranchCredentials = {
      url: branchInfo.api_url,
      anonKey: branchInfo.anon_key,
      serviceRoleKey: branchInfo.service_role_key,
    };

    // Set environment variables for tests
    process.env.VITE_DEV_CADDY_SUPABASE_URL = credentials.url;
    process.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY = credentials.anonKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = credentials.serviceRoleKey;

    console.log(`✅ Branch created: ${branchName}`);
    console.log(`   URL: ${credentials.url}`);

    return { branchName, credentials };
  } catch (error) {
    console.error(`❌ Failed to create branch: ${error}`);
    throw error;
  }
}

/**
 * Deletes a Supabase branch
 * @param branchName - Name of branch to delete
 */
export async function deleteTestBranch(branchName: string): Promise<void> {
  console.log(`Deleting Supabase branch: ${branchName}`);

  try {
    execSync(`npx supabase branches delete ${branchName} --force`, {
      stdio: 'inherit',
      timeout: 30000, // 30 seconds
    });
    console.log(`✅ Branch deleted: ${branchName}`);
  } catch (error) {
    console.error(`❌ Failed to delete branch: ${error}`);
    // Don't throw - cleanup failures shouldn't fail tests
  }
}

/**
 * Cleanup any orphaned test branches older than 1 hour
 */
export async function cleanupOrphanedBranches(): Promise<void> {
  console.log('Cleaning up orphaned test branches...');

  try {
    const output = execSync('npx supabase branches list --json', {
      encoding: 'utf-8',
      timeout: 10000, // 10 seconds
    });

    const branches = JSON.parse(output);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const branch of branches) {
      if (branch.name.startsWith('test-')) {
        const timestamp = parseInt(branch.name.replace('test-', ''));

        if (timestamp < oneHourAgo) {
          console.log(`  Deleting orphaned branch: ${branch.name}`);
          await deleteTestBranch(branch.name);
        }
      }
    }

    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error(`❌ Cleanup failed: ${error}`);
  }
}
```

### Playwright Global Setup

**File:** `tests/setup/global-setup.ts`

```typescript
import { chromium, FullConfig } from '@playwright/test';
import { createTestBranch } from './branch-manager';

async function globalSetup(config: FullConfig) {
  console.log('\n🔧 Playwright Global Setup\n');

  // Create ephemeral test branch
  const { branchName, credentials } = await createTestBranch();

  // Store branch name for teardown
  process.env.TEST_BRANCH_NAME = branchName;

  // Optional: Seed test data
  console.log('Seeding test data...');
  // await seedTestData(credentials);

  console.log('\n✅ Setup complete\n');
}

export default globalSetup;
```

### Playwright Global Teardown

**File:** `tests/setup/global-teardown.ts`

```typescript
import { FullConfig } from '@playwright/test';
import { deleteTestBranch } from './branch-manager';

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Playwright Global Teardown\n');

  const branchName = process.env.TEST_BRANCH_NAME;

  if (branchName) {
    await deleteTestBranch(branchName);
  } else {
    console.warn('⚠️  No branch name found in environment');
  }

  console.log('\n✅ Teardown complete\n');
}

export default globalTeardown;
```

### Vitest Setup Hooks

**File:** `tests/setup/vitest-setup.ts`

```typescript
import { beforeAll, afterAll } from 'vitest';
import { createTestBranch, deleteTestBranch } from './branch-manager';

let testBranchName: string;

// Runs once before all tests
beforeAll(async () => {
  console.log('\n🔧 Vitest Global Setup\n');

  const { branchName, credentials } = await createTestBranch();
  testBranchName = branchName;

  console.log('\n✅ Setup complete\n');
}, 60000); // 60s timeout for branch creation

// Runs once after all tests
afterAll(async () => {
  console.log('\n🧹 Vitest Global Teardown\n');

  if (testBranchName) {
    await deleteTestBranch(testBranchName);
  }

  console.log('\n✅ Teardown complete\n');
}, 30000); // 30s timeout for cleanup
```

### Updated Playwright Config

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run serially to avoid branch conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to share branch
  reporter: 'html',

  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup'),
  globalTeardown: require.resolve('./tests/setup/global-teardown'),

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Updated Vitest Config

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest-setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    sequence: {
      hooks: 'stack', // Ensures proper setup/teardown order
    },
    pool: 'forks', // Use separate processes
    poolOptions: {
      forks: {
        singleFork: true, // Share the same branch across tests
      },
    },
  },
});
```

### Cleanup Script (Manual)

**File:** `tests/scripts/cleanup-branches.ts`

```typescript
import { cleanupOrphanedBranches } from '../setup/branch-manager';

/**
 * Manual cleanup script for orphaned test branches
 * Run with: npm run test:cleanup
 */
async function main() {
  console.log('🧹 Cleaning up orphaned test branches...\n');

  try {
    await cleanupOrphanedBranches();
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
```

**Usage:**
```bash
# Clean up orphaned branches (older than 1 hour)
npm run test:cleanup

# Useful after:
# - Failed test runs that didn't cleanup
# - Interrupted test processes (Ctrl+C)
# - CI failures
```

### Summary: Automated Test Workflow

**Developer Experience:**

```bash
# Developer runs tests (completely automated)
npm run test:integration

# Output:
# 🔧 Vitest Global Setup
# Creating Supabase branch: test-1731358924567
# ✅ Branch created: test-1731358924567
#    URL: https://project-test-1731358924567.supabase.co
# ✅ Setup complete
#
# ✓ tests/integration/client-api.test.ts (3 tests) 1.2s
# ✓ tests/integration/annotations-crud.test.ts (4 tests) 2.1s
#
# 🧹 Vitest Global Teardown
# Deleting Supabase branch: test-1731358924567
# ✅ Branch deleted: test-1731358924567
# ✅ Teardown complete
```

**Key Benefits:**

✅ **Zero manual setup** - Developer just runs `npm run test:integration`
✅ **Isolated per run** - Each test run gets fresh database
✅ **Auto cleanup** - No orphaned branches left behind
✅ **Fast iteration** - No waiting for Docker or manual resets
✅ **CI-ready** - Same script works in CI/CD pipelines
✅ **Debugging mode** - Can create persistent branch for inspection

**When things go wrong:**

If test run is interrupted (Ctrl+C, crash, etc.), branches might be left behind:

```bash
# Run cleanup to remove orphaned branches
npm run test:cleanup

# Or manually delete specific branch
npx supabase branches delete test-1731358924567 --force
```

---

### Phase 2: Integration Tests (Week 2)

**Goal:** Test individual modules in isolation but with real Supabase

#### Test: Client API Initialization

**File:** `tests/integration/client-api.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDevCaddy, getSupabaseClient } from '../../src/client/api/init';

describe('Client API Initialization', () => {
  afterAll(() => {
    // Reset singleton for other tests
  });

  it('should throw error if not initialized', () => {
    expect(() => getSupabaseClient()).toThrow('DevCaddy not initialized');
  });

  it('should initialize with valid credentials', () => {
    expect(() => {
      initDevCaddy({
        supabaseUrl: process.env.VITE_DEV_CADDY_SUPABASE_URL!,
        supabaseAnonKey: process.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY!,
      });
    }).not.toThrow();
  });

  it('should return same client instance (singleton)', () => {
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();
    expect(client1).toBe(client2);
  });

  it('should throw error with invalid URL', () => {
    expect(() => {
      initDevCaddy({
        supabaseUrl: 'not-a-url',
        supabaseAnonKey: 'key',
      });
    }).toThrow('Invalid Supabase URL');
  });
});
```

**Coverage:**
- ✅ Error handling
- ✅ Singleton pattern
- ✅ Validation logic
- ✅ No mocking (real validation)

#### Test: Annotation CRUD Operations

**File:** `tests/integration/annotations-crud.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDevCaddy } from '../../src/client/api/init';
import {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationsByPage,
} from '../../src/client/api/annotations';
import { ANNOTATION_STATUS } from '../../src/types/annotations';

describe('Annotation CRUD Operations', () => {
  let testUserId: string;
  let testAnnotationId: string;

  beforeAll(async () => {
    // Initialize with test Supabase
    initDevCaddy({
      supabaseUrl: process.env.VITE_DEV_CADDY_SUPABASE_URL!,
      supabaseAnonKey: process.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY!,
    });

    // Create test user session
    // ... auth setup
    testUserId = 'test-user-id';
  });

  afterAll(async () => {
    // Clean up test data
  });

  it('should create annotation', async () => {
    const annotation = await createAnnotation({
      content: 'Test annotation',
      page: '/test-page',
      element_tag: 'button',
      element_selector: '#test-btn',
      created_by: testUserId,
      status_id: ANNOTATION_STATUS.NEW,
    });

    expect(annotation).toBeDefined();
    expect(annotation.content).toBe('Test annotation');
    expect(annotation.id).toBeDefined();

    testAnnotationId = annotation.id;
  });

  it('should retrieve annotations by page', async () => {
    const annotations = await getAnnotationsByPage('/test-page');

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe(testAnnotationId);
  });

  it('should update annotation', async () => {
    const updated = await updateAnnotation(testAnnotationId, {
      status_id: ANNOTATION_STATUS.RESOLVED,
    });

    expect(updated.status_id).toBe(ANNOTATION_STATUS.RESOLVED);
    expect(updated.resolved_at).toBeDefined();
    expect(updated.updated_by).toBe(testUserId); // Verify updated_by is set
  });

  it('should delete annotation', async () => {
    await deleteAnnotation(testAnnotationId);

    const annotations = await getAnnotationsByPage('/test-page');
    expect(annotations).toHaveLength(0);
  });
});
```

**Coverage:**
- ✅ Full CRUD cycle
- ✅ Real Supabase database
- ✅ RLS policies enforced
- ✅ Status transitions

#### Test: URL Normalization

**File:** `tests/integration/url-normalization.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '../../src/client/api/subscriptions';

describe('URL Normalization', () => {
  it('should handle clean paths', () => {
    expect(normalizeUrl('/products')).toBe('/products');
    expect(normalizeUrl('/checkout')).toBe('/checkout');
  });

  it('should strip query parameters', () => {
    expect(normalizeUrl('/products?sort=price')).toBe('/products');
    expect(normalizeUrl('/products?filter=new&page=2')).toBe('/products');
  });

  it('should strip hash fragments', () => {
    expect(normalizeUrl('/products#reviews')).toBe('/products');
    expect(normalizeUrl('/about#team')).toBe('/about');
  });

  it('should remove trailing slashes', () => {
    expect(normalizeUrl('/products/')).toBe('/products');
    expect(normalizeUrl('/checkout/')).toBe('/checkout');
  });

  it('should handle combined edge cases', () => {
    expect(normalizeUrl('/products/?sort=price#reviews')).toBe('/products');
  });
});
```

**Coverage:**
- ✅ Clean path handling
- ✅ Query parameter stripping
- ✅ Hash fragment stripping
- ✅ Trailing slash removal
- ✅ Combined edge cases

#### Test: Realtime Subscriptions

**File:** `tests/integration/realtime.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { subscribeToAnnotations } from '../../src/client/api/subscriptions';
import { createAnnotation } from '../../src/client/api/annotations';

describe('Realtime Subscriptions', () => {
  it('should receive INSERT events', async () => {
    const receivedAnnotations: Annotation[] = [];

    const unsubscribe = subscribeToAnnotations('/test-page', (annotations) => {
      receivedAnnotations.push(...annotations);
    });

    // Create annotation in another "session"
    await createAnnotation({
      content: 'Realtime test',
      page: '/test-page',
      element_tag: 'div',
      created_by: 'test-user',
      status_id: 1,
    });

    // Wait for realtime event
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(receivedAnnotations).toHaveLength(1);
    expect(receivedAnnotations[0].content).toBe('Realtime test');

    unsubscribe();
  });

  it('should receive UPDATE events', async () => {
    // Similar test for updates
  });

  it('should unsubscribe cleanly', async () => {
    // Test cleanup
  });
});
```

**Coverage:**
- ✅ Real WebSocket connections
- ✅ Event handling
- ✅ Cleanup logic
- ✅ No mocking

---

### Phase 3: E2E Tests (Week 3-4)

**Goal:** Test complete user flows in browser

#### Test: Authentication Flow

**Spec:** `specs/authentication.feature`

```gherkin
Feature: User Authentication
  Scenario: First-time user authentication
    Given a user opens the DevCaddy-enabled app
    When they click the DevCaddy toggle
    Then they should see an email prompt
    When they enter "test@example.com"
    And they click "Send Magic Link"
    Then they should see "Check your email" message
    When they click the magic link in their email
    Then they should be authenticated
    And they should see the DevCaddy panel

  Scenario: Returning user with session
    Given a user has previously authenticated
    When they open the app
    And they click the DevCaddy toggle
    Then they should NOT see the email prompt
    And they should immediately see the DevCaddy panel
```

**E2E Test:** `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('first-time user authentication', async ({ page, context }) => {
    // Go to test app
    await page.goto('http://localhost:5173');

    // Click DevCaddy toggle
    await page.click('[data-testid="devcaddy-toggle"]');

    // Should see email prompt
    await expect(page.locator('[data-testid="auth-prompt"]')).toBeVisible();

    // Enter email
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="send-magic-link"]');

    // Should see success message
    await expect(page.locator('text=Check your email')).toBeVisible();

    // Simulate clicking magic link (bypass email)
    // In test environment, generate token directly
    const magicLinkToken = await generateTestMagicLink('test@example.com');
    await page.goto(`http://localhost:5173#access_token=${magicLinkToken}`);

    // Should be authenticated
    await expect(page.locator('[data-testid="devcaddy-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-prompt"]')).not.toBeVisible();
  });

  test('returning user with session', async ({ page }) => {
    // Set up existing session in localStorage
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', '...');
    });

    // Click toggle
    await page.click('[data-testid="devcaddy-toggle"]');

    // Should NOT see auth prompt
    await expect(page.locator('[data-testid="auth-prompt"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="devcaddy-panel"]')).toBeVisible();
  });
});
```

**Coverage:**
- ✅ Full auth flow
- ✅ Session persistence
- ✅ Email modal UI
- ✅ Real browser behavior

#### Test: Annotation Creation Flow

**Spec:** `specs/annotation-creation.feature`

```gherkin
Feature: Annotation Creation
  Scenario: Create annotation on UI element
    Given a user is authenticated
    And the DevCaddy panel is open
    When they click "Add Annotation"
    Then they should see element selection cursor
    When they hover over a button
    Then the button should have a blue outline
    When they click the button
    Then they should see an annotation popover
    When they enter "Fix this button color"
    And they click "Submit"
    Then the annotation should be saved
    And they should see the annotation in the list
```

**E2E Test:** `tests/e2e/annotations.spec.ts`

```typescript
test('create annotation on UI element', async ({ page }) => {
  // Setup: authenticated user
  await authenticateUser(page, 'developer@example.com');

  await page.goto('http://localhost:5173/test-page');
  await page.click('[data-testid="devcaddy-toggle"]');

  // Click "Add Annotation"
  await page.click('[data-testid="add-annotation-btn"]');

  // Selection mode active
  await expect(page.locator('body')).toHaveClass(/selecting-mode/);

  // Click target element
  await page.click('#target-button');

  // Popover appears
  await expect(page.locator('[data-testid="annotation-popover"]')).toBeVisible();

  // Enter content
  await page.fill('[data-testid="annotation-content"]', 'Fix this button color');
  await page.click('[data-testid="submit-annotation"]');

  // Annotation appears in list
  await expect(page.locator('text=Fix this button color')).toBeVisible();

  // Verify saved to database
  const annotations = await page.evaluate(async () => {
    const { getAnnotationsByPage } = await import('dev-caddy');
    return getAnnotationsByPage('/test-page');
  });

  expect(annotations).toHaveLength(1);
  expect(annotations[0].content).toBe('Fix this button color');
});
```

**Coverage:**
- ✅ Full annotation workflow
- ✅ Element selection
- ✅ UI interactions
- ✅ Database persistence

#### Test: Real-time Sync Between Users

**Spec:** `specs/realtime-collaboration.feature`

```gherkin
Feature: Real-time Collaboration
  Scenario: Developer sees client annotation in real-time
    Given a client is authenticated on staging
    And a developer is authenticated on localhost
    When the client creates an annotation
    Then the developer should see it appear immediately
    Without refreshing the page
```

**E2E Test:** `tests/e2e/realtime-sync.spec.ts`

```typescript
test('developer sees client annotation in real-time', async ({ browser }) => {
  // Create two browser contexts (simulating two users)
  const clientContext = await browser.newContext();
  const devContext = await browser.newContext();

  const clientPage = await clientContext.newPage();
  const devPage = await devContext.newPage();

  // Authenticate both
  await authenticateUser(clientPage, 'client@example.com');
  await authenticateUser(devPage, 'developer@example.com');

  // Both navigate to same page
  await clientPage.goto('http://localhost:5173/products');
  await devPage.goto('http://localhost:5173/products');

  // Both open DevCaddy
  await clientPage.click('[data-testid="devcaddy-toggle"]');
  await devPage.click('[data-testid="devcaddy-toggle"]');

  // Client creates annotation
  await clientPage.click('[data-testid="add-annotation-btn"]');
  await clientPage.click('#product-title');
  await clientPage.fill('[data-testid="annotation-content"]', 'Change title to blue');
  await clientPage.click('[data-testid="submit-annotation"]');

  // Developer should see it appear (within 3 seconds)
  await expect(devPage.locator('text=Change title to blue')).toBeVisible({
    timeout: 3000,
  });

  // Verify it appears without page refresh
  const navigationCount = await devPage.evaluate(() => {
    return (window as any).navigationCount || 0;
  });
  expect(navigationCount).toBe(0); // No navigation happened
});
```

**Coverage:**
- ✅ Multi-user scenario
- ✅ Real-time sync
- ✅ No page refresh
- ✅ WebSocket behavior

---

### Phase 4: RLS Policy Tests (Week 4)

**Goal:** Verify security permissions work correctly

#### Test: Permission Matrix

**File:** `tests/e2e/permissions.spec.ts`

```typescript
test.describe('RLS Permissions', () => {
  test('unauthenticated users cannot access annotations', async ({ page }) => {
    // Don't authenticate - test as anonymous user

    // Try to create annotation (should fail)
    await expect(async () => {
      await createAnnotation(page, {
        content: 'Unauthorized attempt',
        page: '/products',
      });
    }).rejects.toThrow(/not authenticated|unauthorized/i);

    // Try to view annotations (should fail)
    await expect(async () => {
      await getAllAnnotations(page);
    }).rejects.toThrow(/not authenticated|unauthorized/i);
  });

  test('developer can view all annotations', async ({ page }) => {
    await authenticateAs(page, 'developer');

    const annotations = await getAllAnnotations(page);
    expect(annotations.length).toBeGreaterThan(0);
  });

  test('developer can edit any annotation', async ({ page }) => {
    await authenticateAs(page, 'developer');

    // Try to edit annotation created by client
    const clientAnnotation = await createAnnotationAs('client', {
      content: 'Client feedback',
    });

    await updateAnnotation(page, clientAnnotation.id, {
      status_id: ANNOTATION_STATUS.RESOLVED,
    });

    // Should succeed
    const updated = await getAnnotation(page, clientAnnotation.id);
    expect(updated.status_id).toBe(ANNOTATION_STATUS.RESOLVED);
  });

  test('client can only view all annotations', async ({ page }) => {
    await authenticateAs(page, 'client');

    const annotations = await getAllAnnotations(page);
    expect(annotations.length).toBeGreaterThan(0); // Can view all
  });

  test('client cannot edit others annotations', async ({ page }) => {
    await authenticateAs(page, 'client1');

    const otherClientAnnotation = await createAnnotationAs('client2', {
      content: 'Other client feedback',
    });

    // Try to update (should fail with clear error)
    await expect(async () => {
      await updateAnnotation(page, otherClientAnnotation.id, {
        content: 'Hacked!',
      });
    }).rejects.toThrow(/permission denied|not authorized|policy violation/i);
  });

  test('client can edit own annotations', async ({ page }) => {
    await authenticateAs(page, 'client');

    const ownAnnotation = await createAnnotation(page, {
      content: 'My feedback',
    });

    // Should succeed
    await updateAnnotation(page, ownAnnotation.id, {
      content: 'Updated feedback',
    });

    const updated = await getAnnotation(page, ownAnnotation.id);
    expect(updated.content).toBe('Updated feedback');
  });
});
```

**Coverage:**
- ✅ All 6 RLS policies tested
- ✅ Permission matrix verified
- ✅ Real database enforcement
- ✅ No mocking

---

## Test Configuration Files

### Playwright Config

**File:** `packages/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Vitest Config

**File:** `packages/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/test-db.ts'],
    include: ['tests/integration/**/*.test.ts'],
  },
});
```

---

## Implementation Checklist

### Phase 1: Setup (Week 1)

- [ ] Install Playwright and Vitest
- [ ] Create test directory structure
- [ ] Create branch manager utility (`tests/setup/branch-manager.ts`)
  - [ ] `createTestBranch()` function
  - [ ] `deleteTestBranch()` function
  - [ ] `cleanupOrphanedBranches()` function
- [ ] Create Playwright global setup (`tests/setup/global-setup.ts`)
- [ ] Create Playwright global teardown (`tests/setup/global-teardown.ts`)
- [ ] Create Vitest setup hooks (`tests/setup/vitest-setup.ts`)
- [ ] Update Playwright config with global setup/teardown
- [ ] Update Vitest config with setup file and single fork
- [ ] Add npm scripts for testing (automated and manual)
- [ ] Create cleanup script for orphaned branches
- [ ] Test automation: run `npm run test:integration` successfully
- [ ] Test automation: run `npm run test:e2e` successfully
- [ ] Verify branch auto-creation and auto-deletion works

### Phase 2: Integration Tests (Week 2)

- [ ] Test: Client API initialization
- [ ] Test: Annotation CRUD operations (verify `updated_by` field)
- [ ] Test: URL normalization (query params, hash, trailing slash)
- [ ] Test: Realtime subscriptions
- [ ] Test: Plugin mode detection

### Phase 3: E2E Tests (Week 3-4)

- [ ] Spec + Test: Authentication flow
- [ ] Spec + Test: Annotation creation
- [ ] Spec + Test: Real-time sync
- [ ] Spec + Test: Mode switching
- [ ] Spec + Test: SPA navigation

### Phase 4: Security Tests (Week 4)

- [ ] Test: Unauthenticated users are blocked
- [ ] Test: RLS permission matrix (with specific error messages)
- [ ] Test: Role-based access
- [ ] Test: app_metadata security

---

## NPM Scripts to Add

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:integration": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:integration && npm run test:e2e",
    "test:cleanup": "tsx tests/scripts/cleanup-branches.ts",
    "test:branch:create": "npx supabase branches create testing",
    "test:branch:delete": "npx supabase branches delete testing --force",
    "test:branch:reset": "npx supabase db reset --branch testing",
    "test:branch:seed": "npx supabase db seed --branch testing"
  }
}
```

**What happens when you run tests:**

1. **`npm run test:integration`**:
   - Vitest runs `beforeAll` hook
   - Hook creates ephemeral branch `test-{timestamp}`
   - Tests run against branch
   - Vitest runs `afterAll` hook
   - Hook deletes branch automatically

2. **`npm run test:e2e`**:
   - Playwright runs `globalSetup`
   - Setup creates ephemeral branch `test-{timestamp}`
   - All E2E tests run against branch
   - Playwright runs `globalTeardown`
   - Teardown deletes branch automatically

3. **`npm run test:cleanup`** (manual):
   - Finds all branches starting with `test-`
   - Deletes branches older than 1 hour
   - Useful for cleaning up after failed test runs

---

## Success Criteria

**Definition of "tested":**
- ✅ All critical paths have E2E tests
- ✅ All client API functions have integration tests
- ✅ All RLS policies verified with real database
- ✅ Real-time behavior tested (no mocks)
- ✅ CI pipeline runs all tests
- ✅ Tests run fast (<5min total)

**Not required for MVP:**
- ❌ 100% code coverage
- ❌ Visual regression tests
- ❌ Performance tests
- ❌ Load/stress tests

---

## Next Steps

1. **Read this plan** and confirm approach
2. **Set up Phase 1** (test infrastructure)
3. **Write first integration test** (client API init)
4. **Write first E2E test** (auth flow)
5. **Iterate and expand** based on learnings

**Estimated timeline:** 4 weeks for comprehensive test coverage
**Minimum viable:** 1 week for critical path tests only
