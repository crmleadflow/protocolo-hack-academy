CREATE TABLE public.commercial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text,
  source_page text,
  status text NOT NULL DEFAULT 'new',
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.commercial_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_requests TO authenticated;
GRANT ALL ON public.commercial_requests TO service_role;
ALTER TABLE public.commercial_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit requests" ON public.commercial_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND char_length(name) BETWEEN 1 AND 120 AND char_length(email) BETWEEN 3 AND 255 AND request_type IN ('conferencia','mentoria','leadflow','recurso','evento','contacto'));
CREATE POLICY "Admins read requests" ON public.commercial_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update requests" ON public.commercial_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete requests" ON public.commercial_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));