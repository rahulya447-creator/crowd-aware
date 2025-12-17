/**
 * OSRM (OpenStreetMap Routing Machine) Service
 * Fetches actual road geometry for realistic route visualization
 */

import { findCachedRouteByName } from './routeCache';
import { fetchMapboxRoute } from './mapboxService';

interface OSRMCoordinate {
    lat: number;
    lng: number;
}

interface OSRMRoute {
    geometry: {
        coordinates: number[][]; // [lng, lat] format
    };
    distance: number;
    duration: number;
}

interface OSRMResponse {
    code: string;
    routes: OSRMRoute[];
}

/**
 * Interpolate points with a curve (arc) between two coordinates
 * Creates a visually pleasing curved path instead of a straight line
 */
function interpolatePoints(
    start: OSRMCoordinate,
    end: OSRMCoordinate,
    numPoints: number = 15
): OSRMCoordinate[] {
    const points: OSRMCoordinate[] = [start];

    // Calculate midpoint
    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    // Add a perpendicular offset to create a curve
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;

    // Offset factor (0.5 makes it clearly curved)
    const offsetFactor = 0.5;

    // Control point for Quadratic Bezier
    const controlLat = midLat - dx * offsetFactor;
    const controlLng = midLng + dy * offsetFactor;

    for (let i = 1; i < numPoints; i++) {
        const t = i / numPoints;

        // Quadratic Bezier curve formula
        const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * controlLat + t * t * end.lat;
        const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * controlLng + t * t * end.lng;

        points.push({ lat, lng });
    }

    points.push(end);
    return points;
}

/**
 * Fetch route geometry from OSRM API
 * Uses local proxy server to bypass CORS
 */
export async function fetchOSRMRoute(
    coordinates: OSRMCoordinate[]
): Promise<OSRMCoordinate[] | null> {
    try {
        if (coordinates.length < 2) {
            return null;
        }

        // Format coordinates for OSRM (lng,lat;lng,lat)
        const coordString = coordinates
            .map(coord => `${coord.lng},${coord.lat}`)
            .join(';');

        // Use local proxy server
        const proxyUrl = `http://localhost:3000/api/route?coordinates=${encodeURIComponent(coordString)}`;

        try {
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                return null;
            }

            const data: OSRMResponse = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                return null;
            }

            // Extract geometry from first route
            const route = data.routes[0];
            const geometryPoints = route.geometry.coordinates;

            // Convert from [lng, lat] to {lat, lng}
            const waypoints: OSRMCoordinate[] = geometryPoints.map(coord => ({
                lng: coord[0],
                lat: coord[1]
            }));

            console.log(`✅ OSRM route fetched via local proxy: ${waypoints.length} waypoints`);
            return waypoints;
        } catch (err) {
            return null;
        }
    } catch (error) {
        return null;
    }
}

/**
 * Get detailed road-following geometry for a path
 * PRIORITY:
 * 1. Name-based Cache (Golden Path)
 * 2. Mapbox API (Professional Data)
 * 3. OSRM Proxy (Free Data)
 * 4. Smooth Curve (Offline Fallback)
 */
import { fetchMapboxRoute } from './mapboxService';
import { fetchTomTomRoute } from './tomtomService';

/**
 * Get detailed road-following geometry for a path
 * PRIORITY:
 * 1. Name-based Cache (Golden Path)
 * 2. TomTom API (New Primary)
 * 3. Mapbox API (Secondary)
 * 4. OSRM Proxy (Free Fallback)
 * 5. Smooth Curve (Offline Fallback)
 */
export async function getDetailedRouteGeometry(
    path: OSRMCoordinate[],
    startName?: string,
    endName?: string
): Promise<OSRMCoordinate[]> {
    // If path is too short, return as-is
    if (path.length < 2) {
        return path;
    }

    // 1. Check Name-Based Cache (Golden Path)
    if (startName && endName) {
        const cachedRoute = findCachedRouteByName(startName, endName);
        if (cachedRoute) {
            return cachedRoute;
        }
    }

    // 2. Try TomTom API (Primary)
    const tomtomWaypoints = await fetchTomTomRoute(path);
    if (tomtomWaypoints && tomtomWaypoints.length > 0) {
        return tomtomWaypoints;
    }

    // 3. Try Mapbox API (Secondary)
    const mapboxWaypoints = await fetchMapboxRoute(path);
    if (mapboxWaypoints && mapboxWaypoints.length > 0) {
        return mapboxWaypoints;
    }

    // 4. Try to fetch from OSRM via Proxy
    const osrmWaypoints = await fetchOSRMRoute(path);

    // If OSRM succeeds, use those waypoints
    if (osrmWaypoints && osrmWaypoints.length > 0) {
        return osrmWaypoints;
    }

    // 5. Fallback: Smooth Curve Interpolation
    console.log('📍 External APIs unavailable, using smooth curved waypoints');
    const interpolated: OSRMCoordinate[] = [];

    for (let i = 0; i < path.length - 1; i++) {
        const segmentPoints = interpolatePoints(path[i], path[i + 1], 20);
        // Add all points except the last one to avoid duplicates
        interpolated.push(...segmentPoints.slice(0, -1));
    }

    // Add the final point
    interpolated.push(path[path.length - 1]);

    return interpolated;
}

/**
 * Get road-following geometry between two points
 */
export async function getRouteBetweenPoints(
    start: OSRMCoordinate,
    end: OSRMCoordinate,
    startName?: string,
    endName?: string
): Promise<OSRMCoordinate[]> {
    return getDetailedRouteGeometry([start, end], startName, endName);
}
