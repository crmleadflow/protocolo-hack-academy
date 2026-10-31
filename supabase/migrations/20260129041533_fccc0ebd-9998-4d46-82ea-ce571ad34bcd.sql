-- Allow authenticated users to view admin profiles (needed for messaging)
CREATE POLICY "Authenticated users can view admin profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = profiles.user_id 
    AND user_roles.role = 'admin'::app_role
  )
);