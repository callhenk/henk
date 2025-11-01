-- Add enabled_tools column to agents table
-- This column stores which tools are enabled for the agent (end_call, skip_turn, play_keypad_tone, voicemail_detection)

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS enabled_tools JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN agents.enabled_tools IS 'Array of enabled tool IDs for the agent. Possible values: end_call, skip_turn, play_keypad_tone, voicemail_detection';

-- Create index for faster queries on enabled_tools
CREATE INDEX IF NOT EXISTS idx_agents_enabled_tools ON agents USING GIN (enabled_tools);
