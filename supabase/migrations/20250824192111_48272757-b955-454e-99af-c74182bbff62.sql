-- Add city assignment to user role metadata for dispatchers
-- This will allow dispatchers to be assigned to specific cities

-- First, let's add some sample city assignments for existing police users
-- We'll use the user_role_metadata table with scope_type = 'city'

-- Add city assignments for existing police dispatchers and operators
INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value)
SELECT ur.id, 'city', 'Malabo' 
FROM public.user_roles ur 
WHERE ur.role IN ('police_dispatcher', 'police_operator', 'police_supervisor')
ON CONFLICT DO NOTHING;

-- Update existing units to have city coverage
UPDATE public.emergency_units 
SET coverage_city = 'Malabo', coverage_region = 'Bioko Norte' 
WHERE coverage_city IS NULL;