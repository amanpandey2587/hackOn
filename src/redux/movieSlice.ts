import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
}

interface CacheInfo {
  lastFetched: number;
  isLoading: boolean;
}

interface MovieState {
  nowPlayingMovies: Movie[] | null;
  popularMovies: Movie[] | null;
  topRatedMovies: Movie[] | null;
  upcomingMovies: Movie[] | null;
  toggle: boolean;
  trailerMovie: any | null;
  open: boolean;
  id: string;
  selectedMovie:Movie|null,
  cache: {
    nowPlaying: CacheInfo;
    popular: CacheInfo;
    topRated: CacheInfo;
    upcoming: CacheInfo;
  };
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
  selectedMovie:null,
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

const CACHE_DURATION = 300 * 60 * 1000;

const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
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

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
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

    clearCache: (state) => {
      state.cache = {
        nowPlaying: { lastFetched: 0, isLoading: false },
        popular: { lastFetched: 0, isLoading: false },
        topRated: { lastFetched: 0, isLoading: false },
        upcoming: { lastFetched: 0, isLoading: false },
      };
    },

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
    },
    setSelectedMovie: (state, action: PayloadAction<Movie>) => {
         state.selectedMovie = action.payload;
    },
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
  getId,
  setSelectedMovie
} = movieSlice.actions;

export default movieSlice.reducer;

export const shouldFetchData = (lastFetched: number, isLoading: boolean, data: any) => {
  const now = Date.now();
  return !isLoading && (!data || (now - lastFetched > CACHE_DURATION));
};

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