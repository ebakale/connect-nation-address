-- =============================================
-- REJECTED ITEMS RETENTION POLICY IMPLEMENTATION
-- =============================================

-- 1. Create archive tables for rejected items
-- =============================================

-- Archive table for rejected NAR address requests
CREATE TABLE public.rejected_requests_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid NOT NULL,
  requester_id uuid,
  request_type text,
  address_type text,
  street text,
  city text,
  region text,
  country text,
  building text,
  latitude numeric,
  longitude numeric,
  rejection_reason text,
  rejection_notes text,
  rejected_by uuid,
  rejected_at timestamptz,
  original_created_at timestamptz,
  archived_at timestamptz DEFAULT now(),
  anonymized_at timestamptz,
  retention_metadata jsonb DEFAULT '{}'::jsonb
);

-- Archive table for rejected CAR citizen addresses
CREATE TABLE public.rejected_citizen_addresses_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid NOT NULL,
  person_id uuid,
  uac text,
  unit_uac text,
  address_kind public.address_kind,
  scope public.address_scope,
  notes text,
  original_created_at timestamptz,
  archived_at timestamptz DEFAULT now(),
  anonymized_at timestamptz,
  retention_metadata jsonb DEFAULT '{}'::jsonb
);

-- Archive table for rejected residency verifications
CREATE TABLE public.rejected_verifications_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid NOT NULL,
  user_id uuid,
  verification_type text,
  uac text,
  verification_notes text,
  verifier_notes text,
  rejected_at timestamptz,
  original_created_at timestamptz,
  archived_at timestamptz DEFAULT now(),
  anonymized_at timestamptz,
  retention_metadata jsonb DEFAULT '{}'::jsonb
);

-- Cleanup audit log table
CREATE TABLE public.cleanup_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_type text NOT NULL,
  records_archived integer DEFAULT 0,
  records_anonymized integer DEFAULT 0,
  records_deleted integer DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  executed_at timestamptz DEFAULT now(),
  executed_by text DEFAULT 'system'
);

-- 2. Enable RLS on archive tables
-- =============================================

ALTER TABLE public.rejected_requests_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_citizen_addresses_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_verifications_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_audit_log ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for archive tables
-- =============================================

-- Users can view their own archived requests
CREATE POLICY "Users can view own archived requests"
ON public.rejected_requests_archive FOR SELECT
USING (requester_id = auth.uid());

-- Admins can view all archived requests
CREATE POLICY "Admins can view all archived requests"
ON public.rejected_requests_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- System can insert archived requests (service role)
CREATE POLICY "System can insert archived requests"
ON public.rejected_requests_archive FOR INSERT
WITH CHECK (true);

-- Users can view own archived CAR addresses
CREATE POLICY "Users can view own archived CAR addresses"
ON public.rejected_citizen_addresses_archive FOR SELECT
USING (
  person_id IN (SELECT id FROM public.person WHERE auth_user_id = auth.uid())
);

-- Admins can view all archived CAR addresses
CREATE POLICY "Admins can view all archived CAR addresses"
ON public.rejected_citizen_addresses_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- System can insert archived CAR addresses
CREATE POLICY "System can insert archived CAR addresses"
ON public.rejected_citizen_addresses_archive FOR INSERT
WITH CHECK (true);

-- Users can view own archived verifications
CREATE POLICY "Users can view own archived verifications"
ON public.rejected_verifications_archive FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all archived verifications
CREATE POLICY "Admins can view all archived verifications"
ON public.rejected_verifications_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- System can insert archived verifications
CREATE POLICY "System can insert archived verifications"
ON public.rejected_verifications_archive FOR INSERT
WITH CHECK (true);

-- Admins can view cleanup audit logs
CREATE POLICY "Admins can view cleanup audit logs"
ON public.cleanup_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert cleanup audit logs
CREATE POLICY "System can insert cleanup audit logs"
ON public.cleanup_audit_log FOR INSERT
WITH CHECK (true);

-- 4. RPC Functions for cleanup operations
-- =============================================

-- Function to archive old rejected NAR requests (6+ months old)
CREATE OR REPLACE FUNCTION public.archive_old_rejected_requests()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  archived_count integer := 0;
  deleted_count integer := 0;
  cutoff_date timestamptz := now() - interval '6 months';
BEGIN
  -- Insert rejected requests older than 6 months into archive
  WITH archived AS (
    INSERT INTO rejected_requests_archive (
      original_id, requester_id, request_type, address_type,
      street, city, region, country, building, latitude, longitude,
      rejection_reason, rejection_notes, rejected_by, rejected_at,
      original_created_at, retention_metadata
    )
    SELECT 
      id, requester_id, request_type, address_type,
      street, city, region, country, building, latitude, longitude,
      rejection_reason, rejection_notes, rejected_by, rejected_at,
      created_at,
      jsonb_build_object(
        'archived_reason', 'automatic_6_month_retention',
        'original_status', status
      )
    FROM address_requests
    WHERE status = 'rejected'
      AND rejected_at < cutoff_date
    RETURNING original_id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete archived requests from main table
  WITH deleted AS (
    DELETE FROM address_requests
    WHERE status = 'rejected'
      AND rejected_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN jsonb_build_object(
    'archived', archived_count,
    'deleted', deleted_count,
    'cutoff_date', cutoff_date
  );
END;
$$;

-- Function to archive old rejected CAR addresses (6+ months old)
CREATE OR REPLACE FUNCTION public.archive_old_rejected_citizen_addresses()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  archived_count integer := 0;
  deleted_count integer := 0;
  cutoff_date timestamptz := now() - interval '6 months';
BEGIN
  -- Insert rejected CAR addresses older than 6 months into archive
  WITH archived AS (
    INSERT INTO rejected_citizen_addresses_archive (
      original_id, person_id, uac, unit_uac, address_kind, scope,
      notes, original_created_at, retention_metadata
    )
    SELECT 
      id, person_id, uac, unit_uac, address_kind, scope,
      notes, created_at,
      jsonb_build_object(
        'archived_reason', 'automatic_6_month_retention',
        'original_status', status::text
      )
    FROM citizen_address
    WHERE status = 'REJECTED'
      AND updated_at < cutoff_date
    RETURNING original_id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete archived CAR addresses from main table
  -- Note: We need to temporarily allow deletion for this cleanup
  WITH deleted AS (
    DELETE FROM citizen_address
    WHERE status = 'REJECTED'
      AND updated_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN jsonb_build_object(
    'archived', archived_count,
    'deleted', deleted_count,
    'cutoff_date', cutoff_date
  );
END;
$$;

-- Function to archive old rejected verifications (6+ months old)
CREATE OR REPLACE FUNCTION public.archive_old_rejected_verifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  archived_count integer := 0;
  deleted_count integer := 0;
  cutoff_date timestamptz := now() - interval '6 months';
BEGIN
  -- Insert rejected verifications older than 6 months into archive
  WITH archived AS (
    INSERT INTO rejected_verifications_archive (
      original_id, user_id, verification_type, uac,
      verification_notes, verifier_notes, rejected_at,
      original_created_at, retention_metadata
    )
    SELECT 
      id, user_id, verification_type, uac,
      verification_notes, verifier_notes, updated_at,
      created_at,
      jsonb_build_object(
        'archived_reason', 'automatic_6_month_retention',
        'original_status', status::text
      )
    FROM residency_ownership_verifications
    WHERE status = 'rejected'
      AND updated_at < cutoff_date
    RETURNING original_id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete archived verifications from main table
  WITH deleted AS (
    DELETE FROM residency_ownership_verifications
    WHERE status = 'rejected'
      AND updated_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN jsonb_build_object(
    'archived', archived_count,
    'deleted', deleted_count,
    'cutoff_date', cutoff_date
  );
END;
$$;

-- Function to anonymize archived records older than 24 months
CREATE OR REPLACE FUNCTION public.anonymize_archived_records()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requests_anonymized integer := 0;
  addresses_anonymized integer := 0;
  verifications_anonymized integer := 0;
  cutoff_date timestamptz := now() - interval '24 months';
BEGIN
  -- Anonymize rejected requests archive
  WITH updated AS (
    UPDATE rejected_requests_archive
    SET 
      requester_id = NULL,
      rejected_by = NULL,
      anonymized_at = now(),
      retention_metadata = retention_metadata || jsonb_build_object('anonymized_reason', 'automatic_24_month_retention')
    WHERE archived_at < cutoff_date
      AND anonymized_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO requests_anonymized FROM updated;
  
  -- Anonymize CAR addresses archive
  WITH updated AS (
    UPDATE rejected_citizen_addresses_archive
    SET 
      person_id = NULL,
      anonymized_at = now(),
      retention_metadata = retention_metadata || jsonb_build_object('anonymized_reason', 'automatic_24_month_retention')
    WHERE archived_at < cutoff_date
      AND anonymized_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO addresses_anonymized FROM updated;
  
  -- Anonymize verifications archive
  WITH updated AS (
    UPDATE rejected_verifications_archive
    SET 
      user_id = NULL,
      anonymized_at = now(),
      retention_metadata = retention_metadata || jsonb_build_object('anonymized_reason', 'automatic_24_month_retention')
    WHERE archived_at < cutoff_date
      AND anonymized_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO verifications_anonymized FROM updated;
  
  RETURN jsonb_build_object(
    'requests_anonymized', requests_anonymized,
    'addresses_anonymized', addresses_anonymized,
    'verifications_anonymized', verifications_anonymized,
    'cutoff_date', cutoff_date
  );
END;
$$;

-- Function for citizens to delete their own rejected requests
CREATE OR REPLACE FUNCTION public.delete_rejected_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
BEGIN
  -- Get the request
  SELECT * INTO request_record
  FROM address_requests
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Check if user owns this request
  IF request_record.requester_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only delete your own requests');
  END IF;
  
  -- Check if request is rejected
  IF request_record.status != 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only rejected requests can be deleted');
  END IF;
  
  -- Delete the request
  DELETE FROM address_requests WHERE id = p_request_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Request deleted successfully');
END;
$$;

-- Function for citizens to delete their own rejected CAR addresses
CREATE OR REPLACE FUNCTION public.delete_rejected_citizen_address(p_address_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  address_record citizen_address%ROWTYPE;
  person_auth_id uuid;
BEGIN
  -- Get the address
  SELECT * INTO address_record
  FROM citizen_address
  WHERE id = p_address_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Address not found');
  END IF;
  
  -- Get the person's auth user id
  SELECT auth_user_id INTO person_auth_id
  FROM person
  WHERE id = address_record.person_id;
  
  -- Check if user owns this address
  IF person_auth_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only delete your own addresses');
  END IF;
  
  -- Check if address is rejected
  IF address_record.status != 'REJECTED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only rejected addresses can be deleted');
  END IF;
  
  -- Delete the address
  DELETE FROM citizen_address WHERE id = p_address_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Address deleted successfully');
END;
$$;

-- Add RLS policy to allow deletion of rejected citizen addresses via RPC
CREATE POLICY "System can delete rejected citizen addresses"
ON public.citizen_address FOR DELETE
USING (
  status = 'REJECTED' AND (
    person_id IN (SELECT id FROM person WHERE auth_user_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Add indexes for performance
CREATE INDEX idx_rejected_requests_archive_requester ON rejected_requests_archive(requester_id) WHERE requester_id IS NOT NULL;
CREATE INDEX idx_rejected_requests_archive_archived_at ON rejected_requests_archive(archived_at);
CREATE INDEX idx_rejected_citizen_addresses_archive_person ON rejected_citizen_addresses_archive(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_rejected_citizen_addresses_archive_archived_at ON rejected_citizen_addresses_archive(archived_at);
CREATE INDEX idx_rejected_verifications_archive_user ON rejected_verifications_archive(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_rejected_verifications_archive_archived_at ON rejected_verifications_archive(archived_at);