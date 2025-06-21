import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setOpen } from "../redux/movieSlice";
import { setLoading } from "../redux/userSlice";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { AITimestamps } from "./netflix/AITimestamps";

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
  onClose: () => void;
  movieId: string;
  posterPath: string;
  title: string;
  rating: number;
  releaseDate: string;
  totalDuration: number;
  genre: string[];
}
// Use in-memory cache instead of localStorage
const trailerCache = new Map<string, CachedTrailerData>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100;
const WatchMovie: React.FC<WatchMovieProps> = (props) => {
  // Log raw props BEFORE destructuring
  console.log("=== WatchMovie Raw Props Debug ===");
  console.log("Raw props object:", props);
  console.log("Props keys:", Object.keys(props));
  console.log("props.onClose directly:", props.onClose);
  console.log("Is onClose in props?", "onClose" in props);

  // Now destructure
  const {
    isOpen,
    onClose,
    movieId,
    posterPath,
    title,
    rating,
    releaseDate,
    totalDuration,
    genre,
  } = props;

  console.log("=== After Destructuring ===");
  console.log("onClose:", onClose);
  console.log("onClose type:", typeof onClose);

  const dispatch = useDispatch();
  // ... rest of your component
  const [trailerData, setTrailerData] = useState<{
    [key: string]: TrailerData;
  }>({});
  
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
  const navigate = useNavigate();
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
      expiresAt: now + CACHE_DURATION,
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
      thumbnail: cached.thumbnail,
    };
  }, []);
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API ready");
      };
    }
  }, []);
  const initializePlayer = useCallback(
    (videoId: string) => {
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
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log("Player ready");
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
            console.error("YouTube player error:", event.data);
          },
        },
      });
    },
    [player, volume, isMuted]
  );
  const fetchTrailer = useCallback(
    async (title: string, releaseDate: string): Promise<TrailerData | null> => {
      const cacheKey = `${title}-${releaseDate}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log("Using cached trailer data for:", title);
        return cachedData;
      }
      const year = new Date(releaseDate).getFullYear();
      if (
        !YOUTUBE_API_KEY ||
        YOUTUBE_API_KEY !== "AIzaSyBGOViLmJSgDLXBIBrb7jpGscpJlUeopd0"
      ) {
        const mockTrailers = [
          {
            videoId: "EXeTwQWrcwY",
            title: "The Dark Knight - Official Trailer",
          },
          {
            videoId: "TcMBFSGVi1c",
            title: "Avengers: Endgame - Official Trailer",
          },
          { videoId: "sGbxmsDFVnE", title: "Inception - Official Trailer" },
          { videoId: "QdBZY2fkU-0", title: "Joker - Official Trailer" },
          { videoId: "hA6hldpSTF8", title: "Interstellar - Official Trailer" },
        ];
        const randomTrailer =
          mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
        const mockData = {
          videoId: randomTrailer.videoId,
          title: `${title} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${randomTrailer.videoId}/maxresdefault.jpg`,
        };
        addToCache(cacheKey, mockData);
        return mockData;
      }
      try {
        const searchQuery = `${title} ${year} official trailer`;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            searchQuery
          )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
        );
        if (!response.ok) {
          throw new Error(
            `YouTube API error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          const trailerData = {
            videoId: video.id.videoId,
            title: video.snippet.title,
            thumbnail:
              video.snippet.thumbnails.high?.url ||
              video.snippet.thumbnails.default?.url,
          };
          addToCache(cacheKey, trailerData);
          return trailerData;
        }
      } catch (error) {
        console.error("Error fetching trailer for", title, ":", error);
        const mockTrailers = [
          {
            videoId: "EXeTwQWrcwY",
            title: "The Dark Knight - Official Trailer",
          },
          {
            videoId: "TcMBFSGVi1c",
            title: "Avengers: Endgame - Official Trailer",
          },
          { videoId: "sGbxmsDFVnE", title: "Inception - Official Trailer" },
        ];
        const randomTrailer =
          mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
        const fallbackData = {
          videoId: randomTrailer.videoId,
          title: `${title} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${randomTrailer.videoId}/maxresdefault.jpg`,
        };
        addToCache(cacheKey, fallbackData);
        return fallbackData;
      }
      return null;
    },
    [YOUTUBE_API_KEY, getCachedData, addToCache]
  );
  const loadContentData = useCallback(
    async (title: string, releaseDate: string) => {
      const cacheKey = `${title}-${releaseDate}`;
      if (trailerData[movieId]) {
        if (window.YT && window.YT.Player && !isPlayerReady) {
          initializePlayer(trailerData[movieId].videoId);
        }
        return;
      }
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setTrailerData((prev) => ({
          ...prev,
          [movieId]: cachedData,
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
          setTrailerData((prev) => ({
            ...prev,
            [movieId]: trailer,
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
    },
    [
      movieId,
      trailerData,
      fetchTrailer,
      dispatch,
      initializePlayer,
      isPlayerReady,
      getCachedData,
    ]
  );
  const handleClose = useCallback(async () => {
    console.log("handleClose called");
    console.log("props.onClose:", props.onClose);
    console.log("typeof props.onClose:", typeof props.onClose);

    // Update watch history if all conditions are met
    if (player && isPlayerReady && watchHistoryId) {
      const finalTime = player.getCurrentTime();
      try {
        await axios.patch(`/api/watch-history/${watchHistoryId}`, {
          watchDuration: finalTime,
        });
      } catch (error) {
        console.error("Error updating watch history:", error);
      }
    }

    // Fix: Use props.onClose instead of just onClose
    if (props.onClose && typeof props.onClose === "function") {
      props.onClose();
    }
  }, [props.onClose, player, isPlayerReady, watchHistoryId]); // Fix: Update dependency
  // Early return if not open

  const { getToken } = useAuth();
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
          const token = await getToken();
          const response = await axios.post(
            "http://localhost:4000/api/watch-history/createWatchHistory",
            {
              contentId: movieId,
              title,
              releaseYear: new Date(releaseDate || "").getFullYear(),
              rating,
              totalDuration: totalDuration,
              watchDuration: currentPlayTime,
              contentType: "movie",
              genre: genre,
              streamingPlatform: "netflix",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setWatchHistoryId(response.data.data._id);
        } catch (err) {
          console.error("Error creating watch history:", err);
        }
      }
    }
  }, [
    player,
    isPlayerReady,
    movieId,
    title,
    releaseDate,
    rating,
    currentPlayTime,
    watchHistoryId,
    getToken,
    totalDuration,
    genre,
  ]);
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying && player && isPlayerReady && watchHistoryId) {
      interval = window.setInterval(async () => {
        const newTime = player.getCurrentTime();
        setCurrentPlayTime(newTime);
        try {
          await axios.patch(`http://localhost:4000/api/watch-history/getWatchHistory/${watchHistoryId}`, {
            watchDuration: newTime,
          });
        } catch (error) {
          console.error("Error updating watch history:", error);
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
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [player, isPlayerReady, isMuted]
  );
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
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      console.log("Backdrop clicked");
      console.log("event.target:", event.target);
      console.log("event.currentTarget:", event.currentTarget);
      console.log("Are they equal?", event.target === event.currentTarget);
      if (event.target === event.currentTarget) {
        console.log("Calling handleClose from backdrop click");
        handleClose();
      }
    },
    [handleClose]
  );
  const formatRating = useCallback((rating?: number) => {
    if (!rating) return null;
    return (rating / 2).toFixed(1);
  }, []);
  const formatYear = useCallback((dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear();
  }, []);
  const generateMockDescription = useCallback((title?: string) => {
    const descriptions = [
      "A gripping tale of heroism and sacrifice that will keep you on the edge of your seat from start to finish.",
      "An epic adventure that combines stunning visuals with an unforgettable story and characters you'll never forget.",
      "A masterpiece of cinema that explores the depths of human nature through compelling storytelling and brilliant performances.",
      "An action-packed thriller that delivers non-stop excitement with plot twists that will leave you breathless.",
      "A powerful drama that touches the heart while delivering spectacular entertainment for the whole family.",
    ];
    const hash = title
      ? title.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
      : 0;
    return descriptions[hash % descriptions.length];
  }, []);
  useEffect(() => {
    const loadWatchHistory = async () => {
      try {
        const response = await axios.get(
          `/api/watch-history/getWatchHistoryById/${movieId}`
        );
        if (response.data.data && response.data.data.length > 0) {
          const history = response.data.data[0];
          setWatchHistoryId(history._id);
          setCurrentPlayTime(history.watchDuration || 0);
        }
      } catch (err) {
        console.error("Error loading watch history:", err);
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
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
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
  }, [isOpen, player]);
  if (!isOpen) return null;
  const currentTrailer = trailerData[movieId];
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full h-full max-w-7xl max-h-[95vh] bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col"
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Fixed position, always visible */}
        <button
          onClick={(e) => {
            console.log("Close button clicked directly");
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-4 right-4 z-50 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* AI Timestamps Component - Add this here */}
        {currentTrailer && (
          <AITimestamps
            videoId={currentTrailer.videoId}
            player={player}
            isPlayerReady={isPlayerReady}
          />
        )}

        {/* Video Player Section */}
        <div className="relative flex-1 bg-black">
          {currentTrailer ? (
            <div className="relative w-full h-full">
              <div
                ref={playerRef}
                className="w-full h-full"
                id={`youtube-player-${movieId}`}
              />
              {/* Video Controls Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Central Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!isPlayerReady}
                    className={`bg-red-600 bg-opacity-80 hover:bg-opacity-90 text-white rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 backdrop-blur-sm pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                      isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                    }`}
                  >
                    {isPlaying ? (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 pointer-events-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleMute}
                        disabled={!isPlayerReady}
                        className="text-white hover:text-red-400 transition-colors disabled:opacity-50 hover:scale-110 transform duration-200"
                      >
                        {isMuted || volume === 0 ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
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
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 slider"
                      />
                    </div>
                    <button
                      onClick={handleRestart}
                      disabled={!isPlayerReady}
                      className="text-white hover:text-red-400 transition-colors disabled:opacity-50 hover:scale-110 transform duration-200"
                      title="Restart video"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8s8-3.58 8-8-3.58-8-8-8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-sm">
                  {isLoadingTrailer
                    ? "Loading trailer..."
                    : "No trailer available"}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Movie Info Section - Scrollable */}
        <div className="bg-gradient-to-t from-black to-gray-900 p-6 max-h-64 overflow-y-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                {title || "Unknown Movie"}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                {rating && (
                  <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">
                      {formatRating(rating)}
                    </span>
                  </div>
                )}
                {releaseDate && (
                  <span className="bg-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {formatYear(releaseDate)}
                  </span>
                )}
                <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">
                  4K UHD
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                {generateMockDescription(title)}
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePlay}
                disabled={!currentTrailer || !isPlayerReady}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play</span>
              </button>
              {currentPlayTime > 0 && (
                <button
                  onClick={handleResume}
                  disabled={!currentTrailer || !isPlayerReady}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 text-sm"
                >
                  Resume ({Math.floor(currentPlayTime)}s)
                </button>
              )}
              <button
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </button>
            </div>
          </div>
          {showMoreInfo && (
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <h4 className="text-white font-semibold mb-1">Genre</h4>
                  <p className="text-gray-300">
                    {genre && genre.length > 0
                      ? genre.join(", ")
                      : "Action, Drama"}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Duration</h4>
                  <p className="text-gray-300">
                    {totalDuration
                      ? `${Math.floor(totalDuration / 60)}h ${
                          totalDuration % 60
                        }m`
                      : "2h 30m"}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Director</h4>
                  <p className="text-gray-300">Christopher Nolan</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Starring</h4>
                  <p className="text-gray-300">
                    Leonardo DiCaprio, Marion Cotillard, Tom Hardy
                  </p>
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
