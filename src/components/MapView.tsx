import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { Route } from '../types/route';
import L from 'leaflet';

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

interface MapViewProps {
    routes: Route[];
}

export function MapView({ routes }: MapViewProps) {
    if (routes.length === 0) return null;

    // Calculate center
    const allLats = routes.flatMap(r => r.path_coordinates.map(c => c.lat));
    const allLngs = routes.flatMap(r => r.path_coordinates.map(c => c.lng));
    const centerLat = allLats.reduce((a, b) => a + b, 0) / allLats.length;
    const centerLng = allLngs.reduce((a, b) => a + b, 0) / allLngs.length;

    const crowdColors = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Route Map Visualization</h2>
                <p className="text-gray-600">
                    Visual representation of all routes with color-coded traffic levels.
                </p>
            </div>

            {/* Legend */}
            <div className="mb-4 flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-green-500"></div>
                    <span className="text-sm text-gray-700">Low Traffic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-amber-500"></div>
                    <span className="text-sm text-gray-700">Medium Traffic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-red-500"></div>
                    <span className="text-sm text-gray-700">High Traffic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-blue-600"></div>
                    <span className="text-sm text-gray-700 font-semibold">Optimal Route</span>
                </div>
            </div>

            {/* Map Container */}
            <div style={{ height: '500px', width: '100%' }} className="rounded-xl overflow-hidden border-2 border-gray-200">
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {routes.map((route) => {
                        const positions: [number, number][] = route.path_coordinates.map(c => [c.lat, c.lng]);
                        const color = route.is_optimal ? '#2563eb' : crowdColors[route.crowd_level];

                        return (
                            <Polyline
                                key={route.id}
                                positions={positions}
                                pathOptions={{
                                    color: color,
                                    weight: route.is_optimal ? 6 : 4,
                                    opacity: route.is_optimal ? 0.9 : 0.6,
                                }}
                            />
                        );
                    })}

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
                    <span className="font-semibold">💡 Tip:</span> Click junction markers for traffic details
                </p>
            </div>
        </div>
    );
}
