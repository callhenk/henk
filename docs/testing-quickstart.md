# Testing Quick Start Guide

This guide will help you get started with the testing infrastructure that was just set up for the Henk platform.

## What Was Implemented

Phase 1 (Foundation) of the QA plan has been completed:

- ✅ Vitest configured for unit and integration testing
- ✅ Testing Library installed for component testing
- ✅ Supabase test helpers and factories
- ✅ Comprehensive seed data for testing
- ✅ GitHub Actions CI/CD pipeline
- ✅ Example tests (unit, component, integration)
- ✅ Test scripts in package.json

## Running Tests

### Run All Unit Tests
```bash
pnpm test:unit
```

### Run Tests in Watch Mode (for development)
```bash
pnpm test:unit:watch
```

### Run Integration Tests
```bash
# First, start Supabase local
pnpm supabase:web:start

# Then run integration tests
pnpm test:integration
```

### Run E2E Tests
```bash
pnpm test:e2e
```

### Run All Tests
```bash
pnpm test:all
```

### Get Coverage Report
```bash
pnpm test:coverage
```

## Example Tests Created

### 1. Unit Tests - Formatting Utilities
**File:** `apps/web/lib/utils/formatting.test.ts`

All 40 tests passing! Covers:
- Date formatting
- Relative time
- Phone number formatting
- Duration formatting
- Text truncation
- Number formatting

**Run:** `pnpm vitest run apps/web/lib/utils/formatting.test.ts`

### 2. Component Tests - Button
**File:** `packages/ui/src/shadcn/button.test.tsx`

Comprehensive button component tests covering all variants, sizes, and interactions.

### 3. Integration Tests - Campaigns API
**File:** `apps/web/app/api/campaigns/route.integration.test.ts`

Full API route testing with authentication, database operations, and business logic validation.

## Writing Your First Test

### Unit Test Example

Create a test file next to your source file:

```typescript
// lib/utils/my-util.ts
export function add(a: number, b: number) {
  return a + b;
}

// lib/utils/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './my-util';

describe('add', () => {
  it('adds two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### Component Test Example

```typescript
// MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
// route.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestContext, createTestClient } from '@/lib/test';

describe('My API Route', () => {
  let testContext;

  beforeAll(async () => {
    testContext = await createTestContext({
      email: `test-${Date.now()}@henk.dev`,
      businessName: 'Test Business',
    });
  });

  afterAll(async () => {
    // Cleanup
  });

  it('returns data for authenticated user', async () => {
    // Your test here
  });
});
```

## Test Helpers Available

### Supabase Test Client
```typescript
import { createTestClient } from '@/lib/test/supabase-test-client';

const supabase = createTestClient();
```

### Create Test Users and Businesses
```typescript
import { createTestContext } from '@/lib/test';

const { user, business, teamMember } = await createTestContext({
  email: 'test@henk.dev',
  businessName: 'Test Business',
  role: 'owner',
});
```

### Test Data Factories
```typescript
import {
  createContact,
  createContacts,
  createCampaign,
  createAgent,
  createIntegration,
} from '@/lib/test/factories';

// Create a single contact
const contact = await createContact(businessId, {
  first_name: 'John',
  last_name: 'Doe',
});

// Create multiple contacts
const contacts = await createContacts(businessId, 10);

// Create a campaign
const campaign = await createCampaign(businessId, {
  name: 'Test Campaign',
  status: 'active',
});
```

## Test Database Setup

### Start Supabase Local
```bash
pnpm supabase:web:start
```

### Reset Database
```bash
pnpm supabase:web:reset
```

### Seed Test Data
```bash
pnpm --filter web supabase:db:seed
```

The seed file (`apps/web/supabase/seed.sql`) creates:
- 1 test business
- 10 test contacts (donors)
- 4 contact lists
- 3 campaigns
- 2 agents
- 3 integrations
- 3 conversations
- 3 leads

## CI/CD Pipeline

Tests automatically run on:
- Pull requests to `main` or `develop`
- Pushes to `main`

The pipeline runs:
1. Code quality checks (typecheck, lint, format)
2. Database tests
3. Unit tests (with coverage)
4. Integration tests (with coverage)
5. E2E tests
6. Build verification
7. Security audit

**View Pipeline:** `.github/workflows/ci.yml`

## Coverage Thresholds

Current thresholds (set in `vitest.config.ts`):
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

These will increase as we add more tests in future phases.

## Custom Matchers

We've added custom test matchers in `vitest.setup.ts`:

```typescript
// Email validation
expect('test@example.com').toBeValidEmail();

// Phone number validation
expect('+1234567890').toBeValidPhoneNumber();

// UUID validation
expect('123e4567-e89b-12d3-a456-426614174000').toBeValidUUID();
```

## Debugging Tests

### Run Specific Test File
```bash
pnpm vitest run path/to/test.test.ts
```

### Run Tests Matching Pattern
```bash
pnpm vitest run --grep="formatPhoneNumber"
```

### Run With UI
```bash
pnpm test:unit:ui
```

### View Coverage HTML Report
```bash
pnpm test:coverage
open coverage/index.html
```

## Next Steps

See `docs/qa-plan.md` for the complete testing strategy and upcoming phases:

- **Phase 2:** Database tests (RLS policies, functions)
- **Phase 3:** Expand unit test coverage to 70%
- **Phase 4:** Integration tests for all API routes
- **Phase 5:** Comprehensive E2E test coverage
- **Phase 6:** Visual regression, performance, accessibility
- **Phase 7:** Continuous improvement

## Troubleshooting

### Tests Picking Up node_modules

The vitest config excludes `node_modules`. If you still see dependency tests, make sure you're using the updated `vitest.config.ts`.

### Import Resolution Errors

Check that your aliases are configured in `vitest.config.ts`:
- `@` → `apps/web`
- `@kit/ui` → `packages/ui/src`
- `@kit/supabase` → `packages/supabase/src`
- `~` → `apps/web` (alternative alias)

### Supabase Connection Issues

Make sure Supabase is running:
```bash
pnpm supabase:web:start
pnpm supabase:web:status
```

### React/JSX Errors

Component tests require `jsdom` environment. This is configured in `vitest.config.ts`:
```typescript
environment: 'jsdom',
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Complete QA Plan](./qa-plan.md)
- [Supabase Testing Guide](https://supabase.com/docs/guides/database/testing)

---

**Questions?** Check the full QA Plan in `docs/qa-plan.md` or ask in the team chat.
