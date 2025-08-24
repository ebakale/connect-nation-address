-- Add coverage area field to emergency units table
ALTER TABLE public.emergency_units 
ADD COLUMN coverage_region text,
ADD COLUMN coverage_city text;