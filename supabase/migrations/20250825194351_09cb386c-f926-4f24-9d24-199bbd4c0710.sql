-- Check current policies for emergency_incidents
-- First drop existing policies and recreate them with police_admin access

-- Drop the existing policy that might be restrictive
DROP POLICY IF EXISTS "Police admins can view all incidents" ON public.emergency_incidents;

-- Recreate the policy to include police_admin role
CREATE POLICY "Police admins can view all incidents"
ON public.emergency_incidents
FOR SELECT
USING (has_role(auth.uid(), 'police_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'police_operator'::app_role) OR has_role(auth.uid(), 'police_supervisor'::app_role) OR has_role(auth.uid(), 'police_dispatcher'::app_role));