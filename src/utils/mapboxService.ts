/**
 * Mapbox Routing Service
 * Fetches professional-grade route geometry from Mapbox Directions API
 */

interface MapboxCoordinate {
    lat: number;
    lng: number;
}

interface MapboxRoute {
    geometry: string; // Polyline string
    distance: number;
    duration: number;
}

interface MapboxResponse {
    routes: MapboxRoute[];
    code: string;
}

/**
 * Decode Mapbox Polyline (Google Polyline Algorithm)
 * Mapbox returns geometry as a compressed string to save bandwidth.
 */
function decodePolyline(encoded: string): MapboxCoordinate[] {
    const points: MapboxCoordinate[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({
            lat: lat / 1e5,
            lng: lng / 1e5
        });
    }
    return points;
}

/**
 * Fetch route from Mapbox API
 */
export async function fetchMapboxRoute(
    coordinates: MapboxCoordinate[]
): Promise<MapboxCoordinate[] | null> {
    try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;

        if (!token || token.includes('placeholder')) {
            console.warn('Mapbox token missing or placeholder');
            return null;
        }

        // Format: lng,lat;lng,lat
        const coordString = coordinates
            .map(c => `${c.lng},${c.lat}`)
            .join(';');

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=polyline&access_token=${token}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`Mapbox API error: ${response.status}`);
            return null;
        }

        const data: MapboxResponse = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return null;
        }

        // Decode the polyline geometry
        const geometry = decodePolyline(data.routes[0].geometry);

        console.log(`✅ Mapbox route fetched: ${geometry.length} points`);
        return geometry;

    } catch (error) {
        console.warn('Mapbox fetch failed:', error);
        return null;
    }
}
