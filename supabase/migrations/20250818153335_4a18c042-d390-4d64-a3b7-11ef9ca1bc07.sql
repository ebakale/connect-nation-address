-- Add RLS policy to allow staff to create addresses for users when approving requests
CREATE POLICY "Staff can create addresses for users" 
ON public.addresses 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'verifier'::app_role) OR 
   has_role(auth.uid(), 'registrar'::app_role))
);