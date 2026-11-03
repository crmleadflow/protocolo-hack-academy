-- Comunidad abierta y gratuita: cualquier persona puede unirse sin comprar un programa.
-- No se publica en el catálogo (is_published = false); solo la ven quienes están inscritos.

ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_open_community BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS programs_one_open_community
  ON public.programs (is_open_community) WHERE is_open_community;

INSERT INTO public.programs (title, description, price, currency, is_published, is_open_community)
SELECT 'Comunidad Protocolo Hack', 'Comunidad abierta y gratuita', 0, 'USD', false, true
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE is_open_community);

DROP POLICY IF EXISTS "Enrolled users can view their program" ON public.programs;
CREATE POLICY "Enrolled users can view their program" ON public.programs
  FOR SELECT TO authenticated
  USING (public.has_active_enrollment(auth.uid(), id));

CREATE OR REPLACE FUNCTION public.join_open_community()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  SELECT id INTO _pid FROM public.programs WHERE is_open_community LIMIT 1;
  IF _pid IS NULL THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.enrollments (user_id, program_id, status, enrolled_at, is_manual)
  VALUES (auth.uid(), _pid, 'active', now(), false)
  ON CONFLICT (user_id, program_id) DO NOTHING;
  RETURN _pid;
END;
$$;

REVOKE ALL ON FUNCTION public.join_open_community() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_open_community() TO authenticated;

-- Mensaje de bienvenida (una sola vez), escrito a nombre de un administrador.
INSERT INTO public.community_messages (program_id, user_id, content)
SELECT p.id, ur.user_id,
  '¡Bienvenido a la comunidad de Protocolo Hack! Para empezar, cuéntanos en un mensaje quién eres y qué quieres lograr. Aquí compartimos avances, resolvemos dudas y lanzamos retos y encuestas.'
FROM public.programs p
JOIN LATERAL (
  SELECT user_id FROM public.user_roles
  WHERE role::text IN ('super_admin', 'admin')
  ORDER BY (role::text = 'super_admin') DESC
  LIMIT 1
) ur ON true
WHERE p.is_open_community
  AND NOT EXISTS (SELECT 1 FROM public.community_messages m WHERE m.program_id = p.id);
