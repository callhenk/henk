# Testing Guide for Henk

This document explains the testing infrastructure in the Henk project. We use a **three-tier testing approach** to ensure code quality at different levels.

## Why Multiple Test Types?

Different test types serve different purposes:

- **Unit Tests** - Fast, isolated tests for individual functions and components
- **Integration Tests** - Test how multiple parts work together (database, APIs)
- **E2E Tests** - Test complete user workflows in a real browser

This approach follows the **Testing Pyramid** principle:

```
        /\
       /E2E\       ← Few, slow, high-value
      /------\
     /  INT  \     ← Some, moderate speed
    /--------\
   /   UNIT   \    ← Many, fast, focused
  /------------\
```

## Test Types Overview

### 1. Unit Tests (Vitest + jsdom)

**Purpose:** Test individual functions, utilities, and React components in isolation

**Location:** `apps/web/lib/**/*.{test,spec}.{ts,tsx}` and `packages/*/src/**/*.{test,spec}.{ts,tsx}`

**Environment:** jsdom (simulates browser DOM for React component testing)

**Configuration:** `vitest.config.ts`

**Example Test File:** `apps/web/lib/utils/formatting.test.ts`

```typescript
describe('formatPhoneNumber', () => {
  it('formats 10-digit US phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });
});
```

**When to Use:**

- Testing utility functions (formatting, validation, etc.)
- Testing React components without external dependencies
- Testing business logic in isolation
- Quick feedback during development

**How to Run:**

```bash
# Run all unit tests once
pnpm test:unit

# Run in watch mode (re-runs on file changes)
pnpm test:unit:watch

# Run with UI dashboard
pnpm test:unit:ui

# Run with coverage report
pnpm test:coverage
```

**Coverage Requirements:**

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

---

### 2. Integration Tests (Vitest + Node)

**Purpose:** Test how different parts of the system work together (database queries, API routes, Supabase hooks)

**Location:** `**/*.integration.{test,spec}.{ts,tsx}` across the project

**Environment:** node (for database and server-side testing)

**Configuration:** `vitest.integration.config.ts`

**Example Test Files:**

- `apps/web/lib/test/database.integration.test.ts`
- `apps/web/lib/test/smoke.integration.test.ts`

**When to Use:**

- Testing database queries and RLS policies
- Testing API routes
- Testing Supabase hooks that interact with the database
- Testing data transformations that involve external services
- Verifying multi-table operations work correctly

**How to Run:**

```bash
# Run all integration tests once
pnpm test:integration

# Run in watch mode
pnpm test:integration:watch
```

**Important Notes:**

- Requires local Supabase instance running (`pnpm supabase:start`)
- Uses longer timeouts (30 seconds) for database operations
- May create/modify test data in local database
- Should reset database state after tests

---

### 3. E2E Tests (Playwright)

**Purpose:** Test complete user workflows in real browsers (Chrome, Firefox, Safari)

**Location:** `apps/e2e/tests/**/*.spec.ts`

**Framework:** Playwright (browser automation)

**Test Categories:**

- `tests/core-functionality/` - Critical user paths (e.g., smoke-test.spec.ts)
- `tests/authentication/` - Login, signup, password reset flows
- `tests/pages/` - Individual page functionality (agents, campaigns, donors, etc.)

**When to Use:**

- Testing complete user workflows (sign up → create campaign → view results)
- Testing browser-specific behavior
- Testing UI interactions across pages
- Verifying critical business paths work end-to-end
- Before production deployments

**How to Run:**

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests directly (from project root)
pnpm test:e2e:only

# Run smoke tests only (critical functionality)
pnpm test:smoke

# Run page-specific tests
pnpm test:pages

# Run with Playwright UI (visual test runner)
cd apps/e2e && pnpm exec playwright test --ui

# Run specific test file
cd apps/e2e && pnpm exec playwright test tests/pages/agents.spec.ts

# Debug mode (step through tests)
cd apps/e2e && pnpm exec playwright test --debug
```

**Configuration:** `apps/e2e/playwright.config.ts`

**Important Notes:**

- Tests run in headless mode by default (no visible browser)
- Can run in multiple browsers simultaneously
- Slower than unit/integration tests
- Should be run before merging to main branch

---

## Test Commands Reference

All test commands are defined in the root `package.json`:

### Quick Commands

```bash
# Run all tests (unit, integration, E2E)
pnpm test:all

# Complete test suite with reporting
pnpm test:complete

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run only E2E tests
pnpm test:e2e
```

### Development Commands

```bash
# Watch mode for unit tests (auto-rerun on changes)
pnpm test:unit:watch

# Watch mode for integration tests
pnpm test:integration:watch

# Visual test UI
pnpm test:unit:ui
```

### Coverage Commands

```bash
# Generate coverage report
pnpm test:coverage

# View coverage report (after running test:coverage)
open coverage/index.html
```

### Specialized E2E Commands

```bash
# Quick smoke test (critical paths only)
pnpm test:smoke

# Test all pages
pnpm test:pages

# Run E2E from anywhere in monorepo
pnpm test:e2e:only
```

---

## Testing Workflow

### During Development

```bash
# 1. Start local services
pnpm supabase:start
pnpm dev

# 2. Run unit tests in watch mode
pnpm test:unit:watch

# 3. Write code and tests side-by-side
# Tests auto-run on save
```

### Before Committing

```bash
# 1. Run type checking
pnpm typecheck

# 2. Run linting
pnpm lint

# 3. Run unit tests
pnpm test:unit

# 4. Run integration tests (if you changed database code)
pnpm test:integration

# 5. (Optional) Run smoke tests
pnpm test:smoke
```

### Before Merging to Main

```bash
# Run complete test suite
pnpm test:all

# Or use the comprehensive test command
pnpm test:complete
```

### Before Production Deployment

```bash
# 1. Run all tests
pnpm test:all

# 2. Check coverage
pnpm test:coverage

# 3. Build production bundle
pnpm build

# 4. Run E2E tests against production build
pnpm build && pnpm start
# (in another terminal)
pnpm test:e2e
```

---

## Writing Tests

### Unit Test Example

```typescript
// apps/web/lib/utils/formatting.test.ts
import { describe, expect, it } from 'vitest';

import { formatPhoneNumber } from './formatting';

describe('formatPhoneNumber', () => {
  it('formats 10-digit US phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('handles null input', () => {
    expect(formatPhoneNumber(null)).toBe('N/A');
  });

  it('preserves already formatted numbers', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
  });
});
```

### Integration Test Example

```typescript
// apps/web/lib/test/contacts.integration.test.ts
import { createClient } from '@/lib/supabase/server';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Contact Management', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = await createClient();
  });

  it('creates contact with proper business scoping', async () => {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        business_id: testBusinessId,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.business_id).toBe(testBusinessId);
  });

  it('enforces RLS policies', async () => {
    // Test that users can't access other businesses' contacts
    const { data, error } = await supabase
      .from('contacts')
      .select()
      .eq('business_id', 'different-business-id');

    expect(data).toHaveLength(0);
  });
});
```

### E2E Test Example

```typescript
// apps/e2e/tests/pages/agents.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Agent Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('[name="email"]', 'cyrus@callhenk.com');
    await page.fill('[name="password"]', 'Test123?');
    await page.click('button[type="submit"]');
    await page.waitForURL('/home');
  });

  test('creates new agent', async ({ page }) => {
    await page.goto('/home/agents');
    await page.click('text=Create Agent');

    await page.fill('[name="name"]', 'Test Agent');
    await page.fill('[name="prompt"]', 'You are a helpful assistant');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=Test Agent')).toBeVisible();
  });
});
```

---

## Test File Naming Conventions

- **Unit Tests:** `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- **Integration Tests:** `*.integration.test.ts`, `*.integration.spec.ts`
- **E2E Tests:** `*.spec.ts` (in `apps/e2e/tests/` directory)

---

## CI/CD Integration

Tests should run automatically in your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    pnpm install
    pnpm supabase:start
    pnpm test:unit
    pnpm test:integration
    pnpm test:e2e
```

---

## Troubleshooting

### Unit Tests Failing

```bash
# Clear cache and re-run
rm -rf .turbo
pnpm test:unit
```

### Integration Tests Failing

```bash
# Ensure Supabase is running
pnpm supabase:status

# Reset database if needed
pnpm supabase:reset

# Re-run tests
pnpm test:integration
```

### E2E Tests Failing

```bash
# Install Playwright browsers
cd apps/e2e
pnpm exec playwright install

# Run with debug mode
pnpm exec playwright test --debug

# Run with visible browser
pnpm exec playwright test --headed
```

### "Module not found" errors

```bash
# Regenerate types
pnpm supabase:typegen

# Check TypeScript
pnpm typecheck
```

---

## Best Practices

1. **Write tests as you code** - Don't leave testing for later
2. **Follow the Testing Pyramid** - More unit tests, fewer E2E tests
3. **Test behavior, not implementation** - Focus on what the code does, not how
4. **Keep tests independent** - Each test should run in isolation
5. **Use descriptive test names** - `it('formats 10-digit phone numbers')` is better than `it('works')`
6. **Mock external dependencies** - Don't call real APIs in unit tests
7. **Reset state in integration tests** - Don't let tests affect each other
8. **Use fixtures for E2E tests** - Set up consistent test data
9. **Test edge cases** - Null values, empty arrays, invalid input
10. **Aim for high coverage** - But don't sacrifice quality for quantity

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/) (for React component testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/local-development#testing)

---

## Summary

**Quick Reference:**

| Test Type   | Command                 | When to Use                               | Speed      |
| ----------- | ----------------------- | ----------------------------------------- | ---------- |
| Unit        | `pnpm test:unit`        | Testing functions/components in isolation | ⚡ Fast    |
| Integration | `pnpm test:integration` | Testing database/API interactions         | 🐢 Medium  |
| E2E         | `pnpm test:e2e`         | Testing complete user workflows           | 🐌 Slow    |
| All         | `pnpm test:all`         | Before merging/deploying                  | 🐌 Slowest |
| Smoke       | `pnpm test:smoke`       | Quick critical path check                 | 🐢 Medium  |

**Golden Rule:** If you're unsure which test type to use, start with a unit test. Only move to integration/E2E tests if you need to test interactions between multiple systems.
