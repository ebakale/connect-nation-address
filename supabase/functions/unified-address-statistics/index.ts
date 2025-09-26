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

    // Get NAR addresses count
    const { count: totalNARAddresses } = await supabaseClient
      .from('addresses')
      .select('*', { count: 'exact', head: true })

    // Get CAR addresses count
    const { count: totalCARAddresses } = await supabaseClient
      .from('citizen_address')
      .select('*', { count: 'exact', head: true })

    // Get pending CAR address verifications count (SELF_DECLARED status)
    const { count: pendingCARVerifications } = await supabaseClient
      .from('citizen_address')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SELF_DECLARED')

    // Get pending residency verifications count
    const { count: pendingResidencyVerifications } = await supabaseClient
      .from('residency_ownership_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get published addresses count
    const { count: publishedAddresses } = await supabaseClient
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('public', true)
      .eq('verified', true)

    // Get active users count (users with profiles)
    const { count: activeUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const stats = {
      totalNARAddresses: totalNARAddresses || 0,
      totalCARAddresses: totalCARAddresses || 0,
      pendingCARVerifications: pendingCARVerifications || 0,
      pendingResidencyVerifications: pendingResidencyVerifications || 0,
      publishedAddresses: publishedAddresses || 0,
      activeUsers: activeUsers || 0
    }

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