# E2E Testing Setup Guide

This guide will help you set up your local environment for E2E testing with email verification.

## Overview

The E2E tests require:

1. **Local Supabase** running with Inbucket (email capture)
2. **Test account** created in local database
3. **Environment variables** pointing to local Supabase

## Step-by-Step Setup

### 1. Ensure Local Supabase is Running

```bash
# Start Supabase (includes Inbucket on port 54324)
cd apps/web
supabase start

# Verify it's running
supabase status
```

You should see:

```
API URL: http://127.0.0.1:54321
Inbucket URL: http://127.0.0.1:54324
```

### 2. Environment Configuration

The `.env.local` file has been created and points to local Supabase:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create Test Account

**Option A: Through the UI (Recommended)**

1. Start the dev server:

   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/auth/sign-up`

3. Sign up with:
   - Email: `cyrus@callhenk.com`
   - Password: `Test123?`

4. Check Inbucket for confirmation email:
   - Open: `http://localhost:54324`
   - Find email to `cyrus@callhenk.com`
   - Click the confirmation link

5. Complete onboarding to create a business

**Option B: Using Supabase Studio**

1. Open Supabase Studio: `http://localhost:54323`

2. Go to Authentication → Users → Add User

3. Create user:
   - Email: `cyrus@callhenk.com`
   - Password: `Test123?`
   - Auto Confirm: ✅ (check this box)

4. Run the seed file to create business:
   ```bash
   cd apps/web
   supabase db reset  # This will run seed.sql automatically
   ```

### 4. Verify Setup

Run a quick test to verify everything works:

```bash
# From project root
pnpm test:pages --grep "can view agents list"
```

This should:

- ✅ Start the dev server on localhost:3000
- ✅ Connect to local Supabase
- ✅ Login with cyrus@callhenk.com
- ✅ Pass the test

### 5. Run All Tests

```bash
# Run page-based tests (should all pass)
pnpm test:pages

# Run authentication tests (with email capture)
pnpm test:e2e:only tests/authentication/

# Run smoke test
pnpm test:smoke
```

## How Email Testing Works

### For Authentication Tests (Signup/Reset Password)

1. Test generates unique email: `cyrus+e2e-1234567890-123@callhenk.com`
2. Supabase sends confirmation email
3. **Local Supabase** → Email goes to **Inbucket** (port 54324)
4. Test checks Inbucket API for the email
5. Test extracts confirmation link and visits it
6. User is confirmed and test continues

### For Page Tests (Existing User)

1. Test logs in with: `cyrus@callhenk.com` / `Test123?`
2. No email verification needed
3. Tests interact with the UI

## Troubleshooting

### Tests fail with "Email body was not found"

**Cause:** App is connecting to production Supabase instead of local

**Fix:**

```bash
# Verify .env.local exists and has correct URL
cat apps/web/.env.local | grep NEXT_PUBLIC_SUPABASE_URL

# Should show: http://127.0.0.1:54321
# If not, the file wasn't created correctly
```

### Tests fail with "Invalid login credentials"

**Cause:** Test account doesn't exist in local database

**Fix:**

1. Follow **Step 3** above to create the test account
2. Or reset database: `cd apps/web && supabase db reset`

### Inbucket shows no emails

**Cause:** Emails are being sent to production Supabase

**Fix:**

1. Stop the dev server
2. Verify `.env.local` points to `http://127.0.0.1:54321`
3. Restart dev server: `pnpm dev`
4. Check Studio URL in terminal - should show localhost

### Page tests pass but auth tests fail

**This is normal if:**

- `.env.local` points to production (auth tests need local Inbucket)
- Solution: Use local Supabase for all tests

## Switching Between Local and Production

### Use Local Supabase (for E2E tests)

```bash
# .env.local exists and points to http://127.0.0.1:54321
pnpm dev
```

### Use Production Supabase (for manual testing)

```bash
# Temporarily rename .env.local
mv apps/web/.env.local apps/web/.env.local.backup

# Now .env.development will be used (production Supabase)
pnpm dev

# Restore when done
mv apps/web/.env.local.backup apps/web/.env.local
```

## CI/CD Considerations

For CI/CD pipelines:

1. **Start Supabase in CI:**

   ```yaml
   - name: Start Supabase
     run: |
       cd apps/web
       supabase start
   ```

2. **Use test environment:**

   ```yaml
   - name: Run E2E Tests
     run: pnpm test:e2e
     env:
       NODE_ENV: test
   ```

3. **Seed test data:**
   ```yaml
   - name: Seed database
     run: |
       cd apps/web
       supabase db reset
   ```

## Summary

✅ **Setup Complete When:**

- Local Supabase running on port 54321
- Inbucket accessible on port 54324
- Test account exists: `cyrus@callhenk.com`
- `.env.local` points to local Supabase
- Dev server starts on localhost:3000
- Page tests pass ✅
- Auth tests pass ✅

Now you can run E2E tests with confidence! 🎉
