-- Add RLS policy for postal clerks to update pending intake orders to ready for assignment
CREATE POLICY "Postal clerks can update pending orders to ready"
ON public.delivery_orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role)
  AND status = 'pending_intake'
)
WITH CHECK (
  has_role(auth.uid(), 'postal_clerk'::app_role)
  AND status = 'ready_for_assignment'
);