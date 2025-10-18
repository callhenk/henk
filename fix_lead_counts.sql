-- =====================================================
-- EMERGENCY FIX: Recalculate Lead List Counts
-- =====================================================
-- Run this directly in Supabase SQL Editor or via psql
-- to immediately fix the lead_count discrepancy
-- =====================================================

-- First, let's see what the current state is
SELECT
  ll.id,
  ll.name,
  ll.lead_count as stored_count,
  ll.contact_count as old_column_count,
  (SELECT COUNT(*) FROM public.lead_list_members WHERE lead_list_id = ll.id) as actual_count
FROM public.lead_lists ll
ORDER BY ll.name;

-- Update lead_count to match actual member count
-- (This works whether the column is named lead_count or contact_count)
UPDATE public.lead_lists
SET lead_count = (
  SELECT COUNT(*)
  FROM public.lead_list_members
  WHERE lead_list_id = lead_lists.id
)
WHERE EXISTS (SELECT 1 FROM public.lead_list_members WHERE lead_list_id = lead_lists.id);

-- Set to 0 for lists with no members
UPDATE public.lead_lists
SET lead_count = 0
WHERE NOT EXISTS (SELECT 1 FROM public.lead_list_members WHERE lead_list_id = lead_lists.id);

-- Verify the fix
SELECT
  ll.id,
  ll.name,
  ll.lead_count as stored_count,
  (SELECT COUNT(*) FROM public.lead_list_members WHERE lead_list_id = ll.id) as actual_count,
  CASE
    WHEN ll.lead_count = (SELECT COUNT(*) FROM public.lead_list_members WHERE lead_list_id = ll.id)
    THEN '✓ FIXED'
    ELSE '✗ MISMATCH'
  END as status
FROM public.lead_lists ll
ORDER BY ll.name;
