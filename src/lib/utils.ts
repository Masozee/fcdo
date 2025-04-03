import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('en-GB').format(value);
}

/**
 * Country code conversion mapping between ISO alpha-2 and alpha-3 codes
 */
export const countryCodeMapping: Record<string, string> = {
  // Alpha-3 to Alpha-2 mapping
  'AFG': 'AF', // Afghanistan
  'ALB': 'AL', // Albania
  'DZA': 'DZ', // Algeria
  'AND': 'AD', // Andorra
  'AGO': 'AO', // Angola
  'ATG': 'AG', // Antigua and Barbuda
  'ARG': 'AR', // Argentina
  'ARM': 'AM', // Armenia
  'AUS': 'AU', // Australia
  'AUT': 'AT', // Austria
  'AZE': 'AZ', // Azerbaijan
  'BHS': 'BS', // Bahamas
  'BHR': 'BH', // Bahrain
  'BGD': 'BD', // Bangladesh
  'BRB': 'BB', // Barbados
  'BLR': 'BY', // Belarus
  'BEL': 'BE', // Belgium
  'BLZ': 'BZ', // Belize
  'BEN': 'BJ', // Benin
  'BTN': 'BT', // Bhutan
  'BOL': 'BO', // Bolivia
  'BIH': 'BA', // Bosnia and Herzegovina
  'BWA': 'BW', // Botswana
  'BRA': 'BR', // Brazil
  'BRN': 'BN', // Brunei
  'BGR': 'BG', // Bulgaria
  'BFA': 'BF', // Burkina Faso
  'BDI': 'BI', // Burundi
  'KHM': 'KH', // Cambodia
  'CMR': 'CM', // Cameroon
  'CAN': 'CA', // Canada
  'CPV': 'CV', // Cape Verde
  'CAF': 'CF', // Central African Republic
  'TCD': 'TD', // Chad
  'CHL': 'CL', // Chile
  'CHN': 'CN', // China
  'COL': 'CO', // Colombia
  'COM': 'KM', // Comoros
  'COG': 'CG', // Congo
  'COD': 'CD', // Democratic Republic of the Congo
  'CRI': 'CR', // Costa Rica
  'CIV': 'CI', // Côte d'Ivoire
  'HRV': 'HR', // Croatia
  'CUB': 'CU', // Cuba
  'CYP': 'CY', // Cyprus
  'CZE': 'CZ', // Czech Republic
  'DNK': 'DK', // Denmark
  'DJI': 'DJ', // Djibouti
  'DMA': 'DM', // Dominica
  'DOM': 'DO', // Dominican Republic
  'ECU': 'EC', // Ecuador
  'EGY': 'EG', // Egypt
  'SLV': 'SV', // El Salvador
  'GNQ': 'GQ', // Equatorial Guinea
  'ERI': 'ER', // Eritrea
  'EST': 'EE', // Estonia
  'SWZ': 'SZ', // Eswatini (formerly Swaziland)
  'ETH': 'ET', // Ethiopia
  'FJI': 'FJ', // Fiji
  'FIN': 'FI', // Finland
  'FRA': 'FR', // France
  'GAB': 'GA', // Gabon
  'GMB': 'GM', // Gambia
  'GEO': 'GE', // Georgia
  'DEU': 'DE', // Germany
  'GHA': 'GH', // Ghana
  'GRC': 'GR', // Greece
  'GRD': 'GD', // Grenada
  'GTM': 'GT', // Guatemala
  'GIN': 'GN', // Guinea
  'GNB': 'GW', // Guinea-Bissau
  'GUY': 'GY', // Guyana
  'HTI': 'HT', // Haiti
  'HND': 'HN', // Honduras
  'HUN': 'HU', // Hungary
  'ISL': 'IS', // Iceland
  'IND': 'IN', // India
  'IDN': 'ID', // Indonesia
  'IRN': 'IR', // Iran
  'IRQ': 'IQ', // Iraq
  'IRL': 'IE', // Ireland
  'ISR': 'IL', // Israel
  'ITA': 'IT', // Italy
  'JAM': 'JM', // Jamaica
  'JPN': 'JP', // Japan
  'JOR': 'JO', // Jordan
  'KAZ': 'KZ', // Kazakhstan
  'KEN': 'KE', // Kenya
  'KIR': 'KI', // Kiribati
  'PRK': 'KP', // North Korea
  'KOR': 'KR', // South Korea
  'KWT': 'KW', // Kuwait
  'KGZ': 'KG', // Kyrgyzstan
  'LAO': 'LA', // Laos
  'LVA': 'LV', // Latvia
  'LBN': 'LB', // Lebanon
  'LSO': 'LS', // Lesotho
  'LBR': 'LR', // Liberia
  'LBY': 'LY', // Libya
  'LIE': 'LI', // Liechtenstein
  'LTU': 'LT', // Lithuania
  'LUX': 'LU', // Luxembourg
  'MDG': 'MG', // Madagascar
  'MWI': 'MW', // Malawi
  'MYS': 'MY', // Malaysia
  'MDV': 'MV', // Maldives
  'MLI': 'ML', // Mali
  'MLT': 'MT', // Malta
  'MHL': 'MH', // Marshall Islands
  'MRT': 'MR', // Mauritania
  'MUS': 'MU', // Mauritius
  'MEX': 'MX', // Mexico
  'FSM': 'FM', // Micronesia
  'MDA': 'MD', // Moldova
  'MCO': 'MC', // Monaco
  'MNG': 'MN', // Mongolia
  'MNE': 'ME', // Montenegro
  'MAR': 'MA', // Morocco
  'MOZ': 'MZ', // Mozambique
  'MMR': 'MM', // Myanmar
  'NAM': 'NA', // Namibia
  'NRU': 'NR', // Nauru
  'NPL': 'NP', // Nepal
  'NLD': 'NL', // Netherlands
  'NZL': 'NZ', // New Zealand
  'NIC': 'NI', // Nicaragua
  'NER': 'NE', // Niger
  'NGA': 'NG', // Nigeria
  'MKD': 'MK', // North Macedonia
  'NOR': 'NO', // Norway
  'OMN': 'OM', // Oman
  'PAK': 'PK', // Pakistan
  'PLW': 'PW', // Palau
  'PSE': 'PS', // Palestine
  'PAN': 'PA', // Panama
  'PNG': 'PG', // Papua New Guinea
  'PRY': 'PY', // Paraguay
  'PER': 'PE', // Peru
  'PHL': 'PH', // Philippines
  'POL': 'PL', // Poland
  'PRT': 'PT', // Portugal
  'QAT': 'QA', // Qatar
  'ROU': 'RO', // Romania
  'RUS': 'RU', // Russia
  'RWA': 'RW', // Rwanda
  'KNA': 'KN', // Saint Kitts and Nevis
  'LCA': 'LC', // Saint Lucia
  'VCT': 'VC', // Saint Vincent and the Grenadines
  'WSM': 'WS', // Samoa
  'SMR': 'SM', // San Marino
  'STP': 'ST', // Sao Tome and Principe
  'SAU': 'SA', // Saudi Arabia
  'SEN': 'SN', // Senegal
  'SRB': 'RS', // Serbia
  'SYC': 'SC', // Seychelles
  'SLE': 'SL', // Sierra Leone
  'SGP': 'SG', // Singapore
  'SVK': 'SK', // Slovakia
  'SVN': 'SI', // Slovenia
  'SLB': 'SB', // Solomon Islands
  'SOM': 'SO', // Somalia
  'ZAF': 'ZA', // South Africa
  'SSD': 'SS', // South Sudan
  'ESP': 'ES', // Spain
  'LKA': 'LK', // Sri Lanka
  'SDN': 'SD', // Sudan
  'SUR': 'SR', // Suriname
  'SWE': 'SE', // Sweden
  'CHE': 'CH', // Switzerland
  'SYR': 'SY', // Syria
  'TWN': 'TW', // Taiwan
  'TJK': 'TJ', // Tajikistan
  'TZA': 'TZ', // Tanzania
  'THA': 'TH', // Thailand
  'TLS': 'TL', // Timor-Leste
  'TGO': 'TG', // Togo
  'TON': 'TO', // Tonga
  'TTO': 'TT', // Trinidad and Tobago
  'TUN': 'TN', // Tunisia
  'TUR': 'TR', // Turkey
  'TKM': 'TM', // Turkmenistan
  'TUV': 'TV', // Tuvalu
  'UGA': 'UG', // Uganda
  'UKR': 'UA', // Ukraine
  'ARE': 'AE', // United Arab Emirates
  'GBR': 'GB', // United Kingdom
  'USA': 'US', // United States
  'URY': 'UY', // Uruguay
  'UZB': 'UZ', // Uzbekistan
  'VUT': 'VU', // Vanuatu
  'VAT': 'VA', // Vatican City
  'VEN': 'VE', // Venezuela
  'VNM': 'VN', // Vietnam
  'YEM': 'YE', // Yemen
  'ZMB': 'ZM', // Zambia
  'ZWE': 'ZW', // Zimbabwe
};

/**
 * Generate the reverse mapping from alpha-2 to alpha-3 codes
 */
export const alpha2ToAlpha3 = Object.entries(countryCodeMapping).reduce(
  (acc, [alpha3, alpha2]) => {
    acc[alpha2] = alpha3;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Convert between alpha-2 and alpha-3 country codes
 * @param code - The country code to convert
 * @returns The converted country code or the original if not found
 */
export function convertCountryCode(code: string): string {
  if (!code) return code;
  
  // Normalize the code to uppercase
  const normalizedCode = code.toUpperCase();
  
  // Check if it's alpha-3 (3 characters)
  if (normalizedCode.length === 3) {
    return countryCodeMapping[normalizedCode] || normalizedCode;
  }
  
  // Check if it's alpha-2 (2 characters)
  if (normalizedCode.length === 2) {
    return alpha2ToAlpha3[normalizedCode] || normalizedCode;
  }
  
  // Return the original code if it doesn't match the expected formats
  return code;
}
