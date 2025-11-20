-- Create notification_settings table
create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,

  -- Notification preferences
  email_notifications boolean not null default true,
  push_notifications boolean not null default false,
  campaign_alerts boolean not null default true,
  weekly_reports boolean not null default true,

  -- Additional preferences (for future expansion)
  preferences jsonb default '{}'::jsonb,

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Ensure one setting per user per business
  unique(user_id, business_id)
);

-- Enable RLS
alter table public.notification_settings enable row level security;

-- RLS Policies
-- Users can view their own notification settings
create policy "Users can view their own notification settings"
  on public.notification_settings
  for select
  using (
    auth.uid() = user_id
  );

-- Users can insert their own notification settings
create policy "Users can insert their own notification settings"
  on public.notification_settings
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.team_members
      where team_members.user_id = auth.uid()
      and team_members.business_id = notification_settings.business_id
    )
  );

-- Users can update their own notification settings
create policy "Users can update their own notification settings"
  on public.notification_settings
  for update
  using (
    auth.uid() = user_id
  )
  with check (
    auth.uid() = user_id
  );

-- Users can delete their own notification settings
create policy "Users can delete their own notification settings"
  on public.notification_settings
  for delete
  using (
    auth.uid() = user_id
  );

-- Indexes for performance
create index if not exists notification_settings_user_id_idx on public.notification_settings(user_id);
create index if not exists notification_settings_business_id_idx on public.notification_settings(business_id);

-- Trigger to update updated_at timestamp
create or replace trigger handle_updated_at_notification_settings
  before update on public.notification_settings
  for each row
  execute function public.moddatetime('updated_at');

-- Grant permissions
grant select, insert, update, delete on public.notification_settings to authenticated;

-- Create a function to get or create notification settings for a user
create or replace function public.get_or_create_notification_settings(
  p_user_id uuid,
  p_business_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings_id uuid;
begin
  -- Try to get existing settings
  select id into v_settings_id
  from public.notification_settings
  where user_id = p_user_id
  and business_id = p_business_id;

  -- If not found, create new settings with defaults
  if v_settings_id is null then
    insert into public.notification_settings (user_id, business_id)
    values (p_user_id, p_business_id)
    returning id into v_settings_id;
  end if;

  return v_settings_id;
end;
$$;

-- Grant execute permission
grant execute on function public.get_or_create_notification_settings(uuid, uuid) to authenticated;
