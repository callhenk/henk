# Migration Conflicts Analysis

## Critical Issue Found! 🚨

Your migrations are in conflict and will fail. Here's the problem:

## The Conflict

### Timeline of Migrations

1. **20241220000000_campaigns.sql** (Dec 20, 2024)
   - Creates a SIMPLE `leads` table with:
     - `campaign_id` (required)
     - `name`, `email`, `phone`, `company`
     - `status`, `notes`, `attempts`
     - `pledged_amount`, `donated_amount`

2. **20250118000000_contacts_and_lists.sql** (Jan 18, 2025)
   - Creates a COMPLEX `contacts` table with:
     - Many more fields (first_name, last_name, address, etc.)
     - No campaign_id (contacts are independent)
     - Source tracking, sync status, tags, etc.

3. **20250118020000_rename_contacts_to_leads.sql** (Jan 18, 2025)
   - Tries to rename `contacts` → `leads`
   - **PROBLEM**: `leads` table already exists from migration #1!
   - This will FAIL with "relation 'leads' already exists"

4. **20250119000000_lead_campaign_relationships.sql** (Jan 19, 2025)
   - Assumes leads table has the complex structure from contacts
   - Tries to remove campaign_id (but it's NOT NULL in the simple version)
   - Will fail or produce unexpected results

## Current Database State (from latest.sql)

Your database currently has:
- `leads` table with the COMPLEX structure (from contacts migration)
- `campaign_leads` table (from our new migration)
- `campaign_lead_lists` table (from our new migration)
- No `campaign_id` in leads table anymore

This suggests some migrations ran successfully, but the order is wrong.

## The Problems

### Problem 1: Duplicate Table Creation
- Campaign migration creates `leads` table
- Contact migration tries to rename `contacts` to `leads`
- **Result**: Table already exists error

### Problem 2: Conflicting Schemas
- Simple leads (campaign migration): Has required campaign_id
- Complex leads (contacts migration): No campaign_id, many more fields
- **Result**: Incompatible table structures

### Problem 3: Wrong Migration Order
The dates suggest migrations should run:
1. Campaigns (Dec 20, 2024)
2. Contacts (Jan 18, 2025)
3. Rename (Jan 18, 2025)
4. Relationships (Jan 19, 2025)

But the rename will fail because leads already exists!

## Solutions

### Option 1: Fix the Original Campaign Migration (Recommended)

Modify `20241220000000_campaigns.sql` to NOT create the leads table. Let the contacts migrations handle it:

```sql
-- In 20241220000000_campaigns.sql, REMOVE the entire leads table creation
-- Remove lines 445-511 (the leads table and its policies)
```

Then the flow becomes:
1. Campaigns migration (no leads table)
2. Contacts migration (creates contacts)
3. Rename migration (renames contacts → leads)
4. Relationships migration (updates structure)

### Option 2: Create a Compatibility Migration

Create a new migration that runs BEFORE the contacts migration to handle the existing leads table:

```sql
-- 20250117000000_prepare_leads_migration.sql
-- This migration prepares for the contacts → leads transformation

-- 1. Drop the simple leads table if it exists
DROP TABLE IF EXISTS public.leads CASCADE;

-- This allows the contacts migrations to run cleanly
```

### Option 3: Merge Everything into One Clean Migration

Create a single migration that replaces all the conflicting ones:

```sql
-- 20250120000000_unified_leads_structure.sql
-- This migration creates the final leads structure in one go

-- Drop any existing structures
DROP TABLE IF EXISTS public.campaign_leads CASCADE;
DROP TABLE IF EXISTS public.campaign_lead_lists CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.lead_lists CASCADE;
DROP TABLE IF EXISTS public.contact_lists CASCADE;

-- Create the final structure...
```

## Immediate Action Required

### To Check Current State:
```bash
# See what tables actually exist
psql $DATABASE_URL -c "\dt public.*lead*"
psql $DATABASE_URL -c "\dt public.*contact*"
```

### To Fix (if database is local/development):
```bash
# Option 1: Reset everything
pnpm supabase:reset

# Option 2: Drop and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then run migrations again
```

## Recommended Fix Order

1. **Backup your data** if you have any important data
2. **Choose a solution**:
   - If in development: Use Option 3 (clean slate)
   - If in production: Use Option 2 (compatibility migration)
3. **Fix migration timestamps** to ensure proper order
4. **Test thoroughly** in a fresh database

## Migration Best Practices

1. **Always use IF NOT EXISTS** for table creation
2. **Never assume table structure** - check first
3. **Use consistent timestamps** - don't use future dates
4. **Test migrations in order** on a fresh database
5. **Document dependencies** between migrations

## Next Steps

1. Decide which solution to implement
2. Fix the migration files
3. Test on a fresh database
4. Update the type definitions

Would you like me to implement one of these solutions?