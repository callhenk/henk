-- Add transfer_rules column to agents table for storing agent-to-agent transfer configurations
-- Based on ElevenLabs API: https://elevenlabs.io/docs/conversational-ai/customization/tools/system-tools/agent-transfer

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS transfer_rules JSONB DEFAULT '{"transfers": []}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN agents.transfer_rules IS 'Agent-to-agent transfer configuration. Contains transfers array with rules defining conditions and target agents for conversation handoffs.';

-- Create index for faster queries on transfer_rules
CREATE INDEX IF NOT EXISTS idx_agents_transfer_rules ON agents USING GIN (transfer_rules);

-- Example structure for transfer_rules:
-- {
--   "transfers": [
--     {
--       "agent_id": "uuid-of-target-agent",
--       "condition": "User asks about billing or payment issues",
--       "delay_ms": 0,
--       "transfer_message": "Let me connect you with our billing specialist.",
--       "enable_transferred_agent_first_message": true
--     }
--   ]
-- }
