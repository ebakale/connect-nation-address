-- Create a function to notify verifiers when verification requests are updated
CREATE OR REPLACE FUNCTION public.notify_verifiers_on_verification_update()
RETURNS TRIGGER AS $$
DECLARE
  verifier_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only send notifications when status changes to pending (indicating an edit/resubmission)
  IF NEW.status = 'pending' AND (OLD.status != 'pending' OR OLD.updated_at != NEW.updated_at) THEN
    
    -- Determine if this is an edit or new submission
    IF OLD.status = 'rejected' THEN
      notification_title := 'Verification Request Updated After Rejection';
      notification_message := 'A verification request has been updated after rejection and requires re-review.';
    ELSIF OLD.status = 'requires_additional_documents' THEN
      notification_title := 'Additional Documents Provided';
      notification_message := 'A verification request has been updated with additional documents.';
    ELSE
      notification_title := 'Verification Request Updated';
      notification_message := 'A verification request has been updated and requires review.';
    END IF;
    
    -- Send notifications to all active verifiers and authorized staff
    FOR verifier_record IN 
      SELECT DISTINCT ur.user_id
      FROM user_roles ur
      WHERE ur.role IN ('verifier', 'registrar', 'admin')
      
      UNION
      
      SELECT DISTINCT av.user_id
      FROM authorized_verifiers av
      WHERE av.is_active = true 
        AND (av.expires_at IS NULL OR av.expires_at > now())
        AND 'residency_verification' = ANY(av.verification_scope)
    LOOP
      INSERT INTO emergency_notifications (
        user_id,
        title,
        message,
        type,
        priority_level,
        metadata
      ) VALUES (
        verifier_record.user_id,
        notification_title,
        notification_message,
        'verification_update',
        2, -- Medium priority
        jsonb_build_object(
          'verification_id', NEW.id,
          'verification_type', NEW.verification_type,
          'previous_status', OLD.status,
          'updated_by', NEW.user_id,
          'requires_review', true
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for verification updates
DROP TRIGGER IF EXISTS trigger_notify_verifiers_on_verification_update ON residency_ownership_verifications;
CREATE TRIGGER trigger_notify_verifiers_on_verification_update
  AFTER UPDATE ON residency_ownership_verifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_verifiers_on_verification_update();

-- Also create a function to get pending verification requests count for verifiers
CREATE OR REPLACE FUNCTION public.get_pending_verifications_count()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM residency_ownership_verifications
  WHERE status = 'pending'
    AND (
      -- User has verifier role
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('verifier', 'registrar', 'admin')
      )
      OR
      -- User is authorized verifier
      EXISTS (
        SELECT 1 FROM authorized_verifiers av
        WHERE av.user_id = auth.uid() 
        AND av.is_active = true
        AND (av.expires_at IS NULL OR av.expires_at > now())
        AND 'residency_verification' = ANY(av.verification_scope)
      )
    );
$$;