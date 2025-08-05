-- Fix function search path security issues
-- Set explicit search paths for functions to prevent search path injection attacks

-- Drop dependent triggers first
DROP TRIGGER IF EXISTS trigger_call_logs_stats_update ON public.call_logs;
DROP TRIGGER IF EXISTS trigger_conversations_stats_update ON public.conversations;
DROP TRIGGER IF EXISTS trigger_campaigns_timestamp ON public.campaigns;
DROP TRIGGER IF EXISTS trigger_agents_timestamp ON public.agents;
DROP TRIGGER IF EXISTS trigger_leads_timestamp ON public.leads;
DROP TRIGGER IF EXISTS trigger_call_logs_timestamp ON public.call_logs;
DROP TRIGGER IF EXISTS trigger_audio_generations_timestamp ON public.audio_generations;
DROP TRIGGER IF EXISTS trigger_campaign_executions_timestamp ON public.campaign_executions;
DROP TRIGGER IF EXISTS trigger_campaign_queue_timestamp ON public.campaign_queue;
DROP TRIGGER IF EXISTS trigger_conversations_timestamp ON public.conversations;
DROP TRIGGER IF EXISTS trigger_integrations_timestamp ON public.integrations;
DROP TRIGGER IF EXISTS trigger_workflows_timestamp ON public.workflows;
DROP TRIGGER IF EXISTS trigger_workflow_nodes_timestamp ON public.workflow_nodes;
DROP TRIGGER IF EXISTS trigger_workflow_edges_timestamp ON public.workflow_edges;
DROP TRIGGER IF EXISTS trigger_businesses_timestamp ON public.businesses;
DROP TRIGGER IF EXISTS trigger_team_members_timestamp ON public.team_members;

-- Drop existing functions first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.get_next_queued_call();
DROP FUNCTION IF EXISTS public.update_campaign_execution_stats();
DROP FUNCTION IF EXISTS public.can_campaign_make_calls(uuid);
DROP FUNCTION IF EXISTS public.trigger_update_campaign_stats();
DROP FUNCTION IF EXISTS public.trigger_update_timestamp();

-- Fix get_next_queued_call function
CREATE OR REPLACE FUNCTION public.get_next_queued_call()
RETURNS TABLE(
    call_id UUID,
    campaign_id UUID,
    agent_id UUID,
    lead_id UUID,
    phone_number TEXT,
    script TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as call_id,
        c.campaign_id,
        c.agent_id,
        c.lead_id,
        l.phone as phone_number,
        cam.script
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    JOIN campaigns cam ON c.campaign_id = cam.id
    WHERE c.status = 'initiated'
    ORDER BY c.created_at ASC
    LIMIT 1;
END;
$$;

-- Fix update_campaign_execution_stats function
CREATE OR REPLACE FUNCTION public.update_campaign_execution_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update campaign statistics when conversations change
    UPDATE campaigns 
    SET updated_at = NOW()
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$;

-- Fix can_campaign_make_calls function
CREATE OR REPLACE FUNCTION public.can_campaign_make_calls(p_campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    campaign_record RECORD;
BEGIN
    SELECT * INTO campaign_record
    FROM campaigns
    WHERE id = p_campaign_id;
    
    RETURN campaign_record.status = 'active' 
           AND campaign_record.start_date <= NOW()::DATE
           AND (campaign_record.end_date IS NULL OR campaign_record.end_date >= NOW()::DATE);
END;
$$;

-- Fix trigger_update_campaign_stats function
CREATE OR REPLACE FUNCTION public.trigger_update_campaign_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Trigger function to update campaign statistics
    PERFORM update_campaign_execution_stats();
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix trigger_update_timestamp function
CREATE OR REPLACE FUNCTION public.trigger_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER trigger_call_logs_stats_update
    AFTER INSERT OR UPDATE OR DELETE ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_campaign_stats();

CREATE TRIGGER trigger_conversations_stats_update
    AFTER INSERT OR UPDATE OR DELETE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_campaign_stats();

CREATE TRIGGER trigger_campaigns_timestamp
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_agents_timestamp
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_leads_timestamp
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_call_logs_timestamp
    BEFORE UPDATE ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_audio_generations_timestamp
    BEFORE UPDATE ON public.audio_generations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_campaign_executions_timestamp
    BEFORE UPDATE ON public.campaign_executions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_campaign_queue_timestamp
    BEFORE UPDATE ON public.campaign_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_conversations_timestamp
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_integrations_timestamp
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_workflows_timestamp
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_workflow_nodes_timestamp
    BEFORE UPDATE ON public.workflow_nodes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_workflow_edges_timestamp
    BEFORE UPDATE ON public.workflow_edges
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_businesses_timestamp
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER trigger_team_members_timestamp
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

-- Add comments for documentation
COMMENT ON FUNCTION public.get_next_queued_call() IS 'Get next queued call with explicit search path';
COMMENT ON FUNCTION public.update_campaign_execution_stats() IS 'Update campaign stats with explicit search path';
COMMENT ON FUNCTION public.can_campaign_make_calls(UUID) IS 'Check if campaign can make calls with explicit search path';
COMMENT ON FUNCTION public.trigger_update_campaign_stats() IS 'Trigger to update campaign stats with explicit search path';
COMMENT ON FUNCTION public.trigger_update_timestamp() IS 'Trigger to update timestamp with explicit search path'; 