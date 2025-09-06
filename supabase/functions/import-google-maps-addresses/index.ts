import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface ProcessedAddress {
  name: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  address_type: string;
  building?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Starting Google Maps address import for Equatorial Guinea...');

    // Define search queries for different types of places in Equatorial Guinea
    const searchQueries = [
      // Major cities and landmarks
      'Malabo, Equatorial Guinea',
      'Bata, Equatorial Guinea', 
      'Ebebiyín, Equatorial Guinea',
      'Aconibe, Equatorial Guinea',
      'Mongomo, Equatorial Guinea',
      'Evinayong, Equatorial Guinea',
      
      // Government buildings
      'government building Malabo Equatorial Guinea',
      'government building Bata Equatorial Guinea',
      'embassy Malabo Equatorial Guinea',
      'ministry Malabo Equatorial Guinea',
      
      // Commercial areas
      'hotel Malabo Equatorial Guinea',
      'hotel Bata Equatorial Guinea',
      'restaurant Malabo Equatorial Guinea',
      'restaurant Bata Equatorial Guinea',
      'bank Malabo Equatorial Guinea',
      'bank Bata Equatorial Guinea',
      'hospital Malabo Equatorial Guinea',
      'hospital Bata Equatorial Guinea',
      'school Malabo Equatorial Guinea',
      'school Bata Equatorial Guinea',
      
      // Landmarks
      'cathedral Malabo Equatorial Guinea',
      'airport Malabo Equatorial Guinea',
      'airport Bata Equatorial Guinea',
      'port Malabo Equatorial Guinea',
      'port Bata Equatorial Guinea',
      'university Malabo Equatorial Guinea',
      'market Malabo Equatorial Guinea',
      'market Bata Equatorial Guinea'
    ];

    let totalImported = 0;
    let successCount = 0;
    let errorCount = 0;
    const importDetails: any[] = [];

    // Function to map Google Place types to our address types
    function mapGoogleTypeToAddressType(types: string[]): string {
      if (types.includes('local_government_office') || types.includes('city_hall') || 
          types.includes('embassy') || types.includes('courthouse')) {
        return 'government';
      }
      if (types.includes('hospital') || types.includes('school') || types.includes('university') || 
          types.includes('church') || types.includes('tourist_attraction') || types.includes('airport')) {
        return 'landmark';
      }
      if (types.includes('store') || types.includes('restaurant') || types.includes('bank') || 
          types.includes('lodging') || types.includes('shopping_mall')) {
        return 'commercial';
      }
      return 'landmark'; // Default for imported places
    }

    // Function to extract address components
    function parseAddressComponents(components: any[], formatted_address: string): {
      street: string;
      city: string;
      region: string;
      country: string;
      building?: string;
    } {
      let street = '';
      let city = '';
      let region = '';
      let country = 'Equatorial Guinea';
      let building = '';

      // Map region names to standardized format
      const regionMap: Record<string, string> = {
        'Bioko Norte': 'Bioko Norte',
        'Bioko Sur': 'Bioko Sur', 
        'Centro Sur': 'Centro Sur',
        'Kié-Ntem': 'Kié-Ntem',
        'Litoral': 'Litoral',
        'Wele-Nzas': 'Wele-Nzas',
        'Annobón': 'Annobón',
        'Djibloho': 'Djibloho'
      };

      for (const component of components) {
        const types = component.types;
        
        if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          // Map to standardized region names
          const regionName = component.long_name;
          region = regionMap[regionName] || regionName;
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (types.includes('route') || types.includes('street_address')) {
          street = component.long_name;
        } else if (types.includes('establishment') || types.includes('premise')) {
          building = component.long_name;
        }
      }

      // Fallback logic for missing components
      if (!street && formatted_address) {
        const addressParts = formatted_address.split(',');
        if (addressParts.length > 0) {
          street = addressParts[0].trim();
        }
      }

      // Default city based on common locations if not found
      if (!city) {
        if (formatted_address.toLowerCase().includes('malabo')) {
          city = 'Malabo';
          region = region || 'Bioko Norte';
        } else if (formatted_address.toLowerCase().includes('bata')) {
          city = 'Bata';
          region = region || 'Litoral';
        }
      }

      // Default region based on city if not found
      if (!region && city) {
        const cityRegionMap: Record<string, string> = {
          'Malabo': 'Bioko Norte',
          'Rebola': 'Bioko Norte',
          'Baney': 'Bioko Norte',
          'Bata': 'Litoral',
          'Mbini': 'Litoral',
          'Kogo': 'Litoral',
          'Ebebiyín': 'Kié-Ntem',
          'Mikomeseng': 'Kié-Ntem',
          'Mongomo': 'Wele-Nzas',
          'Aconibe': 'Wele-Nzas',
          'Evinayong': 'Centro Sur'
        };
        region = cityRegionMap[city] || 'Bioko Norte';
      }

      return {
        street: street || 'Unknown Street',
        city: city || 'Unknown City',
        region: region || 'Bioko Norte',
        country,
        building: building || undefined
      };
    }

    // Function to generate UAC for imported address
    function generateUACForAddress(country: string, region: string, city: string, addressId: string): string {
      const countryCode = 'GQ'; // Equatorial Guinea
      
      const regionMap: Record<string, string> = {
        'Bioko Norte': 'BN',
        'Bioko Sur': 'BS',
        'Centro Sur': 'CS',
        'Kié-Ntem': 'KN',
        'Litoral': 'LI',
        'Wele-Nzas': 'WN',
        'Annobón': 'AN',
        'Djibloho': 'DJ'
      };

      const cityMap: Record<string, string> = {
        'Malabo': 'MAL',
        'Bata': 'BAT',
        'Ebebiyín': 'EBE',
        'Mongomo': 'MON',
        'Aconibe': 'ACO',
        'Evinayong': 'EVI'
      };

      const regionCode = regionMap[region] || region.substring(0, 2).toUpperCase();
      const cityCode = cityMap[city] || city.substring(0, 3).toUpperCase();
      const uniquePart = addressId.substring(0, 6).toUpperCase();

      const baseCode = `${countryCode}-${regionCode}-${cityCode}-${uniquePart}`;
      
      // Simple check digit calculation
      let charSum = 0;
      for (let i = 0; i < baseCode.length; i++) {
        if (baseCode[i] !== '-') {
          const charCode = baseCode.charCodeAt(i);
          charSum += charCode > 57 ? charCode - 55 : parseInt(baseCode[i]);
        }
      }
      
      const checkDigit = String.fromCharCode(65 + (charSum % 26)) + String.fromCharCode(65 + ((charSum * 7) % 26));
      
      return `${baseCode}-${checkDigit}`;
    }

    // Process each search query
    for (const query of searchQueries) {
      try {
        console.log(`Searching for: ${query}`);
        
        // Call Google Places Text Search API
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleMapsApiKey}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error(`Google API error for query "${query}":`, data.error_message);
          errorCount++;
          continue;
        }

        if (!data.results || data.results.length === 0) {
          console.log(`No results found for query: ${query}`);
          continue;
        }

        // Process each result
        for (const place of data.results) {
          try {
            const addressComponents = parseAddressComponents(place.address_components || [], place.formatted_address);
            const addressType = mapGoogleTypeToAddressType(place.types || []);
            
            // Generate a unique ID for UAC generation
            const uniqueId = place.place_id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
            const uac = generateUACForAddress(
              addressComponents.country,
              addressComponents.region,
              addressComponents.city,
              uniqueId
            );

            // Check if address with this UAC already exists
            const { data: existingAddress } = await supabase
              .from('addresses')
              .select('id')
              .eq('uac', uac)
              .single();

            if (existingAddress) {
              console.log(`Address with UAC ${uac} already exists, skipping...`);
              continue;
            }

            // Insert the address
            const { error: insertError } = await supabase
              .from('addresses')
              .insert({
                user_id: '00000000-0000-0000-0000-000000000000', // System user for imported addresses
                uac: uac,
                country: addressComponents.country,
                region: addressComponents.region,
                city: addressComponents.city,
                street: addressComponents.street,
                building: addressComponents.building,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                address_type: addressType,
                description: `Imported from Google Maps: ${place.name}`,
                verified: true,
                public: true
              });

            if (insertError) {
              console.error(`Error inserting address for ${place.name}:`, insertError);
              errorCount++;
              importDetails.push({
                name: place.name,
                status: 'error',
                error: insertError.message
              });
            } else {
              successCount++;
              totalImported++;
              importDetails.push({
                name: place.name,
                uac: uac,
                status: 'success',
                city: addressComponents.city,
                region: addressComponents.region
              });
              console.log(`Successfully imported: ${place.name} with UAC: ${uac}`);
            }

          } catch (placeError) {
            console.error(`Error processing place ${place.name}:`, placeError);
            errorCount++;
            importDetails.push({
              name: place.name,
              status: 'error',
              error: placeError.message
            });
          }
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (queryError) {
        console.error(`Error processing query "${query}":`, queryError);
        errorCount++;
      }
    }

    console.log(`Import completed. Total: ${totalImported}, Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalImported,
        successCount,
        errorCount,
        details: importDetails,
        message: `Successfully imported ${successCount} addresses from Google Maps for Equatorial Guinea`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in import-google-maps-addresses function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});