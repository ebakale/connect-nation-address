import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequestPayload {
  incident_id: string
  requesting_unit_code: string
  requesting_unit_name: string
  reason: string
  priority_level: number
  location: string
  incident_number: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { incident_id, requesting_unit_code, requesting_unit_name, reason, priority_level, location, incident_number } = await req.json() as BackupRequestPayload

    console.log('Processing backup request:', { incident_id, requesting_unit_code, incident_number })

    // 1. First try to find the unit by unit_code, then by unit_name as fallback
    let requestingUnit = null
    let unitError = null

    // Try to find by unit_code first
    const { data: unitByCode, error: codeError } = await supabaseClient
      .from('emergency_units')
      .select('coverage_city, coverage_region')
      .eq('unit_code', requesting_unit_code)
      .maybeSingle()

    if (unitByCode) {
      requestingUnit = unitByCode
    } else {
      // If not found by code, try by unit_name
      const { data: unitByName, error: nameError } = await supabaseClient
        .from('emergency_units')
        .select('coverage_city, coverage_region')
        .eq('unit_name', requesting_unit_name)
        .maybeSingle()
      
      if (unitByName) {
        requestingUnit = unitByName
      } else {
        console.error('Error fetching requesting unit by code:', codeError)
        console.error('Error fetching requesting unit by name:', nameError)
        console.log('Tried unit_code:', requesting_unit_code, 'and unit_name:', requesting_unit_name)
        
        // If we still can't find the unit, get the incident's city directly
        const { data: incidentData, error: incidentError } = await supabaseClient
          .from('emergency_incidents')
          .select('city, region')
          .eq('id', incident_id)
          .maybeSingle()
        
        if (incidentData) {
          requestingUnit = { coverage_city: incidentData.city, coverage_region: incidentData.region }
          console.log('Using incident location as fallback:', incidentData)
        } else {
          console.error('Error fetching incident location:', incidentError)
          throw new Error('Could not determine location for backup request')
        }
      }
    }

    // 2. Resolve recipients: supervisors/dispatchers scoped to the same city, plus police_admins
    const recipientsMap = new Map<string, any>()

    // Fetch supervisors/dispatchers (all), then filter by city via role metadata
    const { data: supRoles, error: supErr } = await supabaseClient
      .from('user_roles')
      .select('id, user_id, role')
      .in('role', ['police_supervisor', 'police_dispatcher'])

    if (supErr) {
      console.error('Error fetching supervisor roles:', supErr)
    }

    let cityRoleIds: string[] = []
    if (requestingUnit.coverage_city) {
      const { data: metaCity, error: metaErr } = await supabaseClient
        .from('user_role_metadata')
        .select('user_role_id')
        .eq('scope_type', 'city')
        .eq('scope_value', requestingUnit.coverage_city)

      if (metaErr) {
        console.error('Error fetching role metadata (city):', metaErr)
      } else {
        cityRoleIds = (metaCity || []).map((m: any) => m.user_role_id)
      }
    }

    const cityScopedUsers = (supRoles || []).filter((r: any) => cityRoleIds.includes(r.id))
    cityScopedUsers.forEach((u: any) => recipientsMap.set(u.user_id, u))

    // Include police_admins regardless of scope metadata
    const { data: admins, error: adminErr } = await supabaseClient
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'police_admin')

    if (adminErr) console.error('Error fetching police admins:', adminErr)
    admins?.forEach((u: any) => recipientsMap.set(u.user_id, u))

    const supervisors = Array.from(recipientsMap.values())

    console.log('Found recipients (supervisors/dispatchers/admins):', supervisors.length)

    // 3. Create notifications for each supervisor/dispatcher
    const notifications = []
    if (supervisors && supervisors.length > 0) {
      for (const supervisor of supervisors) {
        notifications.push({
          user_id: supervisor.user_id,
          incident_id: incident_id,
          title: `🚨 BACKUP REQUESTED - ${incident_number}`,
          message: `Unit ${requesting_unit_code} (${requesting_unit_name}) has requested immediate backup for ${incident_number}.\n\n📍 Location: ${location}\n⚠️ Priority: ${priority_level}\n💭 Reason: ${reason}\n\nPlease assign additional units to assist.`,
          type: 'backup_request',
          priority_level: priority_level,
          metadata: {
            requesting_unit: requesting_unit_code,
            requesting_unit_name: requesting_unit_name,
            incident_number: incident_number,
            location: location,
            reason: reason,
            request_timestamp: new Date().toISOString()
          }
        })
      }

      const { error: notificationError } = await supabaseClient
        .from('emergency_notifications')
        .insert(notifications)

      if (notificationError) {
        console.error('Error creating notifications:', notificationError)
        throw new Error('Failed to create notifications')
      }
    }

    // 4. Update incident with backup request flag
    const { error: incidentUpdateError } = await supabaseClient
      .from('emergency_incidents')
      .update({
        backup_requested: true,
        backup_requested_at: new Date().toISOString(),
        backup_requesting_unit: requesting_unit_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', incident_id)

    if (incidentUpdateError) {
      console.error('Error updating incident:', incidentUpdateError)
      // Don't throw here as notifications were successful
    }

    // 5. Log the backup request
    const { error: logError } = await supabaseClient
      .from('emergency_incident_logs')
      .insert({
        incident_id: incident_id,
        user_id: 'system',
        action: 'backup_requested',
        details: {
          requesting_unit: requesting_unit_code,
          requesting_unit_name: requesting_unit_name,
          reason: reason,
          priority_level: priority_level,
          location: location,
          notifications_sent: notifications.length,
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      console.error('Error logging backup request:', logError)
    }

    console.log(`Backup request processed successfully. Sent ${notifications.length} notifications.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Backup request sent to ${notifications.length} supervisors/dispatchers`,
        notifications_sent: notifications.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing backup request:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process backup request',
        message: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})