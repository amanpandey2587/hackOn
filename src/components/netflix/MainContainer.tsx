import { useState, useCallback } from "react";
import WatchMovie from "../WatchMovies"; // Adjust the import path as needed

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

interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime: number;
  premiered: string;
  officialSite: string;
  schedule: {
    time: string;
    days: string[];
  };
  rating: {
    average: number;
  };
  network: {
    id: number;
    name: string;
    country: {
      name: string;
      code: string;
      timezone: string;
    };
  };
  image: {
    medium: string;
    original: string;
  };
  summary: string;
}

interface MainContainerProps {
  movies: Movie[];
  movieDetails: { [key: string]: WatchmodeMovieDetails };
  fetchMovieDetails: (movieId: string) => Promise<WatchmodeMovieDetails | null>;
}

const MainContainer = ({
  movies,
  movieDetails,
  fetchMovieDetails,
}: MainContainerProps) => {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState<number>(0);
  const [isWatchMovieOpen, setIsWatchMovieOpen] = useState(false);

  const [tvMazeDetails, setTvMazeDetails] = useState<{
    [key: string]: TVMazeShow;
  }>({});
  const [loadingTvMaze, setLoadingTvMaze] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch additional details from TVMaze API
  const fetchTVMazeDetails = useCallback(
    async (
      movieTitle: string,
      movieYear?: number
    ): Promise<TVMazeShow | null> => {
      const cacheKey = `${movieTitle}-${movieYear}`;

      // Return cached data if available
      if (tvMazeDetails[cacheKey]) {
        return tvMazeDetails[cacheKey];
      }

      // Check if already loading
      if (loadingTvMaze[cacheKey]) {
        return null;
      }

      setLoadingTvMaze((prev) => ({ ...prev, [cacheKey]: true }));

      try {
        // First try to search by name
        const searchResponse = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
            movieTitle
          )}`
        );

        if (!searchResponse.ok) {
          throw new Error(`TVMaze API error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (searchData && searchData.length > 0) {
          // Find the best match (exact title match or closest year)
          let bestMatch = searchData[0].show;

          if (movieYear) {
            for (const result of searchData) {
              const show = result.show;
              if (show.premiered) {
                const showYear = new Date(show.premiered).getFullYear();
                const currentBestYear = bestMatch.premiered
                  ? new Date(bestMatch.premiered).getFullYear()
                  : 0;

                // Prefer exact year match
                if (showYear === movieYear) {
                  bestMatch = show;
                  break;
                }
                // Or closer year match
                if (
                  Math.abs(showYear - movieYear) <
                  Math.abs(currentBestYear - movieYear)
                ) {
                  bestMatch = show;
                }
              }
            }
          }

          setTvMazeDetails((prev) => ({ ...prev, [cacheKey]: bestMatch }));
          return bestMatch;
        }
      } catch (error) {
        console.error(
          "Error fetching TVMaze details for",
          movieTitle,
          ":",
          error
        );
      } finally {
        setLoadingTvMaze((prev) => ({ ...prev, [cacheKey]: false }));
      }

      return null;
    },
    [tvMazeDetails, loadingTvMaze]
  );

  const handleMovieSelection = (index: number) => {
    if (!movies || !movies[index]) return;
    setSelectedMovieIndex(index);

    const selectedMovie = movies[index];
    if (selectedMovie && !movieDetails[selectedMovie.id]) {
      fetchMovieDetails(selectedMovie.id);
    }

    // Fetch TVMaze details
    if (
      selectedMovie &&
      !tvMazeDetails[`${selectedMovie.title}-${selectedMovie.year}`]
    ) {
      fetchTVMazeDetails(selectedMovie.title, selectedMovie.year);
    }
  };

  const handleWatchMovie = () => {
    setIsWatchMovieOpen(true);
  };

  const handleCloseWatchMovie = () => {
    setIsWatchMovieOpen(false);
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
  const tvMazeData =
    tvMazeDetails[`${selectedMovie.title}-${selectedMovie.year}`];

  // Merge data from different sources for the WatchMovie component
  const getGenres = (): string[] => {
    if (additionalDetails?.genre_names) return additionalDetails.genre_names;
    if (tvMazeData?.genres) return tvMazeData.genres;
    return [];
  };

  const getRating = (): number => {
    if (selectedMovie.vote_average) return selectedMovie.vote_average;
    if (tvMazeData?.rating?.average) return tvMazeData.rating.average;
    return 0;
  };

  const getTotalDuration = (): number => {
    if (additionalDetails?.runtime_minutes)
      return additionalDetails.runtime_minutes;
    if (tvMazeData?.runtime) return tvMazeData.runtime;
    return 120; // Default 2 hours
  };

  const getReleaseDate = (): string => {
    if (selectedMovie.release_date) return selectedMovie.release_date;
    if (tvMazeData?.premiered) return tvMazeData.premiered;
    if (selectedMovie.year) return `${selectedMovie.year}-01-01`;
    return new Date().toISOString().split("T")[0];
  };

  const getOverview = (): string => {
    if (selectedMovie.overview) return selectedMovie.overview;
    if (additionalDetails?.plot_overview)
      return additionalDetails.plot_overview;
    if (tvMazeData?.summary) {
      // Remove HTML tags from TVMaze summary
      return tvMazeData.summary.replace(/<[^>]*>/g, "");
    }
    return "No overview available";
  };
  // Add console logs HERE - right before the return statement

  console.log("MainContainer - isWatchMovieOpen:", isWatchMovieOpen);

  console.log(
    "MainContainer - handleCloseWatchMovie exists?",
    typeof handleCloseWatchMovie
  );

  console.log(
    "MainContainer - handleCloseWatchMovie function:",
    handleCloseWatchMovie
  );

  console.log("MainContainer - selectedMovie:", selectedMovie);

  return (
    <>
      <div className="relative min-h-screen bg-black">
        <div className="relative h-screen">
          <div className="absolute inset-0">
            {selectedMovie.poster_path ? (
              <div className="relative w-full h-full">
                <img
                  src={selectedMovie.poster_path}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
            ) : tvMazeData?.image?.original ? (
              <div className="relative w-full h-full">
                <img
                  src={tvMazeData.image.original}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900"></div>
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
                ) : tvMazeData?.image?.original ? (
                  <img
                    src={tvMazeData.image.original}
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
                    <span className="text-green-400 font-medium">
                      {selectedMovie.year}
                    </span>
                  )}
                  {getRating() > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {getRating()}/10
                    </span>
                  )}
                  {additionalDetails?.us_rating && (
                    <span className="border border-gray-400 px-2 py-1 text-xs">
                      {additionalDetails.us_rating}
                    </span>
                  )}
                  {getTotalDuration() && (
                    <span>
                      {Math.floor(getTotalDuration() / 60)}h{" "}
                      {getTotalDuration() % 60}m
                    </span>
                  )}
                  {tvMazeData?.network?.name && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {tvMazeData.network.name}
                    </span>
                  )}
                </div>

                {getGenres().length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getGenres()
                      .slice(0, 4)
                      .map((genre, index) => (
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
                  {getOverview()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleWatchMovie}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Watch Now</span>
                  </button>

                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>Add to List</span>
                  </button>
                </div>

                {/* Additional TVMaze Info */}
                {tvMazeData && (
                  <div className="text-sm text-gray-300 space-y-1">
                    {tvMazeData.status && (
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        {tvMazeData.status}
                      </p>
                    )}
                    {tvMazeData.network?.country?.name && (
                      <p>
                        <span className="font-semibold">Country:</span>{" "}
                        {tvMazeData.network.country.name}
                      </p>
                    )}
                    {tvMazeData.language && (
                      <p>
                        <span className="font-semibold">Language:</span>{" "}
                        {tvMazeData.language}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 transform -translate-y-1/2 left-4 z-50">
            <button
              onClick={() =>
                handleMovieSelection(
                  selectedMovieIndex === 0
                    ? movies.length - 1
                    : selectedMovieIndex - 1
                )
              }
              className="bg-black bg-opacity-50 cursor-pointer hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
              disabled={movies.length <= 1}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <div className="absolute top-1/2 transform -translate-y-1/2 right-4 z-50">
            <button
              onClick={() =>
                handleMovieSelection(
                  selectedMovieIndex === movies.length - 1
                    ? 0
                    : selectedMovieIndex + 1
                )
              }
              className="bg-black bg-opacity-50 cursor-pointer hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
              disabled={movies.length <= 1}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Movie Browse Section */}
        <div className="relative z-10 -mt-28 px-4 md:px-12">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-4">
              Browse Movies
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 mt-4">
              {movies.map((movie, index) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieSelection(index)}
                  className={`flex-shrink-0 cursor-pointer transition-all mt-10 duration-200 transform hover:scale-105 ${
                    index === selectedMovieIndex ? "ring-2 ring-red-500" : ""
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
      {/* Add this console log to verify the function exists */}

      {(() => {
        console.log("=== MainContainer Debug ===");

        console.log("handleCloseWatchMovie exists?", !!handleCloseWatchMovie);

        console.log(
          "handleCloseWatchMovie type:",
          typeof handleCloseWatchMovie
        );

        console.log("handleCloseWatchMovie value:", handleCloseWatchMovie);

        return null;
      })()}
      {/* WatchMovie Component Integration */}
      <WatchMovie
        isOpen={isWatchMovieOpen}
        onClose={handleCloseWatchMovie}
        movieId={selectedMovie.id}
        posterPath={selectedMovie.poster_path}
        title={selectedMovie.title}
        rating={getRating()}
        releaseDate={getReleaseDate()}
        totalDuration={getTotalDuration()}
        genre={getGenres()}
      />
    </>
  );
};

export default MainContainer;
