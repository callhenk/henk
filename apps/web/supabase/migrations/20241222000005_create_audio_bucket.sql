-- Create audio bucket for voice synthesis files
-- This bucket will store generated audio files from voice synthesis

-- Create the audio bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('audio', 'audio', false, 52428800, ARRAY['audio/*', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/*', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];

-- Create bucket-level policy
CREATE POLICY IF NOT EXISTS "audio_bucket_access" ON storage.buckets
  FOR SELECT USING (
    id = 'audio' AND auth.role() = 'authenticated'
  );

-- Create object-level policies for audio bucket
CREATE POLICY IF NOT EXISTS "audio_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio' AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "audio_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio' AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "audio_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio' AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "audio_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio' AND auth.role() = 'authenticated'
  );

-- Add comments for documentation
COMMENT ON TABLE storage.buckets IS 'Audio bucket for voice synthesis files';
COMMENT ON POLICY "audio_bucket_access" ON storage.buckets IS 'RLS policy: Users can access audio bucket';
COMMENT ON POLICY "audio_select" ON storage.objects IS 'RLS policy: Users can select audio files';
COMMENT ON POLICY "audio_insert" ON storage.objects IS 'RLS policy: Users can insert audio files';
COMMENT ON POLICY "audio_update" ON storage.objects IS 'RLS policy: Users can update audio files';
COMMENT ON POLICY "audio_delete" ON storage.objects IS 'RLS policy: Users can delete audio files'; 