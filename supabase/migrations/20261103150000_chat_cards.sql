ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'text'
  CHECK (kind IN ('text','discussion','question','challenge','opportunity','poll'));
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS ref_id UUID;
