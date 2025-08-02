-- Fix missing team memberships for existing users
-- This migration ensures all authenticated users have team memberships

-- Create team memberships for users who don't have them
insert into public.team_members (business_id, user_id, role, status, created_at)
select 
    b.id as business_id,
    a.id as user_id,
    'owner'::public.team_role as role,
    'active'::public.team_member_status as status,
    now() as created_at
from public.accounts a
join public.businesses b on b.account_id = a.id
where not exists (
    select 1 from public.team_members tm 
    where tm.business_id = b.id and tm.user_id = a.id
);

-- Create businesses and team memberships for users who don't have businesses
insert into public.businesses (name, description, account_id, status, created_at)
select 
    a.name as business_name,
    'Default business for ' || a.name as description,
    a.id as account_id,
    'active'::public.business_status as status,
    now() as created_at
from public.accounts a
where not exists (
    select 1 from public.businesses b where b.account_id = a.id
);

-- Create team memberships for the newly created businesses
insert into public.team_members (business_id, user_id, role, status, created_at)
select 
    b.id as business_id,
    b.account_id as user_id,
    'owner'::public.team_role as role,
    'active'::public.team_member_status as status,
    now() as created_at
from public.businesses b
where not exists (
    select 1 from public.team_members tm 
    where tm.business_id = b.id and tm.user_id = b.account_id
); 