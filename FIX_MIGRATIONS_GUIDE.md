# Fix Migrations Guide

## Issues Found

1. **Duplicate timestamps** causing migration order confusion:
   - `20241222000000_add_voice_fields_to_agents.sql`
   - `20241222000000_fix_storage_policies.sql` (same timestamp!)
   - `20241224000000_add_elevenlabs_agent_id.sql`
   - `20241224000000_campaign_orchestrator_schema.sql` (same timestamp!)

2. **Conflicting table creation**:
   - `20241220000000_campaigns.sql` creates a simple `leads` table
   - `20250118000000_contacts_and_lists.sql` creates `contacts` table
   - `20250118020000_rename_contacts_to_leads.sql` tries to rename `contacts` → `leads` (but leads already exists!)

3. **Future dates** in migrations (2025) when we're still in 2024

## Recommended Solution

### Step 1: Backup Current State
```bash
# If you have important data
pg_dump $DATABASE_URL > backup_before_fix.sql
```

### Step 2: Create Fixed Migration Structure

Since you've already run migrations and have data, we need to create a compatibility migration that handles the current state:

#### Create: `20250120000000_fix_lead_structure_conflicts.sql`

```sql
-- =====================================================
-- FIX LEAD STRUCTURE CONFLICTS
-- =====================================================
-- This migration fixes conflicts between the simple leads
-- table from campaigns and the complex structure from contacts
-- =====================================================

BEGIN;

-- Check current state and fix accordingly
DO $$
DECLARE
  has_campaign_id_column BOOLEAN;
  has_lead_score_column BOOLEAN;
  leads_exists BOOLEAN;
  contacts_exists BOOLEAN;
BEGIN
  -- Check what tables exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'leads'
  ) INTO leads_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'contacts'
  ) INTO contacts_exists;

  -- If contacts table exists but not leads, rename it
  IF contacts_exists AND NOT leads_exists THEN
    ALTER TABLE public.contacts RENAME TO leads;

    -- Rename constraints
    ALTER TABLE public.leads RENAME CONSTRAINT contacts_pkey TO leads_pkey;
    -- Add other constraint renames as needed

    RAISE NOTICE 'Renamed contacts table to leads';
  END IF;

  -- Check if leads table has the old structure (with campaign_id)
  IF leads_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'campaign_id'
    ) INTO has_campaign_id_column;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'lead_score'
    ) INTO has_lead_score_column;

    -- If we have the old simple structure, we need to migrate it
    IF has_campaign_id_column AND NOT has_lead_score_column THEN
      -- This means we have the simple structure and need to upgrade

      -- Save existing data
      CREATE TEMP TABLE temp_simple_leads AS
      SELECT * FROM public.leads;

      -- Drop the simple table
      DROP TABLE public.leads CASCADE;

      -- Create the complex structure
      CREATE TABLE public.leads (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        business_id uuid NOT NULL,
        source character varying NOT NULL DEFAULT 'manual'::character varying,
        source_id character varying,
        source_metadata jsonb DEFAULT '{}'::jsonb,
        first_name character varying,
        last_name character varying,
        email character varying,
        phone character varying,
        mobile_phone character varying,
        street text,
        city character varying,
        state character varying,
        postal_code character varying,
        country character varying,
        company character varying,
        title character varying,
        department character varying,
        lead_source character varying,
        description text,
        owner_id character varying,
        do_not_call boolean DEFAULT false,
        do_not_email boolean DEFAULT false,
        email_opt_out boolean DEFAULT false,
        timezone character varying,
        preferred_language character varying,
        tags jsonb DEFAULT '[]'::jsonb,
        custom_fields jsonb DEFAULT '{}'::jsonb,
        last_synced_at timestamp with time zone,
        sync_status character varying DEFAULT 'active'::character varying,
        sync_error text,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        created_by uuid,
        updated_by uuid,
        status character varying DEFAULT 'new'::character varying,
        notes text,
        dnc boolean DEFAULT false,
        lead_score integer DEFAULT 0,
        quality_rating character varying DEFAULT 'unrated'::character varying,
        last_activity_at timestamp with time zone,
        CONSTRAINT leads_pkey PRIMARY KEY (id),
        CONSTRAINT leads_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
        CONSTRAINT leads_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
        CONSTRAINT leads_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
      );

      -- Migrate data from simple to complex structure
      INSERT INTO public.leads (
        id,
        business_id,
        first_name,
        last_name,
        email,
        phone,
        company,
        status,
        notes,
        created_at,
        updated_at,
        created_by,
        updated_by
      )
      SELECT
        tsl.id,
        c.business_id,
        SPLIT_PART(tsl.name, ' ', 1) as first_name,
        SUBSTRING(tsl.name FROM POSITION(' ' IN tsl.name) + 1) as last_name,
        tsl.email,
        tsl.phone,
        tsl.company,
        tsl.status::varchar,
        tsl.notes,
        tsl.created_at,
        tsl.updated_at,
        tsl.created_by,
        tsl.updated_by
      FROM temp_simple_leads tsl
      JOIN public.campaigns c ON c.id = tsl.campaign_id;

      -- Create campaign_leads entries for the migrated data
      INSERT INTO public.campaign_leads (
        campaign_id,
        lead_id,
        status,
        attempts,
        last_attempt_at,
        pledged_amount,
        donated_amount,
        notes
      )
      SELECT
        campaign_id,
        id,
        status::varchar,
        attempts,
        last_contact_date,
        pledged_amount,
        donated_amount,
        notes
      FROM temp_simple_leads;

      DROP TABLE temp_simple_leads;

      RAISE NOTICE 'Migrated simple leads structure to complex structure';
    END IF;
  END IF;
END $$;

-- Ensure all the new tables exist
CREATE TABLE IF NOT EXISTS public.campaign_lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_list_id UUID NOT NULL REFERENCES public.lead_lists(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  priority integer DEFAULT 1,
  max_attempts_override integer,
  filter_criteria jsonb,
  total_leads integer DEFAULT 0,
  contacted_leads integer DEFAULT 0,
  successful_leads integer DEFAULT 0,
  is_active boolean DEFAULT true,
  completed_at TIMESTAMPTZ,
  CONSTRAINT campaign_lead_lists_unique UNIQUE (campaign_id, lead_list_id)
);

CREATE TABLE IF NOT EXISTS public.campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_list_id UUID REFERENCES public.lead_lists(id) ON DELETE SET NULL,
  status varchar(50) DEFAULT 'new',
  attempts integer DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  outcome varchar(100),
  pledged_amount numeric,
  donated_amount numeric,
  notes text,
  total_talk_time integer DEFAULT 0,
  last_call_duration integer,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  CONSTRAINT campaign_leads_unique UNIQUE (campaign_id, lead_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_campaign_lead_lists_campaign ON public.campaign_lead_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lead_lists_list ON public.campaign_lead_lists(lead_list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign ON public.campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead ON public.campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_business_id ON public.leads(business_id);

-- Enable RLS
ALTER TABLE public.campaign_lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration ensures:
-- 1. Leads table has the complex structure
-- 2. Campaign-lead relationships are tracked separately
-- 3. All data is preserved and migrated
-- =====================================================
```

### Step 3: Run the Fix

```bash
# Apply the fix migration
psql $DATABASE_URL < 20250120000000_fix_lead_structure_conflicts.sql

# Or if using Supabase CLI
supabase db push
```

### Step 4: Generate New Types

```bash
# Start Supabase if not running
cd apps/web && supabase start

# Generate types
pnpm supabase:web:typegen
```

### Step 5: Clean Up Migration Files (Optional)

To prevent future issues, consider:

1. **Renaming duplicate timestamps**:
```bash
# Fix duplicate timestamps
mv 20241222000000_fix_storage_policies.sql 20241222000001_fix_storage_policies.sql
mv 20241224000000_campaign_orchestrator_schema.sql 20241224000001_campaign_orchestrator_schema.sql
```

2. **Remove conflicting migrations** (if starting fresh):
   - Remove the simple leads table creation from `20241220000000_campaigns.sql`
   - Or keep them and rely on the fix migration

## Testing

After applying the fix:

```sql
-- Check that tables exist with correct structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('leads', 'campaign_leads', 'campaign_lead_lists', 'lead_lists')
ORDER BY table_name, ordinal_position;

-- Check for data integrity
SELECT COUNT(*) as lead_count FROM leads;
SELECT COUNT(*) as campaign_leads_count FROM campaign_leads;
SELECT COUNT(*) as lead_lists_count FROM lead_lists;
```

## Prevention

To avoid this in the future:

1. **Never use duplicate timestamps** in migration names
2. **Always use IF NOT EXISTS** when creating tables
3. **Check for existing structures** before creating/altering
4. **Test migrations on a fresh database** regularly
5. **Keep migrations idempotent** where possible

## Next Steps

1. Apply the fix migration
2. Verify all tables have correct structure
3. Generate new TypeScript types
4. Test your application thoroughly
5. Consider consolidating migrations if starting fresh