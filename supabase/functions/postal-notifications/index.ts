import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface NotificationRequest {
  order_id: string;
  notification_type: string;
  channel?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { order_id, notification_type, channel = "email" }: NotificationRequest = await req.json();

    console.log(`Processing notification: order=${order_id}, type=${notification_type}, channel=${channel}`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("delivery_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check recipient preferences
    const { data: preferences } = await supabase
      .from("delivery_preferences")
      .select("*")
      .eq("address_uac", order.recipient_address_uac)
      .maybeSingle();

    const shouldSendEmail = preferences?.notification_email !== false && order.recipient_email;
    const shouldSendSMS = preferences?.notification_sms !== false && order.recipient_phone;

    // Create notification record
    const { data: notification, error: notifError } = await supabase
      .from("postal_notifications")
      .insert({
        order_id,
        notification_type,
        channel,
        recipient_email: order.recipient_email,
        recipient_phone: order.recipient_phone,
        status: "pending",
        message_content: generateMessage(notification_type, order),
      })
      .select()
      .single();

    if (notifError) {
      console.error("Failed to create notification:", notifError);
      throw notifError;
    }

    // Send notification based on channel
    let sendResult = { success: false, message: "" };

    if (channel === "email" && shouldSendEmail) {
      sendResult = await sendEmailNotification(order, notification_type);
    } else if (channel === "sms" && shouldSendSMS) {
      sendResult = await sendSMSNotification(order, notification_type);
    } else {
      sendResult = { success: true, message: "Notification logged (no delivery channel available)" };
    }

    // Update notification status
    await supabase
      .from("postal_notifications")
      .update({
        status: sendResult.success ? "sent" : "failed",
        sent_at: sendResult.success ? new Date().toISOString() : null,
        error_message: sendResult.success ? null : sendResult.message,
      })
      .eq("id", notification.id);

    // Update order notification count
    await supabase
      .from("delivery_orders")
      .update({
        notification_count: (order.notification_count || 0) + 1,
      })
      .eq("id", order_id);

    console.log(`Notification processed: ${sendResult.message}`);

    return new Response(
      JSON.stringify({ notification_id: notification.id, message: sendResult.message, success: sendResult.success }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing notification:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateMessage(type: string, order: Record<string, unknown>): string {
  const orderNumber = order.order_number as string;
  const recipientName = order.recipient_name as string;

  const messages: Record<string, string> = {
    order_created: `Your delivery order ${orderNumber} has been created and is being processed.`,
    dispatched: `Your package ${orderNumber} has been dispatched and is on its way.`,
    out_for_delivery: `Your package ${orderNumber} is out for delivery today.`,
    delivered: `Your package ${orderNumber} has been delivered successfully.`,
    failed_delivery: `Delivery attempt for ${orderNumber} was unsuccessful. We will try again.`,
    pickup_reminder: `Reminder: You have a package ${orderNumber} ready for pickup.`,
    return_initiated: `A return has been initiated for order ${orderNumber}.`,
  };

  return messages[type] || `Update for your delivery order ${orderNumber}.`;
}

async function sendEmailNotification(
  order: Record<string, unknown>,
  notificationType: string
): Promise<{ success: boolean; message: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { success: true, message: "Email notification logged (Resend not configured)" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ConEG Postal <notifications@resend.dev>",
        to: [order.recipient_email as string],
        subject: `Delivery Update - ${order.order_number}`,
        html: `
          <h2>Delivery Update</h2>
          <p>Dear ${order.recipient_name},</p>
          <p>${generateMessage(notificationType, order)}</p>
          <p>Track your delivery at: <a href="https://coneg.app/track?order=${order.order_number}">Track Package</a></p>
          <p>Order Number: <strong>${order.order_number}</strong></p>
          <hr>
          <p>ConEG Postal Services</p>
        `,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Email sent successfully" };
    } else {
      const error = await response.text();
      return { success: false, message: `Email failed: ${error}` };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Email error: ${message}` };
  }
}

async function sendSMSNotification(
  order: Record<string, unknown>,
  notificationType: string
): Promise<{ success: boolean; message: string }> {
  // SMS integration placeholder - would use Twilio or similar
  console.log(`SMS notification would be sent to ${order.recipient_phone}: ${generateMessage(notificationType, order)}`);
  return { success: true, message: "SMS notification logged (SMS integration pending)" };
}

serve(handler);
