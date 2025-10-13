-- ============================================================================
-- NAR/Registrar Hierarchy Restructuring
-- NAR Authority: National-level only
-- Registrar: Geographic scope enforcement
-- ============================================================================

-- 1. Simplify NAR Authorities to National-Only
-- Remove regional/city jurisdiction fields since NAR is always national
ALTER TABLE public.nar_authorities 
DROP COLUMN IF EXISTS jurisdiction_region,
DROP COLUMN IF EXISTS jurisdiction_city;

-- Update authority_level to enforce national-only
-- First, update any existing non-national authorities to national
UPDATE public.nar_authorities 
SET authority_level = 'national' 
WHERE authority_level != 'national';

-- Add comment to clarify NAR is national-level
COMMENT ON TABLE public.nar_authorities IS 'NAR (National Address Registry) Authorities - Always national-level oversight';
COMMENT ON COLUMN public.nar_authorities.authority_level IS 'Authority level - always "national" for NAR authorities';

-- 2. Ensure user_role_metadata table exists for geographic scoping
-- (It should already exist based on the schema, but let's ensure it)
CREATE TABLE IF NOT EXISTS public.user_role_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role_id UUID NOT NULL REFERENCES public.user_roles(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL,
  scope_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_role_metadata if not already enabled
ALTER TABLE public.user_role_metadata ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for user_role_metadata
DROP POLICY IF EXISTS "Users can view their own role metadata" ON public.user_role_metadata;
CREATE POLICY "Users can view their own role metadata" 
ON public.user_role_metadata 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.id = user_role_metadata.user_role_id
    AND ur.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage all role metadata" ON public.user_role_metadata;
CREATE POLICY "Admins can manage all role metadata" 
ON public.user_role_metadata 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'ndaa_admin'::app_role)
);

-- 4. Update addresses RLS policies to enforce geographic restrictions
-- NAR authorities get national access, registrars get scoped access

DROP POLICY IF EXISTS "NAR authorities have national access" ON public.addresses;
CREATE POLICY "NAR authorities have national access" 
ON public.addresses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.nar_authorities na
    WHERE na.user_id = auth.uid()
    AND na.is_active = true
  )
);

DROP POLICY IF EXISTS "Registrars have scoped access" ON public.addresses;
CREATE POLICY "Registrars have scoped access" 
ON public.addresses 
FOR ALL 
USING (
  has_role(auth.uid(), 'registrar'::app_role) AND (
    -- National scope (no restrictions)
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      LEFT JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND (urm.scope_type IS NULL OR urm.scope_type = 'national')
    )
    OR
    -- Regional scope
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND urm.scope_type IN ('region', 'province')
      AND LOWER(addresses.region) = LOWER(urm.scope_value)
    )
    OR
    -- City scope
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND urm.scope_type = 'city'
      AND LOWER(addresses.city) = LOWER(urm.scope_value)
    )
  )
);

-- 5. Update address_requests RLS policies similarly
DROP POLICY IF EXISTS "NAR authorities can view all requests" ON public.address_requests;
CREATE POLICY "NAR authorities can view all requests" 
ON public.address_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.nar_authorities na
    WHERE na.user_id = auth.uid()
    AND na.is_active = true
  )
);

DROP POLICY IF EXISTS "Registrars have scoped request access" ON public.address_requests;
CREATE POLICY "Registrars have scoped request access" 
ON public.address_requests 
FOR ALL 
USING (
  has_role(auth.uid(), 'registrar'::app_role) AND (
    -- National scope
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      LEFT JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND (urm.scope_type IS NULL OR urm.scope_type = 'national')
    )
    OR
    -- Regional scope
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND urm.scope_type IN ('region', 'province')
      AND LOWER(address_requests.region) = LOWER(urm.scope_value)
    )
    OR
    -- City scope
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'registrar'::app_role
      AND urm.scope_type = 'city'
      AND LOWER(address_requests.city) = LOWER(urm.scope_value)
    )
  )
);

-- 6. Create helper function to get registrar's geographic scope
CREATE OR REPLACE FUNCTION public.get_registrar_scope(_user_id uuid)
RETURNS TABLE(scope_type text, scope_value text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT urm.scope_type, urm.scope_value
  FROM public.user_roles ur
  LEFT JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
  WHERE ur.user_id = _user_id
  AND ur.role = 'registrar'::app_role
  LIMIT 1;
$$;

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_role_metadata_user_role_id 
ON public.user_role_metadata(user_role_id);

CREATE INDEX IF NOT EXISTS idx_user_role_metadata_scope 
ON public.user_role_metadata(scope_type, scope_value);

CREATE INDEX IF NOT EXISTS idx_addresses_region_city 
ON public.addresses(region, city);

CREATE INDEX IF NOT EXISTS idx_address_requests_region_city 
ON public.address_requests(region, city);

-- 8. Add validation trigger to ensure registrars have geographic scope
CREATE OR REPLACE FUNCTION public.validate_registrar_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is a registrar role, ensure they have a geographic scope defined
  IF NEW.role = 'registrar'::app_role THEN
    -- Allow a grace period - the scope can be added shortly after role creation
    -- but log a notice if missing
    IF NOT EXISTS (
      SELECT 1 FROM public.user_role_metadata
      WHERE user_role_id = NEW.id
    ) THEN
      RAISE NOTICE 'Registrar role created without geographic scope. Please add scope metadata.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_registrar_scope ON public.user_roles;
CREATE TRIGGER check_registrar_scope
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.validate_registrar_scope();