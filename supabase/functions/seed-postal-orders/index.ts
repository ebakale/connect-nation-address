import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting postal orders seeding...');

    // Get verified addresses for UACs
    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('uac, street, city, region')
      .eq('verified', true)
      .limit(20);

    if (addressError || !addresses || addresses.length === 0) {
      console.log('No verified addresses found, using fallback UACs');
    }

    const validUACs = addresses?.map(a => a.uac) || [
      'GQ-LI-BAT-001A00-TD',
      'GQ-LI-MAL-002B00-TD',
      'GQ-BN-MAL-003C00-TD'
    ];

    // Get postal agents for assignments
    const { data: postalAgents, error: agentError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'postal_agent');

    const agentIds = postalAgents?.map(a => a.user_id) || [];
    console.log(`Found ${agentIds.length} postal agents`);

    // Get postal dispatcher/clerk for created_by
    const { data: postalStaff, error: staffError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['postal_clerk', 'postal_dispatcher', 'postal_supervisor']);

    const staffIds = postalStaff?.map(s => s.user_id) || [];
    const defaultCreator = staffIds[0] || agentIds[0];

    if (!defaultCreator) {
      throw new Error('No postal staff found. Please seed postal users first.');
    }

    // Mock sender data
    const senders = [
      { name: 'Ministerio de Hacienda', branch: 'Oficina Central Malabo', phone: '+240 333 091 234' },
      { name: 'Banco Nacional de Guinea Ecuatorial', branch: 'Sucursal Principal', phone: '+240 333 092 456' },
      { name: 'Hospital Regional de Bata', branch: 'Administración', phone: '+240 333 082 789' },
      { name: 'Universidad Nacional de Guinea Ecuatorial', branch: 'Secretaría General', phone: '+240 333 093 012' },
      { name: 'Ayuntamiento de Malabo', branch: 'Registro Civil', phone: '+240 333 094 345' },
      { name: 'Correos y Telégrafos GQ', branch: 'Oficina Central', phone: '+240 333 095 678' },
      { name: 'Ministerio de Educación', branch: 'Dirección Provincial', phone: '+240 333 096 901' },
      { name: 'Tribunal Supremo', branch: 'Secretaría Judicial', phone: '+240 333 097 234' },
    ];

    // Mock recipient data
    const recipients = [
      { name: 'Juan Carlos Nguema', phone: '+240 222 345 678', email: 'jc.nguema@email.gq' },
      { name: 'María Elena Obiang', phone: '+240 222 456 789', email: 'me.obiang@email.gq' },
      { name: 'Pedro Antonio Mba', phone: '+240 222 567 890', email: 'pa.mba@email.gq' },
      { name: 'Ana Cristina Esono', phone: '+240 222 678 901', email: 'ac.esono@email.gq' },
      { name: 'Luis Fernando Nzang', phone: '+240 222 789 012', email: 'lf.nzang@email.gq' },
      { name: 'Carmen Rosa Edu', phone: '+240 222 890 123', email: 'cr.edu@email.gq' },
      { name: 'Francisco Javier Mangue', phone: '+240 222 901 234', email: 'fj.mangue@email.gq' },
      { name: 'Isabel María Ndong', phone: '+240 222 012 345', email: 'im.ndong@email.gq' },
      { name: 'Roberto Carlos Eyene', phone: '+240 222 123 456', email: 'rc.eyene@email.gq' },
      { name: 'Patricia Fernanda Mikue', phone: '+240 222 234 567', email: 'pf.mikue@email.gq' },
    ];

    // Package types matching the enum
    const packageTypes = ['letter', 'small_parcel', 'medium_parcel', 'large_parcel', 'document', 'registered', 'express', 'government_document'];

    // Define orders with different statuses
    const orderDefinitions = [
      // Pending Intake (3)
      { status: 'pending_intake', priority: 3, package_type: 'letter', days_ago: 0 },
      { status: 'pending_intake', priority: 2, package_type: 'document', days_ago: 0 },
      { status: 'pending_intake', priority: 3, package_type: 'small_parcel', days_ago: 1 },
      
      // Ready for Assignment (2)
      { status: 'ready_for_assignment', priority: 2, package_type: 'registered', days_ago: 1 },
      { status: 'ready_for_assignment', priority: 3, package_type: 'medium_parcel', days_ago: 2 },
      
      // Assigned (3)
      { status: 'assigned', priority: 1, package_type: 'government_document', days_ago: 1, needs_assignment: true },
      { status: 'assigned', priority: 2, package_type: 'express', days_ago: 1, needs_assignment: true },
      { status: 'assigned', priority: 3, package_type: 'small_parcel', days_ago: 2, needs_assignment: true },
      
      // Out for Delivery (3)
      { status: 'out_for_delivery', priority: 1, package_type: 'government_document', days_ago: 0, needs_assignment: true },
      { status: 'out_for_delivery', priority: 2, package_type: 'registered', days_ago: 0, needs_assignment: true },
      { status: 'out_for_delivery', priority: 3, package_type: 'medium_parcel', days_ago: 1, needs_assignment: true },
      
      // Delivered (4)
      { status: 'delivered', priority: 1, package_type: 'express', days_ago: 2, needs_assignment: true, completed: true },
      { status: 'delivered', priority: 2, package_type: 'document', days_ago: 3, needs_assignment: true, completed: true },
      { status: 'delivered', priority: 3, package_type: 'letter', days_ago: 4, needs_assignment: true, completed: true },
      { status: 'delivered', priority: 3, package_type: 'small_parcel', days_ago: 5, needs_assignment: true, completed: true },
      
      // Failed Delivery (2)
      { status: 'failed_delivery', priority: 2, package_type: 'registered', days_ago: 1, needs_assignment: true, reason: 'Recipient not home' },
      { status: 'failed_delivery', priority: 3, package_type: 'medium_parcel', days_ago: 2, needs_assignment: true, reason: 'Access denied to building' },
      
      // Address Not Found (1)
      { status: 'address_not_found', priority: 3, package_type: 'letter', days_ago: 3, needs_assignment: true, reason: 'UAC location unclear' },
      
      // Returned to Sender (1)
      { status: 'returned_to_sender', priority: 2, package_type: 'large_parcel', days_ago: 5, needs_assignment: true, reason: 'Multiple failed attempts' },
    ];

    const createdOrders = [];
    const createdAssignments = [];
    const createdLogs = [];

    for (let i = 0; i < orderDefinitions.length; i++) {
      const def = orderDefinitions[i];
      const sender = senders[i % senders.length];
      const recipient = recipients[i % recipients.length];
      const recipientUAC = validUACs[i % validUACs.length];
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - def.days_ago);

      // Generate weight and dimensions based on package type
      let weight = 50;
      let dimensions = '10x15x1';
      let declaredValue = null;

      switch (def.package_type) {
        case 'letter':
          weight = 20 + Math.floor(Math.random() * 30);
          dimensions = '22x11x0.5';
          break;
        case 'document':
        case 'government_document':
          weight = 50 + Math.floor(Math.random() * 100);
          dimensions = '30x21x2';
          declaredValue = 0;
          break;
        case 'small_parcel':
          weight = 200 + Math.floor(Math.random() * 500);
          dimensions = '20x15x10';
          declaredValue = 5000 + Math.floor(Math.random() * 20000);
          break;
        case 'medium_parcel':
          weight = 1000 + Math.floor(Math.random() * 2000);
          dimensions = '40x30x20';
          declaredValue = 20000 + Math.floor(Math.random() * 50000);
          break;
        case 'large_parcel':
          weight = 3000 + Math.floor(Math.random() * 5000);
          dimensions = '60x40x40';
          declaredValue = 50000 + Math.floor(Math.random() * 100000);
          break;
        case 'registered':
        case 'express':
          weight = 100 + Math.floor(Math.random() * 500);
          dimensions = '25x18x5';
          declaredValue = 10000 + Math.floor(Math.random() * 30000);
          break;
      }

      const orderData = {
        sender_name: sender.name,
        sender_branch: sender.branch,
        sender_phone: sender.phone,
        recipient_name: recipient.name,
        recipient_address_uac: recipientUAC,
        recipient_phone: recipient.phone,
        recipient_email: recipient.email,
        package_type: def.package_type,
        priority_level: def.priority,
        weight_grams: weight,
        dimensions_cm: dimensions,
        declared_value: declaredValue,
        requires_signature: def.priority <= 2 || ['registered', 'government_document', 'express'].includes(def.package_type),
        requires_id_verification: ['government_document', 'registered'].includes(def.package_type),
        status: def.status,
        notes: def.reason || null,
        special_instructions: def.priority === 1 ? 'URGENT - Priority delivery' : null,
        created_by: defaultCreator,
        created_at: createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: def.completed ? new Date().toISOString() : null,
        completed_by: def.completed ? (agentIds[i % agentIds.length] || defaultCreator) : null,
      };

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('delivery_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        continue;
      }

      createdOrders.push(order);
      console.log(`Created order ${order.order_number} with status ${def.status}`);

      // Create assignment if needed
      if (def.needs_assignment && agentIds.length > 0) {
        const assignedAgentId = agentIds[i % agentIds.length];
        const assignmentData = {
          order_id: order.id,
          agent_id: assignedAgentId,
          assigned_by: defaultCreator,
          assigned_at: createdAt.toISOString(),
          acknowledged_at: def.status !== 'assigned' ? createdAt.toISOString() : null,
          started_at: ['out_for_delivery', 'delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender'].includes(def.status) ? createdAt.toISOString() : null,
          route_sequence: i + 1,
          notes: null,
        };

        const { data: assignment, error: assignError } = await supabase
          .from('delivery_assignments')
          .insert(assignmentData)
          .select()
          .single();

        if (!assignError && assignment) {
          createdAssignments.push(assignment);
        }
      }

      // Create status logs for completed/failed orders
      if (['delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender'].includes(def.status)) {
        const statusHistory = ['pending_intake', 'ready_for_assignment', 'assigned', 'out_for_delivery', def.status];
        
        for (let j = 0; j < statusHistory.length; j++) {
          const logDate = new Date(createdAt);
          logDate.setHours(logDate.getHours() + j * 2); // 2 hours between each status

          const logData = {
            order_id: order.id,
            previous_status: j > 0 ? statusHistory[j - 1] : null,
            new_status: statusHistory[j],
            changed_by: j < 3 ? defaultCreator : (agentIds[i % agentIds.length] || defaultCreator),
            changed_at: logDate.toISOString(),
            reason: j === statusHistory.length - 1 && def.reason ? def.reason : null,
            notes: null,
          };

          const { error: logError } = await supabase
            .from('delivery_status_logs')
            .insert(logData);

          if (!logError) {
            createdLogs.push(logData);
          }
        }
      }
    }

    console.log(`Seeding complete: ${createdOrders.length} orders, ${createdAssignments.length} assignments, ${createdLogs.length} logs`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdOrders.length} delivery orders, ${createdAssignments.length} assignments, and ${createdLogs.length} status logs`,
        orders: createdOrders.length,
        assignments: createdAssignments.length,
        logs: createdLogs.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error seeding postal orders:', error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
