-- Create knowledge_bases table for ElevenLabs knowledge bases with business isolation
CREATE TABLE IF NOT EXISTS public.knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  elevenlabs_kb_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  file_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive, deleted
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_elevenlabs_kb_per_business UNIQUE(business_id, elevenlabs_kb_id)
);

-- Create index for faster queries by business_id
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_business_id ON public.knowledge_bases(business_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_elevenlabs_kb_id ON public.knowledge_bases(elevenlabs_kb_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_created_at ON public.knowledge_bases(created_at);

-- Enable RLS
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see knowledge bases for their business
CREATE POLICY "Users can view knowledge bases for their business"
  ON public.knowledge_bases
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create knowledge bases for their business
CREATE POLICY "Users can create knowledge bases for their business"
  ON public.knowledge_bases
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update knowledge bases for their business
CREATE POLICY "Users can update knowledge bases for their business"
  ON public.knowledge_bases
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete knowledge bases for their business
CREATE POLICY "Users can delete knowledge bases for their business"
  ON public.knowledge_bases
  FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Create agents_knowledge_bases junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.agents_knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_agent_kb UNIQUE(agent_id, knowledge_base_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_bases_agent_id ON public.agents_knowledge_bases(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_bases_kb_id ON public.agents_knowledge_bases(knowledge_base_id);

-- Enable RLS on junction table
ALTER TABLE public.agents_knowledge_bases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view agent-kb relationships for their business agents
CREATE POLICY "Users can view agent knowledge base relationships"
  ON public.agents_knowledge_bases
  FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can create agent-kb relationships for their business
CREATE POLICY "Users can create agent knowledge base relationships"
  ON public.agents_knowledge_bases
  FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid()
      )
    )
    AND knowledge_base_id IN (
      SELECT id FROM public.knowledge_bases
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can delete agent-kb relationships for their business
CREATE POLICY "Users can delete agent knowledge base relationships"
  ON public.agents_knowledge_bases
  FOR DELETE
  USING (
    agent_id IN (
      SELECT id FROM public.agents
      WHERE business_id IN (
        SELECT business_id FROM public.team_members
        WHERE user_id = auth.uid()
      )
    )
  );
