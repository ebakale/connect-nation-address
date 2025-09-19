-- Add CAR (Citizen Address Repository) integration to role management system

-- Extend the app_role enum to include CAR-specific roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'car_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'car_verifier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'residency_verifier';

-- Create table for CAR-specific permissions and capabilities
CREATE TABLE IF NOT EXISTS public.car_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  can_review_citizen_addresses BOOLEAN DEFAULT false,
  can_verify_residency BOOLEAN DEFAULT false,
  can_manage_person_records BOOLEAN DEFAULT false,
  can_access_address_history BOOLEAN DEFAULT false,
  can_update_address_status BOOLEAN DEFAULT false,
  can_merge_duplicate_persons BOOLEAN DEFAULT false,
  jurisdiction_scope TEXT, -- 'national', 'regional', 'municipal', 'local'
  geographic_scope TEXT[], -- specific regions/cities if applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id)
);

-- Enable RLS on car_permissions
ALTER TABLE public.car_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for car_permissions
CREATE POLICY "Admins can manage CAR permissions"
ON public.car_permissions
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'car_admin'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role)
);

CREATE POLICY "Users can view their own CAR permissions"
ON public.car_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create table for tracking CAR-related workflows and quality metrics
CREATE TABLE IF NOT EXISTS public.car_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_measured DATE DEFAULT CURRENT_DATE,
  total_citizen_addresses BIGINT DEFAULT 0,
  pending_verification_addresses BIGINT DEFAULT 0,
  confirmed_addresses BIGINT DEFAULT 0,
  rejected_addresses BIGINT DEFAULT 0,
  duplicate_person_records BIGINT DEFAULT 0,
  address_coverage_by_region JSONB DEFAULT '{}',
  average_verification_time_hours NUMERIC DEFAULT 0,
  quality_score_distribution JSONB DEFAULT '{}', -- score ranges and counts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(date_measured)
);

-- Enable RLS on car_quality_metrics
ALTER TABLE public.car_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for car_quality_metrics
CREATE POLICY "CAR staff can view quality metrics"
ON public.car_quality_metrics
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'car_admin'::app_role) OR
  has_role(auth.uid(), 'car_verifier'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role) OR
  has_role(auth.uid(), 'verifier'::app_role)
);

CREATE POLICY "CAR admins can manage quality metrics"
ON public.car_quality_metrics
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'car_admin'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role)
);

-- Create function to check CAR permissions
CREATE OR REPLACE FUNCTION public.has_car_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _permission = 'review_citizen_addresses' THEN 
      COALESCE(cp.can_review_citizen_addresses, false)
    WHEN _permission = 'verify_residency' THEN 
      COALESCE(cp.can_verify_residency, false)
    WHEN _permission = 'manage_person_records' THEN 
      COALESCE(cp.can_manage_person_records, false)
    WHEN _permission = 'access_address_history' THEN 
      COALESCE(cp.can_access_address_history, false)
    WHEN _permission = 'update_address_status' THEN 
      COALESCE(cp.can_update_address_status, false)
    WHEN _permission = 'merge_duplicate_persons' THEN 
      COALESCE(cp.can_merge_duplicate_persons, false)
    ELSE false
  END
  FROM public.car_permissions cp
  WHERE cp.user_id = _user_id
  UNION ALL
  SELECT true WHERE has_role(_user_id, 'admin'::app_role) OR has_role(_user_id, 'car_admin'::app_role)
  LIMIT 1;
$$;

-- Create function to update CAR quality metrics
CREATE OR REPLACE FUNCTION public.update_car_quality_metrics()
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_addresses BIGINT;
  pending_addresses BIGINT;
  confirmed_addresses BIGINT;
  rejected_addresses BIGINT;
  duplicate_persons BIGINT;
  coverage_data JSONB;
  avg_verification_time NUMERIC;
BEGIN
  -- Count citizen addresses by status
  SELECT COUNT(*) INTO total_addresses FROM citizen_address;
  
  SELECT COUNT(*) INTO pending_addresses 
  FROM citizen_address WHERE status = 'SELF_DECLARED';
  
  SELECT COUNT(*) INTO confirmed_addresses 
  FROM citizen_address WHERE status = 'CONFIRMED';
  
  SELECT COUNT(*) INTO rejected_addresses 
  FROM citizen_address WHERE status = 'REJECTED';
  
  -- Count potential duplicate person records (simplified)
  SELECT COUNT(*) INTO duplicate_persons FROM (
    SELECT auth_user_id FROM person 
    WHERE auth_user_id IS NOT NULL 
    GROUP BY auth_user_id 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Calculate coverage by region (simplified)
  SELECT jsonb_object_agg(region, address_count) INTO coverage_data
  FROM (
    SELECT 
      COALESCE(a.region, 'Unknown') as region,
      COUNT(ca.*) as address_count
    FROM citizen_address ca
    LEFT JOIN addresses a ON ca.uac = a.uac
    GROUP BY a.region
  ) regional_coverage;
  
  -- Calculate average verification time (placeholder - would need verification timestamps)
  avg_verification_time := 24.0; -- Default 24 hours
  
  -- Insert or update today's metrics
  INSERT INTO car_quality_metrics (
    date_measured,
    total_citizen_addresses,
    pending_verification_addresses,
    confirmed_addresses,
    rejected_addresses,
    duplicate_person_records,
    address_coverage_by_region,
    average_verification_time_hours
  ) VALUES (
    CURRENT_DATE,
    total_addresses,
    pending_addresses,
    confirmed_addresses,
    rejected_addresses,
    duplicate_persons,
    coverage_data,
    avg_verification_time
  )
  ON CONFLICT (date_measured)
  DO UPDATE SET
    total_citizen_addresses = EXCLUDED.total_citizen_addresses,
    pending_verification_addresses = EXCLUDED.pending_verification_addresses,
    confirmed_addresses = EXCLUDED.confirmed_addresses,
    rejected_addresses = EXCLUDED.rejected_addresses,
    duplicate_person_records = EXCLUDED.duplicate_person_records,
    address_coverage_by_region = EXCLUDED.address_coverage_by_region,
    average_verification_time_hours = EXCLUDED.average_verification_time_hours;
END;
$$;

-- Create updated trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger to car_permissions table
DROP TRIGGER IF EXISTS update_car_permissions_updated_at ON public.car_permissions;
CREATE TRIGGER update_car_permissions_updated_at
  BEFORE UPDATE ON public.car_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();