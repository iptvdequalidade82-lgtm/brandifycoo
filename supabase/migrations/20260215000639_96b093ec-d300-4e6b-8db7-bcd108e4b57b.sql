
-- Create leads table to store contact form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Only admins can view leads
CREATE POLICY "Admins can view leads"
ON public.leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert a lead (public form)
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
