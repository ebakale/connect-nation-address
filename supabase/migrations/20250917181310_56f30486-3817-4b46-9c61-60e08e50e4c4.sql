-- Ensure a policy exists to allow staff to delete addresses (needed for merge)
DROP POLICY IF EXISTS "Staff can delete addresses" ON public.addresses;

CREATE POLICY "Staff can delete addresses"
ON public.addresses
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'verifier'::app_role)
  OR has_role(auth.uid(), 'registrar'::app_role)
);
