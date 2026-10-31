-- Create lesson_ratings table for star ratings
CREATE TABLE public.lesson_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enrolled users can view lesson ratings"
ON public.lesson_ratings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = lesson_ratings.lesson_id
    AND has_active_enrollment(auth.uid(), m.program_id)
  )
);

CREATE POLICY "Enrolled users can rate lessons"
ON public.lesson_ratings
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = lesson_ratings.lesson_id
    AND has_active_enrollment(auth.uid(), m.program_id)
  )
);

CREATE POLICY "Users can update own ratings"
ON public.lesson_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON public.lesson_ratings
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lesson ratings"
ON public.lesson_ratings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_lesson_ratings_updated_at
BEFORE UPDATE ON public.lesson_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();