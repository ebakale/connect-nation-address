import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookSubscription {
  id: string;
  url: string;
  event_types: string[];
  active: boolean;
  secret?: string;
}

interface WebhookEvent {
  event_type: string;
  event_id: string;
  timestamp: string;
  data: any;
  metadata?: any;
}

const WEBHOOK_SUBSCRIPTIONS: WebhookSubscription[] = [
  // These would normally be stored in database, but for demo we'll use static config
  // In production, create a webhook_subscriptions table
];

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
    const { event_type, data, metadata } = await req.json();

    if (!event_type || !data) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: event_type, data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing webhook event: ${event_type}`);

    const webhookEvent: WebhookEvent = {
      event_type,
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      data,
      metadata
    };

    // Get webhook subscriptions (for demo, we'll check if any URLs are configured)
    const subscribedWebhooks = await getWebhookSubscriptions(event_type);

    let deliveriesCreated = 0;

    for (const webhook of subscribedWebhooks) {
      try {
        // Create webhook delivery record
        const { error } = await supabase
          .from('webhook_delivery')
          .insert({
            url: webhook.url,
            event_type: event_type,
            payload: {
              ...webhookEvent,
              subscription_id: webhook.id
            },
            status: 'PENDING',
            attempts: 0,
            max_attempts: 3,
            next_retry_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Failed to create webhook delivery for ${webhook.url}:`, error);
        } else {
          deliveriesCreated++;
          console.log(`Created webhook delivery for ${webhook.url}`);
        }
      } catch (error) {
        console.error(`Error creating webhook delivery:`, error);
      }
    }

    // Trigger immediate delivery processing if we have deliveries
    if (deliveriesCreated > 0) {
      // Trigger the webhook processor (fire and forget)
      supabase.functions.invoke('webhook-delivery-processor').catch(error => {
        console.error('Failed to trigger webhook processor:', error);
      });
    }

    return new Response(JSON.stringify({
      success: true,
      event_id: webhookEvent.event_id,
      deliveries_created: deliveriesCreated,
      message: `Webhook event processed. ${deliveriesCreated} deliveries created.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook events error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getWebhookSubscriptions(eventType: string): Promise<WebhookSubscription[]> {
  // In a real implementation, this would query a webhook_subscriptions table
  // For demo purposes, we'll return mock data or check environment variables
  
  const webhookUrl = Deno.env.get('DEMO_WEBHOOK_URL');
  if (webhookUrl) {
    return [{
      id: 'demo-webhook',
      url: webhookUrl,
      event_types: ['*'], // All events
      active: true
    }];
  }

  return WEBHOOK_SUBSCRIPTIONS.filter(sub => 
    sub.active && (
      sub.event_types.includes('*') || 
      sub.event_types.includes(eventType)
    )
  );
}

// Helper function to be called by other edge functions
export async function triggerWebhookEvent(eventType: string, data: any, metadata?: any) {
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

    return await response.json();
  } catch (error) {
    console.error('Failed to trigger webhook event:', error);
    throw error;
  }
}