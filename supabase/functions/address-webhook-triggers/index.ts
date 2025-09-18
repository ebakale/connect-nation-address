import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This edge function is triggered by database triggers when address-related events occur
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { type, table, record, old_record } = await req.json();

    console.log(`Address webhook trigger: ${type} on ${table}`, { record_id: record?.id });

    let eventType = '';
    let eventData: any = {};

    // Determine event type and prepare data based on the trigger
    switch (table) {
      case 'addresses':
        if (type === 'INSERT') {
          eventType = 'address.created';
          eventData = {
            address_id: record.id,
            uac: record.uac,
            address: {
              street: record.street,
              city: record.city,
              region: record.region,
              country: record.country,
              building: record.building,
              coordinates: {
                latitude: record.latitude,
                longitude: record.longitude
              }
            },
            verified: record.verified,
            public: record.public,
            created_at: record.created_at
          };
        } else if (type === 'UPDATE') {
          eventType = 'address.updated';
          eventData = {
            address_id: record.id,
            uac: record.uac,
            changes: getChanges(old_record, record),
            address: {
              street: record.street,
              city: record.city,
              region: record.region,
              country: record.country,
              building: record.building,
              coordinates: {
                latitude: record.latitude,
                longitude: record.longitude
              }
            },
            verified: record.verified,
            public: record.public,
            updated_at: record.updated_at
          };

          // Special events for verification status changes
          if (old_record?.verified !== record.verified && record.verified) {
            await triggerWebhookEvent('address.verified', {
              ...eventData,
              verified_at: record.updated_at
            });
          }

          if (old_record?.public !== record.public && record.public) {
            await triggerWebhookEvent('address.published', {
              ...eventData,
              published_at: record.updated_at
            });
          }
        } else if (type === 'DELETE') {
          eventType = 'address.deleted';
          eventData = {
            address_id: record.id,
            uac: record.uac,
            deleted_at: new Date().toISOString()
          };
        }
        break;

      case 'address_requests':
        if (type === 'INSERT') {
          eventType = 'address_request.created';
          eventData = {
            request_id: record.id,
            user_id: record.user_id,
            address: {
              street: record.street,
              city: record.city,
              region: record.region,
              country: record.country,
              building: record.building,
              coordinates: record.latitude && record.longitude ? {
                latitude: record.latitude,
                longitude: record.longitude
              } : null
            },
            status: record.status,
            justification: record.justification,
            created_at: record.created_at
          };
        } else if (type === 'UPDATE') {
          const statusChanged = old_record?.status !== record.status;
          
          if (statusChanged) {
            if (record.status === 'approved') {
              eventType = 'address_request.approved';
            } else if (record.status === 'rejected') {
              eventType = 'address_request.rejected';
            } else {
              eventType = 'address_request.updated';
            }

            eventData = {
              request_id: record.id,
              user_id: record.user_id,
              old_status: old_record?.status,
              new_status: record.status,
              reviewed_by: record.reviewed_by,
              reviewed_at: record.reviewed_at,
              rejection_reason: record.rejection_reason,
              rejection_notes: record.rejection_notes,
              address: {
                street: record.street,
                city: record.city,
                region: record.region,
                country: record.country,
                building: record.building
              }
            };
          }
        }
        break;

      case 'residency_ownership_verifications':
        if (type === 'INSERT') {
          eventType = 'verification.created';
          eventData = {
            verification_id: record.id,
            user_id: record.user_id,
            verification_type: record.verification_type,
            status: record.status,
            created_at: record.created_at
          };
        } else if (type === 'UPDATE' && old_record?.status !== record.status) {
          if (record.status === 'approved') {
            eventType = 'verification.approved';
          } else if (record.status === 'rejected') {
            eventType = 'verification.rejected';
          } else {
            eventType = 'verification.updated';
          }

          eventData = {
            verification_id: record.id,
            user_id: record.user_id,
            old_status: old_record?.status,
            new_status: record.status,
            verified_by: record.verified_by,
            verified_at: record.verified_at
          };
        }
        break;
    }

    // Trigger webhook event if we have a valid event type
    if (eventType && eventData) {
      await triggerWebhookEvent(eventType, eventData, {
        source: 'database_trigger',
        table,
        operation: type
      });

      return new Response(JSON.stringify({
        success: true,
        event_type: eventType,
        message: 'Webhook event triggered successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: true,
        message: 'No webhook event needed for this change'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Address webhook trigger error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function triggerWebhookEvent(eventType: string, data: any, metadata?: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        event_type: eventType,
        data,
        metadata
      })
    });

    const result = await response.json();
    console.log(`Webhook event ${eventType} triggered:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to trigger webhook event ${eventType}:`, error);
    throw error;
  }
}

function getChanges(oldRecord: any, newRecord: any): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};
  
  const keysToCheck = [
    'verified', 'public', 'flagged', 'street', 'city', 'region', 'country', 
    'building', 'latitude', 'longitude', 'description', 'address_type'
  ];

  for (const key of keysToCheck) {
    if (oldRecord?.[key] !== newRecord?.[key]) {
      changes[key] = {
        from: oldRecord?.[key],
        to: newRecord?.[key]
      };
    }
  }

  return changes;
}