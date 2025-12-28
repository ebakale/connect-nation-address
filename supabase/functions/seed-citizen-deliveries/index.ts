import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log('Starting citizen deliveries seeding...');

    // Step 1: Find Josefina Nguema's profile
    const { data: josefinaProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('email', 'josienguema@hotmail.com')
      .single();

    if (profileError || !josefinaProfile) {
      console.error('Josefina profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Josefina Nguema profile not found. Please seed postal users first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found Josefina profile:', josefinaProfile.user_id);

    // Step 2: Check if person record exists, create if not
    let { data: existingPerson, error: personCheckError } = await supabase
      .from('person')
      .select('id')
      .eq('auth_user_id', josefinaProfile.user_id)
      .single();

    let personId: string;

    if (!existingPerson) {
      console.log('Creating person record for Josefina...');
      const { data: newPerson, error: createPersonError } = await supabase
        .from('person')
        .insert({
          auth_user_id: josefinaProfile.user_id,
          full_name: josefinaProfile.full_name || 'Josefina Nguema Ayaga',
          date_of_birth: '1985-03-15',
          nationality: 'GQ',
          gender: 'female',
          is_verified: true
        })
        .select('id')
        .single();

      if (createPersonError) {
        console.error('Error creating person:', createPersonError);
        return new Response(
          JSON.stringify({ error: 'Failed to create person record', details: createPersonError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      personId = newPerson.id;
      console.log('Created person record:', personId);
    } else {
      personId = existingPerson.id;
      console.log('Using existing person record:', personId);
    }

    // Step 3: Get Josefina's existing citizen addresses
    const { data: citizenAddresses, error: citizenAddrError } = await supabase
      .from('citizen_address')
      .select('uac, address_kind')
      .eq('person_id', personId)
      .eq('status', 'CONFIRMED');

    if (citizenAddrError || !citizenAddresses || citizenAddresses.length === 0) {
      console.error('No citizen addresses found for Josefina:', citizenAddrError);
      return new Response(
        JSON.stringify({ error: 'Josefina has no registered citizen addresses. Please register at least one address first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found citizen addresses:', citizenAddresses.length);
    
    // Use the PRIMARY address UAC, or the first one if no PRIMARY
    const primaryAddr = citizenAddresses.find(ca => ca.address_kind === 'PRIMARY');
    const primaryUac = primaryAddr?.uac || citizenAddresses[0].uac;
    console.log('Using primary UAC for deliveries:', primaryUac);

    // Step 4: Get a postal clerk to be the creator
    const { data: postalClerk } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'postal_clerk')
      .limit(1)
      .single();

    const creatorId = postalClerk?.user_id || josefinaProfile.user_id;

    // Step 5: Create delivery orders for Josefina
    const now = new Date();
    
    const deliveryOrders = [
      {
        recipient_address_uac: primaryUac,
        recipient_name: 'Josefina Nguema Ayaga',
        recipient_phone: '+240 222 123 456',
        recipient_email: 'josienguema@hotmail.com',
        sender_name: 'Ministerio de Correos',
        sender_branch: 'Oficina Central Malabo',
        package_type: 'letter',
        status: 'out_for_delivery',
        priority_level: 2,
        notes: 'Documento oficial - entregar en mano',
        created_by: creatorId,
        scheduled_date: now.toISOString().split('T')[0]
      },
      {
        recipient_address_uac: primaryUac,
        recipient_name: 'Josefina Nguema Ayaga',
        recipient_phone: '+240 222 123 456',
        sender_name: 'Banco Nacional de Guinea Ecuatorial',
        sender_branch: 'Sucursal Malabo',
        package_type: 'registered_mail',
        status: 'delivered',
        priority_level: 1,
        requires_signature: true,
        requires_id_verification: true,
        notes: 'Tarjeta bancaria - verificar identidad',
        created_by: creatorId,
        completed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        recipient_address_uac: primaryUac,
        recipient_name: 'Josefina Nguema Ayaga',
        recipient_phone: '+240 222 123 456',
        sender_name: 'Amazon España',
        package_type: 'small_parcel',
        status: 'pending_intake',
        priority_level: 3,
        weight_grams: 1500,
        dimensions_cm: '30x20x15',
        notes: 'Paquete internacional',
        created_by: creatorId
      },
      {
        recipient_address_uac: primaryUac,
        recipient_name: 'Josefina Nguema Ayaga',
        recipient_phone: '+240 222 123 456',
        sender_name: 'Tribunal Supremo',
        sender_branch: 'Malabo',
        package_type: 'registered_mail',
        status: 'failed_delivery',
        priority_level: 1,
        requires_signature: true,
        notes: 'Notificación judicial - intento fallido',
        created_by: creatorId
      }
    ];

    const createdOrders = [];
    
    for (const order of deliveryOrders) {
      const { data: newOrder, error: orderError } = await supabase
        .from('delivery_orders')
        .insert(order)
        .select('id, order_number, status')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        continue;
      }

      createdOrders.push(newOrder);
      console.log('Created order:', newOrder.order_number);

      // Create status logs for this order
      const statusLogs = [];
      const baseTime = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

      // All orders start with pending_intake
      statusLogs.push({
        order_id: newOrder.id,
        previous_status: null,
        new_status: 'pending_intake',
        changed_by: creatorId,
        changed_at: baseTime.toISOString(),
        notes: 'Pedido registrado en el sistema'
      });

      if (order.status !== 'pending_intake') {
        // Ready for assignment
        statusLogs.push({
          order_id: newOrder.id,
          previous_status: 'pending_intake',
          new_status: 'ready_for_assignment',
          changed_by: creatorId,
          changed_at: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          notes: 'Paquete verificado y listo para asignación'
        });

        // Assigned
        statusLogs.push({
          order_id: newOrder.id,
          previous_status: 'ready_for_assignment',
          new_status: 'assigned',
          changed_by: creatorId,
          changed_at: new Date(baseTime.getTime() + 4 * 60 * 60 * 1000).toISOString(),
          notes: 'Asignado a agente de reparto'
        });

        if (order.status === 'out_for_delivery' || order.status === 'delivered' || order.status === 'failed_delivery') {
          statusLogs.push({
            order_id: newOrder.id,
            previous_status: 'assigned',
            new_status: 'out_for_delivery',
            changed_by: creatorId,
            changed_at: new Date(baseTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            notes: 'En ruta de reparto',
            latitude: 3.7523,
            longitude: 8.7741
          });
        }

        if (order.status === 'delivered') {
          statusLogs.push({
            order_id: newOrder.id,
            previous_status: 'out_for_delivery',
            new_status: 'delivered',
            changed_by: creatorId,
            changed_at: new Date(baseTime.getTime() + 26 * 60 * 60 * 1000).toISOString(),
            notes: 'Entregado exitosamente',
            latitude: 3.7500,
            longitude: 8.7800
          });
        }

        if (order.status === 'failed_delivery') {
          statusLogs.push({
            order_id: newOrder.id,
            previous_status: 'out_for_delivery',
            new_status: 'failed_delivery',
            changed_by: creatorId,
            changed_at: new Date(baseTime.getTime() + 26 * 60 * 60 * 1000).toISOString(),
            notes: 'Destinatario ausente - se dejó aviso',
            reason: 'recipient_absent',
            latitude: 3.7500,
            longitude: 8.7800
          });
        }
      }

      const { error: logsError } = await supabase
        .from('delivery_status_logs')
        .insert(statusLogs);

      if (logsError) {
        console.error('Error creating status logs:', logsError);
      } else {
        console.log('Created status logs for order:', newOrder.order_number);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Citizen deliveries seeded successfully',
        data: {
          personId,
          primaryUac,
          ordersCreated: createdOrders.length,
          orders: createdOrders
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
