-- Migration: Add agent training and organization data tables
-- Description: Creates tables for agent training data, organization prompts, conversation context, and performance metrics

-- Create enums first (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_type') THEN
    CREATE TYPE training_type AS ENUM ('prompt', 'script', 'faq', 'objection_handling', 'closing_technique');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_type') THEN
    CREATE TYPE prompt_type AS ENUM ('fundraising', 'follow_up', 'thank_you', 'objection_response', 'closing');
  END IF;
END $$;

-- Create agent_training_data table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.agent_training_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  training_type training_type NOT NULL DEFAULT 'prompt'::training_type,
  content text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT agent_training_data_pkey PRIMARY KEY (id),
  CONSTRAINT agent_training_data_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE,
  CONSTRAINT agent_training_data_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT agent_training_data_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create organization_prompts table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.organization_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  prompt_name character varying NOT NULL,
  prompt_type prompt_type NOT NULL DEFAULT 'fundraising'::prompt_type,
  content text NOT NULL,
  variables jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT organization_prompts_pkey PRIMARY KEY (id),
  CONSTRAINT organization_prompts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT organization_prompts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create conversation_context table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.conversation_context (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id character varying NOT NULL,
  call_log_id uuid,
  agent_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  context_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  prompt_used text,
  training_data_used jsonb DEFAULT '[]'::jsonb,
  conversation_summary text,
  key_points jsonb DEFAULT '[]'::jsonb,
  next_actions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversation_context_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_context_call_log_id_fkey FOREIGN KEY (call_log_id) REFERENCES public.call_logs(id) ON DELETE SET NULL,
  CONSTRAINT conversation_context_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE,
  CONSTRAINT conversation_context_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Create agent_performance_metrics table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.agent_performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  metric_date date NOT NULL,
  total_calls integer DEFAULT 0,
  successful_calls integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  average_call_duration numeric(10,2) DEFAULT 0,
  total_donations numeric(12,2) DEFAULT 0,
  average_donation numeric(10,2) DEFAULT 0,
  training_data_effectiveness jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agent_performance_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT agent_performance_metrics_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE,
  CONSTRAINT agent_performance_metrics_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_agent_training_data_agent_id ON public.agent_training_data(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_training_data_organization_id ON public.agent_training_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_training_data_training_type ON public.agent_training_data(training_type);
CREATE INDEX IF NOT EXISTS idx_agent_training_data_is_active ON public.agent_training_data(is_active);

CREATE INDEX IF NOT EXISTS idx_organization_prompts_business_id ON public.organization_prompts(business_id);
CREATE INDEX IF NOT EXISTS idx_organization_prompts_prompt_type ON public.organization_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_organization_prompts_is_active ON public.organization_prompts(is_active);

CREATE INDEX IF NOT EXISTS idx_conversation_context_conversation_id ON public.conversation_context(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_agent_id ON public.conversation_context(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_organization_id ON public.conversation_context(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_call_log_id ON public.conversation_context(call_log_id);

CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_agent_id ON public.agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_organization_id ON public.agent_performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_metric_date ON public.agent_performance_metrics(metric_date);

-- Add RLS policies for security
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_training_data
CREATE POLICY "Users can view agent training data for their organization" ON public.agent_training_data
  FOR SELECT USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert agent training data for their organization" ON public.agent_training_data
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update agent training data for their organization" ON public.agent_training_data
  FOR UPDATE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete agent training data for their organization" ON public.agent_training_data
  FOR DELETE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS policies for organization_prompts
CREATE POLICY "Users can view organization prompts for their organization" ON public.organization_prompts
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert organization prompts for their organization" ON public.organization_prompts
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update organization prompts for their organization" ON public.organization_prompts
  FOR UPDATE USING (
    business_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete organization prompts for their organization" ON public.organization_prompts
  FOR DELETE USING (
    business_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS policies for conversation_context
CREATE POLICY "Users can view conversation context for their organization" ON public.conversation_context
  FOR SELECT USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert conversation context for their organization" ON public.conversation_context
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update conversation context for their organization" ON public.conversation_context
  FOR UPDATE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete conversation context for their organization" ON public.conversation_context
  FOR DELETE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS policies for agent_performance_metrics
CREATE POLICY "Users can view agent performance metrics for their organization" ON public.agent_performance_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert agent performance metrics for their organization" ON public.agent_performance_metrics
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update agent performance metrics for their organization" ON public.agent_performance_metrics
  FOR UPDATE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete agent performance metrics for their organization" ON public.agent_performance_metrics
  FOR DELETE USING (
    organization_id IN (
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add triggers for updated_at timestamps
-- Check if function exists first to avoid conflicts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_update_timestamp') THEN
    CREATE FUNCTION trigger_update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER IF NOT EXISTS trigger_agent_training_data_timestamp
  BEFORE UPDATE ON public.agent_training_data
  FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_organization_prompts_timestamp
  BEFORE UPDATE ON public.organization_prompts
  FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_conversation_context_timestamp
  BEFORE UPDATE ON public.conversation_context
  FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER IF NOT EXISTS trigger_agent_performance_metrics_timestamp
  BEFORE UPDATE ON public.agent_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

-- Add comments for documentation
COMMENT ON TABLE public.agent_training_data IS 'Stores training data and prompts for AI agents';
COMMENT ON TABLE public.organization_prompts IS 'Stores reusable prompts for organizations';
COMMENT ON TABLE public.conversation_context IS 'Stores context and metadata for conversations';
COMMENT ON TABLE public.agent_performance_metrics IS 'Stores daily performance metrics for agents';

COMMENT ON COLUMN public.agent_training_data.training_type IS 'Type of training data (prompt, script, faq, etc.)';
COMMENT ON COLUMN public.agent_training_data.content IS 'The actual training content';
COMMENT ON COLUMN public.agent_training_data.context IS 'Additional context for the training data';
COMMENT ON COLUMN public.agent_training_data.priority IS 'Priority level for training data (1-10)';

COMMENT ON COLUMN public.organization_prompts.prompt_type IS 'Type of prompt (fundraising, follow_up, etc.)';
COMMENT ON COLUMN public.organization_prompts.content IS 'The prompt content';
COMMENT ON COLUMN public.organization_prompts.variables IS 'Template variables for the prompt';

COMMENT ON COLUMN public.conversation_context.context_data IS 'Conversation context and state';
COMMENT ON COLUMN public.conversation_context.training_data_used IS 'Training data used during conversation';
COMMENT ON COLUMN public.conversation_context.key_points IS 'Key points extracted from conversation';
COMMENT ON COLUMN public.conversation_context.next_actions IS 'Next actions identified from conversation';

COMMENT ON COLUMN public.agent_performance_metrics.metric_date IS 'Date for the performance metrics';
COMMENT ON COLUMN public.agent_performance_metrics.conversion_rate IS 'Conversion rate as percentage';
COMMENT ON COLUMN public.agent_performance_metrics.training_data_effectiveness IS 'Effectiveness metrics for training data'; 