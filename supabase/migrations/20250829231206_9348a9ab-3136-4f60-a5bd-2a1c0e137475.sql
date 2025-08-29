-- Allow unit operators to acknowledge messages for their unit or direct messages
CREATE POLICY "Operators can acknowledge unit communications" 
ON public.unit_communications
FOR UPDATE
USING (
  -- Direct message to the user
  to_user_id = auth.uid()
  OR
  -- Member of the targeted or originating unit
  EXISTS (
    SELECT 1 FROM public.emergency_unit_members eum
    WHERE eum.officer_id = auth.uid()
      AND (
        eum.unit_id = from_unit_id
        OR (
          metadata ? 'target_unit_id' 
          AND (metadata->>'target_unit_id') = eum.unit_id::text
        )
      )
  )
)
WITH CHECK (
  acknowledged = true AND acknowledged_by = auth.uid()
);
