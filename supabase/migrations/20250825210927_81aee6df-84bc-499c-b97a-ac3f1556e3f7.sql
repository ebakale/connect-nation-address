-- Generate UACs for incidents that don't have them
UPDATE emergency_incidents 
SET incident_uac = CASE 
  WHEN city = 'Malabo' AND region = 'Bioko Norte' AND country = 'Equatorial Guinea' THEN 
    'GQ-BN-MAL-' || UPPER(LEFT(REPLACE(id::text, '-', ''), 6)) || '-' || 
    CHR(65 + (LENGTH(incident_number) % 26)) || CHR(65 + ((LENGTH(incident_number) * 7) % 26))
  WHEN city = 'Bata' AND region = 'Litoral' AND country = 'Equatorial Guinea' THEN 
    'GQ-LI-BAT-' || UPPER(LEFT(REPLACE(id::text, '-', ''), 6)) || '-' || 
    CHR(65 + (LENGTH(incident_number) % 26)) || CHR(65 + ((LENGTH(incident_number) * 7) % 26))
  ELSE 
    COALESCE(
      (SELECT CASE country WHEN 'Equatorial Guinea' THEN 'GQ' ELSE 'XX' END), 'XX'
    ) || '-' ||
    COALESCE(
      (SELECT CASE region 
        WHEN 'Bioko Norte' THEN 'BN'
        WHEN 'Litoral' THEN 'LI' 
        WHEN 'Bioko Sur' THEN 'BS'
        WHEN 'Centro Sur' THEN 'CS'
        WHEN 'Kié-Ntem' THEN 'KN'
        WHEN 'Wele-Nzas' THEN 'WN'
        WHEN 'Annobón' THEN 'AN'
        WHEN 'Djibloho' THEN 'DJ'
        ELSE 'XX' 
      END), 'XX'
    ) || '-' ||
    COALESCE(
      (SELECT CASE city
        WHEN 'Malabo' THEN 'MAL'
        WHEN 'Bata' THEN 'BAT'
        WHEN 'Luba' THEN 'LUB'
        WHEN 'Ebebiyín' THEN 'EBE'
        WHEN 'Mongomo' THEN 'MON'
        WHEN 'Evinayong' THEN 'EVI'
        WHEN 'Mikomeseng' THEN 'MIK'
        WHEN 'Nsork' THEN 'NSK'
        ELSE LEFT(UPPER(city), 3)
      END), 'XXX'
    ) || '-' ||
    UPPER(LEFT(REPLACE(id::text, '-', ''), 6)) || '-' || 
    CHR(65 + (LENGTH(incident_number) % 26)) || CHR(65 + ((LENGTH(incident_number) * 7) % 26))
END
WHERE incident_uac IS NULL;