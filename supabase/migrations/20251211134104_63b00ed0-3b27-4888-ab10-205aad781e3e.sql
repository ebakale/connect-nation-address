-- Create system_config table for persistent configuration
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only police_admin and admin can manage config
CREATE POLICY "Police admins can view system config" 
ON public.system_config 
FOR SELECT 
USING (has_role(auth.uid(), 'police_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police admins can insert system config" 
ON public.system_config 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'police_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police admins can update system config" 
ON public.system_config 
FOR UPDATE 
USING (has_role(auth.uid(), 'police_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Police admins can delete system config" 
ON public.system_config 
FOR DELETE 
USING (has_role(auth.uid(), 'police_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_system_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_config_timestamp
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION update_system_config_updated_at();

-- Insert default configurations
INSERT INTO public.system_config (config_key, config_value, category, description) VALUES
('system_name', 'Police Emergency Response System', 'general', 'Name of the emergency response system'),
('system_description', 'Comprehensive emergency response and incident management system for law enforcement', 'general', 'System description'),
('default_language', 'en', 'general', 'Default system language'),
('timezone', 'Africa/Malabo', 'general', 'System timezone'),
('default_region', 'Equatorial Guinea', 'general', 'Default operating region'),
('emergency_response_time', '5', 'emergency', 'Target response time in minutes'),
('priority_levels', '5', 'emergency', 'Number of priority levels'),
('auto_dispatch', 'false', 'emergency', 'Enable automatic dispatch'),
('backup_request_threshold', '15', 'emergency', 'Minutes before backup can be requested'),
('email_notifications', 'true', 'notifications', 'Enable email notifications'),
('sms_notifications', 'true', 'notifications', 'Enable SMS notifications'),
('push_notifications', 'true', 'notifications', 'Enable push notifications'),
('notification_retry_count', '3', 'notifications', 'Number of notification retries'),
('session_timeout', '480', 'security', 'Session timeout in minutes'),
('password_policy', 'strict', 'security', 'Password policy level'),
('two_factor_required', 'false', 'security', 'Require two-factor authentication'),
('encryption_enabled', 'true', 'security', 'Enable data encryption'),
('location_accuracy', '10', 'location', 'Required location accuracy in meters'),
('gps_tracking_enabled', 'true', 'location', 'Enable GPS tracking'),
('map_provider', 'mapbox', 'location', 'Map provider service'),
('api_rate_limit', '1000', 'api', 'API rate limit per hour'),
('webhook_timeout', '30', 'api', 'Webhook timeout in seconds'),
('api_logging_enabled', 'true', 'api', 'Enable API logging'),
('cors_enabled', 'true', 'api', 'Enable CORS')
ON CONFLICT (config_key) DO NOTHING;