import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  Search,
  Play,
  Calendar,
  Star,
  ExternalLink,
  ArrowLeft,
  Tv,
  Film,
  ImageOff,
} from 'lucide-react';

// Import the streaming components
import WatchMovie from '../../components/WatchMovies'; 
import WatchSeries from '../../components/netflix/WatchSeries'; 

// Interfaces
interface Genre {
  id: number;
  name: string;
  tmdb_id?: number;
}

interface Source {
  name: string;
}

interface TVMazeNetwork {
  name: string|any;
}

interface TVMazeData {
  network?: TVMazeNetwork;
  status?: string;
  summary?: string;
  image?: {
    medium?: string;
    original?: string;
  };
  poster?: string; // Added poster field
}

interface TitleItem {
  id: number;
  imdb_id?: string;
  title?: string;
  name?: string;
  type: 'movie' | 'tv';
  poster?: string;
  year?: number;
  runtime_minutes?: number;
  user_rating?: number;
  plot_overview?: string;
  trailer?: string;
  sources?: Source[];
  tvmaze?: TVMazeData | null;
}

// Transform TitleItem to Show format for WatchSeries
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

// Cache utilities
const cache = {
  genres: null as { data: Genre[]; timestamp: number } | null,
  genreContent: {} as Record<number, { data: TitleItem[]; timestamp: number }>,
  tvmazeData: {} as Record<string, { data: TVMazeData; timestamp: number }>,

  setGenres(data: Genre[]) {
    cache.genres = { data, timestamp: Date.now() };
  },

  getGenres() {
    if (!cache.genres) return null;
    const isExpired = Date.now() - cache.genres.timestamp > 24 * 60 * 60 * 1000; // 24 hours
    return isExpired ? null : cache.genres.data;
  },

  setGenreContent(genreId: number, data: TitleItem[]) {
    cache.genreContent[genreId] = { data, timestamp: Date.now() };
  },

  getGenreContent(genreId: number) {
    const entry = cache.genreContent[genreId];
    if (!entry) return null;
    const isExpired = Date.now() - entry.timestamp > 2 * 60 * 60 * 1000; // 2 hours
    return isExpired ? null : entry.data;
  },

  setTvmazeData(imdbId: string, data: TVMazeData) {
    cache.tvmazeData[imdbId] = { data, timestamp: Date.now() };
  },

  getTvmazeData(imdbId: string) {
    const entry = cache.tvmazeData[imdbId];
    if (!entry) return null;
    const isExpired = Date.now() - entry.timestamp > 6 * 60 * 60 * 1000; // 6 hours
    return isExpired ? null : entry.data;
  },
};

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

const BrowseGenre: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreContent, setGenreContent] = useState<TitleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Streaming component states
  const [watchMovieOpen, setWatchMovieOpen] = useState(false);
  const [watchSeriesOpen, setWatchSeriesOpen] = useState(false);
  const [selectedMovieData, setSelectedMovieData] = useState<{
    movieId: string;
    posterPath?: string;
    title?: string;
    rating?: number;
    releaseDate?: string;
    totalDuration?: number;
    genre?: string[];
  } | null>(null);
  const [selectedShowData, setSelectedShowData] = useState<Show | null>(null);
  const [isWatchMovieOpen, setIsWatchMovieOpen] = useState(false);
    const handleCloseWatchMovie = () => {
    setIsWatchMovieOpen(false);
  };
  const fetchGenres = async () => {
    try {
      const cachedGenres = cache.getGenres();
      if (cachedGenres) {
        setGenres(cachedGenres);
        return;
      }

      setLoading(true);
      const response = await fetch(`${WATCHMODE_BASE_URL}/genres/?apiKey=${WATCHMODE_API_KEY}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      cache.setGenres(data);
      setGenres(data);
    } catch (err: any) {
      setError('Failed to fetch genres: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenreContent = async (genreId: number) => {
    try {
      const cachedContent = cache.getGenreContent(genreId);
      if (cachedContent) {
        setGenreContent(cachedContent);
        return;
      }

      setContentLoading(true);
      const startDate = 1704067200; // Jan 1, 2024
      const endDate = 1746057600; // May 1, 2025

      const url = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&genres=${genreId}&limit=20&sort_by=popularity_desc&release_date_start=${startDate}&release_date_end=${endDate}&append_to_response=sources`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data in the frontend of watch mode is", data);
      
      const enhancedContent = await Promise.all(
        data.titles?.map(async (title: TitleItem) => {
          const tvmazeData = await fetchTvmazeData(title.imdb_id ?? '');
          return {
            ...title,
            tvmaze: tvmazeData,
            // Use TVMaze poster if available, otherwise use original poster
            poster: tvmazeData?.poster || title.poster,
          };
        }) || []
      );

      cache.setGenreContent(genreId, enhancedContent);
      setGenreContent(enhancedContent);
    } catch (err: any) {
      setError('Failed to fetch genre content: ' + err.message);
    } finally {
      setContentLoading(false);
    }
  };

  const fetchTvmazeData = async (imdbId: string) => {
    if (!imdbId) return null;

    try {
      const cachedData = cache.getTvmazeData(imdbId);
      if (cachedData) return cachedData;

      const response = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      console.log("tvmaze data is", data);

      // Extract poster from TVMaze image data
      const poster = data?.image?.original || data?.image?.medium || undefined;
      console.log("Poster is ", poster);
      
      const tvmazeData = {
        ...data,
        poster,  // add poster field here
      };
      
      cache.setTvmazeData(imdbId, tvmazeData);
      return tvmazeData;
    } catch {
      return null;
    }
  };

  // Transform TitleItem to Show format
  const transformToShow = (item: TitleItem): Show => {
    return {
      id: item.id.toString(),
      title: item.title || item.name || '',
      year: item.year,
      imdbId: item.imdb_id,
      type: item.type,
      poster: item.poster,
      plot: item.plot_overview,
      runtime: item.runtime_minutes,
      userRating: item.user_rating,
      releaseDate: item.year ? `${item.year}-01-01` : undefined,
      networkNames: item.tvmaze?.network ? [item.tvmaze.network.name] : [],
      status: item.tvmaze?.status,
    };
  };

  // Handle play button click
  const handlePlayClick = (item: TitleItem) => {
    console.log("Information of the item is", item);
    if (item.type === 'movie') {
      // Open movie player
      setSelectedMovieData({
        movieId: item.id.toString(),
        posterPath: item.poster,
        title: item.title,
        rating: item.user_rating,
        releaseDate: item.year ? `${item.year}-01-01` : undefined,
        totalDuration: item.runtime_minutes,
        genre: [] // You can extract genres if available
      });
      setWatchMovieOpen(true);
    } else if (item.type === 'tv_series'){
      // Open series player
      const showData = transformToShow(item);
      setSelectedShowData(showData);
      setWatchSeriesOpen(true);
    }
  };

  // Close handlers
  const handleCloseMovie = () => {
    setWatchMovieOpen(false);
    setSelectedMovieData(null);
  };

  const handleCloseSeries = () => {
    setWatchSeriesOpen(false);
    setSelectedShowData(null);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setGenreContent([]);
    fetchGenreContent(genre.id);
  };

  const handleBackToGenres = () => {
    setSelectedGenre(null);
    setGenreContent([]);
    setSearchTerm('');
  };

  const filteredContent = genreContent.filter((item) =>
    (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get the best available poster
  const getPosterUrl = (item: TitleItem): string | undefined => {
    // Priority: TVMaze poster > Original poster
    return item.tvmaze?.poster || item.poster;
  };

  // Placeholder image component
  const PosterPlaceholder = ({ title }: { title: string }) => (
    <div className="w-full h-48 bg-gray-700 rounded flex flex-col items-center justify-center text-gray-400">
      <ImageOff className="w-12 h-12 mb-2" />
      <span className="text-xs text-center px-2">{title}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading genres...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-900 to-black p-6">
          <div className="max-w-full">
            {!selectedGenre ? (
              <>
                <h1 className="text-5xl font-bold text-white mb-2">Browse</h1>
                <p className="text-xl text-gray-400 mb-8">Discover movies and shows by genre</p>

                <div className="relative max-w-md mb-8">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search genres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 w-full"
                  />
                </div>

                {/* Genre Slider */}
                <Swiper
                  slidesPerView={2}
                  spaceBetween={12}
                  navigation
                  modules={[Navigation]}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 6 },
                  }}
                >
                  {filteredGenres.map((genre) => (
                    <SwiperSlide key={genre.id}>
                      <button
                        onClick={() => handleGenreClick(genre)}
                        className="w-full h-32 bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-105 rounded-lg p-4 text-left transition-transform duration-200"
                      >
                        <div className="text-xl font-bold">{genre.name}</div>
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {filteredGenres.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-xl text-gray-400">No genres found for "{searchTerm}"</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleBackToGenres}
                  className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back to Genres
                </button>

                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl font-bold">{selectedGenre.name} Movies & Shows</h1>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 w-full lg:w-80"
                    />
                  </div>
                </div>

                {contentLoading ? (
                  <div className="text-center py-12 text-gray-400 text-xl">Loading {selectedGenre.name} content...</div>
                ) : (
                  <Swiper
                    slidesPerView={2}
                    spaceBetween={16}
                    navigation
                    modules={[Navigation]}
                    breakpoints={{
                      640: { slidesPerView: 3 },
                      768: { slidesPerView: 4 },
                      1024: { slidesPerView: 5 },
                    }}
                  >
                    {filteredContent.map((item) => {
                      const posterUrl = getPosterUrl(item);
                      const title = item.title || item.name || 'Unknown Title';

                      return (
                        <SwiperSlide key={item.id}>
                          <div className="bg-gray-800 rounded-lg overflow-hidden p-4 group relative">
                            <div className="relative">
                              {posterUrl ? (
                                <img
                                  src={posterUrl}
                                  alt={title}
                                  className="w-full h-48 object-cover mb-4 rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // Hide the broken image and show placeholder
                                    target.style.display = 'none';
                                    const placeholder = target.nextElementSibling as HTMLElement;
                                    if (placeholder) {
                                      placeholder.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              
                              {/* Fallback placeholder - show if no poster URL or on image error */}
                              <div 
                                className={`w-full h-48 bg-gray-700 rounded flex flex-col items-center justify-center text-gray-400 mb-4 ${posterUrl ? 'hidden' : 'flex'}`}
                              >
                                <ImageOff className="w-12 h-12 mb-2" />
                                <span className="text-xs text-center px-2">{title}</span>
                              </div>
                            
                              {/* Play button overlay */}
                              <div className="absolute inset-0 bg-transparent bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded mb-4">
                                <button
                                  onClick={() => handlePlayClick(item)}
                                  className="bg-blue-700 hover:bg-red-700 text-white p-3 rounded-full transition-colors duration-200"
                                >
                                  <Play className="w-6 h-6 fill-current" />
                                </button>
                              </div>

                              {/* Type indicator */}
                              <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs flex items-center">
                                {item.type === 'movie' ? (
                                  <><Film className="w-3 h-3 mr-1" /> Movie</>
                                ) : (
                                  <><Tv className="w-3 h-3 mr-1" /> TV</>
                                )}
                              </div>
                            </div>

                            <div className="font-bold text-lg mb-2 truncate">{title}</div>
                            
                            <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" /> {item.year || 'N/A'}
                              </div>
                              {item.user_rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                  {(item.user_rating / 2).toFixed(1)}
                                </div>
                              )}
                            </div>

                            {item.runtime_minutes && (
                              <div className="text-gray-400 text-sm">
                                {Math.floor(item.runtime_minutes / 60)}h {item.runtime_minutes % 60}m
                              </div>
                            )}

                            {item.plot_overview && (
                              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                {item.plot_overview}
                              </p>
                            )}
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}

                {!contentLoading && filteredContent.length === 0 && (
                  <div className="text-center py-12 text-xl text-gray-400">
                    {searchTerm ? `No results found for "${searchTerm}"` : `No content found for ${selectedGenre.name}`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Movie Player Modal */}
      {selectedMovieData && (
        <WatchMovie
          isOpen={watchMovieOpen}
          onClose={handleCloseMovie}
          movieId={selectedMovieData.movieId}
          posterPath={selectedMovieData.posterPath}
          title={selectedMovieData.title}
          rating={selectedMovieData.rating}
          releaseDate={selectedMovieData.releaseDate}
          totalDuration={selectedMovieData.totalDuration}
          genre={selectedMovieData.genre}
        />
      )}

      {/* Series Player Modal */}
      {selectedShowData && (
        <WatchSeries
          isOpen={watchSeriesOpen}
          onClose={handleCloseSeries}
          show={selectedShowData}
        />
      )}
    </>
  );
};

export default BrowseGenre;