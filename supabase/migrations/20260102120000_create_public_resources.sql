-- Banco de recursos gratuitos (lead magnets de la página pública /recursos).
-- El admin sube/activa desde /producer/resources; solo lo que está enabled=true
-- se muestra y se entrega en la página pública.
CREATE TABLE public.public_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Guía PDF',
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'file' CHECK (kind IN ('file', 'link')),
  url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.public_resources ENABLE ROW LEVEL SECURITY;

-- Admins gestionan el banco completo (incluye lo deshabilitado)
CREATE POLICY "Admins can manage public resources"
  ON public.public_resources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Cualquier visitante (incluido anónimo) ve solo lo habilitado
CREATE POLICY "Anyone can view enabled public resources"
  ON public.public_resources
  FOR SELECT
  USING (enabled = true);

CREATE TRIGGER update_public_resources_updated_at
  BEFORE UPDATE ON public.public_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket de almacenamiento para los archivos del banco de recursos
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-resources', 'public-resources', true);

CREATE POLICY "Admins can manage public resource files"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'public-resources' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'public-resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view public resource files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'public-resources');
