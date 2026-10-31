-- Add file attachment support to community_messages
ALTER TABLE public.community_messages
ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS file_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT NULL;

-- Create storage bucket for community files if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('community-files', 'community-files', true, 104857600) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community files
CREATE POLICY "Anyone can view community files"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-files');

CREATE POLICY "Authenticated users can upload community files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-files' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own community files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);