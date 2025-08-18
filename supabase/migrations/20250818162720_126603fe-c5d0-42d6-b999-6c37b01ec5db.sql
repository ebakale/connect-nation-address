-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.generate_unified_uac_unique(
  p_country text,
  p_region text,
  p_city text,
  p_address_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Map region to standardized code
  region_code := CASE p_region
    WHEN 'Annobón' THEN 'AN'
    WHEN 'Bioko Norte' THEN 'BN'
    WHEN 'Bioko Sur' THEN 'BS'
    WHEN 'Centro Sur' THEN 'CS'
    WHEN 'Djibloho' THEN 'DJ'
    WHEN 'Kié-Ntem' THEN 'KN'
    WHEN 'Kie-Ntem' THEN 'KN'
    WHEN 'Litoral' THEN 'LT'
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
$$;