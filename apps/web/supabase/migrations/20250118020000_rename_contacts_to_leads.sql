-- =====================================================
-- RENAME CONTACTS TO LEADS (Merge Strategy)
-- =====================================================
-- This migration renames the 'contacts' table to 'leads'
-- and merges the old 'leads' table structure into it.
-- =====================================================

-- =====================================================
-- STEP 1: Add campaign-specific fields to contacts table
-- =====================================================

-- Add fields from the old leads table to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'new';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_contact_date timestamptz;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS pledged_amount numeric;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS donated_amount numeric;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS dnc boolean DEFAULT false;

-- Create index for campaign_id (will be used frequently)
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_id ON public.contacts(campaign_id);

-- =====================================================
-- STEP 2: Migrate data from old leads table to contacts
-- =====================================================

-- Note: This is a data migration step. If you have existing data in the
-- leads table, you'll need to migrate it. For now, we'll prepare the structure.
-- Add a comment for manual data migration if needed.
COMMENT ON COLUMN public.contacts.campaign_id IS 'Migrated from old leads table - links lead to a specific campaign';

-- =====================================================
-- STEP 3: Drop old leads table and its constraints
-- =====================================================

-- First, drop any tables that reference leads
-- (We'll need to check for foreign keys)
DO $$
BEGIN
    -- Drop the old leads table
    -- This will fail if there are foreign key constraints from other tables
    -- You may need to drop those constraints first
    DROP TABLE IF EXISTS public.leads CASCADE;
END $$;

-- =====================================================
-- STEP 4: Rename contacts to leads
-- =====================================================

ALTER TABLE public.contacts RENAME TO leads;

-- =====================================================
-- STEP 5: Rename contact_lists to lead_lists
-- =====================================================

ALTER TABLE public.contact_lists RENAME TO lead_lists;

-- =====================================================
-- STEP 6: Rename contact_list_members to lead_list_members
-- =====================================================

ALTER TABLE public.contact_list_members RENAME TO lead_list_members;

-- Rename the foreign key columns in lead_list_members
ALTER TABLE public.lead_list_members RENAME COLUMN contact_list_id TO lead_list_id;
ALTER TABLE public.lead_list_members RENAME COLUMN contact_id TO lead_id;

-- =====================================================
-- STEP 7: Update all indexes to use new table names
-- =====================================================

-- Contacts -> Leads indexes
ALTER INDEX IF EXISTS idx_contacts_business_id RENAME TO idx_leads_business_id;
ALTER INDEX IF EXISTS idx_contacts_source RENAME TO idx_leads_source;
ALTER INDEX IF EXISTS idx_contacts_source_id RENAME TO idx_leads_source_id;
ALTER INDEX IF EXISTS idx_contacts_email RENAME TO idx_leads_email;
ALTER INDEX IF EXISTS idx_contacts_phone RENAME TO idx_leads_phone;
ALTER INDEX IF EXISTS idx_contacts_tags RENAME TO idx_leads_tags;
ALTER INDEX IF EXISTS idx_contacts_last_synced_at RENAME TO idx_leads_last_synced_at;
ALTER INDEX IF EXISTS idx_contacts_campaign_id RENAME TO idx_leads_campaign_id;

-- Contact Lists -> Lead Lists indexes
ALTER INDEX IF EXISTS idx_contact_lists_business_id RENAME TO idx_lead_lists_business_id;
ALTER INDEX IF EXISTS idx_contact_lists_list_type RENAME TO idx_lead_lists_list_type;
ALTER INDEX IF EXISTS idx_contact_lists_name RENAME TO idx_lead_lists_name;

-- Contact List Members -> Lead List Members indexes
ALTER INDEX IF EXISTS idx_contact_list_members_list RENAME TO idx_lead_list_members_list;
ALTER INDEX IF EXISTS idx_contact_list_members_contact RENAME TO idx_lead_list_members_lead;

-- =====================================================
-- STEP 8: Update constraints
-- =====================================================

-- Rename primary key constraints
ALTER TABLE public.leads RENAME CONSTRAINT contacts_pkey TO leads_pkey;
ALTER TABLE public.lead_lists RENAME CONSTRAINT contact_lists_pkey TO lead_lists_pkey;
ALTER TABLE public.lead_list_members RENAME CONSTRAINT contact_list_members_pkey TO lead_list_members_pkey;

-- Rename foreign key constraints
ALTER TABLE public.leads RENAME CONSTRAINT contacts_business_id_fkey TO leads_business_id_fkey;
ALTER TABLE public.leads RENAME CONSTRAINT contacts_created_by_fkey TO leads_created_by_fkey;
ALTER TABLE public.leads RENAME CONSTRAINT contacts_updated_by_fkey TO leads_updated_by_fkey;

ALTER TABLE public.lead_lists RENAME CONSTRAINT contact_lists_business_id_fkey TO lead_lists_business_id_fkey;
ALTER TABLE public.lead_lists RENAME CONSTRAINT contact_lists_created_by_fkey TO lead_lists_created_by_fkey;
ALTER TABLE public.lead_lists RENAME CONSTRAINT contact_lists_updated_by_fkey TO lead_lists_updated_by_fkey;

ALTER TABLE public.lead_list_members RENAME CONSTRAINT contact_list_members_unique TO lead_list_members_unique;
ALTER TABLE public.lead_list_members RENAME CONSTRAINT contact_list_members_contact_list_id_fkey TO lead_list_members_lead_list_id_fkey;
ALTER TABLE public.lead_list_members RENAME CONSTRAINT contact_list_members_contact_id_fkey TO lead_list_members_lead_id_fkey;
ALTER TABLE public.lead_list_members RENAME CONSTRAINT contact_list_members_added_by_fkey TO lead_list_members_added_by_fkey;

-- Rename check constraint
ALTER TABLE public.leads RENAME CONSTRAINT contacts_has_contact_info TO leads_has_contact_info;
ALTER TABLE public.leads RENAME CONSTRAINT contacts_source_unique TO leads_source_unique;

-- =====================================================
-- STEP 9: Update trigger functions
-- =====================================================

-- Rename the trigger on lead_list_members
DROP TRIGGER IF EXISTS trigger_update_contact_list_count ON public.lead_list_members;
CREATE TRIGGER trigger_update_lead_list_count
AFTER INSERT OR DELETE ON public.lead_list_members
FOR EACH ROW
EXECUTE FUNCTION update_contact_list_count();

-- Rename triggers for updated_at
DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON public.leads;
CREATE TRIGGER trigger_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contact_lists_updated_at ON public.lead_lists;
CREATE TRIGGER trigger_lead_lists_updated_at
BEFORE UPDATE ON public.lead_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 10: Update function to reference lead_lists
-- =====================================================

-- Update the count function to use new table name
CREATE OR REPLACE FUNCTION update_lead_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lead_lists
    SET contact_count = contact_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.lead_list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lead_lists
    SET contact_count = GREATEST(0, contact_count - 1),
        last_updated_at = NOW()
    WHERE id = OLD.lead_list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one with new function
DROP TRIGGER IF EXISTS trigger_update_lead_list_count ON public.lead_list_members;
CREATE TRIGGER trigger_update_lead_list_count
AFTER INSERT OR DELETE ON public.lead_list_members
FOR EACH ROW
EXECUTE FUNCTION update_lead_list_count();

-- Drop the old function
DROP FUNCTION IF EXISTS update_contact_list_count();

-- =====================================================
-- STEP 11: Update RLS policies
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view contacts in their business" ON public.leads;
DROP POLICY IF EXISTS "Users can insert contacts in their business" ON public.leads;
DROP POLICY IF EXISTS "Users can update contacts in their business" ON public.leads;
DROP POLICY IF EXISTS "Users can delete contacts in their business" ON public.leads;

-- Create new policies with updated names
CREATE POLICY "Users can view leads in their business"
  ON public.leads FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert leads in their business"
  ON public.leads FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update leads in their business"
  ON public.leads FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete leads in their business"
  ON public.leads FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Update policies for lead_lists
DROP POLICY IF EXISTS "Users can view lists in their business" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can insert lists in their business" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can update lists in their business" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can delete lists in their business" ON public.lead_lists;

CREATE POLICY "Users can view lead lists in their business"
  ON public.lead_lists FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert lead lists in their business"
  ON public.lead_lists FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update lead lists in their business"
  ON public.lead_lists FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete lead lists in their business"
  ON public.lead_lists FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Update policies for lead_list_members
DROP POLICY IF EXISTS "Users can view list members in their business" ON public.lead_list_members;
DROP POLICY IF EXISTS "Users can insert list members in their business" ON public.lead_list_members;
DROP POLICY IF EXISTS "Users can delete list members in their business" ON public.lead_list_members;

CREATE POLICY "Users can view lead list members in their business"
  ON public.lead_list_members FOR SELECT
  USING (
    lead_list_id IN (
      SELECT id FROM public.lead_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can insert lead list members in their business"
  ON public.lead_list_members FOR INSERT
  WITH CHECK (
    lead_list_id IN (
      SELECT id FROM public.lead_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can delete lead list members in their business"
  ON public.lead_list_members FOR DELETE
  USING (
    lead_list_id IN (
      SELECT id FROM public.lead_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- =====================================================
-- STEP 12: Update views
-- =====================================================

-- Drop old view
DROP VIEW IF EXISTS public.contacts_with_lists;

-- Create new view
CREATE OR REPLACE VIEW public.leads_with_lists AS
SELECT
  l.*,
  COALESCE(
    json_agg(
      json_build_object(
        'list_id', ll.id,
        'list_name', ll.name,
        'added_at', llm.added_at
      ) ORDER BY llm.added_at DESC
    ) FILTER (WHERE ll.id IS NOT NULL),
    '[]'::json
  ) as lists
FROM public.leads l
LEFT JOIN public.lead_list_members llm ON l.id = llm.lead_id
LEFT JOIN public.lead_lists ll ON llm.lead_list_id = ll.id
GROUP BY l.id;

-- =====================================================
-- STEP 13: Update column in lead_lists
-- =====================================================

-- Rename contact_count to lead_count for consistency
ALTER TABLE public.lead_lists RENAME COLUMN contact_count TO lead_count;

-- =====================================================
-- STEP 14: Update comments
-- =====================================================

COMMENT ON TABLE public.leads IS 'Master leads table for all lead sources (Salesforce, HubSpot, manual, CSV, etc.)';
COMMENT ON TABLE public.lead_lists IS 'Reusable lists for organizing leads into groups';
COMMENT ON TABLE public.lead_list_members IS 'Many-to-many relationship between leads and lists';
COMMENT ON COLUMN public.leads.source IS 'Origin of the lead: salesforce, hubspot, manual, csv_import, etc.';
COMMENT ON COLUMN public.leads.source_id IS 'External ID from the source system (e.g., Salesforce Contact ID)';
COMMENT ON COLUMN public.leads.tags IS 'Flexible JSON array for categorizing leads';
COMMENT ON COLUMN public.lead_lists.list_type IS 'static: manual additions | dynamic: rule-based | smart: auto-updating query';
