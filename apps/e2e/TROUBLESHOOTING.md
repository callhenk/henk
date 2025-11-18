# E2E Tests Troubleshooting Guide

## Common Issues

### ❌ Tests Timeout Waiting for Elements

**Symptoms:**

- Tests fail with "Test timeout of 60000ms exceeded"
- Error: `waiting for locator('[data-test="..."]')`
- Tests can't find form inputs, buttons, etc.

**Root Cause:**
The dev server is not running, so tests can't load the pages.

**Solution:**
Use the test runner script which automatically starts everything:

```bash
cd apps/e2e
./run-tests.sh
```

Or manually start the dev server before running tests:

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Run tests
cd apps/e2e
pnpm test
```

---

### ❌ Authentication Tests Fail - Email Not Found

**Symptoms:**

- Tests timeout waiting for confirmation emails
- Console shows: "Email not found for cyrus+e2e-...@callhenk.com"
- Inbucket shows no messages for the test email

**Root Cause:**
The app is connecting to **production Supabase** instead of **local Supabase**, so confirmation emails are sent to real email instead of being captured by Inbucket.

**Solution:**

1. **Ensure local Supabase is running:**

   ```bash
   cd apps/web
   supabase start
   ```

2. **Verify .env.local exists and points to local Supabase:**

   ```bash
   cat apps/web/.env.local
   # Should show: NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   ```

3. **Make sure dev server uses .env.local:**

   ```bash
   # Use this command (not just "next dev")
   pnpm dev
   # This runs: pnpm with-env next dev
   ```

4. **Check Inbucket is accessible:**
   ```bash
   curl http://localhost:54324
   # Or open in browser
   open http://localhost:54324
   ```

---

### ❌ Tests Pass Locally But Fail in CI

**Solution:**
The `run-tests.sh` script handles all the setup automatically. Make sure your CI workflow:

1. Starts Supabase:

   ```yaml
   - name: Start Supabase
     run: |
       cd apps/web
       supabase start
   ```

2. Runs tests using the script:
   ```yaml
   - name: Run E2E Tests
     run: |
       cd apps/e2e
       ./run-tests.sh
   ```

---

### ❌ Port 3000 Already in Use

**Solution:**
Kill the existing process:

```bash
lsof -ti:3000 | xargs kill -9
```

Then start fresh:

```bash
cd apps/e2e
./run-tests.sh
```

---

## Quick Diagnostic Commands

### Check if Supabase is running

```bash
supabase status
```

### Check if dev server is running

```bash
curl http://localhost:3000
```

### Check environment configuration

```bash
cat apps/web/.env.local | grep NEXT_PUBLIC_SUPABASE_URL
```

### View dev server logs (when using run-tests.sh)

```bash
tail -f /tmp/e2e-dev-server.log
```

---

## The Right Way to Run Tests

### ✅ Recommended: Use the Test Runner Script

```bash
cd apps/e2e
./run-tests.sh                          # All tests
./run-tests.sh tests/pages/             # Page tests only
./run-tests.sh --headed                 # With visible browser
```

**What it does:**

1. ✅ Checks if Supabase is running (starts it if needed)
2. ✅ Verifies .env.local configuration
3. ✅ Starts dev server with correct env
4. ✅ Waits for server to be ready
5. ✅ Runs the tests
6. ✅ Cleans up after (kills dev server)

### ⚠️ Manual Way (requires multiple terminals)

**Terminal 1 - Supabase:**

```bash
cd apps/web
supabase start
```

**Terminal 2 - Dev Server:**

```bash
pnpm dev
```

**Terminal 3 - Tests:**

```bash
cd apps/e2e
pnpm test
```

---

## Environment Setup Checklist

Before running tests, ensure:

- [ ] Local Supabase is running (`supabase status`)
- [ ] `.env.local` exists in `apps/web/`
- [ ] `.env.local` points to `http://127.0.0.1:54321`
- [ ] Inbucket is accessible at `http://localhost:54324`
- [ ] Dev server is running on `http://localhost:3000`
- [ ] Test user `cyrus@callhenk.com` exists in local database

Run the setup checker:

```bash
cd apps/e2e
./setup-e2e.sh
```

---

## Need Help?

1. Check this troubleshooting guide
2. Read the [E2E_SETUP.md](./E2E_SETUP.md) for detailed setup
3. Check the [README.md](./README.md) for test documentation
4. Look at existing test files for examples
