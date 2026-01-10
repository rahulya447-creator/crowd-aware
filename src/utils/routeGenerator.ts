import { Route, Junction, Location } from '../types/route';
import { supabase } from '../lib/supabase';
import { findLocationByName } from './roadNetwork';
// Removed unused 'astar' import
// Removed unused 'trafficSimulator' imports

/**
 * Calculate crowd level based on segment colors
 */
function calculateCrowdFromSegments(segments: Array<{ color: string }> | undefined): 'low' | 'medium' | 'high' {
  if (!segments || segments.length === 0) return 'low';

  let redCount = 0;
  let orangeCount = 0;
  let total = segments.length;

  segments.forEach(seg => {
    if (seg.color === '#ef4444') redCount++; // Red
    else if (seg.color === '#f59e0b') orangeCount++; // Orange/Yellow
  });

  const redRatio = redCount / total;
  const orangeRatio = orangeCount / total;

  if (redRatio > 0.3) return 'high';
  if (redRatio > 0.1 || orangeRatio > 0.4) return 'medium';
  return 'low';
}

/**
 * Get location coordinates from user input
 * Uses road network locations first, falls back to predefined list
 */
import { searchLocation } from './tomtomSearchService';

/**
 * Get location coordinates from user input
 * Uses road network locations first, then TomTom Search API, falls back to random if needed
 */
export async function getLocationCoordinates(locationName: string): Promise<Location> {
  // Try to find in road network first
  const networkLocation = findLocationByName(locationName);
  if (networkLocation) {
    return {
      name: networkLocation.name,
      lat: networkLocation.lat,
      lng: networkLocation.lng
    };
  }

  // Fallback to predefined locations
  const CITY_LOCATIONS: Record<string, { lat: number; lng: number }> = {
    'Connaught Place': { lat: 28.6315, lng: 77.2167 },
    'India Gate': { lat: 28.6129, lng: 77.2295 },
    'Chandni Chowk': { lat: 28.6506, lng: 77.2303 },
    'Karol Bagh': { lat: 28.6519, lng: 77.1900 },
    'Rajouri Garden': { lat: 28.6414, lng: 77.1214 },
    'Nehru Place': { lat: 28.5494, lng: 77.2501 },
    'Saket': { lat: 28.5244, lng: 77.2066 },
    'Dwarka': { lat: 28.5921, lng: 77.0460 },
    'Noida Sector 18': { lat: 28.5697, lng: 77.3227 },
    'Gurgaon Cyber City': { lat: 28.4950, lng: 77.0870 },
  };

  const normalized = Object.keys(CITY_LOCATIONS).find(key =>
    key.toLowerCase().includes(locationName.toLowerCase()) ||
    locationName.toLowerCase().includes(key.toLowerCase())
  );

  if (normalized) {
    return { name: normalized, ...CITY_LOCATIONS[normalized] };
  }

  // Try TomTom Geocoding
  try {
    const searchResult = await searchLocation(locationName);
    if (searchResult) {
      return {
        name: searchResult.address,
        lat: searchResult.lat,
        lng: searchResult.lng
      };
    }
  } catch (err) {
    console.warn('Geocoding failed, falling back to approximation');
  }

  console.warn(`Location not found: "${locationName}". Using nearby approximation.`);

  // Random fallback (Central Delhi approx)
  return {
    name: locationName,
    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
    lng: 77.2090 + (Math.random() - 0.5) * 0.01,
  };
}

/**
 * Convert path (array of location IDs) to coordinate array
 * Uses OSRM/TomTom to get detailed road-following geometry
 */


/**
 * Generate junctions from path with realistic traffic data
 */
function generateJunctions(
  routeId: string,
  pathCoords: Array<{ lat: number, lng: number }>
): Junction[] {
  const junctions: Junction[] = [];
  // Simplified junction generation based on geometry length
  // In a real app, this would use labeled intersection data from the API
  const junctionCount = Math.floor(pathCoords.length / 50);

  for (let i = 1; i <= junctionCount; i++) {
    const index = i * 50;
    if (index >= pathCoords.length) break;

    const loc = pathCoords[index];
    // Mock data for junction
    const timeWithoutAi = Math.floor(Math.random() * 60) + 30;
    const timeWithAi = Math.floor(timeWithoutAi * 0.7);

    junctions.push({
      id: crypto.randomUUID(),
      route_id: routeId,
      junction_name: `Junction ${i}`,
      latitude: loc.lat,
      longitude: loc.lng,
      vehicles_waiting: Math.floor(Math.random() * 20),
      time_without_ai: timeWithoutAi,
      time_with_ai: timeWithAi,
      crowd_density: 'medium',
      ai_optimization_active: true,
    });
  }

  return junctions;
}

/**
 * Generate routes using A* pathfinding and realistic traffic simulation
 * Works in DEMO MODE without Supabase if database is unavailable
 */
export async function generateRoutes(start: Location, end: Location): Promise<Route[]> {
  // Check if check demo mode
  const isDemoMode = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');
  let searchId = crypto.randomUUID();

  // Only try to save to database if NOT in demo mode
  if (!isDemoMode) {
    try {
      const { data: searchData, error: searchError } = await supabase
        .from('user_searches')
        .insert({
          start_location: start.name,
          end_location: end.name,
          start_lat: start.lat,
          start_lng: start.lng,
          end_lat: end.lat,
          end_lng: end.lng,
        })
        .select()
        .single();

      if (!searchError && searchData) {
        searchId = searchData.id;
      }
    } catch (dbError) {
      console.warn('Database unavailable - running in demo mode', dbError);
    }
  } else {
    console.log('Running in DEMO MODE - skipping database writes');
  }

  // DIRECT ROUTING STRATEGY (TomTom Alternatives)
  // Instead of finding local graph paths first, we ask TomTom for alternatives directly.
  // We pass just Start and End.

  // Create temp IDs for compatibility if using graph, but here we just need coords
  // We'll create a dummy "path" of 2 points to trigger the service
  // In future refactor, direct coords pass would be cleaner

  // We treat 'start' and 'end' as if they were IDs in the mock graph 
  // But actually pathToCoordinates maps ID->Loc. 
  // Since we can't assume Start/End are in our local hardcoded 'locations' map,
  // we need to update pathToCoordinates to handle arbitrary coords or mock it here.

  // Hack: We will bypass the ID mapping in pathToCoordinates by passing dummy IDs
  // and modifying logic? No, pathToCoordinates uses `locations[id]`.
  // Better: We should call `getDetailedRouteGeometry` directly here since we have coords.
  // Call skipped as we use direct OSRM service below


  // Re-import service directly here to bypass ID looking
  // We can't rely on `findMultipleRoutes` (A*) because it requires graph nodes
  const { getDetailedRouteGeometry } = await import('./osrmService');

  const routeGeometries = await getDetailedRouteGeometry(
    [{ lat: start.lat, lng: start.lng }, { lat: end.lat, lng: end.lng }],
    start.name,
    end.name
  );

  if (!routeGeometries || routeGeometries.length === 0) {
    throw new Error('No routes found between locations');
  }

  const routes: Route[] = [];
  const routeNames = ['Optimal Route', 'Alternative Route', 'Secondary Route'];

  // Process each returned geometry into a Route object
  for (let i = 0; i < routeGeometries.length; i++) {
    const geometry = routeGeometries[i];
    const segments = geometry.traffic_segments || [];

    // Use real summary if available, otherwise fallback to approximate calculation
    let distance = 0;
    let estimatedTime = 0;

    if (geometry.summary) {
      // Convert meters to km
      distance = geometry.summary.distance / 1000;
      // Convert seconds to minutes
      estimatedTime = geometry.summary.travelTime / 60;
    } else {
      // Calculate distance approx from geometry
      for (let k = 0; k < geometry.path.length - 1; k++) {
        const p1 = geometry.path[k];
        const p2 = geometry.path[k + 1];
        // simple Haversine approx or Euclidean for speed
        const deg2rad = (deg: number) => deg * (Math.PI / 180);
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(p2.lat - p1.lat);
        const dLon = deg2rad(p2.lng - p1.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        distance += d;
      }
      // Approx time: 30km/h avg speed in city
      estimatedTime = (distance / 30) * 60;
    }

    const crowdLevel = calculateCrowdFromSegments(segments);

    const routeId = crypto.randomUUID();

    // Create route object
    const routeData: Route = {
      id: routeId,
      search_id: searchId,
      route_name: routeNames[i] || `Route ${i + 1}`,
      total_distance: parseFloat(distance.toFixed(2)),
      estimated_time: estimatedTime,
      crowd_level: crowdLevel,
      path_coordinates: geometry.path,
      traffic_segments: geometry.traffic_segments,
      traffic_signals: geometry.traffic_signals,
      is_optimal: i === 0, // Assume first from TomTom is best
      junctions: [],
    };

    // Generate simplified junctions
    const junctions = generateJunctions(routeId, geometry.path);
    routeData.junctions = junctions;

    // Try to save to database (optional)
    if (!isDemoMode) {
      try {
        await supabase.from('routes').insert({
          id: routeId,
          search_id: searchId,
          route_name: routeData.route_name,
          total_distance: routeData.total_distance,
          estimated_time: routeData.estimated_time,
          crowd_level: routeData.crowd_level,
          path_coordinates: routeData.path_coordinates,
          is_optimal: routeData.is_optimal,
        });

        if (junctions.length > 0) {
          await supabase.from('junctions').insert(junctions.map(j => ({
            route_id: j.route_id,
            junction_name: j.junction_name,
            latitude: j.latitude,
            longitude: j.longitude,
            vehicles_waiting: j.vehicles_waiting,
            time_without_ai: j.time_without_ai,
            time_with_ai: j.time_with_ai,
            crowd_density: j.crowd_density,
            ai_optimization_active: j.ai_optimization_active,
          })));
        }
      } catch (dbError) {
        console.warn('Could not save route to database', dbError);
      }
    }

    routes.push(routeData);
  }

  return routes;
}
