-- Create emergency notifications table
CREATE TABLE public.emergency_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  incident_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  priority_level INTEGER NOT NULL DEFAULT 3,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.emergency_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.emergency_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.emergency_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.emergency_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_emergency_notifications_user_id ON public.emergency_notifications(user_id);
CREATE INDEX idx_emergency_notifications_created_at ON public.emergency_notifications(created_at);
CREATE INDEX idx_emergency_notifications_read ON public.emergency_notifications(read);

-- Add columns to emergency_units for GPS tracking
ALTER TABLE public.emergency_units 
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS location_accuracy NUMERIC,
ADD COLUMN IF NOT EXISTS heading NUMERIC;

-- Create function to automatically update location timestamp
CREATE OR REPLACE FUNCTION public.update_unit_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.location_latitude IS DISTINCT FROM OLD.location_latitude) OR 
     (NEW.location_longitude IS DISTINCT FROM OLD.location_longitude) THEN
    NEW.location_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for location updates
CREATE TRIGGER update_emergency_units_location_timestamp
  BEFORE UPDATE ON public.emergency_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unit_location_timestamp();