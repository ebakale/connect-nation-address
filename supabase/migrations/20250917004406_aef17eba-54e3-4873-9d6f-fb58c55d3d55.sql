-- Create legal framework and privacy protection tables for residency/ownership verification

-- Legal document types and requirements
CREATE TYPE public.legal_document_type AS ENUM (
  'property_deed',
  'land_certificate',
  'lease_agreement',
  'tenancy_agreement',
  'utility_bill',
  'bank_statement',
  'tax_certificate',
  'inheritance_document',
  'court_order',
  'government_id',
  'passport',
  'birth_certificate',
  'marriage_certificate',
  'other_legal_document'
);

-- Verification statuses
CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'document_review',
  'field_verification',
  'legal_review',
  'approved',
  'rejected',
  'requires_additional_documents',
  'under_investigation'
);

-- Privacy access levels
CREATE TYPE public.privacy_access_level AS ENUM (
  'public',
  'restricted',
  'confidential',
  'classified'
);

-- Legal compliance framework table
CREATE TABLE public.legal_compliance_framework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL DEFAULT 'Equatorial Guinea',
  applicable_laws TEXT[] NOT NULL DEFAULT '{}',
  data_retention_period INTEGER NOT NULL DEFAULT 2555, -- 7 years in days
  privacy_regulations TEXT[] NOT NULL DEFAULT '{}',
  consent_requirements TEXT[] NOT NULL DEFAULT '{}',
  notification_requirements TEXT[] NOT NULL DEFAULT '{}',
  cross_border_restrictions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Residency/ownership verification requests
CREATE TABLE public.residency_ownership_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address_request_id UUID REFERENCES public.address_requests(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('residency', 'ownership', 'both')),
  claimant_relationship TEXT NOT NULL CHECK (claimant_relationship IN ('owner', 'tenant', 'family_member', 'authorized_representative', 'other')),
  
  -- Legal document references
  primary_document_type legal_document_type NOT NULL,
  primary_document_url TEXT,
  primary_document_hash TEXT, -- For integrity verification
  
  supporting_documents JSONB DEFAULT '[]', -- Array of document objects
  
  -- Privacy and consent
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  privacy_level privacy_access_level NOT NULL DEFAULT 'restricted',
  data_retention_consent BOOLEAN NOT NULL DEFAULT false,
  
  -- Verification process
  status verification_status NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Legal compliance
  legal_basis TEXT NOT NULL, -- Legal basis for processing
  processing_purpose TEXT NOT NULL,
  retention_period INTEGER DEFAULT 2555, -- Days
  
  -- Field verification
  field_verification_required BOOLEAN DEFAULT false,
  field_verification_scheduled_at TIMESTAMP WITH TIME ZONE,
  field_verification_completed_at TIMESTAMP WITH TIME ZONE,
  field_verification_notes TEXT,
  
  -- Audit trail
  verification_history JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE -- For automatic data deletion
);

-- Privacy consent log
CREATE TABLE public.privacy_consent_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_id UUID REFERENCES public.residency_ownership_verifications(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'data_processing', 'data_retention', 'third_party_sharing', etc.
  consent_given BOOLEAN NOT NULL,
  consent_details JSONB DEFAULT '{}',
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  consent_withdrawn_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  legal_basis TEXT NOT NULL
);

-- Document verification audit trail
CREATE TABLE public.document_verification_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id UUID REFERENCES public.residency_ownership_verifications(id) ON DELETE CASCADE,
  document_hash TEXT NOT NULL,
  action TEXT NOT NULL, -- 'uploaded', 'verified', 'rejected', 'deleted'
  performed_by UUID NOT NULL,
  verification_method TEXT, -- 'manual', 'automated', 'third_party'
  verification_details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Legal authorities and authorized verifiers
CREATE TABLE public.authorized_verifiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  authority_name TEXT NOT NULL,
  authority_type TEXT NOT NULL CHECK (authority_type IN ('government', 'legal', 'notary', 'surveyor', 'utility_company', 'bank')),
  license_number TEXT,
  jurisdiction TEXT NOT NULL DEFAULT 'Equatorial Guinea',
  verification_scope TEXT[] NOT NULL DEFAULT '{}', -- What they can verify
  authorization_document_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  authorized_by UUID,
  authorized_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.legal_compliance_framework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residency_ownership_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_verification_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_verifiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_compliance_framework
CREATE POLICY "Public can view active compliance framework"
ON public.legal_compliance_framework
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage compliance framework"
ON public.legal_compliance_framework
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- RLS Policies for residency_ownership_verifications
CREATE POLICY "Users can view their own verifications"
ON public.residency_ownership_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
ON public.residency_ownership_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verifications"
ON public.residency_ownership_verifications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending'::verification_status);

CREATE POLICY "Authorized verifiers can view assigned verifications"
ON public.residency_ownership_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.authorized_verifiers av
    WHERE av.user_id = auth.uid() AND av.is_active = true
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role)
);

CREATE POLICY "Authorized verifiers can update verifications"
ON public.residency_ownership_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.authorized_verifiers av
    WHERE av.user_id = auth.uid() AND av.is_active = true
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role)
);

-- RLS Policies for privacy_consent_log
CREATE POLICY "Users can view their own consent log"
ON public.privacy_consent_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create consent logs"
ON public.privacy_consent_log
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view consent logs"
ON public.privacy_consent_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- RLS Policies for document_verification_audit
CREATE POLICY "Users can view audit of their verifications"
ON public.document_verification_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.residency_ownership_verifications rov
    WHERE rov.id = verification_id AND rov.user_id = auth.uid()
  )
);

CREATE POLICY "Authorized staff can create audit entries"
ON public.document_verification_audit
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.authorized_verifiers av
    WHERE av.user_id = auth.uid() AND av.is_active = true
  )
);

CREATE POLICY "Authorized staff can view audit entries"
ON public.document_verification_audit
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.authorized_verifiers av
    WHERE av.user_id = auth.uid() AND av.is_active = true
  )
);

-- RLS Policies for authorized_verifiers
CREATE POLICY "Users can view their own verifier status"
ON public.authorized_verifiers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage authorized verifiers"
ON public.authorized_verifiers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

CREATE POLICY "Staff can view active verifiers"
ON public.authorized_verifiers
FOR SELECT
USING (
  is_active = true AND (
    has_role(auth.uid(), 'verifier'::app_role) OR 
    has_role(auth.uid(), 'registrar'::app_role)
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_legal_compliance_framework_updated_at
BEFORE UPDATE ON public.legal_compliance_framework
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_residency_ownership_verifications_updated_at
BEFORE UPDATE ON public.residency_ownership_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default legal compliance framework for Equatorial Guinea
INSERT INTO public.legal_compliance_framework (
  jurisdiction,
  applicable_laws,
  privacy_regulations,
  consent_requirements,
  notification_requirements,
  cross_border_restrictions
) VALUES (
  'Equatorial Guinea',
  ARRAY[
    'Ley de Propiedad Inmobiliaria',
    'Código Civil de Guinea Ecuatorial',
    'Ley de Registro de la Propiedad',
    'Reglamento de Ordenación Territorial'
  ],
  ARRAY[
    'Ley de Protección de Datos Personales',
    'Constitución de Guinea Ecuatorial - Artículo 13'
  ],
  ARRAY[
    'Consentimiento explícito para procesamiento de datos',
    'Consentimiento para verificación de documentos',
    'Notificación de propósito de procesamiento'
  ],
  ARRAY[
    'Notificación a autoridades locales',
    'Notificación a propietarios vecinos para disputas',
    'Publicación en registro público cuando requerido'
  ],
  '{
    "data_transfer_restrictions": ["EU", "AU"],
    "document_sharing_limitations": ["government_only"],
    "cross_border_verification_required": true
  }'
);

-- Functions for verification workflow
CREATE OR REPLACE FUNCTION public.initiate_residency_verification(
  p_user_id UUID,
  p_address_request_id UUID,
  p_verification_type TEXT,
  p_claimant_relationship TEXT,
  p_primary_document_type legal_document_type,
  p_legal_basis TEXT,
  p_processing_purpose TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verification_id UUID;
BEGIN
  -- Create verification request
  INSERT INTO public.residency_ownership_verifications (
    user_id,
    address_request_id,
    verification_type,
    claimant_relationship,
    primary_document_type,
    legal_basis,
    processing_purpose,
    status
  ) VALUES (
    p_user_id,
    p_address_request_id,
    p_verification_type,
    p_claimant_relationship,
    p_primary_document_type,
    p_legal_basis,
    p_processing_purpose,
    'pending'::verification_status
  ) RETURNING id INTO v_verification_id;
  
  RETURN v_verification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_privacy_consent(
  p_user_id UUID,
  p_verification_id UUID,
  p_consent_type TEXT,
  p_consent_given BOOLEAN,
  p_consent_details JSONB DEFAULT '{}',
  p_legal_basis TEXT DEFAULT 'user_consent'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO public.privacy_consent_log (
    user_id,
    verification_id,
    consent_type,
    consent_given,
    consent_details,
    legal_basis
  ) VALUES (
    p_user_id,
    p_verification_id,
    p_consent_type,
    p_consent_given,
    p_consent_details,
    p_legal_basis
  ) RETURNING id INTO v_consent_id;
  
  -- Update verification record if this is primary consent
  IF p_consent_type = 'data_processing' THEN
    UPDATE public.residency_ownership_verifications
    SET 
      consent_given = p_consent_given,
      consent_timestamp = now()
    WHERE id = p_verification_id;
  END IF;
  
  RETURN v_consent_id;
END;
$$;