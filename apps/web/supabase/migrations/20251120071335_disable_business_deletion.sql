-- Disable business deletion completely
-- This migration removes the ability for anyone to delete businesses
-- Businesses can only be created and updated, never deleted

-- Drop the existing DELETE policy that allowed owners to delete
DROP POLICY IF EXISTS "businesses_delete" ON "public"."businesses";

-- Create a new policy that explicitly denies all DELETE operations
-- This makes the intent clear and prevents accidental re-enabling
CREATE POLICY "businesses_no_delete" ON "public"."businesses"
  FOR DELETE
  TO authenticated
  USING (false);

-- Add a comment explaining why deletion is disabled
COMMENT ON POLICY "businesses_no_delete" ON "public"."businesses" IS
  'Business deletion is permanently disabled. Businesses can only be created and updated. Contact database administrator for emergency data management.';
