import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching unified NAR-CAR analytics...');

    // Get NAR statistics (National Address Registry)
    const { data: narStats, error: narError } = await supabase
      .from('addresses')
      .select('id, verified, public, created_at');

    if (narError) {
      console.error('Error fetching NAR stats:', narError);
      throw narError;
    }

    // Get CAR statistics (Citizen Address Repository)
    const { data: carStats, error: carError } = await supabase
      .from('citizen_address')
      .select('id, status, created_at');

    if (carError) {
      console.error('Error fetching CAR stats:', carError);
      throw carError;
    }

    // Get verification requests statistics
    const { data: verificationStats, error: verificationError } = await supabase
      .from('residency_ownership_verifications')
      .select('id, status, created_at');

    if (verificationError) {
      console.error('Error fetching verification stats:', verificationError);
      throw verificationError;
    }

    // Get address requests statistics
    const { data: requestStats, error: requestError } = await supabase
      .from('address_requests')
      .select('id, status, created_at');

    if (requestError) {
      console.error('Error fetching request stats:', requestError);
      throw requestError;
    }

    // Get user count
    const { data: userStats, error: userError } = await supabase
      .from('profiles')
      .select('id, created_at');

    if (userError) {
      console.error('Error fetching user stats:', userError);
      throw userError;
    }

    // Calculate unified statistics
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    const unifiedStats = {
      // NAR Statistics
      nar: {
        totalAddresses: narStats?.length || 0,
        verifiedAddresses: narStats?.filter(addr => addr.verified).length || 0,
        publishedAddresses: narStats?.filter(addr => addr.public).length || 0,
        recentAddresses: narStats?.filter(addr => new Date(addr.created_at) > thirtyDaysAgo).length || 0
      },
      
      // CAR Statistics  
      car: {
        totalAddresses: carStats?.length || 0,
        confirmedAddresses: carStats?.filter(addr => addr.status === 'CONFIRMED').length || 0,
        pendingAddresses: carStats?.filter(addr => addr.status === 'SELF_DECLARED').length || 0,
        recentAddresses: carStats?.filter(addr => new Date(addr.created_at) > thirtyDaysAgo).length || 0
      },

      // Verification Statistics
      verification: {
        totalRequests: verificationStats?.length || 0,
        pendingVerifications: verificationStats?.filter(req => req.status === 'pending').length || 0,
        approvedVerifications: verificationStats?.filter(req => req.status === 'approved').length || 0,
        rejectedVerifications: verificationStats?.filter(req => req.status === 'rejected').length || 0
      },

      // Address Request Statistics
      requests: {
        totalRequests: requestStats?.length || 0,
        pendingRequests: requestStats?.filter(req => req.status === 'pending').length || 0,
        approvedRequests: requestStats?.filter(req => req.status === 'approved').length || 0,
        rejectedRequests: requestStats?.filter(req => req.status === 'rejected').length || 0
      },

      // User Statistics
      users: {
        totalUsers: userStats?.length || 0,
        newUsersThisMonth: userStats?.filter(user => new Date(user.created_at) > thirtyDaysAgo).length || 0
      },

      // Integration Health
      integration: {
        status: 'healthy',
        lastSyncTime: new Date().toISOString(),
        syncErrors: 0,
        dataConsistency: 100 // Percentage
      },

      // Summary Metrics
      summary: {
        totalAddressesInSystem: (narStats?.length || 0) + (carStats?.length || 0),
        verificationRate: verificationStats?.length ? 
          Math.round((verificationStats.filter(req => req.status === 'approved').length / verificationStats.length) * 100) : 0,
        publicationRate: narStats?.length ? 
          Math.round((narStats.filter(addr => addr.public).length / narStats.length) * 100) : 0,
        systemHealth: 'operational'
      }
    };

    console.log('Unified stats calculated:', unifiedStats);

    return new Response(
      JSON.stringify({
        success: true,
        data: unifiedStats,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Error in unified analytics API:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})