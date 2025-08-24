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

    // Get active police operators
    const { data: activeSessions, error: sessionError } = await supabase
      .from('emergency_operator_sessions')
      .select(`
        operator_id,
        status,
        profiles!emergency_operator_sessions_operator_id_fkey (
          user_id,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .not('session_end', 'is', null);

    if (sessionError) {
      console.error('Error fetching active operators:', sessionError);
    }

    const activeOperators = activeSessions || [];
    console.log(`Found ${activeOperators.length} active operators`);

    // Create notifications for operators (in a real system, this would trigger push notifications, emails, etc.)
    const notifications = [];
    
    for (const session of activeOperators) {
      // Check if operator has relevant role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.operator_id);

      const hasPoliceRole = userRoles?.some(role => 
        ['police_operator', 'police_dispatcher', 'police_supervisor'].includes(role.role)
      );

      if (hasPoliceRole) {
        notifications.push({
          operator_id: session.operator_id,
          incident_id: incidentId,
          notification_type: 'new_emergency',
          priority: priority,
          sent_at: new Date().toISOString()
        });
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