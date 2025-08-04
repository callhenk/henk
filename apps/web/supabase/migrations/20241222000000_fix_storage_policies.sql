-- Fix storage bucket policies for account_image
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS account_image ON storage.objects;

-- Create a secure policy for profile images
-- Profile images are stored as: userId.extension?v=uniqueId
-- We need to extract the userId from the filename for proper access control
CREATE POLICY "Secure profile image access" ON storage.objects
FOR SELECT USING (
    bucket_id = 'account_image' 
    AND (
        -- Allow access to own profile images (extract userId from filename)
        auth.uid()::text = split_part(storage.filename(name), '.', 1)
        OR 
        -- Allow authenticated users to view profile images (for UI display)
        auth.role() = 'authenticated'
    )
);

-- Allow users to upload their own profile images
CREATE POLICY "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'account_image' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update profile images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'account_image' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete profile images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'account_image' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
);

-- ============================================================================
-- WORKFLOW ASSETS BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for workflow_assets if they exist
DROP POLICY IF EXISTS "workflow_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "workflow_assets_delete" ON storage.objects;

-- Allow authenticated users to view workflow assets
CREATE POLICY "workflow_assets_select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload workflow assets
CREATE POLICY "workflow_assets_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update workflow assets
CREATE POLICY "workflow_assets_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete workflow assets
CREATE POLICY "workflow_assets_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'workflow_assets' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- AGENT ASSETS BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for agent_assets if they exist
DROP POLICY IF EXISTS "agent_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "agent_assets_delete" ON storage.objects;

-- Allow authenticated users to view agent assets
CREATE POLICY "agent_assets_select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload agent assets
CREATE POLICY "agent_assets_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update agent assets
CREATE POLICY "agent_assets_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete agent assets
CREATE POLICY "agent_assets_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'agent_assets' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- CAMPAIGN ASSETS BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for campaign_assets if they exist
DROP POLICY IF EXISTS "campaign_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "campaign_assets_delete" ON storage.objects;

-- Allow authenticated users to view campaign assets
CREATE POLICY "campaign_assets_select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload campaign assets
CREATE POLICY "campaign_assets_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update campaign assets
CREATE POLICY "campaign_assets_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete campaign assets
CREATE POLICY "campaign_assets_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'campaign_assets' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- KNOWLEDGE BASE BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for knowledge_base if they exist
DROP POLICY IF EXISTS "knowledge_base_select" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_insert" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_update" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_base_delete" ON storage.objects;

-- Allow authenticated users to view knowledge base files
CREATE POLICY "knowledge_base_select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload knowledge base files
CREATE POLICY "knowledge_base_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update knowledge base files
CREATE POLICY "knowledge_base_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete knowledge base files
CREATE POLICY "knowledge_base_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'knowledge_base' 
    AND auth.role() = 'authenticated'
); 