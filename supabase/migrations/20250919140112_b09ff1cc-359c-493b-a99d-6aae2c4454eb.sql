-- Create function to auto-approve citizen declarations for verified addresses
CREATE OR REPLACE FUNCTION public.auto_approve_verified_citizen_addresses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  address_record RECORD;
BEGIN
  -- Auto-approve citizen declarations that reference verified addresses
  FOR address_record IN 
    SELECT ca.id, ca.person_id, ca.uac
    FROM public.citizen_address ca
    WHERE ca.status = 'SELF_DECLARED'
      AND EXISTS (
        SELECT 1 FROM public.addresses a 
        WHERE a.uac = ca.uac 
        AND a.verified = true
      )
  LOOP
    -- Update status to CONFIRMED
    UPDATE public.citizen_address 
    SET status = 'CONFIRMED'
    WHERE id = address_record.id;
    
    -- Log the auto-approval event (using NULL for system actor)
    INSERT INTO public.citizen_address_event (
      person_id, citizen_address_id, event_type, actor_id, payload
    ) VALUES (
      address_record.person_id, 
      address_record.id, 
      'AUTO_VERIFY', 
      NULL, -- System actor
      jsonb_build_object(
        'uac', address_record.uac,
        'reason', 'Auto-approved: UAC references verified address',
        'verification_source', 'NAR_verified_address'
      )
    );
  END LOOP;
END;
$$;

-- Create trigger function to auto-approve new citizen declarations for verified addresses
CREATE OR REPLACE FUNCTION public.trigger_auto_approve_citizen_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is a new SELF_DECLARED address referencing a verified UAC
  IF NEW.status = 'SELF_DECLARED' AND EXISTS (
    SELECT 1 FROM public.addresses a 
    WHERE a.uac = NEW.uac 
    AND a.verified = true
  ) THEN
    -- Auto-approve immediately
    NEW.status := 'CONFIRMED';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for inserting auto-approval event after insert
CREATE OR REPLACE FUNCTION public.log_auto_approval_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If this was auto-approved, log the event
  IF NEW.status = 'CONFIRMED' AND OLD.status IS NULL THEN
    -- Check if it was auto-approved due to verified UAC
    IF EXISTS (
      SELECT 1 FROM public.addresses a 
      WHERE a.uac = NEW.uac 
      AND a.verified = true
    ) THEN
      INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
      ) VALUES (
        NEW.person_id, 
        NEW.id, 
        'AUTO_VERIFY', 
        NULL, -- System actor
        jsonb_build_object(
          'uac', NEW.uac,
          'reason', 'Auto-approved: UAC references verified address',
          'verification_source', 'NAR_verified_address',
          'auto_approved_at', now()
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER auto_approve_citizen_address_trigger
  BEFORE INSERT ON public.citizen_address
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_approve_citizen_address();

CREATE TRIGGER log_auto_approval_event_trigger
  AFTER INSERT ON public.citizen_address
  FOR EACH ROW
  EXECUTE FUNCTION public.log_auto_approval_event();

-- Run initial auto-approval for existing declarations
SELECT public.auto_approve_verified_citizen_addresses();

-- Create view for manual review queue (only unverified UACs)
CREATE OR REPLACE VIEW public.citizen_address_manual_review_queue AS
SELECT 
  ca.*,
  a.street,
  a.city,
  a.region,
  a.country,
  a.building,
  a.address_type,
  a.description as address_description,
  a.latitude,
  a.longitude,
  a.verified as nar_verified,
  a.public as nar_public,
  CASE 
    WHEN a.id IS NULL THEN 'UAC_NOT_FOUND'
    WHEN a.verified = false THEN 'UAC_UNVERIFIED'
    ELSE 'UAC_VERIFIED'
  END as verification_status
FROM public.citizen_address ca
LEFT JOIN public.addresses a ON ca.uac = a.uac
WHERE ca.status = 'SELF_DECLARED'
  AND (a.id IS NULL OR a.verified = false)
ORDER BY ca.created_at DESC;