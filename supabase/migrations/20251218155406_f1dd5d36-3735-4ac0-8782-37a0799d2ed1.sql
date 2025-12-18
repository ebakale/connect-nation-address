-- Create addresses for orphan approved requests (including Isabel Mangue's Calle Presidente Nasser)
DO $$
DECLARE
  r RECORD;
  new_address_id UUID;
  new_uac TEXT;
BEGIN
  FOR r IN 
    SELECT * FROM address_requests 
    WHERE status = 'approved' 
    AND approved_address_id IS NULL
  LOOP
    -- Generate UAC using the correct function signature (country, region, city, latitude, longitude)
    new_uac := public.generate_uac(
      r.country,
      r.region,
      r.city,
      COALESCE(r.latitude, 0),
      COALESCE(r.longitude, 0)
    );
    
    -- Create address
    INSERT INTO addresses (
      user_id, country, region, city, street, building,
      latitude, longitude, address_type, description,
      photo_url, uac, verified, public, created_at
    ) VALUES (
      r.requester_id, r.country, r.region, r.city, r.street, r.building,
      r.latitude, r.longitude, r.address_type, r.description,
      r.photo_url, new_uac, true, 
      CASE WHEN r.address_type != 'residential' THEN true ELSE false END,
      COALESCE(r.reviewed_at, now())
    ) RETURNING id INTO new_address_id;
    
    -- Link to request
    UPDATE address_requests 
    SET approved_address_id = new_address_id
    WHERE id = r.id;
    
    RAISE NOTICE 'Created address % with UAC % for request %', new_address_id, new_uac, r.id;
  END LOOP;
END $$;