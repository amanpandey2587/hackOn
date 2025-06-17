
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import type{ AppDispatch } from '../redux/index';
import { 
  fetchStreamingContent, 
  fetchContentDetails,
  fetchBatchContentDetails,
  clearCache, 
  clearError,
  setLoading
} from '../redux/mainContentSlice';
import type { 
  RootState, 
  FetchContentOptions, 
  DetailedContentItem,
  ContentItem 
} from '../types/streaming';

export const useMainContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    content, 
    loading, 
    error, 
    fromCache, 
    lastFetch, 
    detailedItems 
  } = useSelector((state: RootState) => state.mainContent);

  const fetchContent = useCallback(async (options: FetchContentOptions = {}) => {
    const {
      sourceIds = '203,26', 
      type = 'tv_series',
      sortBy = 'popularity_desc',
      limit = 20,
      forceRefresh = false
    } = options;

    if (forceRefresh) {
      dispatch(clearCache());
    }

    const resultAction = await dispatch(fetchStreamingContent({ 
      sourceIds, 
      type, 
      sortBy, 
      limit 
    }));

    return resultAction;
  }, [dispatch]);

  const fetchNetflixContent = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '203' });
  }, [fetchContent]);

  const fetchAmazonPrimeContent = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '26' });
  }, [fetchContent]);

  const fetchDisneyPlusContent = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '390' });
  }, [fetchContent]);

  const fetchHBOMaxContent = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '384' });
  }, [fetchContent]);

  const fetchBothPlatforms = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '203,26' });
  }, [fetchContent]);

  const fetchAllMajorPlatforms = useCallback((options: FetchContentOptions = {}) => {
    return fetchContent({ ...options, sourceIds: '203,26,390,384' }); 
  }, [fetchContent]);

  const fetchItemDetails = useCallback(async (titleId: number) => {
    const resultAction = await dispatch(fetchContentDetails(titleId));
    return resultAction;
  }, [dispatch]);

  const fetchMultipleItemDetails = useCallback(async (titleIds: number[]) => {
    const resultAction = await dispatch(fetchBatchContentDetails(titleIds));
    return resultAction;
  }, [dispatch]);

  const enrichContentWithDetails = useCallback(async (limit?: number) => {
    const itemsToEnrich = limit ? content.slice(0, limit) : content;
    const titleIds = itemsToEnrich
      .filter(item => !detailedItems[item.id])
      .map(item => item.id);
    
    if (titleIds.length > 0) {
      return await fetchMultipleItemDetails(titleIds);
    }
  }, [content, detailedItems, fetchMultipleItemDetails]);

  const clearContentCache = useCallback(() => {
    dispatch(clearCache());
  }, [dispatch]);

  const clearContentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setLoadingState = useCallback((isLoading: boolean) => {
    dispatch(setLoading(isLoading));
  }, [dispatch]);

  const isDataStale = useCallback((): boolean => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > 1800000; 
  }, [lastFetch]);

  const enrichedContent = useMemo((): DetailedContentItem[] => {
    return content.map(item => ({
      ...item,
      ...detailedItems[item.id]
    }));
  }, [content, detailedItems]);

  const getContentByGenre = useCallback((genre: string): DetailedContentItem[] => {
    return enrichedContent.filter(item => 
      item.genre_names?.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }, [enrichedContent]);

  const getContentByRating = useCallback((minRating: number): DetailedContentItem[] => {
    return enrichedContent.filter(item => 
      item.user_rating && item.user_rating >= minRating
    );
  }, [enrichedContent]);

  const getTrendingContent = useCallback((): DetailedContentItem[] => {
    return enrichedContent
      .filter(item => item.user_rating && item.user_rating >= 7.0)
      .sort((a, b) => {
        const aRating = a.user_rating || 0;
        const bRating = b.user_rating || 0;
        return bRating - aRating;
      });
  }, [enrichedContent]);

  const searchContent = useCallback((query: string): DetailedContentItem[] => {
    const lowercaseQuery = query.toLowerCase();
    return enrichedContent.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.original_title?.toLowerCase().includes(lowercaseQuery) ||
      item.plot_overview?.toLowerCase().includes(lowercaseQuery)
    );
  }, [enrichedContent]);

  useEffect(() => {
    if (content.length === 0 && !loading) {
      fetchBothPlatforms();
    }
  }, [content.length, loading, fetchBothPlatforms]);

  useEffect(() => {
    if (content.length > 0 && !loading) {
      enrichContentWithDetails(10);
    }
  }, [content.length, loading]); 

  return {
    content: enrichedContent,
    rawContent: content,
    loading,
    error,
    fromCache,
    isDataStale: isDataStale(),
    detailedItems,
    
    fetchContent,
    fetchNetflixContent,
    fetchAmazonPrimeContent,
    fetchDisneyPlusContent,
    fetchHBOMaxContent,
    fetchBothPlatforms,
    fetchAllMajorPlatforms,
    fetchItemDetails,
    fetchMultipleItemDetails,
    enrichContentWithDetails,
    clearContentCache,
    clearContentError,
    setLoadingState,
    
    getContentByGenre,
    getContentByRating,
    getTrendingContent,
    searchContent,
    
    hasContent: content.length > 0,
    isEmpty: content.length === 0 && !loading,
    hasDetailedContent: Object.keys(detailedItems).length > 0,
    contentCount: content.length,
    enrichedContentCount: enrichedContent.length,
    
    stats: {
      totalItems: content.length,
      enrichedItems: Object.keys(detailedItems).length,
      averageRating: enrichedContent.reduce((acc, item) => {
        return acc + (item.user_rating || 0);
      }, 0) / (enrichedContent.filter(item => item.user_rating).length || 1),
      genreDistribution: enrichedContent.reduce((acc, item) => {
        item.genre_names?.forEach(genre => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    }
  };
};