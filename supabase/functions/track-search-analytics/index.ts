import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchPattern {
  id: string;
  query: string;
  searchType: 'address' | 'uac' | 'coordinates' | 'proximity';
  resultCount: number;
  timestamp: string;
  userLocation?: { lat: number; lng: number };
  successful: boolean;
  executionTime: number;
  filters?: Record<string, any>;
  userAgent?: string;
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { pattern, patterns, quality } = await req.json();

    if (pattern) {
      // Single pattern tracking
      const { error } = await supabase
        .from('search_analytics')
        .insert([{
          query: pattern.query,
          search_type: pattern.searchType,
          result_count: pattern.resultCount,
          timestamp: pattern.timestamp,
          user_location: pattern.userLocation,
          successful: pattern.successful,
          execution_time: pattern.executionTime,
          filters: pattern.filters,
          user_agent: pattern.userAgent,
          session_id: pattern.sessionId
        }]);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (patterns) {
      // Batch pattern sync
      const insertData = patterns.map((p: SearchPattern) => ({
        query: p.query,
        search_type: p.searchType,
        result_count: p.resultCount,
        timestamp: p.timestamp,
        user_location: p.userLocation,
        successful: p.successful,
        execution_time: p.executionTime,
        filters: p.filters,
        user_agent: p.userAgent,
        session_id: p.sessionId
      }));

      const { error } = await supabase
        .from('search_analytics')
        .insert(insertData);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, synced: patterns.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (quality) {
      // Quality feedback tracking
      const { error } = await supabase
        .from('search_quality_feedback')
        .insert([{
          search_id: quality.searchId,
          helpful: quality.helpful,
          result_accuracy: quality.resultAccuracy,
          comments: quality.comments,
          timestamp: quality.timestamp,
          session_id: quality.sessionId
        }]);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});