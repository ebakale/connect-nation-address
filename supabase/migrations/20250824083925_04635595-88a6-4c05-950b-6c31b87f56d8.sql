-- Create test users for police roles
-- Note: In production, these would be created through proper user registration
-- For testing, we'll create user_roles entries that can be associated with real auth users

-- First, let's create some test incidents
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

('INC-2024-000002', 'medical_emergency', 1, 'responded', now() - interval '1 hour', 
 'Heart attack victim needs immediate assistance', '+240666333444', 'Hospital Nacional de Malabo', 
 '3.7592', '8.7784', 3.0, 'es', 'Ambulance en route', 
 ARRAY['AMB-01', 'POLICE-01']),

('INC-2024-000003', 'crime_in_progress', 2, 'active', now() - interval '30 minutes', 
 'Armed robbery in progress at local bank', '+240666555666', 'Banco de Guinea Ecuatorial', 
 '3.7575', '8.7770', 2.0, 'es', 'Multiple units responding', 
 ARRAY['POLICE-01', 'POLICE-02', 'SWAT-01']),

-- Medium priority incidents  
('INC-2024-000004', 'traffic_accident', 3, 'reported', now() - interval '15 minutes', 
 'Multi-vehicle accident blocking main road', '+240666777888', 'Carretera Principal Malabo', 
 '3.7540', '8.7750', 8.0, 'fr', 'Traffic units needed', 
 ARRAY['TRAFFIC-01']),

('INC-2024-000005', 'domestic_violence', 2, 'dispatched', now() - interval '45 minutes', 
 'Domestic dispute with possible violence', '+240666999000', 'Residential Area Ela Nguema', 
 '3.7610', '8.7800', 10.0, 'es', 'Social worker accompanying police', 
 ARRAY['POLICE-04', 'SOCIAL-01']),

-- Resolved incidents
('INC-2024-000006', 'theft', 3, 'resolved', now() - interval '3 hours', 
 'Motorcycle theft reported and recovered', '+240666111333', 'Mercado Central', 
 '3.7565', '8.7775', 5.0, 'es', 'Suspect apprehended, vehicle recovered', 
 ARRAY['POLICE-02']),

('INC-2024-000007', 'public_disturbance', 4, 'resolved', now() - interval '4 hours', 
 'Noise complaint at local bar', '+240666222444', 'Bar La Libertad', 
 '3.7580', '8.7760', 15.0, 'es', 'Warning issued, resolved peacefully', 
 ARRAY['POLICE-03']),

-- Recent incidents
('INC-2024-000008', 'missing_person', 2, 'active', now() - interval '6 hours', 
 'Child missing since this morning', '+240666333555', 'Barrio Ela Nguema', 
 '3.7620', '8.7820', 20.0, 'fr', 'Search teams deployed', 
 ARRAY['POLICE-01', 'POLICE-04', 'K9-01']),

('INC-2024-000009', 'suspicious_activity', 4, 'reported', now() - interval '10 minutes', 
 'Suspicious individuals near government building', '+240666444777', 'Palacio Presidencial', 
 '3.7550', '8.7740', 12.0, 'es', 'Units dispatched for investigation', 
 ARRAY['POLICE-02']),

('INC-2024-000010', 'environmental_hazard', 3, 'active', now() - interval '1.5 hours', 
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
WHERE status IN ('dispatched', 'responded', 'active');

-- Update responded incidents
UPDATE public.emergency_incidents 
SET responded_at = dispatched_at + interval '8 minutes'
WHERE status = 'responded';

-- Create some operator sessions for testing
-- Note: These user_ids should be replaced with actual auth.users IDs in production
INSERT INTO public.emergency_operator_sessions (
  operator_id,
  session_start,
  status,
  active_incidents
) VALUES 
-- Active sessions (these would use real user IDs)
('00000000-0000-0000-0000-000000000001', now() - interval '3 hours', 'active', 
 ARRAY['INC-2024-000003', 'INC-2024-000008']),
('00000000-0000-0000-0000-000000000002', now() - interval '2 hours', 'active', 
 ARRAY['INC-2024-000001', 'INC-2024-000005']),
('00000000-0000-0000-0000-000000000003', now() - interval '1 hour', 'active', 
 ARRAY['INC-2024-000009']),
('00000000-0000-0000-0000-000000000004', now() - interval '4 hours', 'active', 
 ARRAY['INC-2024-000010']);

-- Add some incident logs
INSERT INTO public.emergency_incident_logs (
  incident_id,
  user_id,
  action,
  details
) VALUES 
((SELECT id FROM emergency_incidents WHERE incident_number = 'INC-2024-000001'), 
 '00000000-0000-0000-0000-000000000001', 
 'incident_created', 
 '{"priority": "high", "type": "fire", "location": "Malabo Central Market"}'::jsonb),
 
((SELECT id FROM emergency_incidents WHERE incident_number = 'INC-2024-000001'), 
 '00000000-0000-0000-0000-000000000002', 
 'units_dispatched', 
 '{"units": ["FIRE-01", "FIRE-02", "POLICE-03"], "dispatch_time": "2 minutes"}'::jsonb),

((SELECT id FROM emergency_incidents WHERE incident_number = 'INC-2024-000006'), 
 '00000000-0000-0000-0000-000000000003', 
 'incident_resolved', 
 '{"resolution": "suspect_apprehended", "vehicle_recovered": true}'::jsonb);

-- Create sample user roles for testing police functionality
-- Note: In production, these would be associated with real auth.users
-- For now, we'll create placeholder entries that can be updated with real user IDs

-- Police Operators (4 users)
INSERT INTO public.user_roles (user_id, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'police_operator'),
('00000000-0000-0000-0000-000000000002', 'police_operator'),
('00000000-0000-0000-0000-000000000003', 'police_operator'),
('00000000-0000-0000-0000-000000000004', 'police_operator');

-- Police Dispatchers (2 users)  
INSERT INTO public.user_roles (user_id, role) VALUES 
('00000000-0000-0000-0000-000000000005', 'police_dispatcher'),
('00000000-0000-0000-0000-000000000006', 'police_dispatcher');

-- Create profiles for these test users
INSERT INTO public.profiles (user_id, email, full_name, organization, phone) VALUES 
('00000000-0000-0000-0000-000000000001', 'operator1@police.gq', 'María González', 'Policía Nacional', '+240666001001'),
('00000000-0000-0000-0000-000000000002', 'operator2@police.gq', 'Carlos Nsue', 'Policía Nacional', '+240666001002'),
('00000000-0000-0000-0000-000000000003', 'operator3@police.gq', 'Ana Obiang', 'Policía Nacional', '+240666001003'),
('00000000-0000-0000-0000-000000000004', 'operator4@police.gq', 'Pedro Mba', 'Policía Nacional', '+240666001004'),
('00000000-0000-0000-0000-000000000005', 'dispatcher1@police.gq', 'Isabel Ndong', 'Policía Nacional', '+240666001005'),
('00000000-0000-0000-0000-000000000006', 'dispatcher2@police.gq', 'Miguel Ekua', 'Policía Nacional', '+240666001006');