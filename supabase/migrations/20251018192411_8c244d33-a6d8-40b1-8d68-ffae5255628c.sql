-- Add missing user_id column to addresses table
-- This column is required to track which user owns/created each address
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Backfill existing addresses with created_by_authority where applicable
-- For NAR-created addresses, we'll leave user_id NULL as they're authority-created
-- For user-created addresses, we need manual intervention or leave NULL
UPDATE public.addresses 
SET user_id = created_by_authority 
WHERE created_by_authority IS NOT NULL 
  AND user_id IS NULL;