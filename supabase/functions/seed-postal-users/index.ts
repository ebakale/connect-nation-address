import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const postalUsers = [
  {
    email: 'postal.supervisor@gov.gq',
    password: 'PostalSuper2024!',
    full_name: 'María García',
    role: 'postal_supervisor',
    organization: 'Government Postal Services'
  },
  {
    email: 'postal.dispatcher@gov.gq',
    password: 'PostalDispatch2024!',
    full_name: 'Carlos Mendez',
    role: 'postal_dispatcher',
    organization: 'Government Postal Services'
  },
  {
    email: 'postal.clerk@gov.gq',
    password: 'PostalClerk2024!',
    full_name: 'Ana López',
    role: 'postal_clerk',
    organization: 'Government Postal Services'
  },
  {
    email: 'postal.agent1@gov.gq',
    password: 'PostalAgent2024!',
    full_name: 'Pedro Santos',
    role: 'postal_agent',
    organization: 'Government Postal Services'
  },
  {
    email: 'postal.agent2@gov.gq',
    password: 'PostalAgent2024!',
    full_name: 'Luis Obiang',
    role: 'postal_agent',
    organization: 'Government Postal Services'
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting postal users seed...')
    
    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user has admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    
    const hasAdminRole = userRoles?.some(r => 
      ['admin', 'ndaa_admin'].includes(r.role)
    )

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: { email: string; success: boolean; error?: string; user_id?: string }[] = []

    for (const userData of postalUsers) {
      try {
        console.log(`Creating user: ${userData.email}`)
        
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === userData.email)
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`)
          results.push({ 
            email: userData.email, 
            success: true, 
            user_id: existingUser.id,
            error: 'User already exists'
          })
          continue
        }

        // Create user in auth
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        })

        if (signUpError) {
          console.error(`Error creating user ${userData.email}:`, signUpError)
          results.push({ email: userData.email, success: false, error: signUpError.message })
          continue
        }

        if (!newUser.user) {
          results.push({ email: userData.email, success: false, error: 'User creation failed - no user returned' })
          continue
        }

        console.log(`User created: ${userData.email} with ID: ${newUser.user.id}`)

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            full_name: userData.full_name,
            email: userData.email,
            organization: userData.organization,
            phone: ''
          })

        if (profileError) {
          console.error(`Error creating profile for ${userData.email}:`, profileError)
        }

        // Assign role
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: userData.role
          })
          .select('id')
          .single()

        if (roleError) {
          console.error(`Error assigning role for ${userData.email}:`, roleError)
          results.push({ email: userData.email, success: false, error: roleError.message })
          continue
        }

        // Add geographic scope for dispatcher and supervisor
        if ((userData.role === 'postal_dispatcher' || userData.role === 'postal_supervisor') && roleData) {
          const { error: scopeError } = await supabaseAdmin
            .from('user_role_metadata')
            .insert({
              user_role_id: roleData.id,
              scope_type: 'region',
              scope_value: 'Litoral'
            })

          if (scopeError) {
            console.error(`Error adding scope for ${userData.email}:`, scopeError)
          }
        }

        console.log(`Successfully created postal user: ${userData.email}`)
        results.push({ email: userData.email, success: true, user_id: newUser.user.id })

      } catch (userError) {
        console.error(`Error processing user ${userData.email}:`, userError)
        results.push({ 
          email: userData.email, 
          success: false, 
          error: userError instanceof Error ? userError.message : String(userError)
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Seed complete: ${successCount}/${postalUsers.length} users created successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${successCount} postal users`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Seed postal users error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
