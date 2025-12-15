-- Phase 1: Postal Module Enhancement - Database Schema

-- New Enums
CREATE TYPE notification_type AS ENUM (
  'order_created',
  'dispatched', 
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'pickup_reminder',
  'return_initiated',
  'cod_reminder'
);

CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push');

CREATE TYPE time_window AS ENUM ('morning', 'afternoon', 'evening', 'any');

CREATE TYPE pickup_status AS ENUM (
  'pending',
  'scheduled', 
  'assigned',
  'en_route',
  'completed',
  'cancelled',
  'failed'
);

CREATE TYPE return_reason AS ENUM (
  'wrong_item',
  'damaged',
  'refused',
  'undeliverable',
  'customer_return',
  'address_incorrect',
  'other'
);

CREATE TYPE return_status AS ENUM (
  'initiated',
  'label_generated',
  'pickup_scheduled',
  'in_transit',
  'received',
  'processed',
  'cancelled'
);

CREATE TYPE label_type AS ENUM ('standard', 'express', 'registered', 'return');

CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'partial');

CREATE TYPE cod_status AS ENUM ('pending', 'collected', 'remitted', 'failed', 'waived');

-- Table 1: Postal Notifications
CREATE TABLE public.postal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  message_subject TEXT,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 2: Delivery Preferences
CREATE TABLE public.delivery_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address_uac TEXT NOT NULL,
  preferred_time_window time_window DEFAULT 'any',
  safe_drop_location TEXT,
  safe_drop_authorized BOOLEAN DEFAULT false,
  alternate_recipient_name TEXT,
  alternate_recipient_phone TEXT,
  alternate_recipient_authorized BOOLEAN DEFAULT false,
  hold_at_post_office BOOLEAN DEFAULT false,
  allow_neighbor_delivery BOOLEAN DEFAULT false,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT true,
  notification_push BOOLEAN DEFAULT false,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, address_uac)
);

-- Table 3: Pickup Requests
CREATE TABLE public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  requester_id UUID NOT NULL,
  pickup_address_uac TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  package_description TEXT,
  package_count INTEGER DEFAULT 1,
  estimated_weight_grams INTEGER,
  preferred_date DATE NOT NULL,
  preferred_time_window time_window DEFAULT 'any',
  status pickup_status NOT NULL DEFAULT 'pending',
  assigned_agent_id UUID,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  pickup_notes TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 4: Return Orders
CREATE TABLE public.return_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT NOT NULL UNIQUE,
  original_order_id UUID REFERENCES public.delivery_orders(id),
  return_reason return_reason NOT NULL,
  return_reason_details TEXT,
  return_tracking_number TEXT,
  return_label_url TEXT,
  status return_status NOT NULL DEFAULT 'initiated',
  pickup_requested BOOLEAN DEFAULT false,
  pickup_request_id UUID REFERENCES public.pickup_requests(id),
  initiated_by UUID NOT NULL,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 5: Postal Labels
CREATE TABLE public.postal_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  return_order_id UUID REFERENCES public.return_orders(id) ON DELETE CASCADE,
  label_type label_type NOT NULL DEFAULT 'standard',
  s10_tracking_number TEXT UNIQUE,
  barcode_data TEXT NOT NULL,
  qr_code_data TEXT,
  label_pdf_url TEXT,
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  printed_at TIMESTAMP WITH TIME ZONE,
  printed_by UUID,
  voided_at TIMESTAMP WITH TIME ZONE,
  voided_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table 6: Bulk Import Jobs
CREATE TABLE public.bulk_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT NOT NULL UNIQUE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status import_status NOT NULL DEFAULT 'pending',
  error_summary JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 7: Bulk Import Orders (individual rows)
CREATE TABLE public.bulk_import_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id UUID NOT NULL REFERENCES public.bulk_import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  order_id UUID REFERENCES public.delivery_orders(id),
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Table 8: COD Transactions
CREATE TABLE public.cod_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  collection_status cod_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  collected_by UUID,
  collected_at TIMESTAMP WITH TIME ZONE,
  receipt_number TEXT,
  remitted_to UUID,
  remittance_date DATE,
  remittance_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modify delivery_orders table
ALTER TABLE public.delivery_orders 
ADD COLUMN IF NOT EXISTS cod_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cod_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS preferred_time_window time_window DEFAULT 'any',
ADD COLUMN IF NOT EXISTS safe_drop_authorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS safe_drop_location TEXT,
ADD COLUMN IF NOT EXISTS alternate_recipient_name TEXT,
ADD COLUMN IF NOT EXISTS alternate_recipient_phone TEXT,
ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS label_generated BOOLEAN DEFAULT false;

-- Generate pickup request number
CREATE OR REPLACE FUNCTION public.generate_pickup_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') 
  INTO sequence_part
  FROM public.pickup_requests 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  RETURN 'PKP-' || year_part || '-' || sequence_part;
END;
$$;

-- Generate return order number
CREATE OR REPLACE FUNCTION public.generate_return_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') 
  INTO sequence_part
  FROM public.return_orders 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  RETURN 'RET-' || year_part || '-' || sequence_part;
END;
$$;

-- Generate bulk import job number
CREATE OR REPLACE FUNCTION public.generate_import_job_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') 
  INTO sequence_part
  FROM public.bulk_import_jobs 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  RETURN 'IMP-' || year_part || '-' || sequence_part;
END;
$$;

-- Generate S10 tracking number (UPU standard)
CREATE OR REPLACE FUNCTION public.generate_s10_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT := 'EG'; -- Equatorial Guinea prefix for registered mail
  serial_num TEXT;
  check_digit INTEGER;
  weights INTEGER[] := ARRAY[8,6,4,2,3,5,9,7];
  total INTEGER := 0;
  i INTEGER;
BEGIN
  -- Generate 8-digit serial number
  serial_num := LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');
  
  -- Calculate check digit using ISO 6346 algorithm
  FOR i IN 1..8 LOOP
    total := total + (SUBSTRING(serial_num, i, 1)::INTEGER * weights[i]);
  END LOOP;
  check_digit := 11 - (total % 11);
  IF check_digit = 10 THEN check_digit := 0; END IF;
  IF check_digit = 11 THEN check_digit := 5; END IF;
  
  -- Return S10 format: 2 letters + 9 digits + 2 letters (country code)
  RETURN prefix || serial_num || check_digit::TEXT || 'GQ';
END;
$$;

-- Triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION public.set_pickup_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_pickup_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_pickup_request_number_trigger
BEFORE INSERT ON public.pickup_requests
FOR EACH ROW EXECUTE FUNCTION set_pickup_request_number();

CREATE OR REPLACE FUNCTION public.set_return_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.return_number IS NULL OR NEW.return_number = '' THEN
    NEW.return_number := generate_return_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_return_order_number_trigger
BEFORE INSERT ON public.return_orders
FOR EACH ROW EXECUTE FUNCTION set_return_order_number();

CREATE OR REPLACE FUNCTION public.set_import_job_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_import_job_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_import_job_number_trigger
BEFORE INSERT ON public.bulk_import_jobs
FOR EACH ROW EXECUTE FUNCTION set_import_job_number();

-- Auto-create COD transaction when order has COD
CREATE OR REPLACE FUNCTION public.create_cod_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cod_required = true AND NEW.cod_amount IS NOT NULL AND NEW.cod_amount > 0 THEN
    INSERT INTO public.cod_transactions (order_id, amount, currency)
    VALUES (NEW.id, NEW.cod_amount, 'XAF')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_cod_transaction_trigger
AFTER INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION create_cod_transaction();

-- Enable RLS on all new tables
ALTER TABLE public.postal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postal_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_import_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for postal_notifications
CREATE POLICY "Postal staff can view notifications"
ON public.postal_notifications FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_agent'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can create notifications"
ON public.postal_notifications FOR INSERT
WITH CHECK (true);

-- RLS Policies for delivery_preferences
CREATE POLICY "Users can manage their own preferences"
ON public.delivery_preferences FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Postal staff can view preferences"
ON public.delivery_preferences FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for pickup_requests
CREATE POLICY "Users can create pickup requests"
ON public.pickup_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own pickup requests"
ON public.pickup_requests FOR SELECT
USING (auth.uid() = requester_id);

CREATE POLICY "Postal staff can view pickup requests"
ON public.pickup_requests FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_agent'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Dispatchers can update pickup requests"
ON public.pickup_requests FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'postal_agent'::app_role) AND assigned_agent_id = auth.uid())
);

-- RLS Policies for return_orders
CREATE POLICY "Users can initiate returns for their orders"
ON public.return_orders FOR INSERT
WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can view their own returns"
ON public.return_orders FOR SELECT
USING (auth.uid() = initiated_by);

CREATE POLICY "Postal staff can view returns"
ON public.return_orders FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_agent'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Postal staff can update returns"
ON public.return_orders FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for postal_labels
CREATE POLICY "Postal staff can manage labels"
ON public.postal_labels FOR ALL
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for bulk_import_jobs
CREATE POLICY "Authorized staff can manage imports"
ON public.bulk_import_jobs FOR ALL
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for bulk_import_orders
CREATE POLICY "Authorized staff can view import orders"
ON public.bulk_import_orders FOR SELECT
USING (
  has_role(auth.uid(), 'postal_clerk'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can manage import orders"
ON public.bulk_import_orders FOR ALL
USING (true);

-- RLS Policies for cod_transactions
CREATE POLICY "Postal staff can view COD transactions"
ON public.cod_transactions FOR SELECT
USING (
  has_role(auth.uid(), 'postal_agent'::app_role) OR
  has_role(auth.uid(), 'postal_dispatcher'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Agents can update COD collection"
ON public.cod_transactions FOR UPDATE
USING (
  has_role(auth.uid(), 'postal_agent'::app_role) OR
  has_role(auth.uid(), 'postal_supervisor'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can create COD transactions"
ON public.cod_transactions FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_postal_notifications_order_id ON public.postal_notifications(order_id);
CREATE INDEX idx_postal_notifications_status ON public.postal_notifications(status);
CREATE INDEX idx_delivery_preferences_user_id ON public.delivery_preferences(user_id);
CREATE INDEX idx_delivery_preferences_address_uac ON public.delivery_preferences(address_uac);
CREATE INDEX idx_pickup_requests_status ON public.pickup_requests(status);
CREATE INDEX idx_pickup_requests_requester_id ON public.pickup_requests(requester_id);
CREATE INDEX idx_pickup_requests_assigned_agent_id ON public.pickup_requests(assigned_agent_id);
CREATE INDEX idx_return_orders_status ON public.return_orders(status);
CREATE INDEX idx_return_orders_original_order_id ON public.return_orders(original_order_id);
CREATE INDEX idx_postal_labels_order_id ON public.postal_labels(order_id);
CREATE INDEX idx_postal_labels_s10_tracking ON public.postal_labels(s10_tracking_number);
CREATE INDEX idx_bulk_import_jobs_status ON public.bulk_import_jobs(status);
CREATE INDEX idx_bulk_import_orders_job_id ON public.bulk_import_orders(import_job_id);
CREATE INDEX idx_cod_transactions_order_id ON public.cod_transactions(order_id);
CREATE INDEX idx_cod_transactions_status ON public.cod_transactions(collection_status);
CREATE INDEX idx_delivery_orders_cod ON public.delivery_orders(cod_required) WHERE cod_required = true;