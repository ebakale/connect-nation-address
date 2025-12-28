import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requesting user has admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin or supervisor role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    
    const hasPermission = userRoles?.some(r => 
      ["admin", "ndaa_admin", "registrar", "postal_supervisor"].includes(r.role)
    );

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if address already exists
    const { data: existing } = await supabase
      .from("addresses")
      .select("id, uac")
      .eq("uac", "GQ-LI-BAT-FC3778-BH")
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Address already exists",
          address: existing 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the missing address
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        uac: "GQ-LI-BAT-FC3778-BH",
        street: "Carretera Bome",
        city: "Bata",
        region: "Litoral",
        country: "Equatorial Guinea",
        latitude: 1.7875051449999992,
        longitude: 9.733938214999997,
        address_type: "residential",
        verified: true,
        public: false,
        description: "Created from approved address request fc377824-5713-44b9-a2ce-96fb58f77ce9",
        creation_source: "manual"
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Address created successfully",
        address: data 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
