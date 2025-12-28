import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting dependent address backfill...');

    // Get all active dependents
    const { data: dependents, error: dependentsError } = await supabase
      .from('household_dependents')
      .select('id, guardian_person_id, full_name')
      .eq('is_active', true)
      .eq('claimed_own_account', false);

    if (dependentsError) {
      console.error('Error fetching dependents:', dependentsError);
      throw dependentsError;
    }

    console.log(`Found ${dependents?.length || 0} active dependents`);

    let processed = 0;
    let alreadyHasAddress = 0;
    let assigned = 0;
    let noGuardianAddress = 0;
    let errors = 0;

    for (const dependent of dependents || []) {
      try {
        // Check if dependent already has an address
        const { data: existingAddress } = await supabase
          .from('citizen_address')
          .select('id')
          .eq('dependent_id', dependent.id)
          .maybeSingle();

        if (existingAddress) {
          console.log(`Dependent ${dependent.full_name} already has an address, skipping`);
          alreadyHasAddress++;
          processed++;
          continue;
        }

        // Get guardian's primary address
        const { data: guardianAddress, error: guardianAddressError } = await supabase
          .from('citizen_address')
          .select('*')
          .eq('person_id', dependent.guardian_person_id)
          .eq('address_kind', 'PRIMARY')
          .is('effective_to', null)
          .maybeSingle();

        if (guardianAddressError) {
          console.error(`Error fetching guardian address for ${dependent.full_name}:`, guardianAddressError);
          errors++;
          processed++;
          continue;
        }

        if (!guardianAddress) {
          console.log(`No guardian primary address found for dependent ${dependent.full_name}`);
          noGuardianAddress++;
          processed++;
          continue;
        }

        // Get guardian's user_id for created_by field
        const { data: guardianPerson } = await supabase
          .from('person')
          .select('auth_user_id')
          .eq('id', dependent.guardian_person_id)
          .single();

        // Assign guardian's address to dependent
        const { error: insertError } = await supabase
          .from('citizen_address')
          .insert({
            dependent_id: dependent.id,
            declared_by_guardian: true,
            guardian_person_id: dependent.guardian_person_id,
            address_kind: 'PRIMARY',
            scope: guardianAddress.scope,
            uac: guardianAddress.uac,
            unit_uac: guardianAddress.unit_uac || null,
            source: 'GUARDIAN_DECLARED',
            effective_from: new Date().toISOString().split('T')[0],
            status: 'SELF_DECLARED',
            created_by: guardianPerson?.auth_user_id || null
          });

        if (insertError) {
          console.error(`Error assigning address to ${dependent.full_name}:`, insertError);
          errors++;
        } else {
          console.log(`Successfully assigned address to ${dependent.full_name}`);
          assigned++;
        }

        processed++;
      } catch (error) {
        console.error(`Error processing dependent ${dependent.full_name}:`, error);
        errors++;
        processed++;
      }
    }

    const summary = {
      total_dependents: dependents?.length || 0,
      processed,
      already_has_address: alreadyHasAddress,
      addresses_assigned: assigned,
      no_guardian_address: noGuardianAddress,
      errors,
      timestamp: new Date().toISOString()
    };

    console.log('Backfill complete:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dependent address backfill completed',
        summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
