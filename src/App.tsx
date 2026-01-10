import { useState } from 'react';
import { LocationInput } from './components/LocationInput';
import { RouteCard } from './components/RouteCard';
import { MapView } from './components/MapView';
import { Route } from './types/route';
import { generateRoutes, getLocationCoordinates } from './utils/routeGenerator';
import { MapPin, Sparkles, TrendingUp } from 'lucide-react';

function App() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (startLocation: string, endLocation: string) => {
    setIsLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const start = await getLocationCoordinates(startLocation);
      const end = await getLocationCoordinates(endLocation);

      const generatedRoutes = await generateRoutes(start, end);

      const sortedRoutes = generatedRoutes.sort((a, b) => {
        if (a.is_optimal) return -1;
        if (b.is_optimal) return 1;
        return 0;
      });

      setRoutes(sortedRoutes);
    } catch (err) {
      setError('Failed to generate routes. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SmartRoute AI
            </h1>
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Intelligent route optimization powered by real-time AI predictions and crowd analysis
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-medium">Real-Time Traffic</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Smart Navigation</span>
            </div>
          </div>
        </header>

        <div className="mb-12">
          <LocationInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Routes...</h3>
              <p className="text-gray-600">Our AI is calculating the best paths for you</p>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>Checking traffic</span>
                <span>•</span>
                <span>Analyzing crowds</span>
                <span>•</span>
                <span>Optimizing junctions</span>
              </div>
            </div>
          </div>
        )}

        {!isLoading && routes.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
              <h2 className="text-2xl font-bold mb-2">Route Analysis Complete</h2>
              <p className="text-blue-50">
                Found {routes.length} routes. AI has optimized junction timings and identified the best path for you.
              </p>
            </div>

            {/* Map Visualization */}
            <MapView routes={routes} />

            <div className="space-y-6">
              {routes.map((route, index) => (
                <RouteCard key={route.id} route={route} rank={index + 1} />
              ))}
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How AI Optimization Works</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>AI analyzes real-time traffic and crowd density at each junction</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Smart signal timing reduces wait times by 10-40% depending on traffic</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Optimal route selection balances both time (70%) and distance (30%)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>When junctions have low traffic, AI monitoring remains active without changes</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && searchPerformed && routes.length === 0 && !error && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-600 text-lg">No routes found. Please try different locations.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
