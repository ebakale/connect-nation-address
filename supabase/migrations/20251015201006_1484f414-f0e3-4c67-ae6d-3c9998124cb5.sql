-- Populate dummy data for existing users
UPDATE public.profiles
SET 
  national_id_type = CASE 
    WHEN random() > 0.5 THEN 'id_card'
    ELSE 'passport'
  END,
  national_id = 'GQ-' || LPAD(FLOOR(random() * 10000000)::TEXT, 7, '0'),
  date_of_birth = CURRENT_DATE - (INTERVAL '1 year' * (18 + FLOOR(random() * 50)::INTEGER)),
  nationality = CASE 
    WHEN random() > 0.8 THEN 'Cameroon'
    WHEN random() > 0.6 THEN 'Gabon'
    WHEN random() > 0.4 THEN 'Nigeria'
    ELSE 'Equatorial Guinea'
  END,
  preferred_language = CASE 
    WHEN random() > 0.7 THEN 'en'
    WHEN random() > 0.4 THEN 'fr'
    ELSE 'es'
  END
WHERE national_id IS NULL;