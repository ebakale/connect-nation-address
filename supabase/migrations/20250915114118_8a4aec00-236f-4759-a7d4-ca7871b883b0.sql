-- Create function to check for duplicate addresses
CREATE OR REPLACE FUNCTION public.check_address_duplicates(
  p_latitude numeric,
  p_longitude numeric,
  p_street text,
  p_city text,
  p_region text,
  p_country text,
  p_exclude_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  coordinate_duplicate_count integer := 0;
  address_duplicate_count integer := 0;
  coordinate_tolerance numeric := 0.0001; -- ~11 meters tolerance
  duplicate_results jsonb := '{}';
  coordinate_duplicates jsonb := '[]';
  address_duplicates jsonb := '[]';
BEGIN
  -- Check for coordinate duplicates (within tolerance)
  SELECT 
    COUNT(*),
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'uac', uac,
        'street', street,
        'verified', verified,
        'public', public,
        'distance_meters', ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        )
      )
    ), '[]'::jsonb)
  INTO coordinate_duplicate_count, coordinate_duplicates
  FROM public.addresses
  WHERE 
    ABS(latitude - p_latitude) < coordinate_tolerance
    AND ABS(longitude - p_longitude) < coordinate_tolerance
    AND (p_exclude_id IS NULL OR id != p_exclude_id);

  -- Check for exact address duplicates
  SELECT 
    COUNT(*),
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'uac', uac,
        'latitude', latitude,
        'longitude', longitude,
        'verified', verified,
        'public', public
      )
    ), '[]'::jsonb)
  INTO address_duplicate_count, address_duplicates
  FROM public.addresses
  WHERE 
    LOWER(TRIM(street)) = LOWER(TRIM(p_street))
    AND LOWER(TRIM(city)) = LOWER(TRIM(p_city))
    AND LOWER(TRIM(region)) = LOWER(TRIM(p_region))
    AND LOWER(TRIM(country)) = LOWER(TRIM(p_country))
    AND (p_exclude_id IS NULL OR id != p_exclude_id);

  -- Build result object
  duplicate_results := jsonb_build_object(
    'has_duplicates', (coordinate_duplicate_count > 0 OR address_duplicate_count > 0),
    'coordinate_duplicates', jsonb_build_object(
      'count', coordinate_duplicate_count,
      'matches', coordinate_duplicates
    ),
    'address_duplicates', jsonb_build_object(
      'count', address_duplicate_count,
      'matches', address_duplicates
    ),
    'summary', jsonb_build_object(
      'total_duplicates', coordinate_duplicate_count + address_duplicate_count,
      'coordinate_matches', coordinate_duplicate_count,
      'address_matches', address_duplicate_count
    )
  );

  RETURN duplicate_results;
END;
$function$;

-- Update the approve_address_request function to include duplicate checking
CREATE OR REPLACE FUNCTION public.approve_address_request_with_duplicate_check(
  p_request_id uuid, 
  p_approved_by uuid DEFAULT auth.uid(),
  p_ignore_duplicates boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Create the address
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
    request_record.user_id,
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
$function$;