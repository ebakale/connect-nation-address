-- Check if the current_citizen_addresses view has RLS policies
-- and add them if not present

-- Enable RLS on the current_citizen_addresses view
ALTER VIEW current_citizen_addresses SET (security_invoker = true);

-- Create RLS policies for current_citizen_addresses view
DROP POLICY IF EXISTS "Citizens can view their own current addresses" ON current_citizen_addresses;
CREATE POLICY "Citizens can view their own current addresses" 
ON current_citizen_addresses 
FOR SELECT 
USING (person_id IN (
  SELECT person.id
  FROM person
  WHERE person.auth_user_id = auth.uid()
));

DROP POLICY IF EXISTS "Verifiers can view all current addresses" ON current_citizen_addresses;
CREATE POLICY "Verifiers can view all current addresses" 
ON current_citizen_addresses 
FOR SELECT 
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);