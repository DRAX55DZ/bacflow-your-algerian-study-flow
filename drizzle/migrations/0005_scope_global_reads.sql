DROP POLICY IF EXISTS "everyone reads profiles" ON public.profiles;
DROP POLICY IF EXISTS "everyone reads progress" ON public.progress;
DROP POLICY IF EXISTS "everyone reads activity" ON public.activity;
DROP POLICY IF EXISTS "everyone reads chat files" ON storage.objects;

CREATE POLICY "read chat files shared in visible messages" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'chat-files' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.messages m WHERE m.attach_path = storage.objects.name)
  )
);

CREATE OR REPLACE FUNCTION public.global_leaderboard()
RETURNS TABLE (id uuid, name text, stream text, last_activity text, items text[], days jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.name, p.stream, p.last_activity,
    coalesce((SELECT array_agg(pr.item_id) FROM public.progress pr WHERE pr.user_id = p.id), '{}'),
    coalesce((SELECT jsonb_object_agg(a.day::text, a.count) FROM public.activity a WHERE a.user_id = p.id AND a.day > current_date - 400), '{}'::jsonb)
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.onboarded
  LIMIT 1000
$$;
REVOKE ALL ON FUNCTION public.global_leaderboard() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.global_leaderboard() TO authenticated;