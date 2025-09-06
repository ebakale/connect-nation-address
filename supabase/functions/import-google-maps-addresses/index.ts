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

    console.log('Starting comprehensive Google Maps address import for Equatorial Guinea...');

    // Define key coordinates for systematic area searches
    const keyLocations = [
      // Malabo city center and surrounding areas
      { lat: 3.7558, lng: 8.7813, name: 'Malabo Center', radius: 5000 },
      { lat: 3.7500, lng: 8.7800, name: 'Malabo South', radius: 3000 },
      { lat: 3.7600, lng: 8.7800, name: 'Malabo North', radius: 3000 },
      { lat: 3.7550, lng: 8.7700, name: 'Malabo West', radius: 3000 },
      { lat: 3.7550, lng: 8.7900, name: 'Malabo East', radius: 3000 },
      
      // Bata city center and surrounding areas  
      { lat: 1.8639, lng: 9.7658, name: 'Bata Center', radius: 5000 },
      { lat: 1.8600, lng: 9.7600, name: 'Bata South', radius: 3000 },
      { lat: 1.8700, lng: 9.7700, name: 'Bata North', radius: 3000 },
      
      // Other major cities
      { lat: 2.1533, lng: 10.7369, name: 'Ebebiyín', radius: 3000 },
      { lat: 1.4347, lng: 10.9431, name: 'Mongomo', radius: 3000 },
      { lat: 0.9333, lng: 10.5500, name: 'Evinayong', radius: 3000 },
    ];

    // Known Plus Codes for specific locations
    const knownPlusCodes = [
      'PQW9+WW Malabo, Equatorial Guinea', // Hotel Castillo
      // Add more known Plus Codes here as discovered
    ];

    // Traditional text-based search queries (keep existing functionality)
    const textSearchQueries = [
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
      
      // Specific searches
      'Hotel Castillo Malabo Equatorial Guinea',
      'Castillo Hotel Malabo Equatorial Guinea', 
      'Castillo Malabo Equatorial Guinea',
      'PQW9+WW Malabo Equatorial Guinea',  // Hotel Castillo Plus Code
      
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
    } {
      let street = '';
      let city = '';
      let region = '';
      let country = 'Equatorial Guinea';

      // Extract from address components (with safety check)
      if (components && Array.isArray(components)) {
        for (const component of components) {
        if (component.types.includes('route') || component.types.includes('street_number')) {
          street = component.long_name;
        } else if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          region = component.long_name;
        } else if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      // Fallback parsing from formatted_address if components are incomplete
      if (!street || !city || !region) {
        const addressParts = formatted_address.split(',').map(part => part.trim());
        
        if (!street && addressParts.length > 0) {
          street = addressParts[0];
        }
        
        if (!city) {
          // Look for known cities in the address
          const knownCities = ['Malabo', 'Bata', 'Ebebiyín', 'Mongomo', 'Evinayong', 'Aconibe'];
          for (const knownCity of knownCities) {
            if (formatted_address.includes(knownCity)) {
              city = knownCity;
              break;
            }
          }
        }
        
        if (!region) {
          // Map cities to regions
          const cityToRegion: { [key: string]: string } = {
            'Malabo': 'Bioko Norte',
            'Bata': 'Litoral',
            'Ebebiyín': 'Kié-Ntem',
            'Mongomo': 'Wele-Nzas',
            'Evinayong': 'Centro Sur'
          };
          region = cityToRegion[city] || 'Unknown Region';
        }
      }

      return {
        street: street || 'Unknown Street',
        city: city || 'Unknown City',
        region: region || 'Unknown Region',
        country: country
      };
    }

    // Generate UAC using the existing function pattern
    function generateUAC(country: string, region: string, city: string, uniqueId: string): string {
      const countryCode = 'GQ'; // Equatorial Guinea
      
      const regionCodes: { [key: string]: string } = {
        'Bioko Norte': 'BN',
        'Bioko Sur': 'BS',
        'Litoral': 'LI',
        'Kié-Ntem': 'KN',
        'Centro Sur': 'CS',
        'Wele-Nzas': 'WN',
        'Annobón': 'AN',
        'Djibloho': 'DJ'
      };
      
      const cityCodes: { [key: string]: string } = {
        'Malabo': 'MAL',
        'Bata': 'BAT',
        'Ebebiyín': 'EBE',
        'Mongomo': 'MON',
        'Evinayong': 'EVI'
      };
      
      const regionCode = regionCodes[region] || region.substring(0, 2).toUpperCase();
      const cityCode = cityCodes[city] || city.substring(0, 3).toUpperCase();
      
      // Generate base code
      const baseCode = `${countryCode}-${regionCode}-${cityCode}-${uniqueId.substring(0, 6).toUpperCase()}`;
      
      // Simple checksum
      const checksum = baseCode.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const checksumChars = String.fromCharCode(65 + (checksum % 26)) + String.fromCharCode(65 + ((checksum * 7) % 26));
      
      return `${baseCode}-${checksumChars}`;
    }

    // Enhanced function to search for places using multiple strategies
    async function searchPlacesComprehensive() {
      const allResults: GooglePlaceResult[] = [];
      const processedPlaceIds = new Set<string>();

      console.log('=== STRATEGY 1: Text-based searches ===');
      // Strategy 1: Traditional text-based searches (keep existing functionality)
      for (const query of textSearchQueries) {
        try {
          console.log(`Searching for: ${query}`);
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleMapsApiKey}`
          );
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            for (const result of data.results) {
              if (!processedPlaceIds.has(result.place_id)) {
                allResults.push(result);
                processedPlaceIds.add(result.place_id);
              }
            }
          }
          
          // Respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error searching for \"${query}\":`, error);
        }
      }

      console.log(`Text search completed. Found ${allResults.length} unique places.`);

      console.log('=== STRATEGY 2: Plus Code resolution ===');
      // Strategy 2: Resolve known Plus Codes directly
      for (const plusCode of knownPlusCodes) {
        try {
          console.log(`Resolving Plus Code: ${plusCode}`);
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(plusCode)}&key=${googleMapsApiKey}`
          );
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            for (const result of data.results) {
              if (!processedPlaceIds.has(result.place_id)) {
                allResults.push(result);
                processedPlaceIds.add(result.place_id);
                console.log(`Plus Code resolved: ${result.name}`);
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error resolving Plus Code \"${plusCode}\":`, error);
        }
      }

      console.log('=== STRATEGY 3: Nearby searches around key locations ===');
      // Strategy 3: Nearby searches around key coordinates
      const placeTypes = ['lodging', 'restaurant', 'hospital', 'school', 'bank', 'tourist_attraction', 'local_government_office'];
      
      for (const location of keyLocations) {
        console.log(`Searching around ${location.name} (${location.lat}, ${location.lng})`);
        
        for (const type of placeTypes) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${location.radius}&type=${type}&key=${googleMapsApiKey}`
            );
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              let newPlaces = 0;
              for (const result of data.results) {
                if (!processedPlaceIds.has(result.place_id)) {
                  allResults.push(result);
                  processedPlaceIds.add(result.place_id);
                  newPlaces++;
                }
              }
              if (newPlaces > 0) {
                console.log(`Found ${newPlaces} new ${type} places near ${location.name}`);
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
          } catch (error) {
            console.error(`Error searching for ${type} near ${location.name}:`, error);
          }
        }
      }

      console.log(`Comprehensive search completed. Total unique places found: ${allResults.length}`);
      return allResults;
    }

    // Get comprehensive search results using all strategies
    const searchResults = await searchPlacesComprehensive();
    
    console.log(`Processing ${searchResults.length} places for import...`);

    // Process each search result
    for (const place of searchResults) {
      try {
        totalImported++;
        
        const addressInfo = parseAddressComponents(place.address_components, place.formatted_address);
        const addressType = mapGoogleTypeToAddressType(place.types);
        
        // Generate UAC
        const uac = generateUAC(
          addressInfo.country,
          addressInfo.region,
          addressInfo.city,
          place.place_id.replace(/[^a-zA-Z0-9]/g, '')
        );

        // Check if address already exists
        const { data: existingAddress } = await supabase
          .from('addresses')
          .select('id')
          .eq('uac', uac)
          .maybeSingle();

        if (existingAddress) {
          console.log(`Address with UAC ${uac} already exists, skipping...`);
          continue;
        }

        // Insert the address
        const { error: insertError } = await supabase
          .from('addresses')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // System import user
            uac: uac,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            street: addressInfo.street,
            city: addressInfo.city,
            region: addressInfo.region,
            country: addressInfo.country,
            address_type: addressType,
            verified: true,
            public: true,
            description: `Imported from Google Maps: ${place.name}`
          });

        if (insertError) {
          console.error(`Error inserting ${place.name}:`, insertError);
          errorCount++;
          importDetails.push({
            name: place.name,
            uac: uac,
            status: 'error',
            error: insertError.message
          });
        } else {
          console.log(`Successfully imported: ${place.name} with UAC: ${uac}`);
          successCount++;
          importDetails.push({
            name: place.name,
            uac: uac,
            status: 'success'
          });
        }

      } catch (error) {
        console.error(`Error processing place ${place.name}:`, error);
        errorCount++;
        importDetails.push({
          name: place.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Import completed. Total: ${totalImported}, Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed successfully`,
        data: {
          totalProcessed: totalImported,
          successCount: successCount,
          errorCount: errorCount,
          importDetails: importDetails
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
