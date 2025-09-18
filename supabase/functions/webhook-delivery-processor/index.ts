import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookDelivery {
  id: string;
  url: string;
  event_type: string;
  payload: any;
  attempts: number;
  max_attempts: number;
  status: string;
  last_error?: string;
}

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
    console.log('Starting webhook delivery processor...');

    // Get pending webhook deliveries
    const { data: pendingDeliveries, error: fetchError } = await supabase
      .from('webhook_delivery')
      .select('*')
      .eq('status', 'PENDING')
      .lte('next_retry_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending deliveries:', fetchError);
      throw fetchError;
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      retries: 0
    };

    for (const delivery of pendingDeliveries || []) {
      results.processed++;
      
      try {
        console.log(`Processing webhook delivery ${delivery.id} to ${delivery.url}`);
        
        const success = await deliverWebhook(delivery);
        
        if (success) {
          results.successful++;
          // Mark as delivered
          await supabase
            .from('webhook_delivery')
            .update({
              status: 'DELIVERED',
              delivered_at: new Date().toISOString()
            })
            .eq('id', delivery.id);
            
          console.log(`Webhook ${delivery.id} delivered successfully`);
        } else {
          results.failed++;
          const newAttempts = delivery.attempts + 1;
          
          if (newAttempts >= delivery.max_attempts) {
            // Mark as failed permanently
            await supabase
              .from('webhook_delivery')
              .update({
                status: 'FAILED',
                attempts: newAttempts
              })
              .eq('id', delivery.id);
              
            console.log(`Webhook ${delivery.id} failed permanently after ${newAttempts} attempts`);
          } else {
            results.retries++;
            // Schedule retry with exponential backoff
            const nextRetryAt = new Date(Date.now() + Math.pow(2, newAttempts) * 60000);
            
            await supabase
              .from('webhook_delivery')
              .update({
                attempts: newAttempts,
                next_retry_at: nextRetryAt.toISOString()
              })
              .eq('id', delivery.id);
              
            console.log(`Webhook ${delivery.id} scheduled for retry ${newAttempts} at ${nextRetryAt}`);
          }
        }
      } catch (error) {
        console.error(`Error processing webhook ${delivery.id}:`, error);
        results.failed++;
        
        // Update with error details
        await supabase
          .from('webhook_delivery')
          .update({
            attempts: delivery.attempts + 1,
            last_error: error.message,
            next_retry_at: new Date(Date.now() + 300000).toISOString() // 5 minutes
          })
          .eq('id', delivery.id);
      }
    }

    console.log('Webhook delivery processor completed:', results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook delivery processor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function deliverWebhook(delivery: WebhookDelivery): Promise<boolean> {
  try {
    const response = await fetch(delivery.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ConnectNation-Webhook/1.0',
        'X-Event-Type': delivery.event_type,
        'X-Delivery-ID': delivery.id,
        'X-Attempt': (delivery.attempts + 1).toString()
      },
      body: JSON.stringify(delivery.payload),
    });

    console.log(`Webhook response: ${response.status} ${response.statusText}`);
    
    // Consider 2xx status codes as successful
    return response.ok;
    
  } catch (error) {
    console.error(`Webhook delivery failed:`, error);
    return false;
  }
}