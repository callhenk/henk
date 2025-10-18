-- Create sync_logs table for tracking Salesforce sync operations
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Sync details
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
  sync_status VARCHAR(50) NOT NULL CHECK (sync_status IN ('running', 'success', 'partial', 'failed')),

  -- Metrics
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Metadata (can store additional info like contacts_synced, leads_synced counts)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_sync_logs_integration ON public.sync_logs(integration_id, created_at DESC);
CREATE INDEX idx_sync_logs_business ON public.sync_logs(business_id, created_at DESC);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(sync_status, created_at DESC);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view sync logs for their business
CREATE POLICY "Team members can view sync logs for their business"
  ON public.sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.business_id = sync_logs.business_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Policy: Admin team members can insert sync logs for their business
CREATE POLICY "Admin team members can insert sync logs"
  ON public.sync_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.business_id = sync_logs.business_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.role IN ('owner', 'admin')
    )
  );

-- Policy: Admin team members can update sync logs for their business
CREATE POLICY "Admin team members can update sync logs"
  ON public.sync_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.business_id = sync_logs.business_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.business_id = sync_logs.business_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.role IN ('owner', 'admin')
    )
  );

-- Policy: No one can delete sync logs (audit trail)
-- Only service role can delete if needed for maintenance

-- Policy: Service role can manage all sync logs (for edge functions)
CREATE POLICY "Service role can manage all sync logs"
  ON public.sync_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment to table
COMMENT ON TABLE public.sync_logs IS 'Tracks synchronization operations from external systems like Salesforce';

-- Add comments to columns
COMMENT ON COLUMN public.sync_logs.sync_type IS 'Type of sync: full (all records), incremental (modified only), or manual (user-triggered)';
COMMENT ON COLUMN public.sync_logs.sync_status IS 'Current status of the sync operation';
COMMENT ON COLUMN public.sync_logs.records_processed IS 'Total number of records processed during sync';
COMMENT ON COLUMN public.sync_logs.records_created IS 'Number of new records created';
COMMENT ON COLUMN public.sync_logs.records_updated IS 'Number of existing records updated';
COMMENT ON COLUMN public.sync_logs.records_failed IS 'Number of records that failed to process';
COMMENT ON COLUMN public.sync_logs.duration_ms IS 'Total duration of sync operation in milliseconds';
COMMENT ON COLUMN public.sync_logs.metadata IS 'Additional sync metadata (e.g., contacts_synced, leads_synced counts)';

-- Create a function to automatically calculate duration when sync completes
CREATE OR REPLACE FUNCTION calculate_sync_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- If completed_at is being set and started_at exists, calculate duration
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate duration
CREATE TRIGGER auto_calculate_sync_duration
  BEFORE UPDATE ON public.sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sync_duration();

-- Create a view for recent sync activity with formatted data
CREATE OR REPLACE VIEW public.sync_logs_summary AS
SELECT
  sl.id,
  sl.integration_id,
  i.name as integration_name,
  sl.business_id,
  b.name as business_name,
  sl.sync_type,
  sl.sync_status,
  sl.records_processed,
  sl.records_created,
  sl.records_updated,
  sl.records_failed,
  sl.started_at,
  sl.completed_at,
  sl.duration_ms,
  CASE
    WHEN sl.duration_ms IS NOT NULL THEN
      CONCAT(
        FLOOR(sl.duration_ms / 1000)::TEXT,
        '.',
        LPAD((sl.duration_ms % 1000)::TEXT, 3, '0'),
        's'
      )
    ELSE NULL
  END as duration_formatted,
  sl.error_message,
  sl.metadata,
  sl.created_at
FROM public.sync_logs sl
LEFT JOIN public.integrations i ON sl.integration_id = i.id
LEFT JOIN public.businesses b ON sl.business_id = b.id
ORDER BY sl.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON public.sync_logs_summary TO authenticated;
GRANT SELECT ON public.sync_logs_summary TO service_role;

-- Note: Views inherit RLS from underlying tables, so sync_logs_summary
-- will automatically respect the sync_logs RLS policies

-- Add helper function to get latest sync status for an integration
CREATE OR REPLACE FUNCTION get_latest_sync_status(p_integration_id UUID)
RETURNS TABLE (
  sync_status VARCHAR(50),
  last_sync_at TIMESTAMPTZ,
  records_processed INTEGER,
  records_created INTEGER,
  records_updated INTEGER,
  records_failed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.sync_status,
    sl.completed_at as last_sync_at,
    sl.records_processed,
    sl.records_created,
    sl.records_updated,
    sl.records_failed
  FROM public.sync_logs sl
  WHERE sl.integration_id = p_integration_id
    AND sl.sync_status != 'running'
  ORDER BY sl.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_latest_sync_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_sync_status(UUID) TO service_role;