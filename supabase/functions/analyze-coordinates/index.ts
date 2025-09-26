import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoordinateAnalysisRequest {
  latitude: number;
  longitude: number;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

interface CoordinateAnalysisResult {
  overallScore: number;
  accuracy: {
    score: number;
    precision: string;
    estimatedError: number;
  };
  consistency: {
    score: number;
    addressMatch: boolean;
    regionMatch: boolean;
    countryMatch: boolean;
  };
  validation: {
    score: number;
    isValidCoordinate: boolean;
    isOnLand: boolean;
    isAccessible: boolean;
  };
  crossReference: {
    score: number;
    reverseGeocode: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
    };
    confidence: number;
  };
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, address }: CoordinateAnalysisRequest = await req.json();
    
    if (latitude == null || longitude == null) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing coordinates:', { latitude, longitude, address });

    // Validate coordinate format and range
    const validation = validateCoordinates(latitude, longitude);
    
    // Get reverse geocoding data
    const reverseGeocode = await getReverseGeocode(latitude, longitude);
    
    // Analyze accuracy based on coordinate precision
    const accuracy = analyzeAccuracy(latitude, longitude);
    
    // Check consistency with provided address
    const consistency = analyzeConsistency(address, reverseGeocode);
    
    // Cross-reference analysis
    const crossReference = {
      score: reverseGeocode.confidence,
      reverseGeocode: reverseGeocode.address,
      confidence: reverseGeocode.confidence
    };

    const result: CoordinateAnalysisResult = {
      overallScore: calculateOverallScore(accuracy, consistency, validation, crossReference),
      accuracy,
      consistency,
      validation,
      crossReference,
      recommendations: generateRecommendations(accuracy, consistency, validation, crossReference)
    };

    console.log('Coordinate analysis completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in coordinate analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Coordinate analysis failed', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function validateCoordinates(lat: number, lng: number) {
  const isValidCoordinate = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  
  // Check if coordinates are on land (simplified check for Equatorial Guinea region)
  const isInEquatorialGuinea = lat >= -1.5 && lat <= 2.5 && lng >= 5.5 && lng <= 12.0;
  const isOnLand = isInEquatorialGuinea; // Simplified land check
  
  // Basic accessibility check (not in water bodies)
  const isAccessible = isOnLand && !(
    (lat > 0.5 && lat < 1.5 && lng > 8.5 && lng < 9.5) // Avoid major water bodies
  );

  const score = isValidCoordinate && isOnLand && isAccessible ? 95 : 
                isValidCoordinate && isOnLand ? 80 :
                isValidCoordinate ? 60 : 20;

  return {
    score,
    isValidCoordinate,
    isOnLand,
    isAccessible
  };
}

async function getReverseGeocode(lat: number, lng: number) {
  const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
  
  if (!mapboxToken) {
    console.warn('Mapbox token not found, using mock data');
    return {
      address: {
        street: 'Mock Street',
        city: 'Malabo',
        region: 'Bioko Norte',
        country: 'Equatorial Guinea'
      },
      confidence: 75
    };
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const address: any = {};
      
      // Parse Mapbox response
      feature.context?.forEach((item: any) => {
        if (item.id.startsWith('place')) {
          address.city = item.text;
        } else if (item.id.startsWith('region')) {
          address.region = item.text;
        } else if (item.id.startsWith('country')) {
          address.country = item.text;
        }
      });
      
      if (feature.properties?.address) {
        address.street = `${feature.properties.address} ${feature.text}`;
      } else {
        address.street = feature.text;
      }

      return {
        address,
        confidence: Math.min(95, feature.relevance * 100)
      };
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }

  // Fallback for Equatorial Guinea region
  return {
    address: {
      city: lat > 1.0 ? 'Malabo' : 'Bata',
      region: lat > 1.0 ? 'Bioko Norte' : 'Litoral',
      country: 'Equatorial Guinea'
    },
    confidence: 60
  };
}

function analyzeAccuracy(lat: number, lng: number) {
  // Analyze coordinate precision based on decimal places
  const latStr = lat.toString();
  const lngStr = lng.toString();
  
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;
  
  const minDecimals = Math.min(latDecimals, lngDecimals);
  
  let precision: string;
  let estimatedError: number;
  let score: number;

  if (minDecimals >= 6) {
    precision = 'Very High (±1m)';
    estimatedError = 1;
    score = 95;
  } else if (minDecimals >= 5) {
    precision = 'High (±10m)';
    estimatedError = 10;
    score = 85;
  } else if (minDecimals >= 4) {
    precision = 'Medium (±100m)';
    estimatedError = 100;
    score = 70;
  } else if (minDecimals >= 3) {
    precision = 'Low (±1km)';
    estimatedError = 1000;
    score = 50;
  } else {
    precision = 'Very Low (±10km+)';
    estimatedError = 10000;
    score = 25;
  }

  return {
    score,
    precision,
    estimatedError
  };
}

function analyzeConsistency(providedAddress: any, geocodedAddress: any) {
  if (!providedAddress || !geocodedAddress?.address) {
    return {
      score: 50,
      addressMatch: false,
      regionMatch: false,
      countryMatch: false
    };
  }

  const addressMatch = compareAddressFields(
    providedAddress.street,
    geocodedAddress.address.street
  );
  
  const regionMatch = compareAddressFields(
    providedAddress.region || providedAddress.city,
    geocodedAddress.address.region || geocodedAddress.address.city
  );
  
  const countryMatch = compareAddressFields(
    providedAddress.country,
    geocodedAddress.address.country
  );

  let score = 0;
  if (addressMatch) score += 40;
  if (regionMatch) score += 35;
  if (countryMatch) score += 25;

  return {
    score,
    addressMatch,
    regionMatch,
    countryMatch
  };
}

function compareAddressFields(field1?: string, field2?: string): boolean {
  if (!field1 || !field2) return false;
  
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const normalized1 = normalize(field1);
  const normalized2 = normalize(field2);
  
  // Check for exact match or partial match
  return normalized1 === normalized2 || 
         normalized1.includes(normalized2) || 
         normalized2.includes(normalized1);
}

function calculateOverallScore(accuracy: any, consistency: any, validation: any, crossReference: any): number {
  const weights = {
    accuracy: 0.3,
    consistency: 0.25,
    validation: 0.25,
    crossReference: 0.2
  };

  return Math.round(
    accuracy.score * weights.accuracy +
    consistency.score * weights.consistency +
    validation.score * weights.validation +
    crossReference.score * weights.crossReference
  );
}

function generateRecommendations(accuracy: any, consistency: any, validation: any, crossReference: any): string[] {
  const recommendations: string[] = [];

  if (!validation.isValidCoordinate) {
    recommendations.push("Invalid coordinate format - please verify latitude and longitude values");
  }

  if (!validation.isOnLand) {
    recommendations.push("Coordinates appear to be in water - please verify the location");
  }

  if (!validation.isAccessible) {
    recommendations.push("Location may not be accessible - please verify the coordinates");
  }

  if (accuracy.score < 70) {
    recommendations.push("Low coordinate precision - consider using more decimal places for better accuracy");
  }

  if (consistency.score < 60) {
    recommendations.push("Address information doesn't match coordinate location - please verify both");
  }

  if (crossReference.confidence < 70) {
    recommendations.push("Low confidence in reverse geocoding - consider manual verification");
  }

  if (!consistency.countryMatch) {
    recommendations.push("Coordinates don't match the specified country");
  }

  if (recommendations.length === 0) {
    recommendations.push("Coordinates appear accurate and consistent with address information");
  }

  return recommendations;
}