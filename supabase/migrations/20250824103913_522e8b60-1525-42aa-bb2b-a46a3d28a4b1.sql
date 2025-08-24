-- Create emergency_units table
CREATE TABLE public.emergency_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_code text NOT NULL UNIQUE,
  unit_name text NOT NULL,
  unit_type text NOT NULL DEFAULT 'patrol',
  status text NOT NULL DEFAULT 'available',
  location_latitude numeric,
  location_longitude numeric,
  current_location text,
  radio_frequency text,
  vehicle_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for unit members
CREATE TABLE public.emergency_unit_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id uuid NOT NULL REFERENCES public.emergency_units(id) ON DELETE CASCADE,
  officer_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'officer',
  is_lead boolean NOT NULL DEFAULT false,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(unit_id, officer_id)
);

-- Enable RLS
ALTER TABLE public.emergency_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_unit_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_units
CREATE POLICY "Police staff can view all units"
ON public.emergency_units
FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR 
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Police supervisors can manage units"
ON public.emergency_units
FOR ALL
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for emergency_unit_members
CREATE POLICY "Police staff can view unit members"
ON public.emergency_unit_members
FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role) OR 
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'police_dispatcher'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Police supervisors can manage unit members"
ON public.emergency_unit_members
FOR ALL
USING (
  has_role(auth.uid(), 'police_supervisor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_emergency_units_updated_at
  BEFORE UPDATE ON public.emergency_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test emergency units
INSERT INTO public.emergency_units (unit_code, unit_name, unit_type, status, current_location, radio_frequency, vehicle_id) VALUES
('UNIT-001', 'Alpha Patrol Unit', 'patrol', 'available', 'Malabo Central District', '154.200', 'VEH-001'),
('UNIT-002', 'Bravo Response Team', 'response', 'available', 'Bata Commercial Zone', '154.250', 'VEH-002'),
('UNIT-003', 'Charlie Investigation Unit', 'investigation', 'busy', 'Evidence Lab - Malabo', '154.300', 'VEH-003'),
('UNIT-004', 'Delta Traffic Unit', 'traffic', 'available', 'Airport Road Junction', '154.350', 'VEH-004'),
('UNIT-005', 'Echo Emergency Response', 'emergency', 'on_call', 'Fire Station - Bata', '154.400', 'VEH-005'),
('UNIT-006', 'Foxtrot Security Unit', 'security', 'available', 'Government Building', '154.450', 'VEH-006'),
('UNIT-007', 'Golf K9 Unit', 'k9', 'training', 'Training Facility', '154.500', 'VEH-007'),
('UNIT-008', 'Hotel Marine Unit', 'marine', 'available', 'Port Authority - Bata', '154.550', 'VEH-008');

-- We'll need to add test officers as unit members after confirming existing police users
-- For now, let's create a view to see available officers for assignment
CREATE OR REPLACE VIEW public.available_officers AS
SELECT 
  p.user_id,
  p.full_name,
  ur.role,
  CASE 
    WHEN eum.unit_id IS NOT NULL THEN 'assigned'
    ELSE 'available'
  END as assignment_status,
  eu.unit_code as current_unit
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
LEFT JOIN public.emergency_unit_members eum ON p.user_id = eum.officer_id
LEFT JOIN public.emergency_units eu ON eum.unit_id = eu.id
WHERE ur.role IN ('police_operator', 'police_supervisor', 'police_dispatcher');