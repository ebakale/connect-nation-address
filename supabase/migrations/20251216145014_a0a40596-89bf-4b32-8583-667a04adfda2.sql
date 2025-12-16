-- Update RLS policy to allow citizens to see deliveries to their dependents
DROP POLICY IF EXISTS "Recipients can view their own deliveries" ON delivery_orders;

CREATE POLICY "Recipients can view their own deliveries" ON delivery_orders
FOR SELECT USING (
  -- User's own addresses (via person record)
  recipient_address_uac IN (
    SELECT ca.uac 
    FROM citizen_address ca 
    JOIN person p ON (ca.person_id = p.id) 
    WHERE (p.auth_user_id = auth.uid())
  )
  OR
  -- Addresses declared for user's dependents
  recipient_address_uac IN (
    SELECT ca.uac 
    FROM citizen_address ca 
    JOIN household_dependents hd ON (ca.dependent_id = hd.id)
    WHERE (hd.guardian_user_id = auth.uid())
  )
  OR
  -- Deliveries where recipient name matches user's dependent
  EXISTS (
    SELECT 1 FROM household_dependents hd
    WHERE hd.guardian_user_id = auth.uid()
    AND LOWER(TRIM(hd.full_name)) = LOWER(TRIM(delivery_orders.recipient_name))
  )
);