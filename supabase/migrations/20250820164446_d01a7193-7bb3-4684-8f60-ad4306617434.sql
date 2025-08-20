-- Add rejection reason and resubmission tracking to address_requests
ALTER TABLE public.address_requests 
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS rejection_notes text,
ADD COLUMN IF NOT EXISTS rejected_by uuid,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resubmission_of uuid REFERENCES public.address_requests(id),
ADD COLUMN IF NOT EXISTS resubmission_count integer DEFAULT 0;

-- Add rejection tracking to addresses table  
ALTER TABLE public.addresses
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS rejection_notes text,
ADD COLUMN IF NOT EXISTS rejected_by uuid,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone;

-- Create function to reject address request with feedback
CREATE OR REPLACE FUNCTION public.reject_address_request_with_feedback(
  p_request_id uuid,
  p_rejection_reason text,
  p_rejection_notes text DEFAULT NULL,
  p_rejected_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.address_requests 
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    rejection_notes = p_rejection_notes,
    rejected_by = p_rejected_by,
    rejected_at = now(),
    reviewed_by = p_rejected_by,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Create function to reject flagged address with feedback
CREATE OR REPLACE FUNCTION public.reject_flagged_address_with_feedback(
  p_address_id uuid,
  p_rejection_reason text,
  p_rejection_notes text DEFAULT NULL,
  p_rejected_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the flagged address with rejection info
  UPDATE public.addresses 
  SET 
    flagged = false,
    verified = false,
    public = false,
    rejection_reason = p_rejection_reason,
    rejection_notes = p_rejection_notes,
    rejected_by = p_rejected_by,
    rejected_at = now(),
    flag_reason = NULL,
    flagged_by = NULL,
    flagged_at = NULL
  WHERE id = p_address_id;
  
  RETURN FOUND;
END;
$$;

-- Create function to allow users to resubmit rejected requests
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
  INSERT INTO public.address_requests (
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