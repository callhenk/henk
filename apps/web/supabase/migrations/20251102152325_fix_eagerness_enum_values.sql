-- Fix eagerness enum values to match ElevenLabs API
-- ElevenLabs uses: 'eager', 'normal', 'patient'
-- We incorrectly used: 'low', 'normal', 'high'

-- Drop the existing check constraint
ALTER TABLE public.agents
DROP CONSTRAINT IF EXISTS agents_eagerness_check;

-- Add the correct check constraint with ElevenLabs-compatible values
ALTER TABLE public.agents
ADD CONSTRAINT agents_eagerness_check CHECK (eagerness IN ('eager', 'normal', 'patient'));

-- Update existing data: map 'low' to 'patient', 'high' to 'eager'
UPDATE public.agents
SET eagerness = CASE
  WHEN eagerness = 'low' THEN 'patient'
  WHEN eagerness = 'high' THEN 'eager'
  ELSE eagerness
END
WHERE eagerness IN ('low', 'high');

-- Update the default value
ALTER TABLE public.agents
ALTER COLUMN eagerness SET DEFAULT 'normal';

-- Update comment
COMMENT ON COLUMN public.agents.eagerness IS 'Controls how eager agent is to respond: eager (fast), normal, patient (waits longer). Maps to ElevenLabs turn_eagerness.';
