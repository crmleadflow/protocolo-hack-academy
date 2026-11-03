-- Las políticas del Mentor IA solo aceptaban el rol "admin"; el super administrador no podía
-- cambiar la foto, el nombre ni los documentos. Se agregan políticas para "super_admin".
DROP POLICY IF EXISTS "Super admins manage mentor settings" ON public.mentor_settings;
CREATE POLICY "Super admins manage mentor settings" ON public.mentor_settings FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins manage mentor documents" ON public.mentor_documents;
CREATE POLICY "Super admins manage mentor documents" ON public.mentor_documents FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins manage mentor embeddings" ON public.mentor_embeddings;
CREATE POLICY "Super admins manage mentor embeddings" ON public.mentor_embeddings FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins manage mentor storage" ON storage.objects;
CREATE POLICY "Super admins manage mentor storage" ON storage.objects FOR ALL
  USING (bucket_id IN ('mentor-avatar', 'mentor-files') AND public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (bucket_id IN ('mentor-avatar', 'mentor-files') AND public.has_role(auth.uid(), 'super_admin'::app_role));
