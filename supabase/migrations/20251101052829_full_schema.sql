

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "internal";


ALTER SCHEMA "internal" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "kit";


ALTER SCHEMA "kit" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "kit";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."action_type" AS ENUM (
    'voicemail',
    'script',
    'question',
    'transfer',
    'hangup',
    'callback',
    'donation_request',
    'follow_up'
);


ALTER TYPE "public"."action_type" OWNER TO "postgres";


CREATE TYPE "public"."agent_status" AS ENUM (
    'active',
    'inactive',
    'agent_paused',
    'training'
);


ALTER TYPE "public"."agent_status" OWNER TO "postgres";


CREATE TYPE "public"."audio_generation_status" AS ENUM (
    'pending',
    'generating',
    'completed',
    'failed',
    'cached'
);


ALTER TYPE "public"."audio_generation_status" OWNER TO "postgres";


CREATE TYPE "public"."business_status" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE "public"."business_status" OWNER TO "postgres";


CREATE TYPE "public"."call_attempt_result" AS ENUM (
    'success',
    'no_answer',
    'busy',
    'failed',
    'invalid_number',
    'blocked',
    'rate_limited',
    'error'
);


ALTER TYPE "public"."call_attempt_result" OWNER TO "postgres";


CREATE TYPE "public"."call_outcome" AS ENUM (
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


ALTER TYPE "public"."call_outcome" OWNER TO "postgres";


CREATE TYPE "public"."call_status" AS ENUM (
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


ALTER TYPE "public"."call_status" OWNER TO "postgres";


CREATE TYPE "public"."campaign_execution_status" AS ENUM (
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


ALTER TYPE "public"."campaign_execution_status" OWNER TO "postgres";


CREATE TYPE "public"."campaign_status" AS ENUM (
    'draft',
    'active',
    'paused',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."campaign_status" OWNER TO "postgres";


CREATE TYPE "public"."conversation_event_type" AS ENUM (
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


ALTER TYPE "public"."conversation_event_type" OWNER TO "postgres";


CREATE TYPE "public"."conversation_status" AS ENUM (
    'initiated',
    'in_progress',
    'completed',
    'failed',
    'no_answer',
    'busy',
    'voicemail'
);


ALTER TYPE "public"."conversation_status" OWNER TO "postgres";


CREATE TYPE "public"."integration_status" AS ENUM (
    'active',
    'inactive',
    'error',
    'pending'
);


ALTER TYPE "public"."integration_status" OWNER TO "postgres";


CREATE TYPE "public"."integration_type" AS ENUM (
    'crm',
    'payment',
    'communication',
    'analytics',
    'voice'
);


ALTER TYPE "public"."integration_type" OWNER TO "postgres";


CREATE TYPE "public"."lead_status" AS ENUM (
    'new',
    'contacted',
    'interested',
    'pledged',
    'donated',
    'not_interested',
    'unreachable',
    'failed'
);


ALTER TYPE "public"."lead_status" OWNER TO "postgres";


CREATE TYPE "public"."node_type" AS ENUM (
    'start',
    'decision',
    'action',
    'end',
    'condition',
    'loop',
    'delay'
);


ALTER TYPE "public"."node_type" OWNER TO "postgres";


CREATE TYPE "public"."queue_status" AS ENUM (
    'pending',
    'scheduled',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'rate_limited'
);


ALTER TYPE "public"."queue_status" OWNER TO "postgres";


CREATE TYPE "public"."status_update_type" AS ENUM (
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


ALTER TYPE "public"."status_update_type" OWNER TO "postgres";


CREATE TYPE "public"."team_member_status" AS ENUM (
    'active',
    'invited',
    'suspended',
    'left'
);


ALTER TYPE "public"."team_member_status" OWNER TO "postgres";


CREATE TYPE "public"."team_role" AS ENUM (
    'owner',
    'admin',
    'member',
    'viewer'
);


ALTER TYPE "public"."team_role" OWNER TO "postgres";


CREATE TYPE "public"."voice_type" AS ENUM (
    'ai_generated',
    'custom'
);


ALTER TYPE "public"."voice_type" OWNER TO "postgres";


CREATE TYPE "public"."webhook_event_type" AS ENUM (
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


ALTER TYPE "public"."webhook_event_type" OWNER TO "postgres";


CREATE TYPE "public"."workflow_status" AS ENUM (
    'draft',
    'active',
    'inactive',
    'archived'
);


ALTER TYPE "public"."workflow_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."invoke_conversation_orchestrator"("payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  conversation_orchestrator_url text := coalesce(
    current_setting('app.settings.conversation_orchestrator_url', true),
    'https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/conversation-orchestrator'
  );
  anon_key text := current_setting('app.settings.supabase_anon_key', true);
begin
  perform net.http_post(
    url := conversation_orchestrator_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(anon_key, '')
    ),
    body := coalesce(payload, '{}'::jsonb)
  );
end;
$$;


ALTER FUNCTION "internal"."invoke_conversation_orchestrator"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."invoke_sync_salesforce_leads"("payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  sync_salesforce_leads_url text := coalesce(
    current_setting('app.settings.sync_salesforce_leads_url', true),
    'https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/sync-salesforce-leads'
  );
  anon_key text := current_setting('app.settings.supabase_anon_key', true);
begin
  perform net.http_post(
    url := sync_salesforce_leads_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(anon_key, '')
    ),
    body := coalesce(payload, '{}'::jsonb)
  );
end;
$$;


ALTER FUNCTION "internal"."invoke_sync_salesforce_leads"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "kit"."get_storage_filename_as_uuid"("name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
    return replace(storage.filename(name), concat('.',
                                                  storage.extension(name)), '')::uuid;

end;

$$;


ALTER FUNCTION "kit"."get_storage_filename_as_uuid"("name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "kit"."handle_update_user_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
    update
        public.accounts
    set email = new.email
    where id = new.id;

    return new;

end;

$$;


ALTER FUNCTION "kit"."handle_update_user_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "kit"."new_user_created_setup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    user_name TEXT;
    picture_url TEXT;
    new_business_id UUID;
BEGIN
    -- Extract user name
    IF NEW.raw_user_meta_data ->> 'name' IS NOT NULL THEN
        user_name := NEW.raw_user_meta_data ->> 'name';
    ELSIF NEW.email IS NOT NULL THEN
        user_name := split_part(NEW.email, '@', 1);
    ELSE
        user_name := 'User';
    END IF;

    -- Extract avatar
    IF NEW.raw_user_meta_data ->> 'avatar_url' IS NOT NULL THEN
        picture_url := NEW.raw_user_meta_data ->> 'avatar_url';
    ELSE
        picture_url := NULL;
    END IF;

    -- 1. Create account
    INSERT INTO public.accounts(id, name, picture_url, email, created_by)
    VALUES (NEW.id, user_name, picture_url, NEW.email, NEW.id);

    -- 2. Create default business
    INSERT INTO public.businesses(
        name, 
        description, 
        account_id, 
        status, 
        created_by,
        created_at
    )
    VALUES (
        user_name || '''s Organization',
        'Default organization for ' || user_name,
        NEW.id,
        'active'::public.business_status,
        NEW.id,
        NOW()
    )
    RETURNING id INTO new_business_id;

    -- 3. Create team member (owner role, active status)
    INSERT INTO public.team_members(
        business_id, 
        user_id, 
        role, 
        status, 
        accepted_at,
        created_at
    )
    VALUES (
        new_business_id,
        NEW.id,
        'owner'::public.team_role,
        'active'::public.team_member_status,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION "kit"."new_user_created_setup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "kit"."protect_account_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
    if current_user in ('authenticated', 'anon') then
        if new.id <> old.id or new.email <> old.email then
            raise exception 'You do not have permission to update this field';

        end if;

    end if;

    return NEW;

end
$$;


ALTER FUNCTION "kit"."protect_account_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer DEFAULT 1) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_assignment_id UUID;
  v_lead_count INTEGER;
  v_user_business_id UUID;
  v_campaign_business_id UUID;
  v_list_business_id UUID;
BEGIN
  -- Get the user's business_id from team_members
  SELECT business_id INTO v_user_business_id
  FROM public.team_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  -- If user is not part of any business, reject
  IF v_user_business_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of any business'
      USING HINT = 'Please join a business first',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the campaign belongs to the user's business
  SELECT business_id INTO v_campaign_business_id
  FROM public.campaigns
  WHERE id = p_campaign_id;

  IF v_campaign_business_id IS NULL THEN
    RAISE EXCEPTION 'Campaign not found'
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_campaign_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Campaign belongs to a different business'
      USING HINT = 'You can only add lead lists to campaigns in your business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the lead list belongs to the user's business
  SELECT business_id INTO v_list_business_id
  FROM public.lead_lists
  WHERE id = p_lead_list_id;

  IF v_list_business_id IS NULL THEN
    RAISE EXCEPTION 'Lead list not found'
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_list_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Lead list belongs to a different business'
      USING HINT = 'You can only add lead lists from your business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- All permission checks passed, proceed with the operation
  -- Insert the assignment
  INSERT INTO public.campaign_lead_lists (
    campaign_id,
    lead_list_id,
    priority,
    assigned_by
  )
  VALUES (
    p_campaign_id,
    p_lead_list_id,
    p_priority,
    auth.uid()
  )
  RETURNING id INTO v_assignment_id;

  -- Count leads in the list
  SELECT COUNT(*) INTO v_lead_count
  FROM public.lead_list_members
  WHERE lead_list_id = p_lead_list_id;

  -- Update the total_leads count
  UPDATE public.campaign_lead_lists
  SET total_leads = v_lead_count
  WHERE id = v_assignment_id;

  -- Insert leads into campaign_leads
  INSERT INTO public.campaign_leads (campaign_id, lead_id, lead_list_id, status)
  SELECT p_campaign_id, llm.lead_id, p_lead_list_id, 'new'
  FROM public.lead_list_members llm
  WHERE llm.lead_list_id = p_lead_list_id
  ON CONFLICT (campaign_id, lead_id) DO UPDATE
  SET lead_list_id = EXCLUDED.lead_list_id;

  RETURN v_assignment_id;
END;
$$;


ALTER FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer) IS 'Securely assigns a lead list to a campaign after verifying:
1. User is an active member of a business
2. Campaign belongs to user business
3. Lead list belongs to user business
Uses SECURITY DEFINER to batch insert leads, but enforces RLS-equivalent checks manually.';



CREATE OR REPLACE FUNCTION "public"."calculate_sync_duration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If completed_at is being set and started_at exists, calculate duration
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_sync_duration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_campaign_make_calls"("p_campaign_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    campaign_record RECORD;
BEGIN
    SELECT * INTO campaign_record
    FROM campaigns
    WHERE id = p_campaign_id;
    
    RETURN campaign_record.status = 'active' 
           AND campaign_record.start_date <= NOW()::DATE
           AND (campaign_record.end_date IS NULL OR campaign_record.end_date >= NOW()::DATE);
END;
$$;


ALTER FUNCTION "public"."can_campaign_make_calls"("p_campaign_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_campaign_make_calls"("p_campaign_id" "uuid") IS 'Check if campaign can make calls with explicit search path';



CREATE OR REPLACE FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_list_id UUID;
  v_lead JSONB;
  v_lead_id UUID;
  v_user_business_id UUID;
BEGIN
  -- Get the user's business_id from team_members
  SELECT business_id INTO v_user_business_id
  FROM public.team_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  -- If user is not part of any business, reject
  IF v_user_business_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of any business'
      USING HINT = 'Please join a business first',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify the business_id matches the user's business
  IF p_business_id != v_user_business_id THEN
    RAISE EXCEPTION 'Permission denied: Cannot create lead list for a different business'
      USING HINT = 'You can only create lead lists for your own business',
            ERRCODE = 'insufficient_privilege';
  END IF;

  -- All permission checks passed, proceed with the operation
  -- Create the lead list
  INSERT INTO public.lead_lists (
    business_id,
    name,
    description,
    list_type,
    source,
    created_by
  )
  VALUES (
    p_business_id,
    p_list_name,
    'Imported from CSV',
    'static',
    'csv_import',
    auth.uid()
  )
  RETURNING id INTO v_list_id;

  -- Insert each lead and add to list
  FOR v_lead IN SELECT * FROM jsonb_array_elements(p_leads)
  LOOP
    -- Insert or get existing lead
    INSERT INTO public.leads (
      business_id,
      first_name,
      last_name,
      email,
      phone,
      company,
      source,
      source_id,
      created_by
    )
    VALUES (
      p_business_id,
      v_lead->>'first_name',
      v_lead->>'last_name',
      v_lead->>'email',
      v_lead->>'phone',
      v_lead->>'company',
      'csv_import',
      COALESCE(v_lead->>'email', v_lead->>'phone', gen_random_uuid()::text),
      auth.uid()
    )
    ON CONFLICT (business_id, source, source_id)
    DO UPDATE SET
      updated_at = NOW(),
      first_name = COALESCE(EXCLUDED.first_name, leads.first_name),
      last_name = COALESCE(EXCLUDED.last_name, leads.last_name),
      phone = COALESCE(EXCLUDED.phone, leads.phone),
      company = COALESCE(EXCLUDED.company, leads.company)
    RETURNING id INTO v_lead_id;

    -- Add lead to list
    INSERT INTO public.lead_list_members (lead_list_id, lead_id, added_by)
    VALUES (v_list_id, v_lead_id, auth.uid())
    ON CONFLICT (lead_list_id, lead_id) DO NOTHING;
  END LOOP;

  RETURN v_list_id;
END;
$$;


ALTER FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") IS 'Securely creates a new lead list from CSV data after verifying:
1. User is an active member of a business
2. Business ID matches user business
Uses SECURITY DEFINER to batch insert leads, but enforces RLS-equivalent checks manually.';



CREATE OR REPLACE FUNCTION "public"."get_latest_sync_status"("p_integration_id" "uuid") RETURNS TABLE("sync_status" character varying, "last_sync_at" timestamp with time zone, "records_processed" integer, "records_created" integer, "records_updated" integer, "records_failed" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.sync_status,
    sl.completed_at as last_sync_at,
    sl.records_processed,
    sl.records_created,
    sl.records_updated,
    sl.records_failed
  FROM public.sync_logs sl
  WHERE sl.integration_id = p_integration_id
    AND sl.sync_status != 'running'
  ORDER BY sl.created_at DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_latest_sync_status"("p_integration_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_queued_call"() RETURNS TABLE("call_id" "uuid", "campaign_id" "uuid", "agent_id" "uuid", "lead_id" "uuid", "phone_number" "text", "script" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as call_id,
        c.campaign_id,
        c.agent_id,
        c.lead_id,
        l.phone as phone_number,
        cam.script
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    JOIN campaigns cam ON c.campaign_id = cam.id
    WHERE c.status = 'initiated'
    ORDER BY c.created_at ASC
    LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_next_queued_call"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_next_queued_call"() IS 'Get next queued call with explicit search path';



CREATE OR REPLACE FUNCTION "public"."get_next_queued_call"("p_campaign_id" "uuid") RETURNS TABLE("queue_id" "uuid", "lead_id" "uuid", "phone_number" character varying, "attempt_number" integer, "scheduled_for" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."get_next_queued_call"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_campaign_orchestrator"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  anon_key text := current_setting('app.settings.supabase_anon_key', true);
BEGIN
  PERFORM net.http_post(
    url := 'https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/campaign-orchestrator',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(anon_key, '')
    ),
    body := jsonb_build_object(
      'name', 'Functions'
    )
  );
END;
$$;


ALTER FUNCTION "public"."trigger_campaign_orchestrator"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_update_campaign_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.update_campaign_execution_stats(
    case when TG_OP = 'DELETE' then OLD.campaign_id else NEW.campaign_id end
  );
  return coalesce(NEW, OLD);
end;
$$;


ALTER FUNCTION "public"."trigger_update_campaign_stats"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."trigger_update_campaign_stats"() IS 'Trigger to update campaign stats with explicit search path';



CREATE OR REPLACE FUNCTION "public"."trigger_update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_update_timestamp"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."trigger_update_timestamp"() IS 'Trigger to update timestamp with explicit search path';



CREATE OR REPLACE FUNCTION "public"."update_campaign_execution_stats"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Minimal safe update; extend with real stats as needed
  update public.campaigns
  set updated_at = now()
  where id = p_campaign_id;
  return;
end;
$$;


ALTER FUNCTION "public"."update_campaign_execution_stats"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_campaign_lead_list_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update contacted count
    UPDATE public.campaign_lead_lists
    SET contacted_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = NEW.campaign_id
      AND lead_list_id = NEW.lead_list_id
      AND status IN ('contacted', 'converted')
    ),
    successful_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = NEW.campaign_id
      AND lead_list_id = NEW.lead_list_id
      AND status = 'converted'
    )
    WHERE campaign_id = NEW.campaign_id
    AND lead_list_id = NEW.lead_list_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update stats on delete
    UPDATE public.campaign_lead_lists
    SET contacted_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = OLD.campaign_id
      AND lead_list_id = OLD.lead_list_id
      AND status IN ('contacted', 'converted')
    ),
    successful_leads = (
      SELECT COUNT(*)
      FROM public.campaign_leads
      WHERE campaign_id = OLD.campaign_id
      AND lead_list_id = OLD.lead_list_id
      AND status = 'converted'
    )
    WHERE campaign_id = OLD.campaign_id
    AND lead_list_id = OLD.lead_list_id;

    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_campaign_lead_list_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_lead_list_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lead_lists
    SET lead_count = lead_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.lead_list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lead_lists
    SET lead_count = GREATEST(0, lead_count - 1),
        last_updated_at = NOW()
    WHERE id = OLD.lead_list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_lead_list_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(320),
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "picture_url" character varying(1000),
    "public_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."accounts" IS 'Accounts are the top level entity in the Supabase Henk';



COMMENT ON COLUMN "public"."accounts"."name" IS 'The name of the account';



COMMENT ON COLUMN "public"."accounts"."email" IS 'The email of the account. For teams, this is the email of the team (if any)';



COMMENT ON COLUMN "public"."accounts"."updated_at" IS 'The timestamp when the account was last updated';



COMMENT ON COLUMN "public"."accounts"."created_at" IS 'The timestamp when the account was created';



COMMENT ON COLUMN "public"."accounts"."created_by" IS 'The user who created the account';



COMMENT ON COLUMN "public"."accounts"."updated_by" IS 'The user who last updated the account';



COMMENT ON COLUMN "public"."accounts"."picture_url" IS 'The picture url of the account';



COMMENT ON COLUMN "public"."accounts"."public_data" IS 'The public data of the account. Use this to store any additional data that you want to store for the account';



CREATE TABLE IF NOT EXISTS "public"."agents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "status" "public"."agent_status" DEFAULT 'active'::"public"."agent_status" NOT NULL,
    "voice_type" "public"."voice_type" DEFAULT 'ai_generated'::"public"."voice_type" NOT NULL,
    "voice_id" character varying(255),
    "speaking_tone" character varying(100) DEFAULT 'Professional'::character varying NOT NULL,
    "organization_info" "text",
    "donor_context" "text",
    "faqs" "jsonb" DEFAULT '[]'::"jsonb",
    "knowledge_base" "jsonb" DEFAULT '{}'::"jsonb",
    "workflow_config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "business_id" "uuid" NOT NULL,
    "voice_settings" "jsonb" DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}'::"jsonb",
    "personality" "text",
    "script_template" "text",
    "elevenlabs_agent_id" "text",
    "starting_message" "text",
    "caller_id" "text"
);


ALTER TABLE "public"."agents" OWNER TO "postgres";


COMMENT ON TABLE "public"."agents" IS 'AI voice agents for fundraising calls';



COMMENT ON COLUMN "public"."agents"."name" IS 'The name of the agent';



COMMENT ON COLUMN "public"."agents"."description" IS 'The description of the agent';



COMMENT ON COLUMN "public"."agents"."status" IS 'The current status of the agent';



COMMENT ON COLUMN "public"."agents"."voice_type" IS 'The type of voice (elevenlabs or custom)';



COMMENT ON COLUMN "public"."agents"."voice_id" IS 'The voice ID from the voice provider';



COMMENT ON COLUMN "public"."agents"."speaking_tone" IS 'The speaking tone of the agent';



COMMENT ON COLUMN "public"."agents"."organization_info" IS 'Information about the organization';



COMMENT ON COLUMN "public"."agents"."donor_context" IS 'Context about donors and fundraising';



COMMENT ON COLUMN "public"."agents"."faqs" IS 'Frequently asked questions for the agent';



COMMENT ON COLUMN "public"."agents"."knowledge_base" IS 'Knowledge base configuration';



COMMENT ON COLUMN "public"."agents"."workflow_config" IS 'Workflow configuration for the agent';



COMMENT ON COLUMN "public"."agents"."voice_settings" IS 'Voice synthesis settings (stability, similarity_boost, etc.)';



COMMENT ON COLUMN "public"."agents"."personality" IS 'Agent personality description for voice synthesis';



COMMENT ON COLUMN "public"."agents"."script_template" IS 'Default script template for the agent';



COMMENT ON COLUMN "public"."agents"."elevenlabs_agent_id" IS 'ElevenLabs agent ID for voice integration';



COMMENT ON COLUMN "public"."agents"."starting_message" IS 'The initial message the agent uses when starting a call';



COMMENT ON COLUMN "public"."agents"."caller_id" IS 'E.164 caller ID used for outbound calls';



CREATE TABLE IF NOT EXISTS "public"."agents_knowledge_bases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "knowledge_base_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agents_knowledge_bases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audio_generations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "agent_id" "uuid",
    "lead_id" "uuid",
    "text_content" "text" NOT NULL,
    "voice_id" character varying(255) NOT NULL,
    "voice_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "public"."audio_generation_status" DEFAULT 'pending'::"public"."audio_generation_status" NOT NULL,
    "audio_url" "text",
    "file_size_bytes" bigint,
    "duration_seconds" numeric(8,2),
    "elevenlabs_request_id" character varying(255),
    "elevenlabs_voice_name" character varying(255),
    "model_id" character varying(100) DEFAULT 'eleven_multilingual_v2'::character varying,
    "generation_time_ms" integer,
    "cost_cents" integer,
    "cache_hit" boolean DEFAULT false,
    "cache_key" character varying(255),
    "error_code" character varying(50),
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."audio_generations" OWNER TO "postgres";


COMMENT ON TABLE "public"."audio_generations" IS 'Track ElevenLabs voice generations and caching';



COMMENT ON COLUMN "public"."audio_generations"."cache_hit" IS 'Whether this generation used cached audio';



COMMENT ON COLUMN "public"."audio_generations"."cache_key" IS 'Key for caching identical text+voice combinations';



CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "status" "public"."business_status" DEFAULT 'active'::"public"."business_status" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "industry" character varying(100),
    "website" character varying(500),
    "phone" character varying(50),
    "address" "text",
    "logo_url" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."call_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "call_log_id" "uuid",
    "attempt_number" integer NOT NULL,
    "result" "public"."call_attempt_result",
    "scheduled_at" timestamp with time zone NOT NULL,
    "attempted_at" timestamp with time zone,
    "next_attempt_at" timestamp with time zone,
    "retry_reason" character varying(255),
    "retry_delay_minutes" integer,
    "phone_number" character varying(20) NOT NULL,
    "audio_generation_id" "uuid",
    "error_code" character varying(50),
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."call_attempts" OWNER TO "postgres";


COMMENT ON TABLE "public"."call_attempts" IS 'Track individual call attempts and retry scheduling';



COMMENT ON COLUMN "public"."call_attempts"."attempt_number" IS 'Sequential attempt number for this lead';



COMMENT ON COLUMN "public"."call_attempts"."next_attempt_at" IS 'When the next retry should be attempted';



CREATE TABLE IF NOT EXISTS "public"."call_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "conversation_id" "uuid",
    "call_sid" character varying(255),
    "parent_call_sid" character varying(255),
    "from_number" character varying(20) NOT NULL,
    "to_number" character varying(20) NOT NULL,
    "status" "public"."call_status" DEFAULT 'queued'::"public"."call_status" NOT NULL,
    "outcome" "public"."call_outcome",
    "direction" character varying(20) DEFAULT 'outbound'::character varying NOT NULL,
    "queued_at" timestamp with time zone DEFAULT "now"(),
    "initiated_at" timestamp with time zone,
    "answered_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "duration_seconds" integer,
    "ring_duration_seconds" integer,
    "audio_url" "text",
    "recording_url" "text",
    "recording_duration_seconds" integer,
    "machine_detection_result" character varying(50),
    "sentiment_score" numeric(3,2),
    "quality_score" integer,
    "call_cost" numeric(6,4),
    "pledged_amount" numeric(10,2),
    "donated_amount" numeric(10,2),
    "error_code" character varying(20),
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."call_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."call_logs" IS 'Detailed call tracking for Twilio integration';



COMMENT ON COLUMN "public"."call_logs"."call_sid" IS 'Unique Twilio call identifier';



COMMENT ON COLUMN "public"."call_logs"."machine_detection_result" IS 'Result of Twilio machine detection';



COMMENT ON COLUMN "public"."call_logs"."sentiment_score" IS 'AI sentiment analysis score (-1.0 to 1.0)';



CREATE TABLE IF NOT EXISTS "public"."campaign_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "status" "public"."campaign_execution_status" DEFAULT 'pending'::"public"."campaign_execution_status" NOT NULL,
    "execution_node" character varying(255),
    "process_id" character varying(255),
    "total_leads" integer DEFAULT 0 NOT NULL,
    "leads_processed" integer DEFAULT 0 NOT NULL,
    "leads_queued" integer DEFAULT 0 NOT NULL,
    "calls_made" integer DEFAULT 0 NOT NULL,
    "calls_successful" integer DEFAULT 0 NOT NULL,
    "calls_failed" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone,
    "paused_at" timestamp with time zone,
    "resumed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "estimated_completion_at" timestamp with time zone,
    "calls_today" integer DEFAULT 0 NOT NULL,
    "calls_this_hour" integer DEFAULT 0 NOT NULL,
    "audio_generations_today" integer DEFAULT 0 NOT NULL,
    "average_call_duration_seconds" numeric(8,2),
    "success_rate_percentage" numeric(5,2),
    "current_throughput_calls_per_hour" numeric(8,2),
    "config_snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "last_error" "text",
    "error_count" integer DEFAULT 0 NOT NULL,
    "retry_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."campaign_executions" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_executions" IS 'Track campaign execution state and progress';



COMMENT ON COLUMN "public"."campaign_executions"."execution_node" IS 'Server/container running this campaign';



COMMENT ON COLUMN "public"."campaign_executions"."config_snapshot" IS 'Campaign configuration at execution time';



CREATE TABLE IF NOT EXISTS "public"."campaign_lead_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "lead_list_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "assigned_by" "uuid",
    "priority" integer DEFAULT 1,
    "max_attempts_override" integer,
    "filter_criteria" "jsonb",
    "total_leads" integer DEFAULT 0,
    "contacted_leads" integer DEFAULT 0,
    "successful_leads" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."campaign_lead_lists" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_lead_lists" IS 'Links lead lists to campaigns for organized lead management';



COMMENT ON COLUMN "public"."campaign_lead_lists"."priority" IS 'Processing priority for this list within the campaign (lower numbers = higher priority)';



CREATE TABLE IF NOT EXISTS "public"."campaign_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "lead_list_id" "uuid",
    "status" character varying(50) DEFAULT 'new'::character varying,
    "attempts" integer DEFAULT 0,
    "last_attempt_at" timestamp with time zone,
    "next_attempt_at" timestamp with time zone,
    "outcome" character varying(100),
    "pledged_amount" numeric,
    "donated_amount" numeric,
    "notes" "text",
    "total_talk_time" integer DEFAULT 0,
    "last_call_duration" integer,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "contacted_at" timestamp with time zone,
    "converted_at" timestamp with time zone
);


ALTER TABLE "public"."campaign_leads" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_leads" IS 'Tracks individual leads within campaigns with their status and outcomes';



COMMENT ON COLUMN "public"."campaign_leads"."lead_list_id" IS 'References which list this lead came from in this campaign';



CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "status" "public"."campaign_status" DEFAULT 'draft'::"public"."campaign_status" NOT NULL,
    "agent_id" "uuid",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "daily_call_cap" integer DEFAULT 100 NOT NULL,
    "script" "text" NOT NULL,
    "retry_logic" "text" DEFAULT 'Wait 24 hours before retry'::"text" NOT NULL,
    "budget" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "business_id" "uuid" NOT NULL,
    "goal_metric" character varying(50),
    "disclosure_line" "text",
    "call_window_start" time with time zone,
    "call_window_end" time with time zone,
    "audience_list_id" "uuid",
    "dedupe_by_phone" boolean DEFAULT false NOT NULL,
    "exclude_dnc" boolean DEFAULT true NOT NULL,
    "audience_contact_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaigns" IS 'AI voice fundraising campaigns';



COMMENT ON COLUMN "public"."campaigns"."name" IS 'The name of the campaign';



COMMENT ON COLUMN "public"."campaigns"."description" IS 'The description of the campaign';



COMMENT ON COLUMN "public"."campaigns"."status" IS 'The current status of the campaign';



COMMENT ON COLUMN "public"."campaigns"."agent_id" IS 'The AI agent assigned to this campaign';



COMMENT ON COLUMN "public"."campaigns"."start_date" IS 'When the campaign starts';



COMMENT ON COLUMN "public"."campaigns"."end_date" IS 'When the campaign ends';



COMMENT ON COLUMN "public"."campaigns"."max_attempts" IS 'Maximum number of call attempts per lead';



COMMENT ON COLUMN "public"."campaigns"."daily_call_cap" IS 'Maximum number of calls per day';



COMMENT ON COLUMN "public"."campaigns"."script" IS 'The script for the AI agent to follow';



COMMENT ON COLUMN "public"."campaigns"."retry_logic" IS 'The retry logic for failed calls';



COMMENT ON COLUMN "public"."campaigns"."budget" IS 'The campaign budget';



COMMENT ON COLUMN "public"."campaigns"."goal_metric" IS 'Optimization KPI: pledge_rate | average_gift | total_donations';



COMMENT ON COLUMN "public"."campaigns"."disclosure_line" IS 'Disclosure line inserted at start of calls';



COMMENT ON COLUMN "public"."campaigns"."call_window_start" IS 'Daily call window start (contact local time)';



COMMENT ON COLUMN "public"."campaigns"."call_window_end" IS 'Daily call window end (contact local time)';



COMMENT ON COLUMN "public"."campaigns"."audience_list_id" IS 'Identifier for the uploaded audience list used by this campaign';



COMMENT ON COLUMN "public"."campaigns"."dedupe_by_phone" IS 'Whether to deduplicate uploaded contacts by phone number';



COMMENT ON COLUMN "public"."campaigns"."exclude_dnc" IS 'Whether to exclude numbers on the DNC list';



COMMENT ON COLUMN "public"."campaigns"."audience_contact_count" IS 'Count of contacts uploaded for this campaign''s audience';



CREATE TABLE IF NOT EXISTS "public"."lead_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#3B82F6'::character varying,
    "list_type" character varying(50) DEFAULT 'static'::character varying,
    "source" character varying(50),
    "source_id" character varying(255),
    "filter_criteria" "jsonb",
    "lead_count" integer DEFAULT 0,
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "is_archived" boolean DEFAULT false,
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."lead_lists" OWNER TO "postgres";


COMMENT ON TABLE "public"."lead_lists" IS 'Reusable lists for organizing leads into groups';



COMMENT ON COLUMN "public"."lead_lists"."list_type" IS 'static: manual additions | dynamic: rule-based | smart: auto-updating query';



COMMENT ON COLUMN "public"."lead_lists"."lead_count" IS 'Automatically maintained count of members in this lead list';



CREATE OR REPLACE VIEW "public"."campaign_lead_lists_with_stats" WITH ("security_invoker"='on') AS
 SELECT "cll"."id",
    "cll"."campaign_id",
    "cll"."lead_list_id",
    "cll"."assigned_at",
    "cll"."assigned_by",
    "cll"."priority",
    "cll"."max_attempts_override",
    "cll"."filter_criteria",
    "cll"."total_leads",
    "cll"."contacted_leads",
    "cll"."successful_leads",
    "cll"."is_active",
    "cll"."completed_at",
    "ll"."name" AS "list_name",
    "ll"."description" AS "list_description",
    "ll"."lead_count" AS "total_leads_in_list",
    "c"."name" AS "campaign_name",
    "c"."status" AS "campaign_status",
    ( SELECT "count"(*) AS "count"
           FROM "public"."campaign_leads" "cl"
          WHERE (("cl"."campaign_id" = "cll"."campaign_id") AND ("cl"."lead_list_id" = "cll"."lead_list_id"))) AS "actual_leads_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."campaign_leads" "cl"
          WHERE (("cl"."campaign_id" = "cll"."campaign_id") AND ("cl"."lead_list_id" = "cll"."lead_list_id") AND (("cl"."status")::"text" = 'contacted'::"text"))) AS "contacted_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."campaign_leads" "cl"
          WHERE (("cl"."campaign_id" = "cll"."campaign_id") AND ("cl"."lead_list_id" = "cll"."lead_list_id") AND (("cl"."status")::"text" = 'converted'::"text"))) AS "converted_count"
   FROM (("public"."campaign_lead_lists" "cll"
     JOIN "public"."lead_lists" "ll" ON (("cll"."lead_list_id" = "ll"."id")))
     JOIN "public"."campaigns" "c" ON (("cll"."campaign_id" = "c"."id")));


ALTER VIEW "public"."campaign_lead_lists_with_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "status" "public"."queue_status" DEFAULT 'pending'::"public"."queue_status" NOT NULL,
    "priority" integer DEFAULT 100 NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL,
    "processing_started_at" timestamp with time zone,
    "processing_node" character varying(255),
    "attempt_number" integer DEFAULT 1 NOT NULL,
    "retry_reason" character varying(255),
    "requires_audio_generation" boolean DEFAULT true NOT NULL,
    "audio_generation_id" "uuid",
    "calls_made_today" integer DEFAULT 0 NOT NULL,
    "last_call_at" timestamp with time zone,
    "error_count" integer DEFAULT 0 NOT NULL,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaign_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_queue" IS 'Track calls waiting to be processed by campaign orchestrator';



COMMENT ON COLUMN "public"."campaign_queue"."priority" IS 'Queue priority (lower number = higher priority)';



COMMENT ON COLUMN "public"."campaign_queue"."processing_node" IS 'Server/container processing this queue item';



CREATE TABLE IF NOT EXISTS "public"."conversation_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "call_log_id" "uuid",
    "event_type" "public"."conversation_event_type" NOT NULL,
    "sequence_number" integer NOT NULL,
    "agent_text" "text",
    "user_response" "text",
    "confidence_score" numeric(3,2),
    "audio_url" "text",
    "audio_duration_seconds" numeric(6,2),
    "processing_time_ms" integer,
    "ai_model_used" character varying(100),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversation_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversation_events" IS 'Track individual events within AI agent conversations';



COMMENT ON COLUMN "public"."conversation_events"."sequence_number" IS 'Order of events within the conversation';



COMMENT ON COLUMN "public"."conversation_events"."confidence_score" IS 'Speech recognition confidence (0.0 to 1.0)';



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "status" "public"."conversation_status" DEFAULT 'initiated'::"public"."conversation_status" NOT NULL,
    "duration_seconds" integer,
    "call_sid" character varying(255),
    "recording_url" "text",
    "transcript" "text",
    "sentiment_score" numeric(3,2),
    "key_points" "jsonb" DEFAULT '[]'::"jsonb",
    "outcome" "text",
    "notes" "text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "conversation_id" "text"
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversations" IS 'AI agent conversations with leads';



COMMENT ON COLUMN "public"."conversations"."campaign_id" IS 'The campaign this conversation belongs to';



COMMENT ON COLUMN "public"."conversations"."agent_id" IS 'The agent that handled this conversation';



COMMENT ON COLUMN "public"."conversations"."lead_id" IS 'The lead that was contacted';



COMMENT ON COLUMN "public"."conversations"."status" IS 'The status of the conversation';



COMMENT ON COLUMN "public"."conversations"."duration_seconds" IS 'Duration of the call in seconds';



COMMENT ON COLUMN "public"."conversations"."call_sid" IS 'Twilio call SID';



COMMENT ON COLUMN "public"."conversations"."recording_url" IS 'URL to the call recording';



COMMENT ON COLUMN "public"."conversations"."transcript" IS 'Transcript of the conversation';



COMMENT ON COLUMN "public"."conversations"."sentiment_score" IS 'Sentiment analysis score (-1 to 1)';



COMMENT ON COLUMN "public"."conversations"."key_points" IS 'Key points extracted from the conversation';



COMMENT ON COLUMN "public"."conversations"."outcome" IS 'The outcome of the conversation';



COMMENT ON COLUMN "public"."conversations"."notes" IS 'Notes about the conversation';



CREATE OR REPLACE VIEW "public"."daily_call_volume" WITH ("security_invoker"='on') AS
 SELECT "date"("started_at") AS "call_date",
    "count"("id") AS "total_calls",
    "count"(
        CASE
            WHEN ("status" = 'completed'::"public"."conversation_status") THEN 1
            ELSE NULL::integer
        END) AS "completed_calls",
    "count"(
        CASE
            WHEN ("status" = 'failed'::"public"."conversation_status") THEN 1
            ELSE NULL::integer
        END) AS "failed_calls",
    "count"(
        CASE
            WHEN ("status" = 'no_answer'::"public"."conversation_status") THEN 1
            ELSE NULL::integer
        END) AS "no_answer_calls",
    "count"(
        CASE
            WHEN ("status" = 'busy'::"public"."conversation_status") THEN 1
            ELSE NULL::integer
        END) AS "busy_calls",
    "count"(
        CASE
            WHEN ("status" = 'voicemail'::"public"."conversation_status") THEN 1
            ELSE NULL::integer
        END) AS "voicemail_calls",
    "avg"(
        CASE
            WHEN ("duration_seconds" IS NOT NULL) THEN "duration_seconds"
            ELSE NULL::integer
        END) AS "avg_duration",
    "sum"(
        CASE
            WHEN ("duration_seconds" IS NOT NULL) THEN "duration_seconds"
            ELSE NULL::integer
        END) AS "total_duration"
   FROM "public"."conversations" "conv"
  WHERE ("started_at" IS NOT NULL)
  GROUP BY ("date"("started_at"))
  ORDER BY ("date"("started_at")) DESC;


ALTER VIEW "public"."daily_call_volume" OWNER TO "postgres";


COMMENT ON VIEW "public"."daily_call_volume" IS 'Daily call volume statistics with security invoker';



CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "type" "public"."integration_type" NOT NULL,
    "status" "public"."integration_status" DEFAULT 'inactive'::"public"."integration_status" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "credentials" "jsonb" DEFAULT '{}'::"jsonb",
    "last_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "business_id" "uuid" NOT NULL
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."integrations" IS 'Third-party integrations';



COMMENT ON COLUMN "public"."integrations"."name" IS 'The name of the integration';



COMMENT ON COLUMN "public"."integrations"."description" IS 'The description of the integration';



COMMENT ON COLUMN "public"."integrations"."type" IS 'The type of integration';



COMMENT ON COLUMN "public"."integrations"."status" IS 'The current status of the integration';



COMMENT ON COLUMN "public"."integrations"."config" IS 'Configuration for the integration';



COMMENT ON COLUMN "public"."integrations"."credentials" IS 'Encrypted credentials for the integration';



COMMENT ON COLUMN "public"."integrations"."last_sync_at" IS 'When the integration was last synced';



CREATE TABLE IF NOT EXISTS "public"."knowledge_bases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "elevenlabs_kb_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "file_count" integer DEFAULT 0,
    "char_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."knowledge_bases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_list_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_list_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "added_by" "uuid",
    "notes" "text"
);


ALTER TABLE "public"."lead_list_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."lead_list_members" IS 'Many-to-many relationship between leads and lists';



CREATE OR REPLACE VIEW "public"."lead_lists_with_campaigns" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "business_id",
    NULL::character varying(255) AS "name",
    NULL::"text" AS "description",
    NULL::character varying(7) AS "color",
    NULL::character varying(50) AS "list_type",
    NULL::character varying(50) AS "source",
    NULL::character varying(255) AS "source_id",
    NULL::"jsonb" AS "filter_criteria",
    NULL::integer AS "lead_count",
    NULL::timestamp with time zone AS "last_updated_at",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"uuid" AS "created_by",
    NULL::"uuid" AS "updated_by",
    NULL::boolean AS "is_archived",
    NULL::"jsonb" AS "tags",
    NULL::"jsonb" AS "metadata",
    NULL::json AS "campaigns";


ALTER VIEW "public"."lead_lists_with_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "source" character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    "source_id" character varying(255),
    "source_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "first_name" character varying(255),
    "last_name" character varying(255),
    "email" character varying(255),
    "phone" character varying(50),
    "mobile_phone" character varying(50),
    "street" "text",
    "city" character varying(100),
    "state" character varying(100),
    "postal_code" character varying(20),
    "country" character varying(100),
    "company" character varying(255),
    "title" character varying(255),
    "department" character varying(255),
    "lead_source" character varying(100),
    "description" "text",
    "owner_id" character varying(255),
    "do_not_call" boolean DEFAULT false,
    "do_not_email" boolean DEFAULT false,
    "email_opt_out" boolean DEFAULT false,
    "timezone" character varying(100),
    "preferred_language" character varying(50),
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb",
    "last_synced_at" timestamp with time zone,
    "sync_status" character varying(50) DEFAULT 'active'::character varying,
    "sync_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "status" character varying(50) DEFAULT 'new'::character varying,
    "notes" "text",
    "dnc" boolean DEFAULT false,
    "lead_score" integer DEFAULT 0,
    "quality_rating" character varying(20) DEFAULT 'unrated'::character varying,
    "last_activity_at" timestamp with time zone,
    CONSTRAINT "leads_has_contact_info" CHECK ((("phone" IS NOT NULL) OR ("mobile_phone" IS NOT NULL) OR ("email" IS NOT NULL)))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


COMMENT ON TABLE "public"."leads" IS 'Master leads table for all lead sources (Salesforce, HubSpot, manual, CSV, etc.)';



COMMENT ON COLUMN "public"."leads"."source" IS 'Origin of the lead: salesforce, hubspot, manual, csv_import, etc.';



COMMENT ON COLUMN "public"."leads"."source_id" IS 'External ID from the source system (e.g., Salesforce Contact ID)';



COMMENT ON COLUMN "public"."leads"."tags" IS 'Flexible JSON array for categorizing leads';



COMMENT ON COLUMN "public"."leads"."lead_score" IS 'Score indicating lead quality (0-100)';



COMMENT ON COLUMN "public"."leads"."quality_rating" IS 'Qualitative rating: hot, warm, cold, or unrated';



CREATE OR REPLACE VIEW "public"."leads_with_lists" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "business_id",
    NULL::character varying(50) AS "source",
    NULL::character varying(255) AS "source_id",
    NULL::"jsonb" AS "source_metadata",
    NULL::character varying(255) AS "first_name",
    NULL::character varying(255) AS "last_name",
    NULL::character varying(255) AS "email",
    NULL::character varying(50) AS "phone",
    NULL::character varying(50) AS "mobile_phone",
    NULL::"text" AS "street",
    NULL::character varying(100) AS "city",
    NULL::character varying(100) AS "state",
    NULL::character varying(20) AS "postal_code",
    NULL::character varying(100) AS "country",
    NULL::character varying(255) AS "company",
    NULL::character varying(255) AS "title",
    NULL::character varying(255) AS "department",
    NULL::character varying(100) AS "lead_source",
    NULL::"text" AS "description",
    NULL::character varying(255) AS "owner_id",
    NULL::boolean AS "do_not_call",
    NULL::boolean AS "do_not_email",
    NULL::boolean AS "email_opt_out",
    NULL::character varying(100) AS "timezone",
    NULL::character varying(50) AS "preferred_language",
    NULL::"jsonb" AS "tags",
    NULL::"jsonb" AS "custom_fields",
    NULL::timestamp with time zone AS "last_synced_at",
    NULL::character varying(50) AS "sync_status",
    NULL::"text" AS "sync_error",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"uuid" AS "created_by",
    NULL::"uuid" AS "updated_by",
    NULL::character varying(50) AS "status",
    NULL::"text" AS "notes",
    NULL::boolean AS "dnc",
    NULL::integer AS "lead_score",
    NULL::character varying(20) AS "quality_rating",
    NULL::timestamp with time zone AS "last_activity_at",
    NULL::json AS "lists";


ALTER VIEW "public"."leads_with_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_name" character varying(100) NOT NULL,
    "metric_type" character varying(50) NOT NULL,
    "value" numeric(15,6) NOT NULL,
    "unit" character varying(20),
    "campaign_id" "uuid",
    "service_name" character varying(100),
    "node_id" character varying(255),
    "tags" "jsonb" DEFAULT '{}'::"jsonb",
    "recorded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."performance_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."performance_metrics" IS 'System performance and health metrics';



COMMENT ON COLUMN "public"."performance_metrics"."tags" IS 'Additional metadata tags for filtering and grouping';



CREATE TABLE IF NOT EXISTS "public"."status_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "update_type" "public"."status_update_type" NOT NULL,
    "campaign_id" "uuid",
    "account_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text",
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "websocket_sent" boolean DEFAULT false NOT NULL,
    "websocket_sent_at" timestamp with time zone,
    "email_sent" boolean DEFAULT false NOT NULL,
    "email_sent_at" timestamp with time zone,
    "priority" integer DEFAULT 100 NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."status_updates" OWNER TO "postgres";


COMMENT ON TABLE "public"."status_updates" IS 'Track real-time dashboard updates and notifications';



COMMENT ON COLUMN "public"."status_updates"."data" IS 'Additional data payload for the update';



COMMENT ON COLUMN "public"."status_updates"."expires_at" IS 'When this update should be removed from active feeds';



CREATE TABLE IF NOT EXISTS "public"."sync_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "uuid" NOT NULL,
    "business_id" "uuid" NOT NULL,
    "sync_type" character varying(50) NOT NULL,
    "sync_status" character varying(50) NOT NULL,
    "records_processed" integer DEFAULT 0,
    "records_created" integer DEFAULT 0,
    "records_updated" integer DEFAULT 0,
    "records_failed" integer DEFAULT 0,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "duration_ms" integer,
    "error_message" "text",
    "error_details" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sync_logs_sync_status_check" CHECK ((("sync_status")::"text" = ANY ((ARRAY['running'::character varying, 'success'::character varying, 'partial'::character varying, 'failed'::character varying])::"text"[]))),
    CONSTRAINT "sync_logs_sync_type_check" CHECK ((("sync_type")::"text" = ANY ((ARRAY['full'::character varying, 'incremental'::character varying, 'manual'::character varying])::"text"[])))
);


ALTER TABLE "public"."sync_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."sync_logs" IS 'Tracks synchronization operations from external systems like Salesforce';



COMMENT ON COLUMN "public"."sync_logs"."sync_type" IS 'Type of sync: full (all records), incremental (modified only), or manual (user-triggered)';



COMMENT ON COLUMN "public"."sync_logs"."sync_status" IS 'Current status of the sync operation';



COMMENT ON COLUMN "public"."sync_logs"."records_processed" IS 'Total number of records processed during sync';



COMMENT ON COLUMN "public"."sync_logs"."records_created" IS 'Number of new records created';



COMMENT ON COLUMN "public"."sync_logs"."records_updated" IS 'Number of existing records updated';



COMMENT ON COLUMN "public"."sync_logs"."records_failed" IS 'Number of records that failed to process';



COMMENT ON COLUMN "public"."sync_logs"."duration_ms" IS 'Total duration of sync operation in milliseconds';



COMMENT ON COLUMN "public"."sync_logs"."metadata" IS 'Additional sync metadata (e.g., contacts_synced, leads_synced counts)';



CREATE OR REPLACE VIEW "public"."sync_logs_summary" WITH ("security_invoker"='on') AS
 SELECT "sl"."id",
    "sl"."integration_id",
    "i"."name" AS "integration_name",
    "sl"."business_id",
    "b"."name" AS "business_name",
    "sl"."sync_type",
    "sl"."sync_status",
    "sl"."records_processed",
    "sl"."records_created",
    "sl"."records_updated",
    "sl"."records_failed",
    "sl"."started_at",
    "sl"."completed_at",
    "sl"."duration_ms",
        CASE
            WHEN ("sl"."duration_ms" IS NOT NULL) THEN "concat"(("floor"((("sl"."duration_ms" / 1000))::double precision))::"text", '.', "lpad"((("sl"."duration_ms" % 1000))::"text", 3, '0'::"text"), 's')
            ELSE NULL::"text"
        END AS "duration_formatted",
    "sl"."error_message",
    "sl"."metadata",
    "sl"."created_at"
   FROM (("public"."sync_logs" "sl"
     LEFT JOIN "public"."integrations" "i" ON (("sl"."integration_id" = "i"."id")))
     LEFT JOIN "public"."businesses" "b" ON (("sl"."business_id" = "b"."id")))
  ORDER BY "sl"."created_at" DESC;


ALTER VIEW "public"."sync_logs_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."team_role" DEFAULT 'member'::"public"."team_role" NOT NULL,
    "status" "public"."team_member_status" DEFAULT 'invited'::"public"."team_member_status" NOT NULL,
    "permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "invited_by" "uuid",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    "last_active_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "public"."webhook_event_type" NOT NULL,
    "call_sid" character varying(255),
    "account_sid" character varying(255),
    "campaign_id" "uuid",
    "call_log_id" "uuid",
    "event_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "processed" boolean DEFAULT false NOT NULL,
    "processed_at" timestamp with time zone,
    "processing_error" "text",
    "source_ip" character varying(45),
    "user_agent" "text",
    "twilio_signature" character varying(255),
    "signature_valid" boolean,
    "received_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."webhook_events" IS 'Log all Twilio webhook events for debugging and analytics';



COMMENT ON COLUMN "public"."webhook_events"."raw_payload" IS 'Complete webhook payload for debugging';



COMMENT ON COLUMN "public"."webhook_events"."signature_valid" IS 'Whether the Twilio signature was validated';



CREATE TABLE IF NOT EXISTS "public"."workflow_edges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "edge_id" character varying(255) NOT NULL,
    "source_node_id" character varying(255) NOT NULL,
    "target_node_id" character varying(255) NOT NULL,
    "source_handle" character varying(255),
    "target_handle" character varying(255),
    "label" character varying(255),
    "condition" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_edges" OWNER TO "postgres";


COMMENT ON TABLE "public"."workflow_edges" IS 'Edges/connections in workflow diagrams';



COMMENT ON COLUMN "public"."workflow_edges"."workflow_id" IS 'The workflow this edge belongs to';



COMMENT ON COLUMN "public"."workflow_edges"."edge_id" IS 'The ReactFlow edge ID';



COMMENT ON COLUMN "public"."workflow_edges"."source_node_id" IS 'The source node ID';



COMMENT ON COLUMN "public"."workflow_edges"."target_node_id" IS 'The target node ID';



COMMENT ON COLUMN "public"."workflow_edges"."source_handle" IS 'The source handle ID';



COMMENT ON COLUMN "public"."workflow_edges"."target_handle" IS 'The target handle ID';



COMMENT ON COLUMN "public"."workflow_edges"."label" IS 'The edge label';



COMMENT ON COLUMN "public"."workflow_edges"."condition" IS 'Edge conditions and logic';



CREATE TABLE IF NOT EXISTS "public"."workflow_nodes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "node_id" character varying(255) NOT NULL,
    "type" "public"."node_type" NOT NULL,
    "position_x" integer NOT NULL,
    "position_y" integer NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_nodes" OWNER TO "postgres";


COMMENT ON TABLE "public"."workflow_nodes" IS 'Nodes in workflow diagrams';



COMMENT ON COLUMN "public"."workflow_nodes"."workflow_id" IS 'The workflow this node belongs to';



COMMENT ON COLUMN "public"."workflow_nodes"."node_id" IS 'The ReactFlow node ID';



COMMENT ON COLUMN "public"."workflow_nodes"."type" IS 'The type of node';



COMMENT ON COLUMN "public"."workflow_nodes"."position_x" IS 'X position of the node';



COMMENT ON COLUMN "public"."workflow_nodes"."position_y" IS 'Y position of the node';



COMMENT ON COLUMN "public"."workflow_nodes"."data" IS 'Node data (label, description, options, etc.)';



CREATE TABLE IF NOT EXISTS "public"."workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "agent_id" "uuid" NOT NULL,
    "status" "public"."workflow_status" DEFAULT 'draft'::"public"."workflow_status" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."workflows" OWNER TO "postgres";


COMMENT ON TABLE "public"."workflows" IS 'Visual workflow configurations for agents';



COMMENT ON COLUMN "public"."workflows"."name" IS 'The name of the workflow';



COMMENT ON COLUMN "public"."workflows"."description" IS 'The description of the workflow';



COMMENT ON COLUMN "public"."workflows"."agent_id" IS 'The agent this workflow belongs to';



COMMENT ON COLUMN "public"."workflows"."status" IS 'The current status of the workflow';



COMMENT ON COLUMN "public"."workflows"."version" IS 'The version number of the workflow';



COMMENT ON COLUMN "public"."workflows"."is_default" IS 'Whether this is the default workflow for the agent';



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agents_knowledge_bases"
    ADD CONSTRAINT "agents_knowledge_bases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_generations"
    ADD CONSTRAINT "audio_generations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."call_attempts"
    ADD CONSTRAINT "call_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_call_sid_key" UNIQUE ("call_sid");



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_executions"
    ADD CONSTRAINT "campaign_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_lead_lists"
    ADD CONSTRAINT "campaign_lead_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_lead_lists"
    ADD CONSTRAINT "campaign_lead_lists_unique" UNIQUE ("campaign_id", "lead_list_id");



ALTER TABLE ONLY "public"."campaign_leads"
    ADD CONSTRAINT "campaign_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_leads"
    ADD CONSTRAINT "campaign_leads_unique" UNIQUE ("campaign_id", "lead_id");



ALTER TABLE ONLY "public"."campaign_queue"
    ADD CONSTRAINT "campaign_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_events"
    ADD CONSTRAINT "conversation_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "knowledge_bases_elevenlabs_kb_id_key" UNIQUE ("elevenlabs_kb_id");



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_list_members"
    ADD CONSTRAINT "lead_list_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_list_members"
    ADD CONSTRAINT "lead_list_members_unique" UNIQUE ("lead_list_id", "lead_id");



ALTER TABLE ONLY "public"."lead_lists"
    ADD CONSTRAINT "lead_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_source_unique" UNIQUE ("business_id", "source", "source_id");



ALTER TABLE ONLY "public"."performance_metrics"
    ADD CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."status_updates"
    ADD CONSTRAINT "status_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_business_id_user_id_key" UNIQUE ("business_id", "user_id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agents_knowledge_bases"
    ADD CONSTRAINT "unique_agent_kb" UNIQUE ("agent_id", "knowledge_base_id");



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "unique_elevenlabs_kb_per_business" UNIQUE ("business_id", "elevenlabs_kb_id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_edges"
    ADD CONSTRAINT "workflow_edges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_edges"
    ADD CONSTRAINT "workflow_edges_workflow_id_edge_id_key" UNIQUE ("workflow_id", "edge_id");



ALTER TABLE ONLY "public"."workflow_nodes"
    ADD CONSTRAINT "workflow_nodes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_nodes"
    ADD CONSTRAINT "workflow_nodes_workflow_id_node_id_key" UNIQUE ("workflow_id", "node_id");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");



CREATE INDEX "conversations_call_sid_idx" ON "public"."conversations" USING "btree" ("call_sid");



CREATE INDEX "conversations_campaign_lead_idx" ON "public"."conversations" USING "btree" ("campaign_id", "lead_id");



CREATE UNIQUE INDEX "conversations_conversation_id_key" ON "public"."conversations" USING "btree" ("conversation_id") WHERE ("conversation_id" IS NOT NULL);



CREATE INDEX "idx_agents_business_id" ON "public"."agents" USING "btree" ("business_id");



CREATE INDEX "idx_agents_created_at" ON "public"."agents" USING "btree" ("created_at");



CREATE INDEX "idx_agents_elevenlabs_agent_id" ON "public"."agents" USING "btree" ("elevenlabs_agent_id");



CREATE INDEX "idx_agents_knowledge_bases_agent_id" ON "public"."agents_knowledge_bases" USING "btree" ("agent_id");



CREATE INDEX "idx_agents_knowledge_bases_kb_id" ON "public"."agents_knowledge_bases" USING "btree" ("knowledge_base_id");



CREATE INDEX "idx_agents_status" ON "public"."agents" USING "btree" ("status");



CREATE INDEX "idx_audio_generations_cache_key" ON "public"."audio_generations" USING "btree" ("cache_key");



CREATE INDEX "idx_audio_generations_campaign_id" ON "public"."audio_generations" USING "btree" ("campaign_id");



CREATE INDEX "idx_audio_generations_created_at" ON "public"."audio_generations" USING "btree" ("created_at");



CREATE INDEX "idx_audio_generations_status" ON "public"."audio_generations" USING "btree" ("status");



CREATE INDEX "idx_businesses_account_id" ON "public"."businesses" USING "btree" ("account_id");



CREATE INDEX "idx_businesses_created_at" ON "public"."businesses" USING "btree" ("created_at");



CREATE INDEX "idx_businesses_status" ON "public"."businesses" USING "btree" ("status");



CREATE INDEX "idx_call_attempts_campaign_id" ON "public"."call_attempts" USING "btree" ("campaign_id");



CREATE INDEX "idx_call_attempts_campaign_scheduled" ON "public"."call_attempts" USING "btree" ("campaign_id", "scheduled_at");



CREATE INDEX "idx_call_attempts_lead_id" ON "public"."call_attempts" USING "btree" ("lead_id");



CREATE INDEX "idx_call_attempts_next_attempt_at" ON "public"."call_attempts" USING "btree" ("next_attempt_at");



CREATE INDEX "idx_call_attempts_scheduled_at" ON "public"."call_attempts" USING "btree" ("scheduled_at");



CREATE INDEX "idx_call_logs_call_sid" ON "public"."call_logs" USING "btree" ("call_sid");



CREATE INDEX "idx_call_logs_campaign_id" ON "public"."call_logs" USING "btree" ("campaign_id");



CREATE INDEX "idx_call_logs_campaign_status" ON "public"."call_logs" USING "btree" ("campaign_id", "status");



CREATE INDEX "idx_call_logs_lead_id" ON "public"."call_logs" USING "btree" ("lead_id");



CREATE INDEX "idx_call_logs_queued_at" ON "public"."call_logs" USING "btree" ("queued_at");



CREATE INDEX "idx_call_logs_status" ON "public"."call_logs" USING "btree" ("status");



CREATE INDEX "idx_campaign_executions_campaign_id" ON "public"."campaign_executions" USING "btree" ("campaign_id");



CREATE INDEX "idx_campaign_executions_execution_node" ON "public"."campaign_executions" USING "btree" ("execution_node");



CREATE INDEX "idx_campaign_executions_started_at" ON "public"."campaign_executions" USING "btree" ("started_at");



CREATE INDEX "idx_campaign_executions_status" ON "public"."campaign_executions" USING "btree" ("status");



CREATE INDEX "idx_campaign_lead_lists_active" ON "public"."campaign_lead_lists" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_campaign_lead_lists_campaign" ON "public"."campaign_lead_lists" USING "btree" ("campaign_id");



CREATE INDEX "idx_campaign_lead_lists_list" ON "public"."campaign_lead_lists" USING "btree" ("lead_list_id");



CREATE INDEX "idx_campaign_lead_lists_priority" ON "public"."campaign_lead_lists" USING "btree" ("campaign_id", "priority");



CREATE INDEX "idx_campaign_leads_campaign" ON "public"."campaign_leads" USING "btree" ("campaign_id");



CREATE INDEX "idx_campaign_leads_lead" ON "public"."campaign_leads" USING "btree" ("lead_id");



CREATE INDEX "idx_campaign_leads_list" ON "public"."campaign_leads" USING "btree" ("lead_list_id");



CREATE INDEX "idx_campaign_leads_next_attempt" ON "public"."campaign_leads" USING "btree" ("next_attempt_at") WHERE ((("status")::"text" = ANY ((ARRAY['new'::character varying, 'queued'::character varying])::"text"[])) AND ("next_attempt_at" IS NOT NULL));



CREATE INDEX "idx_campaign_leads_status" ON "public"."campaign_leads" USING "btree" ("campaign_id", "status");



CREATE INDEX "idx_campaign_queue_campaign_status" ON "public"."campaign_queue" USING "btree" ("campaign_id", "status");



CREATE INDEX "idx_campaign_queue_processing_node" ON "public"."campaign_queue" USING "btree" ("processing_node");



CREATE INDEX "idx_campaign_queue_scheduled_for" ON "public"."campaign_queue" USING "btree" ("scheduled_for");



CREATE INDEX "idx_campaign_queue_status_priority" ON "public"."campaign_queue" USING "btree" ("status", "priority", "scheduled_for");



CREATE UNIQUE INDEX "idx_campaign_queue_unique_active_lead" ON "public"."campaign_queue" USING "btree" ("campaign_id", "lead_id") WHERE ("status" = ANY (ARRAY['pending'::"public"."queue_status", 'scheduled'::"public"."queue_status", 'processing'::"public"."queue_status"]));



CREATE INDEX "idx_campaigns_agent_id" ON "public"."campaigns" USING "btree" ("agent_id");



CREATE INDEX "idx_campaigns_business_id" ON "public"."campaigns" USING "btree" ("business_id");



CREATE INDEX "idx_campaigns_created_at" ON "public"."campaigns" USING "btree" ("created_at");



CREATE INDEX "idx_campaigns_status" ON "public"."campaigns" USING "btree" ("status");



CREATE INDEX "idx_conversation_events_conversation_id" ON "public"."conversation_events" USING "btree" ("conversation_id");



CREATE INDEX "idx_conversation_events_event_type" ON "public"."conversation_events" USING "btree" ("event_type");



CREATE INDEX "idx_conversation_events_sequence" ON "public"."conversation_events" USING "btree" ("conversation_id", "sequence_number");



CREATE INDEX "idx_conversation_events_started_at" ON "public"."conversation_events" USING "btree" ("started_at");



CREATE INDEX "idx_conversations_agent_id" ON "public"."conversations" USING "btree" ("agent_id");



CREATE INDEX "idx_conversations_campaign_id" ON "public"."conversations" USING "btree" ("campaign_id");



CREATE INDEX "idx_conversations_lead_id" ON "public"."conversations" USING "btree" ("lead_id");



CREATE INDEX "idx_conversations_started_at" ON "public"."conversations" USING "btree" ("started_at");



CREATE INDEX "idx_conversations_status" ON "public"."conversations" USING "btree" ("status");



CREATE INDEX "idx_integrations_business_id" ON "public"."integrations" USING "btree" ("business_id");



CREATE INDEX "idx_integrations_status" ON "public"."integrations" USING "btree" ("status");



CREATE INDEX "idx_integrations_type" ON "public"."integrations" USING "btree" ("type");



CREATE INDEX "idx_knowledge_bases_business_id" ON "public"."knowledge_bases" USING "btree" ("business_id");



CREATE INDEX "idx_knowledge_bases_created_at" ON "public"."knowledge_bases" USING "btree" ("created_at");



CREATE INDEX "idx_knowledge_bases_elevenlabs_kb_id" ON "public"."knowledge_bases" USING "btree" ("elevenlabs_kb_id");



CREATE INDEX "idx_lead_list_members_lead" ON "public"."lead_list_members" USING "btree" ("lead_id");



CREATE INDEX "idx_lead_list_members_list" ON "public"."lead_list_members" USING "btree" ("lead_list_id");



CREATE INDEX "idx_lead_lists_archived" ON "public"."lead_lists" USING "btree" ("is_archived");



CREATE INDEX "idx_lead_lists_business_id" ON "public"."lead_lists" USING "btree" ("business_id");



CREATE INDEX "idx_lead_lists_list_type" ON "public"."lead_lists" USING "btree" ("list_type");



CREATE INDEX "idx_lead_lists_name" ON "public"."lead_lists" USING "btree" ("business_id", "name");



CREATE INDEX "idx_lead_lists_tags" ON "public"."lead_lists" USING "gin" ("tags");



CREATE INDEX "idx_leads_business_id" ON "public"."leads" USING "btree" ("business_id");



CREATE INDEX "idx_leads_email" ON "public"."leads" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_leads_last_activity" ON "public"."leads" USING "btree" ("last_activity_at" DESC NULLS LAST);



CREATE INDEX "idx_leads_last_synced_at" ON "public"."leads" USING "btree" ("last_synced_at");



CREATE INDEX "idx_leads_lead_score" ON "public"."leads" USING "btree" ("lead_score" DESC);



CREATE INDEX "idx_leads_phone" ON "public"."leads" USING "btree" ("phone") WHERE ("phone" IS NOT NULL);



CREATE INDEX "idx_leads_quality_rating" ON "public"."leads" USING "btree" ("quality_rating");



CREATE INDEX "idx_leads_source" ON "public"."leads" USING "btree" ("business_id", "source");



CREATE INDEX "idx_leads_source_id" ON "public"."leads" USING "btree" ("source", "source_id");



CREATE INDEX "idx_leads_tags" ON "public"."leads" USING "gin" ("tags");



CREATE INDEX "idx_performance_metrics_campaign_id" ON "public"."performance_metrics" USING "btree" ("campaign_id");



CREATE INDEX "idx_performance_metrics_name_recorded" ON "public"."performance_metrics" USING "btree" ("metric_name", "recorded_at");



CREATE INDEX "idx_performance_metrics_recorded_at" ON "public"."performance_metrics" USING "btree" ("recorded_at");



CREATE INDEX "idx_performance_metrics_service_name" ON "public"."performance_metrics" USING "btree" ("service_name");



CREATE INDEX "idx_status_updates_account_id" ON "public"."status_updates" USING "btree" ("account_id");



CREATE INDEX "idx_status_updates_campaign_id" ON "public"."status_updates" USING "btree" ("campaign_id");



CREATE INDEX "idx_status_updates_created_at" ON "public"."status_updates" USING "btree" ("created_at");



CREATE INDEX "idx_status_updates_update_type" ON "public"."status_updates" USING "btree" ("update_type");



CREATE INDEX "idx_status_updates_websocket_sent" ON "public"."status_updates" USING "btree" ("websocket_sent");



CREATE INDEX "idx_sync_logs_business" ON "public"."sync_logs" USING "btree" ("business_id", "created_at" DESC);



CREATE INDEX "idx_sync_logs_created_at" ON "public"."sync_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_sync_logs_integration" ON "public"."sync_logs" USING "btree" ("integration_id", "created_at" DESC);



CREATE INDEX "idx_sync_logs_status" ON "public"."sync_logs" USING "btree" ("sync_status", "created_at" DESC);



CREATE INDEX "idx_team_members_business_id" ON "public"."team_members" USING "btree" ("business_id");



CREATE INDEX "idx_team_members_role" ON "public"."team_members" USING "btree" ("role");



CREATE INDEX "idx_team_members_status" ON "public"."team_members" USING "btree" ("status");



CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_webhook_events_call_sid" ON "public"."webhook_events" USING "btree" ("call_sid");



CREATE INDEX "idx_webhook_events_campaign_id" ON "public"."webhook_events" USING "btree" ("campaign_id");



CREATE INDEX "idx_webhook_events_event_type" ON "public"."webhook_events" USING "btree" ("event_type");



CREATE INDEX "idx_webhook_events_processed" ON "public"."webhook_events" USING "btree" ("processed");



CREATE INDEX "idx_webhook_events_received_at" ON "public"."webhook_events" USING "btree" ("received_at");



CREATE INDEX "idx_workflow_edges_source_target" ON "public"."workflow_edges" USING "btree" ("source_node_id", "target_node_id");



CREATE INDEX "idx_workflow_edges_workflow_id" ON "public"."workflow_edges" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflow_nodes_type" ON "public"."workflow_nodes" USING "btree" ("type");



CREATE INDEX "idx_workflow_nodes_workflow_id" ON "public"."workflow_nodes" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflows_agent_id" ON "public"."workflows" USING "btree" ("agent_id");



CREATE INDEX "idx_workflows_is_default" ON "public"."workflows" USING "btree" ("is_default");



CREATE INDEX "idx_workflows_status" ON "public"."workflows" USING "btree" ("status");



CREATE OR REPLACE VIEW "public"."lead_lists_with_campaigns" WITH ("security_invoker"='on') AS
 SELECT "ll"."id",
    "ll"."business_id",
    "ll"."name",
    "ll"."description",
    "ll"."color",
    "ll"."list_type",
    "ll"."source",
    "ll"."source_id",
    "ll"."filter_criteria",
    "ll"."lead_count",
    "ll"."last_updated_at",
    "ll"."created_at",
    "ll"."updated_at",
    "ll"."created_by",
    "ll"."updated_by",
    "ll"."is_archived",
    "ll"."tags",
    "ll"."metadata",
    COALESCE("json_agg"("json_build_object"('campaign_id', "c"."id", 'campaign_name', "c"."name", 'campaign_status', "c"."status", 'assigned_at', "cll"."assigned_at", 'priority', "cll"."priority", 'is_active', "cll"."is_active") ORDER BY "cll"."assigned_at" DESC) FILTER (WHERE ("c"."id" IS NOT NULL)), '[]'::json) AS "campaigns"
   FROM (("public"."lead_lists" "ll"
     LEFT JOIN "public"."campaign_lead_lists" "cll" ON (("ll"."id" = "cll"."lead_list_id")))
     LEFT JOIN "public"."campaigns" "c" ON (("cll"."campaign_id" = "c"."id")))
  GROUP BY "ll"."id";



CREATE OR REPLACE VIEW "public"."leads_with_lists" WITH ("security_invoker"='on') AS
 SELECT "l"."id",
    "l"."business_id",
    "l"."source",
    "l"."source_id",
    "l"."source_metadata",
    "l"."first_name",
    "l"."last_name",
    "l"."email",
    "l"."phone",
    "l"."mobile_phone",
    "l"."street",
    "l"."city",
    "l"."state",
    "l"."postal_code",
    "l"."country",
    "l"."company",
    "l"."title",
    "l"."department",
    "l"."lead_source",
    "l"."description",
    "l"."owner_id",
    "l"."do_not_call",
    "l"."do_not_email",
    "l"."email_opt_out",
    "l"."timezone",
    "l"."preferred_language",
    "l"."tags",
    "l"."custom_fields",
    "l"."last_synced_at",
    "l"."sync_status",
    "l"."sync_error",
    "l"."created_at",
    "l"."updated_at",
    "l"."created_by",
    "l"."updated_by",
    "l"."status",
    "l"."notes",
    "l"."dnc",
    "l"."lead_score",
    "l"."quality_rating",
    "l"."last_activity_at",
    COALESCE("json_agg"("json_build_object"('list_id', "ll"."id", 'list_name', "ll"."name", 'added_at', "llm"."added_at") ORDER BY "llm"."added_at" DESC) FILTER (WHERE ("ll"."id" IS NOT NULL)), '[]'::json) AS "lists"
   FROM (("public"."leads" "l"
     LEFT JOIN "public"."lead_list_members" "llm" ON (("l"."id" = "llm"."lead_id")))
     LEFT JOIN "public"."lead_lists" "ll" ON (("llm"."lead_list_id" = "ll"."id")))
  GROUP BY "l"."id";



CREATE OR REPLACE TRIGGER "auto_calculate_sync_duration" BEFORE UPDATE ON "public"."sync_logs" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_sync_duration"();



CREATE OR REPLACE TRIGGER "handle_updated_at_agents" BEFORE UPDATE ON "public"."agents" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_businesses" BEFORE UPDATE ON "public"."businesses" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_campaigns" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_conversations" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_integrations" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_team_members" BEFORE UPDATE ON "public"."team_members" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_workflow_edges" BEFORE UPDATE ON "public"."workflow_edges" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_workflow_nodes" BEFORE UPDATE ON "public"."workflow_nodes" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at_workflows" BEFORE UPDATE ON "public"."workflows" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "protect_account_fields" BEFORE UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "kit"."protect_account_fields"();



CREATE OR REPLACE TRIGGER "trigger_agents_timestamp" BEFORE UPDATE ON "public"."agents" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_audio_generations_timestamp" BEFORE UPDATE ON "public"."audio_generations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_businesses_timestamp" BEFORE UPDATE ON "public"."businesses" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_call_logs_stats_update" AFTER INSERT OR DELETE OR UPDATE ON "public"."call_logs" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_campaign_stats"();



CREATE OR REPLACE TRIGGER "trigger_call_logs_timestamp" BEFORE UPDATE ON "public"."call_logs" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_campaign_executions_timestamp" BEFORE UPDATE ON "public"."campaign_executions" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_campaign_queue_timestamp" BEFORE UPDATE ON "public"."campaign_queue" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_campaigns_timestamp" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_conversations_stats_update" AFTER INSERT OR DELETE OR UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_campaign_stats"();



CREATE OR REPLACE TRIGGER "trigger_conversations_timestamp" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_integrations_timestamp" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_lead_lists_updated_at" BEFORE UPDATE ON "public"."lead_lists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_leads_updated_at" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_team_members_timestamp" BEFORE UPDATE ON "public"."team_members" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_update_campaign_lead_list_stats" AFTER INSERT OR DELETE OR UPDATE ON "public"."campaign_leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_campaign_lead_list_stats"();



CREATE OR REPLACE TRIGGER "trigger_update_lead_list_count" AFTER INSERT OR DELETE ON "public"."lead_list_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_lead_list_count"();



CREATE OR REPLACE TRIGGER "trigger_workflow_edges_timestamp" BEFORE UPDATE ON "public"."workflow_edges" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_workflow_nodes_timestamp" BEFORE UPDATE ON "public"."workflow_nodes" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_workflows_timestamp" BEFORE UPDATE ON "public"."workflows" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_timestamp"();



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."agents_knowledge_bases"
    ADD CONSTRAINT "agents_knowledge_bases_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agents_knowledge_bases"
    ADD CONSTRAINT "agents_knowledge_bases_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."audio_generations"
    ADD CONSTRAINT "audio_generations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_generations"
    ADD CONSTRAINT "audio_generations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_generations"
    ADD CONSTRAINT "audio_generations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."call_attempts"
    ADD CONSTRAINT "call_attempts_audio_generation_id_fkey" FOREIGN KEY ("audio_generation_id") REFERENCES "public"."audio_generations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."call_attempts"
    ADD CONSTRAINT "call_attempts_call_log_id_fkey" FOREIGN KEY ("call_log_id") REFERENCES "public"."call_logs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."call_attempts"
    ADD CONSTRAINT "call_attempts_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."campaign_executions"
    ADD CONSTRAINT "campaign_executions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_executions"
    ADD CONSTRAINT "campaign_executions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."campaign_lead_lists"
    ADD CONSTRAINT "campaign_lead_lists_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."campaign_lead_lists"
    ADD CONSTRAINT "campaign_lead_lists_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_lead_lists"
    ADD CONSTRAINT "campaign_lead_lists_lead_list_id_fkey" FOREIGN KEY ("lead_list_id") REFERENCES "public"."lead_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_leads"
    ADD CONSTRAINT "campaign_leads_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_leads"
    ADD CONSTRAINT "campaign_leads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_leads"
    ADD CONSTRAINT "campaign_leads_lead_list_id_fkey" FOREIGN KEY ("lead_list_id") REFERENCES "public"."lead_lists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaign_queue"
    ADD CONSTRAINT "campaign_queue_audio_generation_id_fkey" FOREIGN KEY ("audio_generation_id") REFERENCES "public"."audio_generations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaign_queue"
    ADD CONSTRAINT "campaign_queue_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."conversation_events"
    ADD CONSTRAINT "conversation_events_call_log_id_fkey" FOREIGN KEY ("call_log_id") REFERENCES "public"."call_logs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversation_events"
    ADD CONSTRAINT "conversation_events_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "knowledge_bases_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "knowledge_bases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knowledge_bases"
    ADD CONSTRAINT "knowledge_bases_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lead_list_members"
    ADD CONSTRAINT "lead_list_members_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."lead_list_members"
    ADD CONSTRAINT "lead_list_members_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_list_members"
    ADD CONSTRAINT "lead_list_members_lead_list_id_fkey" FOREIGN KEY ("lead_list_id") REFERENCES "public"."lead_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_lists"
    ADD CONSTRAINT "lead_lists_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_lists"
    ADD CONSTRAINT "lead_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."lead_lists"
    ADD CONSTRAINT "lead_lists_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."performance_metrics"
    ADD CONSTRAINT "performance_metrics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."status_updates"
    ADD CONSTRAINT "status_updates_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."status_updates"
    ADD CONSTRAINT "status_updates_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_call_log_id_fkey" FOREIGN KEY ("call_log_id") REFERENCES "public"."call_logs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workflow_edges"
    ADD CONSTRAINT "workflow_edges_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_nodes"
    ADD CONSTRAINT "workflow_nodes_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin team members can insert sync logs" ON "public"."sync_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."business_id" = "sync_logs"."business_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "Admin team members can update sync logs" ON "public"."sync_logs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."business_id" = "sync_logs"."business_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."business_id" = "sync_logs"."business_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "Service role can manage all sync logs" ON "public"."sync_logs" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Team members can view sync logs for their business" ON "public"."sync_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."business_id" = "sync_logs"."business_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can create agent knowledge base relationships" ON "public"."agents_knowledge_bases" FOR INSERT WITH CHECK ((("agent_id" IN ( SELECT "agents"."id"
   FROM "public"."agents"
  WHERE ("agents"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE ("team_members"."user_id" = "auth"."uid"()))))) AND ("knowledge_base_id" IN ( SELECT "knowledge_bases"."id"
   FROM "public"."knowledge_bases"
  WHERE ("knowledge_bases"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE ("team_members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can create knowledge bases for their business" ON "public"."knowledge_bases" FOR INSERT WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete agent knowledge base relationships" ON "public"."agents_knowledge_bases" FOR DELETE USING (("agent_id" IN ( SELECT "agents"."id"
   FROM "public"."agents"
  WHERE ("agents"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE ("team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can delete campaign lead lists in their business" ON "public"."campaign_lead_lists" FOR DELETE USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can delete campaign leads in their business" ON "public"."campaign_leads" FOR DELETE USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can delete knowledge bases for their business" ON "public"."knowledge_bases" FOR DELETE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete lead list members in their business" ON "public"."lead_list_members" FOR DELETE USING (("lead_list_id" IN ( SELECT "lead_lists"."id"
   FROM "public"."lead_lists"
  WHERE ("lead_lists"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can delete lead lists in their business" ON "public"."lead_lists" FOR DELETE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can delete leads in their business" ON "public"."leads" FOR DELETE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can delete workflow edges for their business" ON "public"."workflow_edges" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_edges"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can delete workflow nodes for their business" ON "public"."workflow_nodes" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_nodes"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can delete workflows for their business" ON "public"."workflows" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM (("public"."agents" "a"
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("a"."id" = "workflows"."agent_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



COMMENT ON POLICY "Users can delete workflows for their business" ON "public"."workflows" IS 'RLS policy: Users can only delete workflows for agents in their business';



CREATE POLICY "Users can insert campaign lead lists in their business" ON "public"."campaign_lead_lists" FOR INSERT WITH CHECK (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can insert campaign leads in their business" ON "public"."campaign_leads" FOR INSERT WITH CHECK (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can insert lead list members in their business" ON "public"."lead_list_members" FOR INSERT WITH CHECK (("lead_list_id" IN ( SELECT "lead_lists"."id"
   FROM "public"."lead_lists"
  WHERE ("lead_lists"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can insert lead lists in their business" ON "public"."lead_lists" FOR INSERT WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can insert leads in their business" ON "public"."leads" FOR INSERT WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can insert workflow edges for their business" ON "public"."workflow_edges" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_edges"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can insert workflow nodes for their business" ON "public"."workflow_nodes" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_nodes"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can insert workflows for their business" ON "public"."workflows" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."agents" "a"
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("a"."id" = "workflows"."agent_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



COMMENT ON POLICY "Users can insert workflows for their business" ON "public"."workflows" IS 'RLS policy: Users can only insert workflows for agents in their business';



CREATE POLICY "Users can update campaign lead lists in their business" ON "public"."campaign_lead_lists" FOR UPDATE USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can update campaign leads in their business" ON "public"."campaign_leads" FOR UPDATE USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can update knowledge bases for their business" ON "public"."knowledge_bases" FOR UPDATE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"())))) WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update lead lists in their business" ON "public"."lead_lists" FOR UPDATE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can update leads in their business" ON "public"."leads" FOR UPDATE USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can update workflow edges for their business" ON "public"."workflow_edges" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_edges"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can update workflow nodes for their business" ON "public"."workflow_nodes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_nodes"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can update workflows for their business" ON "public"."workflows" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."agents" "a"
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("a"."id" = "workflows"."agent_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



COMMENT ON POLICY "Users can update workflows for their business" ON "public"."workflows" IS 'RLS policy: Users can only update workflows for agents in their business';



CREATE POLICY "Users can view agent knowledge base relationships" ON "public"."agents_knowledge_bases" FOR SELECT USING (("agent_id" IN ( SELECT "agents"."id"
   FROM "public"."agents"
  WHERE ("agents"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE ("team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view campaign lead lists in their business" ON "public"."campaign_lead_lists" FOR SELECT USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can view campaign leads in their business" ON "public"."campaign_leads" FOR SELECT USING (("campaign_id" IN ( SELECT "c"."id"
   FROM "public"."campaigns" "c"
  WHERE ("c"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can view knowledge bases for their business" ON "public"."knowledge_bases" FOR SELECT USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view lead list members in their business" ON "public"."lead_list_members" FOR SELECT USING (("lead_list_id" IN ( SELECT "lead_lists"."id"
   FROM "public"."lead_lists"
  WHERE ("lead_lists"."business_id" IN ( SELECT "team_members"."business_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))))));



CREATE POLICY "Users can view lead lists in their business" ON "public"."lead_lists" FOR SELECT USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can view leads in their business" ON "public"."leads" FOR SELECT USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can view workflow edges for their business" ON "public"."workflow_edges" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_edges"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can view workflow nodes for their business" ON "public"."workflow_nodes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((("public"."workflows" "w"
     JOIN "public"."agents" "a" ON (("w"."agent_id" = "a"."id")))
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("w"."id" = "workflow_nodes"."workflow_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "Users can view workflows for their business" ON "public"."workflows" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."agents" "a"
     JOIN "public"."businesses" "b" ON (("a"."business_id" = "b"."id")))
     JOIN "public"."team_members" "tm" ON (("b"."id" = "tm"."business_id")))
  WHERE (("a"."id" = "workflows"."agent_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



COMMENT ON POLICY "Users can view workflows for their business" ON "public"."workflows" IS 'RLS policy: Users can only view workflows for agents in their business';



ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "accounts_read" ON "public"."accounts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "accounts_update" ON "public"."accounts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."agents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agents_delete" ON "public"."agents" FOR DELETE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "agents_insert" ON "public"."agents" FOR INSERT TO "authenticated" WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



ALTER TABLE "public"."agents_knowledge_bases" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agents_read" ON "public"."agents" FOR SELECT TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "agents_update" ON "public"."agents" FOR UPDATE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"])))))) WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



ALTER TABLE "public"."audio_generations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audio_generations_insert" ON "public"."audio_generations" FOR INSERT TO "authenticated", "service_role" WITH CHECK ((("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))) OR ("auth"."role"() = 'service_role'::"text") OR ("campaign_id" IS NULL)));



CREATE POLICY "audio_generations_read" ON "public"."audio_generations" FOR SELECT TO "authenticated" USING ((("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))) OR ("campaign_id" IS NULL)));



ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "businesses_delete" ON "public"."businesses" FOR DELETE TO "authenticated" USING (("id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = 'owner'::"public"."team_role")))));



CREATE POLICY "businesses_insert" ON "public"."businesses" FOR INSERT TO "authenticated" WITH CHECK (("account_id" = "auth"."uid"()));



CREATE POLICY "businesses_read" ON "public"."businesses" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "businesses_update" ON "public"."businesses" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"])))))) WITH CHECK (("id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



ALTER TABLE "public"."call_attempts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "call_attempts_all" ON "public"."call_attempts" TO "service_role";



CREATE POLICY "call_attempts_read" ON "public"."call_attempts" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))));



ALTER TABLE "public"."call_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "call_logs_insert" ON "public"."call_logs" FOR INSERT TO "authenticated", "service_role" WITH CHECK ((("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))) OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "call_logs_read" ON "public"."call_logs" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))));



CREATE POLICY "call_logs_update" ON "public"."call_logs" FOR UPDATE TO "authenticated", "service_role" USING ((("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))) OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."campaign_executions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campaign_executions_all" ON "public"."campaign_executions" TO "service_role";



CREATE POLICY "campaign_executions_read" ON "public"."campaign_executions" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))));



ALTER TABLE "public"."campaign_lead_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campaign_queue_all" ON "public"."campaign_queue" TO "service_role";



CREATE POLICY "campaign_queue_read" ON "public"."campaign_queue" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."businesses" "b" ON (("c"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))));



ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campaigns_delete" ON "public"."campaigns" FOR DELETE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "campaigns_insert" ON "public"."campaigns" FOR INSERT TO "authenticated" WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



CREATE POLICY "campaigns_read" ON "public"."campaigns" FOR SELECT TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "campaigns_update" ON "public"."campaigns" FOR UPDATE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"])))))) WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



ALTER TABLE "public"."conversation_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversation_events_all" ON "public"."conversation_events" TO "service_role";



CREATE POLICY "conversation_events_read" ON "public"."conversation_events" FOR SELECT TO "authenticated" USING (("conversation_id" IN ( SELECT "c"."id"
   FROM (("public"."conversations" "c"
     JOIN "public"."campaigns" "camp" ON (("c"."campaign_id" = "camp"."id")))
     JOIN "public"."businesses" "b" ON (("camp"."business_id" = "b"."id")))
  WHERE ("b"."account_id" = "auth"."uid"()))));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_delete" ON "public"."conversations" FOR DELETE TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."team_members" "tm" ON (("c"."business_id" = "tm"."business_id")))
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "conversations_insert" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."team_members" "tm" ON (("c"."business_id" = "tm"."business_id")))
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



CREATE POLICY "conversations_read" ON "public"."conversations" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."team_members" "tm" ON (("c"."business_id" = "tm"."business_id")))
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "conversations_update" ON "public"."conversations" FOR UPDATE TO "authenticated" USING (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."team_members" "tm" ON (("c"."business_id" = "tm"."business_id")))
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"])))))) WITH CHECK (("campaign_id" IN ( SELECT "c"."id"
   FROM ("public"."campaigns" "c"
     JOIN "public"."team_members" "tm" ON (("c"."business_id" = "tm"."business_id")))
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"public"."team_member_status") AND ("tm"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role", 'member'::"public"."team_role"]))))));



ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "integrations_delete" ON "public"."integrations" FOR DELETE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "integrations_insert" ON "public"."integrations" FOR INSERT TO "authenticated" WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



CREATE POLICY "integrations_read" ON "public"."integrations" FOR SELECT TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status")))));



CREATE POLICY "integrations_update" ON "public"."integrations" FOR UPDATE TO "authenticated" USING (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"])))))) WITH CHECK (("business_id" IN ( SELECT "team_members"."business_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"public"."team_member_status") AND ("team_members"."role" = ANY (ARRAY['owner'::"public"."team_role", 'admin'::"public"."team_role"]))))));



ALTER TABLE "public"."knowledge_bases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_list_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."performance_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "performance_metrics_all" ON "public"."performance_metrics" TO "service_role";



ALTER TABLE "public"."status_updates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "status_updates_all" ON "public"."status_updates" TO "service_role";



CREATE POLICY "status_updates_read" ON "public"."status_updates" FOR SELECT TO "authenticated" USING (("account_id" = "auth"."uid"()));



ALTER TABLE "public"."sync_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members_delete" ON "public"."team_members" FOR DELETE TO "authenticated" USING (("business_id" IN ( SELECT "b"."id"
   FROM "public"."businesses" "b"
  WHERE ("b"."account_id" = "auth"."uid"()))));



CREATE POLICY "team_members_insert" ON "public"."team_members" FOR INSERT TO "authenticated" WITH CHECK (("business_id" IN ( SELECT "b"."id"
   FROM "public"."businesses" "b"
  WHERE ("b"."account_id" = "auth"."uid"()))));



CREATE POLICY "team_members_read" ON "public"."team_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "team_members_update" ON "public"."team_members" FOR UPDATE TO "authenticated" USING (("business_id" IN ( SELECT "b"."id"
   FROM "public"."businesses" "b"
  WHERE ("b"."account_id" = "auth"."uid"())))) WITH CHECK (("business_id" IN ( SELECT "b"."id"
   FROM "public"."businesses" "b"
  WHERE ("b"."account_id" = "auth"."uid"()))));



ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "webhook_events_all" ON "public"."webhook_events" TO "service_role";



ALTER TABLE "public"."workflow_edges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_nodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflows" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "internal" TO "authenticated";
GRANT USAGE ON SCHEMA "internal" TO "service_role";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";







































































































































































































































REVOKE ALL ON FUNCTION "internal"."invoke_conversation_orchestrator"("payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "internal"."invoke_conversation_orchestrator"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "internal"."invoke_conversation_orchestrator"("payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "internal"."invoke_sync_salesforce_leads"("payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "internal"."invoke_sync_salesforce_leads"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "internal"."invoke_sync_salesforce_leads"("payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "kit"."get_storage_filename_as_uuid"("name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "kit"."get_storage_filename_as_uuid"("name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "kit"."get_storage_filename_as_uuid"("name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "kit"."handle_update_user_email"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "kit"."new_user_created_setup"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "kit"."protect_account_fields"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."add_lead_list_to_campaign"("p_campaign_id" "uuid", "p_lead_list_id" "uuid", "p_priority" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."calculate_sync_duration"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_sync_duration"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_campaign_make_calls"("p_campaign_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_campaign_make_calls"("p_campaign_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."create_lead_list_from_csv"("p_business_id" "uuid", "p_list_name" character varying, "p_leads" "jsonb") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_latest_sync_status"("p_integration_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_latest_sync_status"("p_integration_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_latest_sync_status"("p_integration_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_next_queued_call"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_next_queued_call"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_next_queued_call"("p_campaign_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_next_queued_call"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."moddatetime"() TO "postgres";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "anon";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trigger_campaign_orchestrator"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trigger_campaign_orchestrator"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trigger_update_campaign_stats"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trigger_update_campaign_stats"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trigger_update_timestamp"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trigger_update_timestamp"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_campaign_execution_stats"("p_campaign_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_campaign_execution_stats"("p_campaign_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_campaign_lead_list_stats"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_campaign_lead_list_stats"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_lead_list_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_lead_list_count"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."accounts" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."agents" TO "anon";
GRANT ALL ON TABLE "public"."agents" TO "authenticated";
GRANT ALL ON TABLE "public"."agents" TO "service_role";



GRANT ALL ON TABLE "public"."agents_knowledge_bases" TO "anon";
GRANT ALL ON TABLE "public"."agents_knowledge_bases" TO "authenticated";
GRANT ALL ON TABLE "public"."agents_knowledge_bases" TO "service_role";



GRANT ALL ON TABLE "public"."audio_generations" TO "anon";
GRANT ALL ON TABLE "public"."audio_generations" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_generations" TO "service_role";



GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";



GRANT ALL ON TABLE "public"."call_attempts" TO "anon";
GRANT ALL ON TABLE "public"."call_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."call_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."call_logs" TO "anon";
GRANT ALL ON TABLE "public"."call_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."call_logs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_executions" TO "anon";
GRANT ALL ON TABLE "public"."campaign_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_executions" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_lead_lists" TO "anon";
GRANT ALL ON TABLE "public"."campaign_lead_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_lead_lists" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_leads" TO "anon";
GRANT ALL ON TABLE "public"."campaign_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_leads" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."lead_lists" TO "anon";
GRANT ALL ON TABLE "public"."lead_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_lists" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_lead_lists_with_stats" TO "anon";
GRANT ALL ON TABLE "public"."campaign_lead_lists_with_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_lead_lists_with_stats" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_queue" TO "anon";
GRANT ALL ON TABLE "public"."campaign_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_queue" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_events" TO "anon";
GRANT ALL ON TABLE "public"."conversation_events" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_events" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."daily_call_volume" TO "anon";
GRANT ALL ON TABLE "public"."daily_call_volume" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_call_volume" TO "service_role";



GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_bases" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_bases" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_bases" TO "service_role";



GRANT ALL ON TABLE "public"."lead_list_members" TO "anon";
GRANT ALL ON TABLE "public"."lead_list_members" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_list_members" TO "service_role";



GRANT ALL ON TABLE "public"."lead_lists_with_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."lead_lists_with_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_lists_with_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."leads_with_lists" TO "anon";
GRANT ALL ON TABLE "public"."leads_with_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_with_lists" TO "service_role";



GRANT ALL ON TABLE "public"."performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."status_updates" TO "anon";
GRANT ALL ON TABLE "public"."status_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."status_updates" TO "service_role";



GRANT ALL ON TABLE "public"."sync_logs" TO "anon";
GRANT ALL ON TABLE "public"."sync_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_logs" TO "service_role";



GRANT ALL ON TABLE "public"."sync_logs_summary" TO "anon";
GRANT ALL ON TABLE "public"."sync_logs_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_logs_summary" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_edges" TO "anon";
GRANT ALL ON TABLE "public"."workflow_edges" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_edges" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_nodes" TO "anon";
GRANT ALL ON TABLE "public"."workflow_nodes" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_nodes" TO "service_role";



GRANT ALL ON TABLE "public"."workflows" TO "anon";
GRANT ALL ON TABLE "public"."workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."workflows" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" REVOKE ALL ON FUNCTIONS FROM PUBLIC;



























RESET ALL;
