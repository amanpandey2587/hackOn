export interface WatchlistItem {
    movieId: string;
    addedAt: Date;
  }
  
  export interface WatchHistoryItem {
    movieId: string;
    watchedAt: Date;
    progress: number; 
  }
  
  export interface NetflixUser {
    _id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    createdAt: Date;
    lastActive: Date;
    subscription: 'basic' | 'standard' | 'premium';
    watchlist: WatchlistItem[];
    watchHistory: WatchHistoryItem[];
  }
  
  export interface ApiResponse<T> {
    message: string;
    data: T;
    isNewUser?: boolean;
  }
  
  export interface ApiError {
    message: string;
    error?: string;
  }
  
  export interface Movie {
    id: string;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
  }
  
  export interface TVShow {
    id: string;
    name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    vote_average: number;
    genre_ids: number[];
  }