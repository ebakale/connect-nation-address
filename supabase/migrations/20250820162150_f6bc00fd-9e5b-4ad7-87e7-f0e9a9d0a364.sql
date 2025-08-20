-- Add flagging functionality to addresses table
ALTER TABLE public.addresses 
ADD COLUMN flagged boolean NOT NULL DEFAULT false,
ADD COLUMN flag_reason text,
ADD COLUMN flagged_by uuid,
ADD COLUMN flagged_at timestamp with time zone;

-- Add flagging functionality to address_requests table  
ALTER TABLE public.address_requests
ADD COLUMN flagged boolean NOT NULL DEFAULT false,
ADD COLUMN flag_reason text,
ADD COLUMN flagged_by uuid,
ADD COLUMN flagged_at timestamp with time zone;

-- Create index for better performance on flagged addresses
CREATE INDEX idx_addresses_flagged ON public.addresses(flagged) WHERE flagged = true;
CREATE INDEX idx_address_requests_flagged ON public.address_requests(flagged) WHERE flagged = true;

-- Add RLS policies for flagging functionality
CREATE POLICY "Staff can flag addresses" 
ON public.addresses 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'registrar'::app_role));

CREATE POLICY "Staff can flag address requests" 
ON public.address_requests 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'verifier'::app_role, 'registrar'::app_role])))));

-- Create function to automatically flag low accuracy addresses
CREATE OR REPLACE FUNCTION public.flag_address_for_review(
  p_address_id uuid,
  p_reason text,
  p_flagged_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.addresses 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    verified = false,
    public = false
  WHERE id = p_address_id;
  
  RETURN FOUND;
END;
$function$;

-- Create function to flag address requests
CREATE OR REPLACE FUNCTION public.flag_address_request_for_review(
  p_request_id uuid,
  p_reason text,
  p_flagged_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.address_requests 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    status = 'flagged'
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$function$;

-- Create function to unflag addresses after review
CREATE OR REPLACE FUNCTION public.unflag_address(
  p_address_id uuid,
  p_unflagged_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.addresses 
  SET 
    flagged = false,
    flag_reason = NULL,
    flagged_by = NULL,
    flagged_at = NULL
  WHERE id = p_address_id;
  
  RETURN FOUND;
END;
$function$;