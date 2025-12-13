-- Government Postal Delivery Module - Part 1: Add new roles
-- Add new postal roles to existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'postal_clerk';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'postal_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'postal_dispatcher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'postal_supervisor';