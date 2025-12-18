import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_number, phone } = await req.json();

    if (!order_number) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Tracking request for order: ${order_number}`);

    // Fetch order with full details for citizen view
    const { data: order, error: orderError } = await supabase
      .from('delivery_orders')
      .select(`
        id,
        order_number,
        status,
        recipient_name,
        recipient_phone,
        recipient_address_uac,
        package_type,
        created_at,
        scheduled_date,
        completed_at,
        sender_name,
        sender_address_uac,
        weight_grams,
        dimensions_cm,
        declared_value,
        priority_level,
        requires_signature,
        requires_id_verification,
        preferred_time_window,
        special_instructions,
        cod_required,
        cod_amount
      `)
      .eq('order_number', order_number.trim().toUpperCase())
      .single();

    if (orderError || !order) {
      console.log(`Order not found: ${order_number}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Optional phone verification for additional security
    if (phone && order.recipient_phone) {
      const normalizedInputPhone = phone.replace(/\D/g, '').slice(-4);
      const normalizedOrderPhone = order.recipient_phone.replace(/\D/g, '').slice(-4);
      
      if (normalizedInputPhone !== normalizedOrderPhone) {
        console.log(`Phone verification failed for order: ${order_number}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Phone verification failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // Fetch status logs for timeline
    const { data: statusLogs } = await supabase
      .from('delivery_status_logs')
      .select('new_status, changed_at')
      .eq('order_id', order.id)
      .order('changed_at', { ascending: true });

    // Fetch delivery proof if delivered
    let proof = null;
    if (order.status === 'delivered') {
      const { data: proofData } = await supabase
        .from('delivery_proof')
        .select('proof_type, photo_url, received_by_name, captured_at')
        .eq('order_id', order.id)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single();
      
      proof = proofData;
    }

    // Build response with full data for citizen view
    const trackingData = {
      order_number: order.order_number,
      status: order.status,
      recipient_name: order.recipient_name,
      recipient_address_uac: order.recipient_address_uac,
      package_type: order.package_type,
      created_at: order.created_at,
      scheduled_date: order.scheduled_date,
      completed_at: order.completed_at,
      sender_name: order.sender_name,
      sender_address_uac: order.sender_address_uac,
      weight_grams: order.weight_grams,
      dimensions_cm: order.dimensions_cm,
      declared_value: order.declared_value,
      priority_level: order.priority_level,
      requires_signature: order.requires_signature,
      requires_id_verification: order.requires_id_verification,
      preferred_time_window: order.preferred_time_window,
      special_instructions: order.special_instructions,
      cod_required: order.cod_required,
      cod_amount: order.cod_amount,
      status_logs: (statusLogs || []).map(log => ({
        status: log.new_status,
        changed_at: log.changed_at
      })),
      proof: proof ? {
        proof_type: proof.proof_type,
        photo_url: proof.photo_url,
        received_by_name: proof.received_by_name,
        captured_at: proof.captured_at
      } : undefined
    };

    console.log(`Successfully retrieved tracking data for: ${order_number}`);

    return new Response(
      JSON.stringify({ success: true, order: trackingData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Track delivery error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
