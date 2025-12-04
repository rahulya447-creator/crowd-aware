import { Clock, TrendingUp, Users, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Route } from '../types/route';
import { JunctionDetails } from './JunctionDetails';
import { useState } from 'react';

interface RouteCardProps {
  route: Route;
  rank: number;
}

export function RouteCard({ route, rank }: RouteCardProps) {
  const [showJunctions, setShowJunctions] = useState(false);

  const crowdColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const crowdIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const totalTimeWithAI = route.estimated_time - (route.junctions?.reduce((sum, j) =>
    (j.time_without_ai - j.time_with_ai), 0) || 0) / 60;

  const timeSavedByAI = route.estimated_time - totalTimeWithAI;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
      route.is_optimal ? 'ring-4 ring-green-400 ring-opacity-50' : ''
    }`}>
      {route.is_optimal && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">AI Recommended - Optimal Route</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              {rank}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{route.route_name}</h3>
              <p className="text-sm text-gray-500">Route Option {rank}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border-2 ${crowdColors[route.crowd_level]} font-medium text-sm flex items-center gap-2`}>
            <span>{crowdIcons[route.crowd_level]}</span>
            <span className="capitalize">{route.crowd_level} Traffic</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{Math.floor(totalTimeWithAI)}</p>
            <p className="text-xs text-gray-600 mt-1">minutes</p>
            {timeSavedByAI > 1 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                Saves {Math.floor(timeSavedByAI)} min with AI
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">Distance</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{route.total_distance.toFixed(1)}</p>
            <p className="text-xs text-gray-600 mt-1">kilometers</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600">Junctions</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{route.junctions?.length || 0}</p>
            <p className="text-xs text-gray-600 mt-1">checkpoints</p>
          </div>
        </div>

        {route.junctions && route.junctions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowJunctions(!showJunctions)}
              className="w-full flex items-center justify-between text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Junction AI Optimization Details</p>
                  <p className="text-sm text-gray-600">See how AI reduces wait times at each junction</p>
                </div>
              </div>
              {showJunctions ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showJunctions && (
              <div className="mt-4 space-y-3">
                {route.junctions.map((junction) => (
                  <JunctionDetails key={junction.id} junction={junction} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
