import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getId, setOpen } from "../../redux/movieSlice";
import WatchMovies from "../WatchMovies"; // Adjust path as needed

interface MovieCardProps {
  posterPath?: string;
  movieId: string;
  title?: string;
  rating?: number;
  releaseDate?: string;
  genre:string[] | undefined;
  totalDuration?:number;
}

const MovieCard: React.FC<MovieCardProps> = ({
  posterPath,
  movieId,
  title,
  rating,
  releaseDate,
  genre,totalDuration,
}) => {
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWatchMovieOpen, setIsWatchMovieOpen] = useState(false);
    const handleCloseWatchMovie = () => {
    setIsWatchMovieOpen(false);
  };
  // Fix: Use the correct property names from your Redux state
  const { open, id } = useSelector((state: any) => state.movie);
  
  // console.log("Data is ", posterPath, movieId, title, rating, releaseDate);
  
  const handleOpen = () => {
    console.log("Movie clicked");
    dispatch(getId(movieId));
    console.log("id set")
    dispatch(setOpen(true));
    console.log("Modal opened")
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatRating = (rating?: number) => {
    if (!rating) return null;
    return (rating / 2).toFixed(1); 
  };

  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="group cursor-pointer min-w-[180px] md:min-w-[200px] transform transition-all duration-300 hover:scale-110 hover:z-10 relative"
      >
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          {posterPath && !imageLoaded && !imageError && (
            <div className="w-full h-[270px] md:h-[300px] bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {(!posterPath || imageError) && (
            <div className="w-full h-[270px] md:h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-gray-700">
              <svg className="w-16 h-16 mb-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-white mb-1">
                  {title || 'Unknown Movie'}
                </p>
                <p className="text-xs text-gray-500">No image available</p>
              </div>
            </div>
          )}

          {posterPath && !imageError && (
            <img
              src={posterPath}
              alt={title || 'Movie poster'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-[270px] md:h-[300px] object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {rating && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
              ⭐ {formatRating(rating)}
            </div>
          )}
        </div>

        {(!posterPath || imageError) && (
          <div className="mt-2">
            {title && (
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {title}
              </h3>
            )}
            <div className="flex items-center justify-between text-xs text-gray-300">
              {releaseDate && (
                <span>{formatYear(releaseDate)}</span>
              )}
              {rating && (
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{formatRating(rating)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {posterPath && !imageError && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-all duration-300 rounded-b-lg">
            {title && (
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {title}
              </h3>
            )}
            <div className="flex items-center justify-between text-xs text-gray-300">
              {releaseDate && (
                <span>{formatYear(releaseDate)}</span>
              )}
              {rating && (
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{formatRating(rating)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black opacity-0 group-hover:opacity-30 blur-md transition-all duration-300 rounded-lg"></div>
      </div>

      {/* WatchMovie Modal - Fix: Use correct property names */}
      {open && id === movieId && (
        <WatchMovies
          isOpen={open}
          onClose={handleCloseWatchMovie}
          movieId={movieId}
          posterPath={posterPath}
          title={title}
          rating={rating}
          releaseDate={releaseDate}
          totalDuration={totalDuration}
          genre={genre}
        />
      )}
    </>
  );
};

export default MovieCard;