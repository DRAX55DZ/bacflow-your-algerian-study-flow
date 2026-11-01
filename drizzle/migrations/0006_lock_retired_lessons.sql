DROP POLICY IF EXISTS "Signed-in users read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Signed-in users save lessons" ON public.lessons;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.lessons FROM authenticated, anon;
COMMENT ON TABLE public.lessons IS 'DEPRECATED: AI lessons removed; app links to official lessons instead';