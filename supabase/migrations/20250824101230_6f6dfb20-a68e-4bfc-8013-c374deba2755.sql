-- Add unencrypted message and contact fields for immediate police access
ALTER TABLE public.emergency_incidents 
ADD COLUMN IF NOT EXISTS incident_message TEXT,
ADD COLUMN IF NOT EXISTS reporter_contact_info TEXT;