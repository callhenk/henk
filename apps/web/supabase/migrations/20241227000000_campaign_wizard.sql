/*
 * -------------------------------------------------------
 * Campaign Wizard Additions
 * Adds columns required by the new linear wizard flow
 * -------------------------------------------------------
 */

-- Add new columns to campaigns for wizard steps (if not exist)
do $$
begin
  -- Step 2: Calling & Voice config
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'goal_metric'
  ) then
    alter table public.campaigns add column goal_metric varchar(50);
    comment on column public.campaigns.goal_metric is 'Optimization KPI: pledge_rate | average_gift | total_donations';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'disclosure_line'
  ) then
    alter table public.campaigns add column disclosure_line text;
    comment on column public.campaigns.disclosure_line is 'Disclosure line inserted at start of calls';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'call_window_start'
  ) then
    alter table public.campaigns add column call_window_start time with time zone;
    comment on column public.campaigns.call_window_start is 'Daily call window start (contact local time)';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'call_window_end'
  ) then
    alter table public.campaigns add column call_window_end time with time zone;
    comment on column public.campaigns.call_window_end is 'Daily call window end (contact local time)';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'caller_id'
  ) then
    alter table public.campaigns add column caller_id varchar(32);
    comment on column public.campaigns.caller_id is 'E.164 caller ID used for outbound calls';
  end if;

  -- Step 3: Audience
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'audience_list_id'
  ) then
    alter table public.campaigns add column audience_list_id uuid;
    comment on column public.campaigns.audience_list_id is 'Identifier for the uploaded audience list used by this campaign';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'dedupe_by_phone'
  ) then
    alter table public.campaigns add column dedupe_by_phone boolean not null default false;
    comment on column public.campaigns.dedupe_by_phone is 'Whether to deduplicate uploaded contacts by phone number';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'exclude_dnc'
  ) then
    alter table public.campaigns add column exclude_dnc boolean not null default true;
    comment on column public.campaigns.exclude_dnc is 'Whether to exclude numbers on the DNC list';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'audience_contact_count'
  ) then
    alter table public.campaigns add column audience_contact_count integer not null default 0;
    comment on column public.campaigns.audience_contact_count is 'Count of contacts uploaded for this campaign''s audience';
  end if;
end $$;

-- Helpful partial index for active caller_id selection
create index if not exists idx_campaigns_caller_id on public.campaigns(caller_id) where caller_id is not null;


