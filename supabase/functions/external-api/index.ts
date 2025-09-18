import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface AddressSearchParams {
  query?: string;
  uac?: string;
  coordinates?: { latitude: number; longitude: number; radius?: number };
  filters?: {
    country?: string;
    region?: string;
    city?: string;
    verified?: boolean;
    public?: boolean;
  };
  limit?: number;
  page?: number;
}

interface AddressCreateParams {
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  address_type?: string;
  description?: string;
  photo_url?: string;
  justification: string;
}

const API_MASTER_KEY = Deno.env.get('API_MASTER_KEY');

function validateAPIKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === API_MASTER_KEY;
}

function createResponse(data: APIResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate API key
  if (!validateAPIKey(req)) {
    return createResponse({
      success: false,
      error: 'Invalid or missing API key'
    }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const endpoint = pathSegments[pathSegments.length - 1]; // Last segment after /functions/external-api
    const method = req.method;

    console.log(`API Request: ${method} ${endpoint}`, { url: url.pathname });

    // Route handling
    if (endpoint === 'addresses' || endpoint === 'external-api') {
      if (method === 'GET') {
        return await handleAddressSearch(req, supabase);
      } else if (method === 'POST') {
        return await handleAddressCreate(req, supabase);
      }
    }

    if (endpoint === 'address-lookup') {
      return await handleAddressLookup(req, supabase);
    }

    if (endpoint === 'address-validate') {
      return await handleAddressValidate(req, supabase);
    }

    if (endpoint === 'address-verify') {
      return await handleAddressVerify(req, supabase);
    }

    if (endpoint === 'analytics') {
      return await handleAnalytics(req, supabase);
    }

    return createResponse({
      success: false,
      error: 'Endpoint not found'
    }, 404);

  } catch (error) {
    console.error('API Error:', error);
    return createResponse({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
});

async function handleAddressSearch(req: Request, supabase: any): Promise<Response> {
  const url = new URL(req.url);
  const searchParams: AddressSearchParams = {
    query: url.searchParams.get('query') || undefined,
    uac: url.searchParams.get('uac') || undefined,
    limit: parseInt(url.searchParams.get('limit') || '50'),
    page: parseInt(url.searchParams.get('page') || '1'),
  };

  // Parse coordinates
  const lat = url.searchParams.get('latitude');
  const lng = url.searchParams.get('longitude');
  const radius = url.searchParams.get('radius');
  if (lat && lng) {
    searchParams.coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: radius ? parseFloat(radius) : undefined
    };
  }

  // Parse filters
  searchParams.filters = {
    country: url.searchParams.get('country') || undefined,
    region: url.searchParams.get('region') || undefined,
    city: url.searchParams.get('city') || undefined,
    verified: url.searchParams.get('verified') ? url.searchParams.get('verified') === 'true' : undefined,
    public: url.searchParams.get('public') ? url.searchParams.get('public') === 'true' : undefined,
  };

  try {
    let query = supabase
      .from('addresses')
      .select(`
        uac,
        country,
        region,
        city,
        street,
        building,
        latitude,
        longitude,
        address_type,
        description,
        verified,
        public,
        created_at,
        completeness_score
      `)
      .eq('verified', true);

    // Apply filters
    if (searchParams.filters?.country) {
      query = query.eq('country', searchParams.filters.country);
    }
    if (searchParams.filters?.region) {
      query = query.eq('region', searchParams.filters.region);
    }
    if (searchParams.filters?.city) {
      query = query.eq('city', searchParams.filters.city);
    }
    if (searchParams.filters?.public !== undefined) {
      query = query.eq('public', searchParams.filters.public);
    }

    // Handle search by UAC or text
    if (searchParams.uac) {
      query = query.eq('uac', searchParams.uac.toUpperCase());
    } else if (searchParams.query) {
      query = query.or(`street.ilike.%${searchParams.query}%,city.ilike.%${searchParams.query}%,building.ilike.%${searchParams.query}%`);
    }

    // Apply pagination
    const offset = (searchParams.page! - 1) * searchParams.limit!;
    query = query.range(offset, offset + searchParams.limit! - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      return createResponse({
        success: false,
        error: 'Search failed'
      }, 500);
    }

    return createResponse({
      success: true,
      data: data || [],
      meta: {
        total: count || 0,
        page: searchParams.page,
        limit: searchParams.limit
      }
    });

  } catch (error) {
    console.error('Address search error:', error);
    return createResponse({
      success: false,
      error: 'Search operation failed'
    }, 500);
  }
}

async function handleAddressCreate(req: Request, supabase: any): Promise<Response> {
  try {
    const body: AddressCreateParams = await req.json();

    // Validate required fields
    const requiredFields = ['latitude', 'longitude', 'street', 'city', 'region', 'country', 'justification'];
    for (const field of requiredFields) {
      if (!body[field as keyof AddressCreateParams]) {
        return createResponse({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }

    // Create address request (external systems create requests, not direct addresses)
    const { data, error } = await supabase
      .from('address_requests')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user for API requests
        latitude: body.latitude,
        longitude: body.longitude,
        street: body.street,
        city: body.city,
        region: body.region,
        country: body.country,
        building: body.building,
        address_type: body.address_type || 'residential',
        description: body.description,
        photo_url: body.photo_url,
        justification: `External API: ${body.justification}`,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Address creation error:', error);
      return createResponse({
        success: false,
        error: 'Failed to create address request'
      }, 500);
    }

      return createResponse({
        success: true,
        data: {
          request_id: data,
          status: 'pending',
          message: 'NAR address creation request submitted successfully. It will be reviewed by authorities.'
        }
      }, 201);

  } catch (error) {
    console.error('Address create error:', error);
    return createResponse({
      success: false,
      error: 'Invalid request body'
    }, 400);
  }
}

async function handleAddressLookup(req: Request, supabase: any): Promise<Response> {
  const url = new URL(req.url);
  const uac = url.searchParams.get('uac');

  if (!uac) {
    return createResponse({
      success: false,
      error: 'UAC parameter is required'
    }, 400);
  }

  try {
    const { data, error } = await supabase
      .from('addresses')
      .select(`
        uac,
        country,
        region,
        city,
        street,
        building,
        latitude,
        longitude,
        address_type,
        description,
        verified,
        public,
        created_at
      `)
      .eq('uac', uac.toUpperCase())
      .eq('verified', true)
      .single();

    if (error || !data) {
      return createResponse({
        success: false,
        error: 'Address not found'
      }, 404);
    }

    return createResponse({
      success: true,
      data
    });

  } catch (error) {
    console.error('Address lookup error:', error);
    return createResponse({
      success: false,
      error: 'Lookup operation failed'
    }, 500);
  }
}

async function handleAddressValidate(req: Request, supabase: any): Promise<Response> {
  try {
    const body = await req.json();
    const { latitude, longitude, street, city, region, country } = body;

    if (!latitude || !longitude || !street || !city || !region || !country) {
      return createResponse({
        success: false,
        error: 'Missing required fields for validation'
      }, 400);
    }

    // Call the validation API function
    const { data, error } = await supabase.functions.invoke('address-validation-api', {
      body: {
        latitude,
        longitude,
        street,
        city,
        region,
        country
      }
    });

    if (error) {
      console.error('Validation error:', error);
      return createResponse({
        success: false,
        error: 'Validation failed'
      }, 500);
    }

    return createResponse({
      success: true,
      data
    });

  } catch (error) {
    console.error('Address validate error:', error);
    return createResponse({
      success: false,
      error: 'Invalid request body'
    }, 400);
  }
}

async function handleAddressVerify(req: Request, supabase: any): Promise<Response> {
  try {
    const body = await req.json();
    const { request_id, action, notes } = body;

    if (!request_id || !action) {
      return createResponse({
        success: false,
        error: 'Missing required fields: request_id, action'
      }, 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return createResponse({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      }, 400);
    }

    if (action === 'approve') {
      const { data, error } = await supabase.rpc('approve_nar_address_creation', {
        p_request_id: request_id,
        p_approved_by: '00000000-0000-0000-0000-000000000000' // System user
      });

      if (error) {
        console.error('Approval error:', error);
        return createResponse({
          success: false,
          error: 'Failed to approve NAR address creation request'
        }, 500);
      }

      if (!data?.success) {
        return createResponse({
          success: false,
          error: data?.error || 'Approval failed'
        }, 400);
      }

      return createResponse({
        success: true,
        data: {
          action: 'approved',
          address_id: data.address_id,
          uac: data.uac,
          message: 'NAR address creation approved successfully'
        }
      });
    } else {
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: request_id,
        p_rejection_reason: 'External API rejection',
        p_rejection_notes: notes || 'Rejected via external API',
        p_rejected_by: '00000000-0000-0000-0000-000000000000' // System user
      });

      if (error) {
        console.error('Rejection error:', error);
        return createResponse({
          success: false,
          error: 'Failed to reject address request'
        }, 500);
      }

      return createResponse({
        success: true,
        data: {
          action: 'rejected',
          message: 'Address request rejected successfully'
        }
      });
    }

  } catch (error) {
    console.error('Address verify error:', error);
    return createResponse({
      success: false,
      error: 'Invalid request body'
    }, 400);
  }
}

async function handleAnalytics(req: Request, supabase: any): Promise<Response> {
  try {
    const { data, error } = await supabase.functions.invoke('coverage-analytics-api');

    if (error) {
      console.error('Analytics error:', error);
      return createResponse({
        success: false,
        error: 'Failed to retrieve analytics'
      }, 500);
    }

    return createResponse({
      success: true,
      data
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return createResponse({
      success: false,
      error: 'Analytics operation failed'
    }, 500);
  }
}