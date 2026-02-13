ALTER TABLE public.proposals
ADD CONSTRAINT amount_cents_positive CHECK (amount_cents > 0 AND amount_cents <= 100000000);

ALTER TABLE public.proposals
ADD CONSTRAINT installments_valid CHECK (installments >= 1 AND installments <= 12);