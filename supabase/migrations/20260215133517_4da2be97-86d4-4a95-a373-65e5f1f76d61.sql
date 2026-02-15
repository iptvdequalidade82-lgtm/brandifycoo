
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'cancelled'));
