# Core Functionality Smoke Tests

These E2E tests verify that the core functionality of the Henk platform works end-to-end through the UI.

## What Gets Tested

### ✓ User Flow

1. Login with real credentials
2. Navigate to main sections
3. Create core entities (contacts, campaigns, agents)
4. Search and filter data
5. Sign out

### ✓ Core Functionality

- **Contacts/Donors**: Create new contacts
- **Campaigns**: Create new campaigns
- **Agents**: Create new AI agents
- **Integrations**: View integration options
- **Search**: Search and filter functionality
- **Analytics**: Access dashboard/analytics

## Running the Tests

### Quick Run (Headless)

```bash
# From project root
pnpm test:e2e

# Or specifically run smoke tests
pnpm --filter e2e test tests/core-functionality/smoke-test.spec.ts
```

### Interactive Mode (See the browser)

```bash
# From project root
pnpm --filter e2e test:ui

# Then select the smoke test file to run
```

### Watch a Specific Test

```bash
cd apps/e2e
pnpm exec playwright test smoke-test.spec.ts --headed --slowMo=500
```

## Test Credentials

The tests use these credentials (already configured):

- **Email:** `cyrus@callhenk.com`
- **Password:** `Test123?`

## Prerequisites

1. **Application Running:**

   ```bash
   # Terminal 1: Start the app
   pnpm dev
   ```

2. **Database Ready:**
   Make sure Supabase is running if using local:

   ```bash
   pnpm supabase:web:start
   ```

3. **Playwright Installed:**
   ```bash
   pnpm exec playwright install chromium
   ```

## Understanding the Tests

Each test is designed to be **resilient**:

- If a button isn't found, the test skips gracefully
- Tests wait for elements to appear
- Tests verify success by checking for created items

### Test Structure

```typescript
test('can create a contact', async ({ page }) => {
  // 1. Navigate to section
  await page.click('text=Donors');

  // 2. Find and click create button
  const createButton = page
    .locator('button')
    .filter({ hasText: /Add|Create/ })
    .first();

  // 3. Fill form
  await page.fill('input[name="firstName"]', 'Test');

  // 4. Submit
  await page.click('button[type="submit"]');

  // 5. Verify success
  await expect(page.locator('text=Test')).toBeVisible();
});
```

## Troubleshooting

### Tests Failing?

1. **Check app is running:**

   ```bash
   curl http://localhost:3000
   ```

2. **Check credentials work:**
   - Try logging in manually at http://localhost:3000/auth/sign-in
   - Use: cyrus@callhenk.com / Test123?

3. **Check browser:**

   ```bash
   pnpm exec playwright install chromium
   ```

4. **Run in headed mode to see what's happening:**

   ```bash
   pnpm exec playwright test smoke-test.spec.ts --headed
   ```

5. **Check Playwright report:**
   ```bash
   pnpm --filter e2e report
   ```

### Common Issues

**"Timeout waiting for URL"**

- App might not be running
- Check `http://localhost:3000` is accessible

**"Element not found"**

- UI might have changed
- Check the selector in the test
- Run in headed mode to see the actual UI

**"Login failed"**

- Credentials might have changed
- Database might need resetting

## Viewing Results

After running tests:

```bash
# View HTML report
pnpm --filter e2e report

# View screenshots/videos (on failure)
ls apps/e2e/test-results/
```

## CI/CD Integration

These tests run automatically on:

- Pull requests
- Pushes to `main`

See `.github/workflows/ci.yml` for configuration.

## Adding More Tests

To add a new smoke test:

1. **Add to existing file:**

   ```typescript
   test('can create integration', async ({ page }) => {
     await page.click('text=Integrations');
     // ... rest of test
   });
   ```

2. **Create new file:**

   ```bash
   cp smoke-test.spec.ts advanced-workflow.spec.ts
   ```

3. **Follow the pattern:**
   - Use descriptive test names
   - Handle missing elements gracefully
   - Verify success conditions
   - Log progress with console.log

## Best Practices

✅ **DO:**

- Test real user workflows
- Use semantic selectors (text, role, label)
- Wait for elements to appear
- Verify success conditions
- Clean up test data if needed

❌ **DON'T:**

- Rely on brittle CSS class selectors
- Use hardcoded waits (use `waitFor` instead)
- Leave test data in production DB
- Test implementation details

## Next Steps

After smoke tests pass, consider:

1. **Expand coverage:**
   - Add tests for edge cases
   - Test error scenarios
   - Test complex workflows

2. **Performance:**
   - Add performance assertions
   - Monitor page load times

3. **Accessibility:**
   - Add a11y checks with @axe-core/playwright

---

**Questions?** Check the main testing documentation in `/docs/TESTING_QUICKSTART.md`
