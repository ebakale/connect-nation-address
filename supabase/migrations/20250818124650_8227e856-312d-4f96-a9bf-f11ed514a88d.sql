-- Create address_requests table for citizens to submit new address requests
CREATE TABLE public.address_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  building TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address_type TEXT NOT NULL DEFAULT 'residential',
  description TEXT,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.address_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for address requests
CREATE POLICY "Users can view their own requests" 
ON public.address_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.address_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.address_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow admins and verifiers to view and manage all requests
CREATE POLICY "Admins can view all requests" 
ON public.address_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'verifier', 'registrar')
  )
);

CREATE POLICY "Admins can update all requests" 
ON public.address_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'verifier', 'registrar')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_address_requests_updated_at
BEFORE UPDATE ON public.address_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();