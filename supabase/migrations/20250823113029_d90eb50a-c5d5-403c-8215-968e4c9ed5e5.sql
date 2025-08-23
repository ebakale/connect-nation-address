-- Add police roles to existing enum (separate transaction)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_operator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_supervisor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_dispatcher';