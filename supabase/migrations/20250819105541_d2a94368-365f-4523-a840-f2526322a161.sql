-- Create provinces table for real geographic data
CREATE TABLE public.provinces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  population INTEGER,
  area DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Create policies for provinces (read-only for most users, full access for admins)
CREATE POLICY "Anyone can view provinces" 
ON public.provinces 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage provinces" 
ON public.provinces 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_provinces_updated_at
BEFORE UPDATE ON public.provinces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert real data for Equatorial Guinea provinces
INSERT INTO public.provinces (name, code, region, population, area) VALUES
('Bioko Norte', 'BN', 'Insular', 334463, 776.00),
('Bioko Sur', 'BS', 'Insular', 38200, 1241.00),
('Litoral', 'LT', 'Continental', 367348, 6665.00),
('Centro Sur', 'CS', 'Continental', 141986, 9931.00),
('Kié-Ntem', 'KN', 'Continental', 183331, 3943.00),
('Wele-Nzas', 'WN', 'Continental', 192017, 5478.00),
('Annobón', 'AN', 'Insular', 5314, 17.00);