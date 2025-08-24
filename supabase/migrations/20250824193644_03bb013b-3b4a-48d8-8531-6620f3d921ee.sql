-- Fix all geographical inconsistencies in the emergency response system

-- 1. Fix units with coverage area in Malabo but current location in Bata
-- Units 5 and 8 are assigned to Malabo coverage but located in Bata facilities

-- Update UNIT-005 (Echo Emergency Response) - Fire Station in Bata should cover Bata
UPDATE public.emergency_units 
SET 
  coverage_city = 'Bata',
  coverage_region = 'Litoral'
WHERE unit_code = 'UNIT-005' 
  AND unit_name = 'Echo Emergency Response'
  AND current_location = 'Fire Station - Bata';

-- Update UNIT-008 (Hotel Marine Unit) - Port Authority in Bata should cover Bata coastal areas
UPDATE public.emergency_units 
SET 
  coverage_city = 'Bata',
  coverage_region = 'Litoral'
WHERE unit_code = 'UNIT-008' 
  AND unit_name = 'Hotel Marine Unit'
  AND current_location = 'Port Authority - Bata';

-- 2. Update user role assignments to match the new unit coverage areas
-- Since we now have units covering both Malabo and Bata, we need dispatchers for both cities

-- Keep current Malabo assignment as is, but add Bata assignments for some users
-- Add Gerard (police_operator) to Bata since he's assigned to a unit that should cover Bata areas
INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value)
SELECT ur.id, 'city', 'Bata'
FROM public.user_roles ur 
WHERE ur.user_id = '13ff3b27-1b54-417d-a0f1-9313663f4b4f' -- Gerard
  AND ur.role = 'police_operator'
ON CONFLICT DO NOTHING;

-- Remove old Malabo assignment for Gerard since his unit now covers Bata
DELETE FROM public.user_role_metadata 
WHERE user_role_id IN (
  SELECT ur.id 
  FROM public.user_roles ur 
  WHERE ur.user_id = '13ff3b27-1b54-417d-a0f1-9313663f4b4f' 
    AND ur.role = 'police_operator'
) AND scope_type = 'city' AND scope_value = 'Malabo';

-- 3. Fix incidents that have NULL city/region
UPDATE public.emergency_incidents 
SET 
  city = 'Malabo',
  region = 'Bioko Norte'
WHERE city IS NULL OR region IS NULL;

-- 4. Update incidents assigned to units that changed coverage areas
-- Update incidents assigned to UNIT-005 and UNIT-008 to be in Bata
UPDATE public.emergency_incidents 
SET 
  city = 'Bata',
  region = 'Litoral'
WHERE assigned_units @> ARRAY['UNIT-005']
   OR assigned_units @> ARRAY['UNIT-008']
   OR assigned_units @> ARRAY[(SELECT id::text FROM emergency_units WHERE unit_code = 'UNIT-005')]
   OR assigned_units @> ARRAY[(SELECT id::text FROM emergency_units WHERE unit_code = 'UNIT-008')];