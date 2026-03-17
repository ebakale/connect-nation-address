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
    radius?: number
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
    distance?: number
  }>
  totalCount: number
  searchMetadata: {
    query: string
    searchType: string
    executionTime: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const startTime = performance.now()

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Authentication: optional ---
    const authHeader = req.headers.get('Authorization')
    let supabaseClient
    let isAuthenticated = false

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT
      const candidateClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const token = authHeader.replace('Bearer ', '')
      const { data: claimsData, error: claimsError } = await candidateClient.auth.getClaims(token)
      if (!claimsError && claimsData?.claims) {
        supabaseClient = candidateClient
        isAuthenticated = true
      }
    }

    // Fallback: unauthenticated anon client
    if (!supabaseClient) {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
    }

    const { query, limit, includePrivate: rawIncludePrivate = false, region, city, coordinates }: SearchRequest = await req.json()

    // Unauthenticated users can only search public addresses
    const includePrivate = isAuthenticated ? rawIncludePrivate : false

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Input validation
    if (query.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Query too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Search request:', { query, limit, includePrivate, region, city, coordinates })

    let searchType = 'text'
    let searchResults: any[] = []

    const { data: textSearchData, error: textSearchError } = await supabaseClient
      .rpc('search_addresses_safely', { search_query: query })

    if (textSearchError) {
      throw textSearchError
    }

    searchResults = textSearchData || []

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
        .sort((a, b) => a.distance - b.distance)

    } else if (coordinates && searchResults.length === 0) {
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

      if (proximityError) {
        throw proximityError
      }

      const radius = coordinates.radius || 1000
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
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
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
