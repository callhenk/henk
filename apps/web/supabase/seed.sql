-- Comprehensive seed file for LOCAL development database
-- This creates test user, business, agents, campaigns, and sample data

-- ============================================================================
-- 1. CREATE TEST USER
-- ============================================================================
DO $$
DECLARE
  test_user_id uuid := 'ac52e4d9-d3aa-460b-aeec-f7a52bc6b4ea'; -- Fixed UUID for consistency
  test_business_id uuid;
  agent1_id uuid;
  agent2_id uuid;
  agent3_id uuid;
  campaign1_id uuid;
  lead_list1_id uuid;
BEGIN
  -- Delete existing user if exists (for clean re-seeding)
  DELETE FROM auth.users WHERE email = 'cyrus@callhenk.com';

  -- Create test user in auth.users
  -- Password: Test123? (hashed)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    'cyrus@callhenk.com',
    crypt('Test123?', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Cyrus David"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_user_id::text,
    test_user_id,
    format('{"sub":"%s","email":"%s"}', test_user_id, 'cyrus@callhenk.com')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Created test user: cyrus@callhenk.com (password: Test123?)';

  -- Delete any auto-created business from the trigger (we'll create our own with seed data)
  DELETE FROM public.businesses
  WHERE account_id = test_user_id
  AND name LIKE '%''s Organization';

  -- ============================================================================
  -- 2. CREATE ACCOUNT (trigger should do this, but doing it explicitly)
  -- ============================================================================
  INSERT INTO public.accounts (
    id,
    name,
    email,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'Cyrus David',
    'cyrus@callhenk.com',
    test_user_id,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET name = 'Cyrus David', email = 'cyrus@callhenk.com';

  -- ============================================================================
  -- 3. CREATE BUSINESS
  -- ============================================================================
  INSERT INTO public.businesses (
    name,
    description,
    account_id,
    status,
    industry,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    'Henk Demo Organization',
    'Demo fundraising organization with sample campaigns',
    test_user_id,
    'active',
    'Non-profit',
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO test_business_id;

  -- Add user as team member (owner)
  INSERT INTO public.team_members (
    business_id,
    user_id,
    role,
    status,
    accepted_at,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    test_user_id,
    'owner',
    'active',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Created business: % (ID: %)', 'Henk Demo Organization', test_business_id;

  -- ============================================================================
  -- 4. CREATE AGENTS
  -- ============================================================================

  -- Agent 1: General Fundraising Agent
  INSERT INTO public.agents (
    business_id,
    name,
    description,
    status,
    voice_type,
    voice_id,
    speaking_tone,
    organization_info,
    donor_context,
    starting_message,
    personality,
    enabled_tools,
    transfer_rules,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Sarah - General Fundraising',
    'Friendly and engaging fundraising agent for general campaigns',
    'active',
    'ai_generated',
    'EXAVITQu4vr4xnSDxMaL', -- ElevenLabs voice ID (Rachel)
    'Warm and Professional',
    'Henk Demo Organization is a leading non-profit dedicated to making a difference in our community through various fundraising campaigns.',
    'Our donors are passionate supporters who care deeply about our mission. They appreciate personalized communication and updates on how their contributions make an impact.',
    'Hi, this is Sarah calling from Henk Demo Organization. I hope I''m catching you at a good time?',
    'Friendly, empathetic, and professional. Excellent at building rapport while being respectful of people''s time.',
    '["end_call", "skip_turn"]',
    '{"transfers": []}',
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO agent1_id;

  -- Agent 2: Major Donor Specialist
  INSERT INTO public.agents (
    business_id,
    name,
    description,
    status,
    voice_type,
    voice_id,
    speaking_tone,
    organization_info,
    donor_context,
    starting_message,
    personality,
    enabled_tools,
    transfer_rules,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Michael - Major Donor Specialist',
    'Professional agent specialized in major donor relationships',
    'active',
    'ai_generated',
    'pNInz6obpgDQGcFmaJgB', -- ElevenLabs voice ID (Adam)
    'Professional and Sophisticated',
    'Henk Demo Organization has been transforming lives for over 20 years, with major donors playing a crucial role in our most impactful programs.',
    'Major donors are invested in long-term impact. They value detailed information about program outcomes, financial transparency, and exclusive engagement opportunities.',
    'Good afternoon, this is Michael from Henk Demo Organization. I wanted to personally reach out regarding our transformative new initiative.',
    'Sophisticated, detail-oriented, and relationship-focused. Excellent at articulating complex impact metrics and building trust with high-value donors.',
    '["end_call", "skip_turn", "transfer_to_agent"]',
    format('{"transfers": [{"agent_id": "%s", "condition": "Donor asks about general campaign information or prefers a different representative", "delay_ms": 0, "transfer_message": "Let me connect you with our general fundraising team who can help you with that.", "enable_transferred_agent_first_message": true}]}', agent1_id)::jsonb,
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO agent2_id;

  -- Agent 3: Event Fundraising Agent
  INSERT INTO public.agents (
    business_id,
    name,
    description,
    status,
    voice_type,
    voice_id,
    speaking_tone,
    organization_info,
    donor_context,
    starting_message,
    personality,
    enabled_tools,
    transfer_rules,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Emma - Event Coordinator',
    'Enthusiastic agent for event-based fundraising campaigns',
    'active',
    'ai_generated',
    'MF3mGyEYCl7XYWbV9V6O', -- ElevenLabs voice ID (Elli)
    'Energetic and Enthusiastic',
    'Our annual fundraising gala is the highlight of our year, bringing together supporters for an unforgettable evening of impact and celebration.',
    'Event attendees are socially engaged, enjoy networking, and appreciate exclusive experiences. They often become long-term supporters after attending events.',
    'Hi there! This is Emma from Henk Demo Organization, and I''m so excited to tell you about our upcoming gala event!',
    'Enthusiastic, engaging, and detail-oriented about event logistics. Creates excitement while being informative.',
    '["end_call", "skip_turn", "voicemail_detection"]',
    '{"transfers": []}',
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO agent3_id;

  RAISE NOTICE 'Created 3 agents: Sarah (%), Michael (%), Emma (%)', agent1_id, agent2_id, agent3_id;

  -- ============================================================================
  -- 5. CREATE SAMPLE LEAD LIST
  -- ============================================================================
  INSERT INTO public.lead_lists (
    business_id,
    name,
    description,
    list_type,
    lead_count,
    is_archived,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Demo Donor Prospects',
    'Sample list of donor prospects for testing',
    'static',
    5,
    false,
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO lead_list1_id;

  -- Add sample leads
  WITH sample_leads AS (
    INSERT INTO public.leads (
      business_id,
      first_name,
      last_name,
      email,
      phone,
      status,
      source,
      created_by,
      created_at,
      updated_at
    ) VALUES
      (test_business_id, 'John', 'Smith', 'john.smith@example.com', '+1-555-0101', 'new', 'manual', test_user_id, now(), now()),
      (test_business_id, 'Jane', 'Doe', 'jane.doe@example.com', '+1-555-0102', 'new', 'manual', test_user_id, now(), now()),
      (test_business_id, 'Robert', 'Johnson', 'robert.j@example.com', '+1-555-0103', 'new', 'manual', test_user_id, now(), now()),
      (test_business_id, 'Maria', 'Garcia', 'maria.garcia@example.com', '+1-555-0104', 'contacted', 'manual', test_user_id, now(), now()),
      (test_business_id, 'David', 'Williams', 'david.w@example.com', '+1-555-0105', 'qualified', 'manual', test_user_id, now(), now())
    RETURNING id
  )
  INSERT INTO public.lead_list_members (
    lead_list_id,
    lead_id,
    added_by,
    added_at
  )
  SELECT lead_list1_id, id, test_user_id, now()
  FROM sample_leads;

  RAISE NOTICE 'Created lead list with 5 sample leads';

  -- ============================================================================
  -- 6. CREATE SAMPLE CAMPAIGNS
  -- ============================================================================

  -- Campaign 1: Annual Fund Drive
  INSERT INTO public.campaigns (
    business_id,
    name,
    description,
    agent_id,
    status,
    script,
    goal_metric,
    budget,
    audience_contact_count,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Annual Fund Drive 2025',
    'Our yearly fundraising campaign to support core programs and operations',
    agent1_id,
    'draft',
    'Hi {first_name}, this is {agent_name} calling from Henk Demo Organization. I hope I''m catching you at a good time?',
    'pledge_rate',
    50000.00,
    0,
    test_user_id,
    now(),
    now()
  ) RETURNING id INTO campaign1_id;

  -- Link lead list to campaign
  INSERT INTO public.campaign_lead_lists (
    campaign_id,
    lead_list_id,
    priority,
    assigned_by,
    assigned_at
  ) VALUES (
    campaign1_id,
    lead_list1_id,
    1,
    test_user_id,
    now()
  );

  -- Campaign 2: Major Gifts Initiative
  INSERT INTO public.campaigns (
    business_id,
    name,
    description,
    agent_id,
    status,
    script,
    goal_metric,
    budget,
    audience_contact_count,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Major Gifts Initiative',
    'Strategic outreach to high-value donors for transformative gifts',
    agent2_id,
    'draft',
    'Good afternoon {first_name}, this is {agent_name} from Henk Demo Organization. I wanted to personally reach out regarding our transformative new initiative.',
    'pledge_amount',
    250000.00,
    0,
    test_user_id,
    now(),
    now()
  );

  -- Campaign 3: Gala Invitation Campaign
  INSERT INTO public.campaigns (
    business_id,
    name,
    description,
    agent_id,
    status,
    script,
    goal_metric,
    budget,
    audience_contact_count,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    test_business_id,
    'Spring Gala 2025 - Invitations',
    'Personal invitations to our annual spring fundraising gala',
    agent3_id,
    'draft',
    'Hi there {first_name}! This is {agent_name} from Henk Demo Organization, and I''m so excited to tell you about our upcoming gala event!',
    'response_rate',
    15000.00,
    0,
    test_user_id,
    now(),
    now()
  );

  RAISE NOTICE 'Created 3 sample campaigns';

  -- ============================================================================
  -- SUMMARY
  -- ============================================================================
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'LOCAL DATABASE SEEDED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Login: cyrus@callhenk.com';
  RAISE NOTICE 'Password: Test123?';
  RAISE NOTICE 'Business: Henk Demo Organization';
  RAISE NOTICE 'Agents: 3 (Sarah, Michael, Emma)';
  RAISE NOTICE 'Campaigns: 3';
  RAISE NOTICE 'Leads: 5';
  RAISE NOTICE '═══════════════════════════════════════════════════════';

END $$;
