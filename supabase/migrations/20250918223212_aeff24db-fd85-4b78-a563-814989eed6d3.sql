-- Update residency verification to link to citizen addresses instead of address requests
-- This implements the workflow: CAR Address Declaration → Verification Request → Verified CAR Address

-- Add citizen_address_id column to residency_ownership_verifications
ALTER TABLE public.residency_ownership_verifications 
ADD COLUMN citizen_address_id UUID REFERENCES public.citizen_address(id);

-- Make address_request_id nullable since we're moving away from it
ALTER TABLE public.residency_ownership_verifications 
ALTER COLUMN address_request_id DROP NOT NULL;

-- Update the initiate_residency_verification function to work with citizen addresses
CREATE OR REPLACE FUNCTION public.initiate_residency_verification(
  p_user_id uuid, 
  p_citizen_address_id uuid, 
  p_verification_type text, 
  p_claimant_relationship text, 
  p_primary_document_type legal_document_type, 
  p_legal_basis text, 
  p_processing_purpose text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_verification_id UUID;
  v_person_id UUID;
BEGIN
  -- Verify that the citizen address belongs to the user
  SELECT ca.person_id INTO v_person_id
  FROM public.citizen_address ca
  JOIN public.person p ON ca.person_id = p.id
  WHERE ca.id = p_citizen_address_id AND p.auth_user_id = p_user_id;
  
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'Citizen address not found or does not belong to user';
  END IF;
  
  -- Create verification request
  INSERT INTO public.residency_ownership_verifications (
    user_id,
    citizen_address_id,
    verification_type,
    claimant_relationship,
    primary_document_type,
    legal_basis,
    processing_purpose,
    status
  ) VALUES (
    p_user_id,
    p_citizen_address_id,
    p_verification_type,
    p_claimant_relationship,
    p_primary_document_type,
    p_legal_basis,
    p_processing_purpose,
    'pending'::verification_status
  ) RETURNING id INTO v_verification_id;
  
  RETURN v_verification_id;
END;
$function$;

-- Create index for better performance on the new foreign key
CREATE INDEX IF NOT EXISTS idx_residency_verifications_citizen_address 
ON public.residency_ownership_verifications(citizen_address_id);

-- Add RLS policy for citizen address access in verifications
CREATE POLICY "Users can create verifications for their own citizen addresses"
ON public.residency_ownership_verifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.citizen_address ca
    JOIN public.person p ON ca.person_id = p.id
    WHERE ca.id = citizen_address_id AND p.auth_user_id = auth.uid()
  )
);