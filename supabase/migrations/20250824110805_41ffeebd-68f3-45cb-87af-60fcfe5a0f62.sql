-- Safely drop old emergency_type check constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_schema = 'public'
      AND tc.table_name = 'emergency_incidents'
      AND tc.constraint_name = 'emergency_incidents_emergency_type_check'
  ) THEN
    ALTER TABLE public.emergency_incidents 
      DROP CONSTRAINT emergency_incidents_emergency_type_check;
  END IF;
END $$;

-- Ensure structured address fields exist
ALTER TABLE public.emergency_incidents 
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Equatorial Guinea';

-- Populate structured fields from existing data
UPDATE public.emergency_incidents 
SET 
  street = CASE 
    WHEN location_address IS NOT NULL AND location_address <> '' THEN
      CASE 
        WHEN location_address LIKE 'Emergency Location:%' THEN 'Emergency Response Location'
        WHEN location_address ILIKE '%Carretera%' THEN location_address
        WHEN location_address ILIKE '%Palacio%' THEN location_address
        WHEN location_address ILIKE '%Plaza%' THEN location_address
        ELSE COALESCE(location_address, 'Emergency Location')
      END
    ELSE 'Emergency Location'
  END,
  city = CASE 
    WHEN location_address ILIKE '%Malabo%' THEN 'Malabo'
    WHEN location_address ILIKE '%Bata%' THEN 'Bata'
    WHEN location_address ILIKE '%Ebebiyín%' OR location_address ILIKE '%Ebebiyin%' THEN 'Ebebiyín'
    WHEN location_latitude BETWEEN 3.7 AND 3.8 AND location_longitude BETWEEN 8.7 AND 8.8 THEN 'Malabo'
    WHEN location_latitude BETWEEN 1.7 AND 1.9 AND location_longitude BETWEEN 9.6 AND 9.8 THEN 'Bata'
    ELSE 'Malabo'
  END,
  region = CASE 
    WHEN location_address ILIKE '%Malabo%' OR (location_latitude BETWEEN 3.7 AND 3.8 AND location_longitude BETWEEN 8.7 AND 8.8) THEN 'Bioko Norte'
    WHEN location_address ILIKE '%Bata%' OR (location_latitude BETWEEN 1.7 AND 1.9 AND location_longitude BETWEEN 9.6 AND 9.8) THEN 'Litoral'
    WHEN location_address ILIKE '%Ebebiyín%' OR location_address ILIKE '%Ebebiyin%' THEN 'Kié-Ntem'
    ELSE 'Bioko Norte'
  END
WHERE (street IS NULL OR city IS NULL OR region IS NULL);

-- Generate UACs for incidents missing or malformed UACs
UPDATE public.emergency_incidents 
SET incident_uac = generate_unified_uac_unique(
  COALESCE(country, 'Equatorial Guinea'),
  COALESCE(region, 'Bioko Norte'), 
  COALESCE(city, 'Malabo'),
  id
)
WHERE incident_uac IS NULL 
   OR incident_uac = '' 
   OR incident_uac LIKE '%EMRG%'
   OR LENGTH(incident_uac) < 10;

-- Standardize emergency types (constraint dropped before this)
UPDATE public.emergency_incidents 
SET emergency_type = CASE 
  WHEN emergency_type = 'police' THEN 'Police Emergency'
  WHEN emergency_type = 'medical' THEN 'Medical Emergency'
  WHEN emergency_type = 'fire' THEN 'Fire Emergency'
  WHEN emergency_type = 'general' THEN 'General Emergency'
  WHEN emergency_type = 'traffic' THEN 'Traffic Emergency'
  ELSE INITCAP(emergency_type) || ' Emergency'
END
WHERE emergency_type IS NOT NULL AND emergency_type NOT LIKE '% Emergency';

-- Standardize location_address using structured fields
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

-- Ensure all incidents have coordinates (default to Malabo center if missing)
UPDATE public.emergency_incidents 
SET 
  location_latitude = COALESCE(location_latitude, 3.7540),
  location_longitude = COALESCE(location_longitude, 8.7750)
WHERE location_latitude IS NULL OR location_longitude IS NULL;

-- Re-add a flexible check constraint compatible with both legacy and new values
ALTER TABLE public.emergency_incidents
ADD CONSTRAINT emergency_incidents_emergency_type_check
CHECK (
  emergency_type IS NOT NULL AND emergency_type <> '' AND (
    emergency_type IN ('police', 'medical', 'fire', 'general', 'traffic')
    OR emergency_type ~ '^[A-Za-z ]+ Emergency$'
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_city ON public.emergency_incidents(city);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_region ON public.emergency_incidents(region);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_street ON public.emergency_incidents(street);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_uac ON public.emergency_incidents(incident_uac);