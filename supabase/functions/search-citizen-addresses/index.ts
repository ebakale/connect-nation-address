import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  purpose: 'DELIVERY' | 'EMERGENCY_CONTACT' | 'GOVERNMENT_SERVICE' | 'BUSINESS_CONTACT' | 'PERSONAL' | 'OTHER';
  purposeDetails?: string;
  limit?: number;
}

// Extract first IP from x-forwarded-for header (may contain multiple comma-separated IPs)
function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create client with service role for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { query, purpose, purposeDetails, limit = 20 }: SearchRequest = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Search query must be at least 2 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!purpose) {
      return new Response(
        JSON.stringify({ error: 'Search purpose is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Search by ${user.email}: "${query}" for purpose: ${purpose}`);

    // Search for matching persons with privacy-filtered addresses
    const searchPattern = `%${query.trim()}%`;
    
    const { data: results, error: searchError } = await supabase.rpc('search_citizens_with_privacy', {
      p_search_query: searchPattern,
      p_searcher_id: user.id,
      p_limit: limit
    });

    if (searchError) {
      console.error('Search error:', searchError);
      // Fallback to manual search if RPC doesn't exist yet
      
      // Get user's roles to check permissions
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some(r => ['admin', 'registrar'].includes(r.role));
      const isVerifier = userRoles?.some(r => ['verifier', 'car_verifier', 'registrar'].includes(r.role));

      // Search profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
        .limit(limit);

      if (!profiles || profiles.length === 0) {
        // Log empty search
        await supabase.from('address_search_audit').insert({
          searcher_user_id: user.id,
          search_query: query,
          search_purpose: purpose,
          purpose_details: purposeDetails || null,
          results_count: 0,
          ip_address: getClientIp(req),
          user_agent: req.headers.get('user-agent'),
        });

        return new Response(
          JSON.stringify({ results: [], count: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Get person records
      const userIds = profiles.map(p => p.user_id);
      const { data: persons } = await supabase
        .from('person')
        .select('id, auth_user_id, is_protected_class, protection_reason')
        .in('auth_user_id', userIds);

      // Get addresses for these persons
      const personIds = persons?.map(p => p.id) || [];
      const { data: addresses } = await supabase
        .from('citizen_address')
        .select('*, addresses:uac(street, city, region, country, building, latitude, longitude)')
        .in('person_id', personIds)
        .is('effective_to', null);

      // Filter and format results based on privacy
      const formattedResults = profiles.map(profile => {
        const person = persons?.find(p => p.auth_user_id === profile.user_id);
        const personAddresses = addresses?.filter(a => a.person_id === person?.id) || [];
        
        // Filter addresses based on privacy and permissions
        const visibleAddresses = personAddresses.filter(addr => {
          // Protected class: only admins/verifiers can see
          if (person?.is_protected_class && !isAdmin && !isVerifier) {
            return false;
          }

          // Check privacy level
          if (isAdmin || isVerifier) {
            return true; // Can see all
          }

          // For regular users: must be PUBLIC or REGION_ONLY and searchable
          return addr.searchable_by_public && 
                 (addr.privacy_level === 'PUBLIC' || addr.privacy_level === 'REGION_ONLY');
        }).map(addr => {
          const addressData = Array.isArray(addr.addresses) ? addr.addresses[0] : addr.addresses;
          
          // Redact based on privacy level if not admin/verifier
          if (!isAdmin && !isVerifier && addr.privacy_level === 'REGION_ONLY') {
            return {
              uac: addr.uac,
              city: addressData?.city || 'N/A',
              region: addressData?.region || 'N/A',
              country: addressData?.country || 'N/A',
              privacy_level: addr.privacy_level,
              // Don't show full address for REGION_ONLY
            };
          }

          return {
            uac: addr.uac,
            unit_uac: addr.unit_uac,
            street: addressData?.street,
            city: addressData?.city,
            region: addressData?.region,
            country: addressData?.country,
            building: addressData?.building,
            latitude: addressData?.latitude,
            longitude: addressData?.longitude,
            privacy_level: addr.privacy_level,
            status: addr.status,
          };
        });

        return {
          person_id: person?.id,
          full_name: profile.full_name,
          email: isAdmin || isVerifier ? profile.email : null, // Protect email
          is_protected: person?.is_protected_class || false,
          addresses: visibleAddresses,
          address_count: visibleAddresses.length,
        };
      }).filter(r => r.address_count > 0); // Only return results with visible addresses

      // Log the search
      await supabase.from('address_search_audit').insert({
        searcher_user_id: user.id,
        search_query: query,
        search_purpose: purpose,
        purpose_details: purposeDetails || null,
        results_count: formattedResults.length,
        accessed_person_ids: formattedResults.map(r => r.person_id),
        accessed_uacs: formattedResults.flatMap(r => r.addresses.map(a => a.uac)),
        ip_address: getClientIp(req),
        user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({ 
          results: formattedResults,
          count: formattedResults.length,
          purpose: purpose
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Log the search with RPC results
    await supabase.from('address_search_audit').insert({
      searcher_user_id: user.id,
      search_query: query,
      search_purpose: purpose,
      purpose_details: purposeDetails || null,
      results_count: results?.length || 0,
      ip_address: getClientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({ 
        results: results || [],
        count: results?.length || 0,
        purpose: purpose
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
