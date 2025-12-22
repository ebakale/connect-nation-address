-- Fix SECURITY DEFINER views by setting security_invoker = true
-- This ensures views respect the querying user's RLS policies instead of the view owner's

-- Fix citizen_address_with_details view
ALTER VIEW public.citizen_address_with_details SET (security_invoker = true);

-- Fix my_person view
ALTER VIEW public.my_person SET (security_invoker = true);

-- Fix current_citizen_addresses view
ALTER VIEW public.current_citizen_addresses SET (security_invoker = true);

-- Fix citizen_address_manual_review_queue view
ALTER VIEW public.citizen_address_manual_review_queue SET (security_invoker = true);