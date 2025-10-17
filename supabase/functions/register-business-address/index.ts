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

    // Create NAR address
    const { data: addressData, error: addressError } = await supabaseClient
      .from('addresses')
      .insert({
        uac: uacData,
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        street: requestData.street,
        city: requestData.city,
        region: requestData.region,
        country: requestData.country,
        building: requestData.building || null,
        business_address_type: requestData.businessAddressType,
        verified: false,
        public: requestData.publiclyVisible,
      })
      .select()
      .single();

    if (addressError) {
      console.error('Address creation error:', addressError);
      throw addressError;
    }

    // Create organization address
    const { error: orgError } = await supabaseClient
      .from('organization_addresses')
      .insert({
        address_id: addressData.id,
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
        created_by: user.id,
      });

    if (orgError) {
      console.error('Organization creation error:', orgError);
      throw orgError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        addressId: addressData.id,
        uac: uacData
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
