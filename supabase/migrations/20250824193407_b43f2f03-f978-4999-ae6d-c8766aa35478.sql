-- Fix geographical inconsistencies for Bravo Response Team (UNIT-002)
-- Update coverage area to Bata (Litoral region) to match current location

-- Update the unit's coverage area
UPDATE public.emergency_units 
SET 
  coverage_city = 'Bata',
  coverage_region = 'Litoral'
WHERE unit_code = 'UNIT-002' AND unit_name = 'Bravo Response Team';

-- Update any incidents that have this unit assigned to be in Bata
UPDATE public.emergency_incidents 
SET 
  city = 'Bata',
  region = 'Litoral'
WHERE assigned_units @> ARRAY['UNIT-002']
   OR assigned_units @> ARRAY[(SELECT id::text FROM emergency_units WHERE unit_code = 'UNIT-002')];

-- Also update incidents that might reference the unit by name in dispatcher notes
UPDATE public.emergency_incidents 
SET 
  city = 'Bata',
  region = 'Litoral'
WHERE dispatcher_notes ILIKE '%Bravo Response Team%' 
   OR dispatcher_notes ILIKE '%UNIT-002%';