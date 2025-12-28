import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData = await req.json();
    
    console.log('Registering business address for user:', user.id);

    // Prepare organization metadata
    const organizationMetadata = {
      organization_name: requestData.organizationName,
      business_category: requestData.businessCategory,
      business_address_type: requestData.businessAddressType || 'COMMERCIAL',
      business_registration_number: requestData.registrationNumber || null,
      tax_identification_number: requestData.taxId || null,
      primary_contact_name: requestData.primaryContactName || null,
      primary_contact_phone: requestData.primaryContactPhone || null,
      primary_contact_email: requestData.primaryContactEmail || null,
      secondary_contact_phone: requestData.secondaryContactPhone || null,
      website_url: requestData.websiteUrl || null,
      employee_count: requestData.employeeCount || null,
      customer_capacity: requestData.customerCapacity || null,
      parking_available: requestData.parkingAvailable || false,
      parking_capacity: requestData.parkingCapacity || null,
      wheelchair_accessible: requestData.wheelchairAccessible || false,
      is_public_service: requestData.publicService || false,
      appointment_required: requestData.appointmentRequired || false,
      services_offered: requestData.servicesOffered || [],
      languages_spoken: requestData.languagesSpoken || ['Spanish'],
      operating_hours: requestData.operatingHours || null,
      publicly_visible: requestData.publiclyVisible !== false,
      show_on_maps: requestData.showOnMaps !== false,
      show_contact_info: requestData.showContactInfo !== false,
    };

    // Create address request for verification with business data in verification_analysis
    const { data: addressData, error: addressError } = await supabaseClient
      .from('address_requests')
      .insert({
        requester_id: user.id,
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        street: requestData.street,
        city: requestData.city,
        region: requestData.region,
        country: requestData.country,
        building: requestData.building || null,
        address_type: 'business',
        description: requestData.description || null,
        justification: `Business registration for ${organizationMetadata.organization_name}`,
        photo_url: requestData.photoUrl || null,
        status: 'pending',
        verification_analysis: {
          organization: organizationMetadata
        }
      })
      .select()
      .single();

    if (addressError) {
      console.error('Address request creation error:', addressError);
      throw addressError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        requestId: addressData.id,
        status: 'pending',
        message: 'Business address registration submitted for verification'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in register-business-address:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
