-- Allow users to resubmit rejected verification requests and keep timestamps/notifications in sync
BEGIN;

-- 1) Relax RLS to allow updating rejected verifications (so users can correct and resubmit)
DROP POLICY IF EXISTS "Users can update their own pending verifications" ON public.residency_ownership_verifications;

CREATE POLICY "Users can update own pending or rejected verifications"
ON public.residency_ownership_verifications
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status IN ('pending'::verification_status, 'rejected'::verification_status)
)
WITH CHECK (
  -- After the update, user may only set status back to pending (resubmission)
  auth.uid() = user_id
  AND status = 'pending'::verification_status
);

-- 2) Keep updated_at accurate on every update
DROP TRIGGER IF EXISTS update_residency_verifications_updated_at ON public.residency_ownership_verifications;
CREATE TRIGGER update_residency_verifications_updated_at
BEFORE UPDATE ON public.residency_ownership_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Notify verifiers when a request is updated back to pending
DROP TRIGGER IF EXISTS trg_notify_verifiers_on_verification_update ON public.residency_ownership_verifications;
CREATE TRIGGER trg_notify_verifiers_on_verification_update
AFTER UPDATE ON public.residency_ownership_verifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_verifiers_on_verification_update();

COMMIT;