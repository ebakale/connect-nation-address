-- Add policies to enable verification tools for staff roles

-- SELECT: verifiers, registrars, and admins can view all addresses
CREATE POLICY "Staff can view all addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'verifier') OR
  has_role(auth.uid(), 'registrar')
);

-- UPDATE: verifiers, registrars, and admins can update addresses
CREATE POLICY "Staff can update addresses"
ON public.addresses
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'verifier') OR
  has_role(auth.uid(), 'registrar')
);
