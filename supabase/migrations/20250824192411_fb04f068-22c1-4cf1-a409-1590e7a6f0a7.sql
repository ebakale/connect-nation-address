-- Fix search path for existing functions that don't have it set
-- Update all functions to have proper search_path settings

-- Update generate_unified_uac_unique function
CREATE OR REPLACE FUNCTION public.generate_unified_uac_unique(p_country text, p_region text, p_city text, p_address_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  country_code text;
  region_code text;
  city_code text;
  sequence_str text;
  base_code text;
  check_digit text;
  char_sum integer := 0;
  i integer;
  char_val integer;
  unique_part text;
BEGIN
  -- Map country to ISO code
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
    ELSE UPPER(LEFT(p_country, 2))
  END;

  -- Map region to ISO 3166-2:GQ compliant codes
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
    ELSE UPPER(LEFT(p_region, 2))
  END;

  -- Map city to standardized code
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
    ELSE UPPER(LEFT(p_city, 3))
  END;

  -- Generate unique sequence using UUID hash
  unique_part := UPPER(LEFT(REPLACE(p_address_id::text, '-', ''), 6));
  
  -- Create base code with unique identifier
  base_code := country_code || '-' || region_code || '-' || city_code || '-' || unique_part;

  -- Generate check digit
  FOR i IN 1..LENGTH(base_code) LOOP
    IF SUBSTRING(base_code, i, 1) != '-' THEN
      char_val := CASE 
        WHEN SUBSTRING(base_code, i, 1) ~ '[0-9]' THEN 
          SUBSTRING(base_code, i, 1)::integer
        ELSE 
          ASCII(SUBSTRING(base_code, i, 1)) - 55
      END;
      char_sum := char_sum + char_val;
    END IF;
  END LOOP;

  -- Generate 2-character check digit
  check_digit := CHR(65 + (char_sum % 26)) || CHR(65 + ((char_sum * 7) % 26));

  RETURN base_code || '-' || check_digit;
END;
$function$;

-- Update generate_incident_number function
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  incident_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next sequence number for the year
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') 
  INTO sequence_part
  FROM public.emergency_incidents 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  incident_num := 'INC-' || year_part || '-' || sequence_part;
  
  RETURN incident_num;
END;
$function$;

-- Update set_incident_number function
CREATE OR REPLACE FUNCTION public.set_incident_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    NEW.incident_number := generate_incident_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_unit_location_timestamp function
CREATE OR REPLACE FUNCTION public.update_unit_location_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.location_latitude IS DISTINCT FROM OLD.location_latitude) OR 
     (NEW.location_longitude IS DISTINCT FROM OLD.location_longitude) THEN
    NEW.location_updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Update assign_police_user_to_unit function
CREATE OR REPLACE FUNCTION public.assign_police_user_to_unit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_unit_id uuid;
    unit_member_count integer;
    min_member_count integer;
    user_role_name text;
BEGIN
    -- Only process police roles
    IF NEW.role NOT IN ('police_operator', 'police_dispatcher', 'police_supervisor') THEN
        RETURN NEW;
    END IF;
    
    -- Find the unit with the least members
    SELECT eu.id, COUNT(eum.officer_id)
    INTO target_unit_id, min_member_count
    FROM emergency_units eu
    LEFT JOIN emergency_unit_members eum ON eu.id = eum.unit_id
    GROUP BY eu.id
    ORDER BY COUNT(eum.officer_id), eu.created_at
    LIMIT 1;
    
    -- Determine role based on user role
    user_role_name := CASE 
        WHEN NEW.role = 'police_supervisor' THEN 'sergeant'
        WHEN NEW.role = 'police_dispatcher' THEN 'dispatcher'
        ELSE 'officer'
    END;
    
    -- Insert the user into the unit
    INSERT INTO emergency_unit_members (
        unit_id,
        officer_id,
        role,
        is_lead,
        joined_at
    ) VALUES (
        target_unit_id,
        NEW.user_id,
        user_role_name,
        -- Make supervisors leads, or first member in unit
        CASE 
            WHEN NEW.role = 'police_supervisor' THEN true
            WHEN min_member_count = 0 THEN true
            ELSE false
        END,
        now()
    ) ON CONFLICT (unit_id, officer_id) DO NOTHING;
    
    RETURN NEW;
END;
$function$;