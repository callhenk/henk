-- Fix broken trigger function usage: "trigger functions can only be called as triggers"
-- We replace the helper as a normal function and keep a trigger wrapper to call it.

-- Drop the old trigger-only helper if it exists
do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'update_campaign_execution_stats'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    drop function public.update_campaign_execution_stats();
  end if;
exception when undefined_function then
  -- ignore
end $$;

-- Recreate helper as a NORMAL function (not a trigger)
create or replace function public.update_campaign_execution_stats(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Minimal safe update; extend with real stats as needed
  update public.campaigns
  set updated_at = now()
  where id = p_campaign_id;
  return;
end;
$$;

-- Ensure the trigger wrapper calls the helper correctly
create or replace function public.trigger_update_campaign_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.update_campaign_execution_stats(
    case when TG_OP = 'DELETE' then OLD.campaign_id else NEW.campaign_id end
  );
  return coalesce(NEW, OLD);
end;
$$;

-- Triggers already exist; keep them. Re-create defensively to point at the fixed wrapper.
do $$ begin
  if exists (select 1 from pg_trigger where tgname = 'trigger_conversations_stats_update') then
    drop trigger trigger_conversations_stats_update on public.conversations;
  end if;
  create trigger trigger_conversations_stats_update
    after insert or update or delete on public.conversations
    for each row execute function public.trigger_update_campaign_stats();
exception when others then
  -- ignore and continue
end $$;

do $$ begin
  if exists (select 1 from pg_trigger where tgname = 'trigger_call_logs_stats_update') then
    drop trigger trigger_call_logs_stats_update on public.call_logs;
  end if;
  create trigger trigger_call_logs_stats_update
    after insert or update or delete on public.call_logs
    for each row execute function public.trigger_update_campaign_stats();
exception when others then
  -- ignore and continue
end $$;


