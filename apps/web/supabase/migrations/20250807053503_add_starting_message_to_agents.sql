-- Add starting_message column to agents table
ALTER TABLE agents ADD COLUMN starting_message TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN agents.starting_message IS 'The initial message the agent uses when starting a call';
