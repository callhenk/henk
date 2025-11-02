-- Add conversation settings fields to agents table
-- Privacy settings: retention period for conversations
-- Advanced settings: turn timeout, eagerness, silence timeout, max duration

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS retention_period_days integer DEFAULT 90,
ADD COLUMN IF NOT EXISTS turn_timeout integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS eagerness text DEFAULT 'normal' CHECK (eagerness IN ('low', 'normal', 'high')),
ADD COLUMN IF NOT EXISTS silence_end_call_timeout integer DEFAULT -1,
ADD COLUMN IF NOT EXISTS max_conversation_duration integer DEFAULT 600;

-- Add comments for documentation
COMMENT ON COLUMN public.agents.retention_period_days IS 'Number of days to retain conversation data (privacy setting)';
COMMENT ON COLUMN public.agents.turn_timeout IS 'Max seconds since user last spoke before agent responds. -1 means never timeout.';
COMMENT ON COLUMN public.agents.eagerness IS 'Controls how eager agent is to respond: low, normal, high';
COMMENT ON COLUMN public.agents.silence_end_call_timeout IS 'Max seconds of silence before ending call. -1 means no fixed cutoff.';
COMMENT ON COLUMN public.agents.max_conversation_duration IS 'Maximum conversation duration in seconds';
