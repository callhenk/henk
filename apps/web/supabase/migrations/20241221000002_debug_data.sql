-- Debug and fix data issues
-- This script will help identify and fix problems with business_id assignments

-- Check what data we have
select 'Current state:' as info;
select 'Accounts:' as table_name, count(*) as count from public.accounts;
select 'Businesses:' as table_name, count(*) as count from public.businesses;
select 'Team Members:' as table_name, count(*) as count from public.team_members;
select 'Agents:' as table_name, count(*) as count from public.agents;
select 'Campaigns:' as table_name, count(*) as count from public.campaigns;

-- Check for agents without business_id
select 'Agents without business_id:' as issue, count(*) as count 
from public.agents 
where business_id is null;

-- Check for campaigns without business_id
select 'Campaigns without business_id:' as issue, count(*) as count 
from public.campaigns 
where business_id is null;

-- Check for agents with business_id but no team membership
select 'Agents with business_id but no team membership:' as issue, count(*) as count 
from public.agents a
where a.business_id is not null
and not exists (
    select 1 from public.team_members tm 
    where tm.business_id = a.business_id
);

-- Fix: Update agents to use the user's business
update public.agents 
set business_id = (
    select tm.business_id 
    from public.team_members tm 
    where tm.user_id = auth.uid() 
    and tm.status = 'active'
    limit 1
)
where business_id is null
and exists (
    select 1 from public.team_members tm 
    where tm.user_id = auth.uid() 
    and tm.status = 'active'
);

-- Fix: Update campaigns to use the user's business
update public.campaigns 
set business_id = (
    select tm.business_id 
    from public.team_members tm 
    where tm.user_id = auth.uid() 
    and tm.status = 'active'
    limit 1
)
where business_id is null
and exists (
    select 1 from public.team_members tm 
    where tm.user_id = auth.uid() 
    and tm.status = 'active'
);

-- Check final state
select 'Final state after fixes:' as info;
select 'Agents without business_id:' as issue, count(*) as count 
from public.agents 
where business_id is null;
select 'Campaigns without business_id:' as issue, count(*) as count 
from public.campaigns 
where business_id is null; 