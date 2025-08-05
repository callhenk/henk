-- Add RLS policies for workflow tables
-- These tables have RLS enabled but no policies defined

-- Enable RLS on workflow tables (if not already enabled)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_edges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflows table
CREATE POLICY "Users can view workflows for their business" ON public.workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE a.id = workflows.agent_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can insert workflows for their business" ON public.workflows
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE a.id = workflows.agent_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can update workflows for their business" ON public.workflows
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE a.id = workflows.agent_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can delete workflows for their business" ON public.workflows
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE a.id = workflows.agent_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

-- Create RLS policies for workflow_nodes table
CREATE POLICY "Users can view workflow nodes for their business" ON public.workflow_nodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_nodes.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can insert workflow nodes for their business" ON public.workflow_nodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_nodes.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can update workflow nodes for their business" ON public.workflow_nodes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_nodes.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can delete workflow nodes for their business" ON public.workflow_nodes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_nodes.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

-- Create RLS policies for workflow_edges table
CREATE POLICY "Users can view workflow edges for their business" ON public.workflow_edges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_edges.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can insert workflow edges for their business" ON public.workflow_edges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_edges.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can update workflow edges for their business" ON public.workflow_edges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_edges.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Users can delete workflow edges for their business" ON public.workflow_edges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workflows w
            JOIN agents a ON w.agent_id = a.id
            JOIN businesses b ON a.business_id = b.id
            JOIN team_members tm ON b.id = tm.business_id
            WHERE w.id = workflow_edges.workflow_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

-- Add comments for documentation
COMMENT ON POLICY "Users can view workflows for their business" ON public.workflows IS 'RLS policy: Users can only view workflows for agents in their business';
COMMENT ON POLICY "Users can insert workflows for their business" ON public.workflows IS 'RLS policy: Users can only insert workflows for agents in their business';
COMMENT ON POLICY "Users can update workflows for their business" ON public.workflows IS 'RLS policy: Users can only update workflows for agents in their business';
COMMENT ON POLICY "Users can delete workflows for their business" ON public.workflows IS 'RLS policy: Users can only delete workflows for agents in their business'; 