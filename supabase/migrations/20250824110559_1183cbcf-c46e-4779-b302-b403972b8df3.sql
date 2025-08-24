-- Add structured address fields to emergency_incidents table to match addressing system
ALTER TABLE public.emergency_incidents 
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Equatorial Guinea';

-- Update existing incidents with proper address structure
-- Parse location_address and update structured fields
UPDATE public.emergency_incidents 
SET 
  street = CASE 
    WHEN location_address IS NOT NULL AND location_address != '' THEN
      -- Extract street from various address formats
      CASE 
        WHEN location_address LIKE 'Emergency Location:%' THEN 'Emergency Response Location'
        WHEN location_address LIKE '%Carretera%' THEN location_address
        WHEN location_address LIKE '%Palacio%' THEN location_address
        WHEN location_address LIKE '%Plaza%' THEN location_address
        ELSE COALESCE(location_address, 'Emergency Location')
      END
    ELSE 'Emergency Location'
  END,
  city = CASE 
    WHEN location_address LIKE '%Malabo%' THEN 'Malabo'
    WHEN location_address LIKE '%Bata%' THEN 'Bata'
    WHEN location_address LIKE '%Ebebiyín%' THEN 'Ebebiyín'
    WHEN location_latitude BETWEEN 3.7 AND 3.8 AND location_longitude BETWEEN 8.7 AND 8.8 THEN 'Malabo'
    WHEN location_latitude BETWEEN 1.7 AND 1.9 AND location_longitude BETWEEN 9.6 AND 9.8 THEN 'Bata'
    ELSE 'Malabo' -- Default to capital
  END,
  region = CASE 
    WHEN location_address LIKE '%Malabo%' OR (location_latitude BETWEEN 3.7 AND 3.8 AND location_longitude BETWEEN 8.7 AND 8.8) THEN 'Bioko Norte'
    WHEN location_address LIKE '%Bata%' OR (location_latitude BETWEEN 1.7 AND 1.9 AND location_longitude BETWEEN 9.6 AND 9.8) THEN 'Litoral'
    WHEN location_address LIKE '%Ebebiyín%' THEN 'Kié-Ntem'
    ELSE 'Bioko Norte' -- Default to capital region
  END
WHERE street IS NULL OR city IS NULL OR region IS NULL;

-- Generate proper UACs for incidents that don't have them or have old format
UPDATE public.emergency_incidents 
SET incident_uac = generate_unified_uac_unique(
  COALESCE(country, 'Equatorial Guinea'),
  COALESCE(region, 'Bioko Norte'), 
  COALESCE(city, 'Malabo'),
  id
)
WHERE incident_uac IS NULL 
   OR incident_uac = '' 
   OR incident_uac LIKE '%EMRG%' -- Update old emergency format UACs
   OR LENGTH(incident_uac) < 10; -- Update malformed UACs

-- Standardize emergency types
UPDATE public.emergency_incidents 
SET emergency_type = CASE 
  WHEN emergency_type = 'police' THEN 'Police Emergency'
  WHEN emergency_type = 'medical' THEN 'Medical Emergency'
  WHEN emergency_type = 'fire' THEN 'Fire Emergency'
  WHEN emergency_type = 'general' THEN 'General Emergency'
  WHEN emergency_type = 'traffic' THEN 'Traffic Emergency'
  ELSE INITCAP(emergency_type) || ' Emergency'
END
WHERE emergency_type NOT LIKE '% Emergency';

-- Update location_address to use structured format
UPDATE public.emergency_incidents 
SET location_address = CONCAT(
  COALESCE(street, 'Emergency Location'), ', ',
  COALESCE(city, 'Malabo'), ', ',
  COALESCE(region, 'Bioko Norte'), ', ',
  COALESCE(country, 'Equatorial Guinea')
)
WHERE location_address IS NULL 
   OR location_address = '' 
   OR location_address LIKE 'Emergency Location: %,%';

-- Ensure all incidents have proper coordinates (set default for Malabo if missing)
UPDATE public.emergency_incidents 
SET 
  location_latitude = COALESCE(location_latitude, 3.7540),
  location_longitude = COALESCE(location_longitude, 8.7750)
WHERE location_latitude IS NULL OR location_longitude IS NULL;

-- Add indexes for better performance on new address fields
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_city ON public.emergency_incidents(city);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_region ON public.emergency_incidents(region);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_street ON public.emergency_incidents(street);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_uac ON public.emergency_incidents(incident_uac);