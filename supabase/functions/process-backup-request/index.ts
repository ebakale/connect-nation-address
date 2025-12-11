import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface BackupRequestPayload {
  incident_id?: string
  requesting_unit?: string
  requesting_unit_code?: string
  requesting_unit_name?: string
  unit_id?: string
  reason: string
  urgency_level?: number
  priority_level?: number
  location?: string
  incident_number?: string
  requested_by_user_id?: string
  backup_type?: string
  additional_units?: number
  medical_support?: boolean
  supervisor_requested?: boolean
  is_officer_down?: boolean
  requested_by_supervisor?: boolean
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

    // Get the user ID from the request headers
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let currentUserId = null
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      currentUserId = user?.id
    }

    const payload = await req.json() as BackupRequestPayload
    
    // Handle both old and new parameter names
    const requesting_unit_code = payload.requesting_unit_code || payload.requesting_unit || ''
    const requesting_unit_name = payload.requesting_unit_name || payload.requesting_unit || ''
    const incident_id = payload.incident_id || null
    const priority_level = payload.priority_level || payload.urgency_level || 2
    const location = payload.location || ''
    const incident_number = payload.incident_number || ''
    const reason = payload.reason || ''
    const is_officer_down = payload.is_officer_down || false
    const backup_type = payload.backup_type || 'general'

    if (!currentUserId && payload.requested_by_user_id) {
      currentUserId = payload.requested_by_user_id
    }

    console.log('Processing backup request:', { 
      incident_id, 
      requesting_unit_code, 
      incident_number, 
      user_id: currentUserId,
      is_officer_down,
      backup_type 
    })

    // For officer down, use maximum priority
    const effectivePriority = is_officer_down ? 0 : priority_level

    // 1. Get incident data if incident_id provided
    let incident = null
    if (incident_id) {
      const { data: incidentData, error: incidentError } = await supabaseClient
        .from('emergency_incidents')
        .select('city, region, assigned_units, incident_number')
        .eq('id', incident_id)
        .single()

      if (!incidentError) {
        incident = incidentData
      }
    }

    // 2. First try to find the unit by unit_code, then by unit_name as fallback
    let requestingUnit = null

    // Try to find by unit_code first
    if (requesting_unit_code) {
      const { data: unitByCode } = await supabaseClient
        .from('emergency_units')
        .select('id, coverage_city, coverage_region')
        .eq('unit_code', requesting_unit_code)
        .maybeSingle()

      if (unitByCode) {
        requestingUnit = unitByCode
      }
    }
    
    if (!requestingUnit && requesting_unit_name) {
      const { data: unitByName } = await supabaseClient
        .from('emergency_units')
        .select('id, coverage_city, coverage_region')
        .eq('unit_name', requesting_unit_name)
        .maybeSingle()
      
      if (unitByName) {
        requestingUnit = unitByName
      }
    }

    // If still no unit, use incident location or default
    if (!requestingUnit && incident) {
      requestingUnit = { coverage_city: incident.city, coverage_region: incident.region }
    }

    // 3. Resolve recipients based on officer_down vs normal backup
    const recipientsMap = new Map<string, any>()

    if (is_officer_down) {
      // OFFICER DOWN: Notify ALL police staff regardless of scope
      const { data: allPoliceStaff } = await supabaseClient
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin'])

      allPoliceStaff?.forEach((u: any) => recipientsMap.set(u.user_id, u))
      console.log('Officer Down - notifying ALL police staff:', allPoliceStaff?.length || 0)
    } else {
      // Normal backup: Notify city-scoped supervisors/dispatchers + all admins
      const { data: supRoles } = await supabaseClient
        .from('user_roles')
        .select('id, user_id, role')
        .in('role', ['police_supervisor', 'police_dispatcher'])

      let cityRoleIds: string[] = []
      if (requestingUnit?.coverage_city) {
        const { data: metaCity } = await supabaseClient
          .from('user_role_metadata')
          .select('user_role_id')
          .eq('scope_type', 'city')
          .eq('scope_value', requestingUnit.coverage_city)

        cityRoleIds = (metaCity || []).map((m: any) => m.user_role_id)
      }

      const cityScopedUsers = (supRoles || []).filter((r: any) => cityRoleIds.includes(r.id))
      cityScopedUsers.forEach((u: any) => recipientsMap.set(u.user_id, u))

      // Include police_admins regardless of scope metadata
      const { data: admins } = await supabaseClient
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'police_admin')

      admins?.forEach((u: any) => recipientsMap.set(u.user_id, u))
    }

    const supervisors = Array.from(recipientsMap.values())
    console.log('Found recipients:', supervisors.length)

    // 4. Create notifications
    const notifications = []
    const notificationTitle = is_officer_down 
      ? `🚨🚨 OFFICER DOWN - ${requesting_unit_code} 🚨🚨`
      : `🚨 BACKUP REQUESTED - ${incident_number || 'N/A'}`

    const notificationMessage = is_officer_down
      ? `⚠️ EMERGENCY: Officer Down / Immediate Assistance Required\n\nUnit: ${requesting_unit_code} (${requesting_unit_name})\n📍 Location: ${location}\n💭 Situation: ${reason}\n\n🚨 ALL AVAILABLE UNITS RESPOND IMMEDIATELY 🚨`
      : `Unit ${requesting_unit_code} (${requesting_unit_name}) has requested backup for ${incident_number || 'current incident'}.\n\n📍 Location: ${location}\n⚠️ Priority: ${effectivePriority}\n💭 Reason: ${reason}\n\nPlease review and assign additional units.`

    if (supervisors && supervisors.length > 0) {
      for (const supervisor of supervisors) {
        notifications.push({
          user_id: supervisor.user_id,
          incident_id: incident_id,
          title: notificationTitle,
          message: notificationMessage,
          type: is_officer_down ? 'officer_down' : 'backup_request',
          priority_level: effectivePriority,
          metadata: {
            requesting_unit: requesting_unit_code,
            requesting_unit_name: requesting_unit_name,
            incident_number: incident_number || incident?.incident_number,
            location: location,
            reason: reason,
            backup_type: backup_type,
            is_officer_down: is_officer_down,
            request_timestamp: new Date().toISOString(),
            requested_by_user_id: currentUserId
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

    // 5. Update incident with backup request flag
    if (incident_id) {
      const updateData: any = {
        backup_requested: true,
        backup_requested_at: new Date().toISOString(),
        backup_requesting_unit: requesting_unit_code,
        backup_request_status: 'pending',
        backup_urgency_level: effectivePriority,
        updated_at: new Date().toISOString()
      }

      if (is_officer_down) {
        updateData.is_officer_down = true
        updateData.officer_down_at = new Date().toISOString()
        updateData.priority_level = 0 // Maximum priority
      }

      const { error: incidentUpdateError } = await supabaseClient
        .from('emergency_incidents')
        .update(updateData)
        .eq('id', incident_id)

      if (incidentUpdateError) {
        console.error('Error updating incident:', incidentUpdateError)
      }
    }

    // 6. Log the backup request
    if (currentUserId && incident_id) {
      const { error: logError } = await supabaseClient
        .from('emergency_incident_logs')
        .insert({
          incident_id: incident_id,
          user_id: currentUserId,
          action: is_officer_down ? 'officer_down_alert' : 'backup_requested',
          details: {
            requesting_unit: requesting_unit_code,
            requesting_unit_name: requesting_unit_name,
            reason: reason,
            priority_level: effectivePriority,
            location: location,
            backup_type: backup_type,
            is_officer_down: is_officer_down,
            notifications_sent: notifications.length,
            original_units: incident?.assigned_units || [],
            timestamp: new Date().toISOString()
          }
        })

      if (logError) {
        console.error('Error logging backup request:', logError)
      }
    }

    console.log(`Backup request processed successfully. Sent ${notifications.length} notifications. Officer Down: ${is_officer_down}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: is_officer_down 
          ? `OFFICER DOWN alert sent to ${notifications.length} personnel`
          : `Backup request sent to ${notifications.length} supervisors/dispatchers`,
        notifications_sent: notifications.length,
        is_officer_down: is_officer_down
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
        message: error instanceof Error ? error.message : String(error)
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