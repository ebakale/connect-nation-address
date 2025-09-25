-- Add RLS policy for CAR verifiers to access residency ownership verifications
CREATE POLICY "CAR verifiers can view all verifications" 
ON public.residency_ownership_verifications 
FOR SELECT 
USING (has_role(auth.uid(), 'car_verifier'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'registrar'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for CAR verifiers to update verification status
CREATE POLICY "CAR verifiers can update verifications" 
ON public.residency_ownership_verifications 
FOR UPDATE 
USING (has_role(auth.uid(), 'car_verifier'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'registrar'::app_role) OR has_role(auth.uid(), 'admin'::app_role));