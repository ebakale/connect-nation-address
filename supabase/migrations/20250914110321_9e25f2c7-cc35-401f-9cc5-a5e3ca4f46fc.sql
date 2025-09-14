-- Tighten emergency_units SELECT access to enforce supervisor geographic scoping
-- 1) Remove overly broad staff SELECT policy
DROP POLICY IF EXISTS "Police staff can view all units" ON public.emergency_units;

-- 2) Allow admins and dispatchers to view all units
CREATE POLICY "Admins and dispatchers can view all units"
ON public.emergency_units
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'police_admin'::app_role)
  OR has_role(auth.uid(), 'police_dispatcher'::app_role)
);

-- 3) Operators can view only units they belong to
CREATE POLICY "Operators can view own units"
ON public.emergency_units
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.emergency_unit_members eum
    WHERE eum.unit_id = emergency_units.id
      AND eum.officer_id = auth.uid()
  )
);

-- 4) Supervisors can view units within their geographic scope
-- Matches either city or region scope values (case-insensitive)
CREATE POLICY "Supervisors can view units in geographic scope"
ON public.emergency_units
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'police_supervisor'::app_role
      AND (
        (urm.scope_type IN ('geographic','city') AND lower(urm.scope_value) = lower(emergency_units.coverage_city))
        OR
        (urm.scope_type IN ('region','province') AND lower(urm.scope_value) = lower(emergency_units.coverage_region))
      )
  )
);
