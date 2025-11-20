# Billing E2E Tests

Comprehensive end-to-end tests for the billing system including usage limits and billing settings.

## Test Files

### **1. usage-limits.spec.ts**

Tests for usage limit enforcement workflow

### **2. billing-settings.spec.ts**

Tests for billing settings page functionality

## What These Tests Cover

### Usage Limits Tests (usage-limits.spec.ts)

#### 1. **Agent Limits**

- ✅ Creating agents within limit (button enabled, panel opens)
- ✅ Upgrade badge appears when limit reached
- ✅ Tooltip shows limit message on hover
- ✅ Upgrade dialog opens when clicking at limit
- ✅ "View Plans" button navigates to billing page
- ✅ Server-side enforcement (cannot bypass via UI)

### 2. **Campaign Limits**

- ✅ Creating campaigns up to limit
- ✅ Upgrade prompt when limit reached
- ✅ Dialog navigation to billing page

### 3. **Contact Limits**

- ✅ Creating contacts up to limit (5 contacts)
- ✅ Upgrade prompt on "Add Lead" button
- ✅ Upgrade prompt on "Import" button
- ✅ Correct messaging about contact limits

### 4. **Billing Page Integration**

- ✅ Usage metrics display on billing page
- ✅ Manual sync button works
- ✅ Usage counts match database

### Billing Settings Tests (billing-settings.spec.ts)

#### 1. **Page Navigation**

- ✅ Navigate from sidebar to billing settings
- ✅ Direct URL navigation works
- ✅ Page loads without errors

#### 2. **Current Plan Display**

- ✅ Shows current plan information
- ✅ Displays plan features
- ✅ Shows plan name and details

#### 3. **Usage & Limits Display**

- ✅ Usage & Limits card visible
- ✅ Shows metrics for agents, campaigns, contacts
- ✅ Progress bars/indicators display
- ✅ Current vs limit formatting (e.g., "2 / 5")

#### 4. **Usage Sync**

- ✅ Refresh/sync button exists
- ✅ Clicking refresh syncs usage
- ✅ Updates reflect in UI

#### 5. **Plan Upgrade**

- ✅ Upgrade buttons/CTAs visible when needed
- ✅ Available plans displayed
- ✅ Pricing information shown

#### 6. **Accessibility & UX**

- ✅ Clear section headings
- ✅ Responsive on mobile
- ✅ No layout shifts
- ✅ Loading states handled

#### 7. **Error Handling**

- ✅ Handles missing subscription gracefully
- ✅ Shows appropriate fallbacks

## Test Data Setup

The tests automatically create a test user with a **limited plan**:

```typescript
{
  agents: 1,        // Can create only 1 agent
  campaigns: 2,     // Can create only 2 campaigns
  contacts: 5,      // Can create only 5 contacts
  team_members: 2,  // Can have only 2 team members
}
```

## Running the Tests

### Prerequisites

1. **Local Supabase running:**

   ```bash
   # From project root
   pnpm supabase:start
   ```

   This will start Supabase on `http://127.0.0.1:54321`

2. **Web app running:**

   ```bash
   # From project root
   pnpm dev
   ```

3. **Environment variables (Optional):**

   The test utility uses default local Supabase keys as fallbacks.

   If you need to override, create `apps/e2e/.env`:

   ```bash
   cp apps/e2e/.env.example apps/e2e/.env
   ```

   Default values (already set in code):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (local dev key)
   ```

### Run Tests

```bash
# Run all billing tests
cd apps/e2e
pnpm playwright test tests/features/billing/usage-limits.spec.ts

# Run in headed mode (see browser)
pnpm playwright test tests/features/billing/usage-limits.spec.ts --headed

# Run specific test
pnpm playwright test tests/features/billing/usage-limits.spec.ts -g "should show upgrade prompt when agent limit reached"

# Debug mode
pnpm playwright test tests/features/billing/usage-limits.spec.ts --debug
```

### View Test Report

```bash
pnpm playwright show-report
```

## Test Flow

### Agent Limit Test Flow

```
1. Create test user with limit of 1 agent
2. Login to application
3. Navigate to /home/agents
4. Verify "Create Agent" button is enabled (no badge)
5. Create first agent (should succeed)
6. Return to agents page
7. Verify "Create Agent" button now has "Upgrade" badge
8. Hover button → Verify tooltip appears
9. Click button → Verify upgrade dialog opens
10. Click "View Plans" → Verify navigates to billing page
```

### Campaign Limit Test Flow

```
1. Navigate to /home/campaigns
2. Create 2 campaigns (limit is 2)
3. Try to create 3rd campaign
4. Verify upgrade prompt appears
5. Verify navigation to billing
```

### Contact Limit Test Flow

```
1. Navigate to /home/leads
2. Create 5 contacts (limit is 5)
3. Try to add 6th contact
4. Verify upgrade prompt appears
5. Test import button also shows upgrade
```

## Database Cleanup

Tests automatically clean up after themselves:

- Deletes test user
- Deletes associated business
- Deletes all related resources (agents, campaigns, leads)
- Deletes billing plan and subscription
- Deletes usage records

## Debugging Failed Tests

### Check Database State

```typescript
import { getCurrentUsage } from '../../utils/test-db-setup';

// In your test
const usage = await getCurrentUsage(testBusinessId);
console.log('Current usage:', usage);
```

### Check Screenshots

Failed tests automatically take screenshots:

```
apps/e2e/test-results/
  usage-limits-<test-name>/
    test-failed-1.png
```

### Common Issues

**Error: "supabaseKey is required":**

```bash
# Solution 1: Make sure Supabase is running
pnpm supabase:start

# Solution 2: Check that you're using correct URL
# Should be: http://127.0.0.1:54321 (not localhost:54321)

# Solution 3: Verify service key is set
echo $SUPABASE_SERVICE_ROLE_KEY
# If empty, the test will use the default local dev key
```

**Test fails with "Button not found":**

- Check if UI components loaded properly
- Verify selector matches current UI structure
- Look at screenshot to see actual page state

**Test fails with "Usage limit not enforced":**

- Verify billing tables exist in database
- Check that `increment_usage` RPC function exists
- Manually sync usage: click refresh button on billing page
- Run migrations: `pnpm supabase:reset`

**Test fails with "Cannot create test user":**

```bash
# Verify Supabase is running
pnpm supabase:status

# If not running, start it
pnpm supabase:start

# Reset database if needed
pnpm supabase:reset

# Check migrations are applied
cd apps/web
supabase db diff --schema public
```

**Database connection refused:**

```bash
# Make sure you're in the project root
cd /path/to/henk

# Stop any existing Supabase
pnpm supabase:stop

# Start fresh
pnpm supabase:start

# Verify it's running
curl http://127.0.0.1:54321/rest/v1/
```

## Extending Tests

### Adding New Resource Type Tests

```typescript
test.describe('Integration Limits', () => {
  test('should show upgrade prompt when integration limit reached', async ({
    page,
  }) => {
    // Create test data with integration limit
    await createTestUserWithLimitedPlan({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      businessName: 'Test',
      planLimits: {
        integrations: 3,
      },
    });

    // Navigate and test
    await page.goto('/home/integrations');
    // ... create integrations up to limit
    // ... verify upgrade prompt
  });
});
```

### Adding API-Level Tests

```typescript
test('should block agent creation via direct API call', async ({
  request,
  page,
}) => {
  // Get auth token
  const cookies = await page.context().cookies();

  // Try to create via API
  const response = await request.post('/api/agents', {
    headers: {
      Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
    },
    data: {
      name: 'Test Agent',
      // ...
    },
  });

  // Should return 400 or 403 with limit error
  expect(response.status()).toBeGreaterThanOrEqual(400);
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: pnpm supabase:start

      - name: Run E2E Tests
        run: |
          cd apps/e2e
          pnpm playwright test tests/features/billing/usage-limits.spec.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Maintenance

### When to Update Tests

- ✅ UI changes (new button text, different selectors)
- ✅ Limit values change
- ✅ New resource types added
- ✅ Billing flow changes
- ✅ Database schema changes

### Keeping Tests Stable

1. Use data-testid attributes for critical elements
2. Keep selectors flexible (`:has-text()` instead of exact class names)
3. Add waits for network operations
4. Use `waitForLoadState('networkidle')` after navigation
5. Clean up test data in `afterAll` hooks
