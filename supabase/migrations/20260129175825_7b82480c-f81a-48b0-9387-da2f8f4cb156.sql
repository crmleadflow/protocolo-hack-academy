-- Create lesson_comments table for student comments on lessons
CREATE TABLE public.lesson_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enrolled users can view lesson comments"
ON public.lesson_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = lesson_comments.lesson_id
    AND has_active_enrollment(auth.uid(), m.program_id)
  )
);

CREATE POLICY "Enrolled users can create comments"
ON public.lesson_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = lesson_comments.lesson_id
    AND has_active_enrollment(auth.uid(), m.program_id)
  )
);

CREATE POLICY "Users can update own comments"
ON public.lesson_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.lesson_comments
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lesson comments"
ON public.lesson_comments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_lesson_comments_updated_at
BEFORE UPDATE ON public.lesson_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for lesson comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_comments;