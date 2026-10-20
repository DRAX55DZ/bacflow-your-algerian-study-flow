ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'en';
CREATE TABLE public.lessons (
  unit_key text NOT NULL,
  lang text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (unit_key, lang)
);
GRANT SELECT, INSERT ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users save lessons" ON public.lessons FOR INSERT TO authenticated WITH CHECK (length(content) > 200);