-- Create emergency response system tables

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