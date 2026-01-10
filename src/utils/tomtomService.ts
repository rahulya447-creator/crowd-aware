/**
 * TomTom Routing Service
 * Fetches route geometry from TomTom Routing API
 */

interface TomTomCoordinate {
    lat: number;
    lng: number;
}

// Interface removed to fix lint error (unused)

/**
 * Fetch route from TomTom API with Traffic Data
 */
export async function fetchTomTomRoute(
    coordinates: TomTomCoordinate[]
): Promise<Array<{
    geometry: TomTomCoordinate[];
    segments: { color: string, start_index: number, end_index: number }[];
    signals: { lat: number, lng: number, state: 'red' | 'green' | 'yellow' }[];
    summary: { distance: number, travelTime: number };
}> | null> {
    try {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
        console.log('🔑 TomTom Key Status:', apiKey ? (apiKey.includes('placeholder') ? 'Placeholder' : 'Valid') : 'Missing');

        // MOCK MODE: If key is missing/placeholder, generate fake traffic data for demo
        if (!apiKey || apiKey.includes('placeholder')) {
            console.log('⚠️ No TomTom Key: Using Mock Traffic Data for Demo');

            // MOCK MODE SIMPLIFIED DEBUG
            return null; // Force null to test file validity

        }


        // Format: lat,lng:lat,lng
        const locations = coordinates
            .map(c => `${c.lat},${c.lng}`)
            .join(':');

        // Request alternatives
        const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${apiKey}&routeRepresentation=polyline&computeBestOrder=false&instructionsType=tagged&traffic=true&sectionType=traffic&maxAlternatives=2`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`TomTom API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return null;
        }

        // Map ALL routes (Optimal + Alternatives)
        const parsedRoutes = data.routes.map((route: any) => {
            // 1. Extract Geometry
            const points: TomTomCoordinate[] = [];
            route.legs.forEach((leg: any) => {
                leg.points.forEach((point: any) => {
                    points.push({
                        lat: point.latitude,
                        lng: point.longitude
                    });
                });
            });

            // 2. Extract Traffic Sections
            const segments: { color: string, start_index: number, end_index: number }[] = [];
            let lastIndex = 0;

            if (route.sections) {
                route.sections.forEach((section: any) => {
                    if (section.startPointIndex > lastIndex) {
                        segments.push({
                            color: '#22c55e',
                            start_index: lastIndex,
                            end_index: section.startPointIndex
                        });
                    }

                    let color = '#22c55e';
                    if (section.sectionType === 'TRAFFIC') color = '#ef4444';
                    else if (section.sectionType === 'JAMS') color = '#ef4444';

                    segments.push({
                        color: color,
                        start_index: section.startPointIndex,
                        end_index: section.endPointIndex
                    });

                    lastIndex = section.endPointIndex;
                });
            }

            if (lastIndex < points.length - 1) {
                segments.push({
                    color: '#22c55e',
                    start_index: lastIndex,
                    end_index: points.length - 1
                });
            }

            // 3. Extract Signals
            const signals: { lat: number, lng: number, state: 'red' | 'green' | 'yellow' }[] = [];
            if (route.guidance && route.guidance.instructions) {
                route.guidance.instructions.forEach((instruction: any) => {
                    const relevantManeuvers = ['TURN', 'ROUNDABOUT', 'MERGE', 'fork'];
                    if (relevantManeuvers.some(m => instruction.maneuver.includes(m))) {
                        const pointIndex = instruction.pointIndex;
                        const segment = segments.find(s => pointIndex >= s.start_index && pointIndex <= s.end_index);
                        const color = segment ? segment.color : '#22c55e';

                        let state: 'red' | 'green' | 'yellow' = 'green';
                        if (color === '#ef4444') state = 'red';
                        if (color === '#f59e0b') state = 'yellow';

                        signals.push({
                            lat: instruction.point.latitude,
                            lng: instruction.point.longitude,
                            state: state
                        });
                    }
                });
            }

            return {
                geometry: points,
                segments: segments,
                signals: signals,
                summary: {
                    distance: route.summary.lengthInMeters,
                    travelTime: route.summary.travelTimeInSeconds
                }
            };
        });

        console.log(`✅ TomTom Traffic: Found ${parsedRoutes.length} route(s)`);
        return parsedRoutes;

    } catch (error) {
        console.warn('TomTom fetch failed:', error);
        return null; // return array or null
    }
}


