import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * GET handler for /api/countries/list endpoint
 * Returns a comprehensive list of all countries in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to the SQLite database instead of DuckDB
    const db = await openDb();
    console.log('SQLite database connection opened');
    
    // Fetch all countries from the database using SQLite instead of DuckDB
    // Use DISTINCT to ensure we don't get duplicates
    const query = `
      SELECT DISTINCT 
        name as name, 
        "alpha-2" as code,
        region,
        "alpha-3" as iso
      FROM country_code
      ORDER BY name ASC
    `;
    
    let countries;
    try {
      countries = await db.all(query);
      console.log(`Retrieved ${countries.length} countries from SQLite database`);
    } catch (error) {
      console.error('Error executing SQLite query:', error);
      throw error;
    } finally {
      await db.close();
      console.log('SQLite database connection closed');
    }

    // Add fallback countries that might not be in the database
    // to ensure comprehensive coverage
    const extraCountries = [
      { name: "Afghanistan", code: "AF", region: "Asia", iso: "AFG" },
      { name: "Albania", code: "AL", region: "Europe", iso: "ALB" },
      { name: "Algeria", code: "DZ", region: "Africa", iso: "DZA" },
      { name: "Andorra", code: "AD", region: "Europe", iso: "AND" },
      { name: "Angola", code: "AO", region: "Africa", iso: "AGO" },
      { name: "Antigua and Barbuda", code: "AG", region: "Americas", iso: "ATG" },
      { name: "Argentina", code: "AR", region: "Americas", iso: "ARG" },
      { name: "Armenia", code: "AM", region: "Asia", iso: "ARM" },
      { name: "Australia", code: "AU", region: "Oceania", iso: "AUS" },
      { name: "Austria", code: "AT", region: "Europe", iso: "AUT" },
      { name: "Azerbaijan", code: "AZ", region: "Asia", iso: "AZE" },
      { name: "Bahamas", code: "BS", region: "Americas", iso: "BHS" },
      { name: "Bahrain", code: "BH", region: "Asia", iso: "BHR" },
      { name: "Bangladesh", code: "BD", region: "Asia", iso: "BGD" },
      { name: "Barbados", code: "BB", region: "Americas", iso: "BRB" },
      { name: "Belarus", code: "BY", region: "Europe", iso: "BLR" },
      { name: "Belgium", code: "BE", region: "Europe", iso: "BEL" },
      { name: "Belize", code: "BZ", region: "Americas", iso: "BLZ" },
      { name: "Benin", code: "BJ", region: "Africa", iso: "BEN" },
      { name: "Bhutan", code: "BT", region: "Asia", iso: "BTN" },
      { name: "Bolivia", code: "BO", region: "Americas", iso: "BOL" },
      { name: "Bosnia and Herzegovina", code: "BA", region: "Europe", iso: "BIH" },
      { name: "Botswana", code: "BW", region: "Africa", iso: "BWA" },
      { name: "Brazil", code: "BR", region: "Americas", iso: "BRA" },
      { name: "Brunei", code: "BN", region: "Asia", iso: "BRN" },
      { name: "Bulgaria", code: "BG", region: "Europe", iso: "BGR" },
      { name: "Burkina Faso", code: "BF", region: "Africa", iso: "BFA" },
      { name: "Burundi", code: "BI", region: "Africa", iso: "BDI" },
      { name: "Cabo Verde", code: "CV", region: "Africa", iso: "CPV" },
      { name: "Cambodia", code: "KH", region: "Asia", iso: "KHM" },
      { name: "Cameroon", code: "CM", region: "Africa", iso: "CMR" },
      { name: "Canada", code: "CA", region: "Americas", iso: "CAN" },
      { name: "Central African Republic", code: "CF", region: "Africa", iso: "CAF" },
      { name: "Chad", code: "TD", region: "Africa", iso: "TCD" },
      { name: "Chile", code: "CL", region: "Americas", iso: "CHL" },
      { name: "China", code: "CN", region: "Asia", iso: "CHN" },
      { name: "Colombia", code: "CO", region: "Americas", iso: "COL" },
      { name: "Comoros", code: "KM", region: "Africa", iso: "COM" },
      { name: "Congo", code: "CG", region: "Africa", iso: "COG" },
      { name: "Costa Rica", code: "CR", region: "Americas", iso: "CRI" },
      { name: "Croatia", code: "HR", region: "Europe", iso: "HRV" },
      { name: "Cuba", code: "CU", region: "Americas", iso: "CUB" },
      { name: "Cyprus", code: "CY", region: "Europe", iso: "CYP" },
      { name: "Czech Republic", code: "CZ", region: "Europe", iso: "CZE" },
      { name: "Denmark", code: "DK", region: "Europe", iso: "DNK" },
      { name: "Djibouti", code: "DJ", region: "Africa", iso: "DJI" },
      { name: "Dominica", code: "DM", region: "Americas", iso: "DMA" },
      { name: "Dominican Republic", code: "DO", region: "Americas", iso: "DOM" },
      { name: "Ecuador", code: "EC", region: "Americas", iso: "ECU" },
      { name: "Egypt", code: "EG", region: "Africa", iso: "EGY" },
      { name: "El Salvador", code: "SV", region: "Americas", iso: "SLV" },
      { name: "Equatorial Guinea", code: "GQ", region: "Africa", iso: "GNQ" },
      { name: "Eritrea", code: "ER", region: "Africa", iso: "ERI" },
      { name: "Estonia", code: "EE", region: "Europe", iso: "EST" },
      { name: "Eswatini", code: "SZ", region: "Africa", iso: "SWZ" },
      { name: "Ethiopia", code: "ET", region: "Africa", iso: "ETH" },
      { name: "Fiji", code: "FJ", region: "Oceania", iso: "FJI" },
      { name: "Finland", code: "FI", region: "Europe", iso: "FIN" },
      { name: "France", code: "FR", region: "Europe", iso: "FRA" },
      { name: "Gabon", code: "GA", region: "Africa", iso: "GAB" },
      { name: "Gambia", code: "GM", region: "Africa", iso: "GMB" },
      { name: "Georgia", code: "GE", region: "Asia", iso: "GEO" },
      { name: "Germany", code: "DE", region: "Europe", iso: "DEU" },
      { name: "Ghana", code: "GH", region: "Africa", iso: "GHA" },
      { name: "Greece", code: "GR", region: "Europe", iso: "GRC" },
      { name: "Grenada", code: "GD", region: "Americas", iso: "GRD" },
      { name: "Guatemala", code: "GT", region: "Americas", iso: "GTM" },
      { name: "Guinea", code: "GN", region: "Africa", iso: "GIN" },
      { name: "Guinea-Bissau", code: "GW", region: "Africa", iso: "GNB" },
      { name: "Guyana", code: "GY", region: "Americas", iso: "GUY" },
      { name: "Haiti", code: "HT", region: "Americas", iso: "HTI" },
      { name: "Holy See", code: "VA", region: "Europe", iso: "VAT" },
      { name: "Honduras", code: "HN", region: "Americas", iso: "HND" },
      { name: "Hungary", code: "HU", region: "Europe", iso: "HUN" },
      { name: "Iceland", code: "IS", region: "Europe", iso: "ISL" },
      { name: "India", code: "IN", region: "Asia", iso: "IND" },
      { name: "Indonesia", code: "ID", region: "Asia", iso: "IDN" },
      { name: "Iran", code: "IR", region: "Asia", iso: "IRN" },
      { name: "Iraq", code: "IQ", region: "Asia", iso: "IRQ" },
      { name: "Ireland", code: "IE", region: "Europe", iso: "IRL" },
      { name: "Israel", code: "IL", region: "Asia", iso: "ISR" },
      { name: "Italy", code: "IT", region: "Europe", iso: "ITA" },
      { name: "Jamaica", code: "JM", region: "Americas", iso: "JAM" },
      { name: "Japan", code: "JP", region: "Asia", iso: "JPN" },
      { name: "Jordan", code: "JO", region: "Asia", iso: "JOR" },
      { name: "Kazakhstan", code: "KZ", region: "Asia", iso: "KAZ" },
      { name: "Kenya", code: "KE", region: "Africa", iso: "KEN" },
      { name: "Kiribati", code: "KI", region: "Oceania", iso: "KIR" },
      { name: "Korea, North", code: "KP", region: "Asia", iso: "PRK" },
      { name: "Korea, South", code: "KR", region: "Asia", iso: "KOR" },
      { name: "Kuwait", code: "KW", region: "Asia", iso: "KWT" },
      { name: "Kyrgyzstan", code: "KG", region: "Asia", iso: "KGZ" },
      { name: "Laos", code: "LA", region: "Asia", iso: "LAO" },
      { name: "Latvia", code: "LV", region: "Europe", iso: "LVA" },
      { name: "Lebanon", code: "LB", region: "Asia", iso: "LBN" },
      { name: "Lesotho", code: "LS", region: "Africa", iso: "LSO" },
      { name: "Liberia", code: "LR", region: "Africa", iso: "LBR" },
      { name: "Libya", code: "LY", region: "Africa", iso: "LBY" },
      { name: "Liechtenstein", code: "LI", region: "Europe", iso: "LIE" },
      { name: "Lithuania", code: "LT", region: "Europe", iso: "LTU" },
      { name: "Luxembourg", code: "LU", region: "Europe", iso: "LUX" },
      { name: "Madagascar", code: "MG", region: "Africa", iso: "MDG" },
      { name: "Malawi", code: "MW", region: "Africa", iso: "MWI" },
      { name: "Malaysia", code: "MY", region: "Asia", iso: "MYS" },
      { name: "Maldives", code: "MV", region: "Asia", iso: "MDV" },
      { name: "Mali", code: "ML", region: "Africa", iso: "MLI" },
      { name: "Malta", code: "MT", region: "Europe", iso: "MLT" },
      { name: "Marshall Islands", code: "MH", region: "Oceania", iso: "MHL" },
      { name: "Mauritania", code: "MR", region: "Africa", iso: "MRT" },
      { name: "Mauritius", code: "MU", region: "Africa", iso: "MUS" },
      { name: "Mexico", code: "MX", region: "Americas", iso: "MEX" },
      { name: "Micronesia", code: "FM", region: "Oceania", iso: "FSM" },
      { name: "Moldova", code: "MD", region: "Europe", iso: "MDA" },
      { name: "Monaco", code: "MC", region: "Europe", iso: "MCO" },
      { name: "Mongolia", code: "MN", region: "Asia", iso: "MNG" },
      { name: "Montenegro", code: "ME", region: "Europe", iso: "MNE" },
      { name: "Morocco", code: "MA", region: "Africa", iso: "MAR" },
      { name: "Mozambique", code: "MZ", region: "Africa", iso: "MOZ" },
      { name: "Myanmar", code: "MM", region: "Asia", iso: "MMR" },
      { name: "Namibia", code: "NA", region: "Africa", iso: "NAM" },
      { name: "Nauru", code: "NR", region: "Oceania", iso: "NRU" },
      { name: "Nepal", code: "NP", region: "Asia", iso: "NPL" },
      { name: "Netherlands", code: "NL", region: "Europe", iso: "NLD" },
      { name: "New Zealand", code: "NZ", region: "Oceania", iso: "NZL" },
      { name: "Nicaragua", code: "NI", region: "Americas", iso: "NIC" },
      { name: "Niger", code: "NE", region: "Africa", iso: "NER" },
      { name: "Nigeria", code: "NG", region: "Africa", iso: "NGA" },
      { name: "North Macedonia", code: "MK", region: "Europe", iso: "MKD" },
      { name: "Norway", code: "NO", region: "Europe", iso: "NOR" },
      { name: "Oman", code: "OM", region: "Asia", iso: "OMN" },
      { name: "Pakistan", code: "PK", region: "Asia", iso: "PAK" },
      { name: "Palau", code: "PW", region: "Oceania", iso: "PLW" },
      { name: "Panama", code: "PA", region: "Americas", iso: "PAN" },
      { name: "Papua New Guinea", code: "PG", region: "Oceania", iso: "PNG" },
      { name: "Paraguay", code: "PY", region: "Americas", iso: "PRY" },
      { name: "Peru", code: "PE", region: "Americas", iso: "PER" },
      { name: "Philippines", code: "PH", region: "Asia", iso: "PHL" },
      { name: "Poland", code: "PL", region: "Europe", iso: "POL" },
      { name: "Portugal", code: "PT", region: "Europe", iso: "PRT" },
      { name: "Qatar", code: "QA", region: "Asia", iso: "QAT" },
      { name: "Romania", code: "RO", region: "Europe", iso: "ROU" },
      { name: "Russia", code: "RU", region: "Europe", iso: "RUS" },
      { name: "Rwanda", code: "RW", region: "Africa", iso: "RWA" },
      { name: "Saint Kitts and Nevis", code: "KN", region: "Americas", iso: "KNA" },
      { name: "Saint Lucia", code: "LC", region: "Americas", iso: "LCA" },
      { name: "Saint Vincent and the Grenadines", code: "VC", region: "Americas", iso: "VCT" },
      { name: "Samoa", code: "WS", region: "Oceania", iso: "WSM" },
      { name: "San Marino", code: "SM", region: "Europe", iso: "SMR" },
      { name: "Sao Tome and Principe", code: "ST", region: "Africa", iso: "STP" },
      { name: "Saudi Arabia", code: "SA", region: "Asia", iso: "SAU" },
      { name: "Senegal", code: "SN", region: "Africa", iso: "SEN" },
      { name: "Serbia", code: "RS", region: "Europe", iso: "SRB" },
      { name: "Seychelles", code: "SC", region: "Africa", iso: "SYC" },
      { name: "Sierra Leone", code: "SL", region: "Africa", iso: "SLE" },
      { name: "Singapore", code: "SG", region: "Asia", iso: "SGP" },
      { name: "Slovakia", code: "SK", region: "Europe", iso: "SVK" },
      { name: "Slovenia", code: "SI", region: "Europe", iso: "SVN" },
      { name: "Solomon Islands", code: "SB", region: "Oceania", iso: "SLB" },
      { name: "Somalia", code: "SO", region: "Africa", iso: "SOM" },
      { name: "South Africa", code: "ZA", region: "Africa", iso: "ZAF" },
      { name: "South Sudan", code: "SS", region: "Africa", iso: "SSD" },
      { name: "Spain", code: "ES", region: "Europe", iso: "ESP" },
      { name: "Sri Lanka", code: "LK", region: "Asia", iso: "LKA" },
      { name: "Sudan", code: "SD", region: "Africa", iso: "SDN" },
      { name: "Suriname", code: "SR", region: "Americas", iso: "SUR" },
      { name: "Sweden", code: "SE", region: "Europe", iso: "SWE" },
      { name: "Switzerland", code: "CH", region: "Europe", iso: "CHE" },
      { name: "Syria", code: "SY", region: "Asia", iso: "SYR" },
      { name: "Taiwan", code: "TW", region: "Asia", iso: "TWN" },
      { name: "Tajikistan", code: "TJ", region: "Asia", iso: "TJK" },
      { name: "Tanzania", code: "TZ", region: "Africa", iso: "TZA" },
      { name: "Thailand", code: "TH", region: "Asia", iso: "THA" },
      { name: "Timor-Leste", code: "TL", region: "Asia", iso: "TLS" },
      { name: "Togo", code: "TG", region: "Africa", iso: "TGO" },
      { name: "Tonga", code: "TO", region: "Oceania", iso: "TON" },
      { name: "Trinidad and Tobago", code: "TT", region: "Americas", iso: "TTO" },
      { name: "Tunisia", code: "TN", region: "Africa", iso: "TUN" },
      { name: "Turkey", code: "TR", region: "Asia", iso: "TUR" },
      { name: "Turkmenistan", code: "TM", region: "Asia", iso: "TKM" },
      { name: "Tuvalu", code: "TV", region: "Oceania", iso: "TUV" },
      { name: "Uganda", code: "UG", region: "Africa", iso: "UGA" },
      { name: "Ukraine", code: "UA", region: "Europe", iso: "UKR" },
      { name: "United Arab Emirates", code: "AE", region: "Asia", iso: "ARE" },
      { name: "United Kingdom", code: "GB", region: "Europe", iso: "GBR" },
      { name: "United States", code: "US", region: "Americas", iso: "USA" },
      { name: "Uruguay", code: "UY", region: "Americas", iso: "URY" },
      { name: "Uzbekistan", code: "UZ", region: "Asia", iso: "UZB" },
      { name: "Vanuatu", code: "VU", region: "Oceania", iso: "VUT" },
      { name: "Venezuela", code: "VE", region: "Americas", iso: "VEN" },
      { name: "Vietnam", code: "VN", region: "Asia", iso: "VNM" },
      { name: "Yemen", code: "YE", region: "Asia", iso: "YEM" },
      { name: "Zambia", code: "ZM", region: "Africa", iso: "ZMB" },
      { name: "Zimbabwe", code: "ZW", region: "Africa", iso: "ZWE" }
    ];

    // Combine database countries with our fallback list
    // and remove duplicates by using name as key
    const countriesMap = new Map();
    
    // Add database countries first
    countries.forEach(country => {
      if (country.name) {
        countriesMap.set(country.name.toLowerCase(), country);
      }
    });
    
    // Add fallback countries only if they don't already exist
    extraCountries.forEach(country => {
      if (!countriesMap.has(country.name.toLowerCase())) {
        countriesMap.set(country.name.toLowerCase(), country);
      }
    });
    
    // Convert map back to array
    const combinedCountries = Array.from(countriesMap.values());
    
    console.log(`API returning ${combinedCountries.length} countries (${countries.length} from DB, ${extraCountries.length} from fallback)`);

    // Return the countries
    return NextResponse.json({
      success: true,
      data: combinedCountries || []
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 