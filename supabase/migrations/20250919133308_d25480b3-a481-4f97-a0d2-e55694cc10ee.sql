-- Add CAR-specific roles to app_role enum
-- This must be done in separate transaction from their usage

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'car_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'car_verifier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'residency_verifier';