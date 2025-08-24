-- Fix security definer view by removing it and creating a regular view instead
DROP VIEW public.available_officers;

-- Create a regular view without SECURITY DEFINER
CREATE VIEW public.available_officers AS
SELECT 
  p.user_id,
  p.full_name,
  ur.role,
  CASE 
    WHEN eum.unit_id IS NOT NULL THEN 'assigned'
    ELSE 'available'
  END as assignment_status,
  eu.unit_code as current_unit
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
LEFT JOIN public.emergency_unit_members eum ON p.user_id = eum.officer_id
LEFT JOIN public.emergency_units eu ON eum.unit_id = eu.id
WHERE ur.role IN ('police_operator', 'police_supervisor', 'police_dispatcher');