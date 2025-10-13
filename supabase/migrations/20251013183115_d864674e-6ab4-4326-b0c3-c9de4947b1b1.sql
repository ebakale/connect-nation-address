-- Create external_systems table to store real system connections
CREATE TABLE IF NOT EXISTS public.external_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('database', 'api', 'service')),
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  authentication TEXT NOT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_health_metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.integration_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
  uptime_percentage NUMERIC(5,2) DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  requests_last_24h INTEGER DEFAULT 0,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_api_keys table for API management
CREATE TABLE IF NOT EXISTS public.integration_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  rate_limit INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.external_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_systems
CREATE POLICY "Admins can manage external systems"
  ON public.external_systems
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

-- RLS Policies for integration_health_metrics
CREATE POLICY "Admins can view health metrics"
  ON public.integration_health_metrics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

CREATE POLICY "System can insert health metrics"
  ON public.integration_health_metrics
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for integration_api_keys
CREATE POLICY "Admins can manage API keys"
  ON public.integration_api_keys
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_external_systems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for external_systems
CREATE TRIGGER update_external_systems_timestamp
  BEFORE UPDATE ON public.external_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_external_systems_updated_at();

-- Create index for faster queries
CREATE INDEX idx_integration_health_metrics_endpoint ON public.integration_health_metrics(endpoint);
CREATE INDEX idx_integration_health_metrics_created_at ON public.integration_health_metrics(created_at DESC);
CREATE INDEX idx_external_systems_enabled ON public.external_systems(enabled) WHERE enabled = true;