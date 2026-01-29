-- Allow authenticated users to see admin roles (needed for messaging)
CREATE POLICY "Authenticated users can view admin roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND role = 'admin'::app_role
);