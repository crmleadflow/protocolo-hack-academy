-- Create enum for achievement categories
CREATE TYPE public.achievement_category AS ENUM ('progress', 'social', 'milestone');

-- Create achievements definition table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user achievements (unlocked badges)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user XP and level tracking
CREATE TABLE public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  modules_completed INTEGER NOT NULL DEFAULT 0,
  programs_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read for all definitions)
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- User achievements policies
CREATE POLICY "Users can view own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user achievements"
ON public.user_achievements FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- User XP policies
CREATE POLICY "Users can view own XP"
ON public.user_xp FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP"
ON public.user_xp FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own XP"
ON public.user_xp FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all XP"
ON public.user_xp FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_xp_updated_at
BEFORE UPDATE ON public.user_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, icon, xp_reward, requirement_type, requirement_value, sort_order) VALUES
-- Progress achievements
('Primera Lección', 'Completa tu primera lección', 'progress', 'play', 50, 'lessons_completed', 1, 1),
('Estudiante Dedicado', 'Completa 10 lecciones', 'progress', 'book-open', 150, 'lessons_completed', 10, 2),
('Aprendiz Incansable', 'Completa 50 lecciones', 'progress', 'graduation-cap', 500, 'lessons_completed', 50, 3),
('Primer Módulo', 'Completa tu primer módulo', 'progress', 'folder-check', 100, 'modules_completed', 1, 4),
('Dominador de Módulos', 'Completa 5 módulos', 'progress', 'folders', 300, 'modules_completed', 5, 5),
('Programa Completo', 'Termina un programa completo', 'progress', 'award', 500, 'programs_completed', 1, 6),
('Coleccionista', 'Completa 3 programas', 'progress', 'trophy', 1500, 'programs_completed', 3, 7),

-- Social achievements
('Primer Comentario', 'Deja tu primer comentario en la comunidad', 'social', 'message-circle', 25, 'comments_made', 1, 10),
('Colaborador Activo', 'Haz 10 comentarios en la comunidad', 'social', 'messages-square', 100, 'comments_made', 10, 11),
('Ayudante Estrella', 'Recibe 5 likes en tus comentarios', 'social', 'heart', 150, 'likes_received', 5, 12),

-- Milestone achievements
('Bienvenido', 'Únete a Protocolo Hack', 'milestone', 'user-plus', 25, 'account_created', 1, 20),
('Primera Compra', 'Adquiere tu primer programa', 'milestone', 'shopping-cart', 100, 'purchases_made', 1, 21),
('Racha de 7 Días', 'Estudia 7 días consecutivos', 'milestone', 'flame', 200, 'streak_days', 7, 22),
('Racha de 30 Días', 'Estudia 30 días consecutivos', 'milestone', 'zap', 1000, 'streak_days', 30, 23),
('Veterano', '1 año en la plataforma', 'milestone', 'calendar', 500, 'days_since_signup', 365, 24);