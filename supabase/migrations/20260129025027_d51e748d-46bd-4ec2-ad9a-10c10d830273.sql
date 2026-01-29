-- =============================================
-- COMMUNITY SCHEMA: Foro, Feed, Q&A, Chat
-- =============================================

-- Enum para tipos de contenido en la comunidad
CREATE TYPE public.community_content_type AS ENUM ('discussion', 'question', 'announcement');
CREATE TYPE public.vote_type AS ENUM ('up', 'down');

-- =============================================
-- 1. POSTS - Discusiones y Preguntas del Foro
-- =============================================
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type community_content_type NOT NULL DEFAULT 'discussion',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_community_posts_program ON public.community_posts(program_id);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_type ON public.community_posts(content_type);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para posts
CREATE POLICY "Enrolled users can view posts"
ON public.community_posts FOR SELECT
USING (has_active_enrollment(auth.uid(), program_id));

CREATE POLICY "Enrolled users can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_active_enrollment(auth.uid(), program_id));

CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
ON public.community_posts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. COMENTARIOS - Respuestas a posts
-- =============================================
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted_answer BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user ON public.community_comments(user_id);
CREATE INDEX idx_community_comments_parent ON public.community_comments(parent_id);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentarios
CREATE POLICY "Enrolled users can view comments"
ON public.community_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.community_posts p
  WHERE p.id = post_id AND has_active_enrollment(auth.uid(), p.program_id)
));

CREATE POLICY "Enrolled users can create comments"
ON public.community_comments FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.community_posts p
  WHERE p.id = post_id AND has_active_enrollment(auth.uid(), p.program_id)
));

CREATE POLICY "Users can update own comments"
ON public.community_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.community_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
ON public.community_comments FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. LIKES - Para posts y comentarios
-- =============================================
CREATE TABLE public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE(user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_community_likes_user ON public.community_likes(user_id);
CREATE INDEX idx_community_likes_post ON public.community_likes(post_id);
CREATE INDEX idx_community_likes_comment ON public.community_likes(comment_id);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
ON public.community_likes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own likes"
ON public.community_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
ON public.community_likes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all likes"
ON public.community_likes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. VOTOS Q&A - Sistema tipo StackOverflow
-- =============================================
CREATE TABLE public.community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_vote UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_community_votes_comment ON public.community_votes(comment_id);

ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
ON public.community_votes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own votes"
ON public.community_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
ON public.community_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
ON public.community_votes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all votes"
ON public.community_votes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. CHAT EN TIEMPO REAL - Por programa
-- =============================================
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_messages_program ON public.community_messages(program_id);
CREATE INDEX idx_community_messages_created ON public.community_messages(created_at DESC);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view messages"
ON public.community_messages FOR SELECT
USING (has_active_enrollment(auth.uid(), program_id) AND is_deleted = false);

CREATE POLICY "Enrolled users can send messages"
ON public.community_messages FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_active_enrollment(auth.uid(), program_id));

CREATE POLICY "Users can soft delete own messages"
ON public.community_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all messages"
ON public.community_messages FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. TRIGGERS para contadores automáticos
-- =============================================

-- Trigger para actualizar updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para actualizar contador de comentarios
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Función para actualizar contador de likes en posts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Función para actualizar contador de likes en comentarios
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.comment_id IS NOT NULL THEN
    UPDATE public.community_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.comment_id IS NOT NULL THEN
    UPDATE public.community_comments 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_likes_count();

-- =============================================
-- 7. HABILITAR REALTIME PARA CHAT
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;