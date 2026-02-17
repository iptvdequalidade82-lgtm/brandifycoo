
-- Create expenses table for manual expense tracking
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'outros',
  amount_cents INTEGER NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view expenses" ON public.expenses FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert expenses" ON public.expenses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update expenses" ON public.expenses FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
