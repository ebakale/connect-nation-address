-- 1. Update citizen_address SELECT policy
DROP POLICY IF EXISTS "Verifiers can view all addresses" ON public.citizen_address;
CREATE POLICY "Verifiers can view all addresses" ON public.citizen_address
  FOR SELECT USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Update citizen_address UPDATE policy
DROP POLICY IF EXISTS "Verifiers can update address status" ON public.citizen_address;
CREATE POLICY "Verifiers can update address status" ON public.citizen_address
  FOR UPDATE USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 3. Update citizen_address_event SELECT policy
DROP POLICY IF EXISTS "Verifiers can view all address events" ON public.citizen_address_event;
CREATE POLICY "Verifiers can view all address events" ON public.citizen_address_event
  FOR SELECT USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Update authorized_verifiers SELECT policy (for viewing verifier directory)
DROP POLICY IF EXISTS "Staff can view active verifiers" ON public.authorized_verifiers;
CREATE POLICY "Staff can view active verifiers" ON public.authorized_verifiers
  FOR SELECT USING (
    (is_active = true) AND (
      has_role(auth.uid(), 'verifier'::app_role) OR 
      has_role(auth.uid(), 'car_verifier'::app_role) OR 
      has_role(auth.uid(), 'car_admin'::app_role) OR 
      has_role(auth.uid(), 'registrar'::app_role)
    )
  );

-- 5. Update privacy_consent_log SELECT policy
DROP POLICY IF EXISTS "Admins can view consent logs" ON public.privacy_consent_log;
CREATE POLICY "Admins can view consent logs" ON public.privacy_consent_log
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role)
  );

-- 6. Update dependent_authorization_audit SELECT policy
DROP POLICY IF EXISTS "Admins can view all audits" ON public.dependent_authorization_audit;
CREATE POLICY "CAR staff can view all audits" ON public.dependent_authorization_audit
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role)
  );

-- 7. Update residency_ownership_verifications UPDATE policy
DROP POLICY IF EXISTS "CAR verifiers can update verifications" ON public.residency_ownership_verifications;
CREATE POLICY "CAR verifiers can update verifications" ON public.residency_ownership_verifications
  FOR UPDATE USING (
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );