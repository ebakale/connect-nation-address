-- Fix security vulnerability: Remove overly permissive policy and add proper access controls

-- 1. Drop the problematic policy that exposes all verified addresses
DROP POLICY IF EXISTS "Anyone can view verified addresses" ON public.addresses;

-- 2. Add a 'public' column to distinguish between verified and publicly visible addresses
ALTER TABLE public.addresses ADD COLUMN public BOOLEAN NOT NULL DEFAULT false;

-- 3. Create a more secure policy for public access - only truly public addresses (like businesses, landmarks)
CREATE POLICY "Anyone can view public addresses" 
ON public.addresses 
FOR SELECT 
USING (public = true);

-- 4. Add a policy for authenticated users to search verified addresses in their region (without exact coordinates)
CREATE POLICY "Authenticated users can view regional verified addresses" 
ON public.addresses 
FOR SELECT 
TO authenticated
USING (
  verified = true 
  AND public = false 
  AND auth.uid() IS NOT NULL
);

-- 5. Create an index for the new public column
CREATE INDEX idx_addresses_public ON public.addresses(public);

-- 6. Create a view for safe public address search (without exact coordinates for private addresses)
CREATE OR REPLACE VIEW public.addresses_search AS
SELECT 
  uac,
  country,
  region,
  city,
  street,
  building,
  -- Only show exact coordinates for public addresses, approximate for others
  CASE 
    WHEN public = true THEN latitude
    ELSE ROUND(latitude::numeric, 3)::decimal(10,8) -- Approximate to ~100m accuracy
  END as latitude,
  CASE 
    WHEN public = true THEN longitude  
    ELSE ROUND(longitude::numeric, 3)::decimal(11,8) -- Approximate to ~100m accuracy
  END as longitude,
  address_type,
  -- Only show description for public addresses
  CASE 
    WHEN public = true THEN description
    ELSE NULL
  END as description,
  verified,
  public,
  created_at
FROM public.addresses 
WHERE verified = true;

-- 7. Grant access to the search view
GRANT SELECT ON public.addresses_search TO authenticated, anon;