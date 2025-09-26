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

    // This function processes the SMS fallback queue
    console.log('Processing SMS fallback queue...');

    // Get pending SMS messages
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('sms_fallback_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching pending messages:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingMessages?.length || 0} pending SMS messages`);

    const results = [];

    for (const message of pendingMessages || []) {
      try {
        console.log(`Processing SMS for ${message.phone_number}`);

        // In a real implementation, you would integrate with SMS providers like:
        // - Twilio
        // - AWS SNS
        // - Africa's Talking
        // - Local telecom providers

        // For demonstration, we'll simulate the SMS sending
        const smsSuccess = await simulateSMSSending(message);
        
        if (smsSuccess) {
          // Update as sent
          await supabase
            .from('sms_fallback_queue')
            .update({
              status: 'sent',
              processed_at: new Date().toISOString(),
              provider_response: { status: 'delivered', timestamp: new Date().toISOString() }
            })
            .eq('id', message.id);

          results.push({ id: message.id, status: 'sent' });
          console.log(`SMS sent successfully to ${message.phone_number}`);
        } else {
          // Increment attempts
          await supabase
            .from('sms_fallback_queue')
            .update({
              attempts: message.attempts + 1,
              status: message.attempts + 1 >= message.max_attempts ? 'failed' : 'pending',
              provider_response: { error: 'Simulated failure', timestamp: new Date().toISOString() }
            })
            .eq('id', message.id);

          results.push({ id: message.id, status: 'retry' });
          console.log(`SMS failed for ${message.phone_number}, attempt ${message.attempts + 1}`);
        }

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        
        // Update with error
        await supabase
          .from('sms_fallback_queue')
          .update({
            attempts: message.attempts + 1,
            status: message.attempts + 1 >= message.max_attempts ? 'failed' : 'pending',
            provider_response: { error: (error instanceof Error ? error.message : String(error)), timestamp: new Date().toISOString() }
          })
          .eq('id', message.id);

        results.push({ id: message.id, status: 'error', error: (error instanceof Error ? error.message : String(error)) });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing SMS fallback queue:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process SMS queue',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Simulate SMS sending with random success/failure
async function simulateSMSSending(message: any): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Simulate 90% success rate
  return Math.random() > 0.1;
}

// In a real implementation, you would integrate with SMS providers:
/*
async function sendSMSWithTwilio(phoneNumber: string, messageContent: string): Promise<boolean> {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioFromNumber!,
          To: phoneNumber,
          Body: messageContent,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}
*/