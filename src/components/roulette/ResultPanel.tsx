import { motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ContentCard from '../Search/ContentCard';

interface Props {
  selectedTitle: string | null;
  loading: boolean;
  error: string | null;
  spinning: boolean;
  onLike: () => void;
  onRespin: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'documentary' | 'tv_series';
  poster?: string;
  backdrop?: string;
  rating?: number;
  releaseDate?: string;
  genre?: string[];
  imdbId?: string;
  plot?: string;
  runtime?: number;
  director?: string;
  cast?: string[];
  year?: number;
  vote_average?: number;
  country?: string;
  language?: string;
  awards?: string[];
  boxOffice?: number;
  networkNames?: string[];
  status?: string;
  officialSite?: string;
}

interface OMDBResponse {
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Plot: string;
  Genre: string;
  imdbRating: string;
  imdbID: string;
  Director?: string;
  Actors?: string;
  Runtime?: string;
  Country?: string;
  Language?: string;
  Awards?: string;
  BoxOffice?: string;
  Response: string;
}

interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  genres: string[];
  status: string;
  runtime: number;
  premiered: string;
  ended: string;
  officialSite: string;
  rating: {
    average: number;
  };
  network: {
    name: string;
  };
  webChannel: {
    name: string;
  };
  externals: {
    imdb: string;
  };
  image: {
    medium: string;
    original: string;
  };
  summary: string;
}

export default function ResultPanel({ selectedTitle, loading, error, spinning, onLike, onRespin }: Props) {
  const [contentData, setContentData] = useState<ContentItem | null>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  // ESC key handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        closeFullScreen();
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyPress);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);
  useEffect(() => {
    if (selectedTitle && !spinning) {
      fetchContentData(selectedTitle);
    }
  }, [selectedTitle, spinning]);

  const fetchOMDBData = async (title: string): Promise<OMDBResponse | null> => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=cb427cd4&plot=full`
      );
      const data = await response.json();
      
      if (data.Response === 'True') {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching OMDB data:', error);
      return null;
    }
  };

  const fetchTVMazeData = async (title: string): Promise<TVMazeShow | null> => {
    try {
      const searchResponse = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`
      );
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        if (searchResults && searchResults.length > 0) {
          const bestMatch = searchResults.find((result: any) => 
            result.show.name.toLowerCase() === title.toLowerCase()
          ) || searchResults[0];
          
          return bestMatch.show;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching TVMaze data:', error);
      return null;
    }
  };

  const parseRuntime = (runtime: string): number | undefined => {
    if (!runtime || runtime === 'N/A') return undefined;
    const match = runtime.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  const parseRating = (rating: string): number | undefined => {
    if (!rating || rating === 'N/A') return undefined;
    const num = parseFloat(rating);
    return isNaN(num) ? undefined : num;
  };

  const parseBoxOffice = (boxOffice: string): number | undefined => {
    if (!boxOffice || boxOffice === 'N/A') return undefined;
    const numStr = boxOffice.replace(/[$,]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? undefined : num;
  };

  const convertOMDBToContentItem = (omdbData: OMDBResponse): ContentItem => {
    const isMovie = omdbData.Type === 'movie';
    const contentType = isMovie ? 'movie' : 
                       omdbData.Type === 'series' ? 'tv' : 'tv_series';

    return {
      id: omdbData.imdbID || `${omdbData.Title}-${Date.now()}`,
      title: omdbData.Title,
      type: contentType as 'movie' | 'tv' | 'documentary' | 'tv_series',
      poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined,
      backdrop: omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined,
      rating: parseRating(omdbData.imdbRating),
      vote_average: parseRating(omdbData.imdbRating),
      releaseDate: omdbData.Year !== 'N/A' ? `${omdbData.Year}-01-01` : undefined,
      year: omdbData.Year !== 'N/A' ? parseInt(omdbData.Year) : undefined,
      genre: omdbData.Genre !== 'N/A' ? omdbData.Genre.split(', ') : undefined,
      imdbId: omdbData.imdbID !== 'N/A' ? omdbData.imdbID : undefined,
      plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : undefined,
      runtime: parseRuntime(omdbData.Runtime || ''),
      director: omdbData.Director !== 'N/A' ? omdbData.Director : undefined,
      cast: omdbData.Actors !== 'N/A' ? omdbData.Actors.split(', ') : undefined,
      country: omdbData.Country !== 'N/A' ? omdbData.Country : undefined,
      language: omdbData.Language !== 'N/A' ? omdbData.Language : undefined,
      awards: omdbData.Awards !== 'N/A' ? [omdbData.Awards] : undefined,
      boxOffice: parseBoxOffice(omdbData.BoxOffice || ''),
    };
  };

  const convertTVMazeToContentItem = (tvMazeData: TVMazeShow, title: string): ContentItem => {
    const contentType = tvMazeData.type === 'Documentary' ? 'documentary' : 'tv';
    
    return {
      id: tvMazeData.id.toString(),
      title: tvMazeData.name || title,
      type: contentType as 'movie' | 'tv' | 'documentary' | 'tv_series',
      poster: tvMazeData.image?.original || tvMazeData.image?.medium,
      backdrop: tvMazeData.image?.original,
      rating: tvMazeData.rating?.average,
      releaseDate: tvMazeData.premiered,
      year: tvMazeData.premiered ? new Date(tvMazeData.premiered).getFullYear() : undefined,
      genre: tvMazeData.genres?.length ? tvMazeData.genres : undefined,
      imdbId: tvMazeData.externals?.imdb,
      plot: tvMazeData.summary ? tvMazeData.summary.replace(/<[^>]*>/g, '') : undefined,
      runtime: tvMazeData.runtime,
      networkNames: tvMazeData.network ? [tvMazeData.network.name] : 
                    tvMazeData.webChannel ? [tvMazeData.webChannel.name] : undefined,
      status: tvMazeData.status,
      officialSite: tvMazeData.officialSite,
    };
  };

  const createFallbackContentItem = (title: string): ContentItem => {
    return {
      id: `${title}-${Date.now()}`,
      title: title,
      type: 'movie', 
      plot: 'No additional information available',
      genre: ['Unknown'],
      rating: undefined,
    };
  };

  const fetchContentData = async (title: string) => {
    setFetchingData(true);
    setContentData(null);
    
    try {
      const omdbData = await fetchOMDBData(title);
      
      if (omdbData) {
        const contentItem = convertOMDBToContentItem(omdbData);
        setContentData(contentItem);
        return;
      }

      const tvMazeData = await fetchTVMazeData(title);
      
      if (tvMazeData) {
        const contentItem = convertTVMazeToContentItem(tvMazeData, title);
        setContentData(contentItem);
        return;
      }

      const fallbackItem = createFallbackContentItem(title);
      setContentData(fallbackItem);
      
    } catch (error) {
      console.error('Error fetching content data:', error);
      const fallbackItem = createFallbackContentItem(title);
      setContentData(fallbackItem);
    } finally {
      setFetchingData(false);
    }
  };

  if (!selectedTitle && !spinning && !error) {
    return null;
  }

  return (
    <>
    <motion.div
      className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl text-center space-y-4 border border-gray-700/50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div 
          className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-700"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          ❌ {error}
        </motion.div>
      )}
      
      {spinning && (
        <motion.div 
          className="text-indigo-300 text-lg font-semibold space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-pulse">🎰 Spinning the wheel...</div>
          <div className="text-sm text-gray-400">
            The wheel is choosing your perfect match!
          </div>
        </motion.div>
      )}
      
      {!spinning && selectedTitle && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="text-center space-y-3">
            <motion.div 
              className="text-sm text-gray-400 uppercase tracking-wide font-semibold"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              🎬 Your Perfect Match
            </motion.div>
            
            {fetchingData ? (
              <motion.div 
                className="text-indigo-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="animate-pulse">📡 Fetching details...</div>
              </motion.div>
            ) : contentData ? (
              <div className="flex justify-center z-20 w-full">
                <div 
                  onClick={openFullScreen}
                  className="cursor-pointer transform scale-90 hover:scale-95 transition-transform duration-300"
                >
                  <ContentCard 
                    content={contentData} 
                    className="hover:shadow-2xl hover:shadow-indigo-500/20"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  Click to expand
                </div>
              </div>
            ) : (
              <motion.h2 
                className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                "{selectedTitle}"
              </motion.h2>
            )}
            
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              ✨ Personally selected just for you
            </motion.div>
          </div>
          
          <motion.div 
            className="flex justify-center gap-4 mt-28"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button 
              onClick={onLike}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border border-green-400/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              👍 Perfect Choice!
            </motion.button>
            <motion.button 
              onClick={onRespin}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border border-yellow-400/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Try Another
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>

    {/* Full Screen Modal */}
    <AnimatePresence>
      {isFullScreen && contentData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeFullScreen}
        >
          {/* Close Button */}
          <motion.button
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            onClick={closeFullScreen}
            className="absolute top-6 right-6 z-60 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* ESC Key Hint */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute top-6 left-6 text-white/60 text-sm"
          >
            Press ESC to close
          </motion.div>

          {/* Full Screen Content Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-fit max-h-fit overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ContentCard 
              content={contentData} 
              className="w-full h-full shadow-2xl shadow-indigo-500/20"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}