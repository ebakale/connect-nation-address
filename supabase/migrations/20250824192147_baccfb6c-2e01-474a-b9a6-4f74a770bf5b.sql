-- Fix security definer view issue
-- Remove the available_officers view and replace with a proper query function

DROP VIEW IF EXISTS public.available_officers;

-- Create a secure function instead of a view
CREATE OR REPLACE FUNCTION public.get_available_officers()
RETURNS TABLE(
    user_id uuid,
    full_name text,
    role app_role,
    assignment_status text,
    current_unit text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    ur.role,
    CASE 
      WHEN eum.unit_id IS NOT NULL THEN 'assigned'
      ELSE 'available'
    END as assignment_status,
    eu.unit_name as current_unit
  FROM public.profiles p
  JOIN public.user_roles ur ON p.user_id = ur.user_id
  LEFT JOIN public.emergency_unit_members eum ON p.user_id = eum.officer_id
  LEFT JOIN public.emergency_units eu ON eum.unit_id = eu.id
  WHERE ur.role IN ('police_operator', 'police_dispatcher', 'police_supervisor');
$$;