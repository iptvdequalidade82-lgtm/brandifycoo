
ALTER TABLE public.proposals
ADD COLUMN init_method text NOT NULL DEFAULT 'pix',
ADD COLUMN final_method text NOT NULL DEFAULT 'pix',
ADD COLUMN final_cakto_checkout_url text,
ADD COLUMN final_cakto_offer_id text;
