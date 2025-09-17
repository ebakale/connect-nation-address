import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoverageAnalyticsResponse {
  nationalSummary: {
    totalRegions: number
    totalCities: number
    totalAddresses: number
    verifiedAddresses: number
    publishedAddresses: number
    averageCompleteness: number
    overallCoverage: number
  }
  regionalBreakdown: Array<{
    region: string
    cities: number
    addressesRegistered: number
    addressesVerified: number
    addressesPublished: number
    verificationRate: number
    publicationRate: number
    coveragePercentage: number
    averageCompleteness: number
  }>
  cityBreakdown: Array<{
    region: string
    city: string
    addressesRegistered: number
    addressesVerified: number
    addressesPublished: number
    verificationRate: number
    publicationRate: number
    coveragePercentage: number
    averageCompleteness: number
    lastUpdated: string
  }>
  qualityMetrics: {
    averageCompleteness: number
    lowQualityAddresses: number
    duplicateCount: number
    pendingVerification: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const allowedMethods = ['GET', 'POST']
    if (!allowedMethods.includes(req.method)) {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating coverage analytics...')

    // Refresh coverage analytics using service role
    const { error: refreshError } = await supabaseClient.rpc('calculate_coverage_analytics')
    if (refreshError) {
      console.error('Error refreshing coverage analytics:', refreshError)
      // Continue anyway - we can still return existing data
    }

    // Get coverage analytics data
    const { data: coverageData, error: coverageError } = await supabaseClient
      .from('coverage_analytics')
      .select('*')
      .order('region', { ascending: true })
      .order('city', { ascending: true })

    if (coverageError) {
      throw coverageError
    }

    // Get address statistics for national summary
    const { data: addressStats, error: addressStatsError } = await supabaseClient
      .from('addresses')
      .select('region, city, verified, public, completeness_score')

    if (addressStatsError) {
      throw addressStatsError
    }

    // Get pending requests count
    const { data: pendingRequests, error: pendingError } = await supabaseClient
      .from('address_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingError) {
      console.error('Error getting pending requests:', pendingError)
    }

    // Calculate national summary
    const uniqueRegions = new Set(addressStats?.map(a => a.region) || [])
    const uniqueCities = new Set(addressStats?.map(a => `${a.region}-${a.city}`) || [])
    const totalAddresses = addressStats?.length || 0
    const verifiedAddresses = addressStats?.filter(a => a.verified).length || 0
    const publishedAddresses = addressStats?.filter(a => a.public).length || 0
    const avgCompleteness = addressStats?.length ? 
      (addressStats.reduce((sum, a) => sum + (a.completeness_score || 0), 0) / addressStats.length) : 0

    const nationalSummary = {
      totalRegions: uniqueRegions.size,
      totalCities: uniqueCities.size,
      totalAddresses,
      verifiedAddresses,
      publishedAddresses,
      averageCompleteness: Math.round(avgCompleteness * 100) / 100,
      overallCoverage: totalAddresses > 0 ? Math.round((verifiedAddresses / totalAddresses) * 100 * 100) / 100 : 0
    }

    // Calculate regional breakdown
    const regionMap = new Map()
    addressStats?.forEach(address => {
      const region = address.region
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          cities: new Set(),
          addresses: [],
        })
      }
      regionMap.get(region).cities.add(address.city)
      regionMap.get(region).addresses.push(address)
    })

    const regionalBreakdown = Array.from(regionMap.entries()).map(([region, data]) => {
      const addresses = data.addresses
      const verified = addresses.filter((a: any) => a.verified).length
      const published = addresses.filter((a: any) => a.public).length
      const avgCompleteness = addresses.length ? 
        addresses.reduce((sum: number, a: any) => sum + (a.completeness_score || 0), 0) / addresses.length : 0

      return {
        region,
        cities: data.cities.size,
        addressesRegistered: addresses.length,
        addressesVerified: verified,
        addressesPublished: published,
        verificationRate: addresses.length > 0 ? Math.round((verified / addresses.length) * 100 * 100) / 100 : 0,
        publicationRate: addresses.length > 0 ? Math.round((published / addresses.length) * 100 * 100) / 100 : 0,
        coveragePercentage: 0, // Would need external building data
        averageCompleteness: Math.round(avgCompleteness * 100) / 100
      }
    })

    // Use coverage data for city breakdown
    const cityBreakdown = (coverageData || []).map(city => ({
      region: city.region,
      city: city.city,
      addressesRegistered: city.addresses_registered,
      addressesVerified: city.addresses_verified,
      addressesPublished: city.addresses_published,
      verificationRate: city.verification_rate,
      publicationRate: city.publication_rate,
      coveragePercentage: city.coverage_percentage,
      averageCompleteness: addressStats?.filter(a => a.region === city.region && a.city === city.city)
        .reduce((sum, a) => sum + (a.completeness_score || 0), 0) / 
        Math.max(1, addressStats?.filter(a => a.region === city.region && a.city === city.city).length || 1),
      lastUpdated: city.last_updated
    }))

    // Calculate quality metrics
    const lowQualityAddresses = addressStats?.filter(a => (a.completeness_score || 0) < 60).length || 0
    
    const qualityMetrics = {
      averageCompleteness: Math.round(avgCompleteness * 100) / 100,
      lowQualityAddresses,
      duplicateCount: 0, // Would need duplicate detection analysis
      pendingVerification: pendingRequests?.count || 0
    }

    const response: CoverageAnalyticsResponse = {
      nationalSummary,
      regionalBreakdown,
      cityBreakdown,
      qualityMetrics
    }

    console.log('Coverage analytics generated:', {
      regions: nationalSummary.totalRegions,
      cities: nationalSummary.totalCities,
      addresses: nationalSummary.totalAddresses
    })

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in coverage analytics:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})