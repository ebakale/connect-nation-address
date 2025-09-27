import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get auth user from the incoming JWT
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined

    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized: missing token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = userData.user.id

    // Check role (registrar, verifier, admin)
    const { data: roles, error: rolesErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (rolesErr) {
      console.error('role check error', rolesErr)
      return new Response(JSON.stringify({ error: 'Failed to verify role' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const roleSet = new Set((roles || []).map((r: any) => r.role))
    const isStaff = roleSet.has('admin') || roleSet.has('registrar') || roleSet.has('verifier')

    if (!isStaff) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Optional filter from body
    let body: any = {}
    try { body = await req.json() } catch (_) {}
    const view = body?.view as string | undefined

    // Build queries
    const baseSelect = `id, latitude, longitude, street, city, region, country, building, address_type, description, photo_url, flag_reason, flagged_at, status, justification, flagged, requires_manual_review, created_at`

    const [pendingRes, flaggedRes, manualRes] = await Promise.all([
      supabase.from('address_requests').select(baseSelect).eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
      supabase.from('address_requests').select(baseSelect).eq('flagged', true).order('flagged_at', { ascending: false }).limit(100),
      supabase.from('address_requests').select(baseSelect).eq('requires_manual_review', true).order('created_at', { ascending: false }).limit(100)
    ])

    const resp = {
      pending: {
        count: pendingRes.count ?? (pendingRes.data?.length || 0),
        items: pendingRes.data || []
      },
      flagged: {
        count: flaggedRes.count ?? (flaggedRes.data?.length || 0),
        items: flaggedRes.data || []
      },
      manualReview: {
        count: manualRes.count ?? (manualRes.data?.length || 0),
        items: manualRes.data || []
      }
    }

    // Allow simple view filtering (optional)
    if (view === 'flagged') {
      return new Response(JSON.stringify(resp.flagged), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (view === 'manual_review') {
      return new Response(JSON.stringify(resp.manualReview), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (view === 'pending') {
      return new Response(JSON.stringify(resp.pending), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('admin-address-requests error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
