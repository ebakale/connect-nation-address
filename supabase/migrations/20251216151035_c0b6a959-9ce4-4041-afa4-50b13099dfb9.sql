-- Update RLS policy for delivery_proof to include dependent deliveries
DROP POLICY IF EXISTS "Recipients can view delivery proof" ON delivery_proof;

CREATE POLICY "Recipients can view delivery proof" ON delivery_proof
FOR SELECT USING (
  order_id IN (
    SELECT dord.id FROM delivery_orders dord
    WHERE (
      -- User's own addresses (via person record)
      dord.recipient_address_uac IN (
        SELECT ca.uac 
        FROM citizen_address ca 
        JOIN person p ON (ca.person_id = p.id) 
        WHERE (p.auth_user_id = auth.uid())
      )
      OR
      -- Addresses declared for user's dependents
      dord.recipient_address_uac IN (
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
        AND LOWER(TRIM(hd.full_name)) = LOWER(TRIM(dord.recipient_name))
      )
    )
  )
);

-- Update RLS policy for delivery_status_logs to include dependent deliveries
DROP POLICY IF EXISTS "Recipients can view status logs" ON delivery_status_logs;

CREATE POLICY "Recipients can view status logs" ON delivery_status_logs
FOR SELECT USING (
  order_id IN (
    SELECT dord.id FROM delivery_orders dord
    WHERE (
      -- User's own addresses (via person record)
      dord.recipient_address_uac IN (
        SELECT ca.uac 
        FROM citizen_address ca 
        JOIN person p ON (ca.person_id = p.id) 
        WHERE (p.auth_user_id = auth.uid())
      )
      OR
      -- Addresses declared for user's dependents
      dord.recipient_address_uac IN (
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
        AND LOWER(TRIM(hd.full_name)) = LOWER(TRIM(dord.recipient_name))
      )
    )
  )
);