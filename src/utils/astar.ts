/**
 * A* Pathfinding Algorithm Implementation
 * Finds optimal paths through the Delhi road network
 */

import { locations, buildGraph, RoadEdge } from './roadNetwork';

interface Node {
    id: string;
    gScore: number; // Cost from start to this node
    fScore: number; // gScore + heuristic
    parent: string | null;
}

// Haversine formula for distance between two points
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Heuristic function (straight-line distance)
const heuristic = (fromId: string, toId: string, weight: number = 1.0): number => {
    const from = locations[fromId];
    const to = locations[toId];
    if (!from || !to) return Infinity;
    return haversineDistance(from.lat, from.lng, to.lat, to.lng) * weight;
};

/**
 * A* Algorithm Implementation
 * @param startId - Starting location ID
 * @param endId - Destination location ID
 * @param heuristicWeight - Weight for heuristic (use different values to get different routes)
 * @returns Array of location IDs representing the path, or null if no path found
 */
export const astar = (
    startId: string,
    endId: string,
    heuristicWeight: number = 1.0
): string[] | null => {
    const graph = buildGraph();

    if (!graph.has(startId) || !graph.has(endId)) {
        return null;
    }

    // Priority queue (using array for simplicity, could optimize with heap)
    const openSet: Node[] = [{
        id: startId,
        gScore: 0,
        fScore: heuristic(startId, endId, heuristicWeight),
        parent: null
    }];

    const closedSet = new Set<string>();
    const nodeMap = new Map<string, Node>();
    nodeMap.set(startId, openSet[0]);

    while (openSet.length > 0) {
        // Get node with lowest fScore
        openSet.sort((a, b) => a.fScore - b.fScore);
        const current = openSet.shift()!;

        // Found the goal
        if (current.id === endId) {
            return reconstructPath(nodeMap, endId);
        }

        closedSet.add(current.id);

        // Check all neighbors
        const neighbors = graph.get(current.id);
        if (!neighbors) continue;

        for (const [neighborId, edge] of neighbors) {
            if (closedSet.has(neighborId)) continue;

            const tentativeGScore = current.gScore + edge.distance;

            let neighbor = nodeMap.get(neighborId);

            if (!neighbor) {
                // Discover new node
                neighbor = {
                    id: neighborId,
                    gScore: tentativeGScore,
                    fScore: tentativeGScore + heuristic(neighborId, endId, heuristicWeight),
                    parent: current.id
                };
                nodeMap.set(neighborId, neighbor);
                openSet.push(neighbor);
            } else if (tentativeGScore < neighbor.gScore) {
                // Found better path to this node
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = tentativeGScore + heuristic(neighborId, endId, heuristicWeight);
                neighbor.parent = current.id;

                // Add back to open set if not already there
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // No path found
    return null;
};

// Reconstruct path from parent links
const reconstructPath = (nodeMap: Map<string, Node>, endId: string): string[] => {
    const path: string[] = [];
    let current: string | null = endId;

    while (current !== null) {
        path.unshift(current);
        const node = nodeMap.get(current);
        current = node?.parent ?? null;
    }

    return path;
};

/**
 * Generate multiple different routes using A*
 * @param startId - Starting location ID
 * @param endId - Destination location ID
 * @returns Array of different paths
 */
export const findMultipleRoutes = (startId: string, endId: string): string[][] => {
    const routes: string[][] = [];

    // Generate routes with different heuristic weights
    // Lower weight = explores more, may find longer but less congested routes
    // Higher weight = more direct, faster route

    // Route 1: Balanced (standard A*)
    const route1 = astar(startId, endId, 1.0);
    if (route1) routes.push(route1);

    // Route 2: More exploratory (finds alternative paths)
    const route2 = astar(startId, endId, 0.6);
    if (route2 && !pathsEqual(route1, route2)) {
        routes.push(route2);
    }

    // Route 3: Very direct (shortest possible)
    const route3 = astar(startId, endId, 1.5);
    if (route3 && !pathsEqual(route1, route3) && !pathsEqual(route2, route3)) {
        routes.push(route3);
    }

    // If we still don't have 3 routes, try more variations
    if (routes.length < 3) {
        const route4 = astar(startId, endId, 0.8);
        if (route4 && !routes.some(r => pathsEqual(r, route4))) {
            routes.push(route4);
        }
    }

    return routes;
};

// Check if two paths are the same
const pathsEqual = (path1: string[] | null, path2: string[] | null): boolean => {
    if (!path1 || !path2) return false;
    if (path1.length !== path2.length) return false;
    return path1.every((id, i) => id === path2[i]);
};

/**
 * Calculate total distance of a path
 */
export const calculatePathDistance = (path: string[]): number => {
    const graph = buildGraph();
    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = graph.get(from)?.get(to);

        if (edge) {
            totalDistance += edge.distance;
        }
    }

    return totalDistance;
};

/**
 * Get road segments for a path
 */
export const getPathSegments = (path: string[]): RoadEdge[] => {
    const graph = buildGraph();
    const segments: RoadEdge[] = [];

    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = graph.get(from)?.get(to);

        if (edge) {
            segments.push(edge);
        }
    }

    return segments;
};
