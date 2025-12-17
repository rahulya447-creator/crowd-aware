import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { Route } from '../types/route';
import L from 'leaflet';
import { useState } from 'react';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom start marker (green with A)
const startIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        background-color: #10b981;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">A</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

// Custom end marker (red with B)
const endIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        background-color: #ef4444;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">B</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

interface MapViewProps {
    routes: Route[];
}

export function MapView({ routes }: MapViewProps) {
    const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

    if (routes.length === 0) return null;

    // Calculate center
    const allLats = routes.flatMap(r => r.path_coordinates.map(c => c.lat));
    const allLngs = routes.flatMap(r => r.path_coordinates.map(c => c.lng));
    const centerLat = allLats.reduce((a, b) => a + b, 0) / allLats.length;
    const centerLng = allLngs.reduce((a, b) => a + b, 0) / allLngs.length;

    // Route-specific colors (Google Maps style)
    const routeColors = [
        { main: '#4285F4', border: '#1967D2' }, // Blue (primary)
        { main: '#9333EA', border: '#7C3AED' }, // Purple (alternative 1)
        { main: '#F59E0B', border: '#D97706' }, // Amber (alternative 2)
    ];

    // Get start and end positions
    const startPosition = routes[0]?.path_coordinates[0];
    const endPosition = routes[0]?.path_coordinates[routes[0].path_coordinates.length - 1];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Route Map Visualization</h2>
                <p className="text-gray-600">
                    Visual representation of all routes. Hover over routes for details.
                </p>
            </div>

            {/* Enhanced Legend */}
            <div className="mb-4 space-y-2">
                <div className="flex gap-4 flex-wrap">
                    {routes.map((route, index) => {
                        const colors = route.is_optimal ? routeColors[0] : routeColors[index % routeColors.length];
                        return (
                            <div
                                key={route.id}
                                className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                                onMouseEnter={() => setHoveredRoute(route.id)}
                                onMouseLeave={() => setHoveredRoute(null)}
                            >
                                <div
                                    style={{
                                        backgroundColor: colors.main,
                                        width: hoveredRoute === route.id ? '48px' : '40px',
                                        transition: 'all 0.2s'
                                    }}
                                    className="h-2 rounded-full shadow-md"
                                ></div>
                                <div>
                                    <span className={`text-sm ${route.is_optimal ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>
                                        {route.route_name}
                                        {route.is_optimal && ' ⭐'}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        {route.total_distance.toFixed(1)} km · {Math.round(route.estimated_time)} min
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map Container */}
            <div style={{ height: '500px', width: '100%' }} className="rounded-xl overflow-hidden border-2 border-gray-200">
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', minHeight: '500px' }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Draw routes with enhanced styling */}
                    {routes.map((route, index) => {
                        const positions: [number, number][] = route.path_coordinates.map(c => [c.lat, c.lng]);
                        const colors = route.is_optimal ? routeColors[0] : routeColors[index % routeColors.length];
                        const isHovered = hoveredRoute === route.id;
                        const isOptimal = route.is_optimal;

                        return (
                            <div key={route.id}>
                                {/* Border/shadow polyline (Always White) */}
                                <Polyline
                                    positions={positions}
                                    pathOptions={{
                                        color: '#FFFFFF',
                                        weight: isHovered ? 12 : (isOptimal ? 10 : 8),
                                        opacity: 0.8,
                                        lineCap: 'round',
                                        lineJoin: 'round',
                                    }}
                                    eventHandlers={{
                                        mouseover: () => setHoveredRoute(route.id),
                                        mouseout: () => setHoveredRoute(null),
                                    }}
                                />

                                {/* Main route polyline OR Traffic Segments */}
                                {route.traffic_segments && route.traffic_segments.length > 0 ? (
                                    // Render Multi-Colored Segments based on Traffic
                                    route.traffic_segments.map((segment, segIdx) => {
                                        // Slice the positions array for this segment
                                        // Ensure we include the end index to connect segments visually
                                        const segmentPositions = positions.slice(segment.start_index, segment.end_index + 1);
                                        return (
                                            <Polyline
                                                key={`${route.id}-seg-${segIdx}`}
                                                positions={segmentPositions}
                                                pathOptions={{
                                                    color: segment.color, // Green/Red/Orange form TomTom
                                                    weight: isHovered ? 8 : (isOptimal ? 6 : 5),
                                                    opacity: isHovered ? 1 : (isOptimal ? 0.95 : 0.85),
                                                    lineCap: 'round',
                                                    lineJoin: 'round',
                                                }}
                                                eventHandlers={{
                                                    mouseover: () => setHoveredRoute(route.id),
                                                    mouseout: () => setHoveredRoute(null),
                                                }}
                                            />
                                        );
                                    })
                                ) : (
                                    // Fallback to Single Color (Mapbox/OSRM/Cache)
                                    <Polyline
                                        positions={positions}
                                        pathOptions={{
                                            color: colors.main,
                                            weight: isHovered ? 8 : (isOptimal ? 6 : 5),
                                            opacity: isHovered ? 1 : (isOptimal ? 0.95 : 0.85),
                                            lineCap: 'round',
                                            lineJoin: 'round',
                                        }}
                                        eventHandlers={{
                                            mouseover: () => setHoveredRoute(route.id),
                                            mouseout: () => setHoveredRoute(null),
                                        }}
                                    />
                                )}

                                {/* Traffic Signal Icons (Derived from Density) - REMOVED per user request */}
                                {false && route.traffic_signals?.map((signal, sigIdx) => {
                                    // Custom Traffic Light Icon
                                    const signalColor = signal.state === 'red' ? '#ef4444' : (signal.state === 'yellow' ? '#f59e0b' : '#22c55e');
                                    const signalIcon = L.divIcon({
                                        className: 'traffic-signal-icon',
                                        html: `<div style="
                                            background-color: #374151; /* Dark Grey Housing */
                                            width: 14px;
                                            height: 24px;
                                            border-radius: 4px;
                                            border: 2px solid white;
                                            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: space-around;
                                            padding: 1px;
                                        ">
                                            <div style="
                                                width: 8px;
                                                height: 8px;
                                                border-radius: 50%;
                                                background-color: ${signalColor};
                                                box-shadow: 0 0 4px ${signalColor};
                                            "></div>
                                        </div>`,
                                        iconSize: [20, 30],
                                        iconAnchor: [10, 30], // Tip of pole at bottom
                                    });

                                    return (
                                        <Marker
                                            key={`${route.id}-sig-${sigIdx}`}
                                            position={[signal.lat, signal.lng]}
                                            icon={signalIcon}
                                        >
                                            <Popup>
                                                <div className="p-2 text-center">
                                                    <strong style={{ color: signalColor }}>
                                                        {signal.state.toUpperCase()} LIGHT
                                                    </strong>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Flow based signal simulation
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Start marker */}
                    {startPosition && (
                        <Marker position={[startPosition.lat, startPosition.lng]} icon={startIcon}>
                            <Popup>
                                <div style={{ padding: '8px' }}>
                                    <strong style={{ color: '#10b981' }}>Start Location</strong>
                                    <p style={{ fontSize: '12px', margin: '4px 0' }}>{routes[0]?.route_name.split(' to ')[0]}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* End marker */}
                    {endPosition && (
                        <Marker position={[endPosition.lat, endPosition.lng]} icon={endIcon}>
                            <Popup>
                                <div style={{ padding: '8px' }}>
                                    <strong style={{ color: '#ef4444' }}>End Location</strong>
                                    <p style={{ fontSize: '12px', margin: '4px 0' }}>{routes[0]?.route_name.split(' to ')[1]}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Junction markers */}
                    {routes.flatMap((route) =>
                        route.junctions?.map((junction) => (
                            <Marker key={junction.id} position={[junction.latitude, junction.longitude]}>
                                <Popup>
                                    <div style={{ padding: '8px' }}>
                                        <strong>{junction.junction_name}</strong>
                                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{route.route_name}</p>
                                        <div style={{ fontSize: '11px' }}>
                                            <p><strong>Crowd:</strong> {junction.crowd_density}</p>
                                            <p><strong>Vehicles:</strong> {junction.vehicles_waiting}</p>
                                            <p><strong>Wait (No AI):</strong> {Math.floor(junction.time_without_ai / 60)}:{(junction.time_without_ai % 60).toString().padStart(2, '0')}</p>
                                            <p style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                <strong>Wait (AI):</strong> {Math.floor(junction.time_with_ai / 60)}:{(junction.time_with_ai % 60).toString().padStart(2, '0')}
                                            </p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )) || []
                    )}
                </MapContainer>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Tip:</span> Hover over routes to highlight them. Click markers for details.
                </p>
            </div>
        </div>
    );
}
