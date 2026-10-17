DROP POLICY IF EXISTS "read chat files" ON storage.objects;
CREATE POLICY "read chat files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'chat-files' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_friend(((storage.foldername(name))[1])::uuid)
  )
);