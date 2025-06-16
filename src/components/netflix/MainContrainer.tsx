import { useState } from 'react';
import VideoBackground from './VideoBackground';
import VideoTitle from './VideoTitle';

interface Movie {
  id: string;
  imdb_id?: string;
  title: string;
  tmdb_id?: number;
  tmdb_type?: string;
  type: string;
  year?: number;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

interface WatchmodeMovieDetails {
  id: number;
  title: string;
  original_title?: string;
  plot_overview: string;
  type: string;
  runtime_minutes?: number;
  year: number;
  end_year?: number;
  release_date?: string;
  imdb_id: string;
  tmdb_id: number;
  tmdb_type: string;
  genre_names: string[];
  user_rating?: number;
  critic_score?: number;
  us_rating?: string;
  poster?: string;
  backdrop?: string;
  original_language?: string;
  similar_titles?: number[];
  networks?: any[];
}

interface MainContainerProps {
  movies: Movie[];
  movieDetails: {[key: string]: WatchmodeMovieDetails};
  fetchMovieDetails: (movieId: string) => Promise<WatchmodeMovieDetails | null>;
}

const MainContainer = ({ movies, movieDetails, fetchMovieDetails }: MainContainerProps) => {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState<number>(0);

  const handleMovieSelection = (index: number) => {
    if (!movies || !movies[index]) return;
    setSelectedMovieIndex(index);
    
    const selectedMovie = movies[index];
    if (selectedMovie && !movieDetails[selectedMovie.id]) {
      fetchMovieDetails(selectedMovie.id);
    }
  };

  if (!movies || movies.length === 0) {
    console.log("No movies provided as props");
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">No movies available</div>
      </div>
    );
  }

  const selectedMovie = movies[selectedMovieIndex];

  if (!selectedMovie) {
    console.log("No selected movie available");
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">No movie available</div>
      </div>
    );
  }

  const additionalDetails = movieDetails[selectedMovie.id];

  return (
    <div className="relative min-h-screen bg-black">
      <div className="relative h-screen">
        <div className="absolute inset-0">
          {selectedMovie.backdrop_path ? (
            <div className="relative w-full h-full">
              <img
                src={selectedMovie.backdrop_path}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-900">
              {/* <VideoBackground movieId={selectedMovie.id} bool={false} /> */}
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-12 flex items-center">
            <div className="hidden md:block flex-shrink-0 mr-8">
              {selectedMovie.poster_path ? (
                <img
                  src={selectedMovie.poster_path}
                  alt={selectedMovie.title}
                  className="w-80 h-auto rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-80 h-96 bg-gray-800 rounded-lg flex items-center justify-center shadow-2xl">
                  <span className="text-white text-center p-4">
                    {selectedMovie.title}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {selectedMovie.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4 text-sm md:text-base">
                {selectedMovie.year && (
                  <span className="text-green-400 font-medium">{selectedMovie.year}</span>
                )}
                {selectedMovie.vote_average && selectedMovie.vote_average > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    {selectedMovie.vote_average}/10
                  </span>
                )}
                {additionalDetails?.us_rating && (
                  <span className="border border-gray-400 px-2 py-1 text-xs">
                    {additionalDetails.us_rating}
                  </span>
                )}
                {additionalDetails?.runtime_minutes && (
                  <span>{Math.floor(additionalDetails.runtime_minutes / 60)}h {additionalDetails.runtime_minutes % 60}m</span>
                )}
              </div>

              {additionalDetails?.genre_names && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {additionalDetails.genre_names.slice(0, 4).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-red-600 text-white text-xs px-3 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
                {selectedMovie.overview || 'No overview available'}
              </p>

              {/* <VideoTitle 
                title={selectedMovie.title} 
                overview={selectedMovie.overview || 'No overview available'} 
              /> */}
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 transform -translate-y-1/2 left-4 z-50">
          <button
            onClick={() => handleMovieSelection(selectedMovieIndex === 0 ? movies.length - 1 : selectedMovieIndex - 1)}
            className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
            disabled={movies.length <= 1}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute top-1/2 transform -translate-y-1/2 right-4 z-50">
          <button
            onClick={() => handleMovieSelection(selectedMovieIndex === movies.length - 1 ? 0 : selectedMovieIndex + 1)}
            className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
            disabled={movies.length <= 1}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10 -mt-28 px-4 md:px-12">
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-4">Browse Movies</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 mt-4">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => handleMovieSelection(index)}
                className={`flex-shrink-0 cursor-pointer transition-all mt-10 duration-200 transform hover:scale-105 ${
                  index === selectedMovieIndex ? 'ring-2 ring-red-500' : ''
                }`}
              >
                {movie.poster_path ? (
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs text-center p-2">
                      {movie.title}
                    </span>
                  </div>
                )}
                <p className="text-white text-sm mt-2 w-32 truncate">
                  {movie.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;