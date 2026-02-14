
-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'proposal' or 'project'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'status_changed', 'created', 'deleted', 'checklist_updated', etc.
  details JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.activity_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_activity_logs_entity ON public.activity_logs (entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs (created_at DESC);

-- Project checklist items table
CREATE TABLE public.project_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view checklist" ON public.project_checklist FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert checklist" ON public.project_checklist FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update checklist" ON public.project_checklist FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete checklist" ON public.project_checklist FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_checklist_project ON public.project_checklist (project_id);
