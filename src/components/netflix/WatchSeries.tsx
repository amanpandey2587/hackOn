import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useShowDetails } from '../../hooks/useNetflixTVShows';
import ShowDetails from './ShowDetails';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

interface Show {
  id: string;
  title: string;
  year?: number;
  imdbId?: string;
  tvmazeId?: number;
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

interface WatchSeriesProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show;
}

interface TrailerData {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface CachedTrailerData extends TrailerData {
  timestamp: number;
  expiresAt: number;
}

const trailerCache = new Map<string, CachedTrailerData>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

const WatchSeries: React.FC<WatchSeriesProps> = ({ isOpen, onClose, show }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'watch'>('overview');
  const [trailerData, setTrailerData] = useState<TrailerData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [watchHistoryId, setWatchHistoryId] = useState<string | null>(null);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  
  const { getToken } = useAuth();
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const WATCH_UPDATE_INTERVAL = 15;
  const YOUTUBE_API_KEY = "AIzaSyBGOViLmJSgDLXBIBrb7jpGscpJlUeopd0";

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

  // Fetch trailer from YouTube API
  const fetchTrailer = useCallback(async (title: string, season?: number, episode?: number): Promise<TrailerData | null> => {
    const searchQuery = episode 
      ? `${title} season ${season} episode ${episode} trailer`
      : `${title} trailer`;
    const cacheKey = `${title}-${season || 'series'}-${episode || 'trailer'}`;
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Using cached trailer data for:', searchQuery);
      return cachedData;
    }

    if (!YOUTUBE_API_KEY ) {
      const mockTrailers = [
        { videoId: 'EXeTwQWrcwY', title: 'The Dark Knight - Official Trailer' },
        { videoId: 'TcMBFSGVi1c', title: 'Avengers: Endgame - Official Trailer' },
        { videoId: 'sGbxmsDFVnE', title: 'Inception - Official Trailer' },
        { videoId: 'QdBZY2fkU-0', title: 'Joker - Official Trailer' },
        { videoId: 'hA6hldpSTF8', title: 'Interstellar - Official Trailer' }
      ]
      
      const randomTrailer = mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
      const mockData = {
        videoId: randomTrailer.videoId,
        title: episode ? `${title} S${season}E${episode}` : `${title} - Official Trailer`,
        thumbnail: `https://img.youtube.com/vi/${randomTrailer.videoId}/maxresdefault.jpg`
      };
      
      addToCache(cacheKey, mockData);
      console.log('Using mock trailer data for:', searchQuery);
      return mockData;
    }

    try {
      console.log('Fetching trailer from YouTube API for:', searchQuery);
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
        console.log('Successfully fetched and cached trailer for:', searchQuery);
        return trailerData;
      }
    } catch (error) {
      console.error('Error fetching trailer for', searchQuery, ':', error);
    }
    
    return null;
  }, [YOUTUBE_API_KEY, getCachedData, addToCache]);

  const loadTrailerData = useCallback(async (title: string, season?: number, episode?: number) => {
    setIsLoadingTrailer(true);
    
    try {
      const trailer = await fetchTrailer(title, season, episode);
      if (trailer) {
        setTrailerData(trailer);
        setTimeout(() => {
          if (window.YT && window.YT.Player) {
            initializePlayer(trailer.videoId);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error loading trailer data", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  }, [fetchTrailer, initializePlayer]);

  const handleWatchNow = useCallback(async () => {
    setViewMode('watch');
    await loadTrailerData(show.title, selectedSeason, selectedEpisode);
  }, [show.title, selectedSeason, selectedEpisode, loadTrailerData]);

  const handlePlay = useCallback(async () => {
    if (player && isPlayerReady) {
      player.playVideo();
      if (!watchHistoryId) {
        try {
          const token = await getToken();
          
          const response = await axios.post('http://localhost:4000/api/watch-history/createWatchHistory', {
            contentId: show.id,
            title: show.title,
            releaseYear: show.year,
            rating: show.userRating,
            totalDuration: show.runtime || 45,
            watchDuration: currentPlayTime,
            contentType: 'series',
            genre: show.genre,
            streamingPlatform: "netflix",
            seasonNumber: selectedSeason,
            episodeNumber: selectedEpisode,
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          setWatchHistoryId(response.data.data._id);
        } catch (err) {
          console.error('Error creating watch history:', err);
        }
      }
    }
  }, [player, isPlayerReady, show, selectedSeason, selectedEpisode, currentPlayTime, watchHistoryId, getToken]);

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

  const handleViewDetails = useCallback(() => {
    setViewMode('details');
  }, []);

  const handleBackToOverview = useCallback(() => {
    setViewMode('overview');
    if (player) {
      player.pauseVideo();
    }
  }, [player]);

  const handleClose = useCallback(async () => {
    if (player && isPlayerReady && watchHistoryId) {
      const finalTime = player.getCurrentTime();

      try {
        await axios.patch(`http://localhost:4000/api/watch-history/${watchHistoryId}`, {
          watchDuration: finalTime
        });
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    }

    if (player) {
      player.pauseVideo();
      player.destroy();
      setPlayer(null);
    }
    
    setViewMode('overview');
    setIsPlaying(false);
    setIsPlayerReady(false);
    setTrailerData(null);
    onClose();
  }, [onClose, player, isPlayerReady, watchHistoryId]);

  useEffect(() => {
    let interval: number | null = null;

    if (isPlaying && player && isPlayerReady && watchHistoryId) {
      interval = window.setInterval(async () => {
        const newTime = player.getCurrentTime();
        setCurrentPlayTime(newTime);

        try {
          const token = await getToken();
          await axios.patch(`http://localhost:4000/api/watch-history/${watchHistoryId}`, {
            watchDuration: newTime
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
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
  }, [isPlaying, player, isPlayerReady, watchHistoryId, getToken]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [player]);

  if (!isOpen) return null;

  if (viewMode === 'details') {
    return (
      <ShowDetails
        isOpen={isOpen}
        onClose={handleClose}
        show={show}
      />
    );
  }

  if (viewMode === 'watch') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <button
            onClick={handleClose}
            className={`absolute top-6 right-6 z-50 bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={handleBackToOverview}
            className={`absolute top-6 left-6 z-50 bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="relative aspect-video bg-black" onMouseMove={handleMouseMove}>
            {trailerData ? (
              <div className="relative w-full h-full">
                <div 
                  ref={playerRef}
                  className="w-full h-full"
                  id={`youtube-player-${show.id}`}
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

                  {/* Episode Info */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                    <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-lg">
                      <h3 className="text-lg font-semibold">{show.title}</h3>
                      <p className="text-sm text-gray-300">Season {selectedSeason}, Episode {selectedEpisode}</p>
                    </div>
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
                            className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                            style={{
                              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-white text-lg font-medium">
                    {isLoadingTrailer ? 'Loading episode...' : 'No content available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{show.title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={show.poster || show.backdrop}
                alt={show.title}
                className="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto lg:mx-0"
              />
            </div>

            {/* Show Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{show.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                  <span>{show.year}</span>
                  {show.runtime && (
                    <>
                      <span>•</span>
                      <span>{show.runtime}m</span>
                    </>
                  )}
                  {show.userRating && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="ml-1">{(show.userRating / 2).toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Episode Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    >
                      {Array.from({ length: show.seasonCount || 1 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Season {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Episode</label>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    >
                      {Array.from({ length: Math.ceil((show.episodeCount || 10) / (show.seasonCount || 1)) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Episode {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {show.genre && show.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {show.genre.map((genre, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-gray-300 leading-relaxed line-clamp-4">
                  {show.plot || 'No description available.'}
                </p>
              </div>

              {/* Series Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {show.networkNames && show.networkNames.length > 0 && (
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white ml-2">{show.networkNames.join(', ')}</span>
                  </div>
                )}
                
                {show.seasonCount && (
                  <div>
                    <span className="text-gray-400">Seasons:</span>
                    <span className="text-white ml-2">{show.seasonCount}</span>
                  </div>
                )}
                
                {show.episodeCount && (
                  <div>
                    <span className="text-gray-400">Episodes:</span>
                    <span className="text-white ml-2">{show.episodeCount}</span>
                  </div>
                )}
                
                {show.status && (
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2">{show.status}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleWatchNow}
                  disabled={isLoadingTrailer}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoadingTrailer ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span>Watch Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleViewDetails}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchSeries;