-- Phase 2, 3, 4: Database tables for placeholders implementation

-- Table for API Keys management (Phase 4)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API keys
CREATE POLICY "Admins can manage api_keys"
  ON public.api_keys
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Table for Webhook configurations (Phase 4)
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  secret_hash TEXT,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage webhooks
CREATE POLICY "Admins can manage webhook_configs"
  ON public.webhook_configs
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Table for Integration Health Metrics (Phase 4)
CREATE TABLE IF NOT EXISTS public.integration_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
  uptime_percentage NUMERIC(5,2) DEFAULT 100.00,
  avg_response_time_ms INTEGER DEFAULT 0,
  requests_last_24h INTEGER DEFAULT 0,
  last_check TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_health_metrics ENABLE ROW LEVEL SECURITY;

-- Admins can read health metrics
CREATE POLICY "Admins can read integration_health_metrics"
  ON public.integration_health_metrics
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Table for Unit Messages (Phase 3 - Team Communications)
CREATE TABLE IF NOT EXISTS public.unit_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.emergency_units(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  priority_level INTEGER DEFAULT 3,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unit_messages ENABLE ROW LEVEL SECURITY;

-- Police staff can read messages for their units
CREATE POLICY "Police can read unit_messages"
  ON public.unit_messages
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'police_operator') OR
    public.has_role(auth.uid(), 'police_supervisor') OR
    public.has_role(auth.uid(), 'police_dispatcher') OR
    public.has_role(auth.uid(), 'police_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Police staff can insert messages
CREATE POLICY "Police can insert unit_messages"
  ON public.unit_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      public.has_role(auth.uid(), 'police_operator') OR
      public.has_role(auth.uid(), 'police_supervisor') OR
      public.has_role(auth.uid(), 'police_dispatcher') OR
      public.has_role(auth.uid(), 'police_admin') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

-- Enable realtime for unit messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.unit_messages;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unit_messages_unit_id ON public.unit_messages(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_messages_created_at ON public.unit_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON public.api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_status ON public.webhook_configs(status);
CREATE INDEX IF NOT EXISTS idx_integration_health_endpoint ON public.integration_health_metrics(endpoint);