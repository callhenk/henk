-- Create policies for the generated folder where files are actually stored
-- Allow authenticated users to read files in generated folder
CREATE POLICY "Give users access to samples folder read" ON storage.objects 
FOR SELECT TO authenticated 
USING (
    bucket_id = 'audio' AND 
    (storage.foldername(name))[1] = 'samples' AND 
    auth.role() = 'authenticated'
);

-- Allow authenticated users to upload files to generated folder
CREATE POLICY "Give users access to samples folder upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'audio' AND 
    (storage.foldername(name))[1] = 'samples' AND 
    auth.role() = 'authenticated'
);

-- Allow authenticated users to update files in generated folder
CREATE POLICY "Give users access to samples folder update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
    bucket_id = 'audio' AND 
    (storage.foldername(name))[1] = 'samples' AND 
    auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'audio' AND 
    (storage.foldername(name))[1] = 'samples' AND 
    auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files in generated folder
CREATE POLICY "Give users access to samples folder delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (
    bucket_id = 'audio' AND 
    (storage.foldername(name))[1] = 'samples' AND 
    auth.role() = 'authenticated'
);