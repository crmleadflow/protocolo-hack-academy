CREATE OR REPLACE FUNCTION public.increment_post_views(_post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.community_posts
  SET views_count = views_count + 1
  WHERE id = _post_id
    AND has_active_enrollment(auth.uid(), program_id);
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO authenticated;
