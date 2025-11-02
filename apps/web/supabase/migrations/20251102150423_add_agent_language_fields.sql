-- Add language fields to agents table
-- Language: default language the agent will communicate in
-- Additional Languages: array of additional languages callers can choose from

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS language text DEFAULT 'english' NOT NULL,
ADD COLUMN IF NOT EXISTS additional_languages jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.agents.language IS 'Default language the agent communicates in';
COMMENT ON COLUMN public.agents.additional_languages IS 'Additional languages callers can choose from (array of language strings)';
