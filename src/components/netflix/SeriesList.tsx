import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toggleShowFavorite, setShowRating } from '../../redux/netflixTVSlice';
import WatchSeries from './WatchSeries';

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
  isFavorite?: boolean;
  userPersonalRating?: number;
  watchProgress?: number;
  isCompleted?: boolean;
}

interface SeriesListProps {
  shows: Show[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isEmpty: boolean;
}

const SeriesList: React.FC<SeriesListProps> = ({
  shows,
  loading,
  hasMore,
  onLoadMore,
  isEmpty
}) => {
  const dispatch = useDispatch();
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);

  const handleShowClick = useCallback((show: Show) => {
    setSelectedShow(show);
    setIsWatchModalOpen(true);
  }, []);

  const handleCloseWatchModal = useCallback(() => {
    setIsWatchModalOpen(false);
    setSelectedShow(null);
  }, []);

  const handleToggleFavorite = useCallback((showId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleShowFavorite(showId));
  }, [dispatch]);

  const handleRateShow = useCallback((showId: string, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowRating({ showId, rating }));
  }, [dispatch]);

  const formatRating = useCallback((rating?: number) => {
    if (!rating) return 'N/A';
    return (rating / 2).toFixed(1);
  }, []);

  const getProgressColor = useCallback((progress?: number) => {
    if (!progress) return 'bg-gray-600';
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  }, []);

  const LoadingCard = () => (
    <div className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-700"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (isEmpty) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Series Found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filters to find more series.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <div
            key={show.id}
            className="group relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
            onClick={() => handleShowClick(show)}
          >
            {/* Poster */}
            <div className="aspect-[2/3] relative overflow-hidden">
              {show.poster ? (
                <img
                  src={show.poster}
                  alt={show.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z" />
                  </svg>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-transparent bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-red-600 bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
                    Watch Now
                  </div>
                  <p className="text-white text-xs px-2">
                    {show.seasonCount && `${show.seasonCount} Season${show.seasonCount > 1 ? 's' : ''}`}
                    {show.episodeCount && ` • ${show.episodeCount} Episodes`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => handleToggleFavorite(show.id, e)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    show.isFavorite 
                      ? 'bg-red-600 text-white' 
                      : 'bg-black bg-opacity-50 text-white hover:bg-red-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>

              {/* Rating Badge */}
              {(show.userRating || show.criticRating) && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                  ⭐ {formatRating(show.userRating || show.criticRating)}
                </div>
              )}

              {/* Progress Bar */}
              {show.watchProgress && show.watchProgress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                  <div 
                    className={`h-full ${getProgressColor(show.watchProgress)}`}
                    style={{ width: `${show.watchProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Series Info */}
            <div className="p-3 space-y-2">
              <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                {show.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{show.year || 'Unknown'}</span>
                {show.networkNames && show.networkNames.length > 0 && (
                  <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                    {show.networkNames[0]}
                  </span>
                )}
              </div>
              
              {/* Genres */}
              {show.genre && show.genre.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {show.genre.slice(0, 2).map((genre, index) => (
                    <span 
                      key={index}
                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                  {show.genre.length > 2 && (
                    <span className="text-gray-400 text-xs">
                      +{show.genre.length - 2} more
                    </span>
                  )}
                </div>
              )}

              {/* User Rating */}
              {show.userPersonalRating && (
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-gray-400">Your rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${
                          star <= show.userPersonalRating! ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Cards */}
        {loading && Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={`loading-${index}`} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
          >
            Load More Series
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && shows.length > 0 && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
            <span>Loading more series...</span>
          </div>
        </div>
      )}

      {selectedShow && (
        <WatchSeries
          isOpen={isWatchModalOpen}
          onClose={handleCloseWatchModal}
          show={selectedShow}
        />
      )}
    </>
  );
};

export default SeriesList;