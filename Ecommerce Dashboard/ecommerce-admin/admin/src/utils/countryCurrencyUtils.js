/**
 * Shared utility for consistent country and currency fetching across admin panel
 * Ensures no duplicates and consistent data structure (Shopify-style)
 */

/**
 * Normalizes country codes (e.g., IND -> IN, USA -> US, DEU -> DE)
 * @param {string} countryCode - Country code to normalize
 * @returns {string} Normalized 2-letter country code
 */
function normalizeCountryCode(countryCode) {
  if (!countryCode) return null;
  
  const code = countryCode.toUpperCase();
  
  // Map 3-letter codes and variations to 2-letter codes
  const normalizationMap = {
    // Standard variations
    'USA': 'US', 'IND': 'IN', 'DEU': 'DE', 'GBR': 'GB', 'UK': 'GB',
    'AUS': 'AU', 'CAN': 'CA', 'JPN': 'JP', 'SAU': 'SA', 'CHN': 'CN',
    'BRA': 'BR', 'SGP': 'SG', 'CHE': 'CH', 'ZAF': 'ZA', 'NZL': 'NZ',
    'ARE': 'AE',
    // European Union countries that use EUR (map to DE)
    'EU': 'DE', 'ESP': 'DE', 'FRA': 'DE', 'ITA': 'DE', 'NLD': 'DE',
    'BEL': 'DE', 'AUT': 'DE', 'PRT': 'DE', 'GRC': 'DE', 'FIN': 'DE', 'IRL': 'DE'
  };
  
  return normalizationMap[code] || code;
}

/**
 * Fetches countries with deduplication and sorting
 * @param {boolean} includeInactive - Whether to include inactive countries
 * @returns {Promise<Array>} Array of unique countries sorted by name
 */
export async function fetchCountries(includeInactive = false) {
  try {
    const apiClient = (await import('../services/apiClient')).default;
    const response = await apiClient.get('/countries/', {
      params: { include_inactive: includeInactive }
    });
    
    const countriesData = response.data.countries || response.data || [];
    
    // Remove duplicates based on normalized country_code
    // This handles variations like IND/IN, USA/US, etc.
    const uniqueCountriesMap = new Map(); // Maps normalized_code -> country object
    const seenNormalizedCodes = new Set();
    
    countriesData.forEach(country => {
      const countryCode = country.country_code?.toUpperCase();
      if (!countryCode) return;
      
      // Normalize the country code (IND -> IN, USA -> US, etc.)
      const normalizedCode = normalizeCountryCode(countryCode);
      
      // Only keep the first occurrence of each normalized code
      // Prefer 2-letter codes over 3-letter codes
      if (normalizedCode && !seenNormalizedCodes.has(normalizedCode)) {
        seenNormalizedCodes.add(normalizedCode);
        
        // If we already have a country with this normalized code, prefer the one with 2-letter code
        const existing = uniqueCountriesMap.get(normalizedCode);
        if (!existing || countryCode.length < existing.country_code.length) {
          // Update country_code to normalized version for consistency
          uniqueCountriesMap.set(normalizedCode, {
            ...country,
            country_code: normalizedCode // Use normalized code
          });
        }
      }
    });
    
    const uniqueCountries = Array.from(uniqueCountriesMap.values());
    
    // Sort by country name for better UX
    uniqueCountries.sort((a, b) => {
      const nameA = (a.country_name || '').toLowerCase();
      const nameB = (b.country_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return uniqueCountries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

/**
 * Fetches currencies
 * @param {boolean} includeInactive - Whether to include inactive currencies
 * @returns {Promise<Array>} Array of currencies
 */
export async function fetchCurrencies(includeInactive = false) {
  try {
    const apiClient = (await import('../services/apiClient')).default;
    const response = await apiClient.get('/currencies/', {
      params: { include_inactive: includeInactive }
    });
    
    return response.data.currencies || [];
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
}

/**
 * Fetches both countries and currencies in parallel
 * @param {boolean} includeInactive - Whether to include inactive items
 * @returns {Promise<Object>} Object with countries and currencies arrays
 */
export async function fetchCountriesAndCurrencies(includeInactive = false) {
  try {
    const [countries, currencies] = await Promise.all([
      fetchCountries(includeInactive),
      fetchCurrencies(includeInactive)
    ]);
    
    return { countries, currencies };
  } catch (error) {
    console.error('Error fetching countries and currencies:', error);
    return { countries: [], currencies: [] };
  }
}

/**
 * Gets country by country code
 * @param {Array} countries - Array of countries
 * @param {string} countryCode - Country code to find
 * @returns {Object|null} Country object or null
 */
export function getCountryByCode(countries, countryCode) {
  if (!countries || !countryCode) return null;
  const normalizedCode = countryCode.toUpperCase();
  return countries.find(c => 
    c.country_code?.toUpperCase() === normalizedCode || 
    c.country_code === normalizedCode
  ) || null;
}

/**
 * Gets currency by currency code
 * @param {Array} currencies - Array of currencies
 * @param {string} currencyCode - Currency code to find
 * @returns {Object|null} Currency object or null
 */
export function getCurrencyByCode(currencies, currencyCode) {
  if (!currencies || !currencyCode) return null;
  const normalizedCode = currencyCode.toUpperCase();
  return currencies.find(c => 
    c.currency_code?.toUpperCase() === normalizedCode ||
    c.currency_code === normalizedCode
  ) || null;
}

/**
 * Auto-selects currency based on country
 * @param {Array} countries - Array of countries
 * @param {string} countryCode - Selected country code
 * @returns {string|null} Currency code or null
 */
export function getCurrencyForCountry(countries, countryCode) {
  const country = getCountryByCode(countries, countryCode);
  return country?.currency_code || null;
}

/**
 * Auto-selects country based on currency
 * @param {Array} countries - Array of countries
 * @param {string} currencyCode - Selected currency code
 * @returns {string|null} Country code or null
 */
export function getCountryForCurrency(countries, currencyCode) {
  if (!countries || !currencyCode) return null;
  const normalizedCode = currencyCode.toUpperCase();
  const country = countries.find(c => 
    c.currency_code?.toUpperCase() === normalizedCode
  );
  return country?.country_code || null;
}



