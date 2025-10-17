-- Create cities reference table (provinces already exists)
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, province_id)
);

-- Enable RLS on cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Allow public read access to cities
CREATE POLICY "Anyone can view cities"
  ON public.cities
  FOR SELECT
  USING (true);

-- Allow admins to manage cities
CREATE POLICY "Admins can manage cities"
  ON public.cities
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert major cities for each province
INSERT INTO public.cities (name, province_id)
SELECT 'Palé', id FROM public.provinces WHERE code = 'AN'
UNION ALL
SELECT 'Malabo', id FROM public.provinces WHERE code = 'BN'
UNION ALL
SELECT 'Rebola', id FROM public.provinces WHERE code = 'BN'
UNION ALL
SELECT 'Baney', id FROM public.provinces WHERE code = 'BN'
UNION ALL
SELECT 'Luba', id FROM public.provinces WHERE code = 'BS'
UNION ALL
SELECT 'Riaba', id FROM public.provinces WHERE code = 'BS'
UNION ALL
SELECT 'Evinayong', id FROM public.provinces WHERE code = 'CS'
UNION ALL
SELECT 'Acurenam', id FROM public.provinces WHERE code = 'CS'
UNION ALL
SELECT 'Ebebiyin', id FROM public.provinces WHERE code = 'KN'
UNION ALL
SELECT 'Nsork', id FROM public.provinces WHERE code = 'KN'
UNION ALL
SELECT 'Mikomeseng', id FROM public.provinces WHERE code = 'KN'
UNION ALL
SELECT 'Bata', id FROM public.provinces WHERE code = 'LI'
UNION ALL
SELECT 'Mbini', id FROM public.provinces WHERE code = 'LI'
UNION ALL
SELECT 'Cogo', id FROM public.provinces WHERE code = 'LI'
UNION ALL
SELECT 'Mongomo', id FROM public.provinces WHERE code = 'WN'
UNION ALL
SELECT 'Aconibe', id FROM public.provinces WHERE code = 'WN'
UNION ALL
SELECT 'Añisoc', id FROM public.provinces WHERE code = 'WN'
UNION ALL
SELECT 'Oyala', id FROM public.provinces WHERE code = 'DJ'
ON CONFLICT (name, province_id) DO NOTHING;