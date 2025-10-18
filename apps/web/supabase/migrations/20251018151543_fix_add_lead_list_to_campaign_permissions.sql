-- =====================================================
-- FIX PERMISSIONS FOR add_lead_list_to_campaign FUNCTION
-- =====================================================
-- This migration fixes the RLS permission error when calling
-- the add_lead_list_to_campaign function by ensuring it has
-- proper SECURITY DEFINER and search_path settings

-- Drop the existing function to recreate it with proper permissions
DROP FUNCTION IF EXISTS add_lead_list_to_campaign(UUID, UUID, INTEGER);

-- Recreate the function with proper security settings
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_lead_list_to_campaign(UUID, UUID, INTEGER) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION add_lead_list_to_campaign IS 'Assigns a lead list to a campaign and imports all leads. Uses SECURITY DEFINER to bypass RLS.';
