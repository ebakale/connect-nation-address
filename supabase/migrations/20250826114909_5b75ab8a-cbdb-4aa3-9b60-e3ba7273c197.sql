-- Find and assign Gerard Carmelo as police operator
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'police_operator'::app_role
FROM public.profiles p
WHERE p.full_name ILIKE '%Gerard Carmelo%'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id AND ur.role = 'police_operator'::app_role
);