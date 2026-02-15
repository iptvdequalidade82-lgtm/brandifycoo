-- Add payment tracking fields to projects
ALTER TABLE public.projects
ADD COLUMN total_amount_cents integer DEFAULT 0,
ADD COLUMN amount_received_cents integer DEFAULT 0,
ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'full'));