CREATE OR REPLACE FUNCTION public.global_leaderboard()
RETURNS TABLE(id uuid, name text, stream text, last_activity text, items text[], days jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
SELECT p.id, p.name, p.stream, p.last_activity,
coalesce((SELECT array_agg(pr.item_id) FROM public.progress pr WHERE pr.user_id = p.id), '{}'),
coalesce((SELECT jsonb_object_agg(a.day::text, greatest(a.count, case when a.all_done OR a.focus_minutes > 0 then 1 else 0 end)) FROM public.activity a WHERE a.user_id = p.id AND a.day > current_date - 400), '{}'::jsonb)
FROM public.profiles p WHERE auth.uid() IS NOT NULL AND p.onboarded LIMIT 1000
$function$;