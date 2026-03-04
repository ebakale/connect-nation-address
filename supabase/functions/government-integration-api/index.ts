// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GovernmentAPIRequest {
  service: 'census' | 'postal' | 'utilities' | 'emergency' | 'planning'
  operation: 'lookup' | 'verify' | 'register' | 'update' | 'bulk-export'
  data?: any
  filters?: {
    region?: string
    city?: string
    addressType?: string
    verified?: boolean
    dateRange?: {
      start: string
      end: string
    }
  }
  apiKey?: string
}

interface GovernmentAPIResponse {
  success: boolean
  data?: any
  metadata: {
    service: string
    operation: string
    recordCount: number
    timestamp: string
    version: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  error?: string
}

const API_VERSION = '1.0'

// Load API keys from environment secrets — one per government service
function getValidApiKeys(): Record<string, string> {
  return {
    census: Deno.env.get('GOV_API_KEY_CENSUS') ?? '',
    postal: Deno.env.get('GOV_API_KEY_POSTAL') ?? '',
    utilities: Deno.env.get('GOV_API_KEY_UTILITIES') ?? '',
    emergency: Deno.env.get('GOV_API_KEY_EMERGENCY') ?? '',
    planning: Deno.env.get('GOV_API_KEY_PLANNING') ?? '',
  }
}

function validateApiKey(apiKey: string | undefined, service: string): boolean {
  if (!apiKey) return false
  const keys = getValidApiKeys()
  const expectedKey = keys[service]
  if (!expectedKey) return false
  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== expectedKey.length) return false
  let result = 0
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i)
  }
  return result === 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      service, operation, data, filters, apiKey
    }: GovernmentAPIRequest = await req.json()

    // Validate API key per service from environment secrets
    if (!validateApiKey(apiKey, service)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid or missing API key',
          metadata: {
            service: service || 'unknown',
            operation: operation || 'unknown',
            recordCount: 0,
            timestamp: new Date().toISOString(),
            version: API_VERSION
          }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Government API request: ${service}/${operation}`, filters)

    let result: any = {}

    switch (service) {
      case 'census':
        result = await handleCensusOperations(supabaseClient, operation, data, filters)
        break
      case 'postal':
        result = await handlePostalOperations(supabaseClient, operation, data, filters)
        break
      case 'utilities':
        result = await handleUtilitiesOperations(supabaseClient, operation, data, filters)
        break
      case 'emergency':
        result = await handleEmergencyOperations(supabaseClient, operation, data, filters)
        break
      case 'planning':
        result = await handlePlanningOperations(supabaseClient, operation, data, filters)
        break
      default:
        throw new Error(`Unsupported service: ${service}`)
    }

    const recordCount = Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0)

    const response: GovernmentAPIResponse = {
      success: true,
      data: result.data,
      metadata: {
        service,
        operation,
        recordCount,
        timestamp: new Date().toISOString(),
        version: API_VERSION
      },
      ...result.pagination && { pagination: result.pagination }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in government API:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        metadata: {
          service: 'unknown',
          operation: 'unknown',
          recordCount: 0,
          timestamp: new Date().toISOString(),
          version: API_VERSION
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Census Operations
async function handleCensusOperations(supabase: any, operation: string, data: any, filters: any) {
  switch (operation) {
    case 'lookup':
      let query = supabase
        .from('addresses')
        .select(`
          uac, street, building, city, region, country,
          latitude, longitude, address_type, verified, public,
          completeness_score, created_at
        `)
        .eq('verified', true)

      if (filters?.region) query = query.eq('region', filters.region)
      if (filters?.city) query = query.eq('city', filters.city)
      if (filters?.addressType) query = query.eq('address_type', filters.addressType)

      const { data: censusData, error } = await query.limit(1000)
      if (error) throw error

      return {
        data: censusData?.map(addr => ({
          ...addr,
          census_zone: generateCensusZone(addr.region, addr.city),
          enumeration_priority: addr.completeness_score > 80 ? 'high' : 'medium'
        }))
      }

    case 'bulk-export':
      const { data: bulkData, error: bulkError } = await supabase
        .from('addresses')
        .select('*')
        .eq('verified', true)
        .eq('public', true)

      if (bulkError) throw bulkError
      return { data: bulkData }

    default:
      throw new Error(`Unsupported census operation: ${operation}`)
  }
}

// Postal Operations
async function handlePostalOperations(supabase: any, operation: string, data: any, filters: any) {
  switch (operation) {
    case 'lookup':
      const { data: postalData, error } = await supabase
        .from('addresses')
        .select(`
          uac, street, building, city, region, country,
          latitude, longitude, verified, completeness_score
        `)
        .eq('verified', true)
        .gte('completeness_score', 70)
        .limit(500)

      if (error) throw error

      return {
        data: postalData?.map(addr => ({
          ...addr,
          postal_zone: generatePostalZone(addr.region, addr.city),
          delivery_priority: addr.completeness_score > 90 ? 1 : 2,
          route_optimization_weight: calculateRouteWeight(addr.latitude, addr.longitude)
        }))
      }

    case 'verify':
      if (!data?.uac) throw new Error('UAC required for verification')
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('addresses')
        .select('*')
        .eq('uac', data.uac)
        .eq('verified', true)
        .single()

      if (verifyError) throw verifyError
      
      return {
        data: {
          ...verifyData,
          postal_deliverable: verifyData.completeness_score > 80,
          delivery_notes: generateDeliveryNotes(verifyData)
        }
      }

    default:
      throw new Error(`Unsupported postal operation: ${operation}`)
  }
}

// Utilities Operations
async function handleUtilitiesOperations(supabase: any, operation: string, data: any, filters: any) {
  switch (operation) {
    case 'lookup':
      const { data: utilityData, error } = await supabase
        .from('addresses')
        .select(`
          uac, street, building, city, region,
          latitude, longitude, address_type, verified
        `)
        .eq('verified', true)
        .in('address_type', ['residential', 'commercial', 'industrial'])

      if (error) throw error

      return {
        data: utilityData?.map(addr => ({
          ...addr,
          service_zone: generateServiceZone(addr.region, addr.city),
          connection_feasibility: assessConnectionFeasibility(addr),
          estimated_demand: estimateUtilityDemand(addr.address_type)
        }))
      }

    default:
      throw new Error(`Unsupported utilities operation: ${operation}`)
  }
}

// Emergency Operations
async function handleEmergencyOperations(supabase: any, operation: string, data: any, filters: any) {
  switch (operation) {
    case 'lookup':
      const { data: emergencyData, error } = await supabase
        .from('addresses')
        .select(`
          uac, street, building, city, region,
          latitude, longitude, verified, completeness_score
        `)
        .eq('verified', true)
        .gte('completeness_score', 60)

      if (error) throw error

      return {
        data: emergencyData?.map(addr => ({
          ...addr,
          response_zone: generateResponseZone(addr.region, addr.city),
          access_priority: addr.completeness_score > 85 ? 'high' : 'standard',
          coordinate_accuracy: assessCoordinateAccuracy(addr.latitude, addr.longitude)
        }))
      }

    default:
      throw new Error(`Unsupported emergency operation: ${operation}`)
  }
}

// Planning Operations
async function handlePlanningOperations(supabase: any, operation: string, data: any, filters: any) {
  switch (operation) {
    case 'lookup':
      const { data: planningData, error } = await supabase.rpc('coverage-analytics-api')
      if (error) throw error

      const { data: densityData, error: densityError } = await supabase
        .from('addresses')
        .select('region, city, address_type, latitude, longitude')
        .eq('verified', true)

      if (densityError) throw densityError

      const densityAnalysis = calculateAddressDensity(densityData)

      return {
        data: {
          coverage_analytics: planningData,
          density_analysis: densityAnalysis,
          development_recommendations: generateDevelopmentRecommendations(densityAnalysis)
        }
      }

    default:
      throw new Error(`Unsupported planning operation: ${operation}`)
  }
}

// Helper functions
function generateCensusZone(region: string, city: string): string {
  return `CZ-${region.substring(0, 2).toUpperCase()}-${city.substring(0, 3).toUpperCase()}`
}

function generatePostalZone(region: string, city: string): string {
  return `${region.substring(0, 2).toUpperCase()}${city.substring(0, 2).toUpperCase()}`
}

function generateServiceZone(region: string, city: string): string {
  return `SZ-${region}-${city}`.replace(/\s+/g, '').toUpperCase()
}

function generateResponseZone(region: string, city: string): string {
  return `RZ-${region.substring(0, 3)}-${city.substring(0, 3)}`.replace(/\s+/g, '').toUpperCase()
}

function calculateRouteWeight(lat: number, lng: number): number {
  return Math.round((Math.abs(lat) + Math.abs(lng)) * 100) % 10 + 1
}

function generateDeliveryNotes(address: any): string {
  const notes = []
  if (address.building) notes.push(`Building: ${address.building}`)
  if (address.completeness_score < 90) notes.push('Verify address details on delivery')
  return notes.join('; ')
}

function assessConnectionFeasibility(address: any): 'high' | 'medium' | 'low' {
  if (address.address_type === 'residential') return 'high'
  if (address.address_type === 'commercial') return 'high'
  if (address.address_type === 'industrial') return 'medium'
  return 'low'
}

function estimateUtilityDemand(addressType: string): number {
  const demands = { 'residential': 50, 'commercial': 200, 'industrial': 500, 'institutional': 150 }
  return demands[addressType as keyof typeof demands] || 25
}

function assessCoordinateAccuracy(lat: number, lng: number): 'high' | 'medium' | 'low' {
  const precision = (lat.toString().split('.')[1] || '').length +
                   (lng.toString().split('.')[1] || '').length
  if (precision >= 8) return 'high'
  if (precision >= 4) return 'medium'
  return 'low'
}

function calculateAddressDensity(addresses: any[]): any {
  const regionDensity: Record<string, any> = {}
  addresses.forEach(addr => {
    const key = `${addr.region}-${addr.city}`
    if (!regionDensity[key]) {
      regionDensity[key] = {
        region: addr.region, city: addr.city, total: 0,
        residential: 0, commercial: 0, industrial: 0, coordinates: []
      }
    }
    regionDensity[key].total++
    regionDensity[key][addr.address_type as keyof typeof regionDensity[key]]++
    regionDensity[key].coordinates.push([addr.latitude, addr.longitude])
  })
  return Object.values(regionDensity)
}

function generateDevelopmentRecommendations(densityData: any[]): string[] {
  const recommendations: string[] = []
  densityData.forEach(area => {
    if (area.total < 50) {
      recommendations.push(`${area.city}: Consider infrastructure development - low address density`)
    }
    if (area.commercial / area.total > 0.5) {
      recommendations.push(`${area.city}: High commercial density - evaluate traffic infrastructure`)
    }
    if (area.residential / area.total > 0.8) {
      recommendations.push(`${area.city}: Residential area - prioritize utilities and public services`)
    }
  })
  return recommendations
}
