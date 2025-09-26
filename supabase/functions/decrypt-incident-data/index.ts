import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple decryption function (matches the encryption in process-emergency-alert)
function simpleDecrypt(encrypted: string): string {
  const key = Deno.env.get('ENCRYPTION_KEY') || 'fallback-key-not-secure';
  try {
    return atob(encrypted + key).slice(0, -(key.length));
  } catch {
    return '[Decryption Error]';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Verify the user has police role
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Check user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPoliceRole = userRoles?.some(role => 
      ['police_operator', 'police_dispatcher', 'police_supervisor', 'police_admin', 'admin'].includes(role.role)
    );

    if (!hasPoliceRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    const { incidentId } = await req.json();

    // Get the incident data
    const { data: incident, error: incidentError } = await supabase
      .from('emergency_incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      return new Response(
        JSON.stringify({ error: 'Incident not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Decrypt sensitive data
    const decryptedData = {
      id: incident.id,
      incident_number: incident.incident_number,
      emergency_type: incident.emergency_type,
      priority_level: incident.priority_level,
      status: incident.status,
      language_code: incident.language_code,
      reported_at: incident.reported_at,
      dispatched_at: incident.dispatched_at,
      responded_at: incident.responded_at,
      resolved_at: incident.resolved_at,
      assigned_operator_id: incident.assigned_operator_id,
      assigned_units: incident.assigned_units,
      dispatcher_notes: incident.dispatcher_notes,
      
      // Decrypted sensitive fields
      latitude: incident.encrypted_latitude ? parseFloat(simpleDecrypt(incident.encrypted_latitude)) : null,
      longitude: incident.encrypted_longitude ? parseFloat(simpleDecrypt(incident.encrypted_longitude)) : null,
      message: incident.encrypted_message ? simpleDecrypt(incident.encrypted_message) : '',
      contact_info: incident.encrypted_contact_info ? simpleDecrypt(incident.encrypted_contact_info) : null,
      address: incident.encrypted_address ? simpleDecrypt(incident.encrypted_address) : null,
      location_accuracy: incident.location_accuracy
    };

    // Log access for audit trail
    await supabase
      .from('emergency_incident_logs')
      .insert({
        incident_id: incidentId,
        user_id: user.id,
        action: 'data_accessed',
        details: {
          access_type: 'decrypt_sensitive_data',
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        incident: decryptedData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error decrypting incident data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to decrypt incident data',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});