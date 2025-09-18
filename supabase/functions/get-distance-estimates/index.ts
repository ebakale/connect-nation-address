import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DistanceRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

interface DistanceEstimate {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  mode: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!googleMapsApiKey) {
      console.error('Google Maps API key not found');
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { origin, destination, mode = 'driving' }: DistanceRequest = await req.json();

    // Validate coordinates
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build Google Maps Distance Matrix API URL
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=${mode}&units=metric&key=${googleMapsApiKey}`;

    console.log(`Fetching distance estimates for ${mode} from ${originStr} to ${destinationStr}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Maps API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to get distance estimates', details: data }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const element = data.rows[0]?.elements[0];
    
    if (!element || element.status !== 'OK') {
      console.error('No route found:', element);
      return new Response(
        JSON.stringify({ error: 'No route found between the locations' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const estimate: DistanceEstimate = {
      distance: element.distance,
      duration: element.duration,
      mode: mode
    };

    console.log('Successfully retrieved distance estimates:', estimate);

    return new Response(
      JSON.stringify(estimate),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-distance-estimates function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});