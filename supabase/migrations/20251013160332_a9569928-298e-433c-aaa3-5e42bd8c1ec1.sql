-- Remove CAR Verifier role - Step 1: Update policies and remove role dependencies

-- 1. First, update the auto-approval/rejection trigger to handle both cases
CREATE OR REPLACE FUNCTION public.trigger_auto_approve_citizen_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  nar_address_exists BOOLEAN;
  nar_address_verified BOOLEAN;
BEGIN
  -- Check if UAC exists in NAR (addresses table) and if it's verified
  SELECT 
    EXISTS(SELECT 1 FROM public.addresses WHERE uac = NEW.uac),
    COALESCE((SELECT verified FROM public.addresses WHERE uac = NEW.uac LIMIT 1), false)
  INTO nar_address_exists, nar_address_verified;

  -- Auto-approve if UAC exists and is verified in NAR
  IF nar_address_exists AND nar_address_verified THEN
    NEW.status := 'CONFIRMED';
    RETURN NEW;
  END IF;

  -- Auto-reject if UAC doesn't exist or isn't verified in NAR
  IF NOT nar_address_exists OR NOT nar_address_verified THEN
    NEW.status := 'REJECTED';
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Update the logging trigger to handle both auto-approval and auto-rejection
CREATE OR REPLACE FUNCTION public.log_auto_approval_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  nar_address_exists BOOLEAN;
  rejection_reason TEXT;
BEGIN
  -- Only log for new records (INSERT operations)
  IF OLD.status IS NULL THEN
    -- Check if UAC exists in NAR
    SELECT EXISTS(SELECT 1 FROM public.addresses WHERE uac = NEW.uac AND verified = true)
    INTO nar_address_exists;

    -- Log auto-approval event
    IF NEW.status = 'CONFIRMED' AND nar_address_exists THEN
      INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
      ) VALUES (
        NEW.person_id, 
        NEW.id, 
        'AUTO_VERIFY', 
        NULL, -- System actor
        jsonb_build_object(
          'uac', NEW.uac,
          'reason', 'Auto-approved: UAC references verified NAR address',
          'verification_source', 'NAR_verified_address',
          'auto_approved_at', now()
        )
      );
    END IF;

    -- Log auto-rejection event
    IF NEW.status = 'REJECTED' THEN
      -- Determine rejection reason
      IF NOT EXISTS(SELECT 1 FROM public.addresses WHERE uac = NEW.uac) THEN
        rejection_reason := 'UAC not found in National Address Registry';
      ELSE
        rejection_reason := 'UAC exists in NAR but is not verified';
      END IF;

      INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
      ) VALUES (
        NEW.person_id, 
        NEW.id, 
        'AUTO_REJECT', 
        NULL, -- System actor
        jsonb_build_object(
          'uac', NEW.uac,
          'reason', rejection_reason,
          'verification_source', 'NAR_validation',
          'auto_rejected_at', now()
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Remove any user_roles entries with car_verifier role before removing the role from enum
DELETE FROM public.user_roles WHERE role = 'car_verifier';

-- 4. Update has_car_permission function to not reference car_permissions table
CREATE OR REPLACE FUNCTION public.has_car_permission(_user_id uuid, _permission text)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Only admins and car_admins have CAR permissions (for administrative oversight)
  SELECT has_role(_user_id, 'admin'::app_role) OR has_role(_user_id, 'car_admin'::app_role)
$function$;