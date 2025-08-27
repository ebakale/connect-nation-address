-- Ensure eucario_bakale@yahoo.com has ndaa_admin role
INSERT INTO user_roles (user_id, role) 
SELECT user_id, 'ndaa_admin'::app_role 
FROM profiles 
WHERE email = 'eucario_bakale@yahoo.com' 
AND user_id NOT IN (
  SELECT user_id 
  FROM user_roles 
  WHERE role = 'ndaa_admin'::app_role 
  AND user_id = (SELECT user_id FROM profiles WHERE email = 'eucario_bakale@yahoo.com')
);