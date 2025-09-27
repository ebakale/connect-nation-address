-- Enforce requester_id NOT NULL and auto-fill with current user
-- This prevents future orphaned address requests

-- Step 1: Add a trigger to auto-fill requester_id with current authenticated user
CREATE OR REPLACE FUNCTION public.set_requester_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-fill requester_id with current authenticated user if not provided
  IF NEW.requester_id IS NULL THEN
    NEW.requester_id := auth.uid();
  END IF;
  
  -- Ensure requester_id is not null (safety check)
  IF NEW.requester_id IS NULL THEN
    RAISE EXCEPTION 'Address requests must have a valid requester_id. User must be authenticated.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
CREATE TRIGGER ensure_requester_id
  BEFORE INSERT ON public.address_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_requester_id();

-- Step 2: Make requester_id NOT NULL constraint
-- First, ensure all existing records have a requester_id (should be done by previous migration)
UPDATE public.address_requests 
SET requester_id = (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'::app_role 
  LIMIT 1
)
WHERE requester_id IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE public.address_requests 
ALTER COLUMN requester_id SET NOT NULL;

-- Step 3: Add a comment to document this behavior
COMMENT ON COLUMN public.address_requests.requester_id IS 'Required field. Auto-filled with auth.uid() if not provided during insert.';

-- Step 4: Update the INSERT policy to be more permissive since we now auto-fill requester_id
DROP POLICY IF EXISTS "Citizens can request address creation" ON public.address_requests;

CREATE POLICY "Authenticated users can create address requests" ON public.address_requests
FOR INSERT WITH CHECK (
  -- Allow any authenticated user to create requests
  -- The trigger will ensure requester_id is set to auth.uid()
  auth.uid() IS NOT NULL AND requester_id = auth.uid()
);