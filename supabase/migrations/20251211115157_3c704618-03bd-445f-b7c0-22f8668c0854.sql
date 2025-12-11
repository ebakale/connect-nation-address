-- Update household_groups SELECT policy to include car_admin
DROP POLICY IF EXISTS "Verifiers can view all household groups" ON public.household_groups;
CREATE POLICY "Verifiers can view all household groups" ON public.household_groups
  FOR SELECT USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Update household_members SELECT policy to include car_admin
DROP POLICY IF EXISTS "Verifiers can view all members" ON public.household_members;
CREATE POLICY "Verifiers can view all members" ON public.household_members
  FOR SELECT USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Update household_dependents SELECT policy to include car_admin
DROP POLICY IF EXISTS "Verifiers can view all dependents" ON public.household_dependents;
CREATE POLICY "Verifiers can view all dependents" ON public.household_dependents
  FOR SELECT USING (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'car_verifier'::app_role) OR 
    has_role(auth.uid(), 'car_admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );