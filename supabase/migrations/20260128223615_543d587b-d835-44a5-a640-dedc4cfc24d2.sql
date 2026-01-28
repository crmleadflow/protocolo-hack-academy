-- Drop existing restrictive policies on programs
DROP POLICY IF EXISTS "Admins can manage all programs" ON public.programs;
DROP POLICY IF EXISTS "Anyone can view published programs" ON public.programs;

-- Create PERMISSIVE policies (default behavior)
CREATE POLICY "Admins can manage all programs"
ON public.programs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published programs"
ON public.programs
FOR SELECT
TO authenticated, anon
USING (is_published = true);