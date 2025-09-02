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

    // First, try to find regional police supervisor for the incident location
    const { data: regionalSupervisors, error: supervisorError } = await supabase
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

    let primarySupervisor = null;
    if (!supervisorError && regionalSupervisors && regionalSupervisors.length > 0) {
      // Check if any regional supervisor is currently active
      const { data: activeSupervisor } = await supabase
        .from('emergency_operator_sessions')
        .select('operator_id')
        .eq('status', 'active')
        .is('session_end', null)
        .in('operator_id', regionalSupervisors.map(s => s.user_id))
        .limit(1)
        .single();

      if (activeSupervisor) {
        primarySupervisor = regionalSupervisors.find(s => s.user_id === activeSupervisor.operator_id);
        console.log(`Found active regional supervisor: ${primarySupervisor.profiles.full_name}`);
      }
    }

    // If no regional supervisor available, find any active supervisor or dispatcher
    if (!primarySupervisor) {
      console.log('No regional supervisor available, finding backup supervisor/dispatcher');
      
      const { data: backupSupervisors } = await supabase
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

      if (backupSupervisors) {
        for (const session of backupSupervisors) {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.operator_id);

          const isSupervisorOrDispatcher = userRoles?.some(role => 
            ['police_supervisor', 'police_dispatcher', 'police_admin'].includes(role.role)
          );

          if (isSupervisorOrDispatcher) {
            primarySupervisor = {
              user_id: session.operator_id,
              profiles: session.profiles
            };
            console.log(`Using backup supervisor/dispatcher: ${primarySupervisor.profiles.full_name}`);
            break;
          }
        }
      }
    }

    const notifications = [];
    let primaryNotified = false;

    // Notify primary supervisor first
    if (primarySupervisor) {
      notifications.push({
        operator_id: primarySupervisor.user_id,
        incident_id: incidentId,
        notification_type: 'new_emergency_primary',
        priority: priority,
        role: 'primary_supervisor',
        sent_at: new Date().toISOString()
      });
      primaryNotified = true;
      console.log(`Primary notification sent to: ${primarySupervisor.profiles.full_name}`);
    }

    // For high priority incidents (1-2) or if no supervisor available, also notify all active operators
    if (priority <= 2 || !primaryNotified) {
      console.log(`High priority incident (${priority}) or no supervisor - notifying all active operators`);
      
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
          // Skip if already notified as primary supervisor
          if (primaryNotified && session.operator_id === primarySupervisor.user_id) {
            continue;
          }

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
              notification_type: priority <= 2 ? 'high_priority_emergency' : 'backup_notification',
              priority: priority,
              role: 'backup_operator',
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

    // Update incident with notification timestamp only - leave status as 'reported'
    await supabase
      .from('emergency_incidents')
      .update({
        dispatched_at: new Date().toISOString()
        // Remove automatic status change - operators should manually dispatch
      })
      .eq('id', incidentId);

    // Log the notification
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incidentId,
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        action: 'operators_notified',
        details: {
          operators_notified: activeOperators.length,
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
      operators_available: activeOperators.length
    };

    console.log('Dispatch system integration payload:', dispatchPayload);

    return new Response(
      JSON.stringify({ 
        success: true,
        operatorsNotified: activeOperators.length,
        incidentNumber: incidentNumber,
        dispatchStatus: 'notified' // All incidents start as reported, not dispatched
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