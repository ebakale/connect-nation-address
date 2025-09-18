-- Migration: Separate NAR and CAR - Clean Architecture (Fixed)
-- First drop all dependent policies, then modify the table structure

-- Step 1: Drop all existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Staff can create addresses for users" ON public.addresses;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.address_requests;

-- Step 2: Now safely remove user_id from addresses table
ALTER TABLE public.addresses DROP COLUMN user_id;

-- Step 3: Add authority fields for address creation
ALTER TABLE public.addresses 
ADD COLUMN created_by_authority uuid REFERENCES auth.users(id),
ADD COLUMN authority_type text CHECK (authority_type IN ('registrar', 'admin', 'field_agent', 'municipal_authority')),
ADD COLUMN creation_source text DEFAULT 'manual' CHECK (creation_source IN ('manual', 'field_survey', 'municipal_import', 'gis_data'));

-- Step 4: Update address_requests table structure
ALTER TABLE public.address_requests 
DROP COLUMN user_id,
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

-- Step 7: Create new RLS policies for NAR (authority-managed addresses)
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

-- Step 8: Create new RLS policies for address_requests (NAR creation requests)
CREATE POLICY "Citizens can request address creation" 
ON public.address_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Citizens can view their requests" 
ON public.address_requests FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Citizens can update pending requests" 
ON public.address_requests FOR UPDATE 
USING (auth.uid() = requester_id AND status = 'pending');

-- Step 9: Setup RLS for new tables
ALTER TABLE public.nar_authorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage NAR authorities" 
ON public.nar_authorities FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

CREATE POLICY "Users can view their authority status" 
ON public.nar_authorities FOR SELECT 
USING (user_id = auth.uid());

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