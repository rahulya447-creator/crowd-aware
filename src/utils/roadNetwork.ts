/**
 * Delhi Road Network Graph
 * Simplified network with major Delhi locations for A* pathfinding
 */

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'major' | 'junction' | 'landmark';
}

export interface RoadEdge {
  from: string;
  to: string;
  distance: number; // in kilometers
  roadType: 'highway' | 'main' | 'local';
  baseSpeed: number; // km/h
}

// Major locations in Delhi
export const locations: Record<string, Location> = {
  connaught_place: {
    id: 'connaught_place',
    name: 'Connaught Place',
    lat: 28.6315,
    lng: 77.2167,
    type: 'major'
  },
  india_gate: {
    id: 'india_gate',
    name: 'India Gate',
    lat: 28.6129,
    lng: 77.2295,
    type: 'landmark'
  },
  chandni_chowk: {
    id: 'chandni_chowk',
    name: 'Chandni Chowk',
    lat: 28.6506,
    lng: 77.2303,
    type: 'major'
  },
  karol_bagh: {
    id: 'karol_bagh',
    name: 'Karol Bagh',
    lat: 28.6519,
    lng: 77.1900,
    type: 'major'
  },
  rajouri_garden: {
    id: 'rajouri_garden',
    name: 'Rajouri Garden',
    lat: 28.6414,
    lng: 77.1214,
    type: 'major'
  },
  nehru_place: {
    id: 'nehru_place',
    name: 'Nehru Place',
    lat: 28.5494,
    lng: 77.2501,
    type: 'major'
  },
  saket: {
    id: 'saket',
    name: 'Saket',
    lat: 28.5244,
    lng: 77.2066,
    type: 'major'
  },
  dwarka: {
    id: 'dwarka',
    name: 'Dwarka',
    lat: 28.5921,
    lng: 77.0460,
    type: 'major'
  },
  noida_sector_18: {
    id: 'noida_sector_18',
    name: 'Noida Sector 18',
    lat: 28.5697,
    lng: 77.3227,
    type: 'major'
  },
  gurgaon_cyber_city: {
    id: 'gurgaon_cyber_city',
    name: 'Gurgaon Cyber City',
    lat: 28.4950,
    lng: 77.0870,
    type: 'major'
  },
  'lajpat_nagar': {
    id: 'lajpat_nagar',
    name: 'Lajpat Nagar',
    lat: 28.5677,
    lng: 77.2431,
    type: 'major'
  },
  'hauz_khas': {
    id: 'hauz_khas',
    name: 'Hauz Khas',
    lat: 28.5494,
    lng: 77.1932,
    type: 'major'
  },
  'kashmere_gate': {
    id: 'kashmere_gate',
    name: 'Kashmere Gate',
    lat: 28.6670,
    lng: 77.2280,
    type: 'junction'
  },
  'iffco_chowk': {
    id: 'iffco_chowk',
    name: 'IFFCO Chowk',
    lat: 28.4730,
    lng: 77.0320,
    type: 'junction'
  }
};

// Road connections between locations
export const roads: RoadEdge[] = [
  // Connaught Place connections
  { from: 'connaught_place', to: 'india_gate', distance: 2.5, roadType: 'main', baseSpeed: 35 },
  { from: 'connaught_place', to: 'karol_bagh', distance: 5.2, roadType: 'main', baseSpeed: 30 },
  { from: 'connaught_place', to: 'chandni_chowk', distance: 4.8, roadType: 'local', baseSpeed: 25 },
  { from: 'connaught_place', to: 'kashmere_gate', distance: 5.5, roadType: 'main', baseSpeed: 35 },
  
  // India Gate connections
  { from: 'india_gate', to: 'lajpat_nagar', distance: 6.5, roadType: 'main', baseSpeed: 40 },
  { from: 'india_gate', to: 'nehru_place', distance: 8.0, roadType: 'main', baseSpeed: 40 },
  
  // Chandni Chowk connections
  { from: 'chandni_chowk', to: 'kashmere_gate', distance: 2.0, roadType: 'local', baseSpeed: 20 },
  
  // Karol Bagh connections
  { from: 'karol_bagh', to: 'rajouri_garden', distance: 6.0, roadType: 'main', baseSpeed: 35 },
  { from: 'karol_bagh', to: 'hauz_khas', distance: 8.5, roadType: 'main', baseSpeed: 35 },
  
  // Rajouri Garden connections
  { from: 'rajouri_garden', to: 'dwarka', distance: 12.0, roadType: 'highway', baseSpeed: 60 },
  
  // Nehru Place connections
  { from: 'nehru_place', to: 'lajpat_nagar', distance: 3.5, roadType: 'main', baseSpeed: 30 },
  { from: 'nehru_place', to: 'saket', distance: 5.0, roadType: 'main', baseSpeed: 35 },
  { from: 'nehru_place', to: 'noida_sector_18', distance: 10.0, roadType: 'highway', baseSpeed: 55 },
  
  // Saket connections
  { from: 'saket', to: 'hauz_khas', distance: 4.0, roadType: 'main', baseSpeed: 35 },
  { from: 'saket', to: 'gurgaon_cyber_city', distance: 14.0, roadType: 'highway', baseSpeed: 60 },
  
  // Hauz Khas connections
  { from: 'hauz_khas', to: 'lajpat_nagar', distance: 4.5, roadType: 'main', baseSpeed: 30 },
  { from: 'hauz_khas', to: 'iffco_chowk', distance: 15.0, roadType: 'highway', baseSpeed: 55 },
  
  // Dwarka connections
  { from: 'dwarka', to: 'iffco_chowk', distance: 8.0, roadType: 'highway', baseSpeed: 60 },
  
  // Gurgaon connections
  { from: 'gurgaon_cyber_city', to: 'iffco_chowk', distance: 5.0, roadType: 'highway', baseSpeed: 50 },
  
  // Lajpat Nagar connections
  { from: 'lajpat_nagar', to: 'kashmere_gate', distance: 11.0, roadType: 'main', baseSpeed: 35 },
];

// Build adjacency list for efficient graph traversal
export const buildGraph = (): Map<string, Map<string, RoadEdge>> => {
  const graph = new Map<string, Map<string, RoadEdge>>();
  
  // Initialize all nodes
  Object.keys(locations).forEach(id => {
    graph.set(id, new Map());
  });
  
  // Add edges (bidirectional)
  roads.forEach(road => {
    graph.get(road.from)?.set(road.to, road);
    // Add reverse edge
    graph.get(road.to)?.set(road.from, {
      from: road.to,
      to: road.from,
      distance: road.distance,
      roadType: road.roadType,
      baseSpeed: road.baseSpeed
    });
  });
  
  return graph;
};

// Find location by name (fuzzy match)
export const findLocationByName = (name: string): Location | null => {
  const normalized = name.toLowerCase().trim();
  
  // Exact match first
  for (const loc of Object.values(locations)) {
    if (loc.name.toLowerCase() === normalized) {
      return loc;
    }
  }
  
  // Partial match
  for (const loc of Object.values(locations)) {
    if (loc.name.toLowerCase().includes(normalized) || 
        normalized.includes(loc.name.toLowerCase())) {
      return loc;
    }
  }
  
  return null;
};
