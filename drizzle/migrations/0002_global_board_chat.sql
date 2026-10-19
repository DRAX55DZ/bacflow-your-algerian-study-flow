CREATE POLICY "everyone reads profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "everyone reads progress" ON public.progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "everyone reads activity" ON public.activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "everyone reads group chat" ON public.messages FOR SELECT TO authenticated USING (room = 'group');
CREATE POLICY "nudge anyone" ON public.nudges FOR INSERT TO authenticated WITH CHECK (from_id = auth.uid() AND to_id <> auth.uid());
CREATE POLICY "everyone reads chat files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'chat-files');