import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string
  limit?: number
  includePrivate?: boolean
  region?: string
  city?: string
  coordinates?: {
    lat: number
    lng: number
    radius?: number // in meters
  }
}

interface SearchResponse {
  results: Array<{
    uac: string
    street: string
    city: string
    region: string
    country: string
    building?: string
    latitude: number
    longitude: number
    addressType: string
    verified: boolean
    public: boolean
    completenessScore: number
    distance?: number // in meters if coordinates provided
  }>
  totalCount: number
  searchMetadata: {
    query: string
    searchType: string
    executionTime: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const startTime = performance.now()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { query, limit = 1000, includePrivate = false, region, city, coordinates }: SearchRequest = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Search request:', { query, limit, includePrivate, region, city, coordinates })

    let searchType = 'text'
    let searchResults: any[] = []

    // Always start with text search for the query
    const { data: textSearchData, error: textSearchError } = await supabaseClient
      .rpc('search_addresses_safely', { search_query: query })

    if (textSearchError) {
      throw textSearchError
    }

    searchResults = textSearchData || []

    // If we have coordinates and got results, calculate distances and sort by proximity
    if (coordinates && searchResults.length > 0) {
      searchType = 'text-with-proximity'
      
      searchResults = searchResults
        .map(address => {
          const distance = calculateDistance(
            coordinates.lat, coordinates.lng,
            address.latitude, address.longitude
          )
          return { ...address, distance }
        })
        .sort((a, b) => a.distance - b.distance) // Sort by closest first
        .slice(0, limit)

    } else if (coordinates && searchResults.length === 0) {
      // If no text matches found, fall back to proximity search
      searchType = 'proximity-fallback'
      
      let proximityQuery = supabaseClient
        .from('addresses')
        .select(`
          uac, street, city, region, country, building,
          latitude, longitude, address_type, verified, public, completeness_score
        `)
        .eq('verified', true)

      if (!includePrivate) {
        proximityQuery = proximityQuery.eq('public', true)
      }

      if (region) {
        proximityQuery = proximityQuery.ilike('region', `%${region}%`)
      }

      if (city) {
        proximityQuery = proximityQuery.ilike('city', `%${city}%`)
      }

      const { data: proximityData, error: proximityError } = await proximityQuery
        .limit(limit * 2) // Get more to filter by distance

      if (proximityError) {
        throw proximityError
      }

      // Calculate distances and filter by radius
      const radius = coordinates.radius || 1000 // default 1km radius
      searchResults = (proximityData || [])
        .map(address => {
          const distance = calculateDistance(
            coordinates.lat, coordinates.lng,
            address.latitude, address.longitude
          )
          return { ...address, distance }
        })
        .filter(address => address.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
    } else {
      // Text search only, no coordinates
      searchResults = searchResults.slice(0, limit)
    }

    // Apply additional filters
    let filteredResults = searchResults

    if (region && searchType !== 'proximity') {
      filteredResults = filteredResults.filter(addr => 
        addr.region?.toLowerCase().includes(region.toLowerCase())
      )
    }

    if (city && searchType !== 'proximity') {
      filteredResults = filteredResults.filter(addr => 
        addr.city?.toLowerCase().includes(city.toLowerCase())
      )
    }

    // Format results
    const formattedResults = filteredResults.map(address => ({
      uac: address.uac,
      street: address.street,
      city: address.city,
      region: address.region,
      country: address.country,
      building: address.building,
      latitude: address.latitude,
      longitude: address.longitude,
      addressType: address.address_type,
      verified: address.verified,
      public: address.public,
      completenessScore: address.completeness_score || 0,
      ...(address.distance !== undefined && { distance: Math.round(address.distance) })
    }))

    const executionTime = performance.now() - startTime

    const response: SearchResponse = {
      results: formattedResults,
      totalCount: formattedResults.length,
      searchMetadata: {
        query,
        searchType,
        executionTime: Math.round(executionTime)
      }
    }

    console.log('Search completed:', {
      query,
      resultCount: formattedResults.length,
      executionTime: `${Math.round(executionTime)}ms`
    })

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in address search:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}