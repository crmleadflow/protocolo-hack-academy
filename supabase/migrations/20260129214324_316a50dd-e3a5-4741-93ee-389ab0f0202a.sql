-- Eliminar políticas restrictivas actuales de profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Recrear políticas como PERMISSIVE (por defecto)
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view admin profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = profiles.user_id 
    AND user_roles.role = 'admin'::app_role
  )
);