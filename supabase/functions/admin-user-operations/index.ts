import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { operation, userId, data } = await req.json()

    // Verify the requesting user has admin access
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
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
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    switch (operation) {
      case 'updateUser':
        // Update user in auth
        if (data.password) {
          const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: data.password }
          )
          if (passwordError) throw passwordError
        }

        if (data.email) {
          const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { email: data.email }
          )
          if (emailError) throw emailError
        }

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: data.full_name,
            email: data.email,
            organization: data.organization,
            phone: data.phone
          })
          .eq('user_id', userId)

        if (profileError) throw profileError
        
        result = { success: true, message: 'User updated successfully' }
        break

      case 'deleteUser':
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        
        result = { success: true, message: 'User deleted successfully' }
        break

      default:
        throw new Error('Invalid operation')
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin operation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})