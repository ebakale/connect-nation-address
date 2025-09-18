-- Migration: Separate NAR and CAR - Clean Architecture (Step by Step)
-- Drop all dependent policies first

-- Step 1: Drop all policies that reference user_id columns
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Staff can create addresses for users" ON public.addresses;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.address_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.address_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.address_requests;

-- Step 2: Remove user_id columns
ALTER TABLE public.addresses DROP COLUMN user_id;
ALTER TABLE public.address_requests DROP COLUMN user_id;

-- Step 3: Add new authority-based columns
ALTER TABLE public.addresses 
ADD COLUMN created_by_authority uuid REFERENCES auth.users(id),
ADD COLUMN authority_type text CHECK (authority_type IN ('registrar', 'admin', 'field_agent', 'municipal_authority')),
ADD COLUMN creation_source text DEFAULT 'manual' CHECK (creation_source IN ('manual', 'field_survey', 'municipal_import', 'gis_data'));

ALTER TABLE public.address_requests 
ADD COLUMN requester_id uuid REFERENCES auth.users(id),
ADD COLUMN request_type text DEFAULT 'create_address' CHECK (request_type IN ('create_address', 'update_address', 'verify_coordinates')),
ADD COLUMN intended_occupant_id uuid REFERENCES public.person(id);