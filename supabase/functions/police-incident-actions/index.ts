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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
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

    // Check if user has police access and get their role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasPoliceRole = userRoles?.some(r => 
      ['police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin', 'admin'].includes(r.role)
    );

    if (!hasPoliceRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's primary role (highest priority)
    const userRole = userRoles?.find(r => r.role === 'police_supervisor')?.role ||
                     userRoles?.find(r => r.role === 'police_dispatcher')?.role ||
                     userRoles?.find(r => r.role === 'police_operator')?.role ||
                     userRoles?.[0]?.role;

    const { action, incidentId, data } = await req.json();

    // Load current incident to enforce state-based restrictions
    const { data: incidentRow, error: incidentError } = await supabase
      .from('emergency_incidents')
      .select('status')
      .eq('id', incidentId)
      .single();
    if (incidentError || !incidentRow) {
      return new Response(
        JSON.stringify({ error: 'Incident not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const isResolved = ['resolved', 'closed'].includes(incidentRow.status);

    // Block modifications on resolved/closed incidents (server-side hard stop)
    const blockedOnResolved = ['assignUnits', 'assignOperator', 'updatePriority', 'markComplete'];
    if (isResolved && blockedOnResolved.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Cannot modify a resolved/closed incident' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    
    switch (action) {
      case 'updateStatus':
        // Determine target status (support both "status" and "newStatus" from clients)
        const targetStatus = (data?.status ?? data?.newStatus) as string;
        if (!targetStatus) {
          throw new Error('Missing target status');
        }
        // Only supervisors can change status when incident is resolved/closed (reopen)
        if (isResolved && userRole !== 'police_supervisor') {
          return new Response(
            JSON.stringify({ error: 'Only supervisors can reopen resolved/closed incidents' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Update incident status
        const { error: statusError } = await supabase
          .from('emergency_incidents')
          .update({ 
            status: targetStatus,
            updated_at: new Date().toISOString(),
            ...(targetStatus === 'resolved' && { resolved_at: new Date().toISOString() }),
            ...(targetStatus === 'closed' && { closed_at: new Date().toISOString() })
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
              old_status: data.oldStatus ?? incidentRow.status,
              new_status: targetStatus,
              updated_by_role: userRole,
              timestamp: new Date().toISOString()
            }
          });

        // Send notification to reporter about status change (for all incidents with contact info)
        console.log('Sending status update notification to reporter');
        
        const notificationType = targetStatus === 'resolved' || targetStatus === 'closed' ? 'resolution' : 'status_update';
        
        const reporterNotificationResponse = await supabase.functions.invoke('notify-incident-reporter', {
          body: {
            incidentId: incidentId,
            type: notificationType,
            oldStatus: data.oldStatus ?? incidentRow.status,
            newStatus: targetStatus,
            message: data.message || undefined
          }
        });

        console.log('Reporter notification response:', reporterNotificationResponse);

        result = { success: true, message: 'Incident status updated' };
        break;

      case 'assignOperator':
        // Only dispatchers and admins can assign incidents to dispatchers
        const canAssign = ['police_dispatcher', 'police_admin', 'admin'].includes(userRole);
        if (!canAssign) {
          throw new Error('Only dispatchers and admins can assign incidents');
        }

        // If operatorId is provided, validate it's a dispatcher
        if (data.operatorId) {
          const { data: operatorRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.operatorId)
            .eq('role', 'police_dispatcher')
            .single();

          if (roleError || !operatorRole) {
            throw new Error('Incidents can only be assigned to dispatchers');
          }
        }

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

        result = { success: true, message: 'Incident assigned to dispatcher' };
        break;

      case 'addNote':
        // Determine which notes field to update based on user role
        const isDispatcher = userRole === 'police_dispatcher' || userRole === 'police_supervisor';
        const noteField = isDispatcher ? 'dispatcher_notes' : 'field_notes';
        const actionType = isDispatcher ? 'dispatcher_note_added' : 'field_note_added';
        
        const { error: noteError } = await supabase
          .from('emergency_incidents')
          .update({ 
            [noteField]: data.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (noteError) throw noteError;

        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: incidentId,
            user_id: user.id,
            action: actionType,
            details: { 
              notes: data.notes,
              note_type: isDispatcher ? 'dispatcher' : 'field',
              added_by: user.email || user.id,
              timestamp: new Date().toISOString()
            }
          });

        result = { success: true, message: `${isDispatcher ? 'Dispatcher' : 'Field'} note added to incident` };
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
            action: 'unit_assigned',
            details: { 
              assigned_unit: data.unitCode,
              unit_name: data.unitName,
              assigned_by: user.email,
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