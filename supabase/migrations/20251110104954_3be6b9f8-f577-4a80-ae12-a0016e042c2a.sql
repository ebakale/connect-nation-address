-- Add validation to approve_business_address_request to prevent "Unknown Organization" records
CREATE OR REPLACE FUNCTION public.approve_business_address_request(
  p_request_id uuid,
  p_approved_by uuid DEFAULT auth.uid(),
  p_ignore_duplicates boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
  approval_result jsonb;
  org_metadata JSONB;
  services_array TEXT[];
  languages_array TEXT[];
  new_address_id UUID;
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
  
  -- Extract organization metadata
  org_metadata := COALESCE(request_record.verification_analysis->'organization', '{}'::jsonb);
  
  -- VALIDATION: Check if business metadata exists and has required fields
  IF org_metadata IS NULL OR org_metadata = '{}'::jsonb THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Business metadata is required. Cannot approve business address without complete organization details. Please reject this request and ask the user to submit complete information.'
    );
  END IF;
  
  -- VALIDATION: Check if organization_name exists and is not empty
  IF NOT (org_metadata ? 'organization_name') OR 
     (org_metadata->>'organization_name') IS NULL OR 
     TRIM(org_metadata->>'organization_name') = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organization name is required in business metadata. Cannot approve without a valid business name. Please reject this request.'
    );
  END IF;
  
  -- VALIDATION: Check if business_category exists
  IF NOT (org_metadata ? 'business_category') OR 
     (org_metadata->>'business_category') IS NULL OR 
     TRIM(org_metadata->>'business_category') = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Business category is required. Cannot approve without knowing the type of business. Please reject this request.'
    );
  END IF;
  
  -- Call the duplicate checking approval function
  approval_result := public.approve_address_request_with_duplicate_check(
    p_request_id,
    p_approved_by,
    p_ignore_duplicates
  );
  
  -- If duplicates found and not ignored, return for review
  IF (approval_result->>'requires_review')::boolean THEN
    RETURN approval_result;
  END IF;
  
  -- If approval failed, return error
  IF NOT (approval_result->>'success')::boolean THEN
    RETURN approval_result;
  END IF;
  
  -- Extract the created address ID
  new_address_id := (approval_result->>'address_id')::UUID;
  
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
  
  -- Create organization record (now safe because we validated above)
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
    org_metadata->>'organization_name', -- No longer needs COALESCE because we validated
    UPPER(org_metadata->>'business_category')::business_category,
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
    'organization_created', true,
    'uac', approval_result->>'uac',
    'duplicate_check', approval_result->'duplicate_check'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create function to delete incomplete business records
CREATE OR REPLACE FUNCTION public.delete_business_record(
  p_organization_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_record organization_addresses%ROWTYPE;
  address_id_to_delete uuid;
BEGIN
  -- Get the organization record
  SELECT * INTO org_record 
  FROM public.organization_addresses 
  WHERE id = p_organization_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business record not found');
  END IF;
  
  -- Check if user owns this business or is an admin/registrar
  IF org_record.created_by != p_user_id AND 
     NOT has_role(p_user_id, 'admin'::app_role) AND 
     NOT has_role(p_user_id, 'registrar'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not have permission to delete this business');
  END IF;
  
  -- Store the address ID before deletion
  address_id_to_delete := org_record.address_id;
  
  -- Delete the organization record
  DELETE FROM public.organization_addresses WHERE id = p_organization_id;
  
  -- Also delete the associated address if it exists
  IF address_id_to_delete IS NOT NULL THEN
    DELETE FROM public.addresses WHERE id = address_id_to_delete;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Business record deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;