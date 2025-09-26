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

    const { operation, userId, data, userData } = await req.json()

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
      ['admin', 'ndaa_admin', 'police_admin'].includes(r.role)
    )

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    switch (operation) {
      case 'createUser':
        // Create user in auth
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true // Auto-confirm email
        })

        if (signUpError) throw signUpError

        // Create profile
        const { error: profileInsertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            full_name: userData.full_name,
            email: userData.email,
            organization: userData.organization,
            phone: userData.phone
          })

        if (profileInsertError) throw profileInsertError

        // Assign role
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: userData.role
          })
          .select('id')
          .single()

        if (roleError) throw roleError

        // Add scope if provided
        if (roleData && userData.scope_type && userData.scope_value) {
          const { error: scopeError } = await supabaseAdmin
            .from('user_role_metadata')
            .insert({
              user_role_id: roleData.id,
              scope_type: userData.scope_type,
              scope_value: userData.scope_value
            })

          if (scopeError) throw scopeError
        }

        result = { 
          success: true, 
          message: 'User created successfully',
          user_id: newUser.user.id
        }
        break

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
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})