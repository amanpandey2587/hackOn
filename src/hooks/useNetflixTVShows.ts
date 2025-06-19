import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNetflixTVShowsStart, 
  fetchNetflixTVShowsSuccess, 
  fetchNetflixTVShowsFailure,
  clearNetflixTVShows 
} from '../redux/netflixTVSlice';
import type { RootState, AppDispatch } from '../redux/index';
import { store } from '@/redux/store';

const CACHE_DURATION = 300 * 60 * 1000; 

interface Options {
  page?: number;
  limit?: number;
  genre?: string;
  sortBy?: string;
  forceRefresh?: boolean;
}

interface Show {
  id: string;
  title: string;
  year?: number;
  imdbId?: string;
  tvmazeId?: number;
  tmdbId?: number;
  tmdbType?: string;
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
  trailer?: string;
  originalLanguage?: string;
  relevancePercentile?: number;
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

export const useNetflixTVShows = (options: Options = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    shows, 
    loading, 
    error, 
    lastFetched,
    totalResults,
    currentPage 
  } = useSelector((state: RootState) => state.netflixTV || {
    shows: [],
    loading: false,
    error: null,
    lastFetched: null,
    totalResults: 0,
    currentPage: 1
  });
  
  const [localLoading, setLocalLoading] = useState(false);
  const hasInitialized = useRef(false);
  const lastSortBy = useRef<string>('');

  const {
    page = 1,
    limit = 20,
    genre = '',
    sortBy = 'popularity_desc',
    forceRefresh = false
  } = options;

  const isCacheValid = useCallback(() => {
    if (!lastFetched) return false;
    const now = Date.now();
    return (now - lastFetched) < CACHE_DURATION;
  }, [lastFetched]);

  const getPopularShows = async (pageNum: number, limitNum: number) => {
    const TVMAZE_BASE_URL = "https://api.tvmaze.com";
    
    try {
      const startId = (pageNum - 1) * limitNum + 1;
      const endId = startId + limitNum * 2; 
      
      const showPromises = [];
      for (let id = startId; id < endId; id++) {
        showPromises.push(
          fetch(`${TVMAZE_BASE_URL}/shows/${id}`)
            .then(response => response.ok ? response.json() : null)
            .catch(() => null)
        );
      }

      const allShows = await Promise.all(showPromises);
      
      let validShows = allShows.filter(show => 
        show && 
        show.image && 
        show.summary && 
        show.genres && 
        show.genres.length > 0 &&
        show.rating && 
        show.rating.average > 6 
      );

      if (genre) {
        validShows = validShows.filter(show => 
          show.genres.some((g: string) => g.toLowerCase().includes(genre.toLowerCase()))
        );
      }

      validShows.sort((a, b) => {
        switch (sortBy) {
          case 'popularity_desc':
            return (b.rating?.average || 0) - (a.rating?.average || 0);
          case 'popularity_asc':
            return (a.rating?.average || 0) - (b.rating?.average || 0);
          case 'release_date_desc':
            return new Date(b.premiered || 0).getTime() - new Date(a.premiered || 0).getTime();
          case 'release_date_asc':
            return new Date(a.premiered || 0).getTime() - new Date(b.premiered || 0).getTime();
          case 'title_asc':
            return a.name.localeCompare(b.name);
          case 'title_desc':
            return b.name.localeCompare(a.name);
          case 'user_rating_desc':
            return (b.rating?.average || 0) - (a.rating?.average || 0);
          case 'user_rating_asc':
            return (a.rating?.average || 0) - (b.rating?.average || 0);
          default:
            return (b.rating?.average || 0) - (a.rating?.average || 0);
        }
      });

      return validShows.slice(0, limitNum);
    } catch (error) {
      console.error('Error fetching popular shows:', error);
      throw error;
    }
  };

  const transformTVMazeShow = (show: any): Show => {
    return {
      id: show.id.toString(),
      title: show.name,
      year: show.premiered ? new Date(show.premiered).getFullYear() : undefined,
      imdbId: show.externals?.imdb,
      tvmazeId: show.id,
      type: show.type || 'Scripted',
      poster: show.image?.medium || show.image?.original,
      backdrop: show.image?.original,
      plot: show.summary ? show.summary.replace(/<[^>]*>/g, '') : undefined,
      runtime: show.runtime || show.averageRuntime,
      genre: show.genres || [],
      userRating: show.rating?.average ? Math.round(show.rating.average * 10) : undefined,
      criticRating: show.rating?.average ? Math.round(show.rating.average * 10) : undefined,
      releaseDate: show.premiered,
      networkNames: show.network ? [show.network.name] : show.webChannel ? [show.webChannel.name] : [],
      status: show.status,
      endYear: show.ended ? new Date(show.ended).getFullYear() : undefined,
      originalLanguage: show.language,
      officialSite: show.officialSite,
      schedule: show.schedule ? {
        time: show.schedule.time,
        days: show.schedule.days
      } : undefined,
      seasonCount: undefined,
      episodeCount: undefined
    };
  };

  const fetchNetflixTVShows = useCallback(async (pageNum = 1, limitNum = 20) => {
    if (!forceRefresh && isCacheValid() && pageNum === 1) {
      const currentShows = store.getState().netflixTV?.shows || [];
      if (currentShows.length > 0) {
        console.log('Using cached TV shows data');
        return;
      }
    }

    setLocalLoading(true);
    dispatch(fetchNetflixTVShowsStart());

    try {
      console.log(`Fetching popular shows for page ${pageNum}...`);
      
      const popularShows = await getPopularShows(pageNum, limitNum);
      
      const transformedShows = popularShows.map(transformTVMazeShow);

      console.log(`Found ${transformedShows.length} shows for page ${pageNum}`);

      const currentState = store.getState().netflixTV;
      const currentShows = currentState?.shows || [];
      const finalShows = pageNum === 1 ? transformedShows : [...currentShows, ...transformedShows];

      dispatch(fetchNetflixTVShowsSuccess({
        shows: finalShows,
        totalResults: 1000,
        currentPage: pageNum,
        lastFetched: Date.now()
      }));

      const cacheKey = genre ? `tvShows_${genre}_${sortBy}` : `tvShows_${sortBy}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        shows: finalShows,
        lastFetched: Date.now(),
        totalResults: 1000,
        currentPage: pageNum,
        genre,
        sortBy
      }));

    } catch (error: any) {
      console.error('Error fetching TV shows:', error);
      dispatch(fetchNetflixTVShowsFailure(error.message));
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, genre, sortBy, forceRefresh, isCacheValid]);

  const loadMore = useCallback(() => {
    if (!loading && !localLoading) {
      fetchNetflixTVShows(currentPage + 1, limit);
    }
  }, [fetchNetflixTVShows, currentPage, limit, loading, localLoading]);

  const refreshShows = useCallback(() => {
    dispatch(clearNetflixTVShows());
    ['tvShows', 'tvShows_drama', 'tvShows_comedy', 'tvShows_action'].forEach(key => {
      localStorage.removeItem(key);
    });
    fetchNetflixTVShows(1, limit);
  }, [dispatch, fetchNetflixTVShows, limit]);

  const getShowById = useCallback((showId: string) => {
    return shows.find(show => show.id === showId);
  }, [shows]);

  const searchShows = useCallback((query: string) => {
    if (!query.trim()) return shows;

    const lowerQuery = query.toLowerCase();
    return shows.filter(show => 
      show.title.toLowerCase().includes(lowerQuery) ||
      show.genre?.some(g => g.toLowerCase().includes(lowerQuery)) ||
      show.plot?.toLowerCase().includes(lowerQuery)
    );
  }, [shows]);

  const filterByGenre = useCallback((genreFilter: string) => {
    if (!genreFilter) return shows;
    return shows.filter(show => 
      show.genre?.some(g => g.toLowerCase() === genreFilter.toLowerCase())
    );
  }, [shows]);

  const filterByYear = useCallback((year: string) => {
    if (!year) return shows;
    return shows.filter(show => show.year === parseInt(year));
  }, [shows]);

  useEffect(() => {
    if (lastSortBy.current !== sortBy && lastSortBy.current !== '') {
      lastSortBy.current = sortBy;
      dispatch(clearNetflixTVShows());
      fetchNetflixTVShows(1, limit);
    } else {
      lastSortBy.current = sortBy;
    }
  }, [sortBy, dispatch, fetchNetflixTVShows, limit]);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    
    const cacheKey = genre ? `tvShows_${genre}_${sortBy}` : `tvShows_${sortBy}`;
    const cachedData = localStorage.getItem(cacheKey);
    let shouldFetch = true;
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        const now = Date.now();
        
        if ((now - parsedData.lastFetched) < CACHE_DURATION && 
            parsedData.genre === genre && 
            parsedData.sortBy === sortBy) {
          dispatch(fetchNetflixTVShowsSuccess(parsedData));
          shouldFetch = false;
          console.log('Loaded from cache:', cacheKey);
        }
      } catch (error) {
        console.error('Error loading from cache:', error);
      }
    }
    
    if (shouldFetch) {
      fetchNetflixTVShows(page, limit);
    }
  }, []); 

  return {
    shows,
    totalResults,
    currentPage,

    loading: loading || localLoading,
    error,

    hasMore: shows.length < totalResults,
    isEmpty: shows.length === 0 && !loading && !localLoading,

    fetchShows: fetchNetflixTVShows,
    loadMore,
    refreshShows,
    clearShows: () => dispatch(clearNetflixTVShows()),

    getShowById,
    searchShows,
    filterByGenre,
    filterByYear,

    isCacheValid: isCacheValid(),
    lastFetched: lastFetched ? new Date(lastFetched).toLocaleString() : null
  };
};

export const useShowDetails = (showId: string) => {
  const [detailedShow, setDetailedShow] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShowDetails = useCallback(async (tvmazeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const TVMAZE_BASE_URL = "https://api.tvmaze.com";
      
      const showResponse = await fetch(`${TVMAZE_BASE_URL}/shows/${tvmazeId}`);
      if (!showResponse.ok) throw new Error('Failed to fetch show details');
      const showData = await showResponse.json();

      const episodesResponse = await fetch(`${TVMAZE_BASE_URL}/shows/${tvmazeId}/episodes`);
      if (!episodesResponse.ok) throw new Error('Failed to fetch episodes');
      const episodesData = await episodesResponse.json();

      const seasonMap = new Map();
      episodesData.forEach((episode: any) => {
        if (!seasonMap.has(episode.season)) {
          seasonMap.set(episode.season, {
            number: episode.season,
            episodes: [],
            episodeCount: 0,
            name: `Season ${episode.season}`,
            poster: episode.image?.medium || episode.image?.original,
            premiered: null,
            ended: null
          });
        }
        seasonMap.get(episode.season).episodes.push(episode);
        seasonMap.get(episode.season).episodeCount++;
      });

      const seasonsArray = Array.from(seasonMap.values()).sort((a, b) => a.number - b.number);

      seasonsArray.forEach(season => {
        const seasonEpisodes = season.episodes.sort((a: any, b: any) => a.number - b.number);
        season.premiered = seasonEpisodes[0]?.airdate;
        season.ended = seasonEpisodes[seasonEpisodes.length - 1]?.airdate;
      });

      setDetailedShow(showData);
      setSeasons(seasonsArray);
      setEpisodes(episodesData);

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching show details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showId) {
      fetchShowDetails(showId);
    }
  }, [showId, fetchShowDetails]);

  return {
    detailedShow,
    seasons,
    episodes,
    loading,
    error,
    refetch: () => fetchShowDetails(showId)
  };
};