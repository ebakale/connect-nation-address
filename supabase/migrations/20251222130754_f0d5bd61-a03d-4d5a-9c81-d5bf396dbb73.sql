-- Allow postal agents to view addresses that are linked to their assigned delivery orders
CREATE POLICY "Postal agents can view delivery addresses"
ON public.addresses
FOR SELECT
USING (
  has_role(auth.uid(), 'postal_agent'::app_role) 
  AND EXISTS (
    SELECT 1 
    FROM delivery_orders orders
    JOIN delivery_assignments assignments ON assignments.order_id = orders.id
    WHERE assignments.agent_id = auth.uid()
    AND orders.recipient_address_uac = addresses.uac
  )
);