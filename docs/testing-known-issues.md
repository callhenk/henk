# Testing Infrastructure - Known Issues

## Current Status

✅ **Working:**
- Unit tests for utilities (40/40 passing in formatting.test.ts)
- Test configuration and setup
- Test scripts
- CI/CD pipeline configuration
- Test helpers and factories
- Seed data

❌ **Needs Attention:**

### 1. Component Tests (Button)

**Issue:** React JSX runtime import resolution error

**File:** `packages/ui/src/shadcn/button.test.tsx`

**Error:**
```
Failed to resolve import "react/jsx-dev-runtime" from "packages/ui/src/shadcn/button.test.tsx"
```

**Possible Solutions:**
- Add React to vitest's `resolve.conditions`
- Create a custom vite plugin to handle React imports
- Use a different test environment configuration for component tests
- May need to install React at the workspace root level

**Priority:** Medium - Component tests are important but unit tests work

---

### 2. Integration Tests (Campaigns API)

**Issue:** Supabase client import resolution error

**File:** `apps/web/app/api/campaigns/route.integration.test.ts`

**Error:**
```
Failed to resolve import "@supabase/supabase-js" from "apps/web/lib/test/supabase-test-client.ts"
```

**Possible Solutions:**
- Install `@supabase/supabase-js` at workspace root level
- Add better module resolution for monorepo packages
- Use vitest's `server.deps.inline` configuration
- May need to configure vitest to properly handle the monorepo structure

**Priority:** High - Integration tests are critical for API testing

**Workaround:** For now, integration tests can be written but need Supabase to be properly linked

---

### 3. CI/CD Pipeline Not Tested

**Issue:** GitHub Actions workflow created but not yet tested in actual CI environment

**File:** `.github/workflows/ci.yml`

**Next Steps:**
- Push to a branch and create a PR to test the pipeline
- May need to adjust job configurations based on actual CI environment
- Add secrets/env vars to GitHub repo settings (if needed)
- Test coverage upload to Codecov (needs CODECOV_TOKEN)

**Priority:** Medium - Can test manually for now

---

### 4. Database Tests Not Yet Written

**Issue:** Supabase test directory exists but no pgTAP tests written yet

**Location:** `apps/web/supabase/tests/`

**Next Steps:**
- Write RLS policy tests (Phase 2 of QA Plan)
- Write database function tests
- Add migration verification tests

**Priority:** High - Part of Phase 2

---

### 5. E2E Tests Limited Coverage

**Issue:** Only authentication and account flows tested

**Current E2E Coverage:** ~5%

**Missing:**
- Donors/Contacts management
- Campaigns creation and management
- Agents configuration
- Integrations (OAuth flows)
- Conversations tracking
- Workflow builder
- Analytics

**Priority:** Medium - Part of Phase 5

---

## Recommendations

### Immediate Actions (This Week)

1. **Fix Integration Tests:**
   - Install `@supabase/supabase-js` at root: `pnpm add -D -w @supabase/supabase-js`
   - Verify imports work correctly
   - Run integration tests to ensure API testing works

2. **Fix Component Tests:**
   - Research React import resolution in Vitest + monorepo
   - Try installing React at workspace root
   - Test button component tests work

3. **Test CI Pipeline:**
   - Create a test branch
   - Open a PR
   - Watch the GitHub Actions run
   - Fix any issues that arise

### Short Term (Next 2 Weeks) - Phase 2

4. **Write Database Tests:**
   - Start with critical RLS policies (contacts, campaigns, businesses)
   - Add tests for any custom database functions
   - Document database test patterns

5. **Expand Unit Tests:**
   - Add tests for other utility files
   - Add tests for validation schemas
   - Target 70% code coverage

### Medium Term (Next Month) - Phases 3-5

6. **Integration Tests for All API Routes:**
   - Campaigns API (already started)
   - Agents API
   - Contacts API
   - Integrations API (with mocked external services)

7. **Expand E2E Coverage:**
   - Add Playwright tests for main features
   - Follow page object pattern
   - Target 40% feature coverage

## Workarounds

Until the issues are fixed, you can:

1. **For Component Tests:**
   - Write unit tests for business logic instead
   - Test components manually
   - Focus on utility and integration tests

2. **For Integration Tests:**
   - Write API tests as unit tests by mocking Supabase
   - Test database operations separately
   - Use Postman/Insomnia for manual API testing

3. **For CI/CD:**
   - Run tests locally before pushing
   - Use pre-commit hooks (can be added)
   - Manual testing workflow

## Help Needed

If you need help with any of these issues:

1. **React Import Resolution:**
   - Check Vitest docs for monorepo setup
   - Look at similar projects (e.g., shadcn/ui source)
   - Consider posting on Vitest Discord

2. **Supabase Client Resolution:**
   - Review monorepo package linking
   - Check if workspace protocol needs to be used
   - Verify pnpm workspace configuration

3. **CI/CD:**
   - GitHub Actions documentation
   - Codecov setup guide
   - Supabase CI documentation

---

**Last Updated:** 2025-11-01

**Next Review:** After fixing immediate actions above
