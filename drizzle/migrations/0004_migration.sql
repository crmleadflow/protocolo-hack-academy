-- ============================================================
-- HACK COMMUNITY 2.0: modulos de contenido
-- Retos y misiones, eventos en vivo, oportunidades comerciales,
-- networking entre miembros y ranking.
-- Reusa: has_role(), has_active_enrollment(), add_user_xp()
-- NINGUNA tabla nueva referencia auth.users con FK (uuid planos).
-- ============================================================

-- ---------- Helpers ----------

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    public.has_role(_user_id, 'super_admin')
    OR public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'mentor')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_active_enrollment(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = _user_id
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;

-- ---------- Retos y misiones ----------

CREATE TABLE public.community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  xp_reward integer NOT NULL DEFAULT 100 CHECK (xp_reward >= 0 AND xp_reward <= 5000),
  due_date timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'joined' CHECK (status IN ('joined','submitted','completed')),
  submission_text text NOT NULL DEFAULT '',
  submitted_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX challenge_participants_user_idx ON public.challenge_participants (user_id, status);
CREATE INDEX community_challenges_program_idx ON public.community_challenges (program_id, status);

-- ---------- Eventos en vivo ----------

CREATE TABLE public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  meeting_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled','done')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX event_rsvps_user_idx ON public.event_rsvps (user_id);
CREATE INDEX community_events_starts_idx ON public.community_events (starts_at);

-- ---------- Oportunidades comerciales (independientes del CRM) ----------

CREATE TABLE public.community_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunity_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.community_opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);

CREATE INDEX opportunity_responses_user_idx ON public.opportunity_responses (user_id);

-- ---------- Networking entre miembros ----------

CREATE TABLE public.member_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

CREATE INDEX member_connections_to_idx ON public.member_connections (to_user_id, status);
CREATE INDEX member_connections_from_idx ON public.member_connections (from_user_id, status);

-- ---------- updated_at triggers ----------

CREATE TRIGGER update_community_challenges_updated_at BEFORE UPDATE ON public.community_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_opportunities_updated_at BEFORE UPDATE ON public.community_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_member_connections_updated_at BEFORE UPDATE ON public.member_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- RLS ----------

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_connections ENABLE ROW LEVEL SECURITY;

-- Retos: leen los del programa (o el staff), escribe solo el staff
CREATE POLICY challenges_read ON public.community_challenges FOR SELECT
  USING (public.is_staff(auth.uid()) OR public.has_active_enrollment(auth.uid(), program_id));
CREATE POLICY challenges_insert ON public.community_challenges FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY challenges_update ON public.community_challenges FOR UPDATE
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY challenges_delete ON public.community_challenges FOR DELETE
  USING (public.is_staff(auth.uid()));

-- Participacion en retos: solo se lee lo propio o todo si eres staff.
-- Unirse, entregar y aprobar pasa por funciones del servidor.
CREATE POLICY participants_read ON public.challenge_participants FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- Eventos: los de programa propio, los globales para cualquier alumno activo
CREATE POLICY events_read ON public.community_events FOR SELECT
  USING (
    public.is_staff(auth.uid())
    OR (program_id IS NULL AND public.has_any_active_enrollment(auth.uid()))
    OR public.has_active_enrollment(auth.uid(), program_id)
  );
CREATE POLICY events_insert ON public.community_events FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY events_update ON public.community_events FOR UPDATE
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY events_delete ON public.community_events FOR DELETE
  USING (public.is_staff(auth.uid()));

-- Confirmacion de asistencia: cada quien gestiona la suya
CREATE POLICY rsvps_read ON public.event_rsvps FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY rsvps_insert ON public.event_rsvps FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY rsvps_delete ON public.event_rsvps FOR DELETE
  USING (user_id = auth.uid());

-- Oportunidades: visibilidad igual que eventos, escribe solo el staff
CREATE POLICY opportunities_read ON public.community_opportunities FOR SELECT
  USING (
    public.is_staff(auth.uid())
    OR (program_id IS NULL AND public.has_any_active_enrollment(auth.uid()))
    OR public.has_active_enrollment(auth.uid(), program_id)
  );
CREATE POLICY opportunities_insert ON public.community_opportunities FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY opportunities_update ON public.community_opportunities FOR UPDATE
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY opportunities_delete ON public.community_opportunities FOR DELETE
  USING (public.is_staff(auth.uid()));

-- Respuestas a oportunidades: cada quien ve y escribe la suya
CREATE POLICY opp_responses_read ON public.opportunity_responses FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY opp_responses_insert ON public.opportunity_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY opp_responses_update ON public.opportunity_responses FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Conexiones: solo los dos involucrados las ven
CREATE POLICY connections_read ON public.member_connections FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY connections_insert ON public.member_connections FOR INSERT
  WITH CHECK (from_user_id = auth.uid());
CREATE POLICY connections_update ON public.member_connections FOR UPDATE
  USING (to_user_id = auth.uid()) WITH CHECK (to_user_id = auth.uid());

-- ---------- Seguridad de puntos ----------
-- add_user_xp() reparte puntos: no debe poder llamarla nadie desde el navegador.
REVOKE EXECUTE ON FUNCTION public.add_user_xp(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_xp(uuid, integer) TO service_role;

-- ---------- Flujos de retos (solo servidor) ----------

CREATE OR REPLACE FUNCTION public.join_challenge(_challenge_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _program uuid;
  _already uuid;
BEGIN
  SELECT program_id INTO _program FROM public.community_challenges WHERE id = _challenge_id;
  IF _program IS NULL THEN
    RAISE EXCEPTION 'El reto no existe';
  END IF;
  IF NOT (public.is_staff(auth.uid()) OR public.has_active_enrollment(auth.uid(), _program)) THEN
    RAISE EXCEPTION 'No tienes acceso a este reto';
  END IF;

  SELECT id INTO _already FROM public.challenge_participants
   WHERE challenge_id = _challenge_id AND user_id = auth.uid();

  IF _already IS NULL THEN
    INSERT INTO public.challenge_participants (challenge_id, user_id, status)
    VALUES (_challenge_id, auth.uid(), 'joined');
    RETURN 'joined';
  END IF;
  RETURN 'already';
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_challenge(_challenge_id uuid, _submission_text text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _submission_text IS NULL OR length(trim(_submission_text)) < 3 THEN
    RAISE EXCEPTION 'Escribe algo para tu evidencia';
  END IF;

  UPDATE public.challenge_participants
     SET status = 'submitted',
         submission_text = left(trim(_submission_text), 4000),
         submitted_at = now()
   WHERE challenge_id = _challenge_id
     AND user_id = auth.uid()
     AND status <> 'completed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Primente unbete al reto antes de entregar';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_challenge(_challenge_id uuid, _user_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _xp integer;
  _program uuid;
  _state text;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Solo el equipo puede revisar entregas';
  END IF;

  SELECT xp_reward, program_id INTO _xp, _program
    FROM public.community_challenges WHERE id = _challenge_id;
  IF _xp IS NULL THEN
    RAISE EXCEPTION 'El reto no existe';
  END IF;

  SELECT status INTO _state FROM public.challenge_participants
   WHERE challenge_id = _challenge_id AND user_id = _user_id;
  IF _state IS NULL OR _state <> 'submitted' THEN
    RAISE EXCEPTION 'No hay una entrega pendiente de revisar';
  END IF;

  UPDATE public.challenge_participants
     SET status = CASE WHEN _approve THEN 'completed' ELSE 'joined' END,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE challenge_id = _challenge_id AND user_id = _user_id;

  IF _approve THEN
    PERFORM public.add_user_xp(_user_id, _xp);
  END IF;
END;
$$;

-- ---------- Listas de miembros y ranking (solo servidor, sin telefonos) ----------

CREATE OR REPLACE FUNCTION public.community_leaderboard(_program_id uuid, _limit integer DEFAULT 20)
RETURNS TABLE (user_id uuid, full_name text, avatar_url text, total_xp integer, current_level integer)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT x.user_id,
         COALESCE(p.full_name, 'Miembro'),
         p.avatar_url,
         x.total_xp,
         x.current_level
    FROM public.user_xp x
    JOIN public.enrollments e
      ON e.user_id = x.user_id AND e.program_id = _program_id AND e.status = 'active'
    LEFT JOIN public.profiles p ON p.user_id = x.user_id
   WHERE public.is_staff(auth.uid()) OR public.has_active_enrollment(auth.uid(), _program_id)
   ORDER BY x.total_xp DESC, x.user_id
   LIMIT GREATEST(1, LEAST(COALESCE(_limit, 20), 100));
$$;

CREATE OR REPLACE FUNCTION public.community_members(_program_id uuid)
RETURNS TABLE (user_id uuid, full_name text, avatar_url text, total_xp integer, current_level integer, connection_status text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id,
         COALESCE(p.full_name, 'Miembro'),
         p.avatar_url,
         COALESCE(x.total_xp, 0),
         COALESCE(x.current_level, 1),
         COALESCE((
           SELECT c.status FROM public.member_connections c
            WHERE (c.from_user_id = auth.uid() AND c.to_user_id = e.user_id)
               OR (c.from_user_id = e.user_id AND c.to_user_id = auth.uid())
            ORDER BY c.created_at DESC LIMIT 1
         ), 'none')
    FROM public.enrollments e
    LEFT JOIN public.profiles p ON p.user_id = e.user_id
    LEFT JOIN public.user_xp x ON x.user_id = e.user_id
   WHERE e.program_id = _program_id
     AND e.status = 'active'
     AND e.user_id <> auth.uid()
     AND (public.is_staff(auth.uid()) OR public.has_active_enrollment(auth.uid(), _program_id));
$$;

-- ---------- Grants ----------

GRANT SELECT ON public.community_challenges TO authenticated;
GRANT SELECT ON public.community_events TO authenticated;
GRANT SELECT ON public.community_opportunities TO authenticated;
GRANT SELECT ON public.challenge_participants TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.event_rsvps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.opportunity_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.member_connections TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_challenge(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_challenge(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.community_leaderboard(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.community_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_active_enrollment(uuid) TO authenticated;
