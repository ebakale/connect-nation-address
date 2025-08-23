-- Create police emergency response system tables and roles

-- Add police roles to existing enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_operator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_supervisor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'police_dispatcher';

-- Create emergency_incidents table for tracking all emergency reports
CREATE TABLE public.emergency_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
  reporter_id UUID,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('medical', 'fire', 'police', 'general')),
  priority_level INTEGER NOT NULL DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'dispatched', 'responding', 'on_scene', 'resolved', 'closed')),
  
  -- Location data (encrypted)
  encrypted_latitude TEXT,
  encrypted_longitude TEXT,
  encrypted_address TEXT,
  location_accuracy NUMERIC,
  
  -- Message data (encrypted)
  encrypted_message TEXT NOT NULL,
  encrypted_contact_info TEXT,
  
  -- Metadata
  language_code TEXT DEFAULT 'en',
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dispatched_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assignment tracking
  assigned_operator_id UUID,
  assigned_units TEXT[],
  dispatcher_notes TEXT,
  
  -- Integration fields
  external_case_id TEXT,
  dispatch_system_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_incident_logs for audit trail
CREATE TABLE public.emergency_incident_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_operator_sessions for tracking active sessions
CREATE TABLE public.emergency_operator_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  active_incidents UUID[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'break', 'offline')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sms_fallback_queue for offline emergency triggers
CREATE TABLE public.sms_fallback_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  location_data TEXT,
  priority INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  provider_response JSONB,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_operator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_fallback_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_incidents
CREATE POLICY "Police operators can view all incidents" 
ON public.emergency_incidents 
FOR SELECT 
USING (has_role(auth.uid(), 'police_operator'::app_role) OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR 
       has_role(auth.uid(), 'police_dispatcher'::app_role) OR
       has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police operators can update incidents" 
ON public.emergency_incidents 
FOR UPDATE 
USING (has_role(auth.uid(), 'police_operator'::app_role) OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR 
       has_role(auth.uid(), 'police_dispatcher'::app_role) OR
       has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police operators can create incidents" 
ON public.emergency_incidents 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'police_operator'::app_role) OR 
            has_role(auth.uid(), 'police_supervisor'::app_role) OR 
            has_role(auth.uid(), 'police_dispatcher'::app_role) OR
            has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for incident logs
CREATE POLICY "Police staff can view incident logs" 
ON public.emergency_incident_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'police_operator'::app_role) OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR 
       has_role(auth.uid(), 'police_dispatcher'::app_role) OR
       has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police staff can create incident logs" 
ON public.emergency_incident_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (
            has_role(auth.uid(), 'police_operator'::app_role) OR 
            has_role(auth.uid(), 'police_supervisor'::app_role) OR 
            has_role(auth.uid(), 'police_dispatcher'::app_role) OR
            has_role(auth.uid(), 'admin'::app_role)));

-- RLS Policies for operator sessions
CREATE POLICY "Operators can view their own sessions" 
ON public.emergency_operator_sessions 
FOR ALL 
USING (auth.uid() = operator_id OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR
       has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for SMS fallback
CREATE POLICY "Police staff can manage SMS fallback" 
ON public.sms_fallback_queue 
FOR ALL 
USING (has_role(auth.uid(), 'police_operator'::app_role) OR 
       has_role(auth.uid(), 'police_supervisor'::app_role) OR 
       has_role(auth.uid(), 'police_dispatcher'::app_role) OR
       has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_emergency_incidents_status ON public.emergency_incidents(status);
CREATE INDEX idx_emergency_incidents_priority ON public.emergency_incidents(priority_level);
CREATE INDEX idx_emergency_incidents_reported_at ON public.emergency_incidents(reported_at);
CREATE INDEX idx_emergency_incidents_assigned_operator ON public.emergency_incidents(assigned_operator_id);
CREATE INDEX idx_emergency_incident_logs_incident_id ON public.emergency_incident_logs(incident_id);
CREATE INDEX idx_emergency_incident_logs_timestamp ON public.emergency_incident_logs(timestamp);
CREATE INDEX idx_sms_fallback_status ON public.sms_fallback_queue(status);

-- Create function to generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  incident_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next sequence number for the year
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') 
  INTO sequence_part
  FROM public.emergency_incidents 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  incident_num := 'INC-' || year_part || '-' || sequence_part;
  
  RETURN incident_num;
END;
$$;

-- Create trigger to auto-generate incident numbers
CREATE OR REPLACE FUNCTION set_incident_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    NEW.incident_number := generate_incident_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_incident_number
  BEFORE INSERT ON public.emergency_incidents
  FOR EACH ROW
  EXECUTE FUNCTION set_incident_number();

-- Create trigger for updating timestamps
CREATE TRIGGER update_emergency_incidents_updated_at
  BEFORE UPDATE ON public.emergency_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_operator_sessions_updated_at
  BEFORE UPDATE ON public.emergency_operator_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_incident_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_operator_sessions;

-- Set replica identity for realtime
ALTER TABLE public.emergency_incidents REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_incident_logs REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_operator_sessions REPLICA IDENTITY FULL;