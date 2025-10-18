-- =====================================================
-- SECURE VERSION OF add_lead_list_to_campaign
-- =====================================================
-- This migration replaces the SECURITY DEFINER function
-- with proper RLS permission checks to ensure users can
-- only add lead lists to campaigns they have access to.
-- =====================================================

-- Drop the existing insecure function
DROP FUNCTION IF EXISTS add_lead_list_to_campaign(UUID, UUID, INTEGER);

-- Create a secure version that checks permissions FIRST
CREATE OR REPLACE FUNCTION add_lead_list_to_campaign(
  p_campaign_id UUID,
  p_lead_list_id UUID,
  p_priority INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
  v_lead_count INTEGER;
  v_user_business_id UUID;
  v_campaign_business_id UUID;
  v_list_business_id UUID;
BEGIN
  -- Get the user's business_id from team_members
  SELECT business_id INTO v_user_business_id
  FROM public.team_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  -- If user is not part of any business, reject
  IF v_user_business_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of any business'
      USING HINT = 'Please join a business first',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the campaign belongs to the user's business
  SELECT business_id INTO v_campaign_business_id
  FROM public.campaigns
  WHERE id = p_campaign_id;

  IF v_campaign_business_id IS NULL THEN
    RAISE EXCEPTION 'Campaign not found'
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_campaign_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Campaign belongs to a different business'
      USING HINT = 'You can only add lead lists to campaigns in your business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the lead list belongs to the user's business
  SELECT business_id INTO v_list_business_id
  FROM public.lead_lists
  WHERE id = p_lead_list_id;

  IF v_list_business_id IS NULL THEN
    RAISE EXCEPTION 'Lead list not found'
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_list_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Lead list belongs to a different business'
      USING HINT = 'You can only add lead lists from your business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- All permission checks passed, proceed with the operation
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
  SET lead_list_id = EXCLUDED.lead_list_id;

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_lead_list_to_campaign(UUID, UUID, INTEGER) TO authenticated;

-- Add comprehensive comment for documentation
COMMENT ON FUNCTION add_lead_list_to_campaign IS
'Securely assigns a lead list to a campaign after verifying:
1. User is an active member of a business
2. Campaign belongs to user business
3. Lead list belongs to user business
Uses SECURITY DEFINER to batch insert leads, but enforces RLS-equivalent checks manually.';

-- =====================================================
-- SECURE VERSION OF create_lead_list_from_csv
-- =====================================================

-- Drop the existing insecure function
DROP FUNCTION IF EXISTS create_lead_list_from_csv(UUID, VARCHAR, JSONB);

-- Create a secure version that checks permissions FIRST
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
  v_user_business_id UUID;
BEGIN
  -- Get the user's business_id from team_members
  SELECT business_id INTO v_user_business_id
  FROM public.team_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  -- If user is not part of any business, reject
  IF v_user_business_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of any business'
      USING HINT = 'Please join a business first',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the business_id matches the user's business
  IF p_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Cannot create lead list for a different business'
      USING HINT = 'You can only create lead lists for your own business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- All permission checks passed, proceed with the operation
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
      COALESCE(v_lead->>'email', v_lead->>'phone', gen_random_uuid()::text),
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_lead_list_from_csv(UUID, VARCHAR, JSONB) TO authenticated;

-- Add comprehensive comment for documentation
COMMENT ON FUNCTION create_lead_list_from_csv IS
'Securely creates a new lead list from CSV data after verifying:
1. User is an active member of a business
2. Business ID matches user business
Uses SECURITY DEFINER to batch insert leads, but enforces RLS-equivalent checks manually.';
