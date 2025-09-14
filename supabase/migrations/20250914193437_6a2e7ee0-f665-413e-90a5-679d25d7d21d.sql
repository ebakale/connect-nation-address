-- Adjust RLS to prevent supervisors from selecting all units globally
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Police supervisors can manage units" ON public.emergency_units;

-- Recreate granular policies without granting unrestricted SELECT
CREATE POLICY "Police supervisors can insert units"
ON public.emergency_units
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'police_supervisor'::app_role)
  OR has_role(auth.uid(), 'police_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Police supervisors can update units"
ON public.emergency_units
FOR UPDATE
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role)
  OR has_role(auth.uid(), 'police_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Optional: allow delete if previously intended
CREATE POLICY "Police supervisors can delete units"
ON public.emergency_units
FOR DELETE
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role)
  OR has_role(auth.uid(), 'police_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Keep existing SELECT policies:
-- 1) Admins/dispatchers can view all units
-- 2) Operators view own units
-- 3) Supervisors view units in geographic scope
