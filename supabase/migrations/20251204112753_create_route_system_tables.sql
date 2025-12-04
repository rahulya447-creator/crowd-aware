/*
  # Crowd Aware Smart Route Recommendation System - Database Schema

  1. New Tables
    - `user_searches`
      - `id` (uuid, primary key) - Unique identifier for each search
      - `user_id` (uuid) - User identifier (can be null for anonymous users)
      - `start_location` (text) - Starting location/address
      - `end_location` (text) - Destination location/address
      - `start_lat` (numeric) - Starting latitude
      - `start_lng` (numeric) - Starting longitude
      - `end_lat` (numeric) - Destination latitude
      - `end_lng` (numeric) - Destination longitude
      - `search_timestamp` (timestamptz) - When the search was performed
      - `selected_route_id` (uuid) - Which route was selected by user

    - `routes`
      - `id` (uuid, primary key) - Unique identifier for each route
      - `search_id` (uuid) - Reference to user_searches
      - `route_name` (text) - Name/description of the route (e.g., "Via Highway", "Via City Center")
      - `total_distance` (numeric) - Total distance in kilometers
      - `estimated_time` (integer) - Estimated time in minutes
      - `crowd_level` (text) - Overall crowd level (low/medium/high)
      - `path_coordinates` (jsonb) - Array of coordinate points for the route
      - `is_optimal` (boolean) - Whether this is the recommended optimal route
      - `created_at` (timestamptz) - Timestamp

    - `junctions`
      - `id` (uuid, primary key) - Unique identifier for each junction
      - `route_id` (uuid) - Reference to routes table
      - `junction_name` (text) - Name of the junction
      - `latitude` (numeric) - Junction latitude
      - `longitude` (numeric) - Junction longitude
      - `vehicles_waiting` (integer) - Number of vehicles currently waiting
      - `time_without_ai` (integer) - Wait time in seconds without AI optimization
      - `time_with_ai` (integer) - Wait time in seconds with AI optimization
      - `crowd_density` (text) - Crowd density at junction (low/medium/high)
      - `ai_optimization_active` (boolean) - Whether AI optimization is currently active
      - `created_at` (timestamptz) - Timestamp

    - `traffic_data`
      - `id` (uuid, primary key) - Unique identifier
      - `route_segment` (text) - Description of road segment
      - `latitude` (numeric) - Segment latitude
      - `longitude` (numeric) - Segment longitude
      - `crowd_level` (integer) - Crowd level (1-10 scale)
      - `average_speed` (numeric) - Average speed in km/h
      - `timestamp` (timestamptz) - When data was recorded
      - `weather_condition` (text) - Current weather affecting traffic

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users to read data
    - Add policies for authenticated users to insert search data
*/

-- Create user_searches table
CREATE TABLE IF NOT EXISTS user_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  start_location text NOT NULL,
  end_location text NOT NULL,
  start_lat numeric NOT NULL,
  start_lng numeric NOT NULL,
  end_lat numeric NOT NULL,
  end_lng numeric NOT NULL,
  search_timestamp timestamptz DEFAULT now(),
  selected_route_id uuid
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid REFERENCES user_searches(id) ON DELETE CASCADE,
  route_name text NOT NULL,
  total_distance numeric NOT NULL,
  estimated_time integer NOT NULL,
  crowd_level text NOT NULL DEFAULT 'medium',
  path_coordinates jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_optimal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create junctions table
CREATE TABLE IF NOT EXISTS junctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  junction_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  vehicles_waiting integer DEFAULT 0,
  time_without_ai integer NOT NULL,
  time_with_ai integer NOT NULL,
  crowd_density text DEFAULT 'low',
  ai_optimization_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create traffic_data table
CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_segment text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  crowd_level integer NOT NULL DEFAULT 5,
  average_speed numeric NOT NULL DEFAULT 40.0,
  timestamp timestamptz DEFAULT now(),
  weather_condition text DEFAULT 'clear'
);

-- Enable Row Level Security
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE junctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_searches
CREATE POLICY "Anyone can read search data"
  ON user_searches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert search data"
  ON user_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for routes
CREATE POLICY "Anyone can read routes"
  ON routes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert routes"
  ON routes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for junctions
CREATE POLICY "Anyone can read junctions"
  ON junctions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert junctions"
  ON junctions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for traffic_data
CREATE POLICY "Anyone can read traffic data"
  ON traffic_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert traffic data"
  ON traffic_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_search_id ON routes(search_id);
CREATE INDEX IF NOT EXISTS idx_junctions_route_id ON junctions(route_id);
CREATE INDEX IF NOT EXISTS idx_traffic_data_timestamp ON traffic_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_searches_timestamp ON user_searches(search_timestamp);