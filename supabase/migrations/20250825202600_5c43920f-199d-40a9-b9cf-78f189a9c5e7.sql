-- Add city scope for Miguel Torres (police supervisor in Bata)
INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value)
SELECT ur.id, 'city', 'Bata'
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.user_id
WHERE p.full_name = 'Miguel Torres' 
AND ur.role = 'police_supervisor'
AND NOT EXISTS (
  SELECT 1 FROM public.user_role_metadata urm 
  WHERE urm.user_role_id = ur.id
);