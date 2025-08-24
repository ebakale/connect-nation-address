-- Create test incidents with valid emergency types
INSERT INTO public.emergency_incidents (
  incident_number,
  emergency_type,
  priority_level,
  status,
  reported_at,
  encrypted_message,
  encrypted_contact_info,
  encrypted_address,
  encrypted_latitude,
  encrypted_longitude,
  location_accuracy,
  language_code,
  dispatcher_notes,
  assigned_units
) VALUES 
-- High priority incidents
('INC-2024-000001', 'fire', 1, 'dispatched', now() - interval '2 hours', 
 'Large building fire reported', '+240666111222', 'Malabo Central Market', 
 '3.7558', '8.7764', 5.0, 'es', 'Fire department units dispatched', 
 ARRAY['FIRE-01', 'FIRE-02', 'POLICE-03']),

('INC-2024-000002', 'medical', 1, 'responding', now() - interval '1 hour', 
 'Heart attack victim needs immediate assistance', '+240666333444', 'Hospital Nacional de Malabo', 
 '3.7592', '8.7784', 3.0, 'es', 'Ambulance en route', 
 ARRAY['AMB-01', 'POLICE-01']),

('INC-2024-000003', 'police', 2, 'on_scene', now() - interval '30 minutes', 
 'Armed robbery in progress at local bank', '+240666555666', 'Banco de Guinea Ecuatorial', 
 '3.7575', '8.7770', 2.0, 'es', 'Multiple units responding', 
 ARRAY['POLICE-01', 'POLICE-02', 'SWAT-01']),

-- Medium priority incidents  
('INC-2024-000004', 'general', 3, 'reported', now() - interval '15 minutes', 
 'Multi-vehicle accident blocking main road', '+240666777888', 'Carretera Principal Malabo', 
 '3.7540', '8.7750', 8.0, 'fr', 'Traffic units needed', 
 ARRAY['TRAFFIC-01']),

('INC-2024-000005', 'police', 2, 'dispatched', now() - interval '45 minutes', 
 'Domestic dispute with possible violence', '+240666999000', 'Residential Area Ela Nguema', 
 '3.7610', '8.7800', 10.0, 'es', 'Social worker accompanying police', 
 ARRAY['POLICE-04', 'SOCIAL-01']),

-- Resolved incidents
('INC-2024-000006', 'police', 3, 'resolved', now() - interval '3 hours', 
 'Motorcycle theft reported and recovered', '+240666111333', 'Mercado Central', 
 '3.7565', '8.7775', 5.0, 'es', 'Suspect apprehended, vehicle recovered', 
 ARRAY['POLICE-02']),

('INC-2024-000007', 'general', 4, 'resolved', now() - interval '4 hours', 
 'Noise complaint at local bar', '+240666222444', 'Bar La Libertad', 
 '3.7580', '8.7760', 15.0, 'es', 'Warning issued, resolved peacefully', 
 ARRAY['POLICE-03']),

-- Recent incidents
('INC-2024-000008', 'police', 2, 'on_scene', now() - interval '6 hours', 
 'Child missing since this morning', '+240666333555', 'Barrio Ela Nguema', 
 '3.7620', '8.7820', 20.0, 'fr', 'Search teams deployed', 
 ARRAY['POLICE-01', 'POLICE-04', 'K9-01']),

('INC-2024-000009', 'police', 4, 'reported', now() - interval '10 minutes', 
 'Suspicious individuals near government building', '+240666444777', 'Palacio Presidencial', 
 '3.7550', '8.7740', 12.0, 'es', 'Units dispatched for investigation', 
 ARRAY['POLICE-02']),

('INC-2024-000010', 'general', 3, 'on_scene', now() - interval '1.5 hours', 
 'Chemical spill near port area', '+240666555888', 'Puerto de Malabo', 
 '3.7500', '8.7700', 25.0, 'en', 'Environmental response team notified', 
 ARRAY['ENV-01', 'POLICE-05']);

-- Update some incidents with timestamps for resolved ones
UPDATE public.emergency_incidents 
SET 
  dispatched_at = reported_at + interval '5 minutes',
  responded_at = reported_at + interval '15 minutes',
  resolved_at = reported_at + interval '2 hours'
WHERE status = 'resolved';

-- Update some incidents with dispatch times
UPDATE public.emergency_incidents 
SET dispatched_at = reported_at + interval '3 minutes'
WHERE status IN ('dispatched', 'responding', 'on_scene');

-- Update responded incidents
UPDATE public.emergency_incidents 
SET responded_at = dispatched_at + interval '8 minutes'
WHERE status IN ('responding', 'on_scene');