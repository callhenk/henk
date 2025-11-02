# Henk QA & Testing Strategy

## Executive Summary

This document outlines a comprehensive Quality Assurance plan for the Henk platform. The strategy leverages Supabase local instances for isolated testing, implements multiple testing layers (unit, integration, E2E), and establishes CI/CD pipelines for automated quality gates.

**Current State:** Basic E2E tests with Playwright covering authentication flows only.

**Goal:** Comprehensive testing coverage across all layers with automated CI/CD pipeline.

---

## Table of Contents

1. [Current Testing Infrastructure](#current-testing-infrastructure)
2. [Testing Strategy Overview](#testing-strategy-overview)
3. [Supabase Local Testing Strategy](#supabase-local-testing-strategy)
4. [Testing Layers](#testing-layers)
5. [Implementation Phases](#implementation-phases)
6. [Testing Patterns & Examples](#testing-patterns--examples)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Success Metrics](#success-metrics)

---

## Current Testing Infrastructure

### What We Have

- ✅ Playwright E2E tests (auth & account flows)
- ✅ Test environment configuration (`.env.test`)
- ✅ Local Supabase instance capability
- ✅ Email testing with Inbucket
- ✅ Page Object pattern for E2E tests

### Critical Gaps

- ❌ No unit testing framework
- ❌ No integration tests
- ❌ No database tests (RLS, functions, migrations)
- ❌ No CI/CD pipeline
- ❌ Limited E2E coverage (~5% of features)
- ❌ No code coverage reporting

---

## Testing Strategy Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              E2E Tests (Playwright)                          │
│              - Critical user flows                           │
│              - Cross-feature integration                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│          Integration Tests (Vitest + Supabase)               │
│          - API routes                                        │
│          - Database operations                               │
│          - Third-party integrations (mocked)                 │
│          - React Query hooks                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Unit Tests (Vitest)                                   │
│        - Components                                          │
│        - Utilities                                           │
│        - Business logic                                      │
│        - Validation schemas                                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│      Database Tests (pgTAP)                                  │
│      - RLS policies                                          │
│      - Database functions                                    │
│      - Triggers                                              │
│      - Migrations                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Test Distribution Target

- **Unit Tests:** 70% (Fast, isolated, many)
- **Integration Tests:** 20% (Medium speed, external deps)
- **E2E Tests:** 10% (Slow, critical flows)
- **Database Tests:** Ongoing (Per feature)

---

## Supabase Local Testing Strategy

### Overview

Supabase local instances provide isolated, reproducible test environments. Each test suite can run against a fresh database with known state.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Development Machine                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐     ┌──────────────────┐               │
│  │  Test Suite     │────▶│  Supabase Local  │               │
│  │  (Vitest/Jest)  │     │  Instance        │               │
│  └─────────────────┘     │  Port: 54321     │               │
│                           │  DB: 54322       │               │
│  ┌─────────────────┐     │  Studio: 54323   │               │
│  │  E2E Tests      │────▶│  Inbucket: 54324 │               │
│  │  (Playwright)   │     └──────────────────┘               │
│  └─────────────────┘                                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline (GitHub Actions)            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Each Job Runs:                                               │
│  1. Start Supabase local (fresh instance)                     │
│  2. Run migrations                                            │
│  3. Seed test data                                            │
│  4. Execute tests                                             │
│  5. Stop Supabase                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Setup Patterns

#### 1. Database Test Setup (Before All Tests)

```bash
# Start fresh Supabase instance
pnpm supabase:start

# Reset database to clean state
pnpm supabase:reset

# Apply migrations
pnpm supabase db push

# Seed test data
pnpm supabase db seed
```

#### 2. Test Data Management

**Seed File Structure:**

```sql
-- apps/web/supabase/seed.sql

-- Create test business
INSERT INTO businesses (id, name, slug, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Business',
  'test-business',
  NOW()
);

-- Create test user and team member
-- (Handled by Supabase Auth in test setup)

-- Create test integrations
INSERT INTO integrations (business_id, name, type, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Salesforce Test',
  'crm',
  'active'
);

-- Create test contacts
INSERT INTO contacts (business_id, first_name, last_name, email, source)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'John',
  'Doe',
  'john.doe@example.com',
  'manual'
);

-- Add more seed data for campaigns, agents, etc.
```

#### 3. Test Isolation Strategies

**Option A: Transaction Rollback (Fastest)**

```typescript
// Each test runs in a transaction that rolls back
beforeEach(async () => {
  await supabase.rpc('begin_test_transaction');
});

afterEach(async () => {
  await supabase.rpc('rollback_test_transaction');
});
```

**Option B: Database Reset (Most Thorough)**

```typescript
// Reset database between test suites
beforeAll(async () => {
  execSync('pnpm supabase:reset', { stdio: 'inherit' });
});
```

**Option C: Soft Delete Test Data (Recommended for Integration Tests)**

```typescript
// Clean up specific test data
afterEach(async () => {
  await supabase.from('contacts').delete().eq('email', 'like', '%test%');
});
```

### Environment Configuration

**`.env.test` (Already Exists)**

```bash
NEXT_PUBLIC_CI=true
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-dev-service-role-key>
EMAIL_SENDER=test@makerkit.dev
EMAIL_PORT=54325
EMAIL_HOST=localhost
EMAIL_TLS=false
ELEVENLABS_API_KEY=test_api_key_mock
```

**Test Helper for Supabase Client:**

```typescript
// lib/supabase/test-client.ts
import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

export function createTestClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for testing
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// Helper to create test user
export async function createTestUser(email: string, password: string) {
  const supabase = createTestClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm for tests
  });

  if (error) throw error;
  return data.user;
}

// Helper to create business context
export async function createTestBusiness(name: string, ownerId: string) {
  const supabase = createTestClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({ name, slug: name.toLowerCase().replace(/\s/g, '-') })
    .select()
    .single();

  if (error) throw error;

  // Add owner as team member
  await supabase.from('team_members').insert({
    business_id: business.id,
    user_id: ownerId,
    role: 'owner',
  });

  return business;
}
```

---

## Testing Layers

### 1. Database Tests (pgTAP)

**Purpose:** Verify database-level logic, RLS policies, functions, and triggers.

**Location:** `apps/web/supabase/tests/`

**Example: RLS Policy Test**

```sql
-- apps/web/supabase/tests/rls_policies_test.sql

BEGIN;
SELECT plan(5); -- Number of tests

-- Load the database schema
-- \i ../migrations/*.sql

-- Test: Users can only read their own business data
PREPARE user_isolation AS
  SELECT * FROM contacts
  WHERE business_id = '00000000-0000-0000-0000-000000000001';

-- Set the user context
SET request.jwt.claims = '{"sub": "user-id-1", "business_id": "00000000-0000-0000-0000-000000000001"}';

SELECT results_eq(
  'user_isolation',
  $$VALUES ('expected-contact-id'::uuid)$$,
  'Users can only see contacts from their business'
);

-- Test: Users cannot insert into other businesses
SET request.jwt.claims = '{"sub": "user-id-2", "business_id": "00000000-0000-0000-0000-000000000002"}';

SELECT throws_ok(
  $$INSERT INTO contacts (business_id, first_name, last_name, email)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Hacker', 'McHackface', 'hacker@example.com')$$,
  'new row violates row-level security policy',
  'Users cannot insert into other businesses'
);

-- More tests...

SELECT * FROM finish();
ROLLBACK;
```

**Run Command:**

```bash
pnpm supabase:test
```

### 2. Unit Tests (Vitest)

**Purpose:** Test individual components, utilities, and business logic in isolation.

**Setup Required:**

```bash
# Install Vitest and testing utilities
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jsdom happy-dom
```

**Configuration: `vitest.config.ts` (Root)**

```typescript
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@kit/ui': path.resolve(__dirname, './packages/ui/src'),
      '@kit/supabase': path.resolve(__dirname, './packages/supabase/src'),
    },
  },
});
```

**Setup File: `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
```

**Example: Component Test**

```typescript
// packages/ui/src/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

**Example: Utility Test**

```typescript
// lib/format-phone.test.ts
import { describe, expect, it } from 'vitest';

import { formatPhoneNumber } from './format-phone';

describe('formatPhoneNumber', () => {
  it('formats US phone numbers correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('+11234567890')).toBe('+1 (123) 456-7890');
  });

  it('handles invalid input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('abc')).toBe('abc');
  });

  it('preserves international numbers', () => {
    expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
  });
});
```

**Example: Validation Schema Test**

```typescript
// lib/validators/contact.test.ts
import { describe, expect, it } from 'vitest';

import { contactSchema } from './contact';

describe('contactSchema', () => {
  it('validates correct contact data', () => {
    const validContact = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
    };

    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidContact = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
    };

    const result = contactSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['email']);
    }
  });

  it('requires firstName and lastName', () => {
    const result = contactSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });
});
```

### 3. Integration Tests (Vitest + Supabase Local)

**Purpose:** Test interactions between components, API routes, database, and external services (mocked).

**Example: API Route Test**

```typescript
// app/api/contacts/route.test.ts
import {
  createTestBusiness,
  createTestClient,
  createTestUser,
} from '@/lib/supabase/test-client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from './route';

describe('Contacts API', () => {
  let testUser: any;
  let testBusiness: any;
  let supabase: any;

  beforeAll(async () => {
    // Start with clean database
    supabase = createTestClient();
    testUser = await createTestUser('test@henk.dev', 'password123');
    testBusiness = await createTestBusiness('Test Business', testUser.id);
  });

  afterAll(async () => {
    // Cleanup
    await supabase.auth.admin.deleteUser(testUser.id);
    await supabase.from('businesses').delete().eq('id', testBusiness.id);
  });

  beforeEach(async () => {
    // Clear contacts before each test
    await supabase.from('contacts').delete().eq('business_id', testBusiness.id);
  });

  describe('GET /api/contacts', () => {
    it('returns contacts for authenticated user', async () => {
      // Create test contact
      await supabase.from('contacts').insert({
        business_id: testBusiness.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        source: 'manual',
      });

      // Create mock request with auth
      const request = new Request('http://localhost:3000/api/contacts', {
        headers: {
          Authorization: `Bearer ${testUser.access_token}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.contacts).toHaveLength(1);
      expect(data.contacts[0].email).toBe('john@example.com');
    });

    it('returns 401 for unauthenticated request', async () => {
      const request = new Request('http://localhost:3000/api/contacts');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/contacts', () => {
    it('creates a new contact', async () => {
      const newContact = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      };

      const request = new Request('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser.access_token}`,
        },
        body: JSON.stringify(newContact),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.contact.email).toBe('jane@example.com');

      // Verify in database
      const { data: dbContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', 'jane@example.com')
        .single();

      expect(dbContact).toBeTruthy();
      expect(dbContact.first_name).toBe('Jane');
    });

    it('rejects duplicate email', async () => {
      // Create initial contact
      await supabase.from('contacts').insert({
        business_id: testBusiness.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'duplicate@example.com',
        source: 'manual',
      });

      // Try to create duplicate
      const request = new Request('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser.access_token}`,
        },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'duplicate@example.com',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

**Example: React Query Hook Test**

```typescript
// packages/supabase/src/hooks/contacts/use-contacts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContacts } from './use-contacts';
import { createTestClient, createTestUser, createTestBusiness } from '@/lib/supabase/test-client';

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useContacts', () => {
  let testUser: any;
  let testBusiness: any;
  let supabase: any;

  beforeAll(async () => {
    supabase = createTestClient();
    testUser = await createTestUser('test@henk.dev', 'password123');
    testBusiness = await createTestBusiness('Test Business', testUser.id);

    // Create test contacts
    await supabase.from('contacts').insert([
      {
        business_id: testBusiness.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        source: 'manual',
      },
      {
        business_id: testBusiness.id,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        source: 'salesforce',
      },
    ]);
  });

  afterAll(async () => {
    await supabase.from('contacts').delete().eq('business_id', testBusiness.id);
    await supabase.auth.admin.deleteUser(testUser.id);
  });

  it('fetches contacts for business', async () => {
    const { result } = renderHook(
      () => useContacts({ businessId: testBusiness.id }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].first_name).toBe('John');
  });

  it('filters contacts by source', async () => {
    const { result } = renderHook(
      () => useContacts({
        businessId: testBusiness.id,
        source: 'salesforce'
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].email).toBe('jane@example.com');
  });
});
```

**Example: Integration Test with Mocked External Service**

```typescript
// app/api/integrations/salesforce/callback/route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

// Mock Salesforce OAuth
vi.mock('@/lib/integrations/salesforce', () => ({
  exchangeCodeForTokens: vi.fn().mockResolvedValue({
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    instance_url: 'https://test.salesforce.com',
  }),
  getUserInfo: vi.fn().mockResolvedValue({
    user_id: 'salesforce_user_123',
    organization_id: 'salesforce_org_456',
  }),
}));

describe('Salesforce OAuth Callback', () => {
  it('exchanges code for tokens and updates integration', async () => {
    const request = new Request(
      'http://localhost:3000/api/integrations/salesforce/callback?code=test_code&state=test_state',
    );

    const response = await GET(request);

    expect(response.status).toBe(302); // Redirect
    expect(response.headers.get('Location')).toBe(
      '/home/integrations?success=true',
    );

    // Verify integration was updated in database
    // (Would query Supabase here to verify)
  });

  it('handles OAuth errors', async () => {
    const request = new Request(
      'http://localhost:3000/api/integrations/salesforce/callback?error=access_denied',
    );

    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('error=access_denied');
  });
});
```

### 4. E2E Tests (Playwright)

**Purpose:** Test complete user flows across the entire application.

**Expand Current Coverage:**

**Example: Donors/Contacts Flow**

```typescript
// apps/e2e/tests/donors/donors.spec.ts
import { expect, test } from '@playwright/test';

import { AuthPage } from '../authentication/auth.po';
import { DonorsPage } from './donors.po';

test.describe('Donors Management', () => {
  let authPage: AuthPage;
  let donorsPage: DonorsPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    donorsPage = new DonorsPage(page);

    // Sign in
    await authPage.signIn('test@henk.dev', 'password123');
  });

  test('should display donors list', async () => {
    await donorsPage.navigate();

    // Check table is visible
    expect(await donorsPage.isDonorsTableVisible()).toBe(true);

    // Check pagination
    expect(await donorsPage.getTotalDonors()).toBeGreaterThan(0);
  });

  test('should create new donor', async () => {
    await donorsPage.navigate();
    await donorsPage.clickAddDonor();

    // Fill form
    await donorsPage.fillDonorForm({
      firstName: 'Test',
      lastName: 'Donor',
      email: `test.donor.${Date.now()}@example.com`,
      phone: '+1234567890',
    });

    await donorsPage.submitDonorForm();

    // Verify success
    expect(await donorsPage.getSuccessMessage()).toContain('Donor created');

    // Verify in table
    expect(
      await donorsPage.findDonorByEmail(`test.donor.${Date.now()}@example.com`),
    ).toBeTruthy();
  });

  test('should import donors from CSV', async () => {
    await donorsPage.navigate();
    await donorsPage.clickImportCSV();

    // Upload CSV file
    await donorsPage.uploadCSVFile('./fixtures/donors.csv');

    // Map columns
    await donorsPage.mapCSVColumns({
      'First Name': 'firstName',
      'Last Name': 'lastName',
      Email: 'email',
    });

    await donorsPage.confirmImport();

    // Verify import success
    expect(await donorsPage.getImportSuccessCount()).toBeGreaterThan(0);
  });

  test('should filter donors by tags', async () => {
    await donorsPage.navigate();

    const initialCount = await donorsPage.getTotalDonors();

    // Apply tag filter
    await donorsPage.filterByTag('VIP');

    const filteredCount = await donorsPage.getTotalDonors();
    expect(filteredCount).toBeLessThan(initialCount);
  });

  test('should export donors to CSV', async () => {
    await donorsPage.navigate();

    const download = await donorsPage.exportToCSV();

    expect(download.suggestedFilename()).toContain('donors');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
```

**Example: Campaign Creation Flow**

```typescript
// apps/e2e/tests/campaigns/campaign-creation.spec.ts
import { expect, test } from '@playwright/test';

import { CampaignsPage } from './campaigns.po';
import { WorkflowBuilderPage } from './workflow-builder.po';

test.describe('Campaign Creation', () => {
  test('should create campaign with workflow', async ({ page }) => {
    const campaignsPage = new CampaignsPage(page);
    const workflowPage = new WorkflowBuilderPage(page);

    // Navigate and create campaign
    await campaignsPage.navigate();
    await campaignsPage.clickCreateCampaign();

    // Fill campaign details
    await campaignsPage.fillCampaignForm({
      name: `Test Campaign ${Date.now()}`,
      description: 'E2E test campaign',
      goal: '10000',
    });

    await campaignsPage.submitCampaignForm();

    // Build workflow
    await workflowPage.addNode('trigger', { type: 'schedule' });
    await workflowPage.addNode('action', { type: 'send_call' });
    await workflowPage.connectNodes('trigger-1', 'action-1');

    await workflowPage.saveWorkflow();

    // Verify campaign created
    expect(await campaignsPage.getCampaignStatus()).toBe('draft');
  });
});
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2) 🚀 HIGH PRIORITY

**Goal:** Establish testing infrastructure and CI/CD pipeline.

#### Tasks:

1. **Install Testing Dependencies**

   ```bash
   # Unit & Integration Testing
   pnpm add -D vitest @vitejs/plugin-react
   pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   pnpm add -D jsdom happy-dom

   # Coverage
   pnpm add -D @vitest/coverage-v8

   # MSW for API mocking
   pnpm add -D msw
   ```

2. **Create Configuration Files**
   - `vitest.config.ts` (root level)
   - `vitest.setup.ts` (test setup)
   - `.github/workflows/ci.yml` (CI pipeline)

3. **Setup Supabase Test Infrastructure**
   - Create seed file with comprehensive test data
   - Write test helper utilities (`test-client.ts`)
   - Document database reset procedures

4. **Create CI/CD Pipeline**

   ```yaml
   # .github/workflows/ci.yml
   name: CI

   on:
     pull_request:
     push:
       branches: [main]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - uses: pnpm/action-setup@v2
           with:
             version: 8

         - uses: actions/setup-node@v3
           with:
             node-version: 20
             cache: 'pnpm'

         - name: Install dependencies
           run: pnpm install

         - name: Start Supabase
           uses: supabase/setup-cli@v1
           with:
             version: latest

         - run: pnpm supabase:start

         - name: Run type check
           run: pnpm typecheck

         - name: Run linter
           run: pnpm lint

         - name: Run database tests
           run: pnpm supabase:test

         - name: Run unit tests
           run: pnpm test:unit

         - name: Run integration tests
           run: pnpm test:integration

         - name: Upload coverage
           uses: codecov/codecov-action@v3
           with:
             files: ./coverage/lcov.info

         - name: Run E2E tests
           run: pnpm test:e2e

         - uses: actions/upload-artifact@v3
           if: always()
           with:
             name: playwright-report
             path: apps/e2e/playwright-report/
   ```

5. **Add Test Scripts to package.json**
   ```json
   {
     "scripts": {
       "test": "turbo test",
       "test:unit": "vitest run --coverage",
       "test:unit:watch": "vitest watch",
       "test:integration": "vitest run --config vitest.integration.config.ts",
       "test:e2e": "turbo run test --filter=e2e",
       "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e",
       "test:coverage": "vitest run --coverage && open coverage/index.html"
     }
   }
   ```

**Deliverables:**

- ✅ Testing frameworks installed
- ✅ Configuration files created
- ✅ CI/CD pipeline running on PRs
- ✅ Code coverage reporting setup
- ✅ Documentation on running tests locally

---

### Phase 2: Database Testing (Weeks 2-3) 🔒 HIGH PRIORITY

**Goal:** Ensure database integrity, RLS policies, and migrations are tested.

#### Tasks:

1. **Write RLS Policy Tests**

   ```sql
   -- apps/web/supabase/tests/rls_contacts_test.sql
   -- Test contacts table policies

   -- apps/web/supabase/tests/rls_campaigns_test.sql
   -- Test campaigns table policies

   -- apps/web/supabase/tests/rls_integrations_test.sql
   -- Test integrations table policies
   ```

2. **Test Database Functions**

   ```sql
   -- apps/web/supabase/tests/functions_test.sql
   -- Test any custom database functions
   ```

3. **Migration Verification Tests**

   ```bash
   # Script to verify migrations apply cleanly
   # apps/web/supabase/scripts/verify-migrations.sh
   ```

4. **Create Test Data Factories**
   ```sql
   -- apps/web/supabase/tests/factories.sql
   -- Helper functions to create test data
   ```

**Deliverables:**

- ✅ All RLS policies have tests
- ✅ All database functions have tests
- ✅ Migration verification automated
- ✅ Test data factories for common entities

---

### Phase 3: Unit Testing (Weeks 3-5) 📦 HIGH PRIORITY

**Goal:** Achieve 70% code coverage for utilities, components, and business logic.

#### Priority Areas:

1. **Utilities (Week 3)**
   - Formatters (phone, currency, date)
   - Validators (Zod schemas)
   - Helpers (calculations, parsers)

2. **UI Components (Week 4)**
   - `packages/ui/src/button.test.tsx`
   - `packages/ui/src/input.test.tsx`
   - `packages/ui/src/dialog.test.tsx`
   - `packages/ui/src/data-table.test.tsx`
   - All shared components

3. **Business Logic (Week 5)**
   - Campaign calculations
   - Contact deduplication logic
   - Integration data transformers
   - Workflow validation

**Test Coverage Targets:**

- Utilities: 90%+
- UI Components: 80%+
- Business Logic: 85%+

**Deliverables:**

- ✅ All utilities have unit tests
- ✅ All UI components have unit tests
- ✅ All business logic has unit tests
- ✅ Overall code coverage >70%

---

### Phase 4: Integration Testing (Weeks 5-7) 🔌 HIGH PRIORITY

**Goal:** Test API routes, database operations, and third-party integrations.

#### Priority Areas:

1. **API Routes (Week 5-6)**
   - `/api/contacts/*` - CRUD operations
   - `/api/campaigns/*` - Campaign management
   - `/api/integrations/*` - Integration flows
   - `/api/agents/*` - Agent configuration
   - `/api/conversations/*` - Conversation tracking

2. **React Query Hooks (Week 6)**
   - `useContacts`, `useCreateContact`, `useUpdateContact`
   - `useCampaigns`, `useCreateCampaign`
   - `useIntegrations`, `useIntegrationMutations`
   - All mutation invalidation logic

3. **Third-Party Integration Mocks (Week 7)**
   - Salesforce API mocks
   - HubSpot API mocks
   - ElevenLabs API mocks
   - Twilio API mocks

**Setup MSW (Mock Service Worker):**

```typescript
// lib/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Mock Salesforce API
  rest.post(
    'https://login.salesforce.com/services/oauth2/token',
    (req, res, ctx) => {
      return res(
        ctx.json({
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          instance_url: 'https://test.salesforce.com',
        }),
      );
    },
  ),

  // Mock ElevenLabs API
  rest.post(
    'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.body(new Blob(['mock audio data'], { type: 'audio/mpeg' })),
      );
    },
  ),
];
```

**Deliverables:**

- ✅ All API routes have integration tests
- ✅ All React Query hooks have tests
- ✅ External services properly mocked
- ✅ Integration test coverage >80%

---

### Phase 5: E2E Testing Expansion (Weeks 7-9) 🎭 MEDIUM PRIORITY

**Goal:** Expand E2E coverage from 5% to 40% of critical user flows.

#### New Test Suites:

1. **Donors/Contacts (Week 7)**
   - List, filter, search donors
   - Create, edit, delete donor
   - Import from CSV
   - Export to CSV
   - Bulk operations

2. **Campaigns (Week 8)**
   - Create campaign
   - Configure campaign settings
   - Build workflow
   - Assign donor lists
   - Launch campaign
   - Monitor campaign progress

3. **Integrations (Week 8)**
   - Connect Salesforce
   - Sync Salesforce contacts
   - Connect HubSpot
   - Sync HubSpot contacts
   - Integration error handling

4. **Agents & Conversations (Week 9)**
   - Create AI agent
   - Configure agent voice
   - Test agent conversation
   - View conversation transcript
   - Analyze conversation metrics

5. **Analytics (Week 9)**
   - View dashboard metrics
   - Filter by date range
   - Export reports
   - Campaign performance

**Deliverables:**

- ✅ Donors E2E tests
- ✅ Campaigns E2E tests
- ✅ Integrations E2E tests
- ✅ Agents/Conversations E2E tests
- ✅ Analytics E2E tests
- ✅ E2E coverage of all major features

---

### Phase 6: Quality & Performance (Weeks 9-10) ⚡ MEDIUM PRIORITY

**Goal:** Add visual regression, performance, and security testing.

#### Tasks:

1. **Visual Regression Testing**

   ```bash
   # Install Percy or Chromatic
   pnpm add -D @percy/cli @percy/playwright
   ```

   ```typescript
   // Add to Playwright tests
   import percySnapshot from '@percy/playwright';

   test('donors page looks correct', async ({ page }) => {
     await page.goto('/home/donors');
     await percySnapshot(page, 'Donors Page');
   });
   ```

2. **Performance Testing**

   ```typescript
   // apps/e2e/tests/performance/load-times.spec.ts
   import { expect, test } from '@playwright/test';

   test('homepage loads under 2 seconds', async ({ page }) => {
     const start = Date.now();
     await page.goto('/home');
     const loadTime = Date.now() - start;

     expect(loadTime).toBeLessThan(2000);
   });
   ```

3. **Accessibility Testing**

   ```bash
   pnpm add -D @axe-core/playwright
   ```

   ```typescript
   import { expect, test } from '@playwright/test';
   import { checkA11y, injectAxe } from 'axe-playwright';

   test('donors page is accessible', async ({ page }) => {
     await page.goto('/home/donors');
     await injectAxe(page);
     await checkA11y(page);
   });
   ```

4. **Security Scanning**

   ```yaml
   # .github/workflows/security.yml
   - name: Run security audit
     run: pnpm audit

   - name: Run Snyk test
     uses: snyk/actions/node@master
   ```

**Deliverables:**

- ✅ Visual regression tests for key pages
- ✅ Performance budgets defined and monitored
- ✅ Accessibility tests passing WCAG 2.1 AA
- ✅ Automated security scans in CI

---

### Phase 7: Continuous Improvement (Ongoing) 🔄

**Goal:** Maintain high test quality and coverage as features evolve.

#### Processes:

1. **Test-Driven Development (TDD)**
   - Write tests before implementing features
   - Red-Green-Refactor cycle

2. **Code Coverage Gates**
   - Require 80% coverage for new code
   - Block PRs with decreasing coverage

3. **Test Maintenance**
   - Monthly test review
   - Remove flaky tests
   - Update tests for API changes

4. **Performance Monitoring**
   - Track test execution times
   - Optimize slow tests
   - Parallelize test suites

**Deliverables:**

- ✅ TDD process adopted by team
- ✅ Coverage gates enforced in CI
- ✅ Test maintenance schedule
- ✅ Performance monitoring dashboard

---

## Testing Patterns & Examples

### Pattern 1: Test Data Factory

```typescript
// lib/test/factories/contact.factory.ts
import type { Database } from '@/lib/database.types';
import { faker } from '@faker-js/faker';

type Contact = Database['public']['Tables']['contacts']['Insert'];

export function createContactData(overrides?: Partial<Contact>): Contact {
  return {
    business_id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+1##########'),
    source: 'manual',
    tags: [],
    custom_fields: {},
    ...overrides,
  };
}

export async function createContact(
  supabase: any,
  overrides?: Partial<Contact>,
) {
  const data = createContactData(overrides);
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return contact;
}
```

### Pattern 2: Custom Test Matchers

```typescript
// vitest.setup.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
    };
  },

  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const pass = phoneRegex.test(received.replace(/\s/g, ''));

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid phone number`
          : `Expected ${received} to be a valid phone number`,
    };
  },
});

// Usage:
expect('test@example.com').toBeValidEmail();
expect('+1234567890').toBeValidPhoneNumber();
```

### Pattern 3: Test Context Provider

```typescript
// lib/test/providers/test-providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseContext } from '@kit/supabase/context';
import { createTestClient } from '@/lib/supabase/test-client';

export function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const supabase = createTestClient();

  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SupabaseContext.Provider>
  );
}

// Usage:
render(
  <TestProviders>
    <MyComponent />
  </TestProviders>
);
```

### Pattern 4: Database Transaction Rollback

```typescript
// lib/test/utils/database.ts
import { createTestClient } from '@/lib/supabase/test-client';

export async function withTransaction<T>(
  callback: (supabase: any) => Promise<T>,
): Promise<T> {
  const supabase = createTestClient();

  // Start transaction
  await supabase.rpc('begin_test_transaction');

  try {
    const result = await callback(supabase);
    return result;
  } finally {
    // Rollback transaction
    await supabase.rpc('rollback_test_transaction');
  }
}

// Usage:
test('creates contact in transaction', async () => {
  await withTransaction(async (supabase) => {
    const contact = await createContact(supabase, {
      email: 'test@example.com',
    });

    expect(contact).toBeTruthy();
    // Transaction will rollback after test
  });
});
```

---

## CI/CD Pipeline

### Complete GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

env:
  NODE_VERSION: 20
  PNPM_VERSION: 8

jobs:
  # Job 1: Code Quality
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

  # Job 2: Database Tests
  database:
    name: Database Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: pnpm supabase:start

      - name: Run database tests
        run: pnpm supabase:test

      - name: Check database lint
        run: pnpm supabase:db:lint

  # Job 3: Unit Tests
  unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unit
          token: ${{ secrets.CODECOV_TOKEN }}

  # Job 4: Integration Tests
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: pnpm supabase:start

      - name: Run integration tests
        run: pnpm test:integration --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: integration
          token: ${{ secrets.CODECOV_TOKEN }}

  # Job 5: E2E Tests
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: pnpm supabase:start

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Build application
        run: pnpm build:test

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/e2e/playwright-report/
          retention-days: 30

  # Job 6: Build Test
  build:
    name: Build Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build production
        run: pnpm build

  # Job 7: Security Audit
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Run security audit
        run: pnpm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Pull Request Checks

All jobs must pass before PR can be merged:

- ✅ Code quality (type check, lint, format)
- ✅ Database tests pass
- ✅ Unit tests pass with >80% coverage
- ✅ Integration tests pass
- ✅ E2E tests pass
- ✅ Build succeeds
- ✅ No high/critical security vulnerabilities

---

## Success Metrics

### Coverage Targets

| Test Type      | Current | Phase 1 | Phase 3 | Phase 5 | Target |
| -------------- | ------- | ------- | ------- | ------- | ------ |
| Unit Tests     | 0%      | 30%     | 70%     | 75%     | 80%    |
| Integration    | 0%      | 20%     | 50%     | 70%     | 75%    |
| E2E (Features) | 5%      | 10%     | 25%     | 40%     | 50%    |
| Database (RLS) | 0%      | 80%     | 90%     | 95%     | 100%   |

### Quality Metrics

- **Test Execution Time:** <5 minutes for unit tests, <15 minutes total
- **Flaky Test Rate:** <2%
- **Bug Escape Rate:** <5% (bugs found in production vs. caught in tests)
- **Code Coverage Trend:** Must not decrease with new PRs

### CI/CD Metrics

- **Build Success Rate:** >95%
- **Average PR Time to Merge:** <2 hours (with passing tests)
- **Test Feedback Time:** <10 minutes for fast feedback loop

---

## Quick Start Guide

### Running Tests Locally

```bash
# Start Supabase local instance
pnpm supabase:start

# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests only
pnpm test:e2e           # E2E tests only
pnpm supabase:test      # Database tests only

# Watch mode for development
pnpm test:unit:watch

# With coverage
pnpm test:coverage
```

### Writing Your First Test

1. **Create test file next to source:**

   ```
   src/
     utils/
       format-phone.ts
       format-phone.test.ts  ← Create this
   ```

2. **Write test:**

   ```typescript
   import { describe, expect, it } from 'vitest';

   import { formatPhoneNumber } from './format-phone';

   describe('formatPhoneNumber', () => {
     it('formats US phone numbers', () => {
       expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
     });
   });
   ```

3. **Run test:**
   ```bash
   pnpm test:unit format-phone
   ```

---

## Resources & Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/database/testing)
- [pgTAP Documentation](https://pgtap.org/)

---

## Appendix: Test Checklist

### For Every New Feature

- [ ] Unit tests for utilities/logic
- [ ] Component tests for UI
- [ ] Integration tests for API routes
- [ ] Database tests for RLS policies
- [ ] E2E test for critical flow (if applicable)
- [ ] Tests pass in CI
- [ ] Coverage meets threshold

### For Every Bug Fix

- [ ] Write failing test that reproduces bug
- [ ] Fix bug
- [ ] Verify test now passes
- [ ] Add regression test to prevent recurrence

### Before Every Release

- [ ] All tests passing
- [ ] Coverage targets met
- [ ] E2E tests for new features
- [ ] Performance tests passing
- [ ] Security audit clean
- [ ] Visual regression tests reviewed

---

**Last Updated:** 2024-11-01
**Version:** 1.0
**Status:** Ready for Implementation
