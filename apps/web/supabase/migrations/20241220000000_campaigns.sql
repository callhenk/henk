/*
 * -------------------------------------------------------
 * Henk AI Campaigns Schema
 * This migration creates the necessary tables for campaigns, agents, leads, and conversations.
 * It includes the schema for AI voice fundraising campaigns and related entities.
 * -------------------------------------------------------
 */

/*
 * -------------------------------------------------------
 * Section: Agents (Created First - Referenced by Campaigns and Workflows)
 * AI voice agents that handle calls for campaigns
 * -------------------------------------------------------
 */

-- Agent status enum
create type public.agent_status as enum (
    'active',
    'inactive',
    'agent_paused',
    'training'
);

-- Voice type enum
create type public.voice_type as enum (
    'elevenlabs',
    'custom'
);

-- Agents table
create table if not exists public.agents (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    status public.agent_status not null default 'active',
    account_id uuid not null references public.accounts(id) on delete cascade,
    voice_type public.voice_type not null default 'elevenlabs',
    voice_id varchar(255),
    speaking_tone varchar(100) not null default 'Professional',
    organization_info text,
    donor_context text,
    faqs jsonb default '[]'::jsonb,
    knowledge_base jsonb default '{}'::jsonb,
    workflow_config jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.agents is 'AI voice agents for fundraising calls';
comment on column public.agents.name is 'The name of the agent';
comment on column public.agents.description is 'The description of the agent';
comment on column public.agents.status is 'The current status of the agent';
comment on column public.agents.account_id is 'The account that owns this agent';
comment on column public.agents.voice_type is 'The type of voice (elevenlabs or custom)';
comment on column public.agents.voice_id is 'The voice ID from the voice provider';
comment on column public.agents.speaking_tone is 'The speaking tone of the agent';
comment on column public.agents.organization_info is 'Information about the organization';
comment on column public.agents.donor_context is 'Context about donors and fundraising';
comment on column public.agents.faqs is 'Frequently asked questions for the agent';
comment on column public.agents.knowledge_base is 'Knowledge base configuration';
comment on column public.agents.workflow_config is 'Workflow configuration for the agent';

-- Enable RLS on agents table
alter table public.agents enable row level security;

-- Agents RLS policies
create policy agents_read on public.agents
    for select to authenticated
    using (account_id = auth.uid());

create policy agents_insert on public.agents
    for insert to authenticated
    with check (account_id = auth.uid());

create policy agents_update on public.agents
    for update to authenticated
    using (account_id = auth.uid())
    with check (account_id = auth.uid());

create policy agents_delete on public.agents
    for delete to authenticated
    using (account_id = auth.uid());

-- Grant permissions
grant select, insert, update, delete on public.agents to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Campaigns
 * Campaigns are the main fundraising initiatives that use AI agents to contact leads
 * -------------------------------------------------------
 */

-- Campaign status enum
create type public.campaign_status as enum (
    'draft',
    'active',
    'paused',
    'completed',
    'cancelled'
);

-- Campaigns table
create table if not exists public.campaigns (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    status public.campaign_status not null default 'draft',
    account_id uuid not null references public.accounts(id) on delete cascade,
    agent_id uuid references public.agents(id) on delete set null,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    calling_hours varchar(100) not null default '9:00 AM - 5:00 PM',
    max_attempts integer not null default 3,
    daily_call_cap integer not null default 100,
    script text not null,
    retry_logic text not null default 'Wait 24 hours before retry',
    budget decimal(10,2),
    target_amount decimal(10,2),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.campaigns is 'AI voice fundraising campaigns';
comment on column public.campaigns.name is 'The name of the campaign';
comment on column public.campaigns.description is 'The description of the campaign';
comment on column public.campaigns.status is 'The current status of the campaign';
comment on column public.campaigns.account_id is 'The account that owns this campaign';
comment on column public.campaigns.agent_id is 'The AI agent assigned to this campaign';
comment on column public.campaigns.start_date is 'When the campaign starts';
comment on column public.campaigns.end_date is 'When the campaign ends';
comment on column public.campaigns.calling_hours is 'The hours when calls can be made';
comment on column public.campaigns.max_attempts is 'Maximum number of call attempts per lead';
comment on column public.campaigns.daily_call_cap is 'Maximum number of calls per day';
comment on column public.campaigns.script is 'The script for the AI agent to follow';
comment on column public.campaigns.retry_logic is 'The retry logic for failed calls';
comment on column public.campaigns.budget is 'The campaign budget';
comment on column public.campaigns.target_amount is 'The target fundraising amount';

-- Enable RLS on campaigns table
alter table public.campaigns enable row level security;

-- Campaigns RLS policies
create policy campaigns_read on public.campaigns
    for select to authenticated
    using (account_id = auth.uid());

create policy campaigns_insert on public.campaigns
    for insert to authenticated
    with check (account_id = auth.uid());

create policy campaigns_update on public.campaigns
    for update to authenticated
    using (account_id = auth.uid())
    with check (account_id = auth.uid());

create policy campaigns_delete on public.campaigns
    for delete to authenticated
    using (account_id = auth.uid());

-- Grant permissions
grant select, insert, update, delete on public.campaigns to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Workflows
 * Visual workflow builder for agent call flows
 * -------------------------------------------------------
 */

-- Workflow status enum
create type public.workflow_status as enum (
    'draft',
    'active',
    'inactive',
    'archived'
);

-- Node type enum
create type public.node_type as enum (
    'start',
    'decision',
    'action',
    'end',
    'condition',
    'loop',
    'delay'
);

-- Action type enum
create type public.action_type as enum (
    'voicemail',
    'script',
    'question',
    'transfer',
    'hangup',
    'callback',
    'donation_request',
    'follow_up'
);

-- Workflows table
create table if not exists public.workflows (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    agent_id uuid not null references public.agents(id) on delete cascade,
    status public.workflow_status not null default 'draft',
    version integer not null default 1,
    is_default boolean not null default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.workflows is 'Visual workflow configurations for agents';
comment on column public.workflows.name is 'The name of the workflow';
comment on column public.workflows.description is 'The description of the workflow';
comment on column public.workflows.agent_id is 'The agent this workflow belongs to';
comment on column public.workflows.status is 'The current status of the workflow';
comment on column public.workflows.version is 'The version number of the workflow';
comment on column public.workflows.is_default is 'Whether this is the default workflow for the agent';

-- Workflow nodes table
create table if not exists public.workflow_nodes (
    id uuid unique not null default gen_random_uuid(),
    workflow_id uuid not null references public.workflows(id) on delete cascade,
    node_id varchar(255) not null, -- ReactFlow node ID
    type public.node_type not null,
    position_x integer not null,
    position_y integer not null,
    data jsonb not null default '{}'::jsonb, -- Node data (label, description, etc.)
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    primary key (id),
    unique(workflow_id, node_id)
);

comment on table public.workflow_nodes is 'Nodes in workflow diagrams';
comment on column public.workflow_nodes.workflow_id is 'The workflow this node belongs to';
comment on column public.workflow_nodes.node_id is 'The ReactFlow node ID';
comment on column public.workflow_nodes.type is 'The type of node';
comment on column public.workflow_nodes.position_x is 'X position of the node';
comment on column public.workflow_nodes.position_y is 'Y position of the node';
comment on column public.workflow_nodes.data is 'Node data (label, description, options, etc.)';

-- Workflow edges table
create table if not exists public.workflow_edges (
    id uuid unique not null default gen_random_uuid(),
    workflow_id uuid not null references public.workflows(id) on delete cascade,
    edge_id varchar(255) not null, -- ReactFlow edge ID
    source_node_id varchar(255) not null,
    target_node_id varchar(255) not null,
    source_handle varchar(255),
    target_handle varchar(255),
    label varchar(255),
    condition jsonb default '{}'::jsonb, -- Edge conditions
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    primary key (id),
    unique(workflow_id, edge_id)
);

comment on table public.workflow_edges is 'Edges/connections in workflow diagrams';
comment on column public.workflow_edges.workflow_id is 'The workflow this edge belongs to';
comment on column public.workflow_edges.edge_id is 'The ReactFlow edge ID';
comment on column public.workflow_edges.source_node_id is 'The source node ID';
comment on column public.workflow_edges.target_node_id is 'The target node ID';
comment on column public.workflow_edges.source_handle is 'The source handle ID';
comment on column public.workflow_edges.target_handle is 'The target handle ID';
comment on column public.workflow_edges.label is 'The edge label';
comment on column public.workflow_edges.condition is 'Edge conditions and logic';

-- Enable RLS on workflow tables
alter table public.workflows enable row level security;
alter table public.workflow_nodes enable row level security;
alter table public.workflow_edges enable row level security;

-- Workflows RLS policies
create policy workflows_read on public.workflows
    for select to authenticated
    using (
        agent_id in (
            select id from public.agents where account_id = auth.uid()
        )
    );

create policy workflows_insert on public.workflows
    for insert to authenticated
    with check (
        agent_id in (
            select id from public.agents where account_id = auth.uid()
        )
    );

create policy workflows_update on public.workflows
    for update to authenticated
    using (
        agent_id in (
            select id from public.agents where account_id = auth.uid()
        )
    )
    with check (
        agent_id in (
            select id from public.agents where account_id = auth.uid()
        )
    );

create policy workflows_delete on public.workflows
    for delete to authenticated
    using (
        agent_id in (
            select id from public.agents where account_id = auth.uid()
        )
    );

-- Workflow nodes RLS policies
create policy workflow_nodes_read on public.workflow_nodes
    for select to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_nodes_insert on public.workflow_nodes
    for insert to authenticated
    with check (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_nodes_update on public.workflow_nodes
    for update to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    )
    with check (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_nodes_delete on public.workflow_nodes
    for delete to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

-- Workflow edges RLS policies
create policy workflow_edges_read on public.workflow_edges
    for select to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_edges_insert on public.workflow_edges
    for insert to authenticated
    with check (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_edges_update on public.workflow_edges
    for update to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    )
    with check (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

create policy workflow_edges_delete on public.workflow_edges
    for delete to authenticated
    using (
        workflow_id in (
            select w.id from public.workflows w
            join public.agents a on w.agent_id = a.id
            where a.account_id = auth.uid()
        )
    );

-- Grant permissions for workflow tables
grant select, insert, update, delete on public.workflows to authenticated, service_role;
grant select, insert, update, delete on public.workflow_nodes to authenticated, service_role;
grant select, insert, update, delete on public.workflow_edges to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Leads
 * Potential donors/contacts for campaigns
 * -------------------------------------------------------
 */

-- Lead status enum
create type public.lead_status as enum (
    'new',
    'contacted',
    'interested',
    'pledged',
    'donated',
    'not_interested',
    'unreachable',
    'failed'
);

-- Leads table
create table if not exists public.leads (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    name varchar(255) not null,
    email varchar(320),
    phone varchar(20) not null,
    company varchar(255),
    status public.lead_status not null default 'new',
    notes text,
    last_contact_date timestamp with time zone,
    attempts integer not null default 0,
    pledged_amount decimal(10,2),
    donated_amount decimal(10,2),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.leads is 'Potential donors/contacts for campaigns';
comment on column public.leads.campaign_id is 'The campaign this lead belongs to';
comment on column public.leads.name is 'The name of the lead';
comment on column public.leads.email is 'The email of the lead';
comment on column public.leads.phone is 'The phone number of the lead';
comment on column public.leads.company is 'The company of the lead';
comment on column public.leads.status is 'The current status of the lead';
comment on column public.leads.notes is 'Notes about the lead';
comment on column public.leads.last_contact_date is 'When the lead was last contacted';
comment on column public.leads.attempts is 'Number of contact attempts made';
comment on column public.leads.pledged_amount is 'Amount pledged by the lead';
comment on column public.leads.donated_amount is 'Amount donated by the lead';

-- Enable RLS on leads table
alter table public.leads enable row level security;

-- Leads RLS policies
create policy leads_read on public.leads
    for select to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy leads_insert on public.leads
    for insert to authenticated
    with check (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy leads_update on public.leads
    for update to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    )
    with check (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy leads_delete on public.leads
    for delete to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

-- Grant permissions
grant select, insert, update, delete on public.leads to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Conversations
 * Records of AI agent conversations with leads
 * -------------------------------------------------------
 */

-- Conversation status enum
create type public.conversation_status as enum (
    'initiated',
    'in_progress',
    'completed',
    'failed',
    'no_answer',
    'busy',
    'voicemail'
);

-- Conversations table
create table if not exists public.conversations (
    id uuid unique not null default gen_random_uuid(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    agent_id uuid not null references public.agents(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    status public.conversation_status not null default 'initiated',
    duration_seconds integer,
    call_sid varchar(255),
    recording_url text,
    transcript text,
    sentiment_score decimal(3,2),
    key_points jsonb default '[]'::jsonb,
    outcome text,
    notes text,
    started_at timestamp with time zone default now(),
    ended_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.conversations is 'AI agent conversations with leads';
comment on column public.conversations.campaign_id is 'The campaign this conversation belongs to';
comment on column public.conversations.agent_id is 'The agent that handled this conversation';
comment on column public.conversations.lead_id is 'The lead that was contacted';
comment on column public.conversations.status is 'The status of the conversation';
comment on column public.conversations.duration_seconds is 'Duration of the call in seconds';
comment on column public.conversations.call_sid is 'Twilio call SID';
comment on column public.conversations.recording_url is 'URL to the call recording';
comment on column public.conversations.transcript is 'Transcript of the conversation';
comment on column public.conversations.sentiment_score is 'Sentiment analysis score (-1 to 1)';
comment on column public.conversations.key_points is 'Key points extracted from the conversation';
comment on column public.conversations.outcome is 'The outcome of the conversation';
comment on column public.conversations.notes is 'Notes about the conversation';

-- Enable RLS on conversations table
alter table public.conversations enable row level security;

-- Conversations RLS policies
create policy conversations_read on public.conversations
    for select to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy conversations_insert on public.conversations
    for insert to authenticated
    with check (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy conversations_update on public.conversations
    for update to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    )
    with check (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

create policy conversations_delete on public.conversations
    for delete to authenticated
    using (
        campaign_id in (
            select id from public.campaigns where account_id = auth.uid()
        )
    );

-- Grant permissions
grant select, insert, update, delete on public.conversations to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Integrations
 * Third-party integrations for the platform
 * -------------------------------------------------------
 */

-- Integration status enum
create type public.integration_status as enum (
    'active',
    'inactive',
    'error',
    'pending'
);

-- Integration type enum
create type public.integration_type as enum (
    'crm',
    'payment',
    'communication',
    'analytics',
    'voice'
);

-- Integrations table
create table if not exists public.integrations (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    type public.integration_type not null,
    status public.integration_status not null default 'inactive',
    account_id uuid not null references public.accounts(id) on delete cascade,
    config jsonb default '{}'::jsonb,
    credentials jsonb default '{}'::jsonb,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

comment on table public.integrations is 'Third-party integrations';
comment on column public.integrations.name is 'The name of the integration';
comment on column public.integrations.description is 'The description of the integration';
comment on column public.integrations.type is 'The type of integration';
comment on column public.integrations.status is 'The current status of the integration';
comment on column public.integrations.account_id is 'The account that owns this integration';
comment on column public.integrations.config is 'Configuration for the integration';
comment on column public.integrations.credentials is 'Encrypted credentials for the integration';
comment on column public.integrations.last_sync_at is 'When the integration was last synced';

-- Enable RLS on integrations table
alter table public.integrations enable row level security;

-- Integrations RLS policies
create policy integrations_read on public.integrations
    for select to authenticated
    using (account_id = auth.uid());

create policy integrations_insert on public.integrations
    for insert to authenticated
    with check (account_id = auth.uid());

create policy integrations_update on public.integrations
    for update to authenticated
    using (account_id = auth.uid())
    with check (account_id = auth.uid());

create policy integrations_delete on public.integrations
    for delete to authenticated
    using (account_id = auth.uid());

-- Grant permissions
grant select, insert, update, delete on public.integrations to authenticated, service_role;

/*
 * -------------------------------------------------------
 * Section: Indexes for Performance
 * -------------------------------------------------------
 */

-- Agent indexes
create index if not exists idx_agents_account_id on public.agents(account_id);
create index if not exists idx_agents_status on public.agents(status);
create index if not exists idx_agents_created_at on public.agents(created_at);

-- Campaign indexes
create index if not exists idx_campaigns_account_id on public.campaigns(account_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_agent_id on public.campaigns(agent_id);
create index if not exists idx_campaigns_created_at on public.campaigns(created_at);

-- Workflow indexes
create index if not exists idx_workflows_agent_id on public.workflows(agent_id);
create index if not exists idx_workflows_status on public.workflows(status);
create index if not exists idx_workflows_is_default on public.workflows(is_default);
create index if not exists idx_workflow_nodes_workflow_id on public.workflow_nodes(workflow_id);
create index if not exists idx_workflow_nodes_type on public.workflow_nodes(type);
create index if not exists idx_workflow_edges_workflow_id on public.workflow_edges(workflow_id);
create index if not exists idx_workflow_edges_source_target on public.workflow_edges(source_node_id, target_node_id);

-- Lead indexes
create index if not exists idx_leads_campaign_id on public.leads(campaign_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_phone on public.leads(phone);
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_created_at on public.leads(created_at);

-- Conversation indexes
create index if not exists idx_conversations_campaign_id on public.conversations(campaign_id);
create index if not exists idx_conversations_agent_id on public.conversations(agent_id);
create index if not exists idx_conversations_lead_id on public.conversations(lead_id);
create index if not exists idx_conversations_status on public.conversations(status);
create index if not exists idx_conversations_started_at on public.conversations(started_at);

-- Integration indexes
create index if not exists idx_integrations_account_id on public.integrations(account_id);
create index if not exists idx_integrations_type on public.integrations(type);
create index if not exists idx_integrations_status on public.integrations(status);

/*
 * -------------------------------------------------------
 * Section: Triggers for Updated At
 * -------------------------------------------------------
 */

-- Enable moddatetime extension for automatic updated_at timestamps
create extension if not exists moddatetime;

-- Add updated_at columns with moddatetime triggers
alter table public.agents alter column updated_at set default now();
alter table public.campaigns alter column updated_at set default now();
alter table public.workflows alter column updated_at set default now();
alter table public.workflow_nodes alter column updated_at set default now();
alter table public.workflow_edges alter column updated_at set default now();
alter table public.leads alter column updated_at set default now();
alter table public.conversations alter column updated_at set default now();
alter table public.integrations alter column updated_at set default now();

-- Create moddatetime triggers for all tables
create trigger handle_updated_at_agents before update on public.agents
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_campaigns before update on public.campaigns
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_workflows before update on public.workflows
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_workflow_nodes before update on public.workflow_nodes
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_workflow_edges before update on public.workflow_edges
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_leads before update on public.leads
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_conversations before update on public.conversations
    for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_integrations before update on public.integrations
    for each row execute procedure moddatetime(updated_at);

/*
 * -------------------------------------------------------
 * Section: Storage Buckets
 * -------------------------------------------------------
 */

-- Campaign assets bucket
insert into storage.buckets (id, name, public)
values ('campaign_assets', 'campaign_assets', true);

-- Agent assets bucket
insert into storage.buckets (id, name, public)
values ('agent_assets', 'agent_assets', true);

-- Workflow assets bucket
insert into storage.buckets (id, name, public)
values ('workflow_assets', 'workflow_assets', true);

-- RLS policies for campaign_assets bucket
create policy campaign_assets on storage.objects for all using (
    bucket_id = 'campaign_assets'
        and (
            (storage.foldername(name))[1] in (
                select id::text from public.campaigns where account_id = auth.uid()
            )
        )
    )
    with check (
    bucket_id = 'campaign_assets'
        and (
            (storage.foldername(name))[1] in (
                select id::text from public.campaigns where account_id = auth.uid()
            )
        )
    );

-- RLS policies for agent_assets bucket
create policy agent_assets on storage.objects for all using (
    bucket_id = 'agent_assets'
        and (
            (storage.foldername(name))[1] in (
                select id::text from public.agents where account_id = auth.uid()
            )
        )
    )
    with check (
    bucket_id = 'agent_assets'
        and (
            (storage.foldername(name))[1] in (
                select id::text from public.agents where account_id = auth.uid()
            )
        )
    );

-- RLS policies for workflow_assets bucket
create policy workflow_assets on storage.objects for all using (
    bucket_id = 'workflow_assets'
        and (
            (storage.foldername(name))[1] in (
                select w.id::text from public.workflows w
                join public.agents a on w.agent_id = a.id
                where a.account_id = auth.uid()
            )
        )
    )
    with check (
    bucket_id = 'workflow_assets'
        and (
            (storage.foldername(name))[1] in (
                select w.id::text from public.workflows w
                join public.agents a on w.agent_id = a.id
                where a.account_id = auth.uid()
            )
        )
    ); 