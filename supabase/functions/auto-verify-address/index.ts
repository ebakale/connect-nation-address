import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { requestId, mode = 'single', requestIds } = await req.json();

    if (mode === 'batch') {
      return await processBatchVerification(supabase, requestIds);
    } else {
      return await processSingleVerification(supabase, requestId);
    }
  } catch (error) {
    console.error('Error in auto-verify function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processSingleVerification(supabase: any, requestId: string) {
  // Get the address request
  const { data: request, error: fetchError } = await supabase
    .from('address_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'pending')
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!request) {
    return new Response(
      JSON.stringify({ error: 'Request not found or not pending' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const analysis = await analyzeAddressRequest(supabase, request);
  const decision = determineVerificationDecision(analysis);

  // Update the request with analysis
  const { error: updateError } = await supabase
    .from('address_requests')
    .update({
      auto_verification_score: analysis.overallScore,
      auto_verification_analysis: analysis,
      auto_verified_at: new Date().toISOString(),
      requires_manual_review: decision.requiresManualReview
    })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // If auto-approved, create the address
  if (decision.action === 'approve') {
    const { error: approveError } = await supabase.rpc('approve_address_request', {
      p_request_id: requestId
    });
    if (approveError) throw approveError;
  } else if (decision.action === 'flag') {
    // Flag the address request for manual review
    const { error: flagError } = await supabase
      .from('address_requests')
      .update({
        flagged: true,
        flag_reason: decision.reasoning,
        flagged_at: new Date().toISOString(),
        status: 'flagged'
      })
      .eq('id', requestId);
    if (flagError) throw flagError;
  }

  return new Response(
    JSON.stringify({
      requestId,
      analysis,
      decision,
      action: decision.action
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processBatchVerification(supabase: any, requestIds?: string[]) {
  let query = supabase
    .from('address_requests')
    .select('*')
    .eq('status', 'pending')
    .is('auto_verified_at', null);

  if (requestIds && requestIds.length > 0) {
    query = query.in('id', requestIds);
  } else {
    query = query.limit(10);
  }

  const { data: requests, error: fetchError } = await query;

  if (fetchError) throw fetchError;

  const results = [];
  let approved = 0;
  let flagged = 0;
  let manualReview = 0;

  for (const request of requests || []) {
    try {
      const analysis = await analyzeAddressRequest(supabase, request);
      const decision = determineVerificationDecision(analysis);

      // Update the request
      await supabase
        .from('address_requests')
        .update({
          auto_verification_score: analysis.overallScore,
          auto_verification_analysis: analysis,
          auto_verified_at: new Date().toISOString(),
          requires_manual_review: decision.requiresManualReview
        })
        .eq('id', request.id);

      // Auto-approve if decision is approve
      if (decision.action === 'approve') {
        await supabase.rpc('approve_address_request', {
          p_request_id: request.id
        });
        approved++;
      } else if (decision.action === 'flag') {
        // Flag the address request for manual review
        await supabase
          .from('address_requests')
          .update({
            flagged: true,
            flag_reason: decision.reasoning,
            flagged_at: new Date().toISOString(),
            status: 'flagged'
          })
          .eq('id', request.id);
        flagged++;
      } else {
        manualReview++;
      }

      results.push({
        requestId: request.id,
        action: decision.action,
        score: analysis.overallScore
      });
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({
      processed: results.length,
      approved,
      flagged,
      manualReview,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeAddressRequest(supabase: any, request: any) {
  // First check for duplicates
  const { data: duplicateCheck, error: dupError } = await supabase
    .rpc('check_address_duplicates', {
      p_latitude: request.latitude,
      p_longitude: request.longitude,
      p_street: request.street,
      p_city: request.city,
      p_region: request.region,
      p_country: request.country
    });

  if (!openAIApiKey) {
    // Fallback analysis without AI
    return createBasicAnalysis(request, duplicateCheck);
  }

  const prompt = `Analyze this address request for verification:

Address Details:
- Street: ${request.street}
- City: ${request.city}
- Region: ${request.region}
- Country: ${request.country}
- Building: ${request.building || 'Not specified'}
- Coordinates: ${request.latitude}, ${request.longitude}
- Address Type: ${request.address_type}
- Description: ${request.description || 'Not provided'}
- Justification: ${request.justification}

Duplicate Check Results:
${duplicateCheck ? `
- Has Duplicates: ${duplicateCheck.has_duplicates}
- Coordinate Matches: ${duplicateCheck.coordinate_duplicates?.count || 0}
- Address Matches: ${duplicateCheck.address_duplicates?.count || 0}
- Details: ${JSON.stringify(duplicateCheck, null, 2)}
` : 'No duplicate check performed'}

Analyze for:
1. Coordinate validity (realistic for the location)
2. Address completeness and consistency
3. Geographic accuracy
4. Potential fraud indicators
5. Data quality
6. Duplicate address concerns

Provide a JSON response with:
- overallScore (0-100)
- coordinateValidity (0-100)
- addressConsistency (0-100)
- completeness (0-100)
- fraudRisk (0-100, where 100 is highest risk)
- recommendations (array of strings)
- reasoning (brief explanation)

Only respond with valid JSON.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert address verification system. Analyze address requests and provide verification scores.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1000
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const analysis = JSON.parse(content);
    
    // Add timestamp and request metadata
    analysis.analyzedAt = new Date().toISOString();
    analysis.method = 'ai_analysis';
    analysis.duplicateCheck = duplicateCheck;
    
    return analysis;
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    return createBasicAnalysis(request, duplicateCheck);
  }
}

function createBasicAnalysis(request: any, duplicateCheck?: any) {
  let score = 70; // Base score
  const recommendations = [];

  // Check coordinate validity (basic range check)
  if (request.latitude < -90 || request.latitude > 90 || 
      request.longitude < -180 || request.longitude > 180) {
    score -= 30;
    recommendations.push('Invalid coordinate range detected');
  }

  // Check address completeness
  if (!request.street || !request.city || !request.region || !request.country) {
    score -= 20;
    recommendations.push('Incomplete address information');
  }

  // Check for description and justification
  if (!request.description && !request.justification) {
    score -= 10;
    recommendations.push('Missing description or justification');
  }

  // Check for duplicates
  if (duplicateCheck?.has_duplicates) {
    score -= 25;
    if (duplicateCheck.coordinate_duplicates?.count > 0) {
      recommendations.push(`Found ${duplicateCheck.coordinate_duplicates.count} addresses with similar coordinates`);
    }
    if (duplicateCheck.address_duplicates?.count > 0) {
      recommendations.push(`Found ${duplicateCheck.address_duplicates.count} addresses with identical street address`);
    }
  }

  return {
    overallScore: Math.max(0, score),
    coordinateValidity: request.latitude && request.longitude ? 85 : 20,
    addressConsistency: request.street && request.city ? 80 : 50,
    completeness: (request.street && request.city && request.region) ? 90 : 60,
    fraudRisk: 20, // Low default risk
    recommendations,
    reasoning: 'Basic rule-based analysis (AI analysis unavailable)',
    analyzedAt: new Date().toISOString(),
    method: 'basic_rules',
    duplicateCheck
  };
}

function determineVerificationDecision(analysis: any) {
  const score = analysis.overallScore;
  const fraudRisk = analysis.fraudRisk || 0;
  const hasDuplicates = analysis.duplicateCheck?.has_duplicates || false;

  // If duplicates found, require manual review
  if (hasDuplicates) {
    return {
      action: 'manual_review',
      requiresManualReview: true,
      confidence: 'high',
      reasoning: 'Potential duplicate addresses detected - manual review required'
    };
  }

  if (score >= 85 && fraudRisk < 30) {
    return {
      action: 'approve',
      requiresManualReview: false,
      confidence: 'high',
      reasoning: 'High quality request with low fraud risk'
    };
  } else if (score < 50 || fraudRisk > 70) {
    return {
      action: 'flag',
      requiresManualReview: true,
      confidence: 'high',
      reasoning: 'Low quality or high fraud risk detected'
    };
  } else {
    return {
      action: 'manual_review',
      requiresManualReview: true,
      confidence: 'medium',
      reasoning: 'Requires human verification'
    };
  }
}