import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useMovieById from '../../hooks/useMovieByIdNetflix';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from 'react-icons/fa';

interface VideoBackgroundProps {
  movieId: string;
  bool?: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ movieId, bool = true }) => {
  const trailerMovie = useSelector((store: any) => store.movie.trailerMovie);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useMovieById(movieId);

  useEffect(() => {
    let timeout=3000;
    if (showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!trailerMovie?.key) {
    return (
      <div className={`${bool ? "w-full aspect-video" : "w-screen h-screen"} bg-gray-900 flex items-center justify-center`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading trailer...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${bool ? "w-full aspect-video" : "w-screen h-screen"} bg-black overflow-hidden group`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      <iframe
        ref={videoRef}
        className="w-full h-full object-cover"
        src={`https://www.youtube.com/embed/${trailerMovie.key}?si=HorxQfzFY2_TAO1W&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${trailerMovie.key}`}
        title="Movie Trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-lg font-semibold opacity-90">Now Playing</h3>
          </div>
          <div className="text-white">
            <span className="bg-red-600 px-2 py-1 rounded text-xs font-bold">LIVE</span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            {isPlaying ? (
              <FaPause size="24px" />
            ) : (
              <FaPlay size="24px" className="ml-1" />
            )}
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="w-full bg-gray-600 bg-opacity-50 rounded-full h-1 mb-4">
            <div className="bg-red-600 h-1 rounded-full w-1/3 transition-all duration-300"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors duration-200"
              >
                {isPlaying ? <FaPause size="16px" /> : <FaPlay size="16px" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors duration-200"
              >
                {isMuted ? <FaVolumeMute size="16px" /> : <FaVolumeUp size="16px" />}
              </button>

              <div className="hidden md:flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : 50}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  onChange={() => {}} 
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white text-sm opacity-75">
                2:34 / 3:21
              </span>
              
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors duration-200"
              >
                <FaExpand size="16px" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 transition-opacity duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
  );
};

export default VideoBackground;