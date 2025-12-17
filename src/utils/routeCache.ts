/**
 * Route Cache (Golden Paths)
 * Stores hardcoded, high-quality route geometry for key demo locations.
 * Keys are based on LOCATION NAMES, ensuring 100% hit rate regardless of click precision.
 */

interface OSRMCoordinate {
    lat: number;
    lng: number;
}

// Key: "StartName-EndName" (e.g., "Connaught Place-India Gate")
// Value: Array of coordinates
export const routeCache: Record<string, OSRMCoordinate[]> = {
    // Connaught Place -> India Gate
    "Connaught Place-India Gate": [
        { lat: 28.6315, lng: 77.2167 }, // CP Inner Circle
        { lat: 28.6320, lng: 77.2180 }, // Radial
        { lat: 28.6310, lng: 77.2200 }, // Outer Circle
        { lat: 28.6290, lng: 77.2230 }, // Barakhamba Rd Start
        { lat: 28.6270, lng: 77.2260 }, // Barakhamba Rd Mid
        { lat: 28.6250, lng: 77.2290 }, // Mandi House Roundabout
        { lat: 28.6230, lng: 77.2295 }, // Copernicus Marg
        { lat: 28.6200, lng: 77.2295 }, // Copernicus Marg
        { lat: 28.6170, lng: 77.2290 }, // India Gate Hexagon
        { lat: 28.6150, lng: 77.2285 }, // India Gate Hexagon
        { lat: 28.6129, lng: 77.2295 }  // India Gate
    ],

    // India Gate -> Connaught Place (Reverse)
    "India Gate-Connaught Place": [
        { lat: 28.6129, lng: 77.2295 },
        { lat: 28.6150, lng: 77.2305 },
        { lat: 28.6170, lng: 77.2300 },
        { lat: 28.6200, lng: 77.2295 },
        { lat: 28.6250, lng: 77.2290 },
        { lat: 28.6270, lng: 77.2260 },
        { lat: 28.6290, lng: 77.2230 },
        { lat: 28.6310, lng: 77.2200 },
        { lat: 28.6320, lng: 77.2180 },
        { lat: 28.6315, lng: 77.2167 }
    ]
};

/**
 * Helper to find a cached route by name
 */
export function findCachedRouteByName(startName: string, endName: string): OSRMCoordinate[] | null {
    const key = `${startName}-${endName}`;
    console.log(`Checking cache for key: ${key}`);

    if (routeCache[key]) {
        console.log('✨ FOUND GOLDEN PATH IN CACHE');
        return routeCache[key];
    }

    return null;
}
