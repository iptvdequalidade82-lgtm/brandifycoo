
-- Bucket para armazenar os HTMLs gerados
INSERT INTO storage.buckets (id, name, public) VALUES ('site-previews', 'site-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer um pode fazer upload (a edge function vai fazer)
CREATE POLICY "Anyone can upload site previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-previews');

-- Política: qualquer um pode ler (para renderizar no iframe)
CREATE POLICY "Anyone can read site previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-previews');

-- Política: admins podem deletar
CREATE POLICY "Admins can delete site previews"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-previews' AND public.has_role(auth.uid(), 'admin'));

-- Tabela para registrar as prévias geradas
CREATE TABLE public.site_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  segment TEXT,
  slogan TEXT,
  plan TEXT NOT NULL DEFAULT 'essencial',
  color_palette TEXT DEFAULT 'midnight',
  feedback TEXT CHECK (feedback IN ('like', 'dislike', NULL)),
  feedback_at TIMESTAMPTZ,
  html_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.site_previews ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (cliente que gera a prévia)
CREATE POLICY "Anyone can insert site previews"
ON public.site_previews FOR INSERT
WITH CHECK (true);

-- Qualquer um pode atualizar o feedback (apenas feedback e feedback_at)
CREATE POLICY "Anyone can update preview feedback"
ON public.site_previews FOR UPDATE
USING (true)
WITH CHECK (true);

-- Admins podem ver todas as prévias
CREATE POLICY "Admins can view site previews"
ON public.site_previews FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar
CREATE POLICY "Admins can delete site previews"
ON public.site_previews FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
