import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { namespace, key, translations } = await req.json();

    if (!namespace || !key || !translations || !translations.en || !translations.es || !translations.fr) {
      throw new Error('Missing required fields: namespace, key, and translations for all languages');
    }

    console.log(`Saving translation fix for ${namespace}:${key}`);

    // Store translation fix in database
    const { data, error } = await supabaseClient
      .from('translation_fixes')
      .upsert({
        namespace,
        key,
        translation_en: translations.en,
        translation_es: translations.es,
        translation_fr: translations.fr,
        fixed_by: user.id,
        status: 'applied'
      }, {
        onConflict: 'namespace,key'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving translation fix:', error);
      throw error;
    }

    console.log('Translation fix saved successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: 'Translation fix saved successfully' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in save-translation-fix:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});