DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a valid lead" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
  AND (message IS NULL OR length(message) <= 5000)
  AND (source IS NULL OR length(source) <= 100)
);

DROP POLICY IF EXISTS "Anyone can update preview feedback" ON public.site_previews;
DROP POLICY IF EXISTS "Anyone can insert site previews" ON public.site_previews;
CREATE POLICY "Anyone can insert valid site previews" ON public.site_previews FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(client_name)) BETWEEN 1 AND 200
  AND length(plan) <= 50
  AND (client_phone IS NULL OR length(client_phone) <= 40)
  AND (client_email IS NULL OR length(client_email) <= 255)
  AND (segment IS NULL OR length(segment) <= 200)
  AND (slogan IS NULL OR length(slogan) <= 500)
  AND (color_palette IS NULL OR length(color_palette) <= 50)
  AND feedback IS NULL AND feedback_at IS NULL
  AND (html_storage_path IS NULL OR html_storage_path ~ '^previews/[A-Za-z0-9._-]+\.html$')
);

CREATE OR REPLACE FUNCTION public.submit_preview_feedback(_preview_id uuid, _feedback text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _feedback NOT IN ('like','dislike') THEN RAISE EXCEPTION 'invalid feedback'; END IF;
  UPDATE public.site_previews SET feedback = _feedback, feedback_at = now()
  WHERE id = _preview_id AND feedback IS NULL;
END; $$;
REVOKE ALL ON FUNCTION public.submit_preview_feedback(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_preview_feedback(uuid, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can upload preview assets" ON storage.objects;
CREATE POLICY "Anyone can upload preview images" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'preview-assets'
  AND name ~* '^(logos|banners|gallery)/[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif|svg|avif)$'
);
DROP POLICY IF EXISTS "Anyone can upload site previews" ON storage.objects;
CREATE POLICY "Anyone can upload preview html" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'site-previews'
  AND name ~ '^previews/[A-Za-z0-9._-]+\.html$'
);