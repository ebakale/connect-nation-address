-- Add car_admin to profiles SELECT policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'ndaa_admin'::app_role) OR
    has_role(auth.uid(), 'car_admin'::app_role)
  );

-- Add car_admin to residency_ownership_verifications SELECT policy
DROP POLICY IF EXISTS "CAR verifiers can view all verifications" ON residency_ownership_verifications;
CREATE POLICY "CAR verifiers can view all verifications" ON residency_ownership_verifications
  FOR SELECT USING (
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );