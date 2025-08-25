import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// UAC Generation Logic (copied from existing system)
const COUNTRY_CODES: Record<string, string> = {
  'Angola': 'AO',
  'Equatorial Guinea': 'GQ',
  'Cameroon': 'CM',
  'Gabon': 'GA',
  'São Tomé and Príncipe': 'ST',
  'Democratic Republic of Congo': 'CD',
  'Republic of Congo': 'CG',
  'Central African Republic': 'CF',
  'Chad': 'TD'
}

const REGION_CODES: Record<string, string> = {
  'Annobón': 'AN',
  'Bioko Norte': 'BN',
  'Bioko Sur': 'BS',
  'Centro Sur': 'CS',
  'Djibloho': 'DJ',
  'Kié-Ntem': 'KN',
  'Kie-Ntem': 'KN',
  'Litoral': 'LI',
  'Wele-Nzas': 'WN'
}

const CITY_CODES: Record<string, string> = {
  'Malabo': 'MAL',
  'Rebola': 'REB',
  'Baney': 'BAN',
  'Luba': 'LUB',
  'Riaba': 'RIA',
  'Moca': 'MOC',
  'Bata': 'BAT',
  'Mbini': 'MBI',
  'Kogo': 'KOG',
  'Acalayong': 'ACA',
  'Evinayong': 'EVI',
  'Acurenam': 'ACU',
  'Niefang': 'NIE',
  'Ciudad de la Paz': 'CDP',
  'Ebebiyín': 'EBE',
  'Mikomeseng': 'MIK',
  'Ncue': 'NCU',
  'Nsork Nsomo': 'NSO',
  'Mongomo': 'MON',
  'Añisoc': 'ANI',
  'Aconibe': 'ACO',
  'Nsok': 'NSK',
  'San Antonio de Palé': 'SAP'
}

function generateCheckDigit(baseCode: string): string {
  let charSum = 0
  
  for (let i = 0; i < baseCode.length; i++) {
    if (baseCode[i] !== '-') {
      const char = baseCode[i]
      const charVal = /[0-9]/.test(char) 
        ? parseInt(char) 
        : char.charCodeAt(0) - 55
      charSum += charVal
    }
  }

  const checkDigit = String.fromCharCode(65 + (charSum % 26)) + 
                    String.fromCharCode(65 + ((charSum * 7) % 26))
  
  return checkDigit
}

function generateUACForIncident(country: string, region: string, city: string, incidentId: string): string {
  const countryCode = COUNTRY_CODES[country] || country.substring(0, 2).toUpperCase()
  const regionCode = REGION_CODES[region] || region.substring(0, 2).toUpperCase()
  const cityCode = CITY_CODES[city] || city.substring(0, 3).toUpperCase()
  
  // Generate unique sequence using incident ID hash
  const uniquePart = incidentId.replace(/-/g, '').substring(0, 6).toUpperCase()
  
  const baseCode = `${countryCode}-${regionCode}-${cityCode}-${uniquePart}`
  const checkDigit = generateCheckDigit(baseCode)
  
  return `${baseCode}-${checkDigit}`
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting UAC generation for incidents without UACs...')

    // Get incidents without UACs
    const { data: incidents, error: fetchError } = await supabase
      .from('emergency_incidents')
      .select('id, incident_number, city, region, country')
      .is('incident_uac', null)

    if (fetchError) {
      console.error('Error fetching incidents:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch incidents' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!incidents || incidents.length === 0) {
      console.log('No incidents found without UACs')
      return new Response(
        JSON.stringify({ message: 'No incidents found without UACs', updated: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${incidents.length} incidents without UACs`)

    // Generate UACs and update incidents
    const updates = []
    for (const incident of incidents) {
      if (incident.city && incident.region && incident.country) {
        const uac = generateUACForIncident(
          incident.country,
          incident.region,
          incident.city,
          incident.id
        )
        
        updates.push({
          id: incident.id,
          incident_number: incident.incident_number,
          uac: uac
        })

        console.log(`Generated UAC for incident ${incident.incident_number}: ${uac}`)
      } else {
        console.log(`Skipping incident ${incident.incident_number} - missing location data`)
      }
    }

    // Update incidents with generated UACs
    let updatedCount = 0
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('emergency_incidents')
        .update({ incident_uac: update.uac })
        .eq('id', update.id)

      if (updateError) {
        console.error(`Error updating incident ${update.incident_number}:`, updateError)
      } else {
        updatedCount++
        console.log(`Updated incident ${update.incident_number} with UAC: ${update.uac}`)
      }
    }

    console.log(`Successfully updated ${updatedCount} incidents with UACs`)

    return new Response(
      JSON.stringify({ 
        message: `Successfully generated UACs for ${updatedCount} incidents`,
        updated: updatedCount,
        total_found: incidents.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})