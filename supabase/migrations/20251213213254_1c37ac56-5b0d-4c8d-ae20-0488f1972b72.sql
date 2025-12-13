-- Policy: Business owners can view addresses linked to their businesses
CREATE POLICY "Business owners can view their business addresses" 
ON public.addresses
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.organization_addresses oa
    WHERE oa.address_id = addresses.id 
      AND oa.created_by = auth.uid()
  )
);