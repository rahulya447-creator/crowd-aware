/**
 * TomTom Routing Service
 * Fetches route geometry from TomTom Routing API
 */

interface TomTomCoordinate {
    lat: number;
    lng: number;
}

interface TomTomResponse {
    routes: {
        summary: {
            lengthInMeters: number;
            travelTimeInSeconds: number;
        };
        legs: {
            points: {
                latitude: number;
                longitude: number;
            }[];
        }[];
    }[];
}

/**
 * Fetch route from TomTom API
 */
export async function fetchTomTomRoute(
    coordinates: TomTomCoordinate[]
): Promise<TomTomCoordinate[] | null> {
    try {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

        if (!apiKey || apiKey.includes('placeholder')) {
            console.warn('TomTom API key missing or placeholder');
            return null;
        }

        // Format: lat,lng:lat,lng
        const locations = coordinates
            .map(c => `${c.lat},${c.lng}`)
            .join(':');

        const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${apiKey}&routeRepresentation=polyline&computeBestOrder=false`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`TomTom API error: ${response.status}`);
            return null;
        }

        const data: TomTomResponse = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return null;
        }

        // Extract points from the first route's legs
        const points: TomTomCoordinate[] = [];
        data.routes[0].legs.forEach(leg => {
            leg.points.forEach(point => {
                points.push({
                    lat: point.latitude,
                    lng: point.longitude
                });
            });
        });

        console.log(`✅ TomTom route fetched: ${points.length} points`);
        return points;

    } catch (error) {
        console.warn('TomTom fetch failed:', error);
        return null;
    }
}
