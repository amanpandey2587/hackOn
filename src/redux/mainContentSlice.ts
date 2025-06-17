
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  MainContentState, 
  ContentItem, 
  DetailedContentItem, 
  FetchContentPayload,
  ApiResponse 
} from '../types/streaming';

const API_BASE_URL = 'https://api.watchmode.com/v1';
const API_KEY = import.meta.env.WATCHMODE_API_KEY || 'WNb5hBgHIXGSoFkOdVm2lLpV9I8wOPoPvaxlWF9i';

const initialState: MainContentState = {
  content: [],
  loading: false,
  error: null,
  fromCache: false,
  lastFetch: null,
  detailedItems: {}
};

export const fetchStreamingContent = createAsyncThunk<
  { items: ContentItem[], fromCache: boolean },
  FetchContentPayload,
  { rejectValue: string }
>(
  'mainContent/fetchStreamingContent',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { sourceIds, type, sortBy, limit } = payload;
      const state = getState() as { mainContent: MainContentState };
      
      const now = Date.now();
      const lastFetch = state.mainContent.lastFetch;
      const hasRecentCache = lastFetch && (now - lastFetch) < 18000000; 
      
      if (hasRecentCache && state.mainContent.content.length > 0) {
        return {
          items: state.mainContent.content,
          fromCache: true
        };
      }

      const url = `${API_BASE_URL}/list-titles/?` + 
        `apiKey=${API_KEY}&` +
        `source_ids=${sourceIds}&` +
        `type=${type}&` +
        `sort_by=${sortBy}&` +
        `limit=${limit}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.titles || !Array.isArray(data.titles)) {
        throw new Error('Invalid API response format');
      }

      return {
        items: data.titles as ContentItem[],
        fromCache: false
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

export const fetchContentDetails = createAsyncThunk<
  DetailedContentItem,
  number,
  { rejectValue: string }
>(
  'mainContent/fetchContentDetails',
  async (titleId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { mainContent: MainContentState };
      
      if (state.mainContent.detailedItems[titleId]) {
        return state.mainContent.detailedItems[titleId];
      }

      const url = `${API_BASE_URL}/title/${titleId}/details/?apiKey=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as DetailedContentItem;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch content details'
      );
    }
  }
);

export const fetchBatchContentDetails = createAsyncThunk<
  DetailedContentItem[],
  number[],
  { rejectValue: string }
>(
  'mainContent/fetchBatchContentDetails',
  async (titleIds, { dispatch, rejectWithValue }) => {
    try {
      const promises = titleIds.map(id => dispatch(fetchContentDetails(id)));
      const results = await Promise.allSettled(promises);
      
      const detailedItems: DetailedContentItem[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.payload) {
          detailedItems.push(result.value.payload as DetailedContentItem);
        }
      });
      
      return detailedItems;
    } catch (error) {
      return rejectWithValue('Failed to fetch batch content details');
    }
  }
);

const mainContentSlice = createSlice({
  name: 'mainContent',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.content = [];
      state.lastFetch = null;
      state.fromCache = false;
      state.detailedItems = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    updateContentItem: (state, action: PayloadAction<DetailedContentItem>) => {
      const index = state.content.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.content[index] = { ...state.content[index], ...action.payload };
      }
      state.detailedItems[action.payload.id] = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreamingContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreamingContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.items as DetailedContentItem[];
        state.fromCache = action.payload.fromCache;
        state.lastFetch = action.payload.fromCache ? state.lastFetch : Date.now();
        state.error = null;
      })
      .addCase(fetchStreamingContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch content';
        state.fromCache = false;
      })
      
      .addCase(fetchContentDetails.fulfilled, (state, action) => {
        const detailedItem = action.payload;
        state.detailedItems[detailedItem.id] = detailedItem;
        
        const index = state.content.findIndex(item => item.id === detailedItem.id);
        if (index !== -1) {
          state.content[index] = { ...state.content[index], ...detailedItem };
        }
      })
      .addCase(fetchContentDetails.rejected, (state, action) => {
        console.warn('Failed to fetch content details:', action.payload);
      })
      
      .addCase(fetchBatchContentDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBatchContentDetails.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(detailedItem => {
          state.detailedItems[detailedItem.id] = detailedItem;
          
          const index = state.content.findIndex(item => item.id === detailedItem.id);
          if (index !== -1) {
            state.content[index] = { ...state.content[index], ...detailedItem };
          }
        });
      })
      .addCase(fetchBatchContentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch batch content details';
      });
  }
});

export const { clearCache, clearError, updateContentItem, setLoading } = mainContentSlice.actions;
export default mainContentSlice.reducer;