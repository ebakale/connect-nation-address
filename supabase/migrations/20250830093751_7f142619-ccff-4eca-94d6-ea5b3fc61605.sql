-- Add field for unit/field notes separate from dispatcher notes
ALTER TABLE public.emergency_incidents 
ADD COLUMN IF NOT EXISTS field_notes TEXT;