import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body for geographic scope filtering
    let scopeType: string | null = null
    let scopeValue: string | null = null

    if (req.method === 'POST') {
      try {
        const body = await req.json()
        scopeType = body.scope_type || null
        scopeValue = body.scope_value || null
        console.log('Geographic scope filter:', { scopeType, scopeValue })
      } catch {
        // No body or invalid JSON, continue without scope filtering
      }
    }

    // Helper to apply geographic scope to addresses table queries
    const applyAddressScope = (query: any) => {
      if (!scopeType || !scopeValue) return query
      
      if (scopeType === 'city') {
        return query.ilike('city', scopeValue)
      } else if (scopeType === 'region' || scopeType === 'province') {
        return query.ilike('region', scopeValue)
      } else if (scopeType === 'geographic') {
        return query.or(`city.ilike.${scopeValue},region.ilike.${scopeValue}`)
      }
      return query
    }

    // Get NAR addresses count (with scope filtering)
    let narQuery = supabaseClient
      .from('addresses')
      .select('*', { count: 'exact', head: true })
    narQuery = applyAddressScope(narQuery)
    const { count: totalNARAddresses } = await narQuery

    // Get CAR addresses count - need to join with addresses for location filtering
    let carCount = 0
    if (scopeType && scopeValue) {
      // When scope filtering is needed, get UACs from filtered addresses first
      let addressUacsQuery = supabaseClient
        .from('addresses')
        .select('uac')
      addressUacsQuery = applyAddressScope(addressUacsQuery)
      const { data: scopedAddresses } = await addressUacsQuery
      
      if (scopedAddresses && scopedAddresses.length > 0) {
        const uacs = scopedAddresses.map(a => a.uac)
        const { count } = await supabaseClient
          .from('citizen_address')
          .select('*', { count: 'exact', head: true })
          .in('uac', uacs)
        carCount = count || 0
      }
    } else {
      const { count } = await supabaseClient
        .from('citizen_address')
        .select('*', { count: 'exact', head: true })
      carCount = count || 0
    }

    // Get pending CAR address verifications count (SELF_DECLARED status)
    let pendingCarCount = 0
    if (scopeType && scopeValue) {
      let addressUacsQuery = supabaseClient
        .from('addresses')
        .select('uac')
      addressUacsQuery = applyAddressScope(addressUacsQuery)
      const { data: scopedAddresses } = await addressUacsQuery
      
      if (scopedAddresses && scopedAddresses.length > 0) {
        const uacs = scopedAddresses.map(a => a.uac)
        const { count } = await supabaseClient
          .from('citizen_address')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'SELF_DECLARED')
          .in('uac', uacs)
        pendingCarCount = count || 0
      }
    } else {
      const { count } = await supabaseClient
        .from('citizen_address')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SELF_DECLARED')
      pendingCarCount = count || 0
    }

    // Get pending residency verifications count - join with addresses via UAC
    let pendingResidencyCount = 0
    if (scopeType && scopeValue) {
      let addressUacsQuery = supabaseClient
        .from('addresses')
        .select('uac')
      addressUacsQuery = applyAddressScope(addressUacsQuery)
      const { data: scopedAddresses } = await addressUacsQuery
      
      if (scopedAddresses && scopedAddresses.length > 0) {
        const uacs = scopedAddresses.map(a => a.uac)
        const { count } = await supabaseClient
          .from('residency_ownership_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .in('uac', uacs)
        pendingResidencyCount = count || 0
      }
    } else {
      const { count } = await supabaseClient
        .from('residency_ownership_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      pendingResidencyCount = count || 0
    }

    // Get published addresses count (with scope filtering)
    let publishedQuery = supabaseClient
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('public', true)
      .eq('verified', true)
    publishedQuery = applyAddressScope(publishedQuery)
    const { count: publishedAddresses } = await publishedQuery

    // Get active users count (users with profiles) - no geographic filtering for users
    const { count: activeUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const stats = {
      totalNARAddresses: totalNARAddresses || 0,
      totalCARAddresses: carCount,
      pendingCARVerifications: pendingCarCount,
      pendingResidencyVerifications: pendingResidencyCount,
      publishedAddresses: publishedAddresses || 0,
      activeUsers: activeUsers || 0,
      scopeApplied: !!(scopeType && scopeValue),
      scopeType,
      scopeValue
    }

    console.log('Returning statistics:', stats)

    return new Response(
      JSON.stringify(stats),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})