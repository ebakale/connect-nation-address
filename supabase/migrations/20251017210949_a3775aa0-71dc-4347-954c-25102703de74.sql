-- Add missing business_address_type column to organization_addresses
ALTER TABLE public.organization_addresses 
ADD COLUMN IF NOT EXISTS business_address_type business_address_type NOT NULL DEFAULT 'COMMERCIAL';

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_org_addresses_business_category ON public.organization_addresses(business_category);
CREATE INDEX IF NOT EXISTS idx_org_addresses_public_visible ON public.organization_addresses(publicly_visible);
CREATE INDEX IF NOT EXISTS idx_org_addresses_address_id ON public.organization_addresses(address_id);
CREATE INDEX IF NOT EXISTS idx_org_addresses_created_by ON public.organization_addresses(created_by);
CREATE INDEX IF NOT EXISTS idx_org_addresses_business_type ON public.organization_addresses(business_address_type);

-- Create approve_business_address_request function
CREATE OR REPLACE FUNCTION public.approve_business_address_request(
  p_request_id UUID,
  p_approved_by UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id UUID;
  org_metadata JSONB;
  services_array TEXT[];
  languages_array TEXT[];
BEGIN
  -- Get request with business metadata
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business request not found or not pending');
  END IF;
  
  -- Check if this is a business address
  IF request_record.address_type != 'business' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a business address request');
  END IF;
  
  -- Extract organization metadata from verification_analysis
  org_metadata := COALESCE(request_record.verification_analysis->'organization', '{}'::jsonb);
  
  -- Create address using existing function
  new_address_id := public.approve_address_request(p_request_id, p_approved_by);
  
  -- Convert services and languages to arrays
  IF org_metadata ? 'services_offered' THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(org_metadata->'services_offered')) INTO services_array;
  ELSE
    services_array := ARRAY[]::TEXT[];
  END IF;
  
  IF org_metadata ? 'languages_spoken' THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(org_metadata->'languages_spoken')) INTO languages_array;
  ELSE
    languages_array := ARRAY['Spanish'];
  END IF;
  
  -- Create organization record
  INSERT INTO public.organization_addresses (
    address_id,
    organization_name,
    business_category,
    business_address_type,
    business_registration_number,
    tax_identification_number,
    primary_contact_name,
    primary_contact_phone,
    primary_contact_email,
    secondary_contact_phone,
    website_url,
    employee_count,
    customer_capacity,
    parking_available,
    parking_capacity,
    wheelchair_accessible,
    is_public_service,
    appointment_required,
    services_offered,
    languages_spoken,
    operating_hours,
    publicly_visible,
    show_on_maps,
    show_contact_info,
    created_by
  ) VALUES (
    new_address_id,
    COALESCE(org_metadata->>'organization_name', 'Unknown Organization'),
    COALESCE(org_metadata->>'business_category', 'other')::business_category,
    COALESCE((org_metadata->>'business_address_type')::business_address_type, 'COMMERCIAL'::business_address_type),
    org_metadata->>'business_registration_number',
    org_metadata->>'tax_identification_number',
    org_metadata->>'primary_contact_name',
    org_metadata->>'primary_contact_phone',
    org_metadata->>'primary_contact_email',
    org_metadata->>'secondary_contact_phone',
    org_metadata->>'website_url',
    (org_metadata->>'employee_count')::INTEGER,
    (org_metadata->>'customer_capacity')::INTEGER,
    COALESCE((org_metadata->>'parking_available')::BOOLEAN, false),
    (org_metadata->>'parking_capacity')::INTEGER,
    COALESCE((org_metadata->>'wheelchair_accessible')::BOOLEAN, false),
    COALESCE((org_metadata->>'is_public_service')::BOOLEAN, false),
    COALESCE((org_metadata->>'appointment_required')::BOOLEAN, false),
    services_array,
    languages_array,
    org_metadata->'operating_hours',
    COALESCE((org_metadata->>'publicly_visible')::BOOLEAN, true),
    COALESCE((org_metadata->>'show_on_maps')::BOOLEAN, true),
    COALESCE((org_metadata->>'show_contact_info')::BOOLEAN, true),
    request_record.requester_id
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'address_id', new_address_id,
    'organization_created', true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;