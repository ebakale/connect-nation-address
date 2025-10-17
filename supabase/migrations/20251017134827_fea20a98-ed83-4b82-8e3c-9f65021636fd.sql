-- Update the can_view_citizen_address function to be more explicit about registrar access
CREATE OR REPLACE FUNCTION can_view_citizen_address(
  p_searcher_id uuid,
  p_target_person_id uuid,
  p_privacy_level address_privacy_level,
  p_searchable_by_public boolean
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_verifier boolean;
  is_registrar boolean;
  is_protected boolean;
BEGIN
  -- Check searcher roles
  is_admin := has_role(p_searcher_id, 'admin'::app_role);
  is_registrar := has_role(p_searcher_id, 'registrar'::app_role);
  is_verifier := has_role(p_searcher_id, 'verifier'::app_role)
                 OR has_role(p_searcher_id, 'car_verifier'::app_role);
  
  -- Admins, registrars, and verifiers can view ALL addresses regardless of privacy level
  IF is_admin OR is_registrar OR is_verifier THEN
    RETURN true;
  END IF;
  
  -- Check if target is in protected class
  SELECT is_protected_class INTO is_protected
  FROM person
  WHERE id = p_target_person_id;
  
  -- Protected class individuals are never searchable by regular users
  IF is_protected THEN
    RETURN false;
  END IF;
  
  -- For regular users, check privacy level
  CASE p_privacy_level
    WHEN 'PUBLIC' THEN
      -- Public and opted in to be searchable
      RETURN p_searchable_by_public;
    WHEN 'REGION_ONLY' THEN
      -- Can see region/city only, not full address
      RETURN p_searchable_by_public;
    WHEN 'PRIVATE' THEN
      -- Private addresses are NEVER searchable by regular users
      -- Only admins, registrars, and verifiers can see these
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION can_view_citizen_address IS 'Determines if a user can view a citizen address based on privacy settings. Admins, registrars, and verifiers can view ALL addresses including PRIVATE ones. Regular users can only view PUBLIC or REGION_ONLY addresses if searchable_by_public is true.';
