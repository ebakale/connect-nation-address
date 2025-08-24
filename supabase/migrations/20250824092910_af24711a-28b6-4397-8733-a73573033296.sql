-- Add UAC and unencrypted location fields to emergency_incidents
ALTER TABLE public.emergency_incidents 
ADD COLUMN incident_uac text,
ADD COLUMN location_address text,
ADD COLUMN location_latitude numeric,
ADD COLUMN location_longitude numeric;

-- Update existing incidents with unencrypted location data from encrypted fields
UPDATE public.emergency_incidents 
SET 
  location_address = CASE 
    WHEN encrypted_address IS NOT NULL THEN encrypted_address
    ELSE 'Location not specified'
  END,
  location_latitude = CASE 
    WHEN encrypted_latitude IS NOT NULL AND encrypted_latitude ~ '^[0-9.-]+$' THEN 
      encrypted_latitude::numeric
    ELSE NULL
  END,
  location_longitude = CASE 
    WHEN encrypted_longitude IS NOT NULL AND encrypted_longitude ~ '^[0-9.-]+$' THEN 
      encrypted_longitude::numeric
    ELSE NULL
  END;

-- For now, assign a placeholder UAC - we'll update with proper UACs later
UPDATE public.emergency_incidents 
SET incident_uac = 'GQ-BN-MAL-' || UPPER(LEFT(REPLACE(id::text, '-', ''), 6)) || '-XX'
WHERE incident_uac IS NULL;