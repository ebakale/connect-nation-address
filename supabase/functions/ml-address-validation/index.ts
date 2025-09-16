import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MLValidationRequest {
  street: string
  city: string
  region: string
  country: string
  building?: string
  latitude?: number
  longitude?: number
  description?: string
}

interface MLValidationResponse {
  qualityScore: number
  confidenceLevel: number
  duplicateRisk: number
  anomalies: string[]
  suggestions: string[]
  addressStandardization: {
    standardizedStreet: string
    standardizedBuilding?: string
    confidence: number
  }
  geospatialValidation: {
    coordinateAccuracy: number
    addressCoordinateMatch: number
    nearbyLandmarks: string[]
  }
}

// ML-like address standardization patterns
const STREET_PATTERNS = [
  { pattern: /\b(st|street)\b/gi, replacement: 'Street' },
  { pattern: /\b(rd|road)\b/gi, replacement: 'Road' },
  { pattern: /\b(ave|avenue)\b/gi, replacement: 'Avenue' },
  { pattern: /\b(blvd|boulevard)\b/gi, replacement: 'Boulevard' },
  { pattern: /\b(dr|drive)\b/gi, replacement: 'Drive' },
  { pattern: /\b(ln|lane)\b/gi, replacement: 'Lane' },
  { pattern: /\b(ct|court)\b/gi, replacement: 'Court' },
  { pattern: /\b(pl|place)\b/gi, replacement: 'Place' },
]

const BUILDING_PATTERNS = [
  { pattern: /\b#(\d+)\b/g, replacement: 'Unit $1' },
  { pattern: /\bapt\.?\s*(\d+)\b/gi, replacement: 'Apartment $1' },
  { pattern: /\bfloor\s*(\d+)\b/gi, replacement: 'Floor $1' },
  { pattern: /\bsuite\s*(\d+)\b/gi, replacement: 'Suite $1' },
]

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
      street, city, region, country, building, latitude, longitude, description
    }: MLValidationRequest = await req.json()

    console.log('ML validation request:', { street, city, region, country })

    // 1. Address Standardization with ML-like patterns
    let standardizedStreet = street.trim()
    let standardizedBuilding = building?.trim() || ''
    
    // Apply street standardization patterns
    for (const { pattern, replacement } of STREET_PATTERNS) {
      standardizedStreet = standardizedStreet.replace(pattern, replacement)
    }
    
    // Apply building standardization patterns
    if (standardizedBuilding) {
      for (const { pattern, replacement } of BUILDING_PATTERNS) {
        standardizedBuilding = standardizedBuilding.replace(pattern, replacement)
      }
    }

    // 2. Quality Scoring Algorithm (ML-inspired)
    let qualityScore = 0
    const anomalies: string[] = []
    const suggestions: string[] = []

    // Street quality analysis
    if (standardizedStreet.length < 3) {
      anomalies.push('Street name too short')
      qualityScore -= 20
    } else if (standardizedStreet.length > 100) {
      anomalies.push('Street name unusually long')
      qualityScore -= 10
    } else {
      qualityScore += 25
    }

    // Check for numeric patterns in street
    const hasNumbers = /\d/.test(standardizedStreet)
    if (hasNumbers) {
      qualityScore += 10
    } else {
      suggestions.push('Consider adding street number for better identification')
    }

    // City validation
    if (city.length < 2) {
      anomalies.push('City name too short')
      qualityScore -= 15
    } else {
      qualityScore += 20
    }

    // Coordinate validation
    let coordinateAccuracy = 0
    let addressCoordinateMatch = 0
    
    if (latitude && longitude) {
      qualityScore += 25
      
      // Check coordinate precision (more decimal places = higher accuracy)
      const latPrecision = (latitude.toString().split('.')[1] || '').length
      const lngPrecision = (longitude.toString().split('.')[1] || '').length
      coordinateAccuracy = Math.min(100, (latPrecision + lngPrecision) * 10)
      
      if (coordinateAccuracy < 30) {
        suggestions.push('Increase coordinate precision for better accuracy')
      }
    } else {
      suggestions.push('Add GPS coordinates for precise location')
      qualityScore -= 15
    }

    // Building/address number analysis
    if (building) {
      qualityScore += 10
      
      // Check for proper formatting
      if (!/\d/.test(building)) {
        anomalies.push('Building identifier lacks numeric component')
        qualityScore -= 5
      }
    } else {
      suggestions.push('Add building/house number for complete address')
    }

    // Description bonus
    if (description && description.length > 10) {
      qualityScore += 5
    }

    // Normalize quality score (0-100)
    qualityScore = Math.max(0, Math.min(100, qualityScore + 50))

    // 3. Advanced Duplicate Detection
    let duplicateRisk = 0
    
    if (latitude && longitude) {
      // Check for nearby addresses using enhanced spatial analysis
      const { data: nearbyAddresses, error: nearbyError } = await supabaseClient
        .from('addresses')
        .select('id, street, building, latitude, longitude')
        .gte('latitude', latitude - 0.001)
        .lte('latitude', latitude + 0.001)
        .gte('longitude', longitude - 0.001)
        .lte('longitude', longitude + 0.001)

      if (!nearbyError && nearbyAddresses) {
        for (const nearby of nearbyAddresses) {
          const distance = calculateDistance(
            latitude, longitude,
            nearby.latitude, nearby.longitude
          )
          
          // Calculate similarity scores
          const streetSimilarity = calculateStringSimilarity(
            standardizedStreet.toLowerCase(),
            nearby.street.toLowerCase()
          )
          
          const buildingSimilarity = building && nearby.building 
            ? calculateStringSimilarity(building.toLowerCase(), nearby.building.toLowerCase())
            : 0

          // Risk calculation based on distance and similarity
          if (distance < 50 && streetSimilarity > 0.8) {
            duplicateRisk = Math.max(duplicateRisk, 90)
          } else if (distance < 100 && streetSimilarity > 0.7) {
            duplicateRisk = Math.max(duplicateRisk, 70)
          } else if (streetSimilarity > 0.9 && buildingSimilarity > 0.8) {
            duplicateRisk = Math.max(duplicateRisk, 60)
          }
        }
      }
    }

    // 4. Geospatial Validation
    const nearbyLandmarks: string[] = []
    
    // Simulate landmark detection based on coordinates
    if (latitude && longitude) {
      // Check if coordinates are in known regions
      if (region.toLowerCase().includes('malabo') && 
          latitude > 3.7 && latitude < 3.8 && 
          longitude > 8.7 && longitude < 8.8) {
        nearbyLandmarks.push('Malabo City Center')
        addressCoordinateMatch = 95
      } else if (region.toLowerCase().includes('bata') &&
                 latitude > 1.8 && latitude < 1.9 &&
                 longitude > 9.7 && longitude < 9.8) {
        nearbyLandmarks.push('Bata Commercial District')
        addressCoordinateMatch = 90
      } else {
        addressCoordinateMatch = 70
      }
      
      // Add generic landmarks based on coordinate patterns
      if (Math.abs(latitude % 0.01) < 0.001) {
        nearbyLandmarks.push('Major intersection nearby')
      }
    }

    // 5. Confidence Level Calculation
    let confidenceLevel = qualityScore
    
    if (duplicateRisk > 50) {
      confidenceLevel -= (duplicateRisk * 0.3)
    }
    
    if (anomalies.length > 2) {
      confidenceLevel -= (anomalies.length * 5)
    }
    
    confidenceLevel = Math.max(0, Math.min(100, confidenceLevel))

    // Additional suggestions based on analysis
    if (qualityScore < 60) {
      suggestions.push('Address requires manual verification due to quality concerns')
    }
    
    if (duplicateRisk > 70) {
      suggestions.push('High duplicate risk - verify uniqueness before approval')
    }
    
    if (coordinateAccuracy < 50 && latitude && longitude) {
      suggestions.push('Consider re-capturing GPS coordinates for better accuracy')
    }

    const response: MLValidationResponse = {
      qualityScore: Math.round(qualityScore),
      confidenceLevel: Math.round(confidenceLevel),
      duplicateRisk: Math.round(duplicateRisk),
      anomalies,
      suggestions,
      addressStandardization: {
        standardizedStreet,
        standardizedBuilding: standardizedBuilding || undefined,
        confidence: Math.round((standardizedStreet !== street || standardizedBuilding !== building) ? 85 : 100)
      },
      geospatialValidation: {
        coordinateAccuracy: Math.round(coordinateAccuracy),
        addressCoordinateMatch: Math.round(addressCoordinateMatch),
        nearbyLandmarks
      }
    }

    console.log('ML validation result:', {
      qualityScore: response.qualityScore,
      confidenceLevel: response.confidenceLevel,
      duplicateRisk: response.duplicateRisk
    })

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ML validation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions
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

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}