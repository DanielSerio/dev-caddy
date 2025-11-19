# DevCaddy Testing Infrastructure

Automated testing setup using Playwright (E2E) and Vitest (integration tests) with ephemeral Supabase branches for database isolation.

---

## Quick Start

### Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked:**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

3. **Environment variables set:**
   ```bash
   # In .env or .env.local
   VITE_DEVCADDY_SUPABASE_URL=https://xxx.supabase.co
   VITE_DEVCADDY_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### Running Tests

```bash
# Integration tests (client API, no browser)
npm run test:integration

# E2E tests (full browser tests)
npm run test:e2e

# E2E tests with UI (interactive debugging)
npm run test:e2e:ui

# Run all tests
npm run test:all

# Cleanup orphaned test branches
npm run test:cleanup
```

---

## How It Works

### Ephemeral Test Branches

Each test run creates a temporary Supabase branch with an isolated database:

1. **Before tests:** Create branch `test-{timestamp}`
2. **During tests:** Use branch-specific database URL
3. **After tests:** Delete branch automatically

**Benefits:**
- ✅ Complete isolation between test runs
- ✅ No manual database cleanup needed
- ✅ Migrations automatically applied to branch
- ✅ Safe to run tests in parallel (each gets own branch)

### Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests (browser-based)
│   └── auth.spec.ts        # Authentication flow tests
├── integration/            # Vitest integration tests (API-only)
│   └── client-init.test.ts # Client initialization tests
├── fixtures/               # Shared test data and utilities
├── setup/                  # Test infrastructure
│   ├── branch-manager.ts   # Supabase branch management
│   ├── global-setup.ts     # Playwright setup (creates branch)
│   ├── global-teardown.ts  # Playwright teardown (deletes branch)
│   └── vitest-setup.ts     # Vitest setup (branch lifecycle)
└── scripts/                # Utility scripts
    └── cleanup-branches.ts # Manual branch cleanup
```

---

## Writing Tests

### Integration Tests (Vitest)

Test client API operations without browser:

```typescript
// tests/integration/example.test.ts
import { describe, it, expect } from 'vitest';
import { initDevCaddy, getSupabaseClient } from '../../packages/src/client';

describe('Feature Name', () => {
  it('should do something', async () => {
    const client = getSupabaseClient();
    // Test client operations
  });
});
```

### E2E Tests (Playwright)

Test complete user flows with browser:

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

---

## Manual Branch Management

For debugging or persistent test environments:

```bash
# Create persistent test branch
npm run test:branch:create

# Reset branch database (re-run migrations)
npm run test:branch:reset

# Delete branch
npm run test:branch:delete
```

---

## Troubleshooting

### "Branch already exists" Error

**Cause:** Previous test run didn't cleanup properly.

**Fix:**
```bash
npm run test:cleanup
```

### "Supabase CLI not found"

**Cause:** Supabase CLI not installed globally.

**Fix:**
```bash
npm install -g supabase
```

### Tests Timeout During Branch Creation

**Cause:** Supabase branch creation can take 60-90 seconds.

**Fix:** Timeouts are already set to 120s. If still timing out, check Supabase status.

### "Project not linked" Error

**Cause:** Supabase CLI not linked to project.

**Fix:**
```bash
npx supabase link --project-ref your-project-ref
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      # Install Supabase CLI
      - run: npm install -g supabase

      # Link to project
      - run: npx supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      # Install dependencies
      - run: npm install

      # Run tests
      - run: npm run test:all
        env:
          VITE_DEVCADDY_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_DEVCADDY_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      # Cleanup orphaned branches
      - run: npm run test:cleanup
        if: always()
```

---

## Performance Notes

- **Branch creation:** ~60-90 seconds
- **Branch deletion:** ~10-20 seconds
- **Test execution:** Varies by test complexity
- **Parallel tests:** Each needs its own branch (use workers: 1 on CI)

---

## Future Enhancements

- [ ] Parallel test execution with multiple branches
- [ ] Shared test fixtures for common data
- [ ] Visual regression testing integration
- [ ] Performance benchmarking
- [ ] Test coverage reports

---

## Additional Resources

- **Playwright Docs:** https://playwright.dev/docs/intro
- **Vitest Docs:** https://vitest.dev/guide/
- **Supabase Branches:** https://supabase.com/docs/guides/platform/branching
- **Testing Best Practices:** `docs/IMPLEMENTATION.md`
