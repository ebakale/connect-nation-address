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

    // Set default priority to medium - operators should assign final priority
    const priority = 3; // Default medium priority - operators will adjust as needed

    // Check for nearby addresses within 25 meters and generate proper UAC
    const findNearbyAddressAndGenerateUAC = async (latitude: number, longitude: number, incidentId: string) => {
      try {
        // Search for addresses within approximately 25 meters (0.00025 degrees ≈ 28 meters)
        const { data: nearbyAddresses, error } = await supabase
          .from('addresses')
          .select('uac, latitude, longitude, building, street, city, region, country')
          .gte('latitude', latitude - 0.00025)
          .lte('latitude', latitude + 0.00025)
          .gte('longitude', longitude - 0.00025)
          .lte('longitude', longitude + 0.00025)
          .limit(5);

        if (!error && nearbyAddresses && nearbyAddresses.length > 0) {
          // Calculate exact distances and find closest address
          let closestAddress = null;
          let minDistance = Infinity;

          for (const addr of nearbyAddresses) {
            const distance = Math.sqrt(
              Math.pow((latitude - parseFloat(addr.latitude.toString())) * 111000, 2) + 
              Math.pow((longitude - parseFloat(addr.longitude.toString())) * 111000, 2)
            ); // Distance in meters

            if (distance <= 25 && distance < minDistance) {
              minDistance = distance;
              closestAddress = addr;
            }
          }

          if (closestAddress) {
            console.log(`Using existing address UAC: ${closestAddress.uac} (${minDistance.toFixed(2)}m away)`);
            return {
              uac: closestAddress.uac,
              addressData: {
                building: closestAddress.building,
                street: closestAddress.street,
                city: closestAddress.city,
                region: closestAddress.region,
                country: closestAddress.country
              }
            };
          }
        }

        // Generate new UAC using standard system for Equatorial Guinea emergency location
        const countryCode = 'GQ';
        const regionCode = 'EMRG'; // Emergency region code
        const cityCode = 'INC'; // Incident city code
        const sequence = incidentId.replace(/-/g, '').slice(0, 6).toUpperCase();
        
        // Generate check digit
        const baseCode = `${countryCode}-${regionCode}-${cityCode}-${sequence}`;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let sum = 0;
        
        for (let i = 0; i < baseCode.length; i++) {
          const char = baseCode[i];
          if (char !== '-') {
            const value = chars.indexOf(char.toUpperCase());
            sum += value >= 0 ? value : 0;
          }
        }
        
        const checkIndex1 = sum % chars.length;
        const checkIndex2 = (sum * 7) % chars.length;
        const checkDigit = chars[checkIndex1] + chars[checkIndex2];
        
        return {
          uac: `${baseCode}-${checkDigit}`,
          addressData: null
        };
        
      } catch (error) {
        console.error('Error finding nearby address or generating UAC:', error);
        // Fallback UAC
        return {
          uac: `GQ-EMRG-INC-${incidentId.replace(/-/g, '').slice(0, 6).toUpperCase()}-FB`,
          addressData: null
        };
      }
    };

    // Create emergency incident with both encrypted and unencrypted location data
    const tempIncidentId = crypto.randomUUID();
    const uacResult = await findNearbyAddressAndGenerateUAC(latitude, longitude, tempIncidentId);
    
    const { data: incident, error: incidentError } = await supabase
      .from('emergency_incidents')
      .insert({
        reporter_id: reporterId,
        emergency_type: emergencyType,
        priority_level: priority,
        // Keep encrypted fields for backup/audit purposes
        encrypted_latitude: encryptedLatitude,
        encrypted_longitude: encryptedLongitude,
        encrypted_message: encryptedMessage,
        encrypted_contact_info: encryptedContactInfo,
        language_code: language,
        status: 'reported',
        // Store ALL data in unencrypted fields for immediate police access
        location_latitude: latitude,
        location_longitude: longitude,
        location_address: `Emergency Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        incident_uac: uacResult.uac,
        incident_message: message,
        reporter_contact_info: contactInfo,
        // Populate structured address fields if nearby address found
        street: uacResult.addressData?.street || null,
        city: uacResult.addressData?.city || null,
        region: uacResult.addressData?.region || null,
        country: uacResult.addressData?.country || 'Equatorial Guinea'
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

    // Send acknowledgment notification to all reporters (registered and unregistered)
    console.log('Sending acknowledgment notification to reporter');
    
    const acknowledgmentResponse = await supabase.functions.invoke('notify-incident-reporter', {
      body: {
        incidentId: incident.id,
        type: 'acknowledgment'
      }
    });

    console.log('Acknowledgment notification response:', acknowledgmentResponse);

    // SMS Fallback for offline scenarios (fallback in case notification system fails)
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