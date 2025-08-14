-- Add new roles to the app_role enum one by one
ALTER TYPE public.app_role ADD VALUE 'citizen';
ALTER TYPE public.app_role ADD VALUE 'property_claimant';
ALTER TYPE public.app_role ADD VALUE 'field_agent';
ALTER TYPE public.app_role ADD VALUE 'verifier';
ALTER TYPE public.app_role ADD VALUE 'registrar';
ALTER TYPE public.app_role ADD VALUE 'ndaa_admin';
ALTER TYPE public.app_role ADD VALUE 'partner';
ALTER TYPE public.app_role ADD VALUE 'auditor';
ALTER TYPE public.app_role ADD VALUE 'data_steward';
ALTER TYPE public.app_role ADD VALUE 'support';