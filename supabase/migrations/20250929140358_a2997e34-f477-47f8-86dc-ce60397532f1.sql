-- Migración para regenerar UACs existentes con formato secuencial correcto

-- 1. Función temporal para regenerar UACs de direcciones existentes
CREATE OR REPLACE FUNCTION public.regenerate_existing_uacs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  address_record RECORD;
  old_uac text;
  new_uac text;
  country_code text;
  region_code text;
  city_code text;
BEGIN
  -- Resetear contadores para empezar desde cero
  DELETE FROM public.uac_sequence_counters;
  
  -- Procesar todas las direcciones ordenadas por fecha de creación
  FOR address_record IN 
    SELECT id, country, region, city, uac, created_at
    FROM public.addresses 
    ORDER BY created_at ASC
  LOOP
    old_uac := address_record.uac;
    
    -- Mapear códigos de país
    country_code := CASE address_record.country
      WHEN 'Angola' THEN 'AO'
      WHEN 'Equatorial Guinea' THEN 'GQ'
      WHEN 'Cameroon' THEN 'CM'
      WHEN 'Gabon' THEN 'GA'
      WHEN 'São Tomé and Príncipe' THEN 'ST'
      WHEN 'Democratic Republic of Congo' THEN 'CD'
      WHEN 'Republic of Congo' THEN 'CG'
      WHEN 'Central African Republic' THEN 'CF'
      WHEN 'Chad' THEN 'TD'
      ELSE UPPER(LEFT(COALESCE(address_record.country,''), 2))
    END;

    -- Mapear códigos de región
    region_code := CASE address_record.region
      WHEN 'Annobón' THEN 'AN'
      WHEN 'Bioko Norte' THEN 'BN'
      WHEN 'Bioko Sur' THEN 'BS'
      WHEN 'Centro Sur' THEN 'CS'
      WHEN 'Djibloho' THEN 'DJ'
      WHEN 'Kié-Ntem' THEN 'KN'
      WHEN 'Kie-Ntem' THEN 'KN'
      WHEN 'Litoral' THEN 'LI'
      WHEN 'Wele-Nzas' THEN 'WN'
      ELSE UPPER(LEFT(COALESCE(address_record.region,''), 2))
    END;

    -- Mapear códigos de ciudad
    city_code := CASE address_record.city
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
      ELSE UPPER(LEFT(COALESCE(address_record.city,''), 3))
    END;
    
    -- Generar nuevo UAC usando el sistema secuencial
    new_uac := public.generate_unified_uac_unique(
      address_record.country,
      address_record.region,
      address_record.city,
      address_record.id
    );
    
    -- Actualizar la dirección con el nuevo UAC
    UPDATE public.addresses 
    SET uac = new_uac 
    WHERE id = address_record.id;
    
    -- Actualizar referencias en citizen_address si existen
    UPDATE public.citizen_address 
    SET uac = new_uac 
    WHERE uac = old_uac;
    
    RAISE NOTICE 'Regenerado UAC: % -> %', old_uac, new_uac;
  END LOOP;
  
  RAISE NOTICE 'Regeneración de UACs completada';
END;
$$;

-- 2. Ejecutar la regeneración
SELECT public.regenerate_existing_uacs();

-- 3. Limpiar función temporal
DROP FUNCTION public.regenerate_existing_uacs();