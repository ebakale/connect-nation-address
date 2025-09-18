-- Fix the function security by adding search path
CREATE OR REPLACE FUNCTION get_rejected_addresses_queue()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  latitude double precision,
  longitude double precision,
  street text,
  city text,
  region text,
  country text,
  building text,
  address_type text,
  description text,
  justification text,
  rejection_reason text,
  rejection_notes text,
  rejected_by uuid,
  rejected_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    address_requests.id,
    address_requests.user_id,
    address_requests.latitude,
    address_requests.longitude,
    address_requests.street,
    address_requests.city,
    address_requests.region,
    address_requests.country,
    address_requests.building,
    address_requests.address_type,
    address_requests.description,
    address_requests.justification,
    address_requests.rejection_reason,
    address_requests.rejection_notes,
    address_requests.rejected_by,
    address_requests.rejected_at,
    address_requests.created_at
  FROM address_requests
  WHERE address_requests.status = 'rejected'
  ORDER BY address_requests.rejected_at DESC NULLS LAST;
END;
$$;