
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setOpen } from '../redux/movieSlice';
import { setLoading } from '../redux/userSlice';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import StreamingPlatform from './StreamingPlatform';
interface TrailerData {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface CachedTrailerData extends TrailerData {
  timestamp: number;
  expiresAt: number;
}

interface WatchMovieProps {
  isOpen: boolean;
  movieId: string;
  posterPath?: string;
  title?: string;
  rating?: number;
  releaseDate?: string;
  totalDuration?:number;
  genre?:string[]
}

// Use in-memory cache instead of localStorage
const trailerCache = new Map<string, CachedTrailerData>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100;

const WatchMovie: React.FC<WatchMovieProps> = ({
  isOpen,
  movieId,
  posterPath,
  title,
  rating,
  releaseDate,
  genre,totalDuration
}) => {
  const dispatch = useDispatch();
  const [trailerData, setTrailerData] = useState<{ [key: string]: TrailerData }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [watchHistoryId, setWatchHistoryId] = useState<string | null>(null);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const WATCH_UPDATE_INTERVAL = 15;
  const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

  const addToCache = useCallback((key: string, data: TrailerData) => {
    while (trailerCache.size >= MAX_CACHE_SIZE) {
      const firstKey = trailerCache.keys().next().value || "string";
      trailerCache.delete(firstKey);
    }

    const now = Date.now();
    const cachedData: CachedTrailerData = {
      ...data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };

    trailerCache.set(key, cachedData);
  }, []);

  const getCachedData = useCallback((key: string): TrailerData | null => {
    const cached = trailerCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (cached.expiresAt <= now) {
      trailerCache.delete(key);
      return null;
    }

    return {
      videoId: cached.videoId,
      title: cached.title,
      thumbnail: cached.thumbnail
    };
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
      };
    }
  }, []);

  const initializePlayer = useCallback((videoId: string) => {
    if (!window.YT || !window.YT.Player || !playerRef.current) return;

    if (player) {
      player.destroy();
    }

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          console.log('Player ready');
          setIsPlayerReady(true);
          setPlayer(event.target);
          event.target.setVolume(volume * 100);
          if (isMuted) {
            event.target.mute();
          }
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            hideControlsAfterDelay();
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            setShowControls(true);
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = null;
            }
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            setShowControls(true);
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data);
        }
      }
    });
  }, [player, volume, isMuted]);

  const fetchTrailer = useCallback(async (title: string, releaseDate: string): Promise<TrailerData | null> => {
    const cacheKey = `${title}-${releaseDate}`;
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Using cached trailer data for:', title);
      return cachedData;
    }

    const year = new Date(releaseDate).getFullYear();
    
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      const mockTrailers = [
        { videoId: 'EXeTwQWrcwY', title: 'The Dark Knight - Official Trailer' },
        { videoId: 'TcMBFSGVi1c', title: 'Avengers: Endgame - Official Trailer' },
        { videoId: 'sGbxmsDFVnE', title: 'Inception - Official Trailer' },
        { videoId: 'QdBZY2fkU-0', title: 'Joker - Official Trailer' },
        { videoId: 'hA6hldpSTF8', title: 'Interstellar - Official Trailer' }
      ];
      
      const randomTrailer = mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
      const mockData = {
        videoId: randomTrailer.videoId,
        title: `${title} - Official Trailer`,
        thumbnail: `https://img.youtube.com/vi/${randomTrailer.videoId}/maxresdefault.jpg`
      };
      
      addToCache(cacheKey, mockData);
      console.log('Using mock trailer data for:', title);
      return mockData;
    }

    try {
      console.log('Fetching trailer from YouTube API for:', title);
      const searchQuery = `${title} ${year} official trailer`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const trailerData = {
          videoId: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url
        };
        
        addToCache(cacheKey, trailerData);
        console.log('Successfully fetched and cached trailer for:', title);
        return trailerData;
      } else {
        console.log('No trailer found for:', title);
      }
    } catch (error) {
      console.error('Error fetching trailer for', title, ':', error);
      
      const mockTrailers = [
        { videoId: 'EXeTwQWrcwY', title: 'The Dark Knight - Official Trailer' },
        { videoId: 'TcMBFSGVi1c', title: 'Avengers: Endgame - Official Trailer' },
        { videoId: 'sGbxmsDFVnE', title: 'Inception - Official Trailer' }
      ];
      
      const randomTrailer = mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
      const fallbackData = {
        videoId: randomTrailer.videoId,
        title: `${title} - Official Trailer`,
        thumbnail: `https://img.youtube.com/vi/${randomTrailer.videoId}/maxresdefault.jpg`
      };
      
      addToCache(cacheKey, fallbackData);
      console.log('Using fallback trailer data for:', title);
      return fallbackData;
    }
    return null;
  }, [YOUTUBE_API_KEY, getCachedData, addToCache]);

  const loadContentData = useCallback(async (title: string, releaseDate: string) => {
    const cacheKey = `${title}-${releaseDate}`;
    
    if (trailerData[movieId]) {
      if (window.YT && window.YT.Player && !isPlayerReady) {
        initializePlayer(trailerData[movieId].videoId);
      }
      return;
    }
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setTrailerData(prev => ({
        ...prev,
        [movieId]: cachedData
      }));
      setTimeout(() => {
        if (window.YT && window.YT.Player) {
          initializePlayer(cachedData.videoId);
        }
      }, 100);
      return;
    }
    
    setIsLoadingTrailer(true);
    dispatch(setLoading(true));
    
    try {
      const trailer = await fetchTrailer(title, releaseDate);
      if (trailer) {
        setTrailerData(prev => ({
          ...prev,
          [movieId]: trailer
        }));
        setTimeout(() => {
          if (window.YT && window.YT.Player) {
            initializePlayer(trailer.videoId);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error loading content data", error);
    } finally {
      setIsLoadingTrailer(false);
      dispatch(setLoading(false));
    }
  }, [movieId, trailerData, fetchTrailer, dispatch, initializePlayer, isPlayerReady, getCachedData]);

  const handleClose = useCallback(async () => {
    if (player && isPlayerReady && watchHistoryId) {
      const finalTime = player.getCurrentTime();

      try {
        await axios.patch(`/api/watch-history/${watchHistoryId}`, {
          watchDuration: finalTime
        });
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    }

    if (player) {
      player.pauseVideo();
    }
    setShowMoreInfo(false);
    setIsPlaying(false);
    setIsPlayerReady(false);
    dispatch(setOpen(false));
  }, [dispatch, player, isPlayerReady, watchHistoryId]);
  const { getToken } = useAuth(); // Make sure you have this hook
  const handleResume = useCallback(() => {
    if (player && isPlayerReady && currentPlayTime > 0) {
      player.seekTo(currentPlayTime, true);
      player.playVideo();
    }
  }, [player, isPlayerReady, currentPlayTime]);

  const handlePlay = useCallback(async () => {
    if (player && isPlayerReady) {
      player.playVideo();
      if (!watchHistoryId) {
        try {
          // Get the auth token from Clerk
          
  const token = await getToken();
          
          const response = await axios.post('http://localhost:4000/api/watch-history/createWatchHistory', {
            contentId: movieId,
            title,
            releaseYear: new Date(releaseDate || '').getFullYear(),
            rating,
            totalDuration: totalDuration,
            watchDuration: currentPlayTime,
            contentType: 'movie',
            genre:genre,
            streamingPlatform:"netflix",
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          setWatchHistoryId(response.data.data._id);
        } catch (err) {
          console.error('Error creating watch history:', err);
          console.error('Full error:', err); // More detailed error info
        }
      }
    }
  }, [player, isPlayerReady, movieId, title, releaseDate, rating, currentPlayTime, watchHistoryId]);
  useEffect(() => {
    let interval: number | null = null;

    if (isPlaying && player && isPlayerReady && watchHistoryId) {
      interval = window.setInterval(async () => {
        const newTime = player.getCurrentTime();
        setCurrentPlayTime(newTime);

        try {
          await axios.patch(`/api/watch-history/${watchHistoryId}`, {
            watchDuration: newTime
          });
        } catch (error) {
          console.error('Error updating watch history:', error);
        }
      }, WATCH_UPDATE_INTERVAL * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, player, isPlayerReady, watchHistoryId]);

  const handlePause = useCallback(() => {
    if (player && isPlayerReady) {
      player.pauseVideo();
    }
  }, [player, isPlayerReady]);

  const toggleMute = useCallback(() => {
    if (player && isPlayerReady) {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume * 100);
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [player, isPlayerReady, isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (player && isPlayerReady) {
      player.setVolume(newVolume * 100);
      if (newVolume === 0) {
        player.mute();
        setIsMuted(true);
      } else {
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
        }
      }
    }
  }, [player, isPlayerReady, isMuted]);

  const handleRestart = useCallback(() => {
    if (player && isPlayerReady) {
      player.seekTo(0);
      player.playVideo();
    }
  }, [player, isPlayerReady]);

  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (isPlaying) {
      hideControlsAfterDelay();
    }
  }, [isPlaying, hideControlsAfterDelay]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (modalRef.current && !modalRef.current.contains(target) && 
        target.classList.contains('modal-backdrop')) {
      handleClose();
    }
  }, [handleClose]);

  const formatRating = useCallback((rating?: number) => {
    if (!rating) return null;
    return (rating / 2).toFixed(1);
  }, []);

  const formatYear = useCallback((dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  }, []);

  const generateMockDescription = useCallback((title?: string) => {
    const descriptions = [
      "A gripping tale of heroism and sacrifice that will keep you on the edge of your seat from start to finish.",
      "An epic adventure that combines stunning visuals with an unforgettable story and characters you'll never forget.",
      "A masterpiece of cinema that explores the depths of human nature through compelling storytelling and brilliant performances.",
      "An action-packed thriller that delivers non-stop excitement with plot twists that will leave you breathless.",
      "A powerful drama that touches the heart while delivering spectacular entertainment for the whole family."
    ];
    const hash = title ? title.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    return descriptions[hash % descriptions.length];
  }, []);

  useEffect(() => {
    const loadWatchHistory = async () => {
      try {
        const response = await axios.get(`/api/watch-history/getWatchHistoryById/${movieId}`);
        if (response.data.data && response.data.data.length > 0) {
          const history = response.data.data[0];
          setWatchHistoryId(history._id);
          setCurrentPlayTime(history.watchDuration || 0);
        }
      } catch (err) {
        console.error('Error loading watch history:', err);
      }
    };

    if (isOpen && movieId) {
      loadWatchHistory();
    }
  }, [isOpen, movieId]);

  useEffect(() => {
    if (isOpen && title && releaseDate && !trailerData[movieId]) {
      loadContentData(title, releaseDate);
    }
  }, [isOpen, title, releaseDate, movieId, trailerData, loadContentData]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClickOutside]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowControls(true);
      setShowMoreInfo(false);
      setIsPlaying(false);
    } else {
      setIsPlayerReady(false);
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTrailer = trailerData[movieId];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 modal-backdrop backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-7xl bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 transform transition-all duration-300 hover:shadow-3xl"
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-6 right-6 z-50 bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-90 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player Section */}
        <div className="relative aspect-video bg-black">
          {currentTrailer ? (
            <div className="relative w-full h-full">
              <div 
                ref={playerRef}
                className="w-full h-full"
                id={`youtube-player-${movieId}`}
              />
              
              {/* Video Controls Overlay */}
              <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!isPlayerReady}
                    className={`bg-red-600 bg-opacity-30 hover:bg-opacity-50 text-white rounded-full w-20 h-20 flex items-center justify-center transition-all duration-300 backdrop-blur-lg pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 ${
                      isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pointer-events-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={toggleMute}
                          disabled={!isPlayerReady}
                          className="text-white hover:text-red-400 transition-all duration-200 disabled:opacity-50 transform hover:scale-110"
                        >
                          {isMuted || volume === 0 ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          disabled={!isPlayerReady}
                          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 hover:bg-gray-500 transition-colors"
                          style={{
                            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                          }}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleRestart}
                      disabled={!isPlayerReady}
                      className="text-white hover:text-red-400 transition-all duration-200 disabled:opacity-50 transform hover:scale-110"
                      title="Restart video"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                <p className="text-white text-lg font-medium">
                  {isLoadingTrailer ? 'Loading trailer...' : 'No trailer available'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Movie Info Section */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title || 'Unknown Movie'}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-300 mb-4">
                {rating && (
                  <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">{formatRating(rating)}</span>
                  </div>
                )}
                {releaseDate && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full font-medium">
                    {formatYear(releaseDate)}
                  </span>
                )}
                <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-bold">4K UHD</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl">
                {generateMockDescription(title)}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handlePlay}
                disabled={!currentTrailer || !isPlayerReady}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Play</span>
              </button>

              {currentPlayTime > 0 && (
                <button
                  onClick={handleResume}
                  disabled={!currentTrailer || !isPlayerReady}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  Resume ({Math.floor(currentPlayTime)}s)
                </button>
              )}      
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </button>
            </div>
          </div>

          {showMoreInfo && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-white font-semibold mb-2">Cast</h4>
                  <p className="text-gray-300">Featured actors and actresses</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Genres</h4>
                  <p className="text-gray-300">Action, Drama, Thriller</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Director</h4>
                  <p className="text-gray-300">Acclaimed filmmaker</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Duration</h4>
                  <p className="text-gray-300">2h 30m</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default WatchMovie;