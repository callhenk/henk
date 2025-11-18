# Supabase Local Development Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Migrations Safely](#running-migrations-safely)
- [Database Commands](#database-commands)
- [Testing Workflow](#testing-workflow)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker Desktop** - Must be running
- **Node.js** - v18 or higher
- **pnpm** - Package manager
- **Supabase CLI** - Already installed (v2.33.9)

### Verify Installation

```bash
# Check Docker is running
docker ps

# Check Supabase CLI
supabase --version

# Check pnpm
pnpm --version
```

---

## Getting Started

### 1. Start Local Supabase

```bash
# Navigate to the web app directory
cd apps/web

# Start Supabase (loads all migrations automatically)
pnpm supabase:start

# OR manually:
supabase start
```

**What happens:**

- Supabase starts in Docker containers
- Automatically applies all migrations from `supabase/migrations/`
- Creates a **completely separate local database**
- **Your production database is NOT affected**

### 2. Access Local Supabase

After starting, you'll see:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
```

**Supabase Studio (Local Dashboard):**

- Open: http://127.0.0.1:54323
- Browse tables, run queries, view policies
- Username: `postgres`
- Password: `postgres`

### 3. Stop Supabase

```bash
cd apps/web
pnpm supabase:stop

# OR manually:
supabase stop
```

**Note:** Your local data persists in Docker volumes. Next `supabase start` will restore it.

---

## Running Migrations Safely

### Understanding Migration Safety

✅ **Local migrations are 100% SAFE**

- Run on local database only (port 54322)
- Production database uses different port/host
- Completely isolated environments

✅ **Production migrations are TRACKED**

- Supabase tracks which migrations ran
- Won't re-run existing migrations
- Only applies new migrations

### Current Migration Files

```
supabase/migrations/
├── 20251101052829_full_schema.sql      # Main database schema
└── 20251101054138_storage_buckets.sql  # Storage buckets & policies
```

### Testing New Migrations Locally

#### Step 1: Create a New Migration

```bash
cd apps/web

# Create new migration file
supabase migration new add_new_feature
```

This creates: `supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql`

#### Step 2: Edit the Migration

```bash
# Edit the new migration file
code supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql
```

Example migration:

```sql
-- Add a new column to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS new_feature_flag BOOLEAN DEFAULT false;

-- Create RLS policy
CREATE POLICY "agents_new_feature"
ON public.agents
FOR ALL
TO authenticated
USING (business_id IN (
  SELECT business_id FROM team_members
  WHERE user_id = auth.uid()
));
```

#### Step 3: Test Locally

```bash
# Method 1: Reset database (applies all migrations fresh)
pnpm supabase:reset

# Method 2: Just apply new migrations
supabase db push --local
```

**What happens:**

- ✅ Applies migration to LOCAL database only
- ✅ You can test queries, policies, etc.
- ✅ No impact on production

#### Step 4: Verify in Local Studio

1. Open http://127.0.0.1:54323
2. Check the new table/column exists
3. Test queries and policies
4. Verify data integrity

#### Step 5: Deploy to Production (when ready)

```bash
# Link to production (if not already linked)
supabase link --project-ref plvxicajcpnnsxosmntd

# Push only NEW migrations to production
pnpm supabase:deploy

# OR manually:
supabase db push
```

**Safety Features:**

- Only migrations NOT in production will run
- Each migration runs in a transaction (all-or-nothing)
- Auto-rollback on errors
- Your data is protected

---

## Database Commands

### Development Commands

```bash
# Start local Supabase
pnpm supabase:start

# Stop local Supabase
pnpm supabase:stop

# Reset database (fresh start with all migrations)
pnpm supabase:reset

# Check status
pnpm supabase:status

# Generate TypeScript types from local schema
pnpm supabase:typegen

# Run database tests
pnpm supabase:test
```

### Direct Supabase CLI Commands

```bash
cd apps/web

# Create migration
supabase migration new migration_name

# Apply migrations locally
supabase db push --local

# Check migration status
supabase migration list

# Lint database
supabase db lint

# Dump local data
supabase db dump --local --data-only
```

### Production Commands (USE WITH CAUTION)

```bash
# Link to production
supabase link --project-ref plvxicajcpnnsxosmntd

# Deploy migrations to production
pnpm supabase:deploy

# Pull production schema (creates migration)
supabase db pull
```

---

## Testing Workflow

### Recommended Workflow for Schema Changes

#### 1. Always Test Locally First

```bash
# Start fresh
cd apps/web
pnpm supabase:reset

# Your app should work with new schema
pnpm dev
```

#### 2. Run Tests

```bash
# TypeScript type check
pnpm typecheck

# Database tests
pnpm supabase:test

# Lint database
pnpm supabase:db:lint
```

#### 3. Verify in Local Studio

- Open: http://127.0.0.1:54323
- Check tables, policies, functions
- Run test queries
- Verify RLS policies work

#### 4. Test Edge Cases

```sql
-- Example: Test RLS policy
-- In Studio SQL editor:

-- As authenticated user
SELECT * FROM agents WHERE business_id = 'some-uuid';

-- Should only return agents for user's business
```

#### 5. Deploy to Production

```bash
# Generate fresh types
pnpm supabase:typegen

# Deploy
pnpm supabase:deploy
```

---

## Environment Isolation

### Local vs Production

| Feature                   | Local                  | Production                               |
| ------------------------- | ---------------------- | ---------------------------------------- |
| **Host**                  | localhost              | plvxicajcpnnsxosmntd.supabase.co         |
| **Port**                  | 54322                  | 5432                                     |
| **Data**                  | Docker volume          | Supabase cloud                           |
| **URL**                   | http://127.0.0.1:54321 | https://plvxicajcpnnsxosmntd.supabase.co |
| **Auto-apply migrations** | ✅ Yes (on start)      | ❌ No (manual push)                      |

### How to Ensure Production Safety

✅ **Always use the correct project context:**

```bash
# Check which project you're linked to
supabase projects list

# Check current link
cat .git/config | grep supabase
```

✅ **Use different database URLs:**

```env
# .env.local (for local development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# .env.production (for production)
NEXT_PUBLIC_SUPABASE_URL=https://plvxicajcpnnsxosmntd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

✅ **Use `--local` flag for safety:**

```bash
# Safe - only affects local
supabase db push --local

# Requires confirmation - affects production
supabase db push
```

---

## Troubleshooting

### Port Already Allocated

**Error:** `Bind for 0.0.0.0:54322 failed: port is already allocated`

**Solution:**

```bash
# Stop existing instance
cd apps/web
supabase stop

# Or stop by project ID
supabase stop --project-id web

# Start again
supabase start
```

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**

1. Start Docker Desktop
2. Wait for it to fully start
3. Run `supabase start` again

### Migrations Not Applying

**Error:** Migration file not found or skipped

**Solution:**

```bash
# Check migration history
supabase migration list

# Force refresh
supabase db reset

# Or manually repair
supabase migration repair
```

### Database Connection Issues

**Error:** `failed to connect to postgres`

**Solution:**

```bash
# Check Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start

# Verify Docker containers
docker ps | grep supabase
```

### TypeScript Type Errors After Migration

**Error:** Types don't match database schema

**Solution:**

```bash
# Regenerate types from local database
cd apps/web
pnpm supabase:typegen

# This updates:
# - packages/supabase/src/database.types.ts
# - apps/web/lib/database.types.ts

# Restart your dev server
pnpm dev
```

---

## Best Practices

### ✅ DO

- ✅ Always test migrations locally first
- ✅ Use `pnpm supabase:reset` for fresh testing
- ✅ Generate types after schema changes
- ✅ Keep migrations small and focused
- ✅ Add comments to complex migrations
- ✅ Test RLS policies thoroughly
- ✅ Use transactions for multi-step changes

### ❌ DON'T

- ❌ Deploy migrations without local testing
- ❌ Modify production database directly
- ❌ Delete migration files after deployment
- ❌ Mix schema changes with data migrations
- ❌ Forget to regenerate TypeScript types
- ❌ Skip RLS policies on new tables
- ❌ Use `--no-verify` flags in production

---

## Quick Reference

### Common Commands

```bash
# Start development
pnpm supabase:start
pnpm dev

# Reset database
pnpm supabase:reset

# Create migration
supabase migration new add_feature

# Test migration locally
supabase db push --local

# Deploy to production
pnpm supabase:deploy

# Stop Supabase
pnpm supabase:stop
```

### Important URLs (Local)

- **Studio:** http://127.0.0.1:54323
- **API:** http://127.0.0.1:54321
- **DB:** postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Need Help?

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)

---

## Summary

**Your production database is SAFE because:**

1. ✅ Local Supabase runs on different ports (54321-54324)
2. ✅ Migrations are tracked - won't re-run
3. ✅ Each migration is a transaction - auto-rollback on error
4. ✅ You must explicitly push to production
5. ✅ `--local` flag prevents production changes

**Always remember:** Test locally first, then deploy to production with confidence!
