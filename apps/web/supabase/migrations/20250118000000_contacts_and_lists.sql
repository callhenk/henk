-- =====================================================
-- CONTACTS & LISTS MANAGEMENT SYSTEM
-- =====================================================
-- Creates tables for managing contacts from multiple sources
-- (Salesforce, HubSpot, manual, CSV) and organizing them
-- into reusable lists for campaigns.
-- =====================================================

-- =====================================================
-- 1. CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Source tracking (supports Salesforce, HubSpot, manual, CSV, etc.)
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  source_id VARCHAR(255),
  source_metadata JSONB DEFAULT '{}'::jsonb,

  -- Basic contact information
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile_phone VARCHAR(50),

  -- Address information
  street TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  -- Organization/Account info
  company VARCHAR(255),
  title VARCHAR(255),
  department VARCHAR(255),

  -- Additional fields
  lead_source VARCHAR(100),
  description TEXT,
  owner_id VARCHAR(255),

  -- Communication preferences
  do_not_call BOOLEAN DEFAULT false,
  do_not_email BOOLEAN DEFAULT false,
  email_opt_out BOOLEAN DEFAULT false,

  -- Metadata
  timezone VARCHAR(100),
  preferred_language VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'active',
  sync_error TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT contacts_has_contact_info CHECK (
    phone IS NOT NULL OR
    mobile_phone IS NOT NULL OR
    email IS NOT NULL
  ),
  CONSTRAINT contacts_source_unique UNIQUE (business_id, source, source_id)
);

-- Indexes for performance
CREATE INDEX idx_contacts_business_id ON public.contacts(business_id);
CREATE INDEX idx_contacts_source ON public.contacts(business_id, source);
CREATE INDEX idx_contacts_source_id ON public.contacts(source, source_id);
CREATE INDEX idx_contacts_email ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_phone ON public.contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX idx_contacts_last_synced_at ON public.contacts(last_synced_at);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view contacts in their business"
  ON public.contacts FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert contacts in their business"
  ON public.contacts FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update contacts in their business"
  ON public.contacts FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete contacts in their business"
  ON public.contacts FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- =====================================================
-- 2. CONTACT LISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- List details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',

  -- List type and source
  list_type VARCHAR(50) DEFAULT 'static',
  source VARCHAR(50),
  source_id VARCHAR(255),

  -- Dynamic list criteria (for smart lists)
  filter_criteria JSONB,

  -- Stats (cached for performance)
  contact_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_contact_lists_business_id ON public.contact_lists(business_id);
CREATE INDEX idx_contact_lists_list_type ON public.contact_lists(list_type);
CREATE INDEX idx_contact_lists_name ON public.contact_lists(business_id, name);

-- Enable RLS
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view lists in their business"
  ON public.contact_lists FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert lists in their business"
  ON public.contact_lists FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update lists in their business"
  ON public.contact_lists FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete lists in their business"
  ON public.contact_lists FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- =====================================================
-- 3. CONTACT LIST MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contact_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,

  -- Member-specific data
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,

  -- Prevent duplicates
  CONSTRAINT contact_list_members_unique UNIQUE (contact_list_id, contact_id)
);

-- Indexes
CREATE INDEX idx_contact_list_members_list ON public.contact_list_members(contact_list_id);
CREATE INDEX idx_contact_list_members_contact ON public.contact_list_members(contact_id);

-- Enable RLS
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view list members in their business"
  ON public.contact_list_members FOR SELECT
  USING (
    contact_list_id IN (
      SELECT id FROM public.contact_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can insert list members in their business"
  ON public.contact_list_members FOR INSERT
  WITH CHECK (
    contact_list_id IN (
      SELECT id FROM public.contact_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can delete list members in their business"
  ON public.contact_list_members FOR DELETE
  USING (
    contact_list_id IN (
      SELECT id FROM public.contact_lists
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- =====================================================
-- 4. UPDATE LEADS TABLE
-- =====================================================
-- Add contact_id to link leads to master contact records
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON public.leads(contact_id);

-- =====================================================
-- 5. TRIGGER FUNCTIONS
-- =====================================================

-- Update contact_lists.contact_count when members are added/removed
CREATE OR REPLACE FUNCTION update_contact_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists
    SET contact_count = contact_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.contact_list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists
    SET contact_count = GREATEST(0, contact_count - 1),
        last_updated_at = NOW()
    WHERE id = OLD.contact_list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_list_count
AFTER INSERT OR DELETE ON public.contact_list_members
FOR EACH ROW
EXECUTE FUNCTION update_contact_list_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contact_lists_updated_at
BEFORE UPDATE ON public.contact_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. HELPFUL VIEWS
-- =====================================================

-- View: contacts with their list memberships
CREATE OR REPLACE VIEW public.contacts_with_lists AS
SELECT
  c.*,
  COALESCE(
    json_agg(
      json_build_object(
        'list_id', cl.id,
        'list_name', cl.name,
        'added_at', clm.added_at
      ) ORDER BY clm.added_at DESC
    ) FILTER (WHERE cl.id IS NOT NULL),
    '[]'::json
  ) as lists
FROM public.contacts c
LEFT JOIN public.contact_list_members clm ON c.id = clm.contact_id
LEFT JOIN public.contact_lists cl ON clm.contact_list_id = cl.id
GROUP BY c.id;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.contacts IS 'Master contacts table for all contact sources (Salesforce, HubSpot, manual, CSV, etc.)';
COMMENT ON TABLE public.contact_lists IS 'Reusable lists for organizing contacts into groups';
COMMENT ON TABLE public.contact_list_members IS 'Many-to-many relationship between contacts and lists';
COMMENT ON COLUMN public.contacts.source IS 'Origin of the contact: salesforce, hubspot, manual, csv_import, etc.';
COMMENT ON COLUMN public.contacts.source_id IS 'External ID from the source system (e.g., Salesforce Contact ID)';
COMMENT ON COLUMN public.contacts.tags IS 'Flexible JSON array for categorizing contacts';
COMMENT ON COLUMN public.contact_lists.list_type IS 'static: manual additions | dynamic: rule-based | smart: auto-updating query';
