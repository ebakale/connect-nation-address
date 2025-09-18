-- Add some sample NAR addresses for testing
INSERT INTO public.addresses (
    uac, street, city, region, country, building, address_type, 
    latitude, longitude, verified, public, created_at
) VALUES 
(
    'GQ-BN-MAL-ABC123-XY', 
    'Calle de la Independencia', 
    'Malabo', 
    'Bioko Norte', 
    'Equatorial Guinea',
    'Edificio Central',
    'commercial',
    3.7504, 8.7675, 
    true, true, now()
),
(
    'GQ-LI-BAT-FC3778-BH', 
    'Avenida Hassan II', 
    'Bata', 
    'Litoral', 
    'Equatorial Guinea',
    'Torre Bata Plaza',
    'residential',
    1.8639, 9.7666, 
    true, true, now()
),
(
    'GQ-BN-MAL-DEF456-ZW', 
    'Paseo de los Cocoteros', 
    'Malabo', 
    'Bioko Norte', 
    'Equatorial Guinea',
    'Residencial Las Palmeras',
    'residential',
    3.7650, 8.7825, 
    true, true, now()
)
ON CONFLICT (uac) DO NOTHING;