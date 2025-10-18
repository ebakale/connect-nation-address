-- Fix functions that still reference address_requests.user_id (renamed to requester_id)
-- 1) approve_address_request
CREATE OR REPLACE FUNCTION public.approve_address_request(
  p_request_id uuid,
  p_approved_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id uuid;
  generated_uac text;
BEGIN
  -- Get the address request details
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address request not found or not pending';
  END IF;
  
  -- Generate UAC for the new address
  generated_uac := generate_unified_uac_unique(
    request_record.country,
    request_record.region, 
    request_record.city,
    request_record.id
  );
  
  -- Create the address (use requester_id instead of old user_id)
  INSERT INTO public.addresses (
    user_id,
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
    uac,
    verified,
    public,
    verification_analysis,
    verification_recommendations
  ) VALUES (
    request_record.requester_id,
    request_record.latitude,
    request_record.longitude,
    request_record.street,
    request_record.city,
    request_record.region,
    request_record.country,
    request_record.building,
    request_record.address_type,
    request_record.description,
    request_record.photo_url,
    generated_uac,
    true,  -- Approved addresses are verified
    false, -- Initially private, can be made public later
    request_record.verification_analysis,
    request_record.verification_recommendations
  ) RETURNING id INTO new_address_id;
  
  -- Update the request status to approved
  UPDATE public.address_requests 
  SET 
    status = 'approved',
    reviewed_by = p_approved_by,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN new_address_id;
END;
$$;

-- 2) approve_address_request_with_duplicate_check
CREATE OR REPLACE FUNCTION public.approve_address_request_with_duplicate_check(
  p_request_id uuid,
  p_approved_by uuid DEFAULT auth.uid(),
  p_ignore_duplicates boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id uuid;
  generated_uac text;
  duplicate_check_result jsonb;
  result jsonb;
BEGIN
  -- Get the address request details
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Address request not found or not pending'
    );
  END IF;

  -- Check for duplicates unless ignored
  IF NOT p_ignore_duplicates THEN
    duplicate_check_result := public.check_address_duplicates(
      request_record.latitude,
      request_record.longitude,
      request_record.street,
      request_record.city,
      request_record.region,
      request_record.country
    );

    -- If duplicates found, return them for review
    IF (duplicate_check_result->>'has_duplicates')::boolean THEN
      -- Update request with duplicate analysis
      UPDATE public.address_requests 
      SET 
        verification_analysis = COALESCE(verification_analysis, '{}'::jsonb) || 
          jsonb_build_object('duplicate_check', duplicate_check_result),
        requires_manual_review = true
      WHERE id = p_request_id;

      RETURN jsonb_build_object(
        'success', false,
        'requires_review', true,
        'duplicate_analysis', duplicate_check_result,
        'message', 'Potential duplicates found. Manual review required.'
      );
    END IF;
  END IF;
  
  -- Generate UAC for the new address
  generated_uac := generate_unified_uac_unique(
    request_record.country,
    request_record.region, 
    request_record.city,
    request_record.id
  );
  
  -- Create the address (use requester_id instead of old user_id)
  INSERT INTO public.addresses (
    user_id,
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
    uac,
    verified,
    public,
    verification_analysis,
    verification_recommendations
  ) VALUES (
    request_record.requester_id,
    request_record.latitude,
    request_record.longitude,
    request_record.street,
    request_record.city,
    request_record.region,
    request_record.country,
    request_record.building,
    request_record.address_type,
    request_record.description,
    request_record.photo_url,
    generated_uac,
    true,  -- Approved addresses are verified
    false, -- Initially private, can be made public later
    COALESCE(request_record.verification_analysis, '{}'::jsonb) || 
      jsonb_build_object('duplicate_check', duplicate_check_result),
    request_record.verification_recommendations
  ) RETURNING id INTO new_address_id;
  
  -- Update the request status to approved
  UPDATE public.address_requests 
  SET 
    status = 'approved',
    reviewed_by = p_approved_by,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'address_id', new_address_id,
    'uac', generated_uac,
    'duplicate_check', duplicate_check_result
  );
END;
$$;

-- 3) flag_address_for_review (simple)
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
  
  -- Create a new address request for re-review (use requester_id)
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
  
  -- Update the original address to be non-public and unverified
  UPDATE public.addresses 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    verified = false,
    public = false
  WHERE id = p_address_id;
  
  RETURN TRUE;
END;
$$;

-- 4) flag_address_for_review with analysis
CREATE OR REPLACE FUNCTION public.flag_address_for_review(
  p_address_id uuid,
  p_reason text,
  p_analysis jsonb DEFAULT NULL::jsonb,
  p_recommendations text[] DEFAULT NULL::text[],
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
  
  -- Create a new address request for re-review with analysis data (use requester_id)
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
    flagged_at,
    verification_analysis,
    verification_recommendations
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
    now(),
    p_analysis,
    p_recommendations
  );
  
  -- Update the original address with flag info and analysis
  UPDATE public.addresses 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    verified = false,
    public = false,
    verification_analysis = p_analysis,
    verification_recommendations = p_recommendations
  WHERE id = p_address_id;
  
  RETURN TRUE;
END;
$$;