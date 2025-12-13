-- Add RLS policy for postal staff to view postal roles
CREATE POLICY "Postal staff can view postal roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'postal_dispatcher'::app_role) OR 
   has_role(auth.uid(), 'postal_supervisor'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
  AND role IN ('postal_agent'::app_role, 'postal_clerk'::app_role, 'postal_dispatcher'::app_role, 'postal_supervisor'::app_role)
);

-- Add RLS policy for postal staff to view profiles
CREATE POLICY "Postal staff can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);