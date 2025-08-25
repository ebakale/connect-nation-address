import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommunicationRequest {
  action: 'send_message' | 'acknowledge_message' | 'get_messages';
  message_content?: string;
  message_type?: string;
  is_radio_code?: boolean;
  radio_code?: string;
  priority_level?: number;
  to_user_id?: string;
  message_id?: string;
  unit_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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

    const { action, message_content, message_type, is_radio_code, radio_code, priority_level, to_user_id, message_id, unit_id }: CommunicationRequest = await req.json()

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

        // Check if user can acknowledge (dispatchers/supervisors only)
        const canAcknowledge = userRoles.some(role => 
          ['police_dispatcher', 'police_supervisor', 'police_admin', 'admin'].includes(role.role)
        )

        if (!canAcknowledge) {
          return new Response(
            JSON.stringify({ error: 'Only dispatchers and supervisors can acknowledge messages' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
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
          // Field officers only see messages from their unit
          const { data: unitMembership } = await supabaseClient
            .from('emergency_unit_members')
            .select('unit_id')
            .eq('officer_id', user.id)
            .single()

          if (unitMembership) {
            query = query.eq('from_unit_id', unitMembership.unit_id)
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