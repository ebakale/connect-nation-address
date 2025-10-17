-- Create enum for address privacy levels
CREATE TYPE address_privacy_level AS ENUM ('PRIVATE', 'REGION_ONLY', 'PUBLIC');

-- Create enum for search purposes
CREATE TYPE search_purpose_type AS ENUM (
  'DELIVERY',
  'EMERGENCY_CONTACT',
  'GOVERNMENT_SERVICE',
  'BUSINESS_CONTACT',
  'PERSONAL',
  'OTHER'
);

-- Add privacy settings to citizen_address table
ALTER TABLE citizen_address 
ADD COLUMN privacy_level address_privacy_level NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN searchable_by_public boolean NOT NULL DEFAULT false,
ADD COLUMN privacy_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN privacy_updated_by uuid REFERENCES auth.users(id);

-- Add privacy settings to person table
ALTER TABLE person
ADD COLUMN is_protected_class boolean NOT NULL DEFAULT false,
ADD COLUMN protection_reason text;

-- Automatically protect minors
CREATE OR REPLACE FUNCTION auto_protect_minors()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this person is linked to a dependent who is a minor
  IF EXISTS (
    SELECT 1 FROM household_dependents hd
    WHERE hd.guardian_person_id = NEW.id
    AND hd.dependent_type = 'MINOR'
    AND hd.is_active = true
  ) THEN
    NEW.is_protected_class := true;
    NEW.protection_reason := 'Guardian of minor dependent';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_protect_minors
  BEFORE INSERT OR UPDATE ON person
  FOR EACH ROW
  EXECUTE FUNCTION auto_protect_minors();

-- Create address search audit log table
CREATE TABLE address_search_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  searcher_user_id uuid NOT NULL REFERENCES auth.users(id),
  search_query text NOT NULL,
  search_purpose search_purpose_type NOT NULL,
  purpose_details text,
  results_count integer NOT NULL DEFAULT 0,
  accessed_person_ids uuid[] DEFAULT '{}',
  accessed_uacs text[] DEFAULT '{}',
  ip_address inet,
  user_agent text,
  searched_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on audit table
ALTER TABLE address_search_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own searches
CREATE POLICY "Users can view their own search history"
  ON address_search_audit
  FOR SELECT
  USING (auth.uid() = searcher_user_id);

-- Policy: Admins can view all searches
CREATE POLICY "Admins can view all search history"
  ON address_search_audit
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- Policy: System can insert audit logs
CREATE POLICY "System can create search audit logs"
  ON address_search_audit
  FOR INSERT
  WITH CHECK (true);

-- Create function to check if user can view an address
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
  is_protected boolean;
BEGIN
  -- Check if searcher is admin or verifier
  is_admin := has_role(p_searcher_id, 'admin'::app_role) 
              OR has_role(p_searcher_id, 'registrar'::app_role);
  is_verifier := has_role(p_searcher_id, 'verifier'::app_role)
                 OR has_role(p_searcher_id, 'car_verifier'::app_role);
  
  -- Admins and verifiers can view all
  IF is_admin OR is_verifier THEN
    RETURN true;
  END IF;
  
  -- Check if target is in protected class
  SELECT is_protected_class INTO is_protected
  FROM person
  WHERE id = p_target_person_id;
  
  -- Protected class individuals are never searchable by public
  IF is_protected THEN
    RETURN false;
  END IF;
  
  -- Check privacy level
  CASE p_privacy_level
    WHEN 'PUBLIC' THEN
      -- Public and opted in to be searchable
      RETURN p_searchable_by_public;
    WHEN 'REGION_ONLY' THEN
      -- Can see region/city only, not full address
      RETURN p_searchable_by_public;
    WHEN 'PRIVATE' THEN
      -- Never searchable except by admins/verifiers
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Create index for search performance
CREATE INDEX idx_person_national_id ON person(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_profiles_full_name ON profiles(full_name);
CREATE INDEX idx_citizen_address_privacy ON citizen_address(privacy_level, searchable_by_public) WHERE effective_to IS NULL;
CREATE INDEX idx_address_search_audit_searcher ON address_search_audit(searcher_user_id, searched_at DESC);

-- Add helpful comment
COMMENT ON COLUMN citizen_address.privacy_level IS 'Controls visibility: PRIVATE (admin only), REGION_ONLY (city/region visible), PUBLIC (full address if searchable_by_public=true)';
COMMENT ON COLUMN citizen_address.searchable_by_public IS 'Opt-in flag - must be explicitly set to true along with PUBLIC or REGION_ONLY privacy level';
COMMENT ON TABLE address_search_audit IS 'Audit trail of all address searches for compliance and security monitoring';