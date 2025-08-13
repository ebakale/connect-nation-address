-- Update all existing addresses to use consistent UAC format
-- This will regenerate UACs for all addresses to ensure consistency

CREATE OR REPLACE FUNCTION generate_consistent_uac(country_name text, region_name text, city_name text, address_id uuid)
RETURNS text AS $$
DECLARE
    country_code text;
    region_code text;
    city_code text;
    timestamp_base36 text;
    random_suffix text;
    result_uac text;
BEGIN
    -- Generate country code (first 2 characters, uppercase)
    country_code := UPPER(SUBSTRING(country_name FROM 1 FOR 2));
    
    -- Generate region code (first 2 characters, uppercase)  
    region_code := UPPER(SUBSTRING(region_name FROM 1 FOR 2));
    
    -- Generate city code (first 2 characters, uppercase)
    city_code := UPPER(SUBSTRING(city_name FROM 1 FOR 2));
    
    -- Generate timestamp-like base36 from address ID for consistency
    timestamp_base36 := UPPER(SUBSTRING(REPLACE(address_id::text, '-', '') FROM 1 FOR 6));
    
    -- Generate random-like suffix from address ID for uniqueness
    random_suffix := UPPER(SUBSTRING(REPLACE(address_id::text, '-', '') FROM 7 FOR 5));
    
    -- Combine all parts
    result_uac := country_code || '-' || region_code || '-' || city_code || '-' || timestamp_base36 || random_suffix;
    
    RETURN result_uac;
END;
$$ LANGUAGE plpgsql;

-- Update all addresses to use the consistent UAC format
UPDATE addresses 
SET uac = generate_consistent_uac(country, region, city, id)
WHERE uac NOT LIKE '%-%-%-________%' OR LENGTH(uac) < 15;

-- Drop the temporary function
DROP FUNCTION generate_consistent_uac(text, text, text, uuid);