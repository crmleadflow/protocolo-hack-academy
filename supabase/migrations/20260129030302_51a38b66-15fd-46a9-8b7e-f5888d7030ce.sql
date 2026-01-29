-- Create enum for document types
CREATE TYPE public.mentor_document_type AS ENUM ('transcript', 'pdf', 'text', 'notes');

-- Create mentor_settings table for global mentor configuration (avatar, name, etc.)
CREATE TABLE public.mentor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_url TEXT,
  mentor_name TEXT NOT NULL DEFAULT 'Héctor Galensky',
  welcome_message TEXT DEFAULT '¡Hola! Soy tu mentor virtual. Pregúntame lo que necesites sobre los cursos.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_settings
ALTER TABLE public.mentor_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_settings
CREATE POLICY "Anyone can view mentor settings"
  ON public.mentor_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage mentor settings"
  ON public.mentor_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mentor_documents table for storing training documents
CREATE TABLE public.mentor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type public.mentor_document_type NOT NULL DEFAULT 'transcript',
  file_url TEXT,
  video_timestamp_start INTEGER,
  video_timestamp_end INTEGER,
  metadata JSONB DEFAULT '{}',
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_documents
ALTER TABLE public.mentor_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_documents
CREATE POLICY "Admins can manage mentor documents"
  ON public.mentor_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enrolled users can view processed documents metadata"
  ON public.mentor_documents FOR SELECT
  USING (
    is_processed = true AND
    (program_id IS NULL OR public.has_active_enrollment(auth.uid(), program_id))
  );

-- Create mentor_embeddings table (using JSONB for embedding storage to avoid pgvector dependency)
CREATE TABLE public.mentor_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.mentor_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding JSONB, -- Store as JSON array for compatibility
  video_timestamp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_embeddings
ALTER TABLE public.mentor_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_embeddings
CREATE POLICY "Admins can manage embeddings"
  ON public.mentor_embeddings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mentor_conversations table for chat history
CREATE TABLE public.mentor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_conversations
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_conversations
CREATE POLICY "Users can view own conversations"
  ON public.mentor_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.mentor_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.mentor_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON public.mentor_conversations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mentor_messages table for individual messages in conversations
CREATE TABLE public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_messages
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_messages
CREATE POLICY "Users can view messages of own conversations"
  ON public.mentor_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mentor_conversations c
    WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to own conversations"
  ON public.mentor_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentor_conversations c
    WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all messages"
  ON public.mentor_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updating timestamps
CREATE TRIGGER update_mentor_settings_updated_at
  BEFORE UPDATE ON public.mentor_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_documents_updated_at
  BEFORE UPDATE ON public.mentor_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_conversations_updated_at
  BEFORE UPDATE ON public.mentor_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default mentor settings
INSERT INTO public.mentor_settings (mentor_name, welcome_message)
VALUES ('Héctor Galensky', '¡Hola! Soy tu mentor virtual. Puedo responder tus preguntas citando directamente las enseñanzas de los cursos. ¿En qué te puedo ayudar?');

-- Create storage bucket for mentor files
INSERT INTO storage.buckets (id, name, public) VALUES ('mentor-files', 'mentor-files', false);

-- Storage policies for mentor files
CREATE POLICY "Admins can upload mentor files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mentor-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mentor files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'mentor-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mentor files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'mentor-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view mentor files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mentor-files' AND auth.uid() IS NOT NULL);

-- Create storage bucket for mentor avatar
INSERT INTO storage.buckets (id, name, public) VALUES ('mentor-avatar', 'mentor-avatar', true);

-- Storage policies for mentor avatar
CREATE POLICY "Admins can manage mentor avatar"
  ON storage.objects FOR ALL
  USING (bucket_id = 'mentor-avatar' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view mentor avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mentor-avatar');