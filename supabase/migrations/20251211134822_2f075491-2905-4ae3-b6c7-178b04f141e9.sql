-- Phase 4: Create incident_evidence table for field photo capture
CREATE TABLE public.incident_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT DEFAULT 'image/jpeg',
  description TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_evidence ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Police staff can view incident evidence"
ON public.incident_evidence FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR
  has_role(auth.uid(), 'police_supervisor'::app_role) OR
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR
  has_role(auth.uid(), 'police_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Police operators can upload evidence"
ON public.incident_evidence FOR INSERT
WITH CHECK (
  (auth.uid() = officer_id) AND (
    has_role(auth.uid(), 'police_operator'::app_role) OR
    has_role(auth.uid(), 'police_supervisor'::app_role) OR
    has_role(auth.uid(), 'police_dispatcher'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Police admins can delete evidence"
ON public.incident_evidence FOR DELETE
USING (
  has_role(auth.uid(), 'police_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create storage bucket for incident evidence
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-evidence',
  'incident-evidence',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for incident evidence bucket
CREATE POLICY "Police can view evidence files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-evidence' AND (
    has_role(auth.uid(), 'police_operator'::app_role) OR
    has_role(auth.uid(), 'police_supervisor'::app_role) OR
    has_role(auth.uid(), 'police_dispatcher'::app_role) OR
    has_role(auth.uid(), 'police_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Police operators can upload evidence files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-evidence' AND (
    has_role(auth.uid(), 'police_operator'::app_role) OR
    has_role(auth.uid(), 'police_supervisor'::app_role) OR
    has_role(auth.uid(), 'police_dispatcher'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Police admins can delete evidence files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-evidence' AND (
    has_role(auth.uid(), 'police_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);