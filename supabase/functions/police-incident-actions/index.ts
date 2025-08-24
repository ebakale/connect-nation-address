import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has police access
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasPoliceRole = userRoles?.some(r => 
      ['police_operator', 'police_supervisor', 'police_dispatcher', 'admin'].includes(r.role)
    );

    if (!hasPoliceRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, incidentId, data } = await req.json();

    let result;
    
    switch (action) {
      case 'updateStatus':
        // Update incident status
        const { error: statusError } = await supabase
          .from('emergency_incidents')
          .update({ 
            status: data.status,
            updated_at: new Date().toISOString(),
            ...(data.status === 'resolved' && { resolved_at: new Date().toISOString() }),
            ...(data.status === 'closed' && { closed_at: new Date().toISOString() })
          })
          .eq('id', incidentId);

        if (statusError) throw statusError;

        // Log the action
        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'status_updated',
            details: { 
              old_status: data.oldStatus,
              new_status: data.status,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Incident status updated' };
        break;

      case 'assignOperator':
        const { error: assignError } = await supabase
          .from('emergency_incidents')
          .update({ 
            assigned_operator_id: data.operatorId,
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (assignError) throw assignError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'operator_assigned',
            details: { 
              operator_id: data.operatorId,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Operator assigned to incident' };
        break;

      case 'addNote':
        const { error: noteError } = await supabase
          .from('emergency_incidents')
          .update({ 
            dispatcher_notes: data.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (noteError) throw noteError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'note_added',
            details: { 
              notes: data.notes,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Note added to incident' };
        break;

      case 'assignUnits':
        const { error: unitsError } = await supabase
          .from('emergency_incidents')
          .update({ 
            assigned_units: data.units,
            updated_at: new Date().toISOString(),
            dispatched_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (unitsError) throw unitsError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'units_assigned',
            details: { 
              units: data.units,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Units assigned to incident' };
        break;

      case 'markComplete':
        const { error: completeError } = await supabase
          .from('emergency_incidents')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (completeError) throw completeError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'incident_completed',
            details: { 
              completion_notes: data.notes || 'Incident marked as complete',
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Incident marked as complete' };
        break;

      case 'updatePriority':
        const { error: priorityError } = await supabase
          .from('emergency_incidents')
          .update({ 
            priority_level: data.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (priorityError) throw priorityError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: 'priority_updated',
            details: { 
              old_priority: data.oldPriority,
              new_priority: data.priority,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: 'Incident priority updated' };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Police incident action error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});