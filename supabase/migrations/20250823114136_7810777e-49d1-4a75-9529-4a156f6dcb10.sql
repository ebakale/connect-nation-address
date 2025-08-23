-- Add RLS policies and complete emergency system setup

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