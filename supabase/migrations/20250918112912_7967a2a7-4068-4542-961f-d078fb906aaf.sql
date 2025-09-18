-- Create RLS policies for CAR module tables
-- Step 2: Row Level Security policies

-- RLS policies for person table
CREATE POLICY "Citizens can view their own person record"
ON public.person
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Citizens can insert their own person record"
ON public.person
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Citizens can update their own person record"
ON public.person
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can manage all person records"
ON public.person
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for citizen_address table
CREATE POLICY "Citizens can view their own addresses"
ON public.citizen_address
FOR SELECT
TO authenticated
USING (
    person_id IN (
        SELECT id FROM public.person WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Citizens can insert their own addresses"
ON public.citizen_address
FOR INSERT
TO authenticated
WITH CHECK (
    person_id IN (
        SELECT id FROM public.person WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Citizens can update their own addresses"
ON public.citizen_address
FOR UPDATE
TO authenticated
USING (
    person_id IN (
        SELECT id FROM public.person WHERE auth_user_id = auth.uid()
    )
)
WITH CHECK (
    person_id IN (
        SELECT id FROM public.person WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Verifiers can view all addresses"
ON public.citizen_address
FOR SELECT
TO authenticated
USING (
    has_role(auth.uid(), 'verifier'::app_role) OR
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Verifiers can update address status"
ON public.citizen_address
FOR UPDATE
TO authenticated
USING (
    has_role(auth.uid(), 'verifier'::app_role) OR
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for citizen_address_event table
CREATE POLICY "Citizens can view their own address events"
ON public.citizen_address_event
FOR SELECT
TO authenticated
USING (
    person_id IN (
        SELECT id FROM public.person WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "System can create address events"
ON public.citizen_address_event
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Verifiers can view all address events"
ON public.citizen_address_event
FOR SELECT
TO authenticated
USING (
    has_role(auth.uid(), 'verifier'::app_role) OR
    has_role(auth.uid(), 'registrar'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for webhook_delivery table
CREATE POLICY "Only admins can manage webhook deliveries"
ON public.webhook_delivery
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-create person record on first auth
CREATE OR REPLACE FUNCTION public.ensure_person_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.person (auth_user_id)
  VALUES (NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create person when user signs up
CREATE TRIGGER on_auth_user_created_person
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_person_exists();