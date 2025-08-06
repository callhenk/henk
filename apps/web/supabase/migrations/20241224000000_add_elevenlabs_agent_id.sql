-- Add elevenlabs_agent_id field to agents table
ALTER TABLE public.agents 
ADD COLUMN elevenlabs_agent_id text;

-- Add comment for documentation
COMMENT ON COLUMN public.agents.elevenlabs_agent_id IS 'ElevenLabs agent ID for voice integration';

-- Create index for better performance when querying by ElevenLabs agent ID
CREATE INDEX IF NOT EXISTS idx_agents_elevenlabs_agent_id ON public.agents(elevenlabs_agent_id); 