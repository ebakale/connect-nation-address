-- Phase 1: Business/Organization Address System - Database Schema

-- 1.1 Create Business Address Type Enum
CREATE TYPE business_address_type AS ENUM (
  'RESIDENTIAL',
  'COMMERCIAL',
  'GOVERNMENT',
  'INDUSTRIAL', 
  'INSTITUTIONAL',
  'PUBLIC_FACILITY',
  'AGRICULTURAL',
  'MIXED_USE'
);

-- 1.2 Create Business Category Enum
CREATE TYPE business_category AS ENUM (
  'RETAIL',
  'OFFICE',
  'RESTAURANT',
  'HOTEL',
  'HOSPITAL',
  'SCHOOL',
  'UNIVERSITY',
  'GOVERNMENT_OFFICE',
  'POLICE_STATION',
  'FIRE_STATION',
  'EMBASSY',
  'BANK',
  'FACTORY',
  'WAREHOUSE',
  'FARM',
  'CHURCH',
  'MOSQUE',
  'MARKET',
  'SHOPPING_CENTER',
  'GAS_STATION',
  'AIRPORT',
  'PORT',
  'OTHER'
);

-- 1.3 Create Organization/Business Metadata Table
CREATE TABLE public.organization_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id UUID REFERENCES public.addresses(id) ON DELETE CASCADE,
  
  -- Organization Details
  organization_name TEXT NOT NULL,
  business_registration_number TEXT,
  tax_identification_number TEXT,
  business_category business_category NOT NULL,
  
  -- Contact & Operations
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  secondary_contact_phone TEXT,
  website_url TEXT,
  
  -- Operating Information
  operating_hours JSONB DEFAULT '{}'::jsonb,
  seasonal_operation BOOLEAN DEFAULT false,
  seasonal_hours JSONB,
  
  -- Capacity & Access
  employee_count INTEGER,
  customer_capacity INTEGER,
  parking_available BOOLEAN DEFAULT false,
  parking_capacity INTEGER,
  wheelchair_accessible BOOLEAN DEFAULT false,
  public_transport_access TEXT[],
  
  -- Public Information
  is_public_service BOOLEAN DEFAULT false,
  appointment_required BOOLEAN DEFAULT false,
  services_offered TEXT[],
  languages_spoken TEXT[] DEFAULT ARRAY['Spanish'],
  
  -- Verification & Authority
  verified_by_authority UUID REFERENCES auth.users(id),
  authority_type TEXT,
  verification_document_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  license_expiry_date DATE,
  
  -- Privacy & Visibility
  publicly_visible BOOLEAN DEFAULT true,
  show_on_maps BOOLEAN DEFAULT true,
  show_contact_info BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Audit
  business_status TEXT DEFAULT 'active' CHECK (business_status IN ('active', 'temporarily_closed', 'permanently_closed', 'relocated')),
  closure_date DATE,
  relocation_address_id UUID REFERENCES public.addresses(id)
);

-- 1.4 Update NAR addresses table
ALTER TABLE public.addresses 
ADD COLUMN business_address_type business_address_type DEFAULT 'RESIDENTIAL';

-- Migrate existing data
UPDATE public.addresses 
SET business_address_type = 'RESIDENTIAL' 
WHERE address_type = 'residential' OR address_type IS NULL;

UPDATE public.addresses 
SET business_address_type = 'COMMERCIAL' 
WHERE address_type NOT IN ('residential') AND address_type IS NOT NULL;

-- 1.5 Create Business Address Search Indexes
CREATE INDEX idx_org_name_search ON public.organization_addresses 
USING gin(to_tsvector('spanish', organization_name));

CREATE INDEX idx_org_category ON public.organization_addresses (business_category);
CREATE INDEX idx_org_status ON public.organization_addresses (business_status);
CREATE INDEX idx_org_public ON public.organization_addresses (publicly_visible, business_status);

-- 1.6 Enable RLS on organization_addresses
ALTER TABLE public.organization_addresses ENABLE ROW LEVEL SECURITY;

-- 1.7 RLS Policies for Organization Addresses

-- Public can view publicly visible organizations
CREATE POLICY "Public can view visible organizations"
ON public.organization_addresses FOR SELECT
USING (publicly_visible = true AND business_status = 'active');

-- Business owners/managers can manage their organizations
CREATE POLICY "Business managers can manage their organizations"
ON public.organization_addresses FOR ALL
USING (created_by = auth.uid());

-- Admins and registrars can manage all organizations
CREATE POLICY "Admins can manage all organizations"
ON public.organization_addresses FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR
  has_role(auth.uid(), 'ndaa_admin'::app_role)
);

-- Verifiers can view all for verification purposes
CREATE POLICY "Verifiers can view all organizations"
ON public.organization_addresses FOR SELECT
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role)
);

-- Add helpful comments
COMMENT ON TABLE public.organization_addresses IS 'Stores business and organization address metadata separate from residential addresses';
COMMENT ON TYPE business_address_type IS 'Types of addresses - residential vs various business/institutional types';
COMMENT ON TYPE business_category IS 'Specific categories of businesses and organizations';