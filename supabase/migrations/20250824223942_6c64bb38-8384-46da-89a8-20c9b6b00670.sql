-- Create communications table for unit-dispatch messaging
CREATE TABLE public.unit_communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_unit_id uuid REFERENCES emergency_units(id),
  from_user_id uuid REFERENCES profiles(user_id),
  to_user_id uuid REFERENCES profiles(user_id) DEFAULT NULL,
  message_type text NOT NULL DEFAULT 'text',
  message_content text NOT NULL,
  is_radio_code boolean NOT NULL DEFAULT false,
  radio_code text DEFAULT NULL,
  priority_level integer NOT NULL DEFAULT 3,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by uuid REFERENCES profiles(user_id) DEFAULT NULL,
  acknowledged_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.unit_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for communications
CREATE POLICY "Police staff can view all communications"
ON public.unit_communications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('police_operator', 'police_dispatcher', 'police_supervisor', 'admin')
  )
);

CREATE POLICY "Police staff can send communications"
ON public.unit_communications
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id AND
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('police_operator', 'police_dispatcher', 'police_supervisor', 'admin')
  )
);

CREATE POLICY "Dispatchers can acknowledge communications"
ON public.unit_communications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('police_dispatcher', 'police_supervisor', 'admin')
  )
);

-- Create indexes for performance
CREATE INDEX idx_unit_communications_from_unit ON public.unit_communications(from_unit_id);
CREATE INDEX idx_unit_communications_created_at ON public.unit_communications(created_at DESC);
CREATE INDEX idx_unit_communications_acknowledged ON public.unit_communications(acknowledged);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.unit_communications;