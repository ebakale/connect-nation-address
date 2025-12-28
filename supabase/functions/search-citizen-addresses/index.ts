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
    
    // Get user's roles to check permissions
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => ['admin', 'registrar', 'car_admin'].includes(r.role));
    const isVerifier = userRoles?.some(r => ['verifier', 'car_verifier', 'car_admin', 'registrar'].includes(r.role));
    const isPostalStaff = userRoles?.some(r => ['postal_clerk', 'postal_dispatcher', 'postal_supervisor', 'postal_agent'].includes(r.role));
    
    // Postal staff can access private addresses for delivery purposes
    const canAccessForDelivery = isPostalStaff && purpose === 'DELIVERY';

    // ========== SEARCH PROFILES (Account Holders) ==========
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(limit);

    // ========== SEARCH HOUSEHOLD DEPENDENTS ==========
    const { data: dependents } = await supabase
      .from('household_dependents')
      .select(`
        id, 
        full_name, 
        dependent_type, 
        relationship_to_guardian,
        guardian_person_id,
        guardian_user_id,
        is_active,
        date_of_birth,
        claimed_own_account
      `)
      .ilike('full_name', searchPattern)
      .eq('is_active', true)
      .eq('claimed_own_account', false) // Only search dependents who haven't claimed their own account
      .limit(limit);

    console.log(`Found ${profiles?.length || 0} profiles and ${dependents?.length || 0} dependents`);

    // ========== GET GUARDIAN INFO FOR DEPENDENTS ==========
    const guardianUserIds = dependents?.map(d => d.guardian_user_id).filter(Boolean) || [];
    const { data: guardianProfiles } = guardianUserIds.length > 0 
      ? await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', guardianUserIds)
      : { data: [] };

    const guardianMap = new Map(guardianProfiles?.map(g => [g.user_id, g.full_name]) || []);

    // ========== GET PERSON RECORDS FOR PROFILES ==========
    const userIds = profiles?.map(p => p.user_id) || [];
    const { data: persons } = userIds.length > 0
      ? await supabase
          .from('person')
          .select('id, auth_user_id, is_protected_class, protection_reason')
          .in('auth_user_id', userIds)
      : { data: [] };

    // ========== GET GUARDIAN PERSONS FOR DEPENDENTS ==========
    const guardianPersonIds = dependents?.map(d => d.guardian_person_id).filter(Boolean) || [];
    const { data: guardianPersons } = guardianPersonIds.length > 0
      ? await supabase
          .from('person')
          .select('id, auth_user_id, is_protected_class')
          .in('id', guardianPersonIds)
      : { data: [] };

    // ========== GET CITIZEN ADDRESSES FOR PROFILES ==========
    const personIds = persons?.map(p => p.id) || [];
    const { data: profileAddresses } = personIds.length > 0
      ? await supabase
          .from('citizen_address')
          .select('*')
          .in('person_id', personIds)
          .is('effective_to', null)
      : { data: [] };

    // ========== GET CITIZEN ADDRESSES FOR DEPENDENTS ==========
    const dependentIds = dependents?.map(d => d.id) || [];
    const { data: dependentAddresses } = dependentIds.length > 0
      ? await supabase
          .from('citizen_address')
          .select('*')
          .in('dependent_id', dependentIds)
          .is('effective_to', null)
      : { data: [] };

    // ========== GET GUARDIAN ADDRESSES FOR DEPENDENTS WITHOUT DIRECT ADDRESSES ==========
    // This is critical: when a dependent has no direct addresses, we need guardian's addresses
    const dependentsWithoutAddresses = (dependents || []).filter(
      d => !dependentAddresses?.some(a => a.dependent_id === d.id) && d.guardian_person_id
    );
    const guardianPersonIdsForAddresses = dependentsWithoutAddresses.map(d => d.guardian_person_id).filter(Boolean);
    
    const { data: guardianAddressesForDependents } = guardianPersonIdsForAddresses.length > 0
      ? await supabase
          .from('citizen_address')
          .select('*')
          .in('person_id', guardianPersonIdsForAddresses)
          .is('effective_to', null)
      : { data: [] };

    console.log(`Found ${dependentsWithoutAddresses.length} dependents without direct addresses, fetched ${guardianAddressesForDependents?.length || 0} guardian addresses`);

    // Combine all UACs for address details lookup
    const allUacs = [
      ...(profileAddresses?.map(ca => ca.uac) || []),
      ...(dependentAddresses?.map(ca => ca.uac) || []),
      ...(guardianAddressesForDependents?.map(ca => ca.uac) || [])
    ].filter(Boolean);

    // ========== GET ADDRESS DETAILS ==========
    const { data: addressDetails } = allUacs.length > 0
      ? await supabase
          .from('addresses')
          .select('uac, street, city, region, country, building, latitude, longitude')
          .in('uac', allUacs)
      : { data: [] };
    
    const addressMap = new Map(addressDetails?.map(a => [a.uac, a]) || []);

    // ========== FORMAT PROFILE RESULTS ==========
    const profileResults = (profiles || []).map(profile => {
      const person = persons?.find(p => p.auth_user_id === profile.user_id);
      const personAddresses = profileAddresses?.filter(a => a.person_id === person?.id) || [];
      
      // Filter addresses based on privacy and permissions
      const visibleAddresses = personAddresses.filter(addr => {
        // Protected class: only admins/verifiers can see
        if (person?.is_protected_class && !isAdmin && !isVerifier) {
          return false;
        }

        // Check privacy level - admins, verifiers, and postal staff for delivery can see all
        if (isAdmin || isVerifier || canAccessForDelivery) {
          return true; // Can see all addresses
        }

        // For regular users: must be PUBLIC or REGION_ONLY and searchable
        return addr.searchable_by_public && 
               (addr.privacy_level === 'PUBLIC' || addr.privacy_level === 'REGION_ONLY');
      }).map(addr => {
        const addressData = addressMap.get(addr.uac);
        
        // Redact based on privacy level if not admin/verifier/postal
        if (!isAdmin && !isVerifier && !canAccessForDelivery && addr.privacy_level === 'REGION_ONLY') {
          return {
            uac: addr.uac,
            city: addressData?.city || 'N/A',
            region: addressData?.region || 'N/A',
            country: addressData?.country || 'N/A',
            privacy_level: addr.privacy_level,
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
        email: isAdmin || isVerifier ? profile.email : null,
        is_protected: person?.is_protected_class || false,
        is_dependent: false,
        addresses: visibleAddresses,
        address_count: visibleAddresses.length,
      };
    }).filter(r => r.address_count > 0);

    // ========== FORMAT DEPENDENT RESULTS ==========
    // Build guardian address map for dependents without direct addresses
    const guardianAddressMap = new Map<string, typeof profileAddresses>();
    for (const dependent of dependents || []) {
      const depAddrs = dependentAddresses?.filter(a => a.dependent_id === dependent.id) || [];
      if (depAddrs.length === 0 && dependent.guardian_person_id) {
        // First try from pre-fetched guardian addresses for dependents
        let guardianAddrs = guardianAddressesForDependents?.filter(a => a.person_id === dependent.guardian_person_id) || [];
        // Fallback to profileAddresses if guardian was also in profile search results
        if (guardianAddrs.length === 0) {
          guardianAddrs = profileAddresses?.filter(a => a.person_id === dependent.guardian_person_id) || [];
        }
        if (guardianAddrs.length > 0) {
          guardianAddressMap.set(dependent.id, guardianAddrs);
        }
      }
    }

    const dependentResults = (dependents || []).map(dependent => {
      const guardianPerson = guardianPersons?.find(p => p.id === dependent.guardian_person_id);
      let depAddresses = dependentAddresses?.filter(a => a.dependent_id === dependent.id) || [];
      
      // If dependent has no direct addresses, use guardian's addresses
      const usingGuardianAddresses = depAddresses.length === 0 && guardianAddressMap.has(dependent.id);
      if (usingGuardianAddresses) {
        depAddresses = guardianAddressMap.get(dependent.id) || [];
      }
      
      // Filter addresses based on privacy and permissions
      const visibleAddresses = depAddresses.filter(addr => {
        // Protected class check via guardian
        if (guardianPerson?.is_protected_class && !isAdmin && !isVerifier) {
          return false;
        }

        // Admins, verifiers, and postal staff for delivery can see all
        if (isAdmin || isVerifier || canAccessForDelivery) {
          return true;
        }

        return addr.searchable_by_public && 
               (addr.privacy_level === 'PUBLIC' || addr.privacy_level === 'REGION_ONLY');
      }).map(addr => {
        const addressData = addressMap.get(addr.uac);
        
        if (!isAdmin && !isVerifier && !canAccessForDelivery && addr.privacy_level === 'REGION_ONLY') {
          return {
            uac: addr.uac,
            city: addressData?.city || 'N/A',
            region: addressData?.region || 'N/A',
            country: addressData?.country || 'N/A',
            privacy_level: addr.privacy_level,
            inherited_from_guardian: usingGuardianAddresses,
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
          inherited_from_guardian: usingGuardianAddresses,
        };
      });

      const guardianName = guardianMap.get(dependent.guardian_user_id) || null;

      return {
        person_id: null,
        dependent_id: dependent.id,
        full_name: dependent.full_name,
        email: null,
        is_protected: guardianPerson?.is_protected_class || false,
        is_dependent: true,
        dependent_type: dependent.dependent_type,
        relationship_to_guardian: dependent.relationship_to_guardian,
        guardian_name: guardianName,
        addresses: visibleAddresses,
        address_count: visibleAddresses.length,
        uses_guardian_address: usingGuardianAddresses,
      };
    }).filter(r => r.address_count > 0);

    // ========== COMBINE RESULTS ==========
    const formattedResults = [...profileResults, ...dependentResults];

    // Log the search
    await supabase.from('address_search_audit').insert({
      searcher_user_id: user.id,
      search_query: query,
      search_purpose: purpose,
      purpose_details: purposeDetails || null,
      results_count: formattedResults.length,
      accessed_person_ids: formattedResults.filter(r => r.person_id).map(r => r.person_id),
      accessed_uacs: formattedResults.flatMap(r => r.addresses.map(a => a.uac)),
      ip_address: getClientIp(req),
      user_agent: req.headers.get('user-agent'),
      metadata: {
        profile_results: profileResults.length,
        dependent_results: dependentResults.length,
      }
    });

    console.log(`Returning ${formattedResults.length} results (${profileResults.length} profiles, ${dependentResults.length} dependents)`);

    return new Response(
      JSON.stringify({ 
        results: formattedResults,
        count: formattedResults.length,
        purpose: purpose
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
