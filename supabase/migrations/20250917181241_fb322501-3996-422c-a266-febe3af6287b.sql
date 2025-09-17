-- Allow staff roles to delete addresses (needed for duplicate merge from UI)
CREATE POLICY IF NOT EXISTS "Staff can delete addresses"
ON public.addresses
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'verifier'::app_role)
  OR has_role(auth.uid(), 'registrar'::app_role)
);
