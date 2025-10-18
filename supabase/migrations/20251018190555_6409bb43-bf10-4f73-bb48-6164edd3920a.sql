-- Fix resubmit_address_request function to use correct column name
CREATE OR REPLACE FUNCTION public.resubmit_address_request(
  p_original_request_id uuid,
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_street text,
  p_city text,
  p_region text,
  p_country text,
  p_building text DEFAULT NULL,
  p_address_type text DEFAULT 'residential',
  p_description text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_justification text DEFAULT 'Resubmission after rejection feedback'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_request_id uuid;
  resubmission_count_val integer;
BEGIN
  -- Get current resubmission count
  SELECT COALESCE(resubmission_count, 0) + 1 
  INTO resubmission_count_val
  FROM public.address_requests 
  WHERE id = p_original_request_id;
  
  -- Create new request as resubmission
  -- Fixed: Use requester_id instead of user_id to match the actual column name
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
    justification,
    status,
    resubmission_of,
    resubmission_count
  ) VALUES (
    p_user_id,
    p_latitude,
    p_longitude,
    p_street,
    p_city,
    p_region,
    p_country,
    p_building,
    p_address_type,
    p_description,
    p_photo_url,
    p_justification,
    'pending',
    p_original_request_id,
    resubmission_count_val
  ) RETURNING id INTO new_request_id;
  
  RETURN new_request_id;
END;
$$;