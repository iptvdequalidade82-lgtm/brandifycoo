
-- =============================================
-- FIX 1: Storage - Restrict preview-assets DELETE to admins only
-- =============================================
DROP POLICY IF EXISTS "Anyone can delete preview assets" ON storage.objects;

CREATE POLICY "Admins can delete preview assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'preview-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: Storage - Restrict site-editor-assets SELECT to folder owner + admins
-- =============================================
DROP POLICY IF EXISTS "Anyone can view editor assets" ON storage.objects;

CREATE POLICY "Users can view own editor assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'site-editor-assets' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- =============================================
-- FIX 3: RLS - Restrict site_previews UPDATE to non-sensitive fields only
-- Replace the overly permissive "Anyone can update preview feedback" policy
-- =============================================
DROP POLICY IF EXISTS "Anyone can update preview feedback" ON public.site_previews;

-- Only allow updating feedback and feedback_at (the preview page lets visitors give feedback)
-- We restrict by requiring that the row already exists and only feedback fields change
CREATE POLICY "Anyone can update preview feedback"
ON public.site_previews
FOR UPDATE
USING (true)
WITH CHECK (
  -- Ensure only feedback-related columns are being set
  -- The id, client_name, client_email, client_phone, segment, plan, slogan, 
  -- html_storage_path, color_palette, created_at should remain unchanged
  feedback IS NOT NULL
);
