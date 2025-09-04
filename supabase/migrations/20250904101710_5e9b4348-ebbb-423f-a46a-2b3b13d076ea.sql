-- First, normalize existing emergency types to match frontend values
UPDATE public.emergency_incidents 
SET emergency_type = CASE 
  WHEN emergency_type = 'Police Emergency' THEN 'police'
  WHEN emergency_type = 'Medical Emergency' THEN 'medical'
  WHEN emergency_type = 'Fire Emergency' THEN 'fire'
  WHEN emergency_type = 'General Emergency' THEN 'general'
  WHEN emergency_type = 'Traffic Emergency' THEN 'traffic'
  WHEN emergency_type = 'Accident Emergency' THEN 'accident'
  WHEN emergency_type = 'Natural Disaster Emergency' THEN 'natural_disaster'
  WHEN emergency_type = 'Other Emergency' THEN 'other'
  ELSE emergency_type
END
WHERE emergency_type IN ('Police Emergency', 'Medical Emergency', 'Fire Emergency', 'General Emergency', 'Traffic Emergency', 'Accident Emergency', 'Natural Disaster Emergency', 'Other Emergency');

-- Now update the constraint to include all valid emergency types
ALTER TABLE public.emergency_incidents 
DROP CONSTRAINT emergency_incidents_emergency_type_check;

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