// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      incidentId, 
      priority, 
      emergencyType, 
      incidentNumber 
    } = await req.json();

    console.log('Notifying emergency operators for incident:', incidentNumber);

    // Get incident details to determine region/location
    const { data: incident, error: incidentError } = await supabase
      .from('emergency_incidents')
      .select('region, city, location_latitude, location_longitude')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      console.error('Error fetching incident details:', incidentError);
      throw new Error('Incident not found');
    }

    console.log(`Incident location: ${incident.region}, ${incident.city}`);

    // Find available dispatchers first for direct assignment
    const { data: availableDispatchers } = await supabase
      .from('emergency_operator_sessions')
      .select(`
        operator_id,
        profiles!emergency_operator_sessions_operator_id_fkey (
          user_id,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .is('session_end', null);

    let assignedDispatcher = null;
    let availableDispatchersList = [];

    if (availableDispatchers) {
      for (const session of availableDispatchers) {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.operator_id);

        const isDispatcher = userRoles?.some(role => role.role === 'police_dispatcher');
        if (isDispatcher) {
          availableDispatchersList.push({
            user_id: session.operator_id,
            profiles: session.profiles
          });
        }
      }

      // Auto-assign to first available dispatcher (in practice, use load balancing)
      if (availableDispatchersList.length > 0) {
        assignedDispatcher = availableDispatchersList[0];
        console.log(`Auto-assigned to dispatcher: ${assignedDispatcher.profiles.full_name}`);
        
        // Update incident with assigned dispatcher
        await supabase
          .from('emergency_incidents')
          .update({
            assigned_operator_id: assignedDispatcher.user_id,
            status: 'dispatched'
          })
          .eq('id', incidentId);
      }
    }

    // Find supervisors for oversight notifications (not assignment)
    const { data: regionalSupervisors } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        user_role_metadata!fk_user_role_metadata_user_role (
          scope_type,
          scope_value
        ),
        profiles!user_roles_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('role', 'police_supervisor')
      .eq('user_role_metadata.scope_type', 'region')
      .eq('user_role_metadata.scope_value', incident.region || 'Litoral');

    let oversightSupervisors = [];
    if (regionalSupervisors && regionalSupervisors.length > 0) {
      // Get active regional supervisors for oversight
      const { data: activeSupervisors } = await supabase
        .from('emergency_operator_sessions')
        .select('operator_id')
        .eq('status', 'active')
        .is('session_end', null)
        .in('operator_id', regionalSupervisors.map(s => s.user_id));

      if (activeSupervisors) {
        oversightSupervisors = regionalSupervisors.filter(s => 
          activeSupervisors.some(as => as.operator_id === s.user_id)
        );
        console.log(`Found ${oversightSupervisors.length} supervisors for oversight notifications`);
      }
    }

    const notifications = [];
    let dispatcherNotified = false;

    // Notify assigned dispatcher (primary handling)
    if (assignedDispatcher) {
      notifications.push({
        operator_id: assignedDispatcher.user_id,
        incident_id: incidentId,
        notification_type: 'incident_assigned',
        priority: priority,
        role: 'assigned_dispatcher',
        sent_at: new Date().toISOString()
      });
      dispatcherNotified = true;
      console.log(`Primary dispatch notification sent to: ${assignedDispatcher.profiles.full_name}`);
    }

    // Notify supervisors for oversight (not assignment)
    for (const supervisor of oversightSupervisors) {
      notifications.push({
        operator_id: supervisor.user_id,
        incident_id: incidentId,
        notification_type: 'incident_oversight',
        priority: priority,
        role: 'oversight_supervisor',
        sent_at: new Date().toISOString()
      });
      console.log(`Oversight notification sent to supervisor: ${supervisor.profiles.full_name}`);
    }

    // For critical incidents (priority 4+) or if no dispatcher available, notify all available staff
    if (priority >= 4 || !dispatcherNotified) {
      console.log(`Critical incident (${priority}) or no dispatcher - notifying all available staff`);
      
      const { data: allActiveSessions } = await supabase
        .from('emergency_operator_sessions')
        .select(`
          operator_id,
          profiles!emergency_operator_sessions_operator_id_fkey (
            user_id,
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .is('session_end', null);

      if (allActiveSessions) {
        for (const session of allActiveSessions) {
          // Skip if already notified
          const alreadyNotified = notifications.some(n => n.operator_id === session.operator_id);
          if (alreadyNotified) continue;

          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.operator_id);

          const hasPoliceRole = userRoles?.some(role => 
            ['police_operator', 'police_dispatcher', 'police_supervisor', 'police_admin'].includes(role.role)
          );

          if (hasPoliceRole) {
            notifications.push({
              operator_id: session.operator_id,
              incident_id: incidentId,
              notification_type: priority >= 4 ? 'critical_emergency' : 'backup_notification',
              priority: priority,
              role: 'backup_staff',
              sent_at: new Date().toISOString()
            });
          }
        }
      }
    }

    // In a real implementation, you would:
    // 1. Send push notifications to mobile apps
    // 2. Send email alerts for high-priority incidents
    // 3. Integrate with police dispatch systems via API
    // 4. Send SMS to on-duty officers
    
    // For demonstration, we'll log the notifications
    console.log('Would send notifications to operators:', notifications);

    // Update incident with notification timestamp - status already set if dispatcher assigned
    if (!assignedDispatcher) {
      await supabase
        .from('emergency_incidents')
        .update({
          dispatched_at: new Date().toISOString()
        })
        .eq('id', incidentId);
    }

    // Log the notification
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incidentId,
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        action: 'operators_notified',
        details: {
          dispatchers_notified: availableDispatchersList.length,
          supervisors_notified: oversightSupervisors.length,
          assigned_dispatcher: assignedDispatcher?.user_id || null,
          priority: priority,
          emergency_type: emergencyType
        }
      });

    // Simulate integration with external dispatch system
    const dispatchPayload = {
      incident_number: incidentNumber,
      priority: priority,
      type: emergencyType,
      timestamp: new Date().toISOString(),
      dispatchers_available: availableDispatchersList.length,
      assigned_dispatcher: assignedDispatcher?.profiles.full_name || 'None available'
    };

    console.log('Dispatch system integration payload:', dispatchPayload);

    return new Response(
      JSON.stringify({ 
        success: true,
        dispatchersNotified: availableDispatchersList.length,
        assignedDispatcher: assignedDispatcher?.profiles.full_name || null,
        incidentNumber: incidentNumber,
        dispatchStatus: assignedDispatcher ? 'dispatched' : 'notified'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error notifying operators:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to notify operators',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});