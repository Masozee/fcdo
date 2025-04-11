import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * GET handler for /api/countries/list endpoint
 * Returns a comprehensive list of all countries in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all countries from the database
    // Use DISTINCT to ensure we don't get duplicates
    const countries = await db.query(`
      SELECT DISTINCT 
        country_name as name, 
        country_code as code,
        region,
        iso_code as iso
      FROM countries
      ORDER BY country_name ASC
    `);

    // Add fallback countries that might not be in the database
    // to ensure comprehensive coverage
    const extraCountries = [
      { name: "Afghanistan", code: "AF", region: "Asia", iso: "AF" },
      { name: "Albania", code: "AL", region: "Europe", iso: "AL" },
      { name: "Algeria", code: "DZ", region: "Africa", iso: "DZ" },
      { name: "Andorra", code: "AD", region: "Europe", iso: "AD" },
      { name: "Angola", code: "AO", region: "Africa", iso: "AO" },
      { name: "Antigua and Barbuda", code: "AG", region: "Americas", iso: "AG" },
      { name: "Argentina", code: "AR", region: "Americas", iso: "AR" },
      { name: "Armenia", code: "AM", region: "Asia", iso: "AM" },
      { name: "Australia", code: "AU", region: "Oceania", iso: "AU" },
      { name: "Austria", code: "AT", region: "Europe", iso: "AT" },
      { name: "Azerbaijan", code: "AZ", region: "Asia", iso: "AZ" },
      { name: "Bahamas", code: "BS", region: "Americas", iso: "BS" },
      { name: "Bahrain", code: "BH", region: "Asia", iso: "BH" },
      { name: "Bangladesh", code: "BD", region: "Asia", iso: "BD" },
      { name: "Barbados", code: "BB", region: "Americas", iso: "BB" },
      { name: "Belarus", code: "BY", region: "Europe", iso: "BY" },
      { name: "Belgium", code: "BE", region: "Europe", iso: "BE" },
      { name: "Belize", code: "BZ", region: "Americas", iso: "BZ" },
      { name: "Benin", code: "BJ", region: "Africa", iso: "BJ" },
      { name: "Bhutan", code: "BT", region: "Asia", iso: "BT" },
      { name: "Bolivia", code: "BO", region: "Americas", iso: "BO" },
      { name: "Bosnia and Herzegovina", code: "BA", region: "Europe", iso: "BA" },
      { name: "Botswana", code: "BW", region: "Africa", iso: "BW" },
      { name: "Brazil", code: "BR", region: "Americas", iso: "BR" },
      { name: "Brunei", code: "BN", region: "Asia", iso: "BN" },
      { name: "Bulgaria", code: "BG", region: "Europe", iso: "BG" },
      { name: "Burkina Faso", code: "BF", region: "Africa", iso: "BF" },
      { name: "Burundi", code: "BI", region: "Africa", iso: "BI" },
      { name: "Cabo Verde", code: "CV", region: "Africa", iso: "CV" },
      { name: "Cambodia", code: "KH", region: "Asia", iso: "KH" },
      { name: "Cameroon", code: "CM", region: "Africa", iso: "CM" },
      { name: "Canada", code: "CA", region: "Americas", iso: "CA" },
      { name: "Central African Republic", code: "CF", region: "Africa", iso: "CF" },
      { name: "Chad", code: "TD", region: "Africa", iso: "TD" },
      { name: "Chile", code: "CL", region: "Americas", iso: "CL" },
      { name: "China", code: "CN", region: "Asia", iso: "CN" },
      { name: "Colombia", code: "CO", region: "Americas", iso: "CO" },
      { name: "Comoros", code: "KM", region: "Africa", iso: "KM" },
      { name: "Congo", code: "CG", region: "Africa", iso: "CG" },
      { name: "Costa Rica", code: "CR", region: "Americas", iso: "CR" },
      { name: "Croatia", code: "HR", region: "Europe", iso: "HR" },
      { name: "Cuba", code: "CU", region: "Americas", iso: "CU" },
      { name: "Cyprus", code: "CY", region: "Europe", iso: "CY" },
      { name: "Czech Republic", code: "CZ", region: "Europe", iso: "CZ" },
      { name: "Denmark", code: "DK", region: "Europe", iso: "DK" },
      { name: "Djibouti", code: "DJ", region: "Africa", iso: "DJ" },
      { name: "Dominica", code: "DM", region: "Americas", iso: "DM" },
      { name: "Dominican Republic", code: "DO", region: "Americas", iso: "DO" },
      { name: "Ecuador", code: "EC", region: "Americas", iso: "EC" },
      { name: "Egypt", code: "EG", region: "Africa", iso: "EG" },
      { name: "El Salvador", code: "SV", region: "Americas", iso: "SV" },
      { name: "Equatorial Guinea", code: "GQ", region: "Africa", iso: "GQ" },
      { name: "Eritrea", code: "ER", region: "Africa", iso: "ER" },
      { name: "Estonia", code: "EE", region: "Europe", iso: "EE" },
      { name: "Eswatini", code: "SZ", region: "Africa", iso: "SZ" },
      { name: "Ethiopia", code: "ET", region: "Africa", iso: "ET" },
      { name: "Fiji", code: "FJ", region: "Oceania", iso: "FJ" },
      { name: "Finland", code: "FI", region: "Europe", iso: "FI" },
      { name: "France", code: "FR", region: "Europe", iso: "FR" },
      { name: "Gabon", code: "GA", region: "Africa", iso: "GA" },
      { name: "Gambia", code: "GM", region: "Africa", iso: "GM" },
      { name: "Georgia", code: "GE", region: "Asia", iso: "GE" },
      { name: "Germany", code: "DE", region: "Europe", iso: "DE" },
      { name: "Ghana", code: "GH", region: "Africa", iso: "GH" },
      { name: "Greece", code: "GR", region: "Europe", iso: "GR" },
      { name: "Grenada", code: "GD", region: "Americas", iso: "GD" },
      { name: "Guatemala", code: "GT", region: "Americas", iso: "GT" },
      { name: "Guinea", code: "GN", region: "Africa", iso: "GN" },
      { name: "Guinea-Bissau", code: "GW", region: "Africa", iso: "GW" },
      { name: "Guyana", code: "GY", region: "Americas", iso: "GY" },
      { name: "Haiti", code: "HT", region: "Americas", iso: "HT" },
      { name: "Holy See", code: "VA", region: "Europe", iso: "VA" },
      { name: "Honduras", code: "HN", region: "Americas", iso: "HN" },
      { name: "Hungary", code: "HU", region: "Europe", iso: "HU" },
      { name: "Iceland", code: "IS", region: "Europe", iso: "IS" },
      { name: "India", code: "IN", region: "Asia", iso: "IN" },
      { name: "Indonesia", code: "ID", region: "Asia", iso: "ID" },
      { name: "Iran", code: "IR", region: "Asia", iso: "IR" },
      { name: "Iraq", code: "IQ", region: "Asia", iso: "IQ" },
      { name: "Ireland", code: "IE", region: "Europe", iso: "IE" },
      { name: "Israel", code: "IL", region: "Asia", iso: "IL" },
      { name: "Italy", code: "IT", region: "Europe", iso: "IT" },
      { name: "Jamaica", code: "JM", region: "Americas", iso: "JM" },
      { name: "Japan", code: "JP", region: "Asia", iso: "JP" },
      { name: "Jordan", code: "JO", region: "Asia", iso: "JO" },
      { name: "Kazakhstan", code: "KZ", region: "Asia", iso: "KZ" },
      { name: "Kenya", code: "KE", region: "Africa", iso: "KE" },
      { name: "Kiribati", code: "KI", region: "Oceania", iso: "KI" },
      { name: "Korea, North", code: "KP", region: "Asia", iso: "KP" },
      { name: "Korea, South", code: "KR", region: "Asia", iso: "KR" },
      { name: "Kuwait", code: "KW", region: "Asia", iso: "KW" },
      { name: "Kyrgyzstan", code: "KG", region: "Asia", iso: "KG" },
      { name: "Laos", code: "LA", region: "Asia", iso: "LA" },
      { name: "Latvia", code: "LV", region: "Europe", iso: "LV" },
      { name: "Lebanon", code: "LB", region: "Asia", iso: "LB" },
      { name: "Lesotho", code: "LS", region: "Africa", iso: "LS" },
      { name: "Liberia", code: "LR", region: "Africa", iso: "LR" },
      { name: "Libya", code: "LY", region: "Africa", iso: "LY" },
      { name: "Liechtenstein", code: "LI", region: "Europe", iso: "LI" },
      { name: "Lithuania", code: "LT", region: "Europe", iso: "LT" },
      { name: "Luxembourg", code: "LU", region: "Europe", iso: "LU" },
      { name: "Madagascar", code: "MG", region: "Africa", iso: "MG" },
      { name: "Malawi", code: "MW", region: "Africa", iso: "MW" },
      { name: "Malaysia", code: "MY", region: "Asia", iso: "MY" },
      { name: "Maldives", code: "MV", region: "Asia", iso: "MV" },
      { name: "Mali", code: "ML", region: "Africa", iso: "ML" },
      { name: "Malta", code: "MT", region: "Europe", iso: "MT" },
      { name: "Marshall Islands", code: "MH", region: "Oceania", iso: "MH" },
      { name: "Mauritania", code: "MR", region: "Africa", iso: "MR" },
      { name: "Mauritius", code: "MU", region: "Africa", iso: "MU" },
      { name: "Mexico", code: "MX", region: "Americas", iso: "MX" },
      { name: "Micronesia", code: "FM", region: "Oceania", iso: "FM" },
      { name: "Moldova", code: "MD", region: "Europe", iso: "MD" },
      { name: "Monaco", code: "MC", region: "Europe", iso: "MC" },
      { name: "Mongolia", code: "MN", region: "Asia", iso: "MN" },
      { name: "Montenegro", code: "ME", region: "Europe", iso: "ME" },
      { name: "Morocco", code: "MA", region: "Africa", iso: "MA" },
      { name: "Mozambique", code: "MZ", region: "Africa", iso: "MZ" },
      { name: "Myanmar", code: "MM", region: "Asia", iso: "MM" },
      { name: "Namibia", code: "NA", region: "Africa", iso: "NA" },
      { name: "Nauru", code: "NR", region: "Oceania", iso: "NR" },
      { name: "Nepal", code: "NP", region: "Asia", iso: "NP" },
      { name: "Netherlands", code: "NL", region: "Europe", iso: "NL" },
      { name: "New Zealand", code: "NZ", region: "Oceania", iso: "NZ" },
      { name: "Nicaragua", code: "NI", region: "Americas", iso: "NI" },
      { name: "Niger", code: "NE", region: "Africa", iso: "NE" },
      { name: "Nigeria", code: "NG", region: "Africa", iso: "NG" },
      { name: "North Macedonia", code: "MK", region: "Europe", iso: "MK" },
      { name: "Norway", code: "NO", region: "Europe", iso: "NO" },
      { name: "Oman", code: "OM", region: "Asia", iso: "OM" },
      { name: "Pakistan", code: "PK", region: "Asia", iso: "PK" },
      { name: "Palau", code: "PW", region: "Oceania", iso: "PW" },
      { name: "Panama", code: "PA", region: "Americas", iso: "PA" },
      { name: "Papua New Guinea", code: "PG", region: "Oceania", iso: "PG" },
      { name: "Paraguay", code: "PY", region: "Americas", iso: "PY" },
      { name: "Peru", code: "PE", region: "Americas", iso: "PE" },
      { name: "Philippines", code: "PH", region: "Asia", iso: "PH" },
      { name: "Poland", code: "PL", region: "Europe", iso: "PL" },
      { name: "Portugal", code: "PT", region: "Europe", iso: "PT" },
      { name: "Qatar", code: "QA", region: "Asia", iso: "QA" },
      { name: "Romania", code: "RO", region: "Europe", iso: "RO" },
      { name: "Russia", code: "RU", region: "Europe", iso: "RU" },
      { name: "Rwanda", code: "RW", region: "Africa", iso: "RW" },
      { name: "Saint Kitts and Nevis", code: "KN", region: "Americas", iso: "KN" },
      { name: "Saint Lucia", code: "LC", region: "Americas", iso: "LC" },
      { name: "Saint Vincent and the Grenadines", code: "VC", region: "Americas", iso: "VC" },
      { name: "Samoa", code: "WS", region: "Oceania", iso: "WS" },
      { name: "San Marino", code: "SM", region: "Europe", iso: "SM" },
      { name: "Sao Tome and Principe", code: "ST", region: "Africa", iso: "ST" },
      { name: "Saudi Arabia", code: "SA", region: "Asia", iso: "SA" },
      { name: "Senegal", code: "SN", region: "Africa", iso: "SN" },
      { name: "Serbia", code: "RS", region: "Europe", iso: "RS" },
      { name: "Seychelles", code: "SC", region: "Africa", iso: "SC" },
      { name: "Sierra Leone", code: "SL", region: "Africa", iso: "SL" },
      { name: "Singapore", code: "SG", region: "Asia", iso: "SG" },
      { name: "Slovakia", code: "SK", region: "Europe", iso: "SK" },
      { name: "Slovenia", code: "SI", region: "Europe", iso: "SI" },
      { name: "Solomon Islands", code: "SB", region: "Oceania", iso: "SB" },
      { name: "Somalia", code: "SO", region: "Africa", iso: "SO" },
      { name: "South Africa", code: "ZA", region: "Africa", iso: "ZA" },
      { name: "South Sudan", code: "SS", region: "Africa", iso: "SS" },
      { name: "Spain", code: "ES", region: "Europe", iso: "ES" },
      { name: "Sri Lanka", code: "LK", region: "Asia", iso: "LK" },
      { name: "Sudan", code: "SD", region: "Africa", iso: "SD" },
      { name: "Suriname", code: "SR", region: "Americas", iso: "SR" },
      { name: "Sweden", code: "SE", region: "Europe", iso: "SE" },
      { name: "Switzerland", code: "CH", region: "Europe", iso: "CH" },
      { name: "Syria", code: "SY", region: "Asia", iso: "SY" },
      { name: "Taiwan", code: "TW", region: "Asia", iso: "TW" },
      { name: "Tajikistan", code: "TJ", region: "Asia", iso: "TJ" },
      { name: "Tanzania", code: "TZ", region: "Africa", iso: "TZ" },
      { name: "Thailand", code: "TH", region: "Asia", iso: "TH" },
      { name: "Timor-Leste", code: "TL", region: "Asia", iso: "TL" },
      { name: "Togo", code: "TG", region: "Africa", iso: "TG" },
      { name: "Tonga", code: "TO", region: "Oceania", iso: "TO" },
      { name: "Trinidad and Tobago", code: "TT", region: "Americas", iso: "TT" },
      { name: "Tunisia", code: "TN", region: "Africa", iso: "TN" },
      { name: "Turkey", code: "TR", region: "Asia", iso: "TR" },
      { name: "Turkmenistan", code: "TM", region: "Asia", iso: "TM" },
      { name: "Tuvalu", code: "TV", region: "Oceania", iso: "TV" },
      { name: "Uganda", code: "UG", region: "Africa", iso: "UG" },
      { name: "Ukraine", code: "UA", region: "Europe", iso: "UA" },
      { name: "United Arab Emirates", code: "AE", region: "Asia", iso: "AE" },
      { name: "United Kingdom", code: "GB", region: "Europe", iso: "GB" },
      { name: "United States", code: "US", region: "Americas", iso: "US" },
      { name: "Uruguay", code: "UY", region: "Americas", iso: "UY" },
      { name: "Uzbekistan", code: "UZ", region: "Asia", iso: "UZ" },
      { name: "Vanuatu", code: "VU", region: "Oceania", iso: "VU" },
      { name: "Venezuela", code: "VE", region: "Americas", iso: "VE" },
      { name: "Vietnam", code: "VN", region: "Asia", iso: "VN" },
      { name: "Yemen", code: "YE", region: "Asia", iso: "YE" },
      { name: "Zambia", code: "ZM", region: "Africa", iso: "ZM" },
      { name: "Zimbabwe", code: "ZW", region: "Africa", iso: "ZW" }
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
        error: 'Failed to fetch countries' 
      },
      { status: 500 }
    );
  }
} 