-- Allow staff roles to view and update addresses for verification/publishing
-- Note: Existing policies (owner can select/update, public select) remain in place

-- SELECT: verifiers, registrars, and admins can view all addresses
CREATE POLICY IF NOT EXISTS "Staff can view all addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'verifier') OR
  has_role(auth.uid(), 'registrar')
);

-- UPDATE: verifiers, registrars, and admins can update addresses
CREATE POLICY IF NOT EXISTS "Staff can update addresses"
ON public.addresses
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'verifier') OR
  has_role(auth.uid(), 'registrar')
);
