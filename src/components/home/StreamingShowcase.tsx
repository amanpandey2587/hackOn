
import React, { useState, useEffect } from 'react';
import { useMainContent } from '../../hooks/useMainContent';
import type{ DetailedContentItem } from '../../types/streaming';

interface StreamingContentProps {
  platform?: 'netflix' | 'prime' | 'disney' | 'hbo' | 'all';
  contentType?: 'movie' | 'tv_series';
  autoFetchDetails?: boolean;
}

const StreamingShowcase: React.FC<StreamingContentProps> = ({
  platform = 'all',
  contentType = 'tv_series',
  autoFetchDetails = true
}) => {
  const {
    content,
    loading,
    error,
    hasContent,
    isEmpty,
    isDataStale,
    fromCache,
    stats,
    fetchNetflixContent,
    fetchAmazonPrimeContent,
    fetchDisneyPlusContent,
    fetchHBOMaxContent,
    fetchAllMajorPlatforms,
    fetchItemDetails,
    enrichContentWithDetails,
    clearContentCache,
    clearContentError,
    searchContent,
    getContentByGenre,
    getTrendingContent
  } = useMainContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredContent, setFilteredContent] = useState<DetailedContentItem[]>([]);

  useEffect(() => {
    const fetchByPlatform = async () => {
      const options = { type: contentType, limit: 20 };
      
      switch (platform) {
        case 'netflix':
          await fetchNetflixContent(options);
          break;
        case 'prime':
          await fetchAmazonPrimeContent(options);
          break;
        case 'disney':
          await fetchDisneyPlusContent(options);
          break;
        case 'hbo':
          await fetchHBOMaxContent(options);
          break;
        case 'all':
        default:
          await fetchAllMajorPlatforms(options);
          break;
      }
    };

    if (!hasContent || isDataStale) {
      fetchByPlatform();
    }
  }, [platform, contentType]);

  useEffect(() => {
    if (hasContent && autoFetchDetails) {
      enrichContentWithDetails(20); 
    }
  }, [hasContent, autoFetchDetails]);

  useEffect(() => {
    let filtered = content;

    if (searchQuery) {
      filtered = searchContent(searchQuery);
    }

    if (selectedGenre) {
      filtered = selectedGenre === 'trending' 
        ? getTrendingContent()
        : getContentByGenre(selectedGenre);
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, selectedGenre, searchContent, getContentByGenre, getTrendingContent]);

  const handleFetchItemDetails = async (itemId: number) => {
    try {
      await fetchItemDetails(itemId);
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    }
  };

  const availableGenres = React.useMemo(() => {
    const genres = new Set<string>();
    content.forEach(item => {
      item.genre_names?.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [content]);

  if (loading && !hasContent) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">Loading streaming content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-red-800 font-semibold">Error Loading Content</h3>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={() => {
            clearContentError();
            clearContentCache();
            window.location.reload();
          }}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-gray-600">No content available</p>
        <button
          onClick={() => fetchAllMajorPlatforms({ type: contentType })}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Content
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Streaming Content {platform !== 'all' && `- ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Total: {stats.totalItems} items</span>
          <span>Enriched: {stats.enrichedItems} items</span>
          <span>Avg Rating: {stats.averageRating.toFixed(1)}</span>
          {fromCache && <span className="text-blue-600">• From Cache</span>}
          {isDataStale && <span className="text-orange-600">• Data may be stale</span>}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search movies and shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2 border bg-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Genres</option>
          <option value="trending">Trending</option>
          {availableGenres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <button
          onClick={() => clearContentCache()}
          className="px-4 py-2 bg-black-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredContent.slice(0, 10).map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            {item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            )}
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {item.title}
              </h3>
              
              
              
              <div className="flex items-center justify-between mb-3">
               
                
                {item.release_date && (
                  <span className="text-sm text-gray-500">
                    {new Date(item.release_date).getFullYear()}
                  </span>
                )}
              </div>
              
              {item.genre_names && item.genre_names.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.genre_names.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                  {item.genre_names.length > 3 && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      +{item.genre_names.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleFetchItemDetails(item.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                
                
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length > 0 && !loading && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const nextBatch = { type: contentType, limit: 20, offset: content.length };
              switch (platform) {
                case 'netflix':
                  fetchNetflixContent(nextBatch);
                  break;
                case 'prime':
                  fetchAmazonPrimeContent(nextBatch);
                  break;
                case 'disney':
                  fetchDisneyPlusContent(nextBatch);
                  break;
                case 'hbo':
                  fetchHBOMaxContent(nextBatch);
                  break;
                default:
                  fetchAllMajorPlatforms(nextBatch);
                  break;
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Load More Content
          </button>
        </div>
      )}

      {loading && hasContent && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span>Loading more content...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingShowcase;