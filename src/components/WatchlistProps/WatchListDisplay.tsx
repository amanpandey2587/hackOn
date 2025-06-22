import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Star, Clock, Filter, Search } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface WatchlistItem {
  _id: string;
  contentId: string;
  contentType: string;
  title: string;
  priority: number;
  genre: string[];
  estimatedDuration?: number;
  addedAt: string;
  watchStatus?: {
    watchPercentage: number;
    completed: boolean;
    watchedAt: string;
  };
}

interface WatchlistDisplayProps {
  className?: string;
}

const WatchlistDisplay: React.FC<WatchlistDisplayProps> = ({ className = '' }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const {getToken}=useAuth();
  const fetchWatchlist = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy: 'addedAt',
          sortOrder: 'desc',
          includeWatched: 'false'
        });
      
        if (filterType !== 'all') {
          params.append('contentType', filterType);
        }
              
        if (filterPriority !== 'all') {
          params.append('priority', filterPriority);
        }
      
        const token = await getToken();
        const response = await fetch(`http://localhost:4000/api/watch-list?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      
        const data = await response.json();
        
        if (data.success) {
          setWatchlist(data.data);
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        } else {
          throw new Error(data.message || 'Failed to fetch watchlist');
        }
      } catch (error: any) {
        console.error('Error fetching watchlist:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
        const token=await getToken();
      const response = await fetch(`http://localhost:4000/api/watch-list/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setWatchlist(prev => prev.filter(item => item._id !== id));
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      setError(error.message);
    }
  };

  const updatePriority = async (id: string, newPriority: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/watch-list/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ priority: newPriority })
      });

      const data = await response.json();

      if (data.success) {
        setWatchlist(prev => prev.map(item => 
          item._id === id ? { ...item, priority: newPriority } : item
        ));
      } else {
        throw new Error(data.message || 'Failed to update priority');
      }
    } catch (error: any) {
      console.error('Error updating priority:', error);
      setError(error.message);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'text-red-500';
      case 4: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 2: return 'text-blue-500';
      case 1: return 'text-gray-500';
      default: return 'text-gray-500';
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

  const filteredWatchlist = watchlist.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchWatchlist();
  }, [filterType, filterPriority]);

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
          onClick={() => fetchWatchlist()} 
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Watchlist</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
            <option value="documentary">Documentaries</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="5">Urgent</option>
            <option value="4">High</option>
            <option value="3">Medium</option>
            <option value="2">Low</option>
            <option value="1">Later</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Your watchlist is empty</p>
            <p className="text-sm">Add some movies or series to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWatchlist.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full uppercase">
                        {item.contentType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${getPriorityColor(item.priority)}`} />
                        <span>{getPriorityText(item.priority)}</span>
                      </div>
                      
                      {item.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.estimatedDuration} min</span>
                        </div>
                      )}
                      
                      <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {item.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.genre.map((g, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={item.priority}
                      onChange={(e) => updatePriority(item._id, Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>Urgent</option>
                      <option value={4}>High</option>
                      <option value={3}>Medium</option>
                      <option value={2}>Low</option>
                      <option value={1}>Later</option>
                    </select>
                    
                    <button
                      onClick={() => removeFromWatchlist(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => fetchWatchlist(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-1 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => fetchWatchlist(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistDisplay;