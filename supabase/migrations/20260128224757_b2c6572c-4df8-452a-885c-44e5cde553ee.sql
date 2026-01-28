-- Create storage bucket for program thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-thumbnails', 'program-thumbnails', true);

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Admins can update thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'program-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow public read access to thumbnails
CREATE POLICY "Public can view thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'program-thumbnails');