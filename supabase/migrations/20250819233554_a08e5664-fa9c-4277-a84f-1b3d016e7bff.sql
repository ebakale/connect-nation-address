-- Allow verifiers and registrars to view user profiles so real user info appears in approval views
CREATE POLICY IF NOT EXISTS "Staff can view profiles (verifiers, registrars)"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'verifier'::app_role)
  OR has_role(auth.uid(), 'registrar'::app_role)
);
