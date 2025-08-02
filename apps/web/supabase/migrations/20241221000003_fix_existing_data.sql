-- Fix existing agents and campaigns to use the correct business_id
-- This script updates existing data to work with the new business structure

-- First, let's see what we have
select 'Before fix:' as status;
select 'Agents:' as table_name, count(*) as count from public.agents;
select 'Campaigns:' as table_name, count(*) as count from public.campaigns;

-- Update all agents to use the business_id from the user's team membership
-- This assumes each user has one active business
update public.agents 
set business_id = (
    select tm.business_id 
    from public.team_members tm 
    join public.accounts a on a.id = tm.user_id
    where a.id = auth.uid() 
    and tm.status = 'active'
    limit 1
)
where business_id is null;

-- Update all campaigns to use the business_id from the user's team membership
update public.campaigns 
set business_id = (
    select tm.business_id 
    from public.team_members tm 
    join public.accounts a on a.id = tm.user_id
    where a.id = auth.uid() 
    and tm.status = 'active'
    limit 1
)
where business_id is null;

-- Alternative approach: Update based on account_id if the above doesn't work
-- This updates agents based on the account_id relationship
update public.agents 
set business_id = (
    select b.id 
    from public.businesses b 
    where b.account_id = auth.uid()
    limit 1
)
where business_id is null;

update public.campaigns 
set business_id = (
    select b.id 
    from public.businesses b 
    where b.account_id = auth.uid()
    limit 1
)
where business_id is null;

-- Check final state
select 'After fix:' as status;
select 'Agents with business_id:' as table_name, count(*) as count from public.agents where business_id is not null;
select 'Campaigns with business_id:' as table_name, count(*) as count from public.campaigns where business_id is not null; 