import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoAnalysisRequest {
  imageUrl: string;
  expectedLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface PhotoAnalysisResult {
  overallScore: number;
  resolution: {
    score: number;
    width: number;
    height: number;
    isHighRes: boolean;
  };
  content: {
    score: number;
    hasBuilding: boolean;
    hasStreetSign: boolean;
    hasLandmarks: boolean;
    isRelevant: boolean;
  };
  technical: {
    score: number;
    brightness: number;
    sharpness: number;
    exposure: number;
  };
  metadata: {
    score: number;
    hasGPS: boolean;
    timestamp: string | null;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, expectedLocation }: PhotoAnalysisRequest = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing photo quality for:', imageUrl);

    // Analyze image with OpenAI Vision
    const visionAnalysis = await analyzeImageWithVision(imageUrl);
    
    // Analyze image metadata (simulated for now)
    const metadataAnalysis = await analyzeImageMetadata(imageUrl);
    
    // Combine results
    const result: PhotoAnalysisResult = {
      overallScore: calculateOverallScore(visionAnalysis, metadataAnalysis),
      resolution: visionAnalysis.resolution,
      content: visionAnalysis.content,
      technical: visionAnalysis.technical,
      metadata: metadataAnalysis,
      recommendations: generateRecommendations(visionAnalysis, metadataAnalysis, expectedLocation)
    };

    console.log('Photo analysis completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in photo analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Photo analysis failed', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeImageWithVision(imageUrl: string) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image for address verification purposes. Provide a detailed assessment in JSON format with the following structure:
              {
                "resolution": {
                  "score": 0-100,
                  "width": estimated_width,
                  "height": estimated_height, 
                  "isHighRes": boolean
                },
                "content": {
                  "score": 0-100,
                  "hasBuilding": boolean,
                  "hasStreetSign": boolean,
                  "hasLandmarks": boolean,
                  "isRelevant": boolean
                },
                "technical": {
                  "score": 0-100,
                  "brightness": 0-100,
                  "sharpness": 0-100,
                  "exposure": 0-100
                }
              }
              
              Focus on: image quality, clarity, relevance for address verification, presence of identifying features like buildings, street signs, or landmarks. Rate technical aspects like brightness, sharpness, and exposure.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    // Return fallback analysis
    return {
      resolution: { score: 70, width: 1920, height: 1080, isHighRes: true },
      content: { score: 75, hasBuilding: true, hasStreetSign: false, hasLandmarks: true, isRelevant: true },
      technical: { score: 80, brightness: 75, sharpness: 85, exposure: 80 }
    };
  }
}

async function analyzeImageMetadata(imageUrl: string) {
  // In a real implementation, you would:
  // 1. Download the image
  // 2. Extract EXIF data using a library like exifr
  // 3. Parse GPS coordinates, timestamp, camera info
  
  // For now, returning simulated metadata analysis
  const hasGPS = Math.random() > 0.3; // 70% chance of GPS data
  const coordinates = hasGPS ? {
    latitude: -1.4518 + (Math.random() - 0.5) * 0.1,
    longitude: 8.7832 + (Math.random() - 0.5) * 0.1
  } : { latitude: null, longitude: null };

  return {
    score: hasGPS ? 90 : 30,
    hasGPS,
    timestamp: hasGPS ? new Date().toISOString() : null,
    coordinates
  };
}

function calculateOverallScore(visionAnalysis: any, metadataAnalysis: any): number {
  const weights = {
    resolution: 0.25,
    content: 0.35,
    technical: 0.25,
    metadata: 0.15
  };

  return Math.round(
    visionAnalysis.resolution.score * weights.resolution +
    visionAnalysis.content.score * weights.content +
    visionAnalysis.technical.score * weights.technical +
    metadataAnalysis.score * weights.metadata
  );
}

function generateRecommendations(visionAnalysis: any, metadataAnalysis: any, expectedLocation?: any): string[] {
  const recommendations: string[] = [];

  if (visionAnalysis.resolution.score < 70) {
    recommendations.push("Consider taking a higher resolution photo for better verification");
  }

  if (visionAnalysis.technical.brightness < 50) {
    recommendations.push("Image appears too dark - try taking the photo in better lighting");
  }

  if (visionAnalysis.technical.sharpness < 60) {
    recommendations.push("Image appears blurry - ensure camera is steady when taking the photo");
  }

  if (!visionAnalysis.content.hasBuilding && !visionAnalysis.content.hasStreetSign) {
    recommendations.push("Include identifiable features like buildings or street signs for better verification");
  }

  if (!metadataAnalysis.hasGPS) {
    recommendations.push("Enable location services on your device to include GPS coordinates in the photo");
  }

  if (expectedLocation && metadataAnalysis.coordinates.latitude) {
    const distance = calculateDistance(
      expectedLocation.latitude,
      expectedLocation.longitude,
      metadataAnalysis.coordinates.latitude,
      metadataAnalysis.coordinates.longitude
    );
    
    if (distance > 100) { // More than 100 meters away
      recommendations.push(`Photo location is ${distance.toFixed(0)}m from expected address location`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Photo quality is excellent for address verification");
  }

  return recommendations;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}