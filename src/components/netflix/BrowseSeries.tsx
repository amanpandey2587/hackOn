import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNetflixTVShows } from '../../hooks/useNetflixTVShows';
import { selectFilteredNetflixTVShows, selectNetflixTVLoading, selectNetflixTVError } from '../../redux/netflixTVSlice';
import type { RootState } from '../../redux/index';
import SeriesList from './SeriesList';

interface Show {
  id: string;
  title: string;
  year?: number;
  imdbId?: string;
  tmdbId?: number;
  tmdbType?: string;
  type?: string;
  poster?: string;
  backdrop?: string;
  plot?: string;
  runtime?: number;
  genre?: string[];
  userRating?: number;
  criticRating?: number;
  releaseDate?: string;
  networkNames?: string[];
  seasonCount?: number;
  episodeCount?: number;
  endYear?: number;
  trailer?: string;
  originalLanguage?: string;
  relevancePercentile?: number;
}

const BrowseSeries: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity_desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const {
    shows,
    loading,
    error,
    totalResults,
    hasMore,
    isEmpty,
    fetchShows,
    loadMore,
    refreshShows,
    searchShows,
    filterByGenre,
    filterByYear,
    isCacheValid,
    lastFetched
  } = useNetflixTVShows({ 
    page: 1, 
    limit: 20, 
    sortBy,
    forceRefresh: false 
  });

  const availableGenres = React.useMemo(() => {
    const genres = new Set<string>();
    shows.forEach(show => {
      show.genre?.forEach(g => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [shows]);

  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    shows.forEach(show => {
      if (show.year) years.add(show.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [shows]);

  const filteredShows = React.useMemo(() => {
    let filtered = [...shows]; 

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(show => 
        show.title.toLowerCase().includes(lowerQuery) ||
        show.genre?.some(g => g.toLowerCase().includes(lowerQuery)) ||
        show.plot?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(show => 
        show.genre?.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    if (selectedYear) {
      const yearNum = parseInt(selectedYear);
      filtered = filtered.filter(show => show.year === yearNum);
    }

    return filtered;
  }, [shows, searchQuery, selectedGenre, selectedYear]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleGenreFilter = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  const handleYearFilter = useCallback((year: string) => {
    setSelectedYear(year);
  }, []);

  const debouncedSearch = useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchQuery(query);
        }, 300); 
      };
    }, []),
    []
  );

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
  }, []);

  const handleRefresh = useCallback(() => {
    clearFilters();
    refreshShows();
  }, [clearFilters, refreshShows]);

  const handleRetry = useCallback(() => {
    refreshShows();
  }, [refreshShows]);

  
  const sortOptions = [
    { value: 'popularity_desc', label: 'Most Popular' },
    { value: 'popularity_asc', label: 'Least Popular' },
    { value: 'release_date_desc', label: 'Newest First' },
    { value: 'release_date_asc', label: 'Oldest First' },
    { value: 'title_asc', label: 'A-Z' },
    { value: 'title_desc', label: 'Z-A' },
    { value: 'user_rating_desc', label: 'Highest Rated' },
    { value: 'user_rating_asc', label: 'Lowest Rated' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative bg-gradient-to-r from-red-900/20 to-black/50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Netflix Series
              </h1>
              <p className="text-gray-300 text-lg">
                Discover top-rated TV series and shows
              </p>
              {lastFetched && (
                <p className="text-sm text-gray-400">
                  Last updated: {lastFetched} {isCacheValid && '(Cached)'}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="bg-red-600/20 px-4 py-2 rounded-lg border border-red-600/30">
                <span className="text-red-400 font-semibold">
                  {filteredShows.length} Series
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search series by title, plot, or genre..."
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => handleGenreFilter(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Genres</option>
                    {availableGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearFilter(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchQuery || selectedGenre || selectedYear) && (
                <div className="mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-6 py-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Error loading series</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                disabled={loading}
                className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8">
        <SeriesList 
          shows={filteredShows}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isEmpty={isEmpty && !loading}
        />
      </div>
    </div>
  );
};

export default BrowseSeries;