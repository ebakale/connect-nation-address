-- Add backup request fields to emergency_incidents table
ALTER TABLE public.emergency_incidents 
ADD COLUMN IF NOT EXISTS backup_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS backup_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS backup_requesting_unit TEXT;