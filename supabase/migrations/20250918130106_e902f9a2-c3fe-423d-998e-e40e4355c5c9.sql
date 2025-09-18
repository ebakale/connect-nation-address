-- Migration: Separate NAR and CAR - Clean Architecture (Fixed)
-- This migration removes user ownership from addresses and establishes clean separation

-- Step 1: Drop dependent policies first
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Staff can create addresses for users" ON public.addresses;

-- Step 2: Now remove user_id from addresses table (NAR should not be user-owned)
ALTER TABLE public.addresses DROP COLUMN user_id;

-- Step 3: Add authority fields for address creation
ALTER TABLE public.addresses 
ADD COLUMN created_by_authority uuid REFERENCES auth.users(id),
ADD COLUMN authority_type text CHECK (authority_type IN ('registrar', 'admin', 'field_agent', 'municipal_authority')),
ADD COLUMN creation_source text DEFAULT 'manual' CHECK (creation_source IN ('manual', 'field_survey', 'municipal_import', 'gis_data'));

-- Step 4: Update address_requests to be about NAR address creation, not ownership
ALTER TABLE public.address_requests 
DROP COLUMN IF EXISTS user_id,
ADD COLUMN requester_id uuid REFERENCES auth.users(id),
ADD COLUMN request_type text DEFAULT 'create_address' CHECK (request_type IN ('create_address', 'update_address', 'verify_coordinates')),
ADD COLUMN intended_occupant_id uuid REFERENCES public.person(id);

-- Step 5: Create NAR address authorities table
CREATE TABLE public.nar_authorities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    authority_level text NOT NULL CHECK (authority_level IN ('municipal', 'regional', 'national')),
    jurisdiction_region text,
    jurisdiction_city text,
    can_create_addresses boolean DEFAULT true,
    can_verify_addresses boolean DEFAULT true,
    can_update_addresses boolean DEFAULT false,
    authorized_by uuid REFERENCES auth.users(id),
    authorized_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Step 6: Create address creation audit log
CREATE TABLE public.nar_creation_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id uuid NOT NULL REFERENCES public.addresses(id),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    creation_method text NOT NULL,
    source_data jsonb,
    validation_results jsonb,
    approved_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Step 7: New NAR policies: Addresses managed by authorities
CREATE POLICY "Public can view published addresses" 
ON public.addresses FOR SELECT 
USING (public = true AND verified = true);

CREATE POLICY "Authorities can view all addresses" 
ON public.addresses FOR SELECT 
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'verifier'::app_role) OR
    EXISTS (SELECT 1 FROM nar_authorities WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Authorities can create addresses" 
ON public.addresses FOR INSERT 
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR
    EXISTS (SELECT 1 FROM nar_authorities WHERE user_id = auth.uid() AND is_active = true AND can_create_addresses = true)
);

CREATE POLICY "Authorities can update addresses" 
ON public.addresses FOR UPDATE 
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR
    EXISTS (SELECT 1 FROM nar_authorities WHERE user_id = auth.uid() AND is_active = true AND can_update_addresses = true)
);

-- Step 8: Update address_requests policies for NAR creation requests
DROP POLICY IF EXISTS "Users can create their own requests" ON public.address_requests;

CREATE POLICY "Citizens can request address creation" 
ON public.address_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Citizens can view their requests" 
ON public.address_requests FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Citizens can update pending requests" 
ON public.address_requests FOR UPDATE 
USING (auth.uid() = requester_id AND status = 'pending');

-- Step 9: Create NAR authorities RLS
ALTER TABLE public.nar_authorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage NAR authorities" 
ON public.nar_authorities FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

CREATE POLICY "Users can view their authority status" 
ON public.nar_authorities FOR SELECT 
USING (user_id = auth.uid());

-- Step 10: Create NAR creation log RLS
ALTER TABLE public.nar_creation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorities can view creation logs" 
ON public.nar_creation_log FOR SELECT 
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role) OR
    created_by = auth.uid()
);

CREATE POLICY "System can create logs" 
ON public.nar_creation_log FOR INSERT 
WITH CHECK (true);

-- Step 11: Update functions for NAR/CAR separation
CREATE OR REPLACE FUNCTION public.request_nar_address_creation(
    p_requester_id uuid,
    p_latitude numeric,
    p_longitude numeric,
    p_street text,
    p_city text,
    p_region text,
    p_country text,
    p_building text DEFAULT NULL,
    p_address_type text DEFAULT 'residential',
    p_description text DEFAULT NULL,
    p_photo_url text DEFAULT NULL,
    p_justification text DEFAULT 'Citizen address creation request',
    p_intended_occupant_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_request_id uuid;
BEGIN
    -- Create NAR address creation request
    INSERT INTO public.address_requests (
        requester_id,
        latitude,
        longitude,
        street,
        city,
        region,
        country,
        building,
        address_type,
        description,
        photo_url,
        justification,
        request_type,
        intended_occupant_id,
        status
    ) VALUES (
        p_requester_id,
        p_latitude,
        p_longitude,
        p_street,
        p_city,
        p_region,
        p_country,
        p_building,
        p_address_type,
        p_description,
        p_photo_url,
        p_justification,
        'create_address',
        p_intended_occupant_id,
        'pending'
    ) RETURNING id INTO new_request_id;
    
    RETURN new_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_nar_address_creation(
    p_request_id uuid,
    p_approved_by uuid DEFAULT auth.uid()
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    request_record address_requests%ROWTYPE;
    new_address_id uuid;
    generated_uac text;
    authority_type text;
    result jsonb;
BEGIN
    -- Check if user has authority to approve
    IF NOT (
        has_role(p_approved_by, 'admin'::app_role) OR 
        has_role(p_approved_by, 'registrar'::app_role) OR
        EXISTS (SELECT 1 FROM nar_authorities WHERE user_id = p_approved_by AND is_active = true AND can_create_addresses = true)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient authority to approve NAR address creation'
        );
    END IF;
    
    -- Get the request details
    SELECT * INTO request_record 
    FROM public.address_requests 
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Address creation request not found or not pending'
        );
    END IF;
    
    -- Determine authority type
    SELECT CASE 
        WHEN has_role(p_approved_by, 'admin'::app_role) THEN 'admin'
        WHEN has_role(p_approved_by, 'registrar'::app_role) THEN 'registrar'
        ELSE 'municipal_authority'
    END INTO authority_type;
    
    -- Generate UAC for the new address
    generated_uac := generate_unified_uac_unique(
        request_record.country,
        request_record.region, 
        request_record.city,
        request_record.id
    );
    
    -- Create the NAR address (no user ownership)
    INSERT INTO public.addresses (
        latitude,
        longitude,
        street,
        city,
        region,
        country,
        building,
        address_type,
        description,
        photo_url,
        uac,
        verified,
        public,
        created_by_authority,
        authority_type,
        creation_source
    ) VALUES (
        request_record.latitude,
        request_record.longitude,
        request_record.street,
        request_record.city,
        request_record.region,
        request_record.country,
        request_record.building,
        request_record.address_type,
        request_record.description,
        request_record.photo_url,
        generated_uac,
        true,  -- NAR addresses are verified by authorities
        false, -- Initially private, can be made public later
        p_approved_by,
        authority_type,
        'citizen_request'
    ) RETURNING id INTO new_address_id;
    
    -- Log the creation
    INSERT INTO public.nar_creation_log (
        address_id,
        created_by,
        creation_method,
        source_data,
        approved_by
    ) VALUES (
        new_address_id,
        p_approved_by,
        'citizen_request',
        jsonb_build_object(
            'request_id', p_request_id,
            'requester_id', request_record.requester_id
        ),
        p_approved_by
    );
    
    -- Update the request status
    UPDATE public.address_requests 
    SET 
        status = 'approved',
        reviewed_by = p_approved_by,
        reviewed_at = now()
    WHERE id = p_request_id;
    
    -- If intended occupant specified, create CAR relationship
    IF request_record.intended_occupant_id IS NOT NULL THEN
        INSERT INTO public.citizen_address (
            person_id,
            address_kind,
            scope,
            uac,
            source,
            created_by
        ) VALUES (
            request_record.intended_occupant_id,
            'PRIMARY',
            'BUILDING',
            generated_uac,
            'NAR_REQUEST',
            p_approved_by
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'address_id', new_address_id,
        'uac', generated_uac,
        'message', 'NAR address created successfully'
    );
END;
$$;