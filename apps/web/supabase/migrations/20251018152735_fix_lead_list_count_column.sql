-- =====================================================
-- FIX LEAD LIST COUNT COLUMN NAME
-- =====================================================
-- The trigger function was updating 'contact_count' but
-- the column should be named 'lead_count' for consistency.
-- =====================================================

-- Update the trigger function to use the correct column name
CREATE OR REPLACE FUNCTION update_lead_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lead_lists
    SET lead_count = lead_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.lead_list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lead_lists
    SET lead_count = GREATEST(0, lead_count - 1),
        last_updated_at = NOW()
    WHERE id = OLD.lead_list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all lead list counts to ensure they're accurate
UPDATE public.lead_lists
SET lead_count = (
  SELECT COUNT(*)
  FROM public.lead_list_members
  WHERE lead_list_id = lead_lists.id
);

-- Add comment for documentation
COMMENT ON COLUMN public.lead_lists.lead_count IS 'Automatically maintained count of members in this lead list';
