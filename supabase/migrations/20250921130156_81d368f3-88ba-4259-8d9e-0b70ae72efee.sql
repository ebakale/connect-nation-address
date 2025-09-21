-- Enable RLS on the citizen_address_with_details view
ALTER VIEW citizen_address_with_details SET (security_invoker = true);

-- Add RLS policies for citizen_address_with_details view to inherit from citizen_address table
CREATE POLICY "Citizens can view their own addresses with details" 
ON citizen_address_with_details 
FOR SELECT 
USING (person_id IN (
  SELECT person.id
  FROM person
  WHERE person.auth_user_id = auth.uid()
));

CREATE POLICY "Verifiers can view all addresses with details" 
ON citizen_address_with_details 
FOR SELECT 
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);