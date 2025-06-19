import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { PayloadAction } from '@reduxjs/toolkit';
interface Show {
  id: string;
  title: string;
  plot?: string;
  genre?: string[];
  year?: number;
  userRating?: number;
  criticRating?: number;
  isFavorite?: boolean;
  watchedEpisodes?: string[];
  episodeCount?: number;
  watchProgress?: number;
  isCompleted?: boolean;
  userPersonalRating?: number;
}

interface Filters {
  genre: string;
  year: string;
  rating: string;
  searchQuery: string;
}

interface NetflixTVState {
  shows: Show[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  totalResults: number;
  currentPage: number;
  filters: Filters;
  sortBy: string;
}

const initialState: NetflixTVState = {
  shows: [],
  loading: false,
  error: null,
  lastFetched: null,
  totalResults: 0,
  currentPage: 1,
  filters: {
    genre: '',
    year: '',
    rating: '',
    searchQuery: ''
  },
  sortBy: 'popularity_desc'
};

const netflixTVSlice = createSlice({
  name: 'netflixTV',
  initialState,
  reducers: {
    fetchNetflixTVShowsStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchNetflixTVShowsSuccess: (state, action: PayloadAction<{
      shows: Show[];
      totalResults: number;
      currentPage: number;
      lastFetched: number;
    }>) => {
      const { shows, totalResults, currentPage, lastFetched } = action.payload;
      state.loading = false;
      state.shows = shows;
      state.totalResults = totalResults;
      state.currentPage = currentPage;
      state.lastFetched = lastFetched;
      state.error = null;
    },

    fetchNetflixTVShowsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    loadMoreNetflixTVShowsSuccess: (state, action: PayloadAction<{
      shows: Show[];
      currentPage: number;
    }>) => {
      const { shows, currentPage } = action.payload;
      state.shows = [...state.shows, ...shows];
      state.currentPage = currentPage;
      state.loading = false;
    },

    clearNetflixTVShows: (state) => {
      state.shows = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
      state.totalResults = 0;
      state.currentPage = 1;
    },

    setGenreFilter: (state, action: PayloadAction<string>) => {
      state.filters.genre = action.payload;
    },

    setYearFilter: (state, action: PayloadAction<string>) => {
      state.filters.year = action.payload;
    },

    setRatingFilter: (state, action: PayloadAction<string>) => {
      state.filters.rating = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },

    clearFilters: (state) => {
      state.filters = {
        genre: '',
        year: '',
        rating: '',
        searchQuery: ''
      };
    },

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },

    updateShow: (state, action: PayloadAction<{ id: string; updates: Partial<Show> }>) => {
      const { id, updates } = action.payload;
      const showIndex = state.shows.findIndex(show => show.id === id);
      if (showIndex !== -1) {
        state.shows[showIndex] = { ...state.shows[showIndex], ...updates };
      }
    },

    toggleShowFavorite: (state, action: PayloadAction<string>) => {
      const showId = action.payload;
      const show = state.shows.find(show => show.id === showId);
      if (show) {
        show.isFavorite = !show.isFavorite;
      }
    },

    markAsWatched: (state, action: PayloadAction<{
      showId: string;
      episodeId?: string | null;
      seasonNumber?: number | null;
    }>) => {
      const { showId, episodeId = null } = action.payload;
      const show = state.shows.find(show => show.id === showId);
      if (show) {
        if (!show.watchedEpisodes) {
          show.watchedEpisodes = [];
        }

        if (episodeId && !show.watchedEpisodes.includes(episodeId)) {
          show.watchedEpisodes.push(episodeId);
        }

        if (show.episodeCount && show.watchedEpisodes.length > 0) {
          show.watchProgress = Math.round((show.watchedEpisodes.length / show.episodeCount) * 100);
          show.isCompleted = show.watchedEpisodes.length === show.episodeCount;
        }
      }
    },

    setShowRating: (state, action: PayloadAction<{
      showId: string;
      rating: number;
    }>) => {
      const { showId, rating } = action.payload;
      const show = state.shows.find(show => show.id === showId);
      if (show) {
        show.userPersonalRating = rating;
      }
    }
  }
});

export const {
  fetchNetflixTVShowsStart,
  fetchNetflixTVShowsSuccess,
  fetchNetflixTVShowsFailure,
  loadMoreNetflixTVShowsSuccess,
  clearNetflixTVShows,
  setGenreFilter,
  setYearFilter,
  setRatingFilter,
  setSearchQuery,
  clearFilters,
  setSortBy,
  updateShow,
  toggleShowFavorite,
  markAsWatched,
  setShowRating
} = netflixTVSlice.actions;

export const selectNetflixTVShows = (state: RootState) => state.netflixTV.shows;
export const selectNetflixTVLoading = (state: RootState) => state.netflixTV.loading;
export const selectNetflixTVError = (state: RootState) => state.netflixTV.error;
export const selectNetflixTVFilters = (state: RootState) => state.netflixTV.filters;
export const selectNetflixTVTotalResults = (state: RootState) => state.netflixTV.totalResults;
export const selectNetflixTVCurrentPage = (state: RootState) => state.netflixTV.currentPage;

export const selectFilteredNetflixTVShows = (state: RootState): Show[] => {
  const { shows, filters } = state.netflixTV;
  let filtered = shows;

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(show =>
      show.title.toLowerCase().includes(query) ||
      show.plot?.toLowerCase().includes(query) ||
      show.genre?.some(g => g.toLowerCase().includes(query))
    );
  }

  if (filters.genre) {
    filtered = filtered.filter(show =>
      show.genre?.some(g => g.toLowerCase() === filters.genre.toLowerCase())
    );
  }

  if (filters.year) {
    filtered = filtered.filter(show => show.year === parseInt(filters.year));
  }

  if (filters.rating) {
    const minRating = parseFloat(filters.rating);
    filtered = filtered.filter(show =>
      (show.userRating && show.userRating >= minRating) ||
      (show.criticRating && show.criticRating >= minRating)
    );
  }

  return filtered;
};

export const selectFavoriteNetflixTVShows = (state: RootState): Show[] =>
  state.netflixTV.shows.filter(show => show.isFavorite);

export const selectWatchedNetflixTVShows = (state: RootState): Show[] =>
  state.netflixTV.shows.filter(show => show.isCompleted);

export const selectNetflixTVShowsByGenre = (state: RootState, genre: string): Show[] =>
  state.netflixTV.shows.filter(show =>
    show.genre?.some(g => g.toLowerCase() === genre.toLowerCase())
  );

export default netflixTVSlice.reducer;
