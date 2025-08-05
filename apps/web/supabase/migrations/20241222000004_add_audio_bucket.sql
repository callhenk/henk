-- Corrected SQL for Storage Bucket Policies
DO $$
BEGIN
  -- Check if audio bucket exists
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'audio') THEN
    -- Safely drop existing policies if they exist
    IF EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE tablename = 'buckets' 
        AND schemaname = 'storage' 
        AND policyname = 'audio_bucket_access'
    ) THEN
      DROP POLICY "audio_bucket_access" ON storage.buckets;
    END IF;
    
    -- Create bucket-level policy
    CREATE POLICY "audio_bucket_access" ON storage.buckets
      FOR SELECT 
      TO authenticated 
      USING (
        id = 'audio'
      );

    -- Safely drop and recreate object-level policies
    IF EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname IN ('audio_select', 'audio_insert', 'audio_update', 'audio_delete')
    ) THEN
      DROP POLICY IF EXISTS "audio_select" ON storage.objects;
      DROP POLICY IF EXISTS "audio_insert" ON storage.objects;
      DROP POLICY IF EXISTS "audio_update" ON storage.objects;
      DROP POLICY IF EXISTS "audio_delete" ON storage.objects;
    END IF;

    -- Create object-level policies
    CREATE POLICY "audio_select" ON storage.objects
      FOR SELECT 
      TO authenticated 
      USING (
        bucket_id = 'audio'
      );

    CREATE POLICY "audio_insert" ON storage.objects
      FOR INSERT 
      TO authenticated 
      WITH CHECK (
        bucket_id = 'audio'
      );

    CREATE POLICY "audio_update" ON storage.objects
      FOR UPDATE 
      TO authenticated 
      USING (
        bucket_id = 'audio'
      );

    CREATE POLICY "audio_delete" ON storage.objects
      FOR DELETE 
      TO authenticated 
      USING (
        bucket_id = 'audio'
      );

    -- Add comments for documentation
    COMMENT ON POLICY "audio_bucket_access" ON storage.buckets IS 'RLS policy: Users can access audio bucket';
    COMMENT ON POLICY "audio_select" ON storage.objects IS 'RLS policy: Users can select audio files';
    COMMENT ON POLICY "audio_insert" ON storage.objects IS 'RLS policy: Users can insert audio files';
    COMMENT ON POLICY "audio_update" ON storage.objects IS 'RLS policy: Users can update audio files';
    COMMENT ON POLICY "audio_delete" ON storage.objects IS 'RLS policy: Users can delete audio files';
  END IF;
END $$;