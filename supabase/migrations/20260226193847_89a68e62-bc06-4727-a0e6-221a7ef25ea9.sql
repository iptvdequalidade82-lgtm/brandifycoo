
-- Table to store user-created sites
CREATE TABLE public.user_sites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Meu Site',
  slug text,
  status text NOT NULL DEFAULT 'draft', -- draft, submitted, in_progress, completed
  submitted_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table to store individual blocks/sections of a site
CREATE TABLE public.site_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid NOT NULL REFERENCES public.user_sites(id) ON DELETE CASCADE,
  block_type text NOT NULL, -- hero, about, products, gallery, contact, faq, testimonials, cta
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb, -- flexible content storage
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_blocks ENABLE ROW LEVEL SECURITY;

-- RLS for user_sites
CREATE POLICY "Users can view own sites"
  ON public.user_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON public.user_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON public.user_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft sites"
  ON public.user_sites FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can manage all sites"
  ON public.user_sites FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS for site_blocks (through site ownership)
CREATE POLICY "Users can view own site blocks"
  ON public.site_blocks FOR SELECT
  USING (site_id IN (SELECT id FROM public.user_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own site blocks"
  ON public.site_blocks FOR INSERT
  WITH CHECK (site_id IN (SELECT id FROM public.user_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own site blocks"
  ON public.site_blocks FOR UPDATE
  USING (site_id IN (SELECT id FROM public.user_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own site blocks"
  ON public.site_blocks FOR DELETE
  USING (site_id IN (SELECT id FROM public.user_sites WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all site blocks"
  ON public.site_blocks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_user_sites_updated_at
  BEFORE UPDATE ON public.user_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_blocks_updated_at
  BEFORE UPDATE ON public.site_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for user-uploaded images in the editor
INSERT INTO storage.buckets (id, name, public) VALUES ('site-editor-assets', 'site-editor-assets', true);

-- Storage policies
CREATE POLICY "Users can upload editor assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-editor-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view editor assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-editor-assets');

CREATE POLICY "Users can update own editor assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-editor-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own editor assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-editor-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
