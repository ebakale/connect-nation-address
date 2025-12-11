-- Add a new SELECT policy for CAR staff to view all person records
CREATE POLICY "CAR staff can view all person records" ON public.person
  FOR SELECT USING (
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'verifier'::app_role)
  );