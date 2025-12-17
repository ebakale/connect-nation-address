-- Drop the existing function
DROP FUNCTION IF EXISTS public.flag_address_for_review(uuid, text, uuid);

-- Recreate with correct logic that doesn't violate constraints
CREATE OR REPLACE FUNCTION public.flag_address_for_review(
  p_address_id uuid, 
  p_reason text, 
  p_flagged_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  address_record addresses%ROWTYPE;
BEGIN
  -- Get the address details
  SELECT * INTO address_record 
  FROM public.addresses 
  WHERE id = p_address_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create a new address request for re-review
  INSERT INTO public.address_requests (
    requester_id,
    latitude,
    longitude,
    street,
    city,
    region,
    country,
    building,
    address_type,
    description,
    photo_url,
    status,
    justification,
    flagged,
    flag_reason,
    flagged_by,
    flagged_at
  ) VALUES (
    address_record.user_id,
    address_record.latitude,
    address_record.longitude,
    address_record.street,
    address_record.city,
    address_record.region,
    address_record.country,
    address_record.building,
    address_record.address_type,
    address_record.description,
    address_record.photo_url,
    'pending',
    'Re-review required: ' || p_reason,
    true,
    p_reason,
    p_flagged_by,
    now()
  );
  
  -- Update the original address - DO NOT change verified status (violates constraint)
  UPDATE public.addresses 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    public = false  -- Hide from public view but keep verified
  WHERE id = p_address_id;
  
  RETURN TRUE;
END;
$$;