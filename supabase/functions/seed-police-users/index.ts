import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the requesting user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Check if user has admin or police_admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'police_admin'])
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    console.log('Creating police users...');

    const policeUsers = [
      {
        email: 'police.operator1@police.gq',
        password: 'Police123!',
        role: 'police_operator' as const,
        full_name: 'Carlos Mendez',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.operator2@police.gq',
        password: 'Police123!',
        role: 'police_operator' as const,
        full_name: 'Maria Santos',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.operator3@police.gq',
        password: 'Police123!',
        role: 'police_operator' as const,
        full_name: 'Jose Nguema',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.operator4@police.gq',
        password: 'Police123!',
        role: 'police_operator' as const,
        full_name: 'Ana Obiang',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.dispatcher1@police.gq',
        password: 'Police123!',
        role: 'police_dispatcher' as const,
        full_name: 'Roberto Silva',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.dispatcher2@police.gq',
        password: 'Police123!',
        role: 'police_dispatcher' as const,
        full_name: 'Elena Morales',
        organization: 'Policía Nacional'
      },
      {
        email: 'police.supervisor1@police.gq',
        password: 'Police123!',
        role: 'police_supervisor' as const,
        full_name: 'Captain Miguel Torres',
        organization: 'Policía Nacional'
      }
    ];

    const createdUsers = [];

    for (const userData of policeUsers) {
      try {
        // Create auth user
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (createError) {
          console.error(`Error creating user ${userData.email}:`, createError);
          continue;
        }

        if (authUser.user) {
          // Create profile
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: authUser.user.id,
              email: userData.email,
              full_name: userData.full_name,
              organization: userData.organization
            });

          if (profileError) {
            console.error(`Error creating profile for ${userData.email}:`, profileError);
          }

          // Create user role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authUser.user.id,
              role: userData.role
            });

          if (roleError) {
            console.error(`Error creating role for ${userData.email}:`, roleError);
          }

          createdUsers.push({
            id: authUser.user.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.full_name
          });

          console.log(`Created user: ${userData.email} with role: ${userData.role}`);
        }
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdUsers.length} police users`,
        users: createdUsers
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in seed-police-users function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});