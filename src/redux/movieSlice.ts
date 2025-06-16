import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the Movie interface
interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

// Cache interface for tracking fetch timestamps
interface CacheInfo {
  lastFetched: number;
  isLoading: boolean;
}

// Define the state interface
interface MovieState {
  nowPlayingMovies: Movie[] | null;
  popularMovies: Movie[] | null;
  topRatedMovies: Movie[] | null;
  upcomingMovies: Movie[] | null;
  toggle: boolean;
  trailerMovie: any | null;
  open: boolean;
  id: string;
  // Caching states
  cache: {
    nowPlaying: CacheInfo;
    popular: CacheInfo;
    topRated: CacheInfo;
    upcoming: CacheInfo;
  };
  // Loading states
  loading: {
    nowPlaying: boolean;
    popular: boolean;
    topRated: boolean;
    upcoming: boolean;
  };
  error: string | null;
}

const initialState: MovieState = {
  nowPlayingMovies: null,
  popularMovies: null,
  topRatedMovies: null,
  upcomingMovies: null,
  toggle: false,
  trailerMovie: null,
  open: false,
  id: "",
  cache: {
    nowPlaying: { lastFetched: 0, isLoading: false },
    popular: { lastFetched: 0, isLoading: false },
    topRated: { lastFetched: 0, isLoading: false },
    upcoming: { lastFetched: 0, isLoading: false },
  },
  loading: {
    nowPlaying: false,
    popular: false,
    topRated: false,
    upcoming: false,
  },
  error: null,
};

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    // Loading states
    setNowPlayingLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.nowPlaying = action.payload;
      state.cache.nowPlaying.isLoading = action.payload;
    },
    
    setPopularLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.popular = action.payload;
      state.cache.popular.isLoading = action.payload;
    },
    
    setTopRatedLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.topRated = action.payload;
      state.cache.topRated.isLoading = action.payload;
    },
    
    setUpcomingLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.upcoming = action.payload;
      state.cache.upcoming.isLoading = action.payload;
    },

    // Data setters with cache update
    getNowPlayingMovies: (state, action: PayloadAction<Movie[]>) => {
      state.nowPlayingMovies = action.payload;
      state.cache.nowPlaying.lastFetched = Date.now();
      state.cache.nowPlaying.isLoading = false;
      state.loading.nowPlaying = false;
      state.error = null;
    },
    
    getPopularMovies: (state, action: PayloadAction<Movie[]>) => {
      state.popularMovies = action.payload;
      state.cache.popular.lastFetched = Date.now();
      state.cache.popular.isLoading = false;
      state.loading.popular = false;
      state.error = null;
    },
    
    getTopRatedMovies: (state, action: PayloadAction<Movie[]>) => {
      state.topRatedMovies = action.payload;
      state.cache.topRated.lastFetched = Date.now();
      state.cache.topRated.isLoading = false;
      state.loading.topRated = false;
      state.error = null;
    },
    
    getUpcomingMovies: (state, action: PayloadAction<Movie[]>) => {
      state.upcomingMovies = action.payload;
      state.cache.upcoming.lastFetched = Date.now();
      state.cache.upcoming.isLoading = false;
      state.loading.upcoming = false;
      state.error = null;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      // Reset all loading states on error
      state.loading = {
        nowPlaying: false,
        popular: false,
        topRated: false,
        upcoming: false,
      };
      state.cache.nowPlaying.isLoading = false;
      state.cache.popular.isLoading = false;
      state.cache.topRated.isLoading = false;
      state.cache.upcoming.isLoading = false;
    },

    // Clear cache (useful for force refresh)
    clearCache: (state) => {
      state.cache = {
        nowPlaying: { lastFetched: 0, isLoading: false },
        popular: { lastFetched: 0, isLoading: false },
        topRated: { lastFetched: 0, isLoading: false },
        upcoming: { lastFetched: 0, isLoading: false },
      };
    },

    // Existing reducers
    setToggle: (state) => {
      state.toggle = !state.toggle;
    },
    
    getTrailerMovie: (state, action: PayloadAction<any>) => {
      state.trailerMovie = action.payload;
    },
    
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    
    getId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    }
  }
});

export const {
  setNowPlayingLoading,
  setPopularLoading,
  setTopRatedLoading,
  setUpcomingLoading,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  setError,
  clearCache,
  setToggle,
  getTrailerMovie,
  setOpen,
  getId
} = movieSlice.actions;

export default movieSlice.reducer;

// Helper function to check if data should be fetched
export const shouldFetchData = (lastFetched: number, isLoading: boolean, data: any) => {
  const now = Date.now();
  return !isLoading && (!data || (now - lastFetched > CACHE_DURATION));
};

// Specific helper functions for each data type
export const shouldFetchNowPlaying = (state: MovieState) => {
  return shouldFetchData(
    state.cache.nowPlaying.lastFetched,
    state.cache.nowPlaying.isLoading,
    state.nowPlayingMovies
  );
};

export const shouldFetchPopular = (state: MovieState) => {
  return shouldFetchData(
    state.cache.popular.lastFetched,
    state.cache.popular.isLoading,
    state.popularMovies
  );
};

export const shouldFetchTopRated = (state: MovieState) => {
  return shouldFetchData(
    state.cache.topRated.lastFetched,
    state.cache.topRated.isLoading,
    state.topRatedMovies
  );
};

export const shouldFetchUpcoming = (state: MovieState) => {
  return shouldFetchData(
    state.cache.upcoming.lastFetched,
    state.cache.upcoming.isLoading,
    state.upcomingMovies
  );
};