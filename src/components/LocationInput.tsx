import { useState } from 'react';
import { MapPin, ArrowRight, Navigation } from 'lucide-react';

interface LocationInputProps {
  onSearch: (startLocation: string, endLocation: string) => void;
  isLoading: boolean;
}

export function LocationInput({ onSearch, isLoading }: LocationInputProps) {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startLocation.trim() && endLocation.trim()) {
      onSearch(startLocation, endLocation);
    }
  };

  const popularLocations = [
    'Connaught Place, Delhi',
    'India Gate, Delhi',
    'Chandni Chowk, Delhi',
    'Karol Bagh, Delhi',
    'Nehru Place, Delhi',
    'Noida Sector 18',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Plan Your Journey</h2>
            <p className="text-gray-600 text-sm">AI-powered route optimization with real-time crowd analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter starting location"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center">
            <div className="p-2 bg-gray-100 rounded-full">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="Enter destination"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !startLocation.trim() || !endLocation.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Finding Best Routes...' : 'Find Optimal Routes'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 font-medium">Popular Locations:</p>
          <div className="flex flex-wrap gap-2">
            {popularLocations.map((location) => (
              <button
                key={location}
                onClick={() => {
                  if (!startLocation) {
                    setStartLocation(location);
                  } else if (!endLocation) {
                    setEndLocation(location);
                  }
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                disabled={isLoading}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
