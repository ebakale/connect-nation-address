-- Fix the close_current_primary function to handle timestamp types
CREATE OR REPLACE FUNCTION public.close_current_primary(p_person_id uuid, p_until timestamp without time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    UPDATE public.citizen_address
    SET effective_to = p_until::date
    WHERE person_id = p_person_id 
      AND address_kind = 'PRIMARY'
      AND effective_to IS NULL;
END;
$function$;