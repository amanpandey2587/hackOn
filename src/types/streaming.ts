
export interface StreamingSource {
    id: number;
    name: string;
    type: string;
    web_url?: string;
    ios_url?: string;
    android_url?: string;
  }
  
  export interface ContentItem {
    id: number;
    title: string;
    original_title?: string;
    plot_overview?: string;
    type: 'movie' | 'tv_series' | 'short_film';
    runtime_minutes?: number;
    year?: number;
    end_year?: number;
    release_date?: string;
    imdb_id?: string;
    tmdb_id?: number;
    tmdb_type?: string;
    genre_names?: string[];
    user_rating?: number;
    critic_score?: number;
    us_rating?: string;
    poster?: string;
    backdrop?: string;
    original_language?: string;
    similar_titles?: number[];
    networks?: Array<{
      id: number;
      name: string;
      origin_country: string;
    }>;
    source_ids?: number[];
    sources?: StreamingSource[];
  }
  
  export interface DetailedContentItem extends ContentItem {
    trailer?: string;
    trailer_thumbnail?: string;
    relevance_percentile?: number;
    trailer_urls?: Array<{
      web_url: string;
      embed_url?: string;
    }>;
    keywords?: string[];
    budget?: string;
    revenue?: string;
    homepage?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
    wikipedia_id?: string;
  }
  
  export interface MainContentState {
    content: DetailedContentItem[];
    loading: boolean;
    error: string | null;
    fromCache: boolean;
    lastFetch: number | null;
    detailedItems: Record<number, DetailedContentItem>; 
  }
  
  export interface FetchContentOptions {
    sourceIds?: string;
    type?: 'movie' | 'tv_series' | 'short_film';
    sortBy?: 'popularity_desc' | 'popularity_asc' | 'release_date_desc' | 'release_date_asc' | 'title_asc' | 'title_desc';
    limit?: number;
    forceRefresh?: boolean;
  }
  
  export interface FetchContentPayload {
    sourceIds: string;
    type: string;
    sortBy: string;
    limit: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  
  export interface RootState {
    mainContent: MainContentState;
  }