-- Update emergency_type constraint to include all emergency types used in the frontend
ALTER TABLE public.emergency_incidents 
DROP CONSTRAINT emergency_incidents_emergency_type_check;

-- Add updated constraint that includes all valid emergency types
ALTER TABLE public.emergency_incidents 
ADD CONSTRAINT emergency_incidents_emergency_type_check 
CHECK (
  emergency_type IS NOT NULL 
  AND emergency_type <> '' 
  AND emergency_type = ANY (ARRAY[
    'police',
    'medical', 
    'fire',
    'general',
    'traffic',
    'accident',
    'natural_disaster',
    'other'
  ])
);