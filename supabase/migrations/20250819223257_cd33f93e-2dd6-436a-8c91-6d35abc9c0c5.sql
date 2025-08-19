-- Add claimant type and proof of ownership to address requests
ALTER TABLE public.address_requests
ADD COLUMN claimant_type text NOT NULL DEFAULT 'resident',
ADD COLUMN proof_of_ownership_url text;