-- Update approve_address_request to auto-publish non-residential addresses
CREATE OR REPLACE FUNCTION public.approve_address_request(p_request_id uuid, p_approved_by uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id UUID;
  generated_uac TEXT;
BEGIN
  -- Get the request
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not pending';
  END IF;
  
  -- Generate UAC
  generated_uac := public.generate_uac(
    request_record.country,
    request_record.region,
    request_record.city,
    request_record.latitude,
    request_record.longitude
  );
  
  -- Create the address - auto-publish non-residential, keep residential private
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
    true,
    CASE 
      WHEN request_record.address_type = 'residential' THEN false
      ELSE true  -- All non-residential addresses are auto-published
    END,
    request_record.verification_analysis,
    request_record.verification_recommendations
  ) RETURNING id INTO new_address_id;
  
  -- Update request status
  UPDATE public.address_requests 
  SET 
    status = 'approved',
    reviewed_by = p_approved_by,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN new_address_id;
END;
$function$;

-- Update approve_address_request_with_duplicate_check to auto-publish non-residential addresses
CREATE OR REPLACE FUNCTION public.approve_address_request_with_duplicate_check(p_request_id uuid, p_approved_by uuid DEFAULT auth.uid(), p_ignore_duplicates boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id UUID;
  generated_uac TEXT;
  duplicate_check_result jsonb;
BEGIN
  -- Get the request
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or not pending');
  END IF;
  
  -- Check for duplicates unless explicitly ignored
  IF NOT p_ignore_duplicates THEN
    duplicate_check_result := public.check_address_duplicates(
      request_record.latitude,
      request_record.longitude,
      request_record.street,
      request_record.city,
      request_record.region,
      request_record.country
    );
    
    -- If duplicates found, return for review
    IF (duplicate_check_result->>'has_duplicates')::boolean THEN
      RETURN jsonb_build_object(
        'success', false,
        'requires_review', true,
        'duplicate_check', duplicate_check_result,
        'message', 'Potential duplicates found. Review and approve with ignore_duplicates=true to proceed.'
      );
    END IF;
  END IF;
  
  -- Generate UAC
  generated_uac := public.generate_uac(
    request_record.country,
    request_record.region,
    request_record.city,
    request_record.latitude,
    request_record.longitude
  );
  
  -- Create the address - auto-publish non-residential, keep residential private
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
    true,
    CASE 
      WHEN request_record.address_type = 'residential' THEN false
      ELSE true  -- All non-residential addresses are auto-published
    END,
    request_record.verification_analysis,
    request_record.verification_recommendations
  ) RETURNING id INTO new_address_id;
  
  -- Update request status
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
$function$;