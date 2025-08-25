-- Update RLS policy for emergency_units to include police_admin role
DROP POLICY IF EXISTS "Police staff can view all units" ON public.emergency_units;

CREATE POLICY "Police staff can view all units" 
ON public.emergency_units 
FOR SELECT 
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR 
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'police_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update RLS policy for emergency_unit_members to include police_admin role
DROP POLICY IF EXISTS "Police staff can view unit members" ON public.emergency_unit_members;

CREATE POLICY "Police staff can view unit members" 
ON public.emergency_unit_members 
FOR SELECT 
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR 
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'police_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update the management policy for emergency_units to include police_admin
DROP POLICY IF EXISTS "Police supervisors can manage units" ON public.emergency_units;

CREATE POLICY "Police supervisors can manage units" 
ON public.emergency_units 
FOR ALL 
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update the management policy for emergency_unit_members to include police_admin
DROP POLICY IF EXISTS "Police supervisors can manage unit members" ON public.emergency_unit_members;

CREATE POLICY "Police supervisors can manage unit members" 
ON public.emergency_unit_members 
FOR ALL 
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);