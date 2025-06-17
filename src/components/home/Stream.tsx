import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useMainContent } from '../../hooks/useMainContent';
import type { DetailedContentItem } from '../../types/streaming';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface StreamProps {
  platform?: 'netflix' | 'prime' | 'disney' | 'hbo' | 'all';
  contentType?: 'movie' | 'tv_series';
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

  console.log('Content from hook:', content);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('HasContent:', hasContent);
  console.log('IsEmpty:', isEmpty);

  const displayContent = content.slice(0, 7);
  console.log('Display content:', displayContent);

  if (loading && !hasContent) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4"></div>
          <p className="text-white text-xl">Loading {contentType === 'movie' ? 'Movies' : 'TV Shows'}...</p>
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
          <p className="text-gray-400 mb-4">Content length: {content.length}</p>
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
        onSwiper={(swiper) => console.log('Swiper initialized:', swiper)}
        onSlideChange={() => console.log('Slide changed')}
      >
        {displayContent.length > 0 ? displayContent.map((item: any, index: number) => {
          console.log(`Rendering slide ${index}:`, item);
          return (
            <SwiperSlide key={item.id || index}>
              <div className="relative h-full w-full bg-gray-800">
               

                {(item.posterLarge || item.poster) && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 "
                    style={{
                      backgroundImage: `url(${item.posterLarge || item.poster || item.image})`,
                    }}
                  >
                  </div>
                )}
                
                <div className="absolute bottom-20 left-8 right-8 z-10">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                    {item.title }
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-lg">
                      <span className="capitalize">{platform === 'all' ? 'Multi Platform' : platform}</span>
                    </div>
                    
                    {(item.user_rating || item.vote_average) && (
                      <div className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded-lg font-semibold">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {(item.user_rating || item.vote_average)?.toFixed?.(1) || (item.user_rating || item.vote_average)}
                      </div>
                    )}
                    
                    {(item.release_date || item.year) && (
                      <div className="bg-white bg-opacity-20 text-black px-3 py-2 rounded-lg font-semibold backdrop-blur-sm">
                        {item.year || new Date(item.release_date).getFullYear()}
                      </div>
                    )}
                  </div>
                  
                  {(item.plot_overview || item.overview) && (
                    <p className="text-white text-lg md:text-xl max-w-3xl leading-relaxed drop-shadow-lg line-clamp-3">
                      {item.plot_overview || item.overview}
                    </p>
                  )}
                  
                  {item.genre_names && item.genre_names.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {item.genre_names.slice(0, 4).map((genre, index) => (
                        <span
                          key={index}
                          className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm backdrop-blur-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        }) : (
          <SwiperSlide>
            <div className="relative h-full w-full bg-red-500 flex items-center justify-center">
              <div className="text-white text-center">
                <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
                <p>displayContent.length: {displayContent.length}</p>
                <p>content.length: {content.length}</p>
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>

    </div>
  );
};

export default Stream;