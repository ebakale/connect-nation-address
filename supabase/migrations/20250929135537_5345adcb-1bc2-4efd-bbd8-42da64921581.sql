-- 1) Tabla de contadores por localidad para secuencias UAC
CREATE TABLE IF NOT EXISTS public.uac_sequence_counters (
  country_code text NOT NULL,
  region_code text NOT NULL,
  city_code text NOT NULL,
  current_num integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (country_code, region_code, city_code)
);

-- 2) Función para obtener la siguiente secuencia UAC con atomicidad
CREATE OR REPLACE FUNCTION public.get_next_uac_sequence(
  p_country_code text,
  p_region_code text,
  p_city_code text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_num integer;
  alpha_part text;
BEGIN
  INSERT INTO public.uac_sequence_counters (country_code, region_code, city_code, current_num)
  VALUES (p_country_code, p_region_code, p_city_code, 1)
  ON CONFLICT (country_code, region_code, city_code)
  DO UPDATE SET current_num = public.uac_sequence_counters.current_num + 1,
                updated_at = now()
  RETURNING current_num INTO next_num;

  -- Parte alfanumérica fija por ahora (se puede sofisticar más adelante)
  alpha_part := 'A00';

  RETURN lpad(next_num::text, 3, '0') || alpha_part;
END;
$$;

-- 3) Actualizar la función que genera UAC para direcciones aprobadas
CREATE OR REPLACE FUNCTION public.generate_unified_uac_unique(
  p_country text,
  p_region text,
  p_city text,
  p_address_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    ELSE UPPER(LEFT(COALESCE(p_country,''), 2))
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
    ELSE UPPER(LEFT(COALESCE(p_region,''), 2))
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
    ELSE UPPER(LEFT(COALESCE(p_city,''), 3))
  END;

  -- Obtener secuencia numérica/alfanumérica por localidad
  sequence_str := public.get_next_uac_sequence(country_code, region_code, city_code);

  -- Base code con secuencia planificada
  base_code := country_code || '-' || region_code || '-' || city_code || '-' || sequence_str;

  -- Cálculo del dígito de verificación (2 letras)
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