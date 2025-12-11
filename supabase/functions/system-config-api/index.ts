import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user has police_admin or admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      throw rolesError;
    }

    const userRoles = roles?.map(r => r.role) || [];
    const hasAccess = userRoles.includes("police_admin") || userRoles.includes("admin");

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Access denied. Police admin or admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const method = req.method;

    if (method === "GET") {
      // Fetch all configurations
      console.log("Fetching system configurations");
      
      const { data: configs, error: configError } = await supabase
        .from("system_config")
        .select("*")
        .order("category", { ascending: true })
        .order("config_key", { ascending: true });

      if (configError) {
        console.error("Error fetching configs:", configError);
        throw configError;
      }

      // Transform to key-value map grouped by category
      const configMap: Record<string, Record<string, string>> = {};
      configs?.forEach(config => {
        if (!configMap[config.category]) {
          configMap[config.category] = {};
        }
        configMap[config.category][config.config_key] = config.config_value;
      });

      return new Response(JSON.stringify({ configs: configMap, raw: configs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT" || method === "POST") {
      const body = await req.json();
      const { configs } = body;

      if (!configs || typeof configs !== "object") {
        return new Response(
          JSON.stringify({ error: "Invalid configs data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Updating system configurations:", Object.keys(configs));

      // Update configurations using upsert
      const updates = Object.entries(configs).map(([key, value]) => ({
        config_key: key,
        config_value: String(value),
        category: getCategoryForKey(key),
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error: upsertError } = await supabase
          .from("system_config")
          .upsert(update, { onConflict: "config_key" });

        if (upsertError) {
          console.error(`Error updating ${update.config_key}:`, upsertError);
          throw upsertError;
        }
      }

      return new Response(
        JSON.stringify({ success: true, updated: updates.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in system-config-api:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getCategoryForKey(key: string): string {
  const categoryMap: Record<string, string> = {
    system_name: "general",
    system_description: "general",
    default_language: "general",
    timezone: "general",
    default_region: "general",
    emergency_response_time: "emergency",
    priority_levels: "emergency",
    auto_dispatch: "emergency",
    backup_request_threshold: "emergency",
    email_notifications: "notifications",
    sms_notifications: "notifications",
    push_notifications: "notifications",
    notification_retry_count: "notifications",
    session_timeout: "security",
    password_policy: "security",
    two_factor_required: "security",
    encryption_enabled: "security",
    location_accuracy: "location",
    gps_tracking_enabled: "location",
    map_provider: "location",
    api_rate_limit: "api",
    webhook_timeout: "api",
    api_logging_enabled: "api",
    cors_enabled: "api"
  };
  return categoryMap[key] || "general";
}
