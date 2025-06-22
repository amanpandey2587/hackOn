import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Star, Film, Tv, FileText } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface WatchlistStats {
  overview: {
    totalItems: number;
    totalEstimatedDuration: number;
    averagePriority: number;
  };
  genreDistribution: Array<{ _id: string; count: number }>;
  contentTypeDistribution: Array<{ _id: string; count: number }>;
  priorityDistribution: Array<{ _id: number; count: number }>;
}

interface WatchlistStatisticsProps {
  className?: string;
}

const WatchlistStatistics: React.FC<WatchlistStatisticsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<WatchlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const {getToken}=useAuth()
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    const token=await getToken();
    try {
      const response = await fetch('http://localhost:4000/api/watch-list/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 5: return 'Urgent';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Later';
      default: return 'Unknown';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie': return <Film className="w-5 h-5" />;
      case 'series': return <Tv className="w-5 h-5" />;
      case 'documentary': return <FileText className="w-5 h-5" />;
      default: return <Film className="w-5 h-5" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie': return 'bg-blue-500';
      case 'series': return 'bg-green-500';
      case 'documentary': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 1: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchStatistics} 
          className="mt-2 text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Watchlist Statistics</h2>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Items</p>
                <p className="text-3xl font-bold">{stats.overview.totalItems}</p>
              </div>
              <Film className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Duration</p>
                <p className="text-3xl font-bold">
                  {formatDuration(stats.overview.totalEstimatedDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Priority</p>
                <p className="text-3xl font-bold">
                  {stats.overview.averagePriority.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Type Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Types</h3>
            <div className="space-y-3">
              {stats.contentTypeDistribution.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getContentTypeColor(item._id)} text-white`}>
                      {getContentTypeIcon(item._id)}
                    </div>
                    <span className="font-medium text-gray-700 capitalize">
                      {item._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-2 rounded-full ${getContentTypeColor(item._id)}`}
                      style={{ 
                        width: `${(item.count / stats.overview.totalItems) * 100}px`,
                        minWidth: '20px'
                      }}
                    />
                    <span className="text-sm font-semibold text-gray-600 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Levels</h3>
            <div className="space-y-3">
              {stats.priorityDistribution.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getPriorityColor(item._id)}`} />
                    <span className="font-medium text-gray-700">
                      {getPriorityText(item._id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-2 rounded-full ${getPriorityColor(item._id)}`}
                      style={{ 
                        width: `${(item.count / stats.overview.totalItems) * 100}px`,
                        minWidth: '20px'
                      }}
                    />
                    <span className="text-sm font-semibold text-gray-600 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Genres */}
        {stats.genreDistribution.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Genres</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.genreDistribution.slice(0, 8).map((genre) => (
                <div key={genre._id} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="font-medium text-gray-800 text-sm">{genre._id}</p>
                  <p className="text-2xl font-bold text-blue-600">{genre.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistStatistics;