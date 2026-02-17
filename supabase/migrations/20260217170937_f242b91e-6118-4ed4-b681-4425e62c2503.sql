
-- Create a public bucket for preview uploads (temporary images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('preview-assets', 'preview-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

-- Allow anyone to upload to preview-assets bucket
CREATE POLICY "Anyone can upload preview assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'preview-assets');

-- Allow anyone to read preview assets (public)
CREATE POLICY "Anyone can read preview assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'preview-assets');

-- Allow anyone to delete their own preview assets
CREATE POLICY "Anyone can delete preview assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'preview-assets');
