-- Fix migration: Ensure contact_count is renamed to lead_count
-- This migration handles cases where the rename might have failed

-- First check if contact_count column still exists and rename it
DO $$
BEGIN
  -- Check if contact_count exists in lead_lists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'lead_lists'
    AND column_name = 'contact_count'
  ) THEN
    -- Rename the column
    ALTER TABLE public.lead_lists RENAME COLUMN contact_count TO lead_count;
  END IF;
END $$;

-- Ensure lead_count column exists with proper default
DO $$
BEGIN
  -- Check if lead_count doesn't exist (shouldn't happen, but being safe)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'lead_lists'
    AND column_name = 'lead_count'
  ) THEN
    -- Add the column
    ALTER TABLE public.lead_lists ADD COLUMN lead_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Drop the old view if it still exists
DROP VIEW IF EXISTS public.contacts_with_lists CASCADE;

-- Ensure the new view exists
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

-- Update any triggers that might be using contact_count
DROP TRIGGER IF EXISTS update_contact_list_count_trigger ON public.lead_list_members;

-- Create the correct trigger
CREATE OR REPLACE FUNCTION update_lead_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lead_lists
    SET lead_count = lead_count + 1,
        last_updated_at = now()
    WHERE id = NEW.lead_list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lead_lists
    SET lead_count = GREATEST(0, lead_count - 1),
        last_updated_at = now()
    WHERE id = OLD.lead_list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_lead_list_count_trigger
AFTER INSERT OR DELETE ON public.lead_list_members
FOR EACH ROW EXECUTE FUNCTION update_lead_list_count();

-- Recalculate lead_count for all lists to ensure accuracy
UPDATE public.lead_lists ll
SET lead_count = (
  SELECT COUNT(*)
  FROM public.lead_list_members llm
  WHERE llm.lead_list_id = ll.id
);

-- Add comment to clarify the column name
COMMENT ON COLUMN public.lead_lists.lead_count IS 'Count of leads in this list (previously contact_count)';