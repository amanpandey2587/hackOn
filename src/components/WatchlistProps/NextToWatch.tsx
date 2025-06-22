import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Calendar } from 'lucide-react';
import { useAuth,useUser } from '@clerk/clerk-react';
interface NextToWatchItem {
  _id: string;
  contentId: string;
  contentType: string;
  title: string;
  priority: number;
  genre: string[];
  estimatedDuration?: number;
  addedAt: string;
}

interface NextToWatchProps {
  limit?: number;
  className?: string;
  onItemSelect?: (item: NextToWatchItem) => void;
}

const NextToWatch: React.FC<NextToWatchProps> = ({ 
  limit = 10, 
  className = '',
  onItemSelect 
}) => {
  const [nextItems, setNextItems] = useState<NextToWatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const fetchNextToWatch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      console.log("Limit in the frotnend ",limit)
      const token=await getToken();
      console.log("Tokn is",token)
      const response = await fetch(`http://localhost:4000/api/watch-list/next?${params}`, {
        method:'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setNextItems(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch next items');
      }
    } catch (error: any) {
      console.error('Error fetching next to watch:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'text-red-500 bg-red-50 border-red-200';
      case 4: return 'text-orange-500 bg-orange-50 border-orange-200';
      case 3: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-blue-500 bg-blue-50 border-blue-200';
      case 1: return 'text-gray-500 bg-gray-50 border-gray-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie': return '🎬';
      case 'series': return '📺';
      case 'documentary': return '📽️';
      default: return '🎬';
    }
  };

  useEffect(() => {
    fetchNextToWatch();
  }, [limit]);

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
          onClick={fetchNextToWatch} 
          className="mt-2 text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Play className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Next to Watch</h2>
        </div>
        <p className="text-gray-600">Prioritized by importance and date added</p>
      </div>

      <div className="p-6">
        {nextItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No items in your watchlist</p>
            <p className="text-sm">Add some content to see recommendations!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextItems.map((item, index) => (
              <div 
                key={item._id} 
                className={`
                  border rounded-lg p-4 transition-all duration-200 cursor-pointer
                  hover:shadow-md hover:border-blue-300 group
                  ${index === 0 ? 'ring-2 ring-green-200 border-green-300 bg-green-50' : 'border-gray-200'}
                `}
                onClick={() => onItemSelect?.(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {index === 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          #1 NEXT
                        </span>
                      )}
                      <span className="text-lg">{getContentTypeIcon(item.contentType)}</span>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                        <Star className="w-3 h-3" />
                        <span className="font-medium">{getPriorityText(item.priority)}</span>
                      </div>
                      
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase text-xs">
                        {item.contentType}
                      </span>
                      
                      {item.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(item.estimatedDuration)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {item.genre.slice(0, 3).map((g, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                            {g}
                          </span>
                        ))}
                        {item.genre.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                            +{item.genre.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {nextItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Showing top {nextItems.length} items sorted by priority and date added
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextToWatch;