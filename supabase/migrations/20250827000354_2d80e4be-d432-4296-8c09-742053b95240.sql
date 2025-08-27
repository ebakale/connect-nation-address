-- Function to auto-update incident status when units are assigned
CREATE OR REPLACE FUNCTION public.auto_update_incident_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if assigned_units was updated and is now not empty
  IF (OLD.assigned_units IS NULL OR array_length(OLD.assigned_units, 1) IS NULL OR array_length(OLD.assigned_units, 1) = 0) 
     AND (NEW.assigned_units IS NOT NULL AND array_length(NEW.assigned_units, 1) > 0) THEN
    
    -- Update status to dispatched and set dispatched_at timestamp
    NEW.status := 'dispatched';
    NEW.dispatched_at := now();
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-updating incident status
CREATE TRIGGER trigger_auto_update_incident_status
  BEFORE UPDATE ON public.emergency_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_incident_status();