
/**
 * TomTom Search Service
 * Resolves location names to coordinates using TomTom Search API
 */

interface SearchResult {
    lat: number;
    lng: number;
    address: string;
}

export async function searchLocation(query: string): Promise<SearchResult | null> {
    try {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

        // Return null if no API key (will behave like before, fallback possible)
        if (!apiKey || apiKey.includes('placeholder')) {
            console.warn('TomTom Search: Missing or placeholder API key');
            return null;
        }

        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.tomtom.com/search/2/search/${encodedQuery}.json?key=${apiKey}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`TomTom Search API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const name = result.address.freeformAddress || result.poi?.name || query;

            console.log(`📍 Geocoded: "${query}" -> ${name} (${result.position.lat}, ${result.position.lon})`);

            return {
                lat: result.position.lat,
                lng: result.position.lon,
                address: name
            };
        }

        console.log(`TomTom Search: No results found for "${query}"`);
        return null;

    } catch (error) {
        console.error('TomTom Search request failed:', error);
        return null;
    }
}
