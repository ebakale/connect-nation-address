-- RLS policy allowing recipients to view deliveries addressed to their UACs
CREATE POLICY "Recipients can view their own deliveries"
ON public.delivery_orders FOR SELECT
USING (
  recipient_address_uac IN (
    SELECT ca.uac FROM citizen_address ca
    JOIN person p ON ca.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
  )
);

-- Also allow recipients to view status logs for their deliveries
CREATE POLICY "Recipients can view status logs for their deliveries"
ON public.delivery_status_logs FOR SELECT
USING (
  order_id IN (
    SELECT d_orders.id FROM delivery_orders d_orders
    WHERE d_orders.recipient_address_uac IN (
      SELECT ca.uac FROM citizen_address ca
      JOIN person p ON ca.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
  )
);

-- Allow recipients to view delivery proof for their deliveries
CREATE POLICY "Recipients can view delivery proof for their deliveries"
ON public.delivery_proof FOR SELECT
USING (
  order_id IN (
    SELECT d_orders.id FROM delivery_orders d_orders
    WHERE d_orders.recipient_address_uac IN (
      SELECT ca.uac FROM citizen_address ca
      JOIN person p ON ca.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
  )
);