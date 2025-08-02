/*
 * -------------------------------------------------------
 * Business Migration Script
 * This migration safely converts the existing account-based structure
 * to the new business-based structure
 * -------------------------------------------------------
 */

-- Step 1: Create the new business and team member tables
-- Business status enum
do $$ begin
    create type public.business_status as enum (
        'active',
        'inactive',
        'suspended'
    );
exception
    when duplicate_object then null;
end $$;

-- Team member role enum
do $$ begin
    create type public.team_role as enum (
        'owner',
        'admin',
        'member',
        'viewer'
    );
exception
    when duplicate_object then null;
end $$;

-- Team member status enum
do $$ begin
    create type public.team_member_status as enum (
        'active',
        'invited',
        'suspended',
        'left'
    );
exception
    when duplicate_object then null;
end $$;

-- Businesses table
create table if not exists public.businesses (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    status public.business_status not null default 'active',
    account_id uuid not null references public.accounts(id) on delete cascade,
    industry varchar(100),
    website varchar(500),
    phone varchar(50),
    address text,
    logo_url text,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    primary key (id)
);

-- Team members table
create table if not exists public.team_members (
    id uuid unique not null default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.team_role not null default 'member',
    status public.team_member_status not null default 'invited',
    permissions jsonb default '{}'::jsonb,
    invited_by uuid references auth.users(id),
    invited_at timestamp with time zone default now(),
    accepted_at timestamp with time zone,
    last_active_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    primary key (id),
    unique(business_id, user_id)
);

-- Step 2: Migrate existing data
-- Create a default business for each account
insert into public.businesses (name, description, account_id, created_by)
select 
    a.name as business_name,
    'Default business for ' || a.name as description,
    a.id as account_id,
    a.created_by
from public.accounts a
where not exists (
    select 1 from public.businesses b where b.account_id = a.id
);

-- Create team members for each account owner
insert into public.team_members (business_id, user_id, role, status, accepted_at, created_at)
select 
    b.id as business_id,
    a.created_by as user_id,
    'owner'::public.team_role as role,
    'active'::public.team_member_status as status,
    now() as accepted_at,
    now() as created_at
from public.accounts a
join public.businesses b on b.account_id = a.id
where a.created_by is not null
and not exists (
    select 1 from public.team_members tm 
    where tm.business_id = b.id and tm.user_id = a.created_by
);

-- Step 3: Add business_id columns to existing tables
-- Add business_id to agents table
alter table public.agents 
add column if not exists business_id uuid references public.businesses(id);

-- Add business_id to campaigns table  
alter table public.campaigns 
add column if not exists business_id uuid references public.businesses(id);

-- Add business_id to integrations table
alter table public.integrations 
add column if not exists business_id uuid references public.businesses(id);

-- Step 4: Populate business_id columns
-- Update agents with business_id
update public.agents 
set business_id = b.id
from public.businesses b
where agents.account_id = b.account_id
and agents.business_id is null;

-- Update campaigns with business_id
update public.campaigns 
set business_id = b.id
from public.businesses b
where campaigns.account_id = b.account_id
and campaigns.business_id is null;

-- Update integrations with business_id
update public.integrations 
set business_id = b.id
from public.businesses b
where integrations.account_id = b.account_id
and integrations.business_id is null;

-- Step 5: Make business_id NOT NULL and drop account_id
-- Make business_id required for agents
alter table public.agents 
alter column business_id set not null;

-- Make business_id required for campaigns
alter table public.campaigns 
alter column business_id set not null;

-- Make business_id required for integrations
alter table public.integrations 
alter column business_id set not null;

-- Step 6: Drop old RLS policies that depend on account_id
-- Drop old policies
drop policy if exists agents_read on public.agents;
drop policy if exists agents_insert on public.agents;
drop policy if exists agents_update on public.agents;
drop policy if exists agents_delete on public.agents;

drop policy if exists campaigns_read on public.campaigns;
drop policy if exists campaigns_insert on public.campaigns;
drop policy if exists campaigns_update on public.campaigns;
drop policy if exists campaigns_delete on public.campaigns;

drop policy if exists integrations_read on public.integrations;
drop policy if exists integrations_insert on public.integrations;
drop policy if exists integrations_update on public.integrations;
drop policy if exists integrations_delete on public.integrations;

-- Drop workflow policies that depend on account_id
drop policy if exists workflows_read on public.workflows;
drop policy if exists workflows_insert on public.workflows;
drop policy if exists workflows_update on public.workflows;
drop policy if exists workflows_delete on public.workflows;

drop policy if exists workflow_nodes_read on public.workflow_nodes;
drop policy if exists workflow_nodes_insert on public.workflow_nodes;
drop policy if exists workflow_nodes_update on public.workflow_nodes;
drop policy if exists workflow_nodes_delete on public.workflow_nodes;

drop policy if exists workflow_edges_read on public.workflow_edges;
drop policy if exists workflow_edges_insert on public.workflow_edges;
drop policy if exists workflow_edges_update on public.workflow_edges;
drop policy if exists workflow_edges_delete on public.workflow_edges;

-- Drop storage policies that depend on account_id
drop policy if exists agent_assets on storage.objects;
drop policy if exists workflow_assets on storage.objects;
drop policy if exists campaign_assets on storage.objects;

-- Drop leads policies that depend on account_id
drop policy if exists leads_read on public.leads;
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_update on public.leads;
drop policy if exists leads_delete on public.leads;

-- Drop conversations policies that depend on account_id
drop policy if exists conversations_read on public.conversations;
drop policy if exists conversations_insert on public.conversations;
drop policy if exists conversations_update on public.conversations;
drop policy if exists conversations_delete on public.conversations;

-- Step 7: Drop the old account_id columns
alter table public.agents drop column if exists account_id;
alter table public.campaigns drop column if exists account_id;
alter table public.integrations drop column if exists account_id;

-- Create new business-based policies
create policy agents_read on public.agents
    for select to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active'
        )
    );

create policy agents_insert on public.agents
    for insert to authenticated
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    );

create policy agents_update on public.agents
    for update to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    )
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    );

create policy agents_delete on public.agents
    for delete to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy campaigns_read on public.campaigns
    for select to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active'
        )
    );

create policy campaigns_insert on public.campaigns
    for insert to authenticated
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    );

create policy campaigns_update on public.campaigns
    for update to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    )
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin', 'member')
        )
    );

create policy campaigns_delete on public.campaigns
    for delete to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy integrations_read on public.integrations
    for select to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active'
        )
    );

create policy integrations_insert on public.integrations
    for insert to authenticated
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy integrations_update on public.integrations
    for update to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    )
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy integrations_delete on public.integrations
    for delete to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

-- Business and team member policies
create policy businesses_read on public.businesses
    for select to authenticated
    using (
        id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active'
        )
    );

create policy businesses_insert on public.businesses
    for insert to authenticated
    with check (
        account_id = auth.uid()
    );

create policy businesses_update on public.businesses
    for update to authenticated
    using (
        id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    )
    with check (
        id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy businesses_delete on public.businesses
    for delete to authenticated
    using (
        id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role = 'owner'
        )
    );

create policy team_members_read on public.team_members
    for select to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active'
        )
    );

create policy team_members_insert on public.team_members
    for insert to authenticated
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy team_members_update on public.team_members
    for update to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    )
    with check (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

create policy team_members_delete on public.team_members
    for delete to authenticated
    using (
        business_id in (
            select business_id from public.team_members 
            where user_id = auth.uid() and status = 'active' and role in ('owner', 'admin')
        )
    );

-- Grant permissions
grant select, insert, update, delete on public.businesses to authenticated, service_role;
grant select, insert, update, delete on public.team_members to authenticated, service_role;

-- Create new leads policies
create policy leads_read on public.leads
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active'
        )
    );

create policy leads_insert on public.leads
    for insert to authenticated
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    );

create policy leads_update on public.leads
    for update to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    )
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    );

create policy leads_delete on public.leads
    for delete to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin')
        )
    );

-- Create new conversations policies
create policy conversations_read on public.conversations
    for select to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active'
        )
    );

create policy conversations_insert on public.conversations
    for insert to authenticated
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    );

create policy conversations_update on public.conversations
    for update to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    )
    with check (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin', 'member')
        )
    );

create policy conversations_delete on public.conversations
    for delete to authenticated
    using (
        campaign_id in (
            select c.id from public.campaigns c
            join public.team_members tm on c.business_id = tm.business_id
            where tm.user_id = auth.uid() and tm.status = 'active' and tm.role in ('owner', 'admin')
        )
    );

-- Step 8: Update storage bucket policies
-- Update agent_assets bucket policy
drop policy if exists agent_assets on storage.objects;
create policy agent_assets on storage.objects for all using (
    bucket_id = 'agent_assets'
        and (
            (storage.foldername(name))[1] in (
                select a.id::text from public.agents a
                join public.team_members tm on a.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    )
    with check (
    bucket_id = 'agent_assets'
        and (
            (storage.foldername(name))[1] in (
                select a.id::text from public.agents a
                join public.team_members tm on a.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    );

-- Update campaign_assets bucket policy
drop policy if exists campaign_assets on storage.objects;
create policy campaign_assets on storage.objects for all using (
    bucket_id = 'campaign_assets'
        and (
            (storage.foldername(name))[1] in (
                select c.id::text from public.campaigns c
                join public.team_members tm on c.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    )
    with check (
    bucket_id = 'campaign_assets'
        and (
            (storage.foldername(name))[1] in (
                select c.id::text from public.campaigns c
                join public.team_members tm on c.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    );

-- Update knowledge_base bucket policy
drop policy if exists knowledge_base on storage.objects;
create policy knowledge_base on storage.objects for all using (
    bucket_id = 'knowledge_base'
        and (
            (storage.foldername(name))[1] in (
                select a.id::text from public.agents a
                join public.team_members tm on a.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    )
    with check (
    bucket_id = 'knowledge_base'
        and (
            (storage.foldername(name))[1] in (
                select a.id::text from public.agents a
                join public.team_members tm on a.business_id = tm.business_id
                where tm.user_id = auth.uid() and tm.status = 'active'
            )
        )
    );

-- Step 9: Update indexes
-- Drop old indexes
drop index if exists idx_agents_account_id;
drop index if exists idx_campaigns_account_id;
drop index if exists idx_integrations_account_id;

-- Create new indexes
create index if not exists idx_agents_business_id on public.agents(business_id);
create index if not exists idx_campaigns_business_id on public.campaigns(business_id);
create index if not exists idx_integrations_business_id on public.integrations(business_id);
create index if not exists idx_businesses_account_id on public.businesses(account_id);
create index if not exists idx_businesses_status on public.businesses(status);
create index if not exists idx_businesses_created_at on public.businesses(created_at);
create index if not exists idx_team_members_business_id on public.team_members(business_id);
create index if not exists idx_team_members_user_id on public.team_members(user_id);
create index if not exists idx_team_members_role on public.team_members(role);
create index if not exists idx_team_members_status on public.team_members(status);

-- Step 10: Add triggers
do $$ begin
    create trigger handle_updated_at_businesses before update on public.businesses
        for each row execute procedure moddatetime(updated_at);
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create trigger handle_updated_at_team_members before update on public.team_members
        for each row execute procedure moddatetime(updated_at);
exception
    when duplicate_object then null;
end $$; 