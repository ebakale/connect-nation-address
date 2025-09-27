-- Migration: Enforce approval = verification rule and clean up data integrity
-- This ensures all addresses in the addresses table follow the "approval = verification" rule

-- Step 1: Fix data integrity issue - addresses that are public but not verified
-- These shouldn't exist under the new rule
UPDATE public.addresses 
SET public = false 
WHERE verified = false AND public = true;

-- Step 2: Since unverified addresses don't have proper user attribution (no user_id column),
-- we'll delete them rather than migrate to address_requests
-- Users will need to re-submit these through the proper request workflow
DELETE FROM public.addresses WHERE verified = false;

-- Step 3: Create a constraint to prevent unverified addresses
-- All addresses must be verified (approved)
ALTER TABLE public.addresses 
ADD CONSTRAINT addresses_must_be_verified 
CHECK (verified = true);

-- Step 4: Create a constraint to prevent public addresses that aren't verified
-- Public addresses must be verified first
ALTER TABLE public.addresses 
ADD CONSTRAINT public_addresses_must_be_verified 
CHECK (NOT public OR verified = true);

-- Step 5: Add a trigger to auto-set verified=true for NAR authority created addresses
CREATE OR REPLACE FUNCTION public.ensure_nar_addresses_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a NAR authority creating an address, ensure it's verified
  IF NEW.created_by_authority IS NOT NULL AND NEW.authority_type = 'nar_authority' THEN
    NEW.verified := true;
  END IF;
  
  -- Enforce that all addresses must be verified
  IF NEW.verified IS NULL OR NEW.verified = false THEN
    RAISE EXCEPTION 'Addresses must be verified. Use address_requests table for unverified submissions.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER enforce_verified_addresses
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_nar_addresses_verified();

-- Step 6: Update any remaining data integrity issues
-- Ensure flagged addresses are not public
UPDATE public.addresses 
SET public = false 
WHERE flagged = true AND public = true;