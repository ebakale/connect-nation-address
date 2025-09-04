import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  incidentId: string;
  type: 'acknowledgment' | 'status_update' | 'resolution';
  oldStatus?: string;
  newStatus?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { incidentId, type, oldStatus, newStatus, message }: NotificationRequest = await req.json();

    console.log(`Processing ${type} notification for incident ${incidentId}`);

    // Get incident details
    const { data: incident, error: incidentError } = await supabase
      .from('emergency_incidents')
      .select(`
        id,
        incident_number,
        emergency_type,
        priority_level,
        status,
        reporter_id,
        reporter_contact_info,
        location_address,
        created_at
      `)
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      console.error('Error fetching incident:', incidentError);
      throw new Error('Incident not found');
    }

    console.log(`Found incident ${incident.incident_number} with reporter_id: ${incident.reporter_id}`);

    // Handle both registered users and unregistered reporters
    if (!incident.reporter_id && !incident.reporter_contact_info) {
      console.log('No reporter ID or contact info found, skipping notification');
      return new Response(
        JSON.stringify({ success: true, message: 'No reporter to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate notification content based on type
    let title: string;
    let notificationMessage: string;
    let priority = incident.priority_level;

    switch (type) {
      case 'acknowledgment':
        title = `Incident Report Received - ${incident.incident_number}`;
        notificationMessage = `Your emergency report has been received and assigned incident number ${incident.incident_number}. 

Emergency Type: ${incident.emergency_type.toUpperCase()}
Priority Level: ${incident.priority_level}
Location: ${incident.location_address || 'Location provided'}
Reported At: ${new Date(incident.created_at).toLocaleString()}

Emergency services have been notified and will respond according to priority level. You will receive updates as the situation progresses.

For urgent updates, emergency services may contact you directly using the information you provided.`;
        break;

      case 'status_update':
        title = `Incident Update - ${incident.incident_number}`;
        notificationMessage = `Your incident ${incident.incident_number} status has been updated.

Previous Status: ${oldStatus?.toUpperCase() || 'Unknown'}
New Status: ${newStatus?.toUpperCase() || incident.status.toUpperCase()}

${getStatusDescription(newStatus || incident.status)}

${message ? `Additional Information: ${message}` : ''}

Time: ${new Date().toLocaleString()}`;
        break;

      case 'resolution':
        title = `Incident Resolved - ${incident.incident_number}`;
        notificationMessage = `Your incident ${incident.incident_number} has been resolved.

Final Status: ${incident.status.toUpperCase()}
Resolution Time: ${new Date().toLocaleString()}

${message || 'The emergency response has been completed. Thank you for your report.'}

If you have any follow-up questions or concerns about this incident, please contact emergency services with reference number ${incident.incident_number}.`;
        priority = 2; // Higher priority for resolution notifications
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Create in-app notification only for registered users
    if (incident.reporter_id) {
      const { error: notificationError } = await supabase
        .from('emergency_notifications')
        .insert({
          user_id: incident.reporter_id,
          incident_id: incident.id,
          title: title,
          message: notificationMessage,
          type: 'incident_update',
          priority_level: priority,
          read: false,
          metadata: {
            incident_number: incident.incident_number,
            emergency_type: incident.emergency_type,
            notification_type: type,
            old_status: oldStatus,
            new_status: newStatus,
            timestamp: new Date().toISOString()
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }

      console.log(`In-app notification created for registered reporter`);
    } else {
      console.log(`Skipping in-app notification for unregistered reporter`);
    }

    // Send SMS to both registered and unregistered reporters if contact info is available
    if (incident.reporter_contact_info && incident.reporter_contact_info.includes('+')) {
      console.log(`Sending SMS to ${incident.reporter_contact_info}`);
      
      const smsMessage = `${title}

${type === 'acknowledgment' 
  ? `Your emergency report has been received. Incident #${incident.incident_number}. Emergency services are responding.`
  : type === 'status_update'
  ? `Incident #${incident.incident_number} status: ${newStatus?.toUpperCase()}. ${getStatusDescription(newStatus || incident.status)}`
  : `Incident #${incident.incident_number} has been resolved. Thank you for your report.`
}

Time: ${new Date().toLocaleString()}`;

      const { error: smsError } = await supabase
        .from('sms_fallback_queue')
        .insert({
          phone_number: incident.reporter_contact_info,
          message_content: smsMessage,
          priority: priority,
          location_data: incident.location_address,
          status: 'pending'
        });

      if (smsError) {
        console.error('Error queuing SMS:', smsError);
      } else {
        console.log(`SMS queued for ${incident.reporter_contact_info}`);
      }
    }

    // Log the notification event
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incident.id,
        user_id: incident.reporter_id || 'unregistered_reporter',
        action: `reporter_notification_${type}`,
        details: {
          notification_type: type,
          reporter_id: incident.reporter_id,
          reporter_contact_info: incident.reporter_contact_info ? '***' + incident.reporter_contact_info.slice(-4) : null,
          old_status: oldStatus,
          new_status: newStatus,
          notification_methods: [
            ...(incident.reporter_id ? ['in_app'] : []),
            ...(incident.reporter_contact_info?.includes('+') ? ['sms'] : [])
          ],
          timestamp: new Date().toISOString()
        }
      });

    console.log(`${type} notification sent successfully to ${incident.reporter_id ? 'registered' : 'unregistered'} reporter`);

    const reporterType = incident.reporter_id ? 'registered_user' : 'unregistered_reporter';
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} notification sent successfully to ${reporterType}`,
        incident_number: incident.incident_number,
        reporter_type: reporterType,
        reporter_notified: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reporter notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getStatusDescription(status: string): string {
  switch (status?.toLowerCase()) {
    case 'reported':
      return 'Your report has been received and is being processed.';
    case 'dispatched':
      return 'Emergency units have been dispatched to your location.';
    case 'in_progress':
      return 'Emergency responders are actively working on your incident.';
    case 'resolved':
      return 'The emergency response has been completed.';
    case 'closed':
      return 'The incident has been officially closed.';
    default:
      return 'Status update received.';
  }
}