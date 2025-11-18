-- Fix database linter errors
-- This migration addresses 4 issues found by supabase db lint

-- Issue 1: Fix get_next_queued_call return type mismatch
-- The function returns character varying but declares text
-- Change the return type to match the actual leads.phone column type
CREATE OR REPLACE FUNCTION public.get_next_queued_call(p_campaign_id uuid)
RETURNS TABLE (
  queue_id uuid,
  lead_id uuid,
  phone_number text,  -- Changed from character varying to text
  attempt_number integer,
  scheduled_for timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    cq.id as queue_id,
    cq.lead_id,
    l.phone::text as phone_number,  -- Cast to text
    cq.attempt_number,
    cq.scheduled_for
  FROM public.campaign_queue cq
  JOIN public.leads l ON cq.lead_id = l.id
  WHERE cq.campaign_id = p_campaign_id
    AND cq.status = 'scheduled'
    AND cq.scheduled_for <= NOW()
  ORDER BY cq.priority ASC, cq.scheduled_for ASC
  LIMIT 1;
$$;

-- Issue 2: Fix can_campaign_make_calls invalid enum value
-- The queue_status enum doesn't have 'in_progress', should be 'processing'
CREATE OR REPLACE FUNCTION public.can_campaign_make_calls(campaign_row public.campaigns)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  current_hour integer;
  start_hour integer;
  end_hour integer;
  calls_today integer;
BEGIN
  -- Check if campaign is active
  IF campaign_row.status != 'active' THEN
    RETURN false;
  END IF;

  -- Check call window
  current_hour := EXTRACT(HOUR FROM NOW());
  start_hour := EXTRACT(HOUR FROM campaign_row.call_window_start::time);
  end_hour := EXTRACT(HOUR FROM campaign_row.call_window_end::time);

  IF current_hour < start_hour OR current_hour >= end_hour THEN
    RETURN false;
  END IF;

  -- Check daily call cap
  IF campaign_row.daily_call_cap IS NOT NULL THEN
    SELECT COUNT(*) INTO calls_today
    FROM public.campaign_queue
    WHERE campaign_id = campaign_row.id
      AND DATE(created_at) = CURRENT_DATE
      AND status IN ('completed', 'processing');  -- Changed 'in_progress' to 'processing'

    IF calls_today >= campaign_row.daily_call_cap THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- Issue 3: Fix create_lead_list_from_csv column name
-- The column is 'list_type', not 'type'
CREATE OR REPLACE FUNCTION public.create_lead_list_from_csv(
  p_name text,
  p_description text,
  p_business_id uuid,
  p_csv_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_list_id uuid;
BEGIN
  -- Create the list with correct column name
  INSERT INTO public.lead_lists (name, description, business_id, list_type)
  VALUES (p_name, p_description, p_business_id, 'static')
  RETURNING id INTO v_list_id;

  RETURN v_list_id;
END;
$$;

-- Issue 4: Fix update_campaign_execution_stats non-existent columns
-- The campaigns table doesn't have total_calls, completed_calls, failed_calls columns
-- Remove the UPDATE statement since these columns don't exist
-- This function is called by triggers but doesn't need to update anything
-- if the columns don't exist in the schema
CREATE OR REPLACE FUNCTION public.update_campaign_execution_stats(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_total_calls integer;
  v_completed_calls integer;
  v_failed_calls integer;
BEGIN
  -- Calculate stats from campaign_executions
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_total_calls, v_completed_calls, v_failed_calls
  FROM public.campaign_executions
  WHERE campaign_id = p_campaign_id;

  -- Note: campaigns table doesn't have total_calls, completed_calls, failed_calls columns
  -- If these columns are needed in the future, add them via migration first
  -- For now, this function just calculates the stats without storing them

  -- The function is kept to avoid breaking triggers that call it
  RETURN;
END;
$$;
