/**
 * Unified Address Code (UAC) Generator
 * 
 * This module provides a standardized system for generating unique address codes
 * that follow international best practices for address coding systems.
 * 
 * UAC Format: [COUNTRY]-[REGION]-[CITY]-[SEQUENCE]-[CHECK]
 * Example: GQ-BN-MAL-001A23-7K
 * 
 * Where:
 * - COUNTRY: ISO 3166-1 alpha-2 country code (2 chars)
 * - REGION: Standardized region code (2 chars)
 * - CITY: Standardized city code (3 chars) 
 * - SEQUENCE: Sequential identifier (6 chars alphanumeric)
 * - CHECK: Check digit for validation (2 chars)
 */

import { supabase } from '@/integrations/supabase/client';

// Country codes mapping
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
};

// ISO 3166-2:GQ compliant region codes for Equatorial Guinea
const REGION_CODES: Record<string, string> = {
  'Annobón': 'AN',
  'Bioko Norte': 'BN', 
  'Bioko Sur': 'BS',
  'Centro Sur': 'CS',
  'Djibloho': 'DJ',
  'Kié-Ntem': 'KN',
  'Litoral': 'LI',  // Fixed: LT -> LI per ISO 3166-2:GQ standard
  'Wele-Nzas': 'WN'
};

// Standardized city codes
const CITY_CODES: Record<string, string> = {
  // Bioko Norte
  'Malabo': 'MAL',
  'Rebola': 'REB', 
  'Baney': 'BAN',
  
  // Bioko Sur
  'Luba': 'LUB',
  'Riaba': 'RIA',
  'Moca': 'MOC',
  
  // Litoral
  'Bata': 'BAT',
  'Mbini': 'MBI',
  'Kogo': 'KOG',
  'Acalayong': 'ACA',
  
  // Centro Sur
  'Evinayong': 'EVI',
  'Acurenam': 'ACU',
  'Niefang': 'NIE',
  
  // Djibloho
  'Ciudad de la Paz': 'CDP',
  
  // Kié-Ntem
  'Ebebiyín': 'EBE',
  'Mikomeseng': 'MIK',
  'Ncue': 'NCU',
  'Nsork Nsomo': 'NSO',
  
  // Wele-Nzas
  'Mongomo': 'MON',
  'Añisoc': 'ANI',
  'Aconibe': 'ACO',
  'Nsok': 'NSK',
  
  // Annobón
  'San Antonio de Palé': 'SAP'
};

/**
 * Generate a check digit for UAC validation
 */
function generateCheckDigit(baseCode: string): string {
  // Align with the database algorithm (letters-only A–Z check digits)
  let sum = 0;
  for (let i = 0; i < baseCode.length; i++) {
    const ch = baseCode[i];
    if (ch === '-') continue; // ignore separators
    const upper = ch.toUpperCase();
    let val: number;
    if (/^[0-9]$/.test(upper)) {
      val = parseInt(upper, 10);
    } else if (/^[A-Z]$/.test(upper)) {
      // A -> 10, B -> 11, ... Z -> 35
      val = upper.charCodeAt(0) - 55;
    } else {
      val = 0;
    }
    sum += val;
  }

  const first = String.fromCharCode(65 + (sum % 26));
  const second = String.fromCharCode(65 + ((sum * 7) % 26));
  return first + second;
}

/**
 * Generate the next sequential number for a given location
 */
async function getNextSequenceNumber(countryCode: string, regionCode: string, cityCode: string): Promise<string> {
  try {
    const prefix = `${countryCode}-${regionCode}-${cityCode}-`;
    
    // Get the latest UAC with this prefix
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('uac')
      .like('uac', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.warn('Could not fetch latest UAC, using fallback:', error);
      // Fallback to timestamp-based sequence
      return Date.now().toString(36).substr(-6).toUpperCase().padStart(6, '0');
    }
    
    if (!addresses || addresses.length === 0) {
      return '001A00';
    }
    
    const latestUAC = addresses[0].uac;
    const parts = latestUAC.split('-');
    
    if (parts.length >= 4) {
      const sequencePart = parts[3];
      // Extract numeric part and increment
      const numericPart = sequencePart.match(/^\d+/);
      if (numericPart) {
        const nextNum = parseInt(numericPart[0]) + 1;
        const alphaPart = sequencePart.substring(numericPart[0].length);
        return nextNum.toString().padStart(3, '0') + alphaPart;
      }
    }
    
    // Fallback sequence
    return Date.now().toString(36).substr(-6).toUpperCase().padStart(6, '0');
    
  } catch (error) {
    console.warn('Error generating sequence, using fallback:', error);
    return Date.now().toString(36).substr(-6).toUpperCase().padStart(6, '0');
  }
}

/**
 * Validate if a UAC follows the correct format
 */
export function validateUAC(uac: string): boolean {
  if (!uac || typeof uac !== 'string') return false;
  
  const parts = uac.split('-');
  if (parts.length !== 5) return false;
  
  const [country, region, city, sequence, check] = parts;
  
  // Validate format
  if (country.length !== 2 || region.length !== 2 || city.length !== 3 || 
      sequence.length !== 6 || check.length !== 2) {
    return false;
  }
  
  // Validate check digit
  const baseCode = `${country}-${region}-${city}-${sequence}`;
  const expectedCheck = generateCheckDigit(baseCode);
  
  return check === expectedCheck;
}

/**
 * Generate a standardized UAC for an address
 */
export async function generateUAC(country: string, region: string, city: string): Promise<string> {
  try {
    // Get standardized codes
    const countryCode = COUNTRY_CODES[country] || country.substring(0, 2).toUpperCase();
    const regionCode = REGION_CODES[region] || region.substring(0, 2).toUpperCase();
    const cityCode = CITY_CODES[city] || city.substring(0, 3).toUpperCase();
    
    // Generate sequence number
    const sequence = await getNextSequenceNumber(countryCode, regionCode, cityCode);
    
    // Generate base code
    const baseCode = `${countryCode}-${regionCode}-${cityCode}-${sequence}`;
    
    // Generate check digit
    const checkDigit = generateCheckDigit(baseCode);
    
    return `${baseCode}-${checkDigit}`;
    
  } catch (error) {
    console.error('Error generating UAC:', error);
    
    // Emergency fallback UAC
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FALLBACK-${timestamp}-${random}`;
  }
}

/**
 * Parse a UAC into its components
 */
export function parseUAC(uac: string): {
  country: string;
  region: string;
  city: string;
  sequence: string;
  checkDigit: string;
  isValid: boolean;
} | null {
  if (!validateUAC(uac)) {
    return null;
  }
  
  const parts = uac.split('-');
  return {
    country: parts[0],
    region: parts[1], 
    city: parts[2],
    sequence: parts[3],
    checkDigit: parts[4],
    isValid: true
  };
}

/**
 * Get region and city mappings for UI components
 */
export function getRegionCodes(): Record<string, string> {
  return { ...REGION_CODES };
}

export function getCityCodes(): Record<string, string> {
  return { ...CITY_CODES };
}

export function getCountryCodes(): Record<string, string> {
  return { ...COUNTRY_CODES };
}