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

    const { incidentId, unitCode, unitName, incidentNumber, emergencyType, priority, location } = await req.json();

    console.log(`Sending notification for incident ${incidentNumber} to unit ${unitCode}`);

    // Get unit members for notification
    const { data: unitMembers, error: membersError } = await supabase
      .from('emergency_units')
      .select(`
        unit_code,
        emergency_unit_members(
          officer_id,
          profiles(
            user_id,
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('unit_code', unitCode)
      .single();

    if (membersError) {
      console.error('Error fetching unit members:', membersError);
      throw membersError;
    }

    console.log(`Found ${unitMembers?.emergency_unit_members?.length || 0} members for unit ${unitCode}`);

    // Prepare notification message
    const message = `🚨 EMERGENCY DISPATCH
Unit: ${unitCode} (${unitName})
Incident: ${incidentNumber}
Type: ${emergencyType.toUpperCase()}
Priority: ${priority}
Location: ${location}
Time: ${new Date().toLocaleString()}

Please respond immediately.`;

    const notifications = [];

    // Send notifications to all unit members
    if (unitMembers?.emergency_unit_members) {
      for (const member of unitMembers.emergency_unit_members) {
        const profile = member.profiles;
        if (!profile) continue;

        console.log(`Preparing notification for officer ${profile.full_name}`);

        // Create in-app notification
        const { error: notificationError } = await supabase
          .from('emergency_notifications')
          .insert({
            user_id: profile.user_id,
            incident_id: incidentId,
            title: `Emergency Dispatch - ${incidentNumber}`,
            message: message,
            type: 'unit_assignment',
            priority_level: priority,
            read: false,
            metadata: {
              unit_code: unitCode,
              unit_name: unitName,
              incident_number: incidentNumber,
              emergency_type: emergencyType
            }
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        } else {
          console.log(`In-app notification created for ${profile.full_name}`);
        }

        // Add SMS notification to queue if phone number exists
        if (profile.phone) {
          console.log(`Adding SMS to queue for ${profile.phone}`);
          
          const { error: smsError } = await supabase
            .from('sms_fallback_queue')
            .insert({
              phone_number: profile.phone,
              message_content: message,
              priority: priority,
              location_data: location,
              status: 'pending'
            });

          if (smsError) {
            console.error('Error queuing SMS:', smsError);
          } else {
            console.log(`SMS queued for ${profile.phone}`);
          }
        }

        notifications.push({
          officer: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          notified: true
        });
      }
    }

    // Log the notification event
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incidentId,
        user_id: 'system',
        action: 'notification_sent',
        details: {
          unit_code: unitCode,
          unit_name: unitName,
          notification_count: notifications.length,
          notification_methods: ['in_app', 'sms'],
          recipients: notifications,
          timestamp: new Date().toISOString()
        }
      });

    console.log(`Notifications sent successfully. Total recipients: ${notifications.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        recipients: notifications.length,
        details: notifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});