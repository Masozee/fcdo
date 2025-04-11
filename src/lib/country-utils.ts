'use client';

import { countryCodeMapping } from './utils';

// No longer importing SQLite directly
// import { getCountries, getCountryByIso } from './sqlite';

// In-memory cache for countries
let countriesCache: CountryData[] | null = null;

/**
 * Interface representing country data from the database
 */
interface CountryData {
  id?: number;
  name: string;
  alpha2: string;
  alpha3: string;
  country_code?: string;
  region?: string;
  sub_region?: string;
  intermediate_region?: string;
}

// Static fallback countries list for when API fails
const fallbackCountries: CountryData[] = [
  { name: "Afghanistan", alpha2: "AF", alpha3: "AFG", region: "Asia" },
  { name: "Albania", alpha2: "AL", alpha3: "ALB", region: "Europe" },
  { name: "Algeria", alpha2: "DZ", alpha3: "DZA", region: "Africa" },
  { name: "Andorra", alpha2: "AD", alpha3: "AND", region: "Europe" },
  { name: "Angola", alpha2: "AO", alpha3: "AGO", region: "Africa" },
  { name: "Argentina", alpha2: "AR", alpha3: "ARG", region: "Americas" },
  { name: "Australia", alpha2: "AU", alpha3: "AUS", region: "Oceania" },
  { name: "Austria", alpha2: "AT", alpha3: "AUT", region: "Europe" },
  { name: "Azerbaijan", alpha2: "AZ", alpha3: "AZE", region: "Asia" },
  { name: "Bahamas", alpha2: "BS", alpha3: "BHS", region: "Americas" },
  { name: "Bahrain", alpha2: "BH", alpha3: "BHR", region: "Asia" },
  { name: "Bangladesh", alpha2: "BD", alpha3: "BGD", region: "Asia" },
  { name: "Barbados", alpha2: "BB", alpha3: "BRB", region: "Americas" },
  { name: "Belarus", alpha2: "BY", alpha3: "BLR", region: "Europe" },
  { name: "Belgium", alpha2: "BE", alpha3: "BEL", region: "Europe" },
  { name: "Belize", alpha2: "BZ", alpha3: "BLZ", region: "Americas" },
  { name: "Benin", alpha2: "BJ", alpha3: "BEN", region: "Africa" },
  { name: "Bhutan", alpha2: "BT", alpha3: "BTN", region: "Asia" },
  { name: "Bolivia", alpha2: "BO", alpha3: "BOL", region: "Americas" },
  { name: "Bosnia and Herzegovina", alpha2: "BA", alpha3: "BIH", region: "Europe" },
  { name: "Botswana", alpha2: "BW", alpha3: "BWA", region: "Africa" },
  { name: "Brazil", alpha2: "BR", alpha3: "BRA", region: "Americas" },
  { name: "Brunei", alpha2: "BN", alpha3: "BRN", region: "Asia" },
  { name: "Bulgaria", alpha2: "BG", alpha3: "BGR", region: "Europe" },
  { name: "Burkina Faso", alpha2: "BF", alpha3: "BFA", region: "Africa" },
  { name: "Burundi", alpha2: "BI", alpha3: "BDI", region: "Africa" },
  { name: "Cambodia", alpha2: "KH", alpha3: "KHM", region: "Asia" },
  { name: "Cameroon", alpha2: "CM", alpha3: "CMR", region: "Africa" },
  { name: "Canada", alpha2: "CA", alpha3: "CAN", region: "Americas" },
  { name: "Chad", alpha2: "TD", alpha3: "TCD", region: "Africa" },
  { name: "Chile", alpha2: "CL", alpha3: "CHL", region: "Americas" },
  { name: "China", alpha2: "CN", alpha3: "CHN", region: "Asia" },
  { name: "Colombia", alpha2: "CO", alpha3: "COL", region: "Americas" },
  { name: "Costa Rica", alpha2: "CR", alpha3: "CRI", region: "Americas" },
  { name: "Croatia", alpha2: "HR", alpha3: "HRV", region: "Europe" },
  { name: "Cuba", alpha2: "CU", alpha3: "CUB", region: "Americas" },
  { name: "Cyprus", alpha2: "CY", alpha3: "CYP", region: "Europe" },
  { name: "Czech Republic", alpha2: "CZ", alpha3: "CZE", region: "Europe" },
  { name: "Denmark", alpha2: "DK", alpha3: "DNK", region: "Europe" },
  { name: "Djibouti", alpha2: "DJ", alpha3: "DJI", region: "Africa" },
  { name: "Dominican Republic", alpha2: "DO", alpha3: "DOM", region: "Americas" },
  { name: "Ecuador", alpha2: "EC", alpha3: "ECU", region: "Americas" },
  { name: "Egypt", alpha2: "EG", alpha3: "EGY", region: "Africa" },
  { name: "El Salvador", alpha2: "SV", alpha3: "SLV", region: "Americas" },
  { name: "Estonia", alpha2: "EE", alpha3: "EST", region: "Europe" },
  { name: "Ethiopia", alpha2: "ET", alpha3: "ETH", region: "Africa" },
  { name: "Fiji", alpha2: "FJ", alpha3: "FJI", region: "Oceania" },
  { name: "Finland", alpha2: "FI", alpha3: "FIN", region: "Europe" },
  { name: "France", alpha2: "FR", alpha3: "FRA", region: "Europe" },
  { name: "Gabon", alpha2: "GA", alpha3: "GAB", region: "Africa" },
  { name: "Gambia", alpha2: "GM", alpha3: "GMB", region: "Africa" },
  { name: "Georgia", alpha2: "GE", alpha3: "GEO", region: "Asia" },
  { name: "Germany", alpha2: "DE", alpha3: "DEU", region: "Europe" },
  { name: "Ghana", alpha2: "GH", alpha3: "GHA", region: "Africa" },
  { name: "Greece", alpha2: "GR", alpha3: "GRC", region: "Europe" },
  { name: "Guatemala", alpha2: "GT", alpha3: "GTM", region: "Americas" },
  { name: "Guinea", alpha2: "GN", alpha3: "GIN", region: "Africa" },
  { name: "Guinea-Bissau", alpha2: "GW", alpha3: "GNB", region: "Africa" },
  { name: "Guyana", alpha2: "GY", alpha3: "GUY", region: "Americas" },
  { name: "Haiti", alpha2: "HT", alpha3: "HTI", region: "Americas" },
  { name: "Honduras", alpha2: "HN", alpha3: "HND", region: "Americas" },
  { name: "Hungary", alpha2: "HU", alpha3: "HUN", region: "Europe" },
  { name: "Iceland", alpha2: "IS", alpha3: "ISL", region: "Europe" },
  { name: "India", alpha2: "IN", alpha3: "IND", region: "Asia" },
  { name: "Indonesia", alpha2: "ID", alpha3: "IDN", region: "Asia" },
  { name: "Iran", alpha2: "IR", alpha3: "IRN", region: "Asia" },
  { name: "Iraq", alpha2: "IQ", alpha3: "IRQ", region: "Asia" },
  { name: "Ireland", alpha2: "IE", alpha3: "IRL", region: "Europe" },
  { name: "Israel", alpha2: "IL", alpha3: "ISR", region: "Asia" },
  { name: "Italy", alpha2: "IT", alpha3: "ITA", region: "Europe" },
  { name: "Jamaica", alpha2: "JM", alpha3: "JAM", region: "Americas" },
  { name: "Japan", alpha2: "JP", alpha3: "JPN", region: "Asia" },
  { name: "Jordan", alpha2: "JO", alpha3: "JOR", region: "Asia" },
  { name: "Kazakhstan", alpha2: "KZ", alpha3: "KAZ", region: "Asia" },
  { name: "Kenya", alpha2: "KE", alpha3: "KEN", region: "Africa" },
  { name: "Kuwait", alpha2: "KW", alpha3: "KWT", region: "Asia" },
  { name: "Kyrgyzstan", alpha2: "KG", alpha3: "KGZ", region: "Asia" },
  { name: "Laos", alpha2: "LA", alpha3: "LAO", region: "Asia" },
  { name: "Latvia", alpha2: "LV", alpha3: "LVA", region: "Europe" },
  { name: "Lebanon", alpha2: "LB", alpha3: "LBN", region: "Asia" },
  { name: "Lesotho", alpha2: "LS", alpha3: "LSO", region: "Africa" },
  { name: "Liberia", alpha2: "LR", alpha3: "LBR", region: "Africa" },
  { name: "Libya", alpha2: "LY", alpha3: "LBY", region: "Africa" },
  { name: "Lithuania", alpha2: "LT", alpha3: "LTU", region: "Europe" },
  { name: "Luxembourg", alpha2: "LU", alpha3: "LUX", region: "Europe" },
  { name: "Madagascar", alpha2: "MG", alpha3: "MDG", region: "Africa" },
  { name: "Malawi", alpha2: "MW", alpha3: "MWI", region: "Africa" },
  { name: "Malaysia", alpha2: "MY", alpha3: "MYS", region: "Asia" },
  { name: "Maldives", alpha2: "MV", alpha3: "MDV", region: "Asia" },
  { name: "Mali", alpha2: "ML", alpha3: "MLI", region: "Africa" },
  { name: "Malta", alpha2: "MT", alpha3: "MLT", region: "Europe" },
  { name: "Mauritania", alpha2: "MR", alpha3: "MRT", region: "Africa" },
  { name: "Mauritius", alpha2: "MU", alpha3: "MUS", region: "Africa" },
  { name: "Mexico", alpha2: "MX", alpha3: "MEX", region: "Americas" },
  { name: "Moldova", alpha2: "MD", alpha3: "MDA", region: "Europe" },
  { name: "Mongolia", alpha2: "MN", alpha3: "MNG", region: "Asia" },
  { name: "Montenegro", alpha2: "ME", alpha3: "MNE", region: "Europe" },
  { name: "Morocco", alpha2: "MA", alpha3: "MAR", region: "Africa" },
  { name: "Mozambique", alpha2: "MZ", alpha3: "MOZ", region: "Africa" },
  { name: "Myanmar", alpha2: "MM", alpha3: "MMR", region: "Asia" },
  { name: "Namibia", alpha2: "NA", alpha3: "NAM", region: "Africa" },
  { name: "Nepal", alpha2: "NP", alpha3: "NPL", region: "Asia" },
  { name: "Netherlands", alpha2: "NL", alpha3: "NLD", region: "Europe" },
  { name: "New Zealand", alpha2: "NZ", alpha3: "NZL", region: "Oceania" },
  { name: "Nicaragua", alpha2: "NI", alpha3: "NIC", region: "Americas" },
  { name: "Niger", alpha2: "NE", alpha3: "NER", region: "Africa" },
  { name: "Nigeria", alpha2: "NG", alpha3: "NGA", region: "Africa" },
  { name: "North Korea", alpha2: "KP", alpha3: "PRK", region: "Asia" },
  { name: "North Macedonia", alpha2: "MK", alpha3: "MKD", region: "Europe" },
  { name: "Norway", alpha2: "NO", alpha3: "NOR", region: "Europe" },
  { name: "Oman", alpha2: "OM", alpha3: "OMN", region: "Asia" },
  { name: "Pakistan", alpha2: "PK", alpha3: "PAK", region: "Asia" },
  { name: "Panama", alpha2: "PA", alpha3: "PAN", region: "Americas" },
  { name: "Papua New Guinea", alpha2: "PG", alpha3: "PNG", region: "Oceania" },
  { name: "Paraguay", alpha2: "PY", alpha3: "PRY", region: "Americas" },
  { name: "Peru", alpha2: "PE", alpha3: "PER", region: "Americas" },
  { name: "Philippines", alpha2: "PH", alpha3: "PHL", region: "Asia" },
  { name: "Poland", alpha2: "PL", alpha3: "POL", region: "Europe" },
  { name: "Portugal", alpha2: "PT", alpha3: "PRT", region: "Europe" },
  { name: "Qatar", alpha2: "QA", alpha3: "QAT", region: "Asia" },
  { name: "Romania", alpha2: "RO", alpha3: "ROU", region: "Europe" },
  { name: "Russia", alpha2: "RU", alpha3: "RUS", region: "Europe" },
  { name: "Rwanda", alpha2: "RW", alpha3: "RWA", region: "Africa" },
  { name: "Saudi Arabia", alpha2: "SA", alpha3: "SAU", region: "Asia" },
  { name: "Senegal", alpha2: "SN", alpha3: "SEN", region: "Africa" },
  { name: "Serbia", alpha2: "RS", alpha3: "SRB", region: "Europe" },
  { name: "Sierra Leone", alpha2: "SL", alpha3: "SLE", region: "Africa" },
  { name: "Singapore", alpha2: "SG", alpha3: "SGP", region: "Asia" },
  { name: "Slovakia", alpha2: "SK", alpha3: "SVK", region: "Europe" },
  { name: "Slovenia", alpha2: "SI", alpha3: "SVN", region: "Europe" },
  { name: "Somalia", alpha2: "SO", alpha3: "SOM", region: "Africa" },
  { name: "South Africa", alpha2: "ZA", alpha3: "ZAF", region: "Africa" },
  { name: "South Korea", alpha2: "KR", alpha3: "KOR", region: "Asia" },
  { name: "South Sudan", alpha2: "SS", alpha3: "SSD", region: "Africa" },
  { name: "Spain", alpha2: "ES", alpha3: "ESP", region: "Europe" },
  { name: "Sri Lanka", alpha2: "LK", alpha3: "LKA", region: "Asia" },
  { name: "Sudan", alpha2: "SD", alpha3: "SDN", region: "Africa" },
  { name: "Sweden", alpha2: "SE", alpha3: "SWE", region: "Europe" },
  { name: "Switzerland", alpha2: "CH", alpha3: "CHE", region: "Europe" },
  { name: "Syria", alpha2: "SY", alpha3: "SYR", region: "Asia" },
  { name: "Taiwan", alpha2: "TW", alpha3: "TWN", region: "Asia" },
  { name: "Tajikistan", alpha2: "TJ", alpha3: "TJK", region: "Asia" },
  { name: "Tanzania", alpha2: "TZ", alpha3: "TZA", region: "Africa" },
  { name: "Thailand", alpha2: "TH", alpha3: "THA", region: "Asia" },
  { name: "Togo", alpha2: "TG", alpha3: "TGO", region: "Africa" },
  { name: "Tunisia", alpha2: "TN", alpha3: "TUN", region: "Africa" },
  { name: "Turkey", alpha2: "TR", alpha3: "TUR", region: "Asia" },
  { name: "Turkmenistan", alpha2: "TM", alpha3: "TKM", region: "Asia" },
  { name: "Uganda", alpha2: "UG", alpha3: "UGA", region: "Africa" },
  { name: "Ukraine", alpha2: "UA", alpha3: "UKR", region: "Europe" },
  { name: "United Arab Emirates", alpha2: "AE", alpha3: "ARE", region: "Asia" },
  { name: "United Kingdom", alpha2: "GB", alpha3: "GBR", region: "Europe" },
  { name: "United States", alpha2: "US", alpha3: "USA", region: "Americas" },
  { name: "Uruguay", alpha2: "UY", alpha3: "URY", region: "Americas" },
  { name: "Uzbekistan", alpha2: "UZ", alpha3: "UZB", region: "Asia" },
  { name: "Venezuela", alpha2: "VE", alpha3: "VEN", region: "Americas" },
  { name: "Vietnam", alpha2: "VN", alpha3: "VNM", region: "Asia" },
  { name: "Yemen", alpha2: "YE", alpha3: "YEM", region: "Asia" },
  { name: "Zambia", alpha2: "ZM", alpha3: "ZMB", region: "Africa" },
  { name: "Zimbabwe", alpha2: "ZW", alpha3: "ZWE", region: "Africa" }
];

/**
 * Load all country data from API into memory cache
 */
async function loadCountriesCache(): Promise<CountryData[]> {
  if (countriesCache && countriesCache.length > 0) {
    return countriesCache;
  }
  
  try {
    // Try to get the countries from the appropriate API endpoint
    // Try each potential port in case the server is running on a different port
    let response;
    try {
      // First try without port (let browser determine)
      response = await fetch('/api/countries/list');
    } catch (e) {
      console.warn('Error fetching from default endpoint, trying port 3001:', e);
      try {
        response = await fetch('http://localhost:3001/api/countries/list');
      } catch (e2) {
        console.warn('Error fetching from port 3001, trying port 3000:', e2);
        response = await fetch('http://localhost:3000/api/countries/list');
      }
    }
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        countriesCache = result.data;
        console.log(`Loaded ${result.data.length} countries into memory cache from API`);
        return result.data;
      } else {
        console.warn('API returned success but no valid data, using fallback data');
        countriesCache = fallbackCountries;
        return fallbackCountries;
      }
    } else {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error loading countries from API:', error);
    console.log('Using fallback countries list instead');
    // Use fallback data
    countriesCache = fallbackCountries;
    return fallbackCountries;
  }
}

/**
 * Clear the countries cache
 */
export function clearCountriesCache() {
  countriesCache = null;
}

/**
 * Enhanced country code conversion utility that provides more robust conversion
 * between alpha-2 and alpha-3 country codes, using the API as primary source.
 * 
 * @param code The country code to convert
 * @param sourceType Optional source type ('alpha2' or 'alpha3')
 * @param targetType Optional target type ('alpha2' or 'alpha3')
 * @returns Converted country code or null if conversion failed
 */
export async function enhancedCountryCodeConverterAsync(
  code: string | null | undefined,
  sourceType?: 'alpha2' | 'alpha3',
  targetType?: 'alpha2' | 'alpha3'
): Promise<string | null> {
  if (!code) return null;
  
  // Normalize the code to uppercase
  const normalizedCode = code.toUpperCase();
  
  // Determine source type if not specified
  if (!sourceType) {
    sourceType = normalizedCode.length === 2 ? 'alpha2' : 'alpha3';
  }
  
  // Determine target type if not specified (default to opposite of source)
  if (!targetType) {
    targetType = sourceType === 'alpha2' ? 'alpha3' : 'alpha2';
  }
  
  // No conversion needed if source and target types are the same
  if (sourceType === targetType) {
    return normalizedCode;
  }
  
  try {
    // First try to get from our countries cache
    const countries = await loadCountriesCache();
    const country = countries.find(c => 
      (sourceType === 'alpha2' && c.alpha2 === normalizedCode) ||
      (sourceType === 'alpha3' && c.alpha3 === normalizedCode)
    );
    
    if (country) {
      return targetType === 'alpha2' ? country.alpha2 : country.alpha3;
    }
  } catch (error) {
    console.error('Error fetching country from cache:', error);
    // Continue with fallback methods
  }
  
  // Fallback to the static mapping if lookup fails
  return enhancedCountryCodeConverter(code, sourceType, targetType);
}

/**
 * Synchronous version of the code converter that uses the static mapping only
 * This is kept for compatibility with existing code
 */
export function enhancedCountryCodeConverter(
  code: string | null | undefined,
  sourceType?: 'alpha2' | 'alpha3',
  targetType?: 'alpha2' | 'alpha3'
): string | null {
  if (!code) return null;
  
  // Normalize the code to uppercase
  const normalizedCode = code.toUpperCase();
  
  // Determine source type if not specified
  if (!sourceType) {
    sourceType = normalizedCode.length === 2 ? 'alpha2' : 'alpha3';
  }
  
  // Determine target type if not specified (default to opposite of source)
  if (!targetType) {
    targetType = sourceType === 'alpha2' ? 'alpha3' : 'alpha2';
  }
  
  // No conversion needed if source and target types are the same
  if (sourceType === targetType) {
    return normalizedCode;
  }
  
  // Use only the static mapping in the synchronous version
  // Convert alpha-3 to alpha-2
  if (sourceType === 'alpha3' && targetType === 'alpha2') {
    return countryCodeMapping[normalizedCode] || null;
  }
  
  // Convert alpha-2 to alpha-3
  if (sourceType === 'alpha2' && targetType === 'alpha3') {
    // Find the alpha-3 code by looking up in countryCodeMapping
    for (const [alpha3, alpha2] of Object.entries(countryCodeMapping)) {
      if (alpha2 === normalizedCode) {
        return alpha3;
      }
    }
  }
  
  return null;
}

/**
 * Maps a country name to its ISO Alpha-2 code using the API
 * @param countryName The country name to map
 * @returns Promise resolving to the ISO Alpha-2 code or null if not found
 */
export async function mapCountryNameToAlpha2Async(countryName: string | null): Promise<string | null> {
  if (!countryName) return null;
  
  // Normalize the country name for lookup
  const normalizedName = countryName.trim();
  
  try {
    // Skip API call and go directly to cache - more reliable
    const countries = await loadCountriesCache();
    
    // Try exact match first
    let country = countries.find(c => 
      c.name.toLowerCase() === normalizedName.toLowerCase()
    );
    
    // If no exact match, try case-insensitive match
    if (!country) {
      country = countries.find(c => 
        c.name.toLowerCase().includes(normalizedName.toLowerCase()) || 
        normalizedName.toLowerCase().includes(c.name.toLowerCase())
      );
    }
    
    if (country) {
      console.log(`Found country in cache: ${country.name} -> ${country.alpha2}`);
      return country.alpha2;
    }
    
    // Fallback to hardcoded mapping
    return mapCountryNameToAlpha2(countryName);
  } catch (error) {
    console.error('Error mapping country name to Alpha-2:', error);
    // Fallback to hardcoded mapping
    return mapCountryNameToAlpha2(countryName);
  }
}

/**
 * Legacy function that uses a hardcoded mapping for country names to Alpha-2 codes
 * Kept for compatibility with existing code
 */
export function mapCountryNameToAlpha2(countryName: string | null): string | null {
  if (!countryName) return null;
  
  // Normalize the country name for lookup
  const normalizedName = countryName.trim().toLowerCase();
  
  // Common name variations hardcoded for fallback
  const nameMapping: Record<string, string> = {
    'united states': 'US',
    'united states of america': 'US',
    'usa': 'US',
    'u.s.a.': 'US',
    'u.s.': 'US',
    'america': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'great britain': 'GB',
    'england': 'GB',
    'russian federation': 'RU',
    'russia': 'RU',
    'china': 'CN',
    'people\'s republic of china': 'CN',
    'republic of china': 'TW',
    'taiwan': 'TW',
    'taiwan, province of china': 'TW',
    'hong kong': 'HK',
    'south korea': 'KR',
    'korea, republic of': 'KR',
    'republic of korea': 'KR',
    'north korea': 'KP',
    'democratic people\'s republic of korea': 'KP',
    'dprk': 'KP',
    'iran': 'IR',
    'islamic republic of iran': 'IR',
    'venezuela': 'VE',
    'bolivarian republic of venezuela': 'VE',
    'syria': 'SY',
    'syrian arab republic': 'SY',
    'tanzania': 'TZ',
    'united republic of tanzania': 'TZ',
    'vietnam': 'VN',
    'viet nam': 'VN',
    'laos': 'LA',
    'lao people\'s democratic republic': 'LA',
    'burma': 'MM',
    'myanmar': 'MM',
    'democratic republic of the congo': 'CD',
    'dr congo': 'CD',
    'ivory coast': 'CI',
    'côte d\'ivoire': 'CI',
    'czech republic': 'CZ',
    'czechia': 'CZ',
    'vatican': 'VA',
    'vatican city': 'VA',
    'holy see': 'VA',
    'macedonia': 'MK',
    'north macedonia': 'MK',
    'eswatini': 'SZ',
    'swaziland': 'SZ'
  };
  
  // Case-insensitive lookup
  return nameMapping[normalizedName] || null;
}

/**
 * Utility function to map a country GeoJSON feature to an ISO code
 * @param feature The GeoJSON feature representing a country
 * @returns The ISO code if found
 */
export async function mapCountryNameToIsoAsync(feature: any): Promise<string | null> {
  if (!feature || !feature.properties) return null;
  
  const countryName = feature.properties.name;
  if (!countryName) return null;
  
  // Try to map the name to an alpha-2 code
  const alpha2 = await mapCountryNameToAlpha2Async(countryName);
  if (alpha2) return alpha2;
  
  // If we have an ID in the feature (usually alpha-3), try to convert it
  if (feature.id) {
    // Most GeoJSON features use alpha-3 as the ID
    const alpha2FromId = await enhancedCountryCodeConverterAsync(feature.id, 'alpha3', 'alpha2');
    if (alpha2FromId) return alpha2FromId;
  }
  
  return null;
}

/**
 * Synchronous version for compatibility
 */
export function mapCountryNameToIso(feature: any): string | null {
  if (!feature || !feature.properties) return null;
  
  const countryName = feature.properties.name;
  if (!countryName) return null;
  
  // Try to map the name to an alpha-2 code
  const alpha2 = mapCountryNameToAlpha2(countryName);
  if (alpha2) return alpha2;
  
  // If we have an ID in the feature (usually alpha-3), try to convert it
  if (feature.id) {
    // Most GeoJSON features use alpha-3 as the ID
    const alpha2FromId = enhancedCountryCodeConverter(feature.id, 'alpha3', 'alpha2');
    if (alpha2FromId) return alpha2FromId;
  }
  
  return null;
} 