-- Assign police_admin role to genesisisabel@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'police_admin'::app_role
FROM profiles 
WHERE email = 'genesisisabel@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;