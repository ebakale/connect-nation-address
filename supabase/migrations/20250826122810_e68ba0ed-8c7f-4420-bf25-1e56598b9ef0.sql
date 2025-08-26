-- Function to consistently generate incident UACs based on country/region/city and incident id
CREATE OR REPLACE FUNCTION public.generate_incident_uac(p_country text, p_region text, p_city text, p_incident_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  country_code text;
  region_code text;
  city_code text;
  base_code text;
  check_digit text;
  char_sum integer := 0;
  i integer;
  char_val integer;
  unique_part text;
BEGIN
  -- Country codes
  country_code := CASE p_country
    WHEN 'Angola' THEN 'AO'
    WHEN 'Equatorial Guinea' THEN 'GQ'
    WHEN 'Cameroon' THEN 'CM'
    WHEN 'Gabon' THEN 'GA'
    WHEN 'São Tomé and Príncipe' THEN 'ST'
    WHEN 'Democratic Republic of Congo' THEN 'CD'
    WHEN 'Republic of Congo' THEN 'CG'
    WHEN 'Central African Republic' THEN 'CF'
    WHEN 'Chad' THEN 'TD'
    ELSE UPPER(LEFT(COALESCE(p_country,''), 2))
  END;

  -- Region codes
  region_code := CASE p_region
    WHEN 'Annobón' THEN 'AN'
    WHEN 'Bioko Norte' THEN 'BN'
    WHEN 'Bioko Sur' THEN 'BS'
    WHEN 'Centro Sur' THEN 'CS'
    WHEN 'Djibloho' THEN 'DJ'
    WHEN 'Kié-Ntem' THEN 'KN'
    WHEN 'Kie-Ntem' THEN 'KN'
    WHEN 'Litoral' THEN 'LI'
    WHEN 'Wele-Nzas' THEN 'WN'
    ELSE UPPER(LEFT(COALESCE(p_region,''), 2))
  END;

  -- City codes
  city_code := CASE p_city
    WHEN 'Malabo' THEN 'MAL'
    WHEN 'Rebola' THEN 'REB'
    WHEN 'Baney' THEN 'BAN'
    WHEN 'Luba' THEN 'LUB'
    WHEN 'Riaba' THEN 'RIA'
    WHEN 'Moca' THEN 'MOC'
    WHEN 'Bata' THEN 'BAT'
    WHEN 'Mbini' THEN 'MBI'
    WHEN 'Kogo' THEN 'KOG'
    WHEN 'Acalayong' THEN 'ACA'
    WHEN 'Evinayong' THEN 'EVI'
    WHEN 'Acurenam' THEN 'ACU'
    WHEN 'Niefang' THEN 'NIE'
    WHEN 'Ciudad de la Paz' THEN 'CDP'
    WHEN 'Ebebiyín' THEN 'EBE'
    WHEN 'Mikomeseng' THEN 'MIK'
    WHEN 'Ncue' THEN 'NCU'
    WHEN 'Nsork Nsomo' THEN 'NSO'
    WHEN 'Mongomo' THEN 'MON'
    WHEN 'Añisoc' THEN 'ANI'
    WHEN 'Aconibe' THEN 'ACO'
    WHEN 'Nsok' THEN 'NSK'
    WHEN 'San Antonio de Palé' THEN 'SAP'
    ELSE UPPER(LEFT(COALESCE(p_city,''), 3))
  END;

  -- Unique part derived from incident id
  unique_part := UPPER(LEFT(REPLACE(p_incident_id::text, '-', ''), 6));

  -- Base code
  base_code := country_code || '-' || region_code || '-' || city_code || '-' || unique_part;

  -- Check digit (2 chars)
  FOR i IN 1..LENGTH(base_code) LOOP
    IF SUBSTRING(base_code, i, 1) != '-' THEN
      char_val := CASE 
        WHEN SUBSTRING(base_code, i, 1) ~ '[0-9]' THEN SUBSTRING(base_code, i, 1)::integer
        ELSE ASCII(SUBSTRING(base_code, i, 1)) - 55
      END;
      char_sum := char_sum + char_val;
    END IF;
  END LOOP;
  check_digit := CHR(65 + (char_sum % 26)) || CHR(65 + ((char_sum * 7) % 26));

  RETURN base_code || '-' || check_digit;
END;
$$;

-- Trigger to set/refresh incident UAC on insert or when city/region/country change
CREATE OR REPLACE FUNCTION public.set_incident_uac()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.incident_uac := public.generate_incident_uac(COALESCE(NEW.country,'Equatorial Guinea'), COALESCE(NEW.region,''), COALESCE(NEW.city,''), NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF (NEW.country IS DISTINCT FROM OLD.country) OR (NEW.region IS DISTINCT FROM OLD.region) OR (NEW.city IS DISTINCT FROM OLD.city) OR NEW.incident_uac IS NULL THEN
      NEW.incident_uac := public.generate_incident_uac(COALESCE(NEW.country,'Equatorial Guinea'), COALESCE(NEW.region,''), COALESCE(NEW.city,''), NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_incident_uac ON public.emergency_incidents;
CREATE TRIGGER trg_set_incident_uac
BEFORE INSERT OR UPDATE OF country, region, city, incident_uac ON public.emergency_incidents
FOR EACH ROW
EXECUTE FUNCTION public.set_incident_uac();

-- Recalculate UACs for the two incidents to ensure consistency
UPDATE public.emergency_incidents ei
SET incident_uac = public.generate_incident_uac(COALESCE(ei.country,'Equatorial Guinea'), COALESCE(ei.region,''), COALESCE(ei.city,''), ei.id)
WHERE ei.incident_number IN ('INC-2025-000022','INC-2025-000023');