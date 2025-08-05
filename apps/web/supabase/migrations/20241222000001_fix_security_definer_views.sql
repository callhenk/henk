-- Fix security definer views to use security invoker
-- This addresses security concerns with views running with elevated privileges

-- Drop and recreate campaign_performance view with SECURITY INVOKER
DROP VIEW IF EXISTS public.campaign_performance;

CREATE VIEW public.campaign_performance AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.status as campaign_status,
    COUNT(l.id) as total_leads,
    COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN l.status = 'pledged' THEN 1 END) as pledged_leads,
    COUNT(CASE WHEN l.status = 'failed' THEN 1 END) as failed_leads,
    SUM(COALESCE(l.pledged_amount, 0)) as total_pledged,
    SUM(COALESCE(l.donated_amount, 0)) as total_donated,
    AVG(CASE WHEN conv.duration_seconds IS NOT NULL THEN conv.duration_seconds END) as avg_call_duration,
    COUNT(DISTINCT conv.id) as total_conversations
FROM campaigns c
LEFT JOIN leads l ON c.id = l.campaign_id
LEFT JOIN conversations conv ON c.id = conv.campaign_id
GROUP BY c.id, c.name, c.status;

-- Drop and recreate daily_call_volume view with SECURITY INVOKER
DROP VIEW IF EXISTS public.daily_call_volume;

CREATE VIEW public.daily_call_volume AS
SELECT 
    DATE(conv.started_at) as call_date,
    COUNT(conv.id) as total_calls,
    COUNT(CASE WHEN conv.status = 'completed' THEN 1 END) as completed_calls,
    COUNT(CASE WHEN conv.status = 'failed' THEN 1 END) as failed_calls,
    COUNT(CASE WHEN conv.status = 'no_answer' THEN 1 END) as no_answer_calls,
    COUNT(CASE WHEN conv.status = 'busy' THEN 1 END) as busy_calls,
    COUNT(CASE WHEN conv.status = 'voicemail' THEN 1 END) as voicemail_calls,
    AVG(CASE WHEN conv.duration_seconds IS NOT NULL THEN conv.duration_seconds END) as avg_duration,
    SUM(CASE WHEN conv.duration_seconds IS NOT NULL THEN conv.duration_seconds END) as total_duration
FROM conversations conv
WHERE conv.started_at IS NOT NULL
GROUP BY DATE(conv.started_at)
ORDER BY call_date DESC;

-- Add comments for documentation
COMMENT ON VIEW public.campaign_performance IS 'Campaign performance metrics with security invoker';
COMMENT ON VIEW public.daily_call_volume IS 'Daily call volume statistics with security invoker'; 