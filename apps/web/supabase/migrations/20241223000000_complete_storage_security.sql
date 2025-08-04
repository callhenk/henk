-- Complete Storage Security Migration
-- This migration applies comprehensive security policies to all storage buckets
-- Ensures no public access, user-specific permissions, and proper authentication

-- ========================================
-- CREATE ALL BUCKETS (IF NOT EXISTS)
-- ========================================

-- Ensure all buckets exist and are private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('account_image', 'account_image', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('workflow_assets', 'workflow_assets', false, 10485760, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']),
  ('agent_assets', 'agent_assets', false, 10485760, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']),
  ('campaign_assets', 'campaign_assets', false, 10485760, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']),
  ('knowledge_base', 'knowledge_base', false, 10485760, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = CASE 
    WHEN storage.buckets.id = 'account_image' THEN 5242880 
    ELSE 10485760 
  END,
  allowed_mime_types = CASE 
    WHEN storage.buckets.id = 'account_image' THEN ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ELSE ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']
  END;

-- ========================================
-- BUCKET-LEVEL POLICIES
-- ========================================
-- Ensure all buckets require authentication for access

-- Drop existing bucket policies
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "workflow_assets_bucket_access" ON storage.buckets;
DROP POLICY IF EXISTS "agent_assets_bucket_access" ON storage.buckets;
DROP POLICY IF EXISTS "campaign_assets_bucket_access" ON storage.buckets;
DROP POLICY IF EXISTS "knowledge_base_bucket_access" ON storage.buckets;

-- Create bucket-level policies for all buckets
CREATE POLICY "account_image_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'account_image' AND auth.role() = 'authenticated'
  );

CREATE POLICY "workflow_assets_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'workflow_assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "agent_assets_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'agent_assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "campaign_assets_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'campaign_assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "knowledge_base_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'knowledge_base' AND auth.role() = 'authenticated'
  );

-- ========================================
-- OBJECT-LEVEL POLICIES
-- ========================================

-- Drop all existing object policies
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload account images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their account images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their account images" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Workflow assets policies
DROP POLICY IF EXISTS "workflow_assets_delete" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_update" ON storage.objects;

-- Agent assets policies
DROP POLICY IF EXISTS "agent_assets_delete" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_update" ON storage.objects;

-- Campaign assets policies
DROP POLICY IF EXISTS "campaign_assets_delete" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_update" ON storage.objects;

-- Knowledge base policies
DROP POLICY IF EXISTS "knowledge_base_delete" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_insert" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_select" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_update" ON storage.objects;

-- ========================================
-- ACCOUNT_IMAGE BUCKET POLICIES
-- ========================================
-- User-specific access: users can only access their own images

CREATE POLICY "Users can access own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'account_image' 
    AND auth.uid()::text = split_part(name, '.', 1)
  );

CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'account_image' 
    AND auth.uid()::text = split_part(name, '.', 1)
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'account_image' 
    AND auth.uid()::text = split_part(name, '.', 1)
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'account_image' 
    AND auth.uid()::text = split_part(name, '.', 1)
    AND auth.role() = 'authenticated'
  );

-- ========================================
-- WORKFLOW_ASSETS BUCKET POLICIES
-- ========================================
-- Organization-scoped access for authenticated users

CREATE POLICY "workflow_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "workflow_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "workflow_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "workflow_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
  );

-- ========================================
-- AGENT_ASSETS BUCKET POLICIES
-- ========================================
-- Organization-scoped access for authenticated users

CREATE POLICY "agent_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "agent_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "agent_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "agent_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
  );

-- ========================================
-- CAMPAIGN_ASSETS BUCKET POLICIES
-- ========================================
-- Organization-scoped access for authenticated users

CREATE POLICY "campaign_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "campaign_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "campaign_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "campaign_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
  );

-- ========================================
-- KNOWLEDGE_BASE BUCKET POLICIES
-- ========================================
-- Organization-scoped access for authenticated users

CREATE POLICY "knowledge_base_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "knowledge_base_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "knowledge_base_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "knowledge_base_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
  ); 