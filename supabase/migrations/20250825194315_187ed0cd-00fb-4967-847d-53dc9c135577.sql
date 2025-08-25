-- Grant police_admin read access to emergency_incidents so analytics can load
CREATE POLICY IF NOT EXISTS "Police admins can view all incidents"
ON public.emergency_incidents
FOR SELECT
USING (has_role(auth.uid(), 'police_admin'));
