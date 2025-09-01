-- Allow NDAA admins to view all roles in user_roles
CREATE POLICY IF NOT EXISTS "NDAA admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'ndaa_admin'::app_role));