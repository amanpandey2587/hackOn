import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useMainContent } from '../../hooks/useMainContent';
import type { DetailedContentItem } from '../../types/streaming';
import WatchMovie from '../WatchMovies';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface StreamProps {
  platform?: 'netflix' | 'prime' | 'disney' | 'hbo' | 'all';
  contentType?: 'movie' | 'tv_series';
}

interface EnhancedContentItem extends DetailedContentItem {
  tvMazeData?: {
    id: number;
    name: string;
    summary: string;
    premiered: string;
    rating: { average: number | null };
    runtime: number | null;
    genres: string[];
    image: { medium: string; original: string } | null;
  };
}

interface WatchMovieState {
  isOpen: boolean;
  movieData: {
    movieId: string;
    posterPath?: string;
    title?: string;
    rating?: number;
    releaseDate?: string;
    totalDuration?: number;
    genre?: string[];
  } | null;
}

const Stream: React.FC<StreamProps> = ({ 
  platform = 'all',
  contentType = 'movie'
}) => {
  const {
    content,
    loading,
    error,
    hasContent,
    isEmpty,
    fetchNetflixContent,
    fetchAmazonPrimeContent,
    fetchDisneyPlusContent,
    fetchHBOMaxContent,
    fetchAllMajorPlatforms,
    clearContentError,
    clearContentCache
  } = useMainContent();
  // const [isWatchMovieOpen, setIsWatchMovieOpen] = useState(false);
  //   const handleCloseWatchMovie = () => {
  //   setIsWatchMovieOpen(false);
  // };
  const [enhancedContent, setEnhancedContent] = useState<EnhancedContentItem[]>([]);
  const [tvMazeLoading, setTvMazeLoading] = useState(false);
  const [watchMovie, setWatchMovie] = useState<WatchMovieState>({
    isOpen: false,
    movieData: null
  });

  useEffect(() => {
    const fetchByPlatform = async () => {
      const options = { type: contentType, limit: 7 }; 
      
      try {
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
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    };

    fetchByPlatform();
  }, [platform, contentType]);

  useEffect(() => {
    const enhanceWithTVMazeData = async () => {
      if (!content.length || loading) return;
      
      setTvMazeLoading(true);
      const enhanced: EnhancedContentItem[] = [];

      for (const item of content.slice(0, 7)) {
        try {
          // Search TVMaze API for additional data
          const searchQuery = encodeURIComponent(item.title || '');
          const response = await fetch(`https://api.tvmaze.com/search/shows?q=${searchQuery}`);
          
          if (response.ok) {
            const searchResults = await response.json();
            
            // Find the best match
            const bestMatch = searchResults.find((result: any) => 
              result.show.name.toLowerCase().includes(item.title?.toLowerCase() || '') ||
              item.title?.toLowerCase().includes(result.show.name.toLowerCase() || '')
            );

            enhanced.push({
              ...item,
              tvMazeData: bestMatch ? bestMatch.show : null
            });
          } else {
            enhanced.push(item);
          }
        } catch (error) {
          console.error(`Error fetching TVMaze data for ${item.title}:`, error);
          enhanced.push(item);
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setEnhancedContent(enhanced);
      setTvMazeLoading(false);
    };

    enhanceWithTVMazeData();
  }, [content, loading]);

  const handleWatchNow = (item: EnhancedContentItem) => {
    const tvMazeData = item.tvMazeData;
    
    // Prepare data for WatchMovie component
    const movieData = {
      movieId: item.id?.toString() || Math.random().toString(),
      posterPath: tvMazeData?.image?.original  || item.poster ,
      title: tvMazeData?.name || item.title,
      rating: tvMazeData?.rating?.average ? tvMazeData.rating.average * 2 : (item.user_rating ) || 8.0, // Convert to 10-point scale
      releaseDate: tvMazeData?.premiered || item.release_date || item.year?.toString() || '2023-01-01',
      totalDuration: tvMazeData?.runtime ? tvMazeData.runtime * 60 : 7200, // Convert minutes to seconds, default 2 hours
      genre: tvMazeData?.genres || item.genre_names || ['Action', 'Drama']
    };

    setWatchMovie({
      isOpen: true,
      movieData
    });
  };

  const handleCloseWatch = () => {
    setWatchMovie({
      isOpen: false,
      movieData: null
    });
  };

  const displayContent = enhancedContent.length > 0 ? enhancedContent : content.slice(0, 7);

  if (loading && !hasContent) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4"></div>
          <p className="text-white text-xl">Loading {contentType === 'movie' ? 'Movies' : 'TV Shows'}...</p>
          {tvMazeLoading && (
            <p className="text-gray-400 text-sm mt-2">Enhancing with additional data...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Error Loading Content</h2>
            <p className="text-gray-300 mb-6">{error}</p>
          </div>
          <button
            onClick={() => {
              clearContentError();
              clearContentCache();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty || displayContent.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">No {contentType === 'movie' ? 'movies' : 'TV shows'} available</p>
          <button
            onClick={() => {
              const options = { type: contentType, limit: 7 };
              switch (platform) {
                case 'netflix':
                  fetchNetflixContent(options);
                  break;
                case 'prime':
                  fetchAmazonPrimeContent(options);
                  break;
                case 'disney':
                  fetchDisneyPlusContent(options);
                  break;
                case 'hbo':
                  fetchHBOMaxContent(options);
                  break;
                default:
                  fetchAllMajorPlatforms(options);
                  break;
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Load Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-black relative overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={displayContent.length > 1}
          className="h-full w-full"
        >
          {displayContent.length > 0 ? displayContent.map((item: EnhancedContentItem, index: number) => {
            const tvMazeData = item.tvMazeData;
            const displayTitle = tvMazeData?.name || item.title;
            const displaySummary = tvMazeData?.summary?.replace(/<[^>]*>/g, '') || item.plot_overview ;
            const displayRating = tvMazeData?.rating?.average || (item.user_rating );
            const displayYear = tvMazeData?.premiered ? new Date(tvMazeData.premiered).getFullYear() : 
                              (item.year || (item.release_date ? new Date(item.release_date).getFullYear() : null));
            const displayGenres = tvMazeData?.genres || item.genre_names || [];
            const displayImage = tvMazeData?.image?.original  || item.poster ;
            console.log("Imagedata ",displayImage)

            return (
              <SwiperSlide key={item.id || index}>
                <div className="relative h-full w-full bg-gray-800">
                  {displayImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center  bg-no-repeat opacity-30"
                      style={{
                        backgroundImage: `url(${displayImage || item.poster})`,
                      }}
                    />
                  )}
                  
                  
                  <div className="absolute bottom-20 left-8 right-8 z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                      {displayTitle}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-lg">
                        <span className="capitalize">{platform === 'all' ? 'Multi Platform' : platform}</span>
                      </div>
                      
                      {displayRating && (
                        <div className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded-lg font-semibold">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating}
                        </div>
                      )}
{/*                       
                      {displayYear && (
                        <div className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg font-semibold backdrop-blur-sm">
                          {displayYear}
                        </div>
                      )} */}

                      {tvMazeData?.runtime && (
                        <div className="bg-blue-500 bg-opacity-80 text-white px-3 py-2 rounded-lg font-semibold">
                          {tvMazeData.runtime}min
                        </div>
                      )}
                    </div>
                    
                    {displaySummary && (
                      <p className="text-white text-lg md:text-xl max-w-3xl leading-relaxed drop-shadow-lg line-clamp-3 mb-6">
                        {displaySummary}
                      </p>
                    )}
                    
                    {displayGenres && displayGenres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {displayGenres.slice(0, 4).map((genre: string, genreIndex: number) => (
                          <span
                            key={genreIndex}
                            className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm backdrop-blur-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Watch Now Button */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleWatchNow(item)}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-red-500/50 transform hover:scale-105"
                      >
                        {/* <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg> */}
                        Watch Now
                      </button>
                      
                    
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          }) : (
            <SwiperSlide>
              <div className="relative h-full w-full bg-red-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Watch Movie Modal */}
      {watchMovie.isOpen && watchMovie.movieData && (
        <WatchMovie
          isOpen={watchMovie.isOpen}
          onClose={handleCloseWatch}
          movieId={watchMovie.movieData.movieId}
          posterPath={watchMovie.movieData.posterPath}
          title={watchMovie.movieData.title}
          rating={watchMovie.movieData.rating}
          releaseDate={watchMovie.movieData.releaseDate}
          totalDuration={watchMovie.movieData.totalDuration}
          genre={watchMovie.movieData.genre}
        />
      )}
    </>
  );
};

export default Stream;