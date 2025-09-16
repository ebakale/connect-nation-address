import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  latitude?: number
  longitude?: number
  street?: string
  city?: string
  region?: string
  country?: string
  building?: string
}

interface ValidationResponse {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  completenessScore: number
  duplicateCheck: {
    hasDuplicates: boolean
    duplicateCount: number
    nearbyAddresses: any[]
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

    const { latitude, longitude, street, city, region, country, building }: ValidationRequest = await req.json()

    console.log('Validating address:', { latitude, longitude, street, city, region, country, building })

    const errors: string[] = []
    const suggestions: string[] = []

    // Coordinate validation
    if (latitude !== undefined) {
      if (latitude < -90 || latitude > 90) {
        errors.push('Latitude must be between -90 and 90 degrees')
      }
    }

    if (longitude !== undefined) {
      if (longitude < -180 || longitude > 180) {
        errors.push('Longitude must be between -180 and 180 degrees')
      }
    }

    // Required field validation
    if (!street || street.trim().length === 0) {
      errors.push('Street address is required')
    }

    if (!city || city.trim().length === 0) {
      errors.push('City is required')
    }

    if (!region || region.trim().length === 0) {
      errors.push('Region is required')
    }

    if (!country || country.trim().length === 0) {
      errors.push('Country is required')
    }

    // Calculate completeness score
    const { data: completenessData, error: completenessError } = await supabaseClient
      .rpc('calculate_completeness_score', {
        p_street: street,
        p_city: city,
        p_region: region,
        p_country: country,
        p_building: building,
        p_description: null,
        p_photo_url: null,
        p_latitude: latitude,
        p_longitude: longitude
      })

    if (completenessError) {
      console.error('Error calculating completeness score:', completenessError)
    }

    const completenessScore = completenessData || 0

    // Suggestions based on completeness
    if (completenessScore < 100) {
      if (!building) {
        suggestions.push('Add building/house number for better identification')
      }
      if (!latitude || !longitude) {
        suggestions.push('Add precise coordinates for accurate location')
      }
      if (completenessScore < 60) {
        suggestions.push('Address is missing critical information for verification')
      }
    }

    // Check for duplicates if coordinates provided
    let duplicateCheck = {
      hasDuplicates: false,
      duplicateCount: 0,
      nearbyAddresses: []
    }

    if (latitude && longitude && city && region && country) {
      const { data: duplicateData, error: duplicateError } = await supabaseClient
        .rpc('check_address_duplicates', {
          p_latitude: latitude,
          p_longitude: longitude,
          p_street: street,
          p_city: city,
          p_region: region,
          p_country: country
        })

      if (duplicateError) {
        console.error('Error checking duplicates:', duplicateError)
      } else if (duplicateData) {
        duplicateCheck = {
          hasDuplicates: duplicateData.has_duplicates || false,
          duplicateCount: (duplicateData.coordinate_duplicates?.count || 0) + (duplicateData.address_duplicates?.count || 0),
          nearbyAddresses: [
            ...(duplicateData.coordinate_duplicates?.matches || []),
            ...(duplicateData.address_duplicates?.matches || [])
          ]
        }

        if (duplicateCheck.hasDuplicates) {
          errors.push(`Potential duplicate found: ${duplicateCheck.duplicateCount} similar address(es) detected`)
        }
      }
    }

    const isValid = errors.length === 0

    const response: ValidationResponse = {
      isValid,
      errors,
      suggestions,
      completenessScore,
      duplicateCheck
    }

    console.log('Validation result:', response)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in address validation:', error)
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