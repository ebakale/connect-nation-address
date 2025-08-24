import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption function (in production, use proper encryption libraries)
function simpleEncrypt(text: string): string {
  const key = Deno.env.get('ENCRYPTION_KEY') || 'fallback-key-not-secure';
  return btoa(text + key).slice(0, -key.length);
}

// Simple decryption function
function simpleDecrypt(encrypted: string): string {
  const key = Deno.env.get('ENCRYPTION_KEY') || 'fallback-key-not-secure';
  return atob(encrypted + key).slice(0, -(key.length));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      message, 
      latitude, 
      longitude, 
      emergencyType = 'general',
      reporterId,
      contactInfo,
      language = 'en'
    } = await req.json();

    console.log('Processing emergency alert:', { emergencyType, latitude, longitude });

    // Encrypt sensitive data
    const encryptedMessage = simpleEncrypt(message);
    const encryptedLatitude = simpleEncrypt(latitude.toString());
    const encryptedLongitude = simpleEncrypt(longitude.toString());
    const encryptedContactInfo = contactInfo ? simpleEncrypt(contactInfo) : null;

    // Determine priority based on emergency type and keywords
    let priority = 3; // Default medium priority
    const urgentKeywords = ['bleeding', 'unconscious', 'fire', 'weapon', 'attack', 'robbery'];
    const highPriorityTypes = ['medical', 'fire', 'police'];
    
    if (urgentKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      priority = 1; // Highest priority
    } else if (highPriorityTypes.includes(emergencyType)) {
      priority = 2; // High priority
    }

    // Generate UAC for incident location
    const generateUACForIncident = (latitude: number, longitude: number, incidentId: string) => {
      // Simplified UAC generation for incidents - using incident ID prefix
      const latPrefix = Math.floor(latitude * 100).toString().slice(0, 4);
      const lngPrefix = Math.floor(longitude * 100).toString().slice(0, 4);
      const idPrefix = incidentId.replace(/-/g, '').slice(0, 6).toUpperCase();
      return `GQ-EMRG-${latPrefix}${lngPrefix}-${idPrefix}`;
    };

    // Create emergency incident with both encrypted and unencrypted location data
    const tempIncidentId = crypto.randomUUID();
    const incidentUAC = generateUACForIncident(latitude, longitude, tempIncidentId);
    
    const { data: incident, error: incidentError } = await supabase
      .from('emergency_incidents')
      .insert({
        reporter_id: reporterId,
        emergency_type: emergencyType,
        priority_level: priority,
        encrypted_latitude: encryptedLatitude,
        encrypted_longitude: encryptedLongitude,
        encrypted_message: encryptedMessage,
        encrypted_contact_info: encryptedContactInfo,
        language_code: language,
        status: 'reported',
        // Add unencrypted location fields for immediate police access
        location_latitude: latitude,
        location_longitude: longitude,
        location_address: `Emergency Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        incident_uac: incidentUAC
      })
      .select()
      .single();

    if (incidentError) {
      console.error('Error creating incident:', incidentError);
      throw incidentError;
    }

    console.log('Emergency incident created:', incident.id);

    // Log the incident creation
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incident.id,
        user_id: reporterId || '00000000-0000-0000-0000-000000000000',
        action: 'incident_created',
        details: {
          emergency_type: emergencyType,
          priority_level: priority,
          source: 'citizen_app'
        }
      });

    // For high-priority incidents, trigger immediate notifications
    if (priority <= 2) {
      console.log('High priority incident - triggering immediate notifications');
      
      // Here you would integrate with police dispatch systems
      // For now, we'll create a notification record
      const notificationResponse = await supabase.functions.invoke('notify-emergency-operators', {
        body: {
          incidentId: incident.id,
          priority: priority,
          emergencyType: emergencyType,
          incidentNumber: incident.incident_number
        }
      });

      console.log('Notification response:', notificationResponse);
    }

    // SMS Fallback for offline scenarios
    if (contactInfo && contactInfo.includes('+')) {
      await supabase
        .from('sms_fallback_queue')
        .insert({
          phone_number: contactInfo,
          message_content: `Emergency alert received. Incident #${incident.incident_number}. Help is being dispatched.`,
          location_data: `${latitude},${longitude}`,
          priority: priority
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        incidentId: incident.id,
        incidentNumber: incident.incident_number,
        priority: priority,
        message: 'Emergency alert processed successfully. Help is on the way.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    );

  } catch (error) {
    console.error('Error processing emergency alert:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process emergency alert',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});