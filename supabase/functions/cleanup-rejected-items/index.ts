import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting rejected items cleanup job...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results = {
      archived_requests: { archived: 0, deleted: 0 },
      archived_citizen_addresses: { archived: 0, deleted: 0 },
      archived_verifications: { archived: 0, deleted: 0 },
      anonymized: { requests: 0, addresses: 0, verifications: 0 },
      errors: [] as string[],
    }

    // Step 1: Archive old rejected NAR requests (6+ months)
    console.log('Archiving old rejected NAR requests...')
    const { data: requestsResult, error: requestsError } = await supabase
      .rpc('archive_old_rejected_requests')
    
    if (requestsError) {
      console.error('Error archiving rejected requests:', requestsError)
      results.errors.push(`NAR requests: ${requestsError.message}`)
    } else if (requestsResult) {
      results.archived_requests = {
        archived: requestsResult.archived || 0,
        deleted: requestsResult.deleted || 0,
      }
      console.log(`Archived ${results.archived_requests.archived} NAR requests`)
    }

    // Step 2: Archive old rejected CAR addresses (6+ months)
    console.log('Archiving old rejected CAR addresses...')
    const { data: addressesResult, error: addressesError } = await supabase
      .rpc('archive_old_rejected_citizen_addresses')
    
    if (addressesError) {
      console.error('Error archiving rejected CAR addresses:', addressesError)
      results.errors.push(`CAR addresses: ${addressesError.message}`)
    } else if (addressesResult) {
      results.archived_citizen_addresses = {
        archived: addressesResult.archived || 0,
        deleted: addressesResult.deleted || 0,
      }
      console.log(`Archived ${results.archived_citizen_addresses.archived} CAR addresses`)
    }

    // Step 3: Archive old rejected verifications (6+ months)
    console.log('Archiving old rejected verifications...')
    const { data: verificationsResult, error: verificationsError } = await supabase
      .rpc('archive_old_rejected_verifications')
    
    if (verificationsError) {
      console.error('Error archiving rejected verifications:', verificationsError)
      results.errors.push(`Verifications: ${verificationsError.message}`)
    } else if (verificationsResult) {
      results.archived_verifications = {
        archived: verificationsResult.archived || 0,
        deleted: verificationsResult.deleted || 0,
      }
      console.log(`Archived ${results.archived_verifications.archived} verifications`)
    }

    // Step 4: Anonymize old archived records (24+ months)
    console.log('Anonymizing old archived records...')
    const { data: anonymizeResult, error: anonymizeError } = await supabase
      .rpc('anonymize_archived_records')
    
    if (anonymizeError) {
      console.error('Error anonymizing records:', anonymizeError)
      results.errors.push(`Anonymization: ${anonymizeError.message}`)
    } else if (anonymizeResult) {
      results.anonymized = {
        requests: anonymizeResult.requests_anonymized || 0,
        addresses: anonymizeResult.addresses_anonymized || 0,
        verifications: anonymizeResult.verifications_anonymized || 0,
      }
      console.log(`Anonymized ${results.anonymized.requests + results.anonymized.addresses + results.anonymized.verifications} total records`)
    }

    // Step 5: Log the cleanup operation
    const totalArchived = 
      results.archived_requests.archived + 
      results.archived_citizen_addresses.archived + 
      results.archived_verifications.archived
    
    const totalAnonymized = 
      results.anonymized.requests + 
      results.anonymized.addresses + 
      results.anonymized.verifications

    const { error: logError } = await supabase
      .from('cleanup_audit_log')
      .insert({
        cleanup_type: 'monthly_rejected_items_cleanup',
        records_archived: totalArchived,
        records_anonymized: totalAnonymized,
        records_deleted: results.archived_requests.deleted + 
          results.archived_citizen_addresses.deleted + 
          results.archived_verifications.deleted,
        details: results,
        executed_by: 'cron_job',
      })

    if (logError) {
      console.error('Error logging cleanup operation:', logError)
    }

    console.log('Cleanup job completed successfully')
    console.log('Results:', JSON.stringify(results, null, 2))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rejected items cleanup completed',
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup job failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})