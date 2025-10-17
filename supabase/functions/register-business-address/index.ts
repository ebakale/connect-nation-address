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

    // Generate UAC for the address
    const { data: uacData, error: uacError } = await supabaseClient
      .rpc('generate_unified_uac_unique', {
        p_country: requestData.country,
        p_region: requestData.region,
        p_city: requestData.city,
        p_address_id: crypto.randomUUID()
      });

    if (uacError) {
      console.error('UAC generation error:', uacError);
      throw new Error('Failed to generate UAC');
    }

    // Create address request for verification
    const { data: addressData, error: addressError } = await supabaseClient
      .from('address_requests')
      .insert({
        uac: uacData,
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        street_name: requestData.street,
        province: requestData.region,
        country: requestData.country,
        building_name: requestData.building || null,
        address_type: 'business',
        requested_by: user.id,
        status: 'pending',
        metadata: {
          businessAddressType: requestData.businessAddressType,
          publiclyVisible: requestData.publiclyVisible,
        }
      })
      .select()
      .single();

    if (addressError) {
      console.error('Address request creation error:', addressError);
      throw addressError;
    }

    // Store organization details in metadata for now
    // Will be inserted into organization_addresses table upon approval
    const organizationMetadata = {
      organization_name: requestData.organizationName,
      business_category: requestData.businessCategory,
      business_registration_number: requestData.registrationNumber || null,
      tax_identification_number: requestData.taxId || null,
      primary_contact_name: requestData.primaryContactName || null,
      primary_contact_phone: requestData.primaryContactPhone || null,
      primary_contact_email: requestData.primaryContactEmail || null,
      secondary_contact_phone: requestData.secondaryContactPhone || null,
      website_url: requestData.websiteUrl || null,
      employee_count: requestData.employeeCount || null,
      customer_capacity: requestData.customerCapacity || null,
      parking_available: requestData.parkingAvailable,
      parking_capacity: requestData.parkingCapacity || null,
      wheelchair_accessible: requestData.wheelchairAccessible,
      is_public_service: requestData.publicService,
      appointment_required: requestData.appointmentRequired,
      services_offered: requestData.servicesOffered || null,
      languages_spoken: requestData.languagesSpoken || ['Spanish'],
      publicly_visible: requestData.publiclyVisible,
      show_on_maps: requestData.showOnMaps,
      show_contact_info: requestData.showContactInfo,
    };

    // Update the address request with organization metadata
    const { error: metadataError } = await supabaseClient
      .from('address_requests')
      .update({ 
        metadata: {
          ...addressData.metadata,
          organization: organizationMetadata
        }
      })
      .eq('id', addressData.id);

    if (metadataError) {
      console.error('Metadata update error:', metadataError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        requestId: addressData.id,
        uac: uacData,
        status: 'pending',
        message: 'Business address registration submitted for verification'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-business-address:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
