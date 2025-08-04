/*
 * -------------------------------------------------------
 * Campaign Orchestrator Schema Migration
 * This migration creates the necessary tables for the hybrid ElevenLabs + Twilio architecture
 * supporting call logging, audio generation tracking, campaign execution, and webhook handling.
 * -------------------------------------------------------
 */

/*
 * -------------------------------------------------------
 * Section: Call Logs & Tracking
 * Detailed call tracking for Twilio integration
 * -------------------------------------------------------
 */

-- Call status enum (extends conversation_status for more granular tracking)
create type public.call_status as enum (
    'queued',
    'initiated', 
    'ringing',
    'answered',
    'in_progress',
    'completed',
    'failed',
    'busy',
    'no_answer',
    'voicemail',
    'cancelled'
);

-- Call outcome enum for tracking results
create type public.call_outcome as enum (
    'donated',
    'pledged',
    'interested',
    'not_interested',
    'callback_requested',
    'voicemail_left',
    'wrong_number',
    'do_not_call',
    'unknown'
);

-- Call logs table for detailed Twilio call tracking
create table if not exists public.call_logs (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    agent_id uuid not null references public.agents(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    conversation_id uuid references public.conversations(id) on delete set null,
    
    -- Twilio specific fields
    call_sid varchar(255) unique,
    parent_call_sid varchar(255), -- For call transfers
    from_number varchar(20) not null,
    to_number varchar(20) not null,
    
    -- Call tracking
    status public.call_status not null default 'queued',
    outcome public.call_outcome,
    direction varchar(20) not null default 'outbound',
    
    -- Timing
    queued_at timestamp with time zone default now(),
    initiated_at timestamp with time zone,
    answered_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_seconds integer,
    ring_duration_seconds integer,
    
    -- Audio & Recording
    audio_url text, -- Generated ElevenLabs audio
    recording_url text, -- Twilio call recording
    recording_duration_seconds integer,
    
    -- Call Quality & Analytics
    machine_detection_result varchar(50), -- human, answering_machine, fax, etc.
    sentiment_score decimal(3,2), -- -1.0 to 1.0
    quality_score integer, -- 1-5 rating
    
    -- Financial
    call_cost decimal(6,4), -- Cost in USD
    pledged_amount decimal(10,2),
    donated_amount decimal(10,2),
    
    -- Metadata
    error_code varchar(20),
    error_message text,
    metadata jsonb default '{}'::jsonb,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    
    primary key (id)
);

-- Indexes for performance
create index if not exists idx_call_logs_campaign_id on public.call_logs(campaign_id);
create index if not exists idx_call_logs_call_sid on public.call_logs(call_sid);
create index if not exists idx_call_logs_lead_id on public.call_logs(lead_id);
create index if not exists idx_call_logs_status on public.call_logs(status);
create index if not exists idx_call_logs_queued_at on public.call_logs(queued_at);
create index if not exists idx_call_logs_campaign_status on public.call_logs(campaign_id, status);

-- Comments
comment on table public.call_logs is 'Detailed call tracking for Twilio integration';
comment on column public.call_logs.call_sid is 'Unique Twilio call identifier';
comment on column public.call_logs.machine_detection_result is 'Result of Twilio machine detection';
comment on column public.call_logs.sentiment_score is 'AI sentiment analysis score (-1.0 to 1.0)';

/*
 * -------------------------------------------------------
 * Section: Audio Generation Tracking
 * Track ElevenLabs voice generations and caching
 * -------------------------------------------------------
 */

-- Audio generation status enum
create type public.audio_generation_status as enum (
    'pending',
    'generating',
    'completed',
    'failed',
    'cached'
);

-- Audio generations table
create table if not exists public.audio_generations (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid references public.campaigns(id) on delete cascade,
    agent_id uuid references public.agents(id) on delete cascade,
    lead_id uuid references public.leads(id) on delete cascade,
    
    -- Content
    text_content text not null,
    voice_id varchar(255) not null,
    voice_settings jsonb default '{}'::jsonb,
    
    -- Generation tracking
    status public.audio_generation_status not null default 'pending',
    audio_url text,
    file_size_bytes bigint,
    duration_seconds decimal(8,2),
    
    -- ElevenLabs specifics
    elevenlabs_request_id varchar(255),
    elevenlabs_voice_name varchar(255),
    model_id varchar(100) default 'eleven_multilingual_v2',
    
    -- Performance & Cost
    generation_time_ms integer,
    cost_cents integer, -- Cost in cents
    cache_hit boolean default false,
    cache_key varchar(255),
    
    -- Error handling
    error_code varchar(50),
    error_message text,
    retry_count integer default 0,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_audio_generations_campaign_id on public.audio_generations(campaign_id);
create index if not exists idx_audio_generations_cache_key on public.audio_generations(cache_key);
create index if not exists idx_audio_generations_status on public.audio_generations(status);
create index if not exists idx_audio_generations_created_at on public.audio_generations(created_at);

-- Comments
comment on table public.audio_generations is 'Track ElevenLabs voice generations and caching';
comment on column public.audio_generations.cache_key is 'Key for caching identical text+voice combinations';
comment on column public.audio_generations.cache_hit is 'Whether this generation used cached audio';

/*
 * -------------------------------------------------------
 * Section: Campaign Execution Tracking
 * Track campaign execution state and progress
 * -------------------------------------------------------
 */

-- Campaign execution status enum
create type public.campaign_execution_status as enum (
    'pending',
    'initializing',
    'running',
    'paused',
    'pausing',
    'resuming',
    'completing',
    'completed',
    'cancelled',
    'failed'
);

-- Campaign executions table
create table if not exists public.campaign_executions (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    
    -- Execution tracking
    status public.campaign_execution_status not null default 'pending',
    execution_node varchar(255), -- Which server/container is running this
    process_id varchar(255), -- Process/container ID
    
    -- Progress tracking
    total_leads integer not null default 0,
    leads_processed integer not null default 0,
    leads_queued integer not null default 0,
    calls_made integer not null default 0,
    calls_successful integer not null default 0,
    calls_failed integer not null default 0,
    
    -- Timing
    started_at timestamp with time zone,
    paused_at timestamp with time zone,
    resumed_at timestamp with time zone,
    completed_at timestamp with time zone,
    estimated_completion_at timestamp with time zone,
    
    -- Resource usage
    calls_today integer not null default 0,
    calls_this_hour integer not null default 0,
    audio_generations_today integer not null default 0,
    
    -- Performance metrics
    average_call_duration_seconds decimal(8,2),
    success_rate_percentage decimal(5,2),
    current_throughput_calls_per_hour decimal(8,2),
    
    -- Configuration snapshot (in case campaign config changes during execution)
    config_snapshot jsonb not null default '{}'::jsonb,
    
    -- Error tracking
    last_error text,
    error_count integer not null default 0,
    retry_count integer not null default 0,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_campaign_executions_campaign_id on public.campaign_executions(campaign_id);
create index if not exists idx_campaign_executions_status on public.campaign_executions(status);
create index if not exists idx_campaign_executions_execution_node on public.campaign_executions(execution_node);
create index if not exists idx_campaign_executions_started_at on public.campaign_executions(started_at);

-- Comments
comment on table public.campaign_executions is 'Track campaign execution state and progress';
comment on column public.campaign_executions.execution_node is 'Server/container running this campaign';
comment on column public.campaign_executions.config_snapshot is 'Campaign configuration at execution time';

/*
 * -------------------------------------------------------
 * Section: Call Attempts & Retry Logic
 * Track individual call attempts and retry scheduling
 * -------------------------------------------------------
 */

-- Call attempt result enum
create type public.call_attempt_result as enum (
    'success',
    'no_answer',
    'busy',
    'failed',
    'invalid_number',
    'blocked',
    'rate_limited',
    'error'
);

-- Call attempts table
create table if not exists public.call_attempts (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    call_log_id uuid references public.call_logs(id) on delete set null,
    
    -- Attempt tracking
    attempt_number integer not null,
    result public.call_attempt_result,
    
    -- Scheduling
    scheduled_at timestamp with time zone not null,
    attempted_at timestamp with time zone,
    next_attempt_at timestamp with time zone,
    
    -- Context
    retry_reason varchar(255),
    retry_delay_minutes integer,
    phone_number varchar(20) not null,
    
    -- Audio generation for this attempt
    audio_generation_id uuid references public.audio_generations(id) on delete set null,
    
    -- Error details
    error_code varchar(50),
    error_message text,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_call_attempts_campaign_id on public.call_attempts(campaign_id);
create index if not exists idx_call_attempts_lead_id on public.call_attempts(lead_id);
create index if not exists idx_call_attempts_scheduled_at on public.call_attempts(scheduled_at);
create index if not exists idx_call_attempts_next_attempt_at on public.call_attempts(next_attempt_at);
create index if not exists idx_call_attempts_campaign_scheduled on public.call_attempts(campaign_id, scheduled_at);

-- Comments
comment on table public.call_attempts is 'Track individual call attempts and retry scheduling';
comment on column public.call_attempts.attempt_number is 'Sequential attempt number for this lead';
comment on column public.call_attempts.next_attempt_at is 'When the next retry should be attempted';

/*
 * -------------------------------------------------------
 * Section: Webhook Events
 * Log all Twilio webhook events for debugging and analytics
 * -------------------------------------------------------
 */

-- Webhook event type enum
create type public.webhook_event_type as enum (
    'call_initiated',
    'call_ringing', 
    'call_answered',
    'call_completed',
    'call_failed',
    'call_busy',
    'call_no_answer',
    'gather_speech',
    'gather_dtmf',
    'recording_completed',
    'machine_detection'
);

-- Webhook events table
create table if not exists public.webhook_events (
    id uuid unique not null default gen_random_uuid(),
    
    -- Event identification
    event_type public.webhook_event_type not null,
    call_sid varchar(255),
    account_sid varchar(255),
    
    -- Related entities
    campaign_id uuid references public.campaigns(id) on delete set null,
    call_log_id uuid references public.call_logs(id) on delete set null,
    
    -- Event data
    event_data jsonb not null default '{}'::jsonb,
    raw_payload jsonb not null default '{}'::jsonb,
    
    -- Processing
    processed boolean not null default false,
    processed_at timestamp with time zone,
    processing_error text,
    
    -- Request metadata
    source_ip varchar(45),
    user_agent text,
    twilio_signature varchar(255),
    signature_valid boolean,
    
    -- Audit fields
    received_at timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_webhook_events_call_sid on public.webhook_events(call_sid);
create index if not exists idx_webhook_events_event_type on public.webhook_events(event_type);
create index if not exists idx_webhook_events_processed on public.webhook_events(processed);
create index if not exists idx_webhook_events_received_at on public.webhook_events(received_at);
create index if not exists idx_webhook_events_campaign_id on public.webhook_events(campaign_id);

-- Comments
comment on table public.webhook_events is 'Log all Twilio webhook events for debugging and analytics';
comment on column public.webhook_events.signature_valid is 'Whether the Twilio signature was validated';
comment on column public.webhook_events.raw_payload is 'Complete webhook payload for debugging';

/*
 * -------------------------------------------------------
 * Section: Campaign Queue Management
 * Track calls waiting to be processed
 * -------------------------------------------------------
 */

-- Queue status enum
create type public.queue_status as enum (
    'pending',
    'scheduled',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'rate_limited'
);

-- Campaign queue table
create table if not exists public.campaign_queue (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    
    -- Queue management
    status public.queue_status not null default 'pending',
    priority integer not null default 100, -- Lower number = higher priority
    
    -- Scheduling
    scheduled_for timestamp with time zone not null,
    processing_started_at timestamp with time zone,
    processing_node varchar(255), -- Which server is processing
    
    -- Attempt context
    attempt_number integer not null default 1,
    retry_reason varchar(255),
    
    -- Dependencies
    requires_audio_generation boolean not null default true,
    audio_generation_id uuid references public.audio_generations(id) on delete set null,
    
    -- Rate limiting
    calls_made_today integer not null default 0,
    last_call_at timestamp with time zone,
    
    -- Error tracking
    error_count integer not null default 0,
    last_error text,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes for queue processing
create index if not exists idx_campaign_queue_scheduled_for on public.campaign_queue(scheduled_for);
create index if not exists idx_campaign_queue_status_priority on public.campaign_queue(status, priority, scheduled_for);
create index if not exists idx_campaign_queue_campaign_status on public.campaign_queue(campaign_id, status);
create index if not exists idx_campaign_queue_processing_node on public.campaign_queue(processing_node);

-- Partial unique constraint to prevent duplicate active queue items for same campaign-lead
create unique index if not exists idx_campaign_queue_unique_active_lead 
    on public.campaign_queue(campaign_id, lead_id) 
    where status in ('pending', 'scheduled', 'processing');

-- Comments
comment on table public.campaign_queue is 'Track calls waiting to be processed by campaign orchestrator';
comment on column public.campaign_queue.priority is 'Queue priority (lower number = higher priority)';
comment on column public.campaign_queue.processing_node is 'Server/container processing this queue item';

/*
 * -------------------------------------------------------
 * Section: Conversation Events
 * Track individual events within conversations (gather, response, etc.)
 * -------------------------------------------------------
 */

-- Conversation event type enum
create type public.conversation_event_type as enum (
    'call_started',
    'intro_played',
    'gather_started',
    'speech_detected',
    'dtmf_received',
    'response_processed',
    'follow_up_question',
    'objection_handled',
    'commitment_requested',
    'call_ended',
    'transfer_requested',
    'callback_scheduled'
);

-- Conversation events table
create table if not exists public.conversation_events (
    id uuid unique not null default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    call_log_id uuid references public.call_logs(id) on delete set null,
    
    -- Event details
    event_type public.conversation_event_type not null,
    sequence_number integer not null,
    
    -- Content
    agent_text text, -- What the agent said
    user_response text, -- What the user said/input
    confidence_score decimal(3,2), -- Speech recognition confidence
    
    -- Audio
    audio_url text, -- Audio played for this event
    audio_duration_seconds decimal(6,2),
    
    -- Processing
    processing_time_ms integer,
    ai_model_used varchar(100),
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timing
    started_at timestamp with time zone default now(),
    completed_at timestamp with time zone,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_conversation_events_conversation_id on public.conversation_events(conversation_id);
create index if not exists idx_conversation_events_sequence on public.conversation_events(conversation_id, sequence_number);
create index if not exists idx_conversation_events_event_type on public.conversation_events(event_type);
create index if not exists idx_conversation_events_started_at on public.conversation_events(started_at);

-- Comments
comment on table public.conversation_events is 'Track individual events within AI agent conversations';
comment on column public.conversation_events.sequence_number is 'Order of events within the conversation';
comment on column public.conversation_events.confidence_score is 'Speech recognition confidence (0.0 to 1.0)';

/*
 * -------------------------------------------------------
 * Section: Real-time Status Updates
 * Track real-time dashboard updates and WebSocket connections
 * -------------------------------------------------------
 */

-- Status update type enum
create type public.status_update_type as enum (
    'campaign_started',
    'campaign_paused',
    'campaign_resumed', 
    'campaign_completed',
    'call_initiated',
    'call_answered',
    'call_completed',
    'call_failed',
    'lead_converted',
    'error_occurred',
    'queue_updated',
    'stats_updated'
);

-- Real-time status updates table
create table if not exists public.status_updates (
    id uuid unique not null default gen_random_uuid(),
    
    -- Update details
    update_type public.status_update_type not null,
    campaign_id uuid references public.campaigns(id) on delete cascade,
    account_id uuid not null references public.accounts(id) on delete cascade,
    
    -- Content
    title varchar(255) not null,
    message text,
    data jsonb default '{}'::jsonb,
    
    -- Delivery tracking
    websocket_sent boolean not null default false,
    websocket_sent_at timestamp with time zone,
    email_sent boolean not null default false,
    email_sent_at timestamp with time zone,
    
    -- Priority and expiry
    priority integer not null default 100, -- Lower = higher priority
    expires_at timestamp with time zone,
    
    -- Audit fields
    created_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_status_updates_account_id on public.status_updates(account_id);
create index if not exists idx_status_updates_campaign_id on public.status_updates(campaign_id);
create index if not exists idx_status_updates_update_type on public.status_updates(update_type);
create index if not exists idx_status_updates_websocket_sent on public.status_updates(websocket_sent);
create index if not exists idx_status_updates_created_at on public.status_updates(created_at);

-- Comments
comment on table public.status_updates is 'Track real-time dashboard updates and notifications';
comment on column public.status_updates.data is 'Additional data payload for the update';
comment on column public.status_updates.expires_at is 'When this update should be removed from active feeds';

/*
 * -------------------------------------------------------
 * Section: System Performance Metrics
 * Track system performance and health metrics
 * -------------------------------------------------------
 */

-- Performance metrics table
create table if not exists public.performance_metrics (
    id uuid unique not null default gen_random_uuid(),
    
    -- Metric identification
    metric_name varchar(100) not null,
    metric_type varchar(50) not null, -- counter, gauge, histogram
    
    -- Values
    value decimal(15,6) not null,
    unit varchar(20), -- seconds, milliseconds, percentage, count, etc.
    
    -- Context
    campaign_id uuid references public.campaigns(id) on delete cascade,
    service_name varchar(100), -- orchestrator, edge-function, api
    node_id varchar(255), -- server/container identifier
    
    -- Tags for grouping/filtering
    tags jsonb default '{}'::jsonb,
    
    -- Timing
    recorded_at timestamp with time zone default now(),
    
    primary key (id)
);

-- Indexes
create index if not exists idx_performance_metrics_name_recorded on public.performance_metrics(metric_name, recorded_at);
create index if not exists idx_performance_metrics_campaign_id on public.performance_metrics(campaign_id);
create index if not exists idx_performance_metrics_service_name on public.performance_metrics(service_name);
create index if not exists idx_performance_metrics_recorded_at on public.performance_metrics(recorded_at);

-- Comments
comment on table public.performance_metrics is 'System performance and health metrics';
comment on column public.performance_metrics.tags is 'Additional metadata tags for filtering and grouping';

/*
 * -------------------------------------------------------
 * Section: Row Level Security (RLS) Policies
 * Secure access to all new tables
 * -------------------------------------------------------
 */

-- Check if required tables exist before creating policies
do $$ 
begin
    if not exists (select 1 from information_schema.tables where table_name = 'accounts' and table_schema = 'public') then
        raise exception 'accounts table does not exist. Please run the base schema migration first.';
    end if;
    
    if not exists (select 1 from information_schema.tables where table_name = 'campaigns' and table_schema = 'public') then
        raise exception 'campaigns table does not exist. Please run the campaigns migration first.';
    end if;
    
    -- Check if campaigns table has business_id column
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'campaigns' 
        and table_schema = 'public' 
        and column_name = 'business_id'
    ) then
        raise exception 'campaigns table does not have business_id column. Schema may be outdated.';
    end if;
    
    -- Check if businesses table has account_id column
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'businesses' 
        and table_schema = 'public' 
        and column_name = 'account_id'
    ) then
        raise exception 'businesses table does not have account_id column. Schema may be outdated.';
    end if;
end $$;

-- Enable RLS on all new tables
alter table public.call_logs enable row level security;
alter table public.audio_generations enable row level security;
alter table public.campaign_executions enable row level security;
alter table public.call_attempts enable row level security;
alter table public.webhook_events enable row level security;
alter table public.campaign_queue enable row level security;
alter table public.conversation_events enable row level security;
alter table public.status_updates enable row level security;
alter table public.performance_metrics enable row level security;

-- Call logs policies
create policy call_logs_read on public.call_logs
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        )
    );

create policy call_logs_insert on public.call_logs
    for insert to authenticated, service_role
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        ) or auth.role() = 'service_role'
    );

create policy call_logs_update on public.call_logs
    for update to authenticated, service_role
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        ) or auth.role() = 'service_role'
    );

-- Audio generations policies
create policy audio_generations_read on public.audio_generations
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        ) or campaign_id is null
    );

create policy audio_generations_insert on public.audio_generations
    for insert to authenticated, service_role
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        ) or auth.role() = 'service_role' or campaign_id is null
    );

-- Campaign executions policies  
create policy campaign_executions_read on public.campaign_executions
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        )
    );

create policy campaign_executions_all on public.campaign_executions
    for all to service_role;

-- Call attempts policies
create policy call_attempts_read on public.call_attempts
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        )
    );

create policy call_attempts_all on public.call_attempts
    for all to service_role;

-- Campaign queue policies
create policy campaign_queue_read on public.campaign_queue
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.businesses b on c.business_id = b.id
            where b.account_id = auth.uid()
        )
    );

create policy campaign_queue_all on public.campaign_queue
    for all to service_role;

-- Webhook events policies (service_role only for security)
create policy webhook_events_all on public.webhook_events
    for all to service_role;

-- Conversation events policies
create policy conversation_events_read on public.conversation_events
    for select to authenticated
    using (
        conversation_id in (
            select c.id from public.conversations c 
            join public.campaigns camp on c.campaign_id = camp.id
            join public.businesses b on camp.business_id = b.id
            where b.account_id = auth.uid()
        )
    );

create policy conversation_events_all on public.conversation_events
    for all to service_role;

-- Status updates policies  
create policy status_updates_read on public.status_updates
    for select to authenticated
    using (account_id = auth.uid());

create policy status_updates_all on public.status_updates
    for all to service_role;

-- Performance metrics policies (service_role only)
create policy performance_metrics_all on public.performance_metrics
    for all to service_role;

/*
 * -------------------------------------------------------
 * Section: Grants & Permissions
 * Grant appropriate permissions to roles
 * -------------------------------------------------------
 */

-- Grant permissions to authenticated users
grant select, insert, update on public.call_logs to authenticated;
grant select, insert, update on public.audio_generations to authenticated;
grant select on public.campaign_executions to authenticated;
grant select on public.call_attempts to authenticated;
grant select on public.campaign_queue to authenticated;
grant select on public.conversation_events to authenticated;
grant select on public.status_updates to authenticated;

-- Grant full permissions to service_role (for Campaign Orchestrator)
grant all on public.call_logs to service_role;
grant all on public.audio_generations to service_role;
grant all on public.campaign_executions to service_role;
grant all on public.call_attempts to service_role;
grant all on public.campaign_queue to service_role;
grant all on public.webhook_events to service_role;
grant all on public.conversation_events to service_role;
grant all on public.status_updates to service_role;
grant all on public.performance_metrics to service_role;

/*
 * -------------------------------------------------------
 * Section: Utility Functions
 * Helper functions for campaign orchestration
 * -------------------------------------------------------
 */

-- Function to get next queued call for a campaign
create or replace function public.get_next_queued_call(p_campaign_id uuid)
returns table (
    queue_id uuid,
    lead_id uuid,
    phone_number varchar(20),
    attempt_number integer,
    scheduled_for timestamp with time zone
)
language sql
security definer
as $$
    select 
        cq.id as queue_id,
        cq.lead_id,
        l.phone as phone_number,
        cq.attempt_number,
        cq.scheduled_for
    from public.campaign_queue cq
    join public.leads l on cq.lead_id = l.id
    where cq.campaign_id = p_campaign_id
        and cq.status = 'scheduled'
        and cq.scheduled_for <= now()
    order by cq.priority asc, cq.scheduled_for asc
    limit 1;
$$;

-- Function to update campaign execution stats
create or replace function public.update_campaign_execution_stats(p_campaign_id uuid)
returns void
language plpgsql
security definer
as $$
declare
    v_execution_id uuid;
    v_total_leads integer;
    v_calls_made integer;
    v_calls_successful integer;
    v_calls_failed integer;
begin
    -- Get current execution
    select id into v_execution_id
    from public.campaign_executions
    where campaign_id = p_campaign_id
        and status in ('running', 'paused')
    limit 1;
    
    if v_execution_id is null then
        return;
    end if;
    
    -- Calculate stats
    select count(*) into v_total_leads
    from public.leads
    where campaign_id = p_campaign_id;
    
    select 
        count(*) filter (where status in ('completed', 'failed')) as calls_made,
        count(*) filter (where status = 'completed' and outcome in ('donated', 'pledged')) as calls_successful,
        count(*) filter (where status = 'failed') as calls_failed
    into v_calls_made, v_calls_successful, v_calls_failed
    from public.call_logs
    where campaign_id = p_campaign_id;
    
    -- Update execution record
    update public.campaign_executions
    set 
        total_leads = v_total_leads,
        calls_made = v_calls_made,
        calls_successful = v_calls_successful,
        calls_failed = v_calls_failed,
        success_rate_percentage = case 
            when v_calls_made > 0 then (v_calls_successful::decimal / v_calls_made) * 100
            else 0
        end,
        updated_at = now()
    where id = v_execution_id;
end;
$$;

-- Function to check if campaign can make calls (respects daily caps and calling hours)
create or replace function public.can_campaign_make_calls(p_campaign_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
    v_campaign record;
    v_calls_today integer;
    v_current_hour integer;
    v_calling_start integer;
    v_calling_end integer;
begin
    -- Get campaign details
    select * into v_campaign
    from public.campaigns
    where id = p_campaign_id;
    
    if not found then
        return false;
    end if;
    
    -- Check if campaign is active
    if v_campaign.status != 'active' then
        return false;
    end if;
    
    -- Check daily call cap
    select count(*) into v_calls_today
    from public.call_logs
    where campaign_id = p_campaign_id
        and date(created_at) = current_date;
        
    if v_calls_today >= coalesce(v_campaign.daily_call_cap, 100) then
        return false;
    end if;
    
    -- Check calling hours (simplified - assumes format like "9:00 AM - 5:00 PM")
    v_current_hour := extract(hour from now());
    
    -- Simple parsing of calling hours (this could be enhanced)
    if v_campaign.calling_hours ~ '^([0-9]+):00 AM - ([0-9]+):00 PM$' then
        v_calling_start := substring(v_campaign.calling_hours from '^([0-9]+):00 AM')::integer;
        v_calling_end := substring(v_campaign.calling_hours from '- ([0-9]+):00 PM$')::integer + 12;
        
        if v_current_hour < v_calling_start or v_current_hour >= v_calling_end then
            return false;
        end if;
    end if;
    
    return true;
end;
$$;

/*
 * -------------------------------------------------------
 * Section: Triggers
 * Automatic updates and data consistency
 * -------------------------------------------------------
 */

-- Trigger to update campaign execution stats when call logs change
create or replace function trigger_update_campaign_stats()
returns trigger
language plpgsql
as $$
begin
    -- Update stats for the affected campaign
    perform public.update_campaign_execution_stats(
        case when TG_OP = 'DELETE' then OLD.campaign_id else NEW.campaign_id end
    );
    
    return case when TG_OP = 'DELETE' then OLD else NEW end;
end;
$$;

create trigger trigger_call_logs_stats_update
    after insert or update or delete on public.call_logs
    for each row
    execute function trigger_update_campaign_stats();

-- Trigger to auto-update timestamps
create or replace function trigger_update_timestamp()
returns trigger
language plpgsql
as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$;

-- Add update timestamp triggers
create trigger trigger_call_logs_timestamp
    before update on public.call_logs
    for each row
    execute function trigger_update_timestamp();

create trigger trigger_audio_generations_timestamp
    before update on public.audio_generations
    for each row
    execute function trigger_update_timestamp();

create trigger trigger_campaign_executions_timestamp
    before update on public.campaign_executions
    for each row
    execute function trigger_update_timestamp();

create trigger trigger_campaign_queue_timestamp
    before update on public.campaign_queue
    for each row
    execute function trigger_update_timestamp();

/*
 * -------------------------------------------------------
 * Section: Views for Analytics
 * Useful views for reporting and dashboard
 * -------------------------------------------------------
 */

-- Campaign performance view
create or replace view public.campaign_performance as
select 
    c.id as campaign_id,
    c.name as campaign_name,
    c.status as campaign_status,
    c.daily_call_cap,
    ce.status as execution_status,
    ce.total_leads,
    ce.calls_made,
    ce.calls_successful,
    ce.calls_failed,
    ce.success_rate_percentage,
    ce.average_call_duration_seconds,
    ce.calls_today,
    count(cl.*) as total_call_logs,
    count(cl.*) filter (where cl.status = 'completed') as completed_calls,
    count(cl.*) filter (where cl.outcome in ('donated', 'pledged')) as conversion_calls,
    sum(cl.pledged_amount) as total_pledged,
    sum(cl.donated_amount) as total_donated,
    sum(cl.call_cost) as total_call_cost,
    avg(cl.sentiment_score) as average_sentiment,
    ce.started_at,
    ce.completed_at
from public.campaigns c
join public.businesses b on c.business_id = b.id
left join public.campaign_executions ce on c.id = ce.campaign_id
left join public.call_logs cl on c.id = cl.campaign_id
where b.account_id = auth.uid()
group by c.id, c.name, c.status, c.daily_call_cap, ce.status, ce.total_leads, 
         ce.calls_made, ce.calls_successful, ce.calls_failed, ce.success_rate_percentage,
         ce.average_call_duration_seconds, ce.calls_today, ce.started_at, ce.completed_at;

-- Daily call volume view
create or replace view public.daily_call_volume as
select 
    c.id as campaign_id,
    c.name as campaign_name,
    date(cl.created_at) as call_date,
    count(*) as total_calls,
    count(*) filter (where cl.status = 'completed') as completed_calls,
    count(*) filter (where cl.outcome in ('donated', 'pledged')) as successful_calls,
    sum(cl.duration_seconds) as total_duration_seconds,
    avg(cl.duration_seconds) as average_duration_seconds,
    sum(cl.call_cost) as total_cost,
    avg(cl.sentiment_score) as average_sentiment
from public.campaigns c
join public.businesses b on c.business_id = b.id
join public.call_logs cl on c.id = cl.campaign_id
where b.account_id = auth.uid()
group by c.id, c.name, date(cl.created_at)
order by call_date desc;

-- Grant permissions on views
grant select on public.campaign_performance to authenticated;
grant select on public.daily_call_volume to authenticated;

/*
 * -------------------------------------------------------
 * Migration Complete
 * -------------------------------------------------------
 */