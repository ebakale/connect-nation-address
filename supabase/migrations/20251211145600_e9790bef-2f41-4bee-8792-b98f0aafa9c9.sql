-- Drop existing policy
DROP POLICY IF EXISTS "Police staff can view incident logs" ON emergency_incident_logs;

-- Create updated policy including police_admin
CREATE POLICY "Police staff can view incident logs"
ON emergency_incident_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR 
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'police_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);