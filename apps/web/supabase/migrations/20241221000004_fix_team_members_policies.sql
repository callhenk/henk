-- Fix infinite recursion in team_members RLS policies
-- The current policies reference team_members table, causing infinite recursion

-- Drop the problematic team_members policies
drop policy if exists team_members_read on public.team_members;
drop policy if exists team_members_insert on public.team_members;
drop policy if exists team_members_update on public.team_members;
drop policy if exists team_members_delete on public.team_members;

-- Create simpler, non-recursive policies for team_members
-- Users can read their own team memberships
create policy team_members_read on public.team_members
    for select to authenticated
    using (user_id = auth.uid());

-- Users can insert team memberships for businesses they own/admin
create policy team_members_insert on public.team_members
    for insert to authenticated
    with check (
        business_id in (
            select b.id from public.businesses b
            where b.account_id = auth.uid()
        )
    );

-- Users can update team memberships for businesses they own/admin
create policy team_members_update on public.team_members
    for update to authenticated
    using (
        business_id in (
            select b.id from public.businesses b
            where b.account_id = auth.uid()
        )
    )
    with check (
        business_id in (
            select b.id from public.businesses b
            where b.account_id = auth.uid()
        )
    );

-- Users can delete team memberships for businesses they own/admin
create policy team_members_delete on public.team_members
    for delete to authenticated
    using (
        business_id in (
            select b.id from public.businesses b
            where b.account_id = auth.uid()
        )
    ); 