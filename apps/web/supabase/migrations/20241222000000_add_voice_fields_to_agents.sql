-- Add voice-related fields to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}'::jsonb,
ADD COLUMN IF NOT EXISTS personality TEXT,
ADD COLUMN IF NOT EXISTS script_template TEXT;

-- Update existing agents to have default voice settings
UPDATE agents 
SET voice_settings = '{"stability": 0.5, "similarity_boost": 0.75}'::jsonb
WHERE voice_settings IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN agents.voice_settings IS 'Voice synthesis settings (stability, similarity_boost, etc.)';
COMMENT ON COLUMN agents.personality IS 'Agent personality description for voice synthesis';
COMMENT ON COLUMN agents.script_template IS 'Default script template for the agent'; 