import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getId, setOpen } from "../../redux/movieSlice";
import WatchMovies from "../WatchMovies";
import WatchSeries from '../netflix/WatchSeries';
import { Star, Film, Tv, FileText } from 'lucide-react';

interface BaseContent {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'documentary' | 'tv_series';
  poster?: string;
  backdrop?: string;
  rating?: number;
  releaseDate?: string;
  genre?: string[];
  imdbId?: string;
}

interface MovieContent extends BaseContent {
  type: 'movie';
  runtime?: number;
  vote_average?: number;
  plot?: string;
  director?: string;
  cast?: string[];
  budget?: number;
  boxOffice?: number;
  awards?: string[];
  country?: string;
  language?: string;
  networkNames?: string[];
  seasonCount?: number;
  episodeCount?: number;
  status?: string;
  officialSite?: string;
  tvmazeId?: number;
}

interface TVContent extends BaseContent {
  type: 'tv' | 'documentary' | 'tv_series';
  year?: number;
  endYear?: number;
  tvmazeId?: number;
  plot?: string;
  runtime?: number;
  userRating?: number;
  criticRating?: number;
  networkNames?: string[];
  seasonCount?: number;
  episodeCount?: number;
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

type ContentItem = MovieContent | TVContent;

interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime: number;
  averageRuntime: number;
  premiered: string;
  ended: string;
  officialSite: string;
  schedule: {
    time: string;
    days: string[];
  };
  rating: {
    average: number;
  };
  weight: number;
  network: {
    id: number;
    name: string;
    country: {
      name: string;
      code: string;
      timezone: string;
    };
    officialSite: string;
  };
  webChannel: {
    id: number;
    name: string;
    country: {
      name: string;
      code: string;
      timezone: string;
    };
    officialSite: string;
  };
  dvdCountry: any;
  externals: {
    tvrage: number;
    thetvdb: number;
    imdb: string;
  };
  image: {
    medium: string;
    original: string;
  };
  summary: string;
  updated: number;
  _links: {
    self: {
      href: string;
    };
  };
}

interface TVMazeSeason {
  id: number;
  number: number;
  name: string;
  episodeOrder: number;
  premiereDate: string;
  endDate: string;
  network: {
    id: number;
    name: string;
  };
  webChannel: any;
  image: {
    medium: string;
    original: string;
  };
  summary: string;
}

interface OMDBResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

interface ContentCardProps {
  content: ContentItem;
  onClick?: (content: ContentItem) => void;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onClick,
  className = ""
}) => {
  console.log("Contnetn inthe contnetn card is",content)
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWatchSeriesOpen, setIsWatchSeriesOpen] = useState(false);
  const [enrichedContent, setEnrichedContent] = useState<ContentItem>(content);
  const [isLoading, setIsLoading] = useState(false);

  const { open, id } = useSelector((state: any) => state.movie);

  const fetchTVMazeSeasons = async (tvMazeId: number): Promise<TVMazeSeason[]> => {
    try {
      const response = await fetch(`https://api.tvmaze.com/shows/${tvMazeId}/seasons`);
      if (response.ok) {
        const seasons = await response.json();
        console.log('TVMaze seasons data:', seasons);
        return seasons;
      }
      return [];
    } catch (error) {
      console.error('Error fetching TVMaze seasons:', error);
      return [];
    }
  };

  const fetchTVMazeData = async (imdbId: string, title: string, contentType: string): Promise<{ show: TVMazeShow | null, seasons: TVMazeSeason[] }> => {
    try {
      setIsLoading(true);
      
      let show: TVMazeShow | null = null;
      let seasons: TVMazeSeason[] = [];

      if (imdbId) {
        const imdbResponse = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`);
        if (imdbResponse.ok) {
          show = await imdbResponse.json();
          console.log('TVMaze data from IMDB:', show);
        }
      }

      if (!show) {
        const searchResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          if (searchResults && searchResults.length > 0) {
            if (contentType === 'movie') {
              const movieMatch = searchResults.find((result: any) => 
                result.show.type === 'Scripted' && 
                result.show.name.toLowerCase().includes(title.toLowerCase())
              );
              show = movieMatch ? movieMatch.show : null;
            } else {
              const bestMatch = searchResults.find((result: any) => 
                result.show.name.toLowerCase() === title.toLowerCase()
              ) || searchResults[0];
              show = bestMatch.show;
            }
            
            console.log('TVMaze data from search:', show);
          }
        }
      }

      if (show && contentType !== 'movie') {
        seasons = await fetchTVMazeSeasons(show.id);
      }

      return { show, seasons };
    } catch (error) {
      console.error('Error fetching TVMaze data:', error);
      return { show: null, seasons: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOMDBData = async (imdbId: string, title: string): Promise<OMDBResponse | null> => {
    try {
      setIsLoading(true);
      
      const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'cb427cd4';
      
      let url = '';
      
      if (imdbId) {
        url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=full`;
      } else {
        url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=full`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.Response === 'True') {
          console.log('OMDB data:', data);
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching OMDB data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const enrichContentWithTVMaze = (originalContent: ContentItem, tvMazeData: TVMazeShow, seasons: TVMazeSeason[] = []): ContentItem => {
    const totalEpisodes = seasons.reduce((total, season) => total + (season.episodeOrder || 0), 0);
    
    if (originalContent.type === 'movie') {
      const movieContent = originalContent as MovieContent;
      return {
        ...movieContent,
        poster: movieContent.poster || tvMazeData.image?.original || tvMazeData.image?.medium,
        backdrop: movieContent.backdrop || tvMazeData.image?.original,
        genre: movieContent.genre?.length ? movieContent.genre : tvMazeData.genres,
        plot: movieContent.plot || (tvMazeData.summary ? tvMazeData.summary.replace(/<[^>]*>/g, '') : undefined),
        runtime: movieContent.runtime || tvMazeData.runtime || tvMazeData.averageRuntime,
        networkNames: movieContent.networkNames || (tvMazeData.network ? [tvMazeData.network.name] : tvMazeData.webChannel ? [tvMazeData.webChannel.name] : undefined),
        status: movieContent.status || tvMazeData.status,
        officialSite: movieContent.officialSite || tvMazeData.officialSite,
        tvmazeId: movieContent.tvmazeId || tvMazeData.id,
        imdbId: movieContent.imdbId || tvMazeData.externals?.imdb,
        seasonCount: seasons.length > 0 ? seasons.length : undefined,
        episodeCount: totalEpisodes > 0 ? totalEpisodes : undefined,
      };
    }

    const tvContent = originalContent as TVContent;
    
    return {
      ...tvContent,
      poster: tvContent.poster || tvMazeData.image?.original || tvMazeData.image?.medium,
      backdrop: tvContent.backdrop || tvMazeData.image?.original,
      genre: tvContent.genre?.length ? tvContent.genre : tvMazeData.genres,
      plot: tvContent.plot || (tvMazeData.summary ? tvMazeData.summary.replace(/<[^>]*>/g, '') : undefined),
      runtime: tvContent.runtime || tvMazeData.runtime || tvMazeData.averageRuntime,
      userRating: tvContent.userRating || tvMazeData.rating?.average,
      networkNames: tvContent.networkNames || (tvMazeData.network ? [tvMazeData.network.name] : tvMazeData.webChannel ? [tvMazeData.webChannel.name] : undefined),
      status: tvContent.status || tvMazeData.status,
      officialSite: tvContent.officialSite || tvMazeData.officialSite,
      schedule: tvContent.schedule || tvMazeData.schedule,
      endYear: tvContent.endYear || (tvMazeData.ended ? new Date(tvMazeData.ended).getFullYear() : undefined),
      tvmazeId: tvContent.tvmazeId || tvMazeData.id,
      imdbId: tvContent.imdbId || tvMazeData.externals?.imdb,
      seasonCount: tvContent.seasonCount || seasons.length || undefined,
      episodeCount: tvContent.episodeCount || totalEpisodes || undefined,
    };
  };

  const enrichContentWithOMDB = (originalContent: ContentItem, omdbData: OMDBResponse): ContentItem => {
    if (originalContent.type !== 'movie') {
      return originalContent; 
    }

    const movieContent = originalContent as MovieContent;
    
    const parseRuntime = (runtime: string): number | undefined => {
      const match = runtime.match(/(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    };

    const parseBoxOffice = (boxOffice: string): number | undefined => {
      if (!boxOffice || boxOffice === 'N/A') return undefined;
      const numStr = boxOffice.replace(/[$,]/g, '');
      const num = parseFloat(numStr);
      return isNaN(num) ? undefined : num;
    };

    const parseRating = (rating: string): number | undefined => {
      if (!rating || rating === 'N/A') return undefined;
      const num = parseFloat(rating);
      return isNaN(num) ? undefined : num;
    };

    return {
      ...movieContent,
      poster: movieContent.poster || (omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined),
      backdrop: movieContent.backdrop || (omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined),
      genre: movieContent.genre?.length ? movieContent.genre : 
             (omdbData.Genre !== 'N/A' ? omdbData.Genre.split(', ') : undefined),
      plot: movieContent.plot || (omdbData.Plot !== 'N/A' ? omdbData.Plot : undefined),
      runtime: movieContent.runtime || parseRuntime(omdbData.Runtime || ''),
      rating: movieContent.rating || parseRating(omdbData.imdbRating),
      vote_average: movieContent.vote_average || parseRating(omdbData.imdbRating),
      releaseDate: movieContent.releaseDate || (omdbData.Released !== 'N/A' ? omdbData.Released : undefined),
      director: movieContent.director || (omdbData.Director !== 'N/A' ? omdbData.Director : undefined),
      cast: movieContent.cast?.length ? movieContent.cast : 
            (omdbData.Actors !== 'N/A' ? omdbData.Actors.split(', ') : undefined),
      boxOffice: movieContent.boxOffice || parseBoxOffice(omdbData.BoxOffice || ''),
      awards: movieContent.awards?.length ? movieContent.awards : 
              (omdbData.Awards !== 'N/A' ? [omdbData.Awards] : undefined),
      country: movieContent.country || (omdbData.Country !== 'N/A' ? omdbData.Country : undefined),
      language: movieContent.language || (omdbData.Language !== 'N/A' ? omdbData.Language : undefined),
      imdbId: movieContent.imdbId || (omdbData.imdbID !== 'N/A' ? omdbData.imdbID : undefined),
    };
  };

  useEffect(() => {
    const shouldEnrichMovieData = () => {
      if (content.type !== 'movie') return false;
      
      const movieContent = content as MovieContent;
      return !movieContent.poster || 
             !movieContent.plot || 
             !movieContent.genre?.length || 
             !movieContent.runtime ||
             !movieContent.director ||
             !movieContent.cast?.length;
    };

    const shouldEnrichTVData = () => {
      if (content.type === 'movie') return false;
      
      const tvContent = content as TVContent;
      return !tvContent.poster || 
             !tvContent.plot || 
             !tvContent.genre?.length || 
             !tvContent.runtime ||
             !tvContent.networkNames?.length ||
             !tvContent.status ||
             !tvContent.seasonCount;
    };

    const enrichMovieContent = async () => {
      let tempContent = content;
      
      if (content.imdbId || content.title) {
        const omdbData = await fetchOMDBData(content.imdbId || '', content.title);
        if (omdbData) {
          tempContent = enrichContentWithOMDB(tempContent, omdbData);
          console.log('Enriched movie content with OMDB:', tempContent);
        }
      }
      
      if (content.imdbId || content.title) {
        const { show: tvMazeData, seasons } = await fetchTVMazeData(content.imdbId || '', content.title, 'movie');
        if (tvMazeData) {
          tempContent = enrichContentWithTVMaze(tempContent, tvMazeData, seasons);
          console.log('Enriched movie content with TVMaze:', tempContent);
        }
      }
      
      setEnrichedContent(tempContent);
    };

    const enrichTVContent = async () => {
      if (content.imdbId || content.title) {
        const { show: tvMazeData, seasons } = await fetchTVMazeData(content.imdbId || '', content.title, content.type);
        if (tvMazeData) {
          const enriched = enrichContentWithTVMaze(content, tvMazeData, seasons);
          setEnrichedContent(enriched);
          console.log('Enriched TV content:', enriched);
        }
      }
    };

    if (shouldEnrichMovieData()) {
      enrichMovieContent();
    }
    else if (shouldEnrichTVData()) {
      enrichTVContent();
    }
  }, [content]);
    
  const handleClick = () => {
    if (enrichedContent.type === 'movie') {
      console.log("Movie clicked");
      dispatch(getId(enrichedContent.id));
      console.log("id set");
      dispatch(setOpen(true));
      console.log("Modal opened");
    } else if (enrichedContent.type === 'tv' || enrichedContent.type === 'tv_series' || enrichedContent.type === 'documentary') {
      console.log("TV Series/Documentary clicked");
      setIsWatchSeriesOpen(true);
    } else if (onClick) {
      onClick(enrichedContent);
    }
  };

  const handleCloseWatchSeries = () => {
    setIsWatchSeriesOpen(false);
  };

  const handleImdbClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrichedContent.imdbId) {
      window.open(`https://www.imdb.com/title/${enrichedContent.imdbId}`, '_blank');
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getTypeIcon = () => {
    switch (enrichedContent.type) {
      case 'movie':
        return <Film className="w-4 h-4 text-blue-500" />;
      case 'tv':
      case 'tv_series':
        return <Tv className="w-4 h-4 text-green-500" />;
      case 'documentary':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <Film className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReleaseYear = () => {
    if ('year' in enrichedContent && enrichedContent.year) {
      return enrichedContent.year;
    }
    if (enrichedContent.releaseDate) {
      return new Date(enrichedContent.releaseDate).getFullYear();
    }
    return null;
  };

  const getRating = () => {
    if (enrichedContent.rating) {
      return enrichedContent.rating;
    }
    if ('vote_average' in enrichedContent && enrichedContent.vote_average) {
      return enrichedContent.vote_average;
    }
    if ('userRating' in enrichedContent && enrichedContent.userRating) {
      return enrichedContent.userRating;
    }
    if ('criticRating' in enrichedContent && enrichedContent.criticRating) {
      return enrichedContent.criticRating;
    }
    return null;
  };

  const getRuntime = () => {
    if ('runtime' in enrichedContent && enrichedContent.runtime) {
      return enrichedContent.runtime;
    }
    return null;
  };

  const formatRating = (rating?: number) => {
    if (!rating) return null;
    if (enrichedContent.type === 'movie' && rating <= 10) {
      return rating.toFixed(1);
    }
    return (rating / 2).toFixed(1); 
  };

  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const rating = getRating();
  const year = getReleaseYear();
  const runtime = getRuntime();

  const convertToShow = (content: ContentItem): any => {
    const baseShow = {
      id: content.id,
      title: content.title,
      poster: content.poster,
      backdrop: content.backdrop,
      genre: content.genre,
      imdbId: content.imdbId,
      type: content.type
    };

    if (content.type !== 'movie') {
      const tvContent = content as TVContent;
      return {
        ...baseShow,
        year: tvContent.year,
        endYear: tvContent.endYear,
        tvmazeId: tvContent.tvmazeId,
        plot: tvContent.plot,
        runtime: tvContent.runtime,
        userRating: tvContent.userRating,
        criticRating: tvContent.criticRating,
        networkNames: tvContent.networkNames,
        seasonCount: tvContent.seasonCount,
        episodeCount: tvContent.episodeCount,
        status: tvContent.status,
        officialSite: tvContent.officialSite,
        schedule: tvContent.schedule,
        isFavorite: tvContent.isFavorite,
        userPersonalRating: tvContent.userPersonalRating,
        watchProgress: tvContent.watchProgress,
        isCompleted: tvContent.isCompleted,
        releaseDate: content.releaseDate
      };
    }
    
    const movieContent = content as MovieContent;
    return {
      ...baseShow,
      networkNames: movieContent.networkNames,
      seasonCount: movieContent.seasonCount,
      episodeCount: movieContent.episodeCount,
      status: movieContent.status,
      officialSite: movieContent.officialSite,
      tvmazeId: movieContent.tvmazeId,
      releaseDate: content.releaseDate
    };
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`group cursor-pointer min-w-[180px] md:min-w-[200px] transform transition-all duration-300 hover:scale-110 hover:z-10 relative ${className}`}
      >
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          {isLoading && (
            <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Loading...
            </div>
          )}

          {enrichedContent.poster && !imageLoaded && !imageError && (
            <div className="w-full h-[270px] md:h-[300px] bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {(!enrichedContent.poster || imageError) && (
            <div className="w-full h-[270px] md:h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-gray-700">
              <div className="w-16 h-16 mb-3 text-gray-500 flex items-center justify-center">
                {getTypeIcon()}
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-white mb-1">
                  {enrichedContent.title || 'Unknown Content'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{enrichedContent.type}</p>
                {enrichedContent.type === 'movie' && 'director' in enrichedContent && enrichedContent.director && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dir: {enrichedContent.director}
                  </p>
                )}
                {'networkNames' in enrichedContent && enrichedContent.networkNames && (
                  <p className="text-xs text-gray-500 mt-1">
                    {enrichedContent.networkNames.join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-500">No image available</p>
              </div>
            </div>
          )}

          {enrichedContent.poster && !imageError && (
            <img
              src={enrichedContent.poster}
              alt={enrichedContent.title || 'Content poster'}
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

          {'watchProgress' in enrichedContent && enrichedContent.watchProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50">
              <div 
                className="h-1 bg-blue-500"
                style={{ width: `${enrichedContent.watchProgress}%` }}
              />
            </div>
          )}

          {'status' in enrichedContent && enrichedContent.status && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
              {enrichedContent.status}
            </div>
          )}

          {enrichedContent.type === 'movie' && 'awards' in enrichedContent && enrichedContent.awards && enrichedContent.awards.length > 0 && (
            <div className="absolute top-8 left-2 bg-gold-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
              🏆 Awards
            </div>
          )}
        </div>

        {(!enrichedContent.poster || imageError) && (
          <div className="mt-2">
            <h3 className="text-white font-semibold text-sm mb-1 truncate">
              {enrichedContent.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-300">
              {year && (
                <span>{year}</span>
              )}
              {rating && (
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{formatRating(rating)}</span>
                </div>
              )}
            </div>
            {enrichedContent.type === 'movie' && 'director' in enrichedContent && enrichedContent.director && (
              <div className="text-xs text-gray-400 mt-1">
                Dir: {enrichedContent.director}
              </div>
            )}
            {'seasonCount' in enrichedContent && enrichedContent.seasonCount && (
              <div className="text-xs text-gray-400 mt-1">
                {enrichedContent.seasonCount} Season{enrichedContent.seasonCount !== 1 ? 's' : ''}
                {enrichedContent.episodeCount && ` • ${enrichedContent.episodeCount} Episodes`}
              </div>
            )}
            {'networkNames' in enrichedContent && enrichedContent.networkNames && (
              <div className="text-xs text-gray-400 mt-1">
                {enrichedContent.networkNames.join(', ')}
              </div>
            )}
          </div>
        )}

        {enrichedContent.poster && !imageError && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-all duration-300 rounded-b-lg">
            <h3 className="text-white font-semibold text-sm mb-1 truncate">
              {enrichedContent.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-300">
              {year && (
                <span>{year}</span>
              )}
              {rating && (
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{formatRating(rating)}</span>
                </div>
              )}
            </div>
            {enrichedContent.type === 'movie' && 'director' in enrichedContent && enrichedContent.director && (
              <div className="text-xs text-gray-400 mt-1">
                Dir: {enrichedContent.director}
              </div>
            )}
            {'seasonCount' in enrichedContent && enrichedContent.seasonCount && (
              <div className="text-xs text-gray-400 mt-1">
                {enrichedContent.seasonCount} Season{enrichedContent.seasonCount !== 1 ? 's' : ''}
                {enrichedContent.episodeCount && ` • ${enrichedContent.episodeCount} Episodes`}
              </div>
            )}
            {'networkNames' in enrichedContent && enrichedContent.networkNames && (
              <div className="text-xs text-gray-400 mt-1">
                {enrichedContent.networkNames.join(', ')}
              </div>
            )}
            {runtime && (
              <div className="text-xs text-gray-400 mt-1">
                {runtime}m
              </div>
            )}
          </div>
        )}

        <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black opacity-0 group-hover:opacity-30 blur-md transition-all duration-300 rounded-lg"></div>

        {'isFavorite' in enrichedContent && enrichedContent.isFavorite && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 rounded-full p-1">
            <Star className="w-4 h-4 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      {enrichedContent.type === 'movie' && open && id === enrichedContent.id && (
        <WatchMovies
          isOpen={open}
          onClose={() => dispatch(setOpen(false))}
          movieId={enrichedContent.id}
          posterPath={enrichedContent.poster}
          title={enrichedContent.title}
          rating={rating}
          releaseDate={enrichedContent.releaseDate}
          totalDuration={runtime}
          genre={enrichedContent.genre}
        />
      )}

      {(enrichedContent.type === 'tv' || enrichedContent.type === 'tv_series' || enrichedContent.type === 'documentary') && isWatchSeriesOpen && (
        <WatchSeries
          isOpen={isWatchSeriesOpen}
          onClose={handleCloseWatchSeries}
          show={convertToShow(enrichedContent)}
        />
      )}
    </>
  );
};

export default ContentCard;