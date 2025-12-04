import { TrendingDown, Users, Timer, Zap } from 'lucide-react';
import { Junction } from '../types/route';

interface JunctionDetailsProps {
  junction: Junction;
}

export function JunctionDetails({ junction }: JunctionDetailsProps) {
  const timeSaved = junction.time_without_ai - junction.time_with_ai;
  const percentageSaved = ((timeSaved / junction.time_without_ai) * 100).toFixed(0);

  const crowdColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {junction.junction_name}
            {junction.ai_optimization_active && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                <Zap className="w-3 h-3" />
                AI Active
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Coordinates: {junction.latitude.toFixed(4)}, {junction.longitude.toFixed(4)}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border ${crowdColors[junction.crowd_density]} text-xs font-medium`}>
          {junction.crowd_density.toUpperCase()} DENSITY
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <Users className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-700">
          <span className="font-semibold">{junction.vehicles_waiting}</span> vehicles waiting
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Without AI</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatTime(junction.time_without_ai)}</p>
          <p className="text-xs text-gray-500 mt-1">Traditional timing</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">With AI</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{formatTime(junction.time_with_ai)}</p>
          <p className="text-xs text-green-600 mt-1">AI optimized</p>
        </div>
      </div>

      {timeSaved > 0 ? (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">Time Saved</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatTime(timeSaved)}</p>
              <p className="text-sm opacity-90">{percentageSaved}% reduction</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">No significant crowd - AI monitoring active</span>
          </div>
        </div>
      )}
    </div>
  );
}
