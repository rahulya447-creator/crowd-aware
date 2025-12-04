import { Route, Junction, Location } from '../types/route';
import { supabase } from '../lib/supabase';
import { locations, findLocationByName } from './roadNetwork';
import { findMultipleRoutes, calculatePathDistance, getPathSegments } from './astar';
import {
  getDominantCrowdLevel,
  calculateTravelTime,
  calculateJunctionWaitTime,
  calculateAIOptimizedTime,
  calculateVehiclesWaiting,
  calculateCrowdLevel
} from './trafficSimulator';

/**
 * Get location coordinates from user input
 * Uses road network locations first, falls back to predefined list
 */
export function getLocationCoordinates(locationName: string): Location {
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

  // Random fallback
  return {
    name: locationName,
    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
    lng: 77.2090 + (Math.random() - 0.5) * 0.1,
  };
}

/**
 * Convert path (array of location IDs) to coordinate array
 */
function pathToCoordinates(path: string[]): Array<{ lat: number; lng: number }> {
  return path.map(id => {
    const loc = locations[id];
    return { lat: loc.lat, lng: loc.lng };
  });
}

/**
 * Generate junctions from path with realistic traffic data
 */
function generateJunctions(
  routeId: string,
  path: string[],
  segments: Array<any>
): Junction[] {
  const junctions: Junction[] = [];

  // Create junctions at intermediate locations (not start/end)
  for (let i = 1; i < path.length - 1; i++) {
    const loc = locations[path[i]];
    const segment = segments[i - 1]; // Road segment leading to this junction

    const roadType = segment?.roadType || 'main';
    const segmentCrowdLevel = calculateCrowdLevel(roadType);

    const timeWithoutAi = calculateJunctionWaitTime(segmentCrowdLevel, roadType);
    const timeWithAi = calculateAIOptimizedTime(timeWithoutAi, segmentCrowdLevel);
    const vehiclesWaiting = calculateVehiclesWaiting(segmentCrowdLevel);

    junctions.push({
      id: crypto.randomUUID(),
      route_id: routeId,
      junction_name: loc.name,
      latitude: loc.lat,
      longitude: loc.lng,
      vehicles_waiting: vehiclesWaiting,
      time_without_ai: timeWithoutAi,
      time_with_ai: timeWithAi,
      crowd_density: segmentCrowdLevel,
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
  // Find start and end locations in road network
  const startLoc = findLocationByName(start.name);
  const endLoc = findLocationByName(end.name);

  if (!startLoc || !endLoc) {
    throw new Error('Start or end location not found in road network');
  }

  // Find multiple routes using A* algorithm
  const paths = findMultipleRoutes(startLoc.id, endLoc.id);

  if (paths.length === 0) {
    throw new Error('No routes found between locations');
  }

  const routes: Route[] = [];
  const routeNames = ['Optimal Route', 'Alternative Route', 'Secondary Route'];

  // Try to save to database, but continue if it fails (demo mode)
  let searchId = crypto.randomUUID();
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
    } else {
      console.warn('Database unavailable - running in demo mode');
    }
  } catch (dbError) {
    console.warn('Database unavailable - running in demo mode', dbError);
  }

  for (let i = 0; i < Math.min(paths.length, 3); i++) {
    const path = paths[i];
    const segments = getPathSegments(path);

    // Calculate route metrics
    const distance = calculatePathDistance(path);
    const crowdLevel = getDominantCrowdLevel(segments);
    const estimatedTime = calculateTravelTime(distance, segments);
    const pathCoordinates = pathToCoordinates(path);

    const routeId = crypto.randomUUID();

    // Create route object
    const routeData: Route = {
      id: routeId,
      search_id: searchId,
      route_name: routeNames[i] || `Route ${i + 1}`,
      total_distance: parseFloat(distance.toFixed(2)),
      estimated_time: estimatedTime,
      crowd_level: crowdLevel,
      path_coordinates: pathCoordinates,
      is_optimal: false,
      junctions: [],
    };

    // Generate junctions with AI optimization data
    const junctions = generateJunctions(routeId, path, segments);
    routeData.junctions = junctions;

    // Try to save to database (optional)
    try {
      await supabase.from('routes').insert({
        id: routeId,
        search_id: searchId,
        route_name: routeData.route_name,
        total_distance: routeData.total_distance,
        estimated_time: routeData.estimated_time,
        crowd_level: routeData.crowd_level,
        path_coordinates: routeData.path_coordinates,
        is_optimal: false,
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
      // Silently continue if database save fails
      console.warn('Could not save route to database', dbError);
    }

    routes.push(routeData);
  }

  // Determine optimal route (70% time, 30% distance)
  const optimalRoute = routes.reduce((best, current) => {
    const bestScore = best.estimated_time * 0.7 + best.total_distance * 0.3;
    const currentScore = current.estimated_time * 0.7 + current.total_distance * 0.3;
    return currentScore < bestScore ? current : best;
  });

  optimalRoute.is_optimal = true;

  // Try to mark as optimal in database (optional)
  try {
    await supabase.from('routes').update({ is_optimal: true }).eq('id', optimalRoute.id);
  } catch (dbError) {
    // Silently continue if database update fails
  }

  return routes;
}
