import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommunicationRequest {
  action?: 'send_message' | 'acknowledge_message' | 'get_messages';
  type?: 'broadcast_alert';
  message_content?: string;
  message_type?: string;
  is_radio_code?: boolean;
  radio_code?: string;
  priority_level?: number;
  priority?: string;
  to_user_id?: string;
  message_id?: string;
  unit_id?: string;
  alert_type?: string;
  subject?: string;
  message?: string;
  recipient_units?: string[];
  sender_type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user has police role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['police_operator', 'police_dispatcher', 'police_supervisor', 'police_admin', 'admin'])

    if (roleError || !userRoles || userRoles.length === 0) {
      console.error('Role verification error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    const { 
      action, 
      type, 
      message_content, 
      message_type, 
      is_radio_code, 
      radio_code, 
      priority_level, 
      priority,
      to_user_id, 
      message_id, 
      unit_id,
      alert_type,
      subject,
      message,
      recipient_units,
      sender_type
    }: CommunicationRequest = requestBody

    // Handle broadcast alert requests
    if (type === 'broadcast_alert') {
      if (!subject || !message || !recipient_units || recipient_units.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Subject, message, and recipient units are required for broadcast alerts' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get unit member information for recipient units
      const { data: unitMembers, error: membersError } = await supabaseClient
        .from('emergency_unit_members')
        .select('officer_id, emergency_units!inner(unit_code)')
        .in('unit_id', recipient_units)

      if (membersError) {
        console.error('Error fetching unit members:', membersError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch unit members' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Convert priority string to number
      const priorityNumber = priority === 'high' ? 1 : priority === 'medium' ? 2 : 3

      // Create broadcast communications for each unit
      const communications = recipient_units.map(unitId => ({
        from_user_id: user.id,
        from_unit_id: null, // Broadcast from dispatch
        message_type: 'broadcast_alert',
        message_content: `[${alert_type?.toUpperCase()}] ${subject}: ${message}`,
        priority_level: priorityNumber,
        metadata: {
          alert_type,
          subject,
          sender_type: sender_type || 'emergency_operator',
          broadcast_timestamp: new Date().toISOString(),
          target_unit_id: unitId
        }
      }))

      // Insert all communications
      const { data: insertedComms, error: insertError } = await supabaseClient
        .from('unit_communications')
        .insert(communications)
        .select()

      if (insertError) {
        console.error('Error inserting broadcast communications:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to send broadcast alert' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create emergency notifications for all unit members
      if (unitMembers && unitMembers.length > 0) {
        const notifications = unitMembers.map(member => ({
          user_id: member.officer_id,
          type: 'broadcast_alert',
          title: `${alert_type?.toUpperCase()} Alert`,
          message: `${subject}: ${message}`,
          priority_level: priorityNumber,
          metadata: {
            alert_type,
            subject,
            sender_id: user.id,
            broadcast_timestamp: new Date().toISOString()
          }
        }))

        const { error: notificationError } = await supabaseClient
          .from('emergency_notifications')
          .insert(notifications)

        if (notificationError) {
          console.warn('Error creating notifications:', notificationError)
          // Don't fail the broadcast if notifications fail
        }
      }

      console.log(`Broadcast alert sent to ${recipient_units.length} units by user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          communications: insertedComms,
          units_notified: recipient_units.length,
          officers_notified: unitMembers?.length || 0,
          message: 'Broadcast alert sent successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'send_message': {
        if (!message_content) {
          return new Response(
            JSON.stringify({ error: 'Message content is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get user's unit information
        let fromUnitId = null;
        if (unit_id) {
          fromUnitId = unit_id;
        } else {
          const { data: unitMembership } = await supabaseClient
            .from('emergency_unit_members')
            .select('unit_id')
            .eq('officer_id', user.id)
            .single();
          
          fromUnitId = unitMembership?.unit_id || null;
        }

        // Insert communication record
        const { data: communication, error: insertError } = await supabaseClient
          .from('unit_communications')
          .insert({
            from_unit_id: fromUnitId,
            from_user_id: user.id,
            to_user_id: to_user_id || null,
            message_type: message_type || 'text',
            message_content,
            is_radio_code: is_radio_code || false,
            radio_code: radio_code || null,
            priority_level: priority_level || 3,
            metadata: {
              sent_from: 'field_unit',
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting communication:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to send message' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send notifications to relevant dispatchers if no specific recipient
        if (!to_user_id) {
          const { data: dispatchers } = await supabaseClient
            .from('user_roles')
            .select('user_id, profiles(full_name, email)')
            .in('role', ['police_dispatcher', 'police_supervisor'])

          // Log the communication for dispatch notification
          console.log(`Communication sent from unit ${fromUnitId} to dispatch: ${message_content}`)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            communication,
            message: 'Message sent successfully' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'acknowledge_message': {
        if (!message_id) {
          return new Response(
            JSON.stringify({ error: 'Message ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // First get the message to check who sent it
        const { data: messageData, error: messageError } = await supabaseClient
          .from('unit_communications')
          .select('from_user_id, message_type, metadata')
          .eq('id', message_id)
          .single()

        if (messageError || !messageData) {
          console.error('Error fetching message:', messageError)
          return new Response(
            JSON.stringify({ error: 'Message not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user is trying to acknowledge their own broadcast alert
        if (messageData.from_user_id === user.id && messageData.message_type === 'broadcast_alert') {
          return new Response(
            JSON.stringify({ error: 'Cannot acknowledge your own broadcast alert' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // For broadcast alerts, only unit members can acknowledge, not dispatchers
        if (messageData.message_type === 'broadcast_alert') {
          // Check if user is a member of a unit (field officer)
          const { data: unitMembership } = await supabaseClient
            .from('emergency_unit_members')
            .select('unit_id')
            .eq('officer_id', user.id)
            .single()

          if (!unitMembership) {
            return new Response(
              JSON.stringify({ error: 'Only unit members can acknowledge broadcast alerts' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else {
          // For regular messages, check if user can acknowledge (dispatchers/supervisors only)
          const canAcknowledge = userRoles.some(role => 
            ['police_dispatcher', 'police_supervisor', 'police_admin', 'admin'].includes(role.role)
          )

          if (!canAcknowledge) {
            return new Response(
              JSON.stringify({ error: 'Only dispatchers and supervisors can acknowledge regular messages' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        const { data: acknowledgment, error: ackError } = await supabaseClient
          .from('unit_communications')
          .update({
            acknowledged: true,
            acknowledged_by: user.id,
            acknowledged_at: new Date().toISOString()
          })
          .eq('id', message_id)
          .select()
          .single()

        if (ackError) {
          console.error('Error acknowledging message:', ackError)
          return new Response(
            JSON.stringify({ error: 'Failed to acknowledge message' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            acknowledgment,
            message: 'Message acknowledged' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_messages': {
        // Get recent communications for the user's unit or all if dispatcher
        const isDispatcher = userRoles.some(role => 
          ['police_dispatcher', 'police_supervisor', 'police_admin', 'admin'].includes(role.role)
        )

        let query = supabaseClient
          .from('unit_communications')
          .select(`
            *,
            profiles!from_user_id(full_name, email),
            emergency_units!from_unit_id(unit_code, unit_name)
          `)
          .order('created_at', { ascending: false })
          .limit(50)

        if (!isDispatcher) {
          // Field officers see messages from their unit, broadcast alerts targeted to their unit, and messages TO their unit
          const { data: unitMembership } = await supabaseClient
            .from('emergency_unit_members')
            .select('unit_id')
            .eq('officer_id', user.id)
            .single()

          if (unitMembership) {
            // Get all unit members for this unit to check for messages directed to them
            const { data: unitMembers } = await supabaseClient
              .from('emergency_unit_members')
              .select('officer_id')
              .eq('unit_id', unitMembership.unit_id)

            const memberIds = unitMembers?.map(m => m.officer_id) || []

            // Build OR conditions safely
            const conditions: string[] = [
              `from_unit_id.eq.${unitMembership.unit_id}`,
              `and(message_type.eq.broadcast_alert,metadata->>target_unit_id.eq.${unitMembership.unit_id})`
            ]

            if (memberIds.length > 0) {
              const inList = memberIds.map(id => `"${id}"`).join(',')
              conditions.push(`to_user_id.in.(${inList})`)
            }

            query = query.or(conditions.join(','))
          }
        }

        const { data: messages, error: fetchError } = await query

        if (fetchError) {
          console.error('Error fetching messages:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch messages' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            messages: messages || [],
            message: 'Messages retrieved successfully' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in unit-communications function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)