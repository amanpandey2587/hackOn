import React, { useRef, useState } from 'react';
import MovieCard from './MovieCard';

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

interface MovieListProps {
  title: string;
  movies: Movie[] | null;
  searchMovie?: boolean;
  isLoading?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({ 
  title, 
  movies, 
  searchMovie = false, 
  isLoading = false 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex space-x-4">
      {[...Array(6)].map((_, index) => (
        <div 
          key={index} 
          className="min-w-[200px] h-[300px] bg-gray-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  if (!isLoading && (!movies || movies.length === 0)) {
    return (
      <div className="px-4 md:px-8 mb-8">
        <h2 className={`${searchMovie ? "text-black" : "text-white"} text-xl md:text-2xl font-bold mb-4`}>
          {title}
        </h2>
        <div className="text-gray-400 text-center py-8">
          No movies available in this category
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 mb-8 group">
      <h2 className={`${searchMovie ? "text-black" : "text-white"} text-xl md:text-2xl font-bold mb-4 transition-colors duration-200`}>
        {title}
      </h2>

      <div className="relative">
        {showLeftArrow && !isLoading && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {showRightArrow && !isLoading && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="flex gap-2 md:gap-4">
              {movies?.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movieId={movie.id} 
                  posterPath={movie.poster_path}
                  title={movie.title}
                  rating={movie.vote_average}
                  releaseDate={movie.release_date}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MovieList;