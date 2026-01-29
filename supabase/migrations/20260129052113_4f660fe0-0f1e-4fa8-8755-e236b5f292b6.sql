-- Create neuro_scans table to store analysis results
CREATE TABLE public.neuro_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Mi práctica de ventas',
  transcript TEXT NOT NULL,
  duration_seconds INTEGER,
  
  -- Analysis results
  words_per_minute NUMERIC,
  filler_words_count INTEGER DEFAULT 0,
  filler_words_detected JSONB DEFAULT '[]'::jsonb,
  persuasive_keywords_count INTEGER DEFAULT 0,
  persuasive_keywords_detected JSONB DEFAULT '[]'::jsonb,
  tone_analysis TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  
  -- Closing capacity score (0-100)
  closing_score INTEGER NOT NULL DEFAULT 0,
  
  -- AI feedback
  ai_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.neuro_scans ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own scans"
  ON public.neuro_scans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scans"
  ON public.neuro_scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON public.neuro_scans
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scans"
  ON public.neuro_scans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_neuro_scans_updated_at
  BEFORE UPDATE ON public.neuro_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();