import { countryCodeMapping } from './utils';

/**
 * Enhanced country code conversion utility that provides more robust conversion
 * between alpha-2 and alpha-3 country codes with extra mapping for GeoJSON features.
 * 
 * @param code The country code to convert
 * @param sourceType Optional source type ('alpha2' or 'alpha3')
 * @param targetType Optional target type ('alpha2' or 'alpha3')
 * @returns Converted country code or null if conversion failed
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
 * Maps a country name to an ISO alpha-2 code using various strategies
 */
export function mapCountryNameToAlpha2(countryName: string): string | null {
  if (!countryName) return null;
  
  // Normalize for comparison
  const normalizedName = countryName.toLowerCase().trim();
  
  // Common name variations
  const nameMapping: Record<string, string> = {
    'united states of america': 'US',
    'united states': 'US',
    'usa': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'great britain': 'GB',
    'russian federation': 'RU',
    'russia': 'RU',
    'china': 'CN',
    'people\'s republic of china': 'CN',
    'democratic republic of the congo': 'CD',
    'dr congo': 'CD',
    'south korea': 'KR',
    'republic of korea': 'KR',
    'north korea': 'KP',
    'democratic people\'s republic of korea': 'KP',
    'ivory coast': 'CI',
    'côte d\'ivoire': 'CI',
    'czech republic': 'CZ',
    'czechia': 'CZ',
    'vatican': 'VA',
    'vatican city': 'VA',
    'holy see': 'VA',
    'myanmar': 'MM',
    'burma': 'MM',
    'taiwan': 'TW',
    'republic of china': 'TW',
    'tanzania': 'TZ',
    'united republic of tanzania': 'TZ',
    'venezuela': 'VE',
    'bolivarian republic of venezuela': 'VE',
    'vietnam': 'VN',
    'viet nam': 'VN',
    'syria': 'SY',
    'syrian arab republic': 'SY',
    'macedonia': 'MK',
    'north macedonia': 'MK',
    'republic of north macedonia': 'MK',
    'eswatini': 'SZ',
    'swaziland': 'SZ',
  };
  
  // Direct name match
  if (nameMapping[normalizedName]) {
    return nameMapping[normalizedName];
  }
  
  // Try to find a partial match in the name mapping
  for (const [key, value] of Object.entries(nameMapping)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
} 