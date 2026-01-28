-- Create lesson_resources table for files and links
CREATE TABLE public.lesson_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('file', 'link')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

-- Admins can manage all resources
CREATE POLICY "Admins can manage all lesson resources"
  ON public.lesson_resources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users with active enrollment can view resources
CREATE POLICY "Enrolled users can view lesson resources"
  ON public.lesson_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      WHERE l.id = lesson_resources.lesson_id
      AND has_active_enrollment(auth.uid(), m.program_id)
    )
  );

-- Users can view resources for preview lessons
CREATE POLICY "Users can view preview lesson resources"
  ON public.lesson_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_resources.lesson_id
      AND l.is_preview = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_resources_updated_at
  BEFORE UPDATE ON public.lesson_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for lesson files
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', true);

-- Storage policies for lesson files
CREATE POLICY "Admins can manage lesson files"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'lesson-files' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'lesson-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view lesson files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'lesson-files');