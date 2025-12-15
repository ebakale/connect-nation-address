import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ImportRow {
  sender_name: string;
  recipient_name: string;
  recipient_address_uac: string;
  recipient_phone?: string;
  recipient_email?: string;
  package_type?: string;
  priority_level?: number;
  cod_amount?: number;
  notes?: string;
}

interface ImportRequest {
  job_id: string;
  rows: ImportRow[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { job_id, rows }: ImportRequest = await req.json();

    console.log(`Processing bulk import job ${job_id} with ${rows.length} rows`);

    // Update job status to processing
    await supabase
      .from("bulk_import_jobs")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", job_id);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!row.sender_name || !row.recipient_name || !row.recipient_address_uac) {
          throw new Error("Missing required fields: sender_name, recipient_name, recipient_address_uac");
        }

        // Validate UAC exists
        const { data: address } = await supabase
          .from("addresses")
          .select("uac")
          .eq("uac", row.recipient_address_uac)
          .maybeSingle();

        if (!address) {
          throw new Error(`Invalid UAC: ${row.recipient_address_uac}`);
        }

        // Create delivery order
        const { data: order, error: orderError } = await supabase
          .from("delivery_orders")
          .insert({
            sender_name: row.sender_name,
            recipient_name: row.recipient_name,
            recipient_address_uac: row.recipient_address_uac,
            recipient_phone: row.recipient_phone,
            recipient_email: row.recipient_email,
            package_type: row.package_type || "letter",
            priority_level: row.priority_level || 3,
            cod_required: !!row.cod_amount,
            cod_amount: row.cod_amount,
            notes: row.notes,
            created_by: job_id, // Use job_id as created_by for bulk imports
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Record success in bulk_import_orders
        await supabase
          .from("bulk_import_orders")
          .insert({
            import_job_id: job_id,
            row_number: rowNumber,
            raw_data: row,
            status: "success",
            order_id: order.id,
            processed_at: new Date().toISOString(),
          });

        successCount++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errorCount++;
        errors.push({ row: rowNumber, error: message });

        // Record failure in bulk_import_orders
        await supabase
          .from("bulk_import_orders")
          .insert({
            import_job_id: job_id,
            row_number: rowNumber,
            raw_data: row,
            status: "error",
            error_message: message,
            processed_at: new Date().toISOString(),
          });
      }

      // Update progress
      await supabase
        .from("bulk_import_jobs")
        .update({
          processed_rows: i + 1,
          success_count: successCount,
          error_count: errorCount,
        })
        .eq("id", job_id);
    }

    // Update job as completed
    await supabase
      .from("bulk_import_jobs")
      .update({
        status: errorCount === rows.length ? "failed" : "completed",
        completed_at: new Date().toISOString(),
        success_count: successCount,
        error_count: errorCount,
        error_summary: errors.length > 0 ? errors : null,
      })
      .eq("id", job_id);

    console.log(`Bulk import completed: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        job_id,
        success_count: successCount,
        error_count: errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Bulk import error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
