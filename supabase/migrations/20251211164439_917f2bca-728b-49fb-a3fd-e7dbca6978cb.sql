-- Add enhanced backup request tracking columns to emergency_incidents
ALTER TABLE public.emergency_incidents 
ADD COLUMN IF NOT EXISTS backup_request_status text DEFAULT 'pending' CHECK (backup_request_status IN ('pending', 'acknowledged', 'approved', 'denied', 'fulfilled', 'cancelled')),
ADD COLUMN IF NOT EXISTS backup_approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS backup_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS backup_denied_reason text,
ADD COLUMN IF NOT EXISTS backup_urgency_level integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_officer_down boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS officer_down_at timestamp with time zone;

-- Create backup acknowledgments table
CREATE TABLE IF NOT EXISTS public.backup_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  notification_id uuid REFERENCES public.emergency_notifications(id),
  acknowledged_by uuid NOT NULL REFERENCES auth.users(id),
  acknowledgment_type text NOT NULL CHECK (acknowledgment_type IN ('receipt', 'en_route', 'on_scene', 'all_clear')),
  acknowledged_at timestamp with time zone DEFAULT now(),
  unit_id uuid REFERENCES public.emergency_units(id),
  estimated_arrival_minutes integer,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on backup_acknowledgments
ALTER TABLE public.backup_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS policies for backup_acknowledgments
CREATE POLICY "Police staff can view backup acknowledgments"
ON public.backup_acknowledgments FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR
  has_role(auth.uid(), 'police_supervisor'::app_role) OR
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR
  has_role(auth.uid(), 'police_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Police staff can create backup acknowledgments"
ON public.backup_acknowledgments FOR INSERT
WITH CHECK (
  auth.uid() = acknowledged_by AND (
    has_role(auth.uid(), 'police_operator'::app_role) OR
    has_role(auth.uid(), 'police_supervisor'::app_role) OR
    has_role(auth.uid(), 'police_dispatcher'::app_role) OR
    has_role(auth.uid(), 'police_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_backup_acknowledgments_incident ON public.backup_acknowledgments(incident_id);
CREATE INDEX IF NOT EXISTS idx_backup_acknowledgments_notification ON public.backup_acknowledgments(notification_id);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_backup_status ON public.emergency_incidents(backup_request_status) WHERE backup_requested = true;