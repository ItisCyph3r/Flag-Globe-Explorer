import { Continent, Country, Question } from './types';

// List of supported continents
export const continents: Continent[] = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania'
];

// Map region names from the API to our continent types
const regionToContinentMap: Record<string, Continent> = {
  'Africa': 'Africa',
  'Americas': 'North America', // We'll split Americas into North and South later
  'Asia': 'Asia',
  'Europe': 'Europe',
  'Oceania': 'Oceania'
};

// Interface for the country data returned by the REST Countries API
interface ApiCountry {
  name: {
    common: string;
    official?: string;
  };
  cca2: string;
  region: string;
  subregion?: string;
  flags: {
    png: string;
    svg?: string;
  };
}

// Cache for countries data to avoid repeated API calls
let countriesCache: Country[] | null = null;

// Function to fetch all countries from REST Countries API
export const fetchAllCountries = async (): Promise<Country[]> => {
  // Return cached data if available
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,region,subregion,flags');
    const data = await response.json() as ApiCountry[];
    
    // Transform the API data to our Country format
    const countries: Country[] = data
      .filter((country: ApiCountry) => 
        country.region && 
        country.cca2 && 
        country.name?.common &&
        country.flags?.png
      )
      .map((country: ApiCountry) => {
        // Determine continent based on region and subregion
        let continent: Continent = regionToContinentMap[country.region] || 'Oceania';
        
        // Special handling for Americas to split into North and South
        if (country.region === 'Americas') {
          if (
            country.subregion === 'South America' || 
            ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'UY', 'PY', 'SR', 'GY'].includes(country.cca2)
          ) {
            continent = 'South America';
          } else {
            continent = 'North America';
          }
        }
        
        return {
          name: country.name.common,
          code: country.cca2,
          continent,
          flagUrl: country.flags.png
        };
      });
    
    // Store in cache
    countriesCache = countries;
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    // Fall back to empty array - we'll handle this in the UI
    return [];
  }
};

// Get countries by continent (async version)
export const getCountriesByContinent = async (continent: Continent): Promise<Country[]> => {
  const allCountries = await fetchAllCountries();
  return allCountries.filter(country => country.continent === continent);
};

// Get a random sample of countries from a specific continent (async version)
export const getRandomCountries = async (continent: Continent, count: number): Promise<Country[]> => {
  const continentCountries = await getCountriesByContinent(continent);
  const shuffled = [...continentCountries].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, continentCountries.length));
};

// Create a new question with one target country and multiple options (async version)
export const createQuestion = async (continent: Continent, optionsCount: number = 6): Promise<Question | null> => {
  const continentCountries = await getCountriesByContinent(continent);
  
  // Ensure we have enough countries
  if (continentCountries.length < 2) {
    console.error(`Not enough countries for continent ${continent}`);
    return null;
  }

  // Adjust options count if we don't have enough countries
  const actualOptionsCount = Math.min(optionsCount, continentCountries.length);
  
  // Get random countries for options
  const options = await getRandomCountries(continent, actualOptionsCount);
  // Select one random country as the target
  const targetCountry = options[Math.floor(Math.random() * options.length)];

  return {
    targetCountry,
    options
  };
};
