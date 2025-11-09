-- Create audio storage bucket for voice samples and recordings
INSERT INTO storage.buckets (id, name)
VALUES ('audio', 'audio')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio files
CREATE POLICY "Allow authenticated users to upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow authenticated users to read their own audio files
CREATE POLICY "Allow authenticated users to read audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio');

-- Allow public access to audio files (for voice previews)
CREATE POLICY "Allow public access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio');

-- Allow authenticated users to update their own audio files
CREATE POLICY "Allow authenticated users to update audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio');

-- Allow authenticated users to delete their own audio files
CREATE POLICY "Allow authenticated users to delete audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio');
