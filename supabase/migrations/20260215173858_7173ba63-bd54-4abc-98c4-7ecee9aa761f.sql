
CREATE TABLE public.extra_revenue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  amount_cents integer NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view extra_revenue" ON public.extra_revenue FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert extra_revenue" ON public.extra_revenue FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update extra_revenue" ON public.extra_revenue FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete extra_revenue" ON public.extra_revenue FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
