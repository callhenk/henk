-- Add business_id column to workflows table
ALTER TABLE workflows ADD COLUMN business_id uuid;

-- Populate business_id from agents table
UPDATE workflows w
SET business_id = a.business_id
FROM agents a
WHERE w.agent_id = a.id;

-- Make business_id NOT NULL now that it's populated
ALTER TABLE workflows ALTER COLUMN business_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE workflows ADD CONSTRAINT workflows_business_id_fkey
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_workflows_business_id ON workflows(business_id);

-- Update RLS policies to use business_id directly for better performance
DROP POLICY IF EXISTS "Users can view workflows for their business" ON workflows;
DROP POLICY IF EXISTS "Users can insert workflows for their business" ON workflows;
DROP POLICY IF EXISTS "Users can update workflows for their business" ON workflows;
DROP POLICY IF EXISTS "Users can delete workflows for their business" ON workflows;

-- Recreate policies using business_id directly
CREATE POLICY "Users can view workflows for their business" ON workflows
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id
      FROM team_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Users can insert workflows for their business" ON workflows
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id
      FROM team_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update workflows for their business" ON workflows
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id
      FROM team_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Users can delete workflows for their business" ON workflows
  FOR DELETE
  USING (
    business_id IN (
      SELECT business_id
      FROM team_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );
