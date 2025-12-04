import { Route, Junction, Location } from '../types/route';
import { supabase } from '../lib/supabase';

const CITY_LOCATIONS = {
  'Connaught Place, Delhi': { lat: 28.6315, lng: 77.2167 },
  'India Gate, Delhi': { lat: 28.6129, lng: 77.2295 },
  'Chandni Chowk, Delhi': { lat: 28.6506, lng: 77.2303 },
  'Karol Bagh, Delhi': { lat: 28.6519, lng: 77.1900 },
  'Rajouri Garden, Delhi': { lat: 28.6414, lng: 77.1214 },
  'Nehru Place, Delhi': { lat: 28.5494, lng: 77.2501 },
  'Saket, Delhi': { lat: 28.5244, lng: 77.2066 },
  'Dwarka, Delhi': { lat: 28.5921, lng: 77.0460 },
  'Noida Sector 18': { lat: 28.5697, lng: 77.3227 },
  'Gurgaon Cyber City': { lat: 28.4950, lng: 77.0870 },
};

export function getLocationCoordinates(locationName: string): Location {
  const normalized = Object.keys(CITY_LOCATIONS).find(key =>
    key.toLowerCase().includes(locationName.toLowerCase()) ||
    locationName.toLowerCase().includes(key.toLowerCase())
  );

  if (normalized) {
    return { name: normalized, ...CITY_LOCATIONS[normalized as keyof typeof CITY_LOCATIONS] };
  }

  return {
    name: locationName,
    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
    lng: 77.2090 + (Math.random() - 0.5) * 0.1,
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generatePathCoordinates(start: Location, end: Location, routeType: 'direct' | 'highway' | 'scenic'): Array<{ lat: number; lng: number }> {
  const path = [{ lat: start.lat, lng: start.lng }];
  const steps = 5;

  for (let i = 1; i <= steps; i++) {
    const progress = i / (steps + 1);
    let lat = start.lat + (end.lat - start.lat) * progress;
    let lng = start.lng + (end.lng - start.lng) * progress;

    if (routeType === 'highway') {
      lat += Math.sin(progress * Math.PI) * 0.02;
    } else if (routeType === 'scenic') {
      lng += Math.sin(progress * Math.PI * 2) * 0.03;
      lat += Math.cos(progress * Math.PI * 2) * 0.02;
    }

    path.push({ lat, lng });
  }

  path.push({ lat: end.lat, lng: end.lng });
  return path;
}

function generateJunctions(routeId: string, path: Array<{ lat: number; lng: number }>, crowdLevel: 'low' | 'medium' | 'high'): Junction[] {
  const junctions: Junction[] = [];
  const numJunctions = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < numJunctions; i++) {
    const pathIndex = Math.floor((i + 1) * path.length / (numJunctions + 1));
    const point = path[pathIndex];

    const baseWaitTime = crowdLevel === 'high' ? 180 : crowdLevel === 'medium' ? 120 : 60;
    const variation = Math.floor(Math.random() * 60);
    const timeWithoutAi = baseWaitTime + variation;

    const aiReduction = crowdLevel === 'high' ? 0.4 : crowdLevel === 'medium' ? 0.3 : 0.1;
    const timeWithAi = Math.floor(timeWithoutAi * (1 - aiReduction));

    const vehiclesWaiting = crowdLevel === 'high' ?
      Math.floor(Math.random() * 20) + 30 :
      crowdLevel === 'medium' ?
      Math.floor(Math.random() * 15) + 15 :
      Math.floor(Math.random() * 10) + 5;

    junctions.push({
      id: crypto.randomUUID(),
      route_id: routeId,
      junction_name: `Junction ${String.fromCharCode(65 + i)}`,
      latitude: point.lat,
      longitude: point.lng,
      vehicles_waiting: vehiclesWaiting,
      time_without_ai: timeWithoutAi,
      time_with_ai: timeWithAi,
      crowd_density: crowdLevel,
      ai_optimization_active: true,
    });
  }

  return junctions;
}

export async function generateRoutes(start: Location, end: Location): Promise<Route[]> {
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

    if (searchError) throw searchError;

    const baseDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng);

    const routeConfigs = [
      {
        name: 'Express Highway Route',
        type: 'highway' as const,
        distanceMultiplier: 1.15,
        speedFactor: 1.3,
        crowdLevel: 'low' as const
      },
      {
        name: 'Main City Route',
        type: 'direct' as const,
        distanceMultiplier: 1.0,
        speedFactor: 0.8,
        crowdLevel: 'high' as const
      },
      {
        name: 'Alternative Route',
        type: 'scenic' as const,
        distanceMultiplier: 1.25,
        speedFactor: 1.0,
        crowdLevel: 'medium' as const
      },
    ];

    const routes: Route[] = [];

    for (const config of routeConfigs) {
      const distance = baseDistance * config.distanceMultiplier;
      const baseTime = (distance / 40) * 60;
      const estimatedTime = Math.floor(baseTime / config.speedFactor);

      const path = generatePathCoordinates(start, end, config.type);

      const routeId = crypto.randomUUID();

      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert({
          id: routeId,
          search_id: searchData.id,
          route_name: config.name,
          total_distance: parseFloat(distance.toFixed(2)),
          estimated_time: estimatedTime,
          crowd_level: config.crowdLevel,
          path_coordinates: path,
          is_optimal: false,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      const junctions = generateJunctions(routeId, path, config.crowdLevel);

      if (junctions.length > 0) {
        const { error: junctionsError } = await supabase
          .from('junctions')
          .insert(junctions.map(j => ({
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

        if (junctionsError) throw junctionsError;
      }

      routes.push({
        ...routeData,
        junctions,
      });
    }

    const optimalRoute = routes.reduce((best, current) => {
      const bestScore = best.estimated_time * 0.7 + best.total_distance * 0.3;
      const currentScore = current.estimated_time * 0.7 + current.total_distance * 0.3;
      return currentScore < bestScore ? current : best;
    });

    await supabase
      .from('routes')
      .update({ is_optimal: true })
      .eq('id', optimalRoute.id);

    optimalRoute.is_optimal = true;

    return routes;
  } catch (error) {
    console.error('Error generating routes:', error);
    throw error;
  }
}
