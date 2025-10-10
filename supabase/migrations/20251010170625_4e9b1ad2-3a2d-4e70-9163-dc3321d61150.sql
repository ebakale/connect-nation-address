-- Add contact_name and contact_phone columns to saved_locations table
ALTER TABLE public.saved_locations 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;