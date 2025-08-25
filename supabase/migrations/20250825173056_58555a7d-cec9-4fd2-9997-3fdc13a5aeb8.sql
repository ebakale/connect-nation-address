-- Update RLS policies to allow police_admin access

-- Update the profiles table policy to include police_admin
DROP POLICY IF EXISTS "Police staff can view profiles" ON public.profiles;
CREATE POLICY "Police staff can view profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'police_operator'::app_role) OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR 
       has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
       has_role(auth.uid(), 'police_admin'::app_role) OR 
       has_role(auth.uid(), 'admin'::app_role));

-- Update the user_roles table policies to include police_admin
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR 
       has_role(auth.uid(), 'police_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR 
       has_role(auth.uid(), 'police_admin'::app_role));

-- Update user_role_metadata policies to include police_admin
DROP POLICY IF EXISTS "Admins can view all role metadata" ON public.user_role_metadata;
CREATE POLICY "Admins can view all role metadata" 
ON public.user_role_metadata 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR 
       has_role(auth.uid(), 'ndaa_admin'::app_role) OR 
       has_role(auth.uid(), 'police_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage role metadata" ON public.user_role_metadata;
CREATE POLICY "Admins can manage role metadata" 
ON public.user_role_metadata 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR 
       has_role(auth.uid(), 'ndaa_admin'::app_role) OR 
       has_role(auth.uid(), 'police_admin'::app_role));