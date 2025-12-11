-- Update RLS policy on user_roles to include car_admin
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'police_admin'::app_role) OR
    has_role(auth.uid(), 'car_admin'::app_role)
  );

-- Update RLS policy on user_role_metadata to include car_admin
DROP POLICY IF EXISTS "Admins can view all role metadata" ON user_role_metadata;
CREATE POLICY "Admins can view all role metadata" ON user_role_metadata
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'ndaa_admin'::app_role) OR 
    has_role(auth.uid(), 'police_admin'::app_role) OR
    has_role(auth.uid(), 'car_admin'::app_role)
  );