-- =====================================================
-- LEAD AND CAMPAIGN RELATIONSHIP IMPROVEMENTS
-- =====================================================
-- This migration improves the relationship between leads,
-- lead groups (lists), and campaigns to support:
-- 1. Leads can exist independently without campaigns
-- 2. Lead groups can be assigned to multiple campaigns
-- 3. Campaigns can use multiple lead groups
-- 4. Track which leads came from which group in a campaign
-- =====================================================

-- =====================================================
-- STEP 1: MIGRATE EXISTING DATA AND MODIFY LEADS TABLE
-- =====================================================

-- First, create a temporary table to store existing campaign-lead relationships
-- before we remove the campaign_id column
CREATE TEMP TABLE IF NOT EXISTS temp_campaign_leads AS
SELECT
  id as lead_id,
  campaign_id,
  status,
  attempts,
  last_contact_date as last_attempt_at,
  pledged_amount,
  donated_amount,
  notes,
  dnc
FROM public.leads
WHERE campaign_id IS NOT NULL;

-- Remove direct campaign_id from leads table to make leads campaign-independent
-- First drop the constraint, then the column
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS contacts_campaign_id_fkey;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_campaign_id_fkey;
ALTER TABLE public.leads DROP COLUMN IF EXISTS campaign_id CASCADE;

-- Add additional fields for better lead management (if they don't exist)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS quality_rating varchar(20) DEFAULT 'unrated'; -- 'hot', 'warm', 'cold', 'unrated'
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

-- Move campaign-specific columns out of leads table (they'll be tracked in campaign_leads)
ALTER TABLE public.leads DROP COLUMN IF EXISTS attempts CASCADE;
ALTER TABLE public.leads DROP COLUMN IF EXISTS last_contact_date CASCADE;
ALTER TABLE public.leads DROP COLUMN IF EXISTS pledged_amount CASCADE;
ALTER TABLE public.leads DROP COLUMN IF EXISTS donated_amount CASCADE;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_quality_rating ON public.leads(quality_rating);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON public.leads(last_activity_at DESC NULLS LAST);

-- =====================================================
-- STEP 2: IMPROVE LEAD_LISTS TABLE AND LEAD_LIST_MEMBERS
-- =====================================================
-- Add fields to better categorize and manage lead lists
ALTER TABLE public.lead_lists ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE public.lead_lists ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.lead_lists ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_lists_archived ON public.lead_lists(is_archived);
CREATE INDEX IF NOT EXISTS idx_lead_lists_tags ON public.lead_lists USING GIN(tags);

-- Add unique constraint to lead_list_members if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lead_list_members_unique'
  ) THEN
    ALTER TABLE public.lead_list_members
    ADD CONSTRAINT lead_list_members_unique UNIQUE (lead_list_id, lead_id);
  END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE CAMPAIGN_LEAD_LISTS TABLE
-- =====================================================
-- This table links lead lists to campaigns (many-to-many)
CREATE TABLE IF NOT EXISTS public.campaign_lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_list_id UUID NOT NULL REFERENCES public.lead_lists(id) ON DELETE CASCADE,

  -- Assignment details
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),

  -- Configuration for this specific list in this campaign
  priority integer DEFAULT 1, -- Priority order for processing leads from this list
  max_attempts_override integer, -- Override campaign's max_attempts for this list
  filter_criteria jsonb, -- Additional filters to apply to this list for this campaign

  -- Stats tracking
  total_leads integer DEFAULT 0,
  contacted_leads integer DEFAULT 0,
  successful_leads integer DEFAULT 0,

  -- Status
  is_active boolean DEFAULT true,
  completed_at TIMESTAMPTZ,

  -- Prevent duplicate assignments
  CONSTRAINT campaign_lead_lists_unique UNIQUE (campaign_id, lead_list_id)
);

-- Indexes for performance
CREATE INDEX idx_campaign_lead_lists_campaign ON public.campaign_lead_lists(campaign_id);
CREATE INDEX idx_campaign_lead_lists_list ON public.campaign_lead_lists(lead_list_id);
CREATE INDEX idx_campaign_lead_lists_active ON public.campaign_lead_lists(is_active) WHERE is_active = true;
CREATE INDEX idx_campaign_lead_lists_priority ON public.campaign_lead_lists(campaign_id, priority);

-- Enable RLS
ALTER TABLE public.campaign_lead_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_lead_lists (using business_id directly)
CREATE POLICY "Users can view campaign lead lists in their business"
  ON public.campaign_lead_lists FOR SELECT
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can insert campaign lead lists in their business"
  ON public.campaign_lead_lists FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can update campaign lead lists in their business"
  ON public.campaign_lead_lists FOR UPDATE
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can delete campaign lead lists in their business"
  ON public.campaign_lead_lists FOR DELETE
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- =====================================================
-- STEP 4: CREATE CAMPAIGN_LEADS TABLE
-- =====================================================
-- This table tracks the actual leads being used in campaigns
-- and maintains the relationship to their source list
CREATE TABLE IF NOT EXISTS public.campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_list_id UUID REFERENCES public.lead_lists(id) ON DELETE SET NULL, -- Track which list this lead came from

  -- Lead status in this specific campaign
  status varchar(50) DEFAULT 'new', -- 'new', 'queued', 'calling', 'contacted', 'converted', 'failed', 'dnc'
  attempts integer DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,

  -- Outcome tracking
  outcome varchar(100), -- 'pledged', 'donated', 'declined', 'callback', 'no_answer', 'voicemail', etc.
  pledged_amount numeric,
  donated_amount numeric,
  notes text,

  -- Call tracking
  total_talk_time integer DEFAULT 0, -- in seconds
  last_call_duration integer, -- in seconds

  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  -- Prevent duplicate leads in same campaign
  CONSTRAINT campaign_leads_unique UNIQUE (campaign_id, lead_id)
);

-- Indexes for performance
CREATE INDEX idx_campaign_leads_campaign ON public.campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead ON public.campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_list ON public.campaign_leads(lead_list_id);
CREATE INDEX idx_campaign_leads_status ON public.campaign_leads(campaign_id, status);
CREATE INDEX idx_campaign_leads_next_attempt ON public.campaign_leads(next_attempt_at)
  WHERE status IN ('new', 'queued') AND next_attempt_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_leads (using business_id directly)
CREATE POLICY "Users can view campaign leads in their business"
  ON public.campaign_leads FOR SELECT
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can insert campaign leads in their business"
  ON public.campaign_leads FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can update campaign leads in their business"
  ON public.campaign_leads FOR UPDATE
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can delete campaign leads in their business"
  ON public.campaign_leads FOR DELETE
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- =====================================================
-- STEP 5: MIGRATE EXISTING DATA
-- =====================================================
-- This step migrates existing campaign-lead relationships from the old structure
-- to the new campaign_leads table

DO $$
DECLARE
  v_default_list_id UUID;
  v_campaign_record RECORD;
  v_business_id UUID;
  v_campaign_name VARCHAR(255);
BEGIN
  -- Only proceed if there's data to migrate
  IF EXISTS (SELECT 1 FROM temp_campaign_leads LIMIT 1) THEN
    -- For each campaign that had leads, create a default lead list
    FOR v_campaign_record IN
      SELECT DISTINCT campaign_id
      FROM temp_campaign_leads
    LOOP
      -- Get the business_id and name for this campaign
      SELECT business_id, name INTO v_business_id, v_campaign_name
      FROM public.campaigns
      WHERE id = v_campaign_record.campaign_id;

      -- Create the lead list for migrated leads
      INSERT INTO public.lead_lists (
        business_id,
        name,
        description,
        list_type,
        source
      )
      VALUES (
        v_business_id,
        'Migrated Leads - ' || COALESCE(v_campaign_name, 'Unknown Campaign'),
        'Automatically created during schema migration for existing campaign leads',
        'static',
        'migration'
      )
      RETURNING id INTO v_default_list_id;

      -- Add all the campaign's leads to this list
      INSERT INTO public.lead_list_members (lead_list_id, lead_id)
      SELECT v_default_list_id, lead_id
      FROM temp_campaign_leads
      WHERE campaign_id = v_campaign_record.campaign_id
      ON CONFLICT DO NOTHING;

      -- Link the list to the campaign
      INSERT INTO public.campaign_lead_lists (
        campaign_id,
        lead_list_id,
        priority,
        is_active
      )
      VALUES (
        v_campaign_record.campaign_id,
        v_default_list_id,
        1,
        true
      );

      -- Migrate the lead status data to campaign_leads
      INSERT INTO public.campaign_leads (
        campaign_id,
        lead_id,
        lead_list_id,
        status,
        attempts,
        last_attempt_at,
        pledged_amount,
        donated_amount,
        notes
      )
      SELECT
        campaign_id,
        lead_id,
        v_default_list_id,
        CASE
          WHEN status = 'new' THEN 'new'
          WHEN status = 'in_progress' THEN 'queued'
          WHEN status = 'contacted' THEN 'contacted'
          WHEN status = 'converted' THEN 'converted'
          WHEN status = 'failed' THEN 'failed'
          WHEN dnc = true THEN 'dnc'
          ELSE status
        END,
        attempts,
        last_attempt_at,
        pledged_amount,
        donated_amount,
        notes
      FROM temp_campaign_leads
      WHERE campaign_id = v_campaign_record.campaign_id
      ON CONFLICT (campaign_id, lead_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Successfully migrated % campaign-lead relationships',
      (SELECT COUNT(*) FROM temp_campaign_leads);
  END IF;
END $$;

-- Clean up the temporary table
DROP TABLE IF EXISTS temp_campaign_leads;

-- =====================================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to add a lead list to a campaign
CREATE OR REPLACE FUNCTION add_lead_list_to_campaign(
  p_campaign_id UUID,
  p_lead_list_id UUID,
  p_priority INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
  v_lead_count INTEGER;
BEGIN
  -- Insert the assignment
  INSERT INTO public.campaign_lead_lists (
    campaign_id,
    lead_list_id,
    priority,
    assigned_by
  )
  VALUES (
    p_campaign_id,
    p_lead_list_id,
    p_priority,
    auth.uid()
  )
  RETURNING id INTO v_assignment_id;

  -- Count leads in the list
  SELECT COUNT(*) INTO v_lead_count
  FROM public.lead_list_members
  WHERE lead_list_id = p_lead_list_id;

  -- Update the total_leads count
  UPDATE public.campaign_lead_lists
  SET total_leads = v_lead_count
  WHERE id = v_assignment_id;

  -- Insert leads into campaign_leads
  INSERT INTO public.campaign_leads (campaign_id, lead_id, lead_list_id, status)
  SELECT p_campaign_id, llm.lead_id, p_lead_list_id, 'new'
  FROM public.lead_list_members llm
  WHERE llm.lead_list_id = p_lead_list_id
  ON CONFLICT (campaign_id, lead_id) DO UPDATE
  SET lead_list_id = EXCLUDED.lead_list_id; -- Update source list if lead already exists

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new lead list and add leads from CSV
CREATE OR REPLACE FUNCTION create_lead_list_from_csv(
  p_business_id UUID,
  p_list_name VARCHAR,
  p_leads JSONB -- Array of lead objects
)
RETURNS UUID AS $$
DECLARE
  v_list_id UUID;
  v_lead JSONB;
  v_lead_id UUID;
BEGIN
  -- Create the lead list
  INSERT INTO public.lead_lists (
    business_id,
    name,
    description,
    list_type,
    source,
    created_by
  )
  VALUES (
    p_business_id,
    p_list_name,
    'Imported from CSV',
    'static',
    'csv_import',
    auth.uid()
  )
  RETURNING id INTO v_list_id;

  -- Insert each lead and add to list
  FOR v_lead IN SELECT * FROM jsonb_array_elements(p_leads)
  LOOP
    -- Insert or get existing lead
    -- Note: We generate a unique source_id for CSV imports to handle the unique constraint
    INSERT INTO public.leads (
      business_id,
      first_name,
      last_name,
      email,
      phone,
      company,
      source,
      source_id,
      created_by
    )
    VALUES (
      p_business_id,
      v_lead->>'first_name',
      v_lead->>'last_name',
      v_lead->>'email',
      v_lead->>'phone',
      v_lead->>'company',
      'csv_import',
      COALESCE(v_lead->>'email', v_lead->>'phone', gen_random_uuid()::text), -- Use email/phone as source_id or generate one
      auth.uid()
    )
    ON CONFLICT (business_id, source, source_id)
    DO UPDATE SET
      updated_at = NOW(),
      first_name = COALESCE(EXCLUDED.first_name, leads.first_name),
      last_name = COALESCE(EXCLUDED.last_name, leads.last_name),
      phone = COALESCE(EXCLUDED.phone, leads.phone),
      company = COALESCE(EXCLUDED.company, leads.company)
    RETURNING id INTO v_lead_id;

    -- Add lead to list
    INSERT INTO public.lead_list_members (lead_list_id, lead_id, added_by)
    VALUES (v_list_id, v_lead_id, auth.uid())
    ON CONFLICT (lead_list_id, lead_id) DO NOTHING;
  END LOOP;

  RETURN v_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: CREATE USEFUL VIEWS
-- =====================================================

-- View: Campaign lead lists with stats
CREATE OR REPLACE VIEW public.campaign_lead_lists_with_stats AS
SELECT
  cll.*,
  ll.name as list_name,
  ll.description as list_description,
  ll.lead_count as total_leads_in_list,
  c.name as campaign_name,
  c.status as campaign_status,
  (
    SELECT COUNT(*)
    FROM public.campaign_leads cl
    WHERE cl.campaign_id = cll.campaign_id
    AND cl.lead_list_id = cll.lead_list_id
  ) as actual_leads_count,
  (
    SELECT COUNT(*)
    FROM public.campaign_leads cl
    WHERE cl.campaign_id = cll.campaign_id
    AND cl.lead_list_id = cll.lead_list_id
    AND cl.status = 'contacted'
  ) as contacted_count,
  (
    SELECT COUNT(*)
    FROM public.campaign_leads cl
    WHERE cl.campaign_id = cll.campaign_id
    AND cl.lead_list_id = cll.lead_list_id
    AND cl.status = 'converted'
  ) as converted_count
FROM public.campaign_lead_lists cll
JOIN public.lead_lists ll ON cll.lead_list_id = ll.id
JOIN public.campaigns c ON cll.campaign_id = c.id;

-- View: Lead lists with campaign associations
CREATE OR REPLACE VIEW public.lead_lists_with_campaigns AS
SELECT
  ll.*,
  COALESCE(
    json_agg(
      json_build_object(
        'campaign_id', c.id,
        'campaign_name', c.name,
        'campaign_status', c.status,
        'assigned_at', cll.assigned_at,
        'priority', cll.priority,
        'is_active', cll.is_active
      ) ORDER BY cll.assigned_at DESC
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::json
  ) as campaigns
FROM public.lead_lists ll
LEFT JOIN public.campaign_lead_lists cll ON ll.id = cll.lead_list_id
LEFT JOIN public.campaigns c ON cll.campaign_id = c.id
GROUP BY ll.id;

-- =====================================================
-- STEP 8: UPDATE TRIGGERS
-- =====================================================

-- Update lead list count when leads are added to campaigns
CREATE OR REPLACE FUNCTION update_campaign_lead_list_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update contacted count
    UPDATE public.campaign_lead_lists
    SET contacted_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = NEW.campaign_id
      AND lead_list_id = NEW.lead_list_id
      AND status IN ('contacted', 'converted')
    ),
    successful_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = NEW.campaign_id
      AND lead_list_id = NEW.lead_list_id
      AND status = 'converted'
    )
    WHERE campaign_id = NEW.campaign_id
    AND lead_list_id = NEW.lead_list_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update stats on delete
    UPDATE public.campaign_lead_lists
    SET contacted_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = OLD.campaign_id
      AND lead_list_id = OLD.lead_list_id
      AND status IN ('contacted', 'converted')
    ),
    successful_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = OLD.campaign_id
      AND lead_list_id = OLD.lead_list_id
      AND status = 'converted'
    )
    WHERE campaign_id = OLD.campaign_id
    AND lead_list_id = OLD.lead_list_id;

    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_lead_list_stats
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_leads
FOR EACH ROW
EXECUTE FUNCTION update_campaign_lead_list_stats();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.campaign_lead_lists IS 'Links lead lists to campaigns for organized lead management';
COMMENT ON TABLE public.campaign_leads IS 'Tracks individual leads within campaigns with their status and outcomes';
COMMENT ON COLUMN public.campaign_lead_lists.priority IS 'Processing priority for this list within the campaign (lower numbers = higher priority)';
COMMENT ON COLUMN public.campaign_leads.lead_list_id IS 'References which list this lead came from in this campaign';
COMMENT ON COLUMN public.leads.lead_score IS 'Score indicating lead quality (0-100)';
COMMENT ON COLUMN public.leads.quality_rating IS 'Qualitative rating: hot, warm, cold, or unrated';
COMMENT ON FUNCTION add_lead_list_to_campaign IS 'Assigns a lead list to a campaign and imports all leads';
COMMENT ON FUNCTION create_lead_list_from_csv IS 'Creates a new lead list from CSV data and imports leads';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- This migration makes the following changes:
--
-- REMOVED/CLEANED:
-- ✅ Removed campaign_id from leads table (leads are now campaign-independent)
-- ✅ Removed duplicate columns from leads (attempts, last_contact_date, pledged_amount, donated_amount)
-- ✅ Migrated existing campaign-lead relationships to new structure
--
-- ADDED TABLES:
-- ✅ campaign_lead_lists - Links lead lists to campaigns (many-to-many)
-- ✅ campaign_leads - Tracks individual leads in campaigns with outcomes
--
-- MODIFIED TABLES:
-- ✅ leads - Added lead_score, quality_rating, last_activity_at
-- ✅ lead_lists - Added is_archived, tags, metadata fields
--
-- DATA MIGRATION:
-- ✅ Existing campaign-lead relationships are preserved
-- ✅ Creates default lead lists for migrated data
-- ✅ Maps old status values to new schema
--
-- BENEFITS:
-- ✅ Leads can exist without campaigns
-- ✅ Lead lists are reusable across campaigns
-- ✅ Better tracking of lead sources and outcomes
-- ✅ Support for priority-based list processing
-- =====================================================