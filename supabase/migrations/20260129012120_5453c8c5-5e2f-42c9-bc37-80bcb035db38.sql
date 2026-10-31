-- Fix security issues: Deny anonymous access to profiles and lesson_progress tables

-- Add explicit policy to deny anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add explicit policy to deny anonymous access to lesson_progress
CREATE POLICY "Deny anonymous access to lesson_progress"
ON public.lesson_progress
FOR SELECT
USING (auth.uid() IS NOT NULL);