// types/watchlist.ts

export interface WatchlistItem {
    _id: string;
    id: string;
    userId: string;
    contentId: string;
    contentType: 'movie' | 'series' | 'documentary';
    title: string;
    priority: 1 | 2 | 3 | 4 | 5;
    genre: string[];
    estimatedDuration?: number;
    addedAt: string;
    watchStatus?: {
      watchPercentage: number;
      completed: boolean;
      watchedAt: string;
    };
  }
  
  export interface WatchlistResponse {
    success: boolean;
    data: WatchlistItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    message?: string;
  }
  
  export interface WatchlistStatistics {
    overview: {
      totalItems: number;
      totalEstimatedDuration: number;
      averagePriority: number;
    };
    genreDistribution: Array<{
      _id: string;
      count: number;
    }>;
    contentTypeDistribution: Array<{
      _id: string;
      count: number;
    }>;
    priorityDistribution: Array<{
      _id: number;
      count: number;
    }>;
  }
  
  export interface AddToWatchlistRequest {
    contentId: string;
    contentType: 'movie' | 'series' | 'documentary';
    title: string;
    priority?: number;
    genre?: string[];
    estimatedDuration?: number;
  }
  
  export interface UpdateWatchlistRequest {
    priority?: number;
    genre?: string[];
    estimatedDuration?: number;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  }
  
  export interface WatchlistFilters {
    page?: number;
    limit?: number;
    sortBy?: 'addedAt' | 'priority' | 'title' | 'estimatedDuration';
    sortOrder?: 'asc' | 'desc';
    contentType?: 'movie' | 'series' | 'documentary';
    genre?: string;
    priority?: number;
    includeWatched?: boolean;
  }
  
  export interface NextToWatchResponse {
    success: boolean;
    data: WatchlistItem[];
    message: string;
  }
  
  // Utility types for component props
  export interface BaseWatchlistProps {
    className?: string;
    onError?: (error: string) => void;
    onSuccess?: (message?: string) => void;
  }
  
  export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  
  // Content types for the add button
  export interface ContentItem {
    contentId: string;
    contentType: 'movie' | 'series' | 'documentary';
    title: string;
    genre?: string[];
    estimatedDuration?: number;
    description?: string;
    releaseYear?: number;
    rating?: number;
    poster?: string;
  }
  
  // Priority levels with descriptions
  export const PRIORITY_LEVELS = {
    1: { label: 'Later', color: 'gray', description: 'Watch when you have nothing else' },
    2: { label: 'Low', color: 'blue', description: 'Might be interesting' },
    3: { label: 'Medium', color: 'yellow', description: 'Should watch soon' },
    4: { label: 'High', color: 'orange', description: 'Really want to see this' },
    5: { label: 'Urgent', color: 'red', description: 'Must watch ASAP' }
  } as const;
  
  // Content type configurations
  export const CONTENT_TYPES = {
    movie: { label: 'Movie', icon: '🎬', color: 'blue' },
    series: { label: 'Series', icon: '📺', color: 'green' },
    documentary: { label: 'Documentary', icon: '📽️', color: 'purple' }
  } as const;
  
  // Common genre list
  export const COMMON_GENRES = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 
    'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 
    'War', 'Western'
  ] as const;
  
  export type Genre = typeof COMMON_GENRES[number];
  export type ContentType = keyof typeof CONTENT_TYPES;
  export type Priority = keyof typeof PRIORITY_LEVELS;