-- Add RLS policy to allow CAR verifiers to view profiles of users with residency verifications
CREATE POLICY "CAR verifiers can view profiles for verification" 
ON profiles 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'car_verifier'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role)
);