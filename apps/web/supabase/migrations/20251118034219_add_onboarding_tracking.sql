-- Add onboarding tracking columns to team_members table
-- This allows us to track user onboarding progress and completion

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 0;

-- Add index for quick lookups of onboarding status
CREATE INDEX IF NOT EXISTS idx_team_members_onboarding
ON team_members(onboarding_completed, onboarding_skipped);

-- Add comment for documentation
COMMENT ON COLUMN team_members.onboarding_completed IS 'Whether the user has completed the product tour';
COMMENT ON COLUMN team_members.onboarding_skipped IS 'Whether the user has skipped the product tour';
COMMENT ON COLUMN team_members.onboarding_completed_at IS 'Timestamp when the user completed the product tour';
COMMENT ON COLUMN team_members.onboarding_current_step IS 'Current step in the onboarding tour (0-based index)';
