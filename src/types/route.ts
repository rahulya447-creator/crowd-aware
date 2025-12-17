export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface Junction {
  id: string;
  route_id: string;
  junction_name: string;
  latitude: number;
  longitude: number;
  vehicles_waiting: number;
  time_without_ai: number;
  time_with_ai: number;
  crowd_density: 'low' | 'medium' | 'high';
  ai_optimization_active: boolean;
}

export interface Route {
  id: string;
  search_id: string;
  route_name: string;
  total_distance: number;
  estimated_time: number;
  crowd_level: 'low' | 'medium' | 'high';
  path_coordinates: Array<{ lat: number; lng: number }>;
  is_optimal: boolean;
  junctions?: Junction[];

  // New fields for Traffic Signal Visualization
  traffic_segments?: Array<{
    color: string;
    start_index: number;
    end_index: number;
  }>;
  traffic_signals?: Array<{
    lat: number;
    lng: number;
    state: 'red' | 'green' | 'yellow';
  }>;
}

export interface UserSearch {
  id: string;
  start_location: string;
  end_location: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  search_timestamp: string;
  selected_route_id?: string;
}
