-- Add UAC and unencrypted location fields to emergency_incidents
ALTER TABLE public.emergency_incidents 
ADD COLUMN incident_uac text,
ADD COLUMN location_address text,
ADD COLUMN location_latitude numeric,
ADD COLUMN location_longitude numeric;

-- Update existing incidents with unencrypted location data
UPDATE public.emergency_incidents 
SET 
  location_address = CASE 
    WHEN encrypted_address IS NOT NULL THEN encrypted_address
    ELSE 'Location not specified'
  END,
  location_latitude = CASE 
    WHEN encrypted_latitude IS NOT NULL THEN 
      CASE 
        WHEN encrypted_latitude ~ '^[0-9.-]+$' THEN encrypted_latitude::numeric
        ELSE NULL
      END
    ELSE NULL
  END,
  location_longitude = CASE 
    WHEN encrypted_longitude IS NOT NULL THEN 
      CASE 
        WHEN encrypted_longitude ~ '^[0-9.-]+$' THEN encrypted_longitude::numeric
        ELSE NULL
      END
    ELSE NULL
  END;

-- Try to link incidents to existing addresses by finding nearest UAC
UPDATE public.emergency_incidents 
SET incident_uac = (
  SELECT a.uac 
  FROM public.addresses a 
  WHERE a.verified = true 
    AND a.latitude IS NOT NULL 
    AND a.longitude IS NOT NULL
    AND emergency_incidents.location_latitude IS NOT NULL
    AND emergency_incidents.location_longitude IS NOT NULL
    AND ST_DWithin(
      ST_Point(a.longitude, a.latitude)::geography,
      ST_Point(emergency_incidents.location_longitude, emergency_incidents.location_latitude)::geography,
      500  -- Within 500 meters
    )
  ORDER BY ST_Distance(
    ST_Point(a.longitude, a.latitude)::geography,
    ST_Point(emergency_incidents.location_longitude, emergency_incidents.location_latitude)::geography
  )
  LIMIT 1
)
WHERE incident_uac IS NULL;