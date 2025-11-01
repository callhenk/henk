-- Comprehensive seed data for testing
-- This file creates a complete test environment with businesses, users, contacts, campaigns, etc.

-- Clean up existing test data (in reverse order of dependencies)
DELETE FROM contact_list_members WHERE contact_list_id IN (SELECT id FROM contact_lists WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%'));
DELETE FROM contact_lists WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM conversations WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM agents WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM campaign_executions WHERE campaign_id IN (SELECT id FROM campaigns WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%'));
DELETE FROM campaigns WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM contacts WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM integrations WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM team_members WHERE business_id IN (SELECT id FROM businesses WHERE slug LIKE 'test-%');
DELETE FROM businesses WHERE slug LIKE 'test-%';

-- ============================================
-- 1. Create Test Business
-- ============================================
INSERT INTO businesses (id, name, slug, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Business',
  'test-business',
  NOW(),
  NOW()
);

-- ============================================
-- 2. Create Test Users (via Supabase Auth)
-- Note: Users must be created via Supabase Auth API
-- This is handled in the test setup code
-- ============================================

-- ============================================
-- 3. Create Test Contacts (Donors)
-- ============================================
INSERT INTO contacts (id, business_id, first_name, last_name, email, phone, source, tags, custom_fields, source_metadata, created_at, updated_at)
VALUES
  -- VIP Donors
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'John', 'Doe', 'john.doe@example.com', '+12025551001', 'manual', ARRAY['VIP', 'Major Donor'], '{"lifetime_giving": "50000"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Jane', 'Smith', 'jane.smith@example.com', '+12025551002', 'manual', ARRAY['VIP', 'Board Member'], '{"lifetime_giving": "75000"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Robert', 'Johnson', 'robert.j@example.com', '+12025551003', 'salesforce', ARRAY['VIP'], '{"lifetime_giving": "60000"}'::jsonb, '{"salesforce_id": "0031234567890ABC"}'::jsonb, NOW(), NOW()),

  -- Regular Donors
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Emily', 'Davis', 'emily.d@example.com', '+12025551004', 'manual', ARRAY['Regular Donor'], '{"lifetime_giving": "5000"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Michael', 'Brown', 'michael.b@example.com', '+12025551005', 'csv_import', ARRAY['Regular Donor'], '{"lifetime_giving": "3500"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sarah', 'Wilson', 'sarah.w@example.com', '+12025551006', 'hubspot', ARRAY['Regular Donor', 'Newsletter'], '{"lifetime_giving": "4200"}'::jsonb, '{"hubspot_id": "12345"}'::jsonb, NOW(), NOW()),

  -- New Prospects
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'David', 'Martinez', 'david.m@example.com', '+12025551007', 'manual', ARRAY['Prospect'], '{}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Lisa', 'Anderson', 'lisa.a@example.com', '+12025551008', 'manual', ARRAY['Prospect', 'Event Attendee'], '{}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'James', 'Taylor', 'james.t@example.com', '+12025551009', 'salesforce', ARRAY['Prospect'], '{}'::jsonb, '{"salesforce_id": "0031234567890XYZ"}'::jsonb, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Maria', 'Garcia', 'maria.g@example.com', '+12025551010', 'manual', ARRAY['Prospect'], '{}'::jsonb, '{}'::jsonb, NOW(), NOW());

-- ============================================
-- 4. Create Contact Lists
-- ============================================
INSERT INTO contact_lists (id, business_id, name, description, type, filters, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'VIP Donors', 'Major donors and board members', 'static', NULL, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Regular Donors', 'Donors who give regularly', 'static', NULL, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'New Prospects', 'Potential new donors', 'static', NULL, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'High Value Donors', 'Dynamic list of donors with >$10k lifetime giving', 'dynamic', '{"lifetime_giving": {"$gt": 10000}}'::jsonb, NOW(), NOW());

-- ============================================
-- 5. Add Contacts to Lists
-- ============================================
INSERT INTO contact_list_members (contact_list_id, contact_id, created_at)
VALUES
  -- VIP Donors List
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW()),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', NOW()),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', NOW()),

  -- Regular Donors List
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', NOW()),

  -- New Prospects List
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', NOW());

-- ============================================
-- 6. Create Campaigns
-- ============================================
INSERT INTO campaigns (id, business_id, name, description, status, goal, start_date, end_date, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Annual Fundraiser 2025', 'Annual fundraising campaign for operational support', 'active', '100000', '2025-01-01', '2025-12-31', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Capital Campaign', 'Building renovation capital campaign', 'draft', '500000', '2025-06-01', '2026-06-01', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Spring Gala 2025', 'Annual spring gala event', 'active', '50000', '2025-04-01', '2025-05-01', NOW(), NOW());

-- ============================================
-- 7. Create Agents
-- ============================================
INSERT INTO agents (id, business_id, name, voice_id, voice_settings, system_prompt, created_at, updated_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Fundraising Assistant', 'test_voice_id_001', '{"stability": 0.5, "similarity_boost": 0.75}'::jsonb, 'You are a friendly fundraising assistant helping donors contribute to our cause. Be warm, professional, and persuasive.', NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Event Coordinator', 'test_voice_id_002', '{"stability": 0.6, "similarity_boost": 0.8}'::jsonb, 'You are an enthusiastic event coordinator helping people register for events and answer questions. Be energetic and helpful.', NOW(), NOW());

-- ============================================
-- 8. Create Integrations
-- ============================================
INSERT INTO integrations (id, business_id, name, type, status, credentials, config, created_at, updated_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Salesforce', 'crm', 'active', '{"access_token": "test_token", "refresh_token": "test_refresh", "instance_url": "https://test.salesforce.com"}'::jsonb, '{"sync_enabled": true, "sync_frequency": "hourly"}'::jsonb, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'HubSpot', 'crm', 'inactive', '{}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Twilio', 'communication', 'active', '{"account_sid": "test_sid", "auth_token": "test_token"}'::jsonb, '{"phone_number": "+15555551234"}'::jsonb, NOW(), NOW());

-- ============================================
-- 9. Create Sample Conversations
-- ============================================
INSERT INTO conversations (id, business_id, agent_id, contact_id, call_sid, status, duration_seconds, transcript, created_at, updated_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'test_call_sid_001', 'completed', 180, 'Test transcript for completed call', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'test_call_sid_002', 'completed', 240, 'Test transcript for another completed call', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'test_call_sid_003', 'in-progress', NULL, NULL, NOW(), NOW());

-- ============================================
-- 10. Create Leads (linked to contacts)
-- ============================================
INSERT INTO leads (id, business_id, contact_id, source, status, score, created_at, updated_at)
VALUES
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'website', 'new', 75, NOW(), NOW()),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'referral', 'qualified', 85, NOW(), NOW()),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'event', 'contacted', 60, NOW(), NOW());

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Test data seeded successfully!';
  RAISE NOTICE 'Business ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE 'Created: 10 contacts, 4 contact lists, 3 campaigns, 2 agents, 3 integrations, 3 conversations, 3 leads';
END $$;
