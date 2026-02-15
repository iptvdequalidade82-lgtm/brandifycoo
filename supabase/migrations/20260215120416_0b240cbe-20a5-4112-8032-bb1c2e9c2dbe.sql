
-- Add Cakto-specific columns to proposals
ALTER TABLE public.proposals 
  ADD COLUMN cakto_offer_id text,
  ADD COLUMN cakto_checkout_url text;
