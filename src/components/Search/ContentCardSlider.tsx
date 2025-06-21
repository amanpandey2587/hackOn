import React, { useRef, useState, useEffect } from 'react';
import ContentCard from './ContentCard';

interface BaseContent {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'documentary';
  poster?: string;
  backdrop?: string;
  rating?: number;
  releaseDate?: string;
  genre?: string[];
  imdbId?: string;
}

interface MovieContent extends BaseContent {
  type: 'movie';
  runtime?: number;
  vote_average?: number;
}

interface TVContent extends BaseContent {
  type: 'tv' | 'documentary';
  year?: number;
  endYear?: number;
  tvmazeId?: number;
  plot?: string;
  runtime?: number;
  userRating?: number;
  criticRating?: number;
  networkNames?: string[];
  seasonCount?: number;
  episodeCount?: number;
  status?: string;
  officialSite?: string;
  schedule?: {
    time: string;
    days: string[];
  };
  isFavorite?: boolean;
  userPersonalRating?: number;
  watchProgress?: number;
  isCompleted?: boolean;
}

type ContentItem = MovieContent | TVContent;

interface SearchResult {
  title: string;
  type: string;
  year?: number;
  imdb_id?: string;
  confidence?: number;
  language_detected?: string;
}

interface SearchResults {
  results: SearchResult[];
  original_query?: string;
  corrected_query?: string;
  total_results?: number;
  query_type?: string;
  language_detected?: string;
}

interface ContentSliderProps {
  title: string;
  content?: ContentItem[] | null;
  searchResults?: SearchResult[] | SearchResults | null;
  isLoading?: boolean;
  onContentClick?: (content: ContentItem) => void;
  className?: string;
  showSearchInfo?: boolean;
}

const ContentSlider: React.FC<ContentSliderProps> = ({ 
  title, 
  content,
  searchResults,
  isLoading = false,
  onContentClick,
  className = "",
  showSearchInfo = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [processedContent, setProcessedContent] = useState<ContentItem[]>([]);

  const convertSearchResultsToContent = (results: SearchResult[] | SearchResults): ContentItem[] => {
    const searchArray = Array.isArray(results) ? results : results.results || [];
    
    return searchArray.map((result, index) => ({
      id: result.imdb_id || `search-${index}`,
      title: result.title,
      type: result.type === 'tv' ? 'tv' : result.type === 'documentary' ? 'documentary' : 'movie',
      imdbId: result.imdb_id,
      year: result.year,
      releaseDate: result.year ? `${result.year}-01-01` : undefined,
      rating: result.confidence ? result.confidence * 10 : undefined,
      poster: undefined,
      backdrop: undefined,
      genre: []
    })) as ContentItem[];
  };

  useEffect(() => {
    if (searchResults) {
      const converted = convertSearchResultsToContent(searchResults);
      setProcessedContent(converted);
    } else if (content) {
      setProcessedContent(content);
    } else {
      setProcessedContent([]);
    }
  }, [content, searchResults]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const LoadingSkeleton = () => (
    <div className="flex space-x-4">
      {[...Array(6)].map((_, index) => (
        <div 
          key={index} 
          className="min-w-[200px] h-[340px] bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  if (!isLoading && processedContent.length === 0) {
    return (
      <div className={`px-4 md:px-8 mb-8 ${className}`}>
        <h2 className="text-gray-900 dark:text-white text-xl md:text-2xl font-bold mb-4">
          {title}
        </h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          No content available in this category
        </div>
      </div>
    );
  }

  const searchInfo = searchResults && !Array.isArray(searchResults) ? searchResults : null;

  return (
    <div className={`px-4 md:px-8 mb-12 group ${className}`}>
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && !isLoading && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && !isLoading && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Content Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide gap-4 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {!isLoading &&
            <div className="flex gap-4">
              {processedContent.map((item) => (
                <ContentCard 
                  key={item.id} 
                  content={item}
                  onClick={onContentClick}
                />
              ))}
            </div>
          }
        </div>
      </div>

    
    </div>
  );
};

export default ContentSlider;