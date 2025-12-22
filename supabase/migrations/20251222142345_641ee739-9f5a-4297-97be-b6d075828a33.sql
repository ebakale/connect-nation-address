-- Update foreign key constraints to use SET NULL on delete
-- This allows addresses to be deleted while preserving historical records

-- 1. address_requests.approved_address_id
ALTER TABLE public.address_requests 
DROP CONSTRAINT IF EXISTS address_requests_approved_address_id_fkey;

ALTER TABLE public.address_requests 
ADD CONSTRAINT address_requests_approved_address_id_fkey 
FOREIGN KEY (approved_address_id) 
REFERENCES public.addresses(id) 
ON DELETE SET NULL;

-- 2. address_audit_log.address_id
ALTER TABLE public.address_audit_log 
DROP CONSTRAINT IF EXISTS address_audit_log_address_id_fkey;

ALTER TABLE public.address_audit_log 
ADD CONSTRAINT address_audit_log_address_id_fkey 
FOREIGN KEY (address_id) 
REFERENCES public.addresses(id) 
ON DELETE SET NULL;

-- 3. nar_creation_log.address_id (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'nar_creation_log_address_id_fkey'
  ) THEN
    ALTER TABLE public.nar_creation_log 
    DROP CONSTRAINT nar_creation_log_address_id_fkey;
    
    ALTER TABLE public.nar_creation_log 
    ADD CONSTRAINT nar_creation_log_address_id_fkey 
    FOREIGN KEY (address_id) 
    REFERENCES public.addresses(id) 
    ON DELETE SET NULL;
  END IF;
END $$;