ALTER TABLE public.community_events
  ADD COLUMN IF NOT EXISTS flyer_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_url text NOT NULL DEFAULT '';