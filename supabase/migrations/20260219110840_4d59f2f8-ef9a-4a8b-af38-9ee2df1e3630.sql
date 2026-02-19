
-- Table to persist Instagram content plans per month
CREATE TABLE public.instagram_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_key TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  month_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  week_niches JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_niches JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month_key, year)
);

ALTER TABLE public.instagram_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view instagram plans" ON public.instagram_plans FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert instagram plans" ON public.instagram_plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update instagram plans" ON public.instagram_plans FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete instagram plans" ON public.instagram_plans FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_instagram_plans_updated_at
BEFORE UPDATE ON public.instagram_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
