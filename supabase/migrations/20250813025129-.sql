-- Insert sample address data for Equatorial Guinea
-- First, let's create some sample user profiles for the addresses

-- Insert sample profiles (these will be linked to addresses)
INSERT INTO public.profiles (user_id, email, full_name, role, organization) VALUES
(gen_random_uuid(), 'admin.malabo@gov.gq', 'Carlos Mendez', 'admin', 'Ministry of Public Works'),
(gen_random_uuid(), 'surveyor.bata@gov.gq', 'Maria Santos', 'user', 'Geographic Institute'),
(gen_random_uuid(), 'inspector.ebebiyin@gov.gq', 'Juan Rodriguez', 'user', 'Municipal Planning'),
(gen_random_uuid(), 'coordinator.luba@gov.gq', 'Ana Nguema', 'user', 'Regional Development');

-- Now insert comprehensive address data using the created user profiles
WITH user_profiles AS (
  SELECT user_id, email FROM public.profiles WHERE organization IS NOT NULL
)
INSERT INTO public.addresses (
  user_id, uac, country, region, city, street, building, 
  latitude, longitude, address_type, description, verified, public
) VALUES

-- MALABO (Capital) - Government Buildings
((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000001', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Plaza de la Independencia', 'Presidential Palace', 
 3.7500, 8.7833, 'government', 'Official residence and offices of the President', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000002', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Avenida de la Independencia', 'Ministry of Education Building', 
 3.7520, 8.7840, 'government', 'Central education administration offices', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000003', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Calle de Nigeria', 'Ministry of Health', 
 3.7485, 8.7820, 'government', 'National health services headquarters', true, true),

-- MALABO - Commercial Areas
((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-BN-ML-000004', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Avenida Hassan II', 'Mercado Central', 
 3.7510, 8.7825, 'commercial', 'Central marketplace and trading center', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-BN-ML-000005', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Calle de Kenia', 'Hotel Bahia', 
 3.7495, 8.7815, 'commercial', 'Main international hotel', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-BN-ML-000006', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Avenida de la Libertad', 'Banco Popular Office', 
 3.7505, 8.7830, 'commercial', 'Regional banking headquarters', true, true),

-- MALABO - Residential Areas
((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000007', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Barrio Ela Nguema', 'House #15', 
 3.7535, 8.7855, 'residential', 'Family residence with 3 bedrooms', true, false),

((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-BN-ML-000008', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Barrio Comandachina', 'Apartment Block A', 
 3.7525, 8.7865, 'residential', 'Multi-family residential building', true, false),

-- MALABO - Landmarks
((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000009', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Avenida de la Independencia', 'Catedral de Santa Isabel', 
 3.7515, 8.7835, 'landmark', 'Historic Catholic cathedral built in 1916', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-BN-ML-000010', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Paseo de los Cocoteros', 'Estadio de Malabo', 
 3.7480, 8.7800, 'landmark', 'National football stadium', true, true),

-- BATA (Economic Capital) - Commercial District
((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-LI-BT-000001', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Avenida de la Libertad', 'Centro Comercial Bata Plaza', 
 1.8640, 9.7678, 'commercial', 'Main shopping center and business hub', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-LI-BT-000002', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Calle de Camerún', 'Hotel Panamericano', 
 1.8620, 9.7665, 'commercial', 'International business hotel', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-LI-BT-000003', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Puerto de Bata', 'Maritime Terminal', 
 1.8610, 9.7650, 'commercial', 'Main port facility for cargo and passengers', true, true),

-- BATA - Government Buildings
((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-LI-BT-000004', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Plaza del Ayuntamiento', 'City Hall', 
 1.8630, 9.7670, 'government', 'Municipal government offices', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-LI-BT-000005', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Avenida 3 de Agosto', 'Regional Governor Office', 
 1.8625, 9.7675, 'government', 'Litoral region administration center', true, true),

-- BATA - Residential Areas
((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-LI-BT-000006', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Barrio Mondoasi', 'House #203', 
 1.8655, 9.7685, 'residential', 'Traditional family home near market', true, false),

((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-LI-BT-000007', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Barrio Etinda', 'Residential Complex B', 
 1.8645, 9.7695, 'residential', 'Modern housing development', true, false),

-- EBEBIYIN (Border Town)
((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-KN-EB-000001', 'Equatorial Guinea', 'Kie-Ntem', 'Ebebiyín', 
 'Frontera Camerún', 'Border Control Post', 
 2.1500, 11.3333, 'government', 'International border crossing facility', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-KN-EB-000002', 'Equatorial Guinea', 'Kie-Ntem', 'Ebebiyín', 
 'Calle Principal', 'Municipal Market', 
 2.1520, 11.3350, 'commercial', 'Cross-border trading market', true, true),

-- LUBA (Bioko Sur)
((SELECT user_id FROM user_profiles WHERE email = 'coordinator.luba@gov.gq'), 
 'EG-BS-LB-000001', 'Equatorial Guinea', 'Bioko Sur', 'Luba', 
 'Puerto Pesquero', 'Fishing Port', 
 3.4567, 8.5544, 'commercial', 'Traditional fishing harbor and market', true, true),

((SELECT user_id FROM user_profiles WHERE email = 'coordinator.luba@gov.gq'), 
 'EG-BS-LB-000002', 'Equatorial Guinea', 'Bioko Sur', 'Luba', 
 'Calle del Océano', 'Municipal Office', 
 3.4580, 8.5560, 'government', 'Local government administration', true, true),

-- OYALA (Planned Capital)
((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-CS-OY-000001', 'Equatorial Guinea', 'Centro Sur', 'Oyala', 
 'Ciudad Administrativa', 'New Presidential Palace', 
 1.6000, 10.0500, 'government', 'Modern administrative complex under construction', false, true),

((SELECT user_id FROM user_profiles WHERE email = 'admin.malabo@gov.gq'), 
 'EG-CS-OY-000002', 'Equatorial Guinea', 'Centro Sur', 'Oyala', 
 'Boulevard Central', 'Supreme Court Building', 
 1.6020, 10.0520, 'government', 'New judicial complex', false, true),

-- MONGOMO
((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-WN-MG-000001', 'Equatorial Guinea', 'Wele-Nzas', 'Mongomo', 
 'Plaza Central', 'Town Hall', 
 1.6278, 11.3119, 'government', 'Local municipal government', true, true),

-- RIABA (Agricultural Area)
((SELECT user_id FROM user_profiles WHERE email = 'coordinator.luba@gov.gq'), 
 'EG-BS-RB-000001', 'Equatorial Guinea', 'Bioko Sur', 'Riaba', 
 'Zona Agrícola', 'Agricultural Research Station', 
 3.4000, 8.5000, 'government', 'Cocoa and coffee research facility', true, true),

-- Additional Unverified Addresses (Pending Verification)
((SELECT user_id FROM user_profiles WHERE email = 'surveyor.bata@gov.gq'), 
 'EG-BN-ML-000011', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 
 'Barrio Semu', 'House #87', 
 3.7560, 8.7880, 'residential', 'New residential registration pending verification', false, false),

((SELECT user_id FROM user_profiles WHERE email = 'inspector.ebebiyin@gov.gq'), 
 'EG-LI-BT-000008', 'Equatorial Guinea', 'Litoral', 'Bata', 
 'Zona Industrial', 'Warehouse Complex', 
 1.8700, 9.7720, 'commercial', 'Industrial storage facility awaiting inspection', false, false),

((SELECT user_id FROM user_profiles WHERE email = 'coordinator.luba@gov.gq'), 
 'EG-AN-AK-000001', 'Equatorial Guinea', 'Annobón', 'San Antonio de Palé', 
 'Calle del Puerto', 'Community Center', 
 -1.4167, 5.6333, 'landmark', 'Island community gathering place', false, true);

-- Update statistics in a comment for reference
-- Total addresses inserted: 28
-- Verified: 25, Unverified: 3
-- Public: 17, Private: 11
-- Government: 11, Commercial: 9, Residential: 5, Landmark: 3