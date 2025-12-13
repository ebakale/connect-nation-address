-- Government Postal Delivery Module - Part 2: Create tables and policies

-- Create delivery status enum
CREATE TYPE public.delivery_status AS ENUM (
  'pending_intake',
  'ready_for_assignment',
  'assigned',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'address_not_found',
  'returned_to_sender',
  'cancelled'
);

-- Create package type enum
CREATE TYPE public.package_type AS ENUM (
  'letter',
  'small_parcel',
  'medium_parcel',
  'large_parcel',
  'document',
  'registered_mail',
  'express',
  'government_document'
);

-- Create delivery_orders table
CREATE TABLE public.delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT '',
  
  -- Sender info
  sender_name TEXT NOT NULL,
  sender_address_uac TEXT,
  sender_branch TEXT,
  sender_phone TEXT,
  
  -- Recipient info
  recipient_name TEXT NOT NULL,
  recipient_address_uac TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  
  -- Package info
  package_type public.package_type NOT NULL DEFAULT 'letter',
  weight_grams INTEGER,
  dimensions_cm TEXT,
  declared_value NUMERIC(10,2),
  notes TEXT,
  special_instructions TEXT,
  requires_signature BOOLEAN DEFAULT true,
  requires_id_verification BOOLEAN DEFAULT false,
  
  -- Status
  status public.delivery_status NOT NULL DEFAULT 'pending_intake',
  priority_level INTEGER NOT NULL DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
  
  -- Tracking
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Delivery window
  scheduled_date DATE,
  delivery_deadline TIMESTAMPTZ,
  
  -- Completion info
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id)
);

-- Create delivery_assignments table
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id),
  
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  route_sequence INTEGER,
  estimated_delivery_time TIMESTAMPTZ,
  
  -- Agent acknowledgment
  acknowledged_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  
  notes TEXT,
  
  UNIQUE(order_id, agent_id)
);

-- Create delivery_status_logs table (audit trail)
CREATE TABLE public.delivery_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  
  previous_status public.delivery_status,
  new_status public.delivery_status NOT NULL,
  
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  reason TEXT,
  notes TEXT,
  
  -- Location at time of status change
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  location_accuracy NUMERIC
);

-- Create delivery_proof table
CREATE TABLE public.delivery_proof (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  
  -- Proof type
  proof_type TEXT NOT NULL CHECK (proof_type IN ('signature', 'photo', 'id_verification', 'recipient_absent_note')),
  
  -- Data
  signature_data TEXT,
  photo_url TEXT,
  recipient_id_type TEXT,
  recipient_id_last_digits TEXT,
  
  -- Who received
  received_by_name TEXT,
  relationship_to_recipient TEXT,
  
  -- Location
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  
  -- Metadata
  captured_by UUID NOT NULL REFERENCES auth.users(id),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_delivery_orders_status ON public.delivery_orders(status);
CREATE INDEX idx_delivery_orders_created_by ON public.delivery_orders(created_by);
CREATE INDEX idx_delivery_orders_recipient_uac ON public.delivery_orders(recipient_address_uac);
CREATE INDEX idx_delivery_orders_scheduled_date ON public.delivery_orders(scheduled_date);
CREATE INDEX idx_delivery_orders_order_number ON public.delivery_orders(order_number);

CREATE INDEX idx_delivery_assignments_agent ON public.delivery_assignments(agent_id);
CREATE INDEX idx_delivery_assignments_order ON public.delivery_assignments(order_id);

CREATE INDEX idx_delivery_status_logs_order ON public.delivery_status_logs(order_id);
CREATE INDEX idx_delivery_status_logs_changed_at ON public.delivery_status_logs(changed_at);

CREATE INDEX idx_delivery_proof_order ON public.delivery_proof(order_id);

-- Enable RLS
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_proof ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_orders

-- Postal clerks can create orders
CREATE POLICY "Postal clerks can create orders"
ON public.delivery_orders
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'postal_clerk') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Postal staff can view orders
CREATE POLICY "Postal staff can view orders"
ON public.delivery_orders
FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk') OR
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Dispatchers and supervisors can update orders
CREATE POLICY "Postal dispatchers can update orders"
ON public.delivery_orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Agents can update their assigned orders
CREATE POLICY "Agents can update assigned orders"
ON public.delivery_orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_agent') AND
  EXISTS (
    SELECT 1 FROM public.delivery_assignments
    WHERE order_id = delivery_orders.id
    AND agent_id = auth.uid()
  )
);

-- RLS Policies for delivery_assignments

-- Dispatchers can create assignments
CREATE POLICY "Dispatchers can create assignments"
ON public.delivery_assignments
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Postal staff can view assignments
CREATE POLICY "Postal staff can view assignments"
ON public.delivery_assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk') OR
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Dispatchers and agents can update assignments
CREATE POLICY "Dispatchers can update assignments"
ON public.delivery_assignments
FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin') OR
  (has_role(auth.uid(), 'postal_agent') AND agent_id = auth.uid())
);

-- Dispatchers can delete assignments
CREATE POLICY "Dispatchers can delete assignments"
ON public.delivery_assignments
FOR DELETE
USING (
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- RLS Policies for delivery_status_logs

-- Postal staff can create status logs
CREATE POLICY "Postal staff can create status logs"
ON public.delivery_status_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'postal_clerk') OR
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Postal staff can view status logs
CREATE POLICY "Postal staff can view status logs"
ON public.delivery_status_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk') OR
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- RLS Policies for delivery_proof

-- Agents can create proof
CREATE POLICY "Agents can create delivery proof"
ON public.delivery_proof
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Postal staff can view proof
CREATE POLICY "Postal staff can view delivery proof"
ON public.delivery_proof
FOR SELECT
USING (
  has_role(auth.uid(), 'postal_agent') OR
  has_role(auth.uid(), 'postal_dispatcher') OR
  has_role(auth.uid(), 'postal_supervisor') OR
  has_role(auth.uid(), 'admin')
);

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_delivery_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  order_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 8, '0') 
  INTO sequence_part
  FROM public.delivery_orders 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  order_num := 'DEL-' || year_part || '-' || sequence_part;
  
  RETURN order_num;
END;
$$;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION public.set_delivery_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_delivery_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_delivery_order_number
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_delivery_order_number();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_delivery_order_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_delivery_order_timestamp
BEFORE UPDATE ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_delivery_order_timestamp();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_delivery_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.delivery_status_logs (
      order_id, previous_status, new_status, changed_by
    ) VALUES (
      NEW.id, OLD.status, NEW.status, auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_delivery_status_change
AFTER UPDATE ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.log_delivery_status_change();

-- Create storage bucket for delivery proof
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proof', 'delivery-proof', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for delivery proof bucket
CREATE POLICY "Postal agents can upload delivery proof"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'delivery-proof' AND
  (
    has_role(auth.uid(), 'postal_agent') OR
    has_role(auth.uid(), 'postal_dispatcher') OR
    has_role(auth.uid(), 'postal_supervisor') OR
    has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Postal staff can view delivery proof"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'delivery-proof' AND
  (
    has_role(auth.uid(), 'postal_agent') OR
    has_role(auth.uid(), 'postal_dispatcher') OR
    has_role(auth.uid(), 'postal_supervisor') OR
    has_role(auth.uid(), 'admin')
  )
);