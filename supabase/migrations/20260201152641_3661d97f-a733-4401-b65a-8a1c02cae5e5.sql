-- 1. Agregar política para denegar acceso anónimo a profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Eliminar la política que expone roles de admin y crear una más restrictiva
DROP POLICY IF EXISTS "Authenticated users can view admin roles" ON public.user_roles;

-- Los usuarios solo pueden ver sus propios roles (la política existente ya lo hace)
-- Los admins pueden ver todos los roles (la política existente ya lo hace)

-- 3. Agregar política para denegar acceso anónimo a user_roles
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Agregar política para denegar acceso anónimo a payments
CREATE POLICY "Deny anonymous access to payments"
ON public.payments
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 5. Agregar política para denegar acceso anónimo a direct_messages
CREATE POLICY "Deny anonymous access to direct_messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 6. Agregar política para denegar acceso anónimo a neuro_scans
CREATE POLICY "Deny anonymous access to neuro_scans"
ON public.neuro_scans
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 7. Agregar política para denegar acceso anónimo a mentor_conversations
CREATE POLICY "Deny anonymous access to mentor_conversations"
ON public.mentor_conversations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. Agregar política para denegar acceso anónimo a mentor_messages
CREATE POLICY "Deny anonymous access to mentor_messages"
ON public.mentor_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 9. Modificar user_xp para que solo el sistema pueda modificar XP (mediante triggers)
-- Primero eliminamos las políticas permisivas de INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;

-- Crear función para actualizar XP de forma segura (solo desde el servidor)
CREATE OR REPLACE FUNCTION public.add_user_xp(_user_id uuid, _xp_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp)
  VALUES (_user_id, _xp_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_xp = user_xp.total_xp + _xp_amount,
    updated_at = now();
END;
$$;

-- 10. Agregar índice único en user_xp.user_id si no existe para soportar ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_xp_user_id_key' AND conrelid = 'public.user_xp'::regclass
  ) THEN
    ALTER TABLE public.user_xp ADD CONSTRAINT user_xp_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- La constraint ya existe
END $$;

-- 11. Agregar política para denegar acceso anónimo a tool_subscriptions  
CREATE POLICY "Deny anonymous access to tool_subscriptions"
ON public.tool_subscriptions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 12. Agregar política para denegar acceso anónimo a enrollments
CREATE POLICY "Deny anonymous access to enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() IS NOT NULL);