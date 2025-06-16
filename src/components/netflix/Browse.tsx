import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import useNowPlayingMovies from "../../hooks/useNowPlayingMoviesNetflix";
import usePopularMovies from "../../hooks/usePopularMoviesNetflix";
import useTopRatedMovies from "../../hooks/useTopRatedMoviesNerflix";
import useUpcomingMovies from "../../hooks/useUpcomingMoviesNetflix";
import SearchMovie from "./SearchMovie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Header from "./Header";
import MainContainer from "./MainContrainer";
import MovieContainer from "./MovieContainer";
import { useUser } from "@clerk/clerk-react";

interface Movie {
    id: string;
    title: string;
    overview: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    vote_average?: number;
    year?: number;
    imdb_id?: string;
    tmdb_id?: number;
    tmdb_type?: string;
    type: string;
    runtime_minutes?: number;
    genre_names?: string[];
    critic_score?: number;
    us_rating?: string;
    original_language?: string;
}

interface WatchmodeMovieDetails {
    id: number;
    title: string;
    original_title?: string;
    plot_overview: string;
    type: string;
    runtime_minutes?: number;
    year: number;
    end_year?: number;
    release_date?: string;
    imdb_id: string;
    tmdb_id: number;
    tmdb_type: string;
    genre_names: string[];
    user_rating?: number;
    critic_score?: number;
    us_rating?: string;
    poster?: string;
    backdrop?: string;
    original_language?: string;
    similar_titles?: number[];
    networks?: any[];
}

interface MovieDetailsCache {
    [key: string]: {
        data: WatchmodeMovieDetails;
        timestamp: number;
    };
}

const transformWatchmodeToMovie = (watchmodeData: any): Movie => {
    // console.log('Transforming movie data:', watchmodeData); 
    
    return {
        id: watchmodeData.id?.toString() || watchmodeData.tmdb_id?.toString() || '',
        title: watchmodeData.title || watchmodeData.original_title || watchmodeData.name || '',
        overview: watchmodeData.plot_overview || watchmodeData.overview || '',
        poster_path: watchmodeData.poster || watchmodeData.poster_path || watchmodeData.poster_url || '',
        backdrop_path: watchmodeData.backdrop || watchmodeData.backdrop_path || watchmodeData.backdrop_url || '',
        release_date: watchmodeData.release_date || watchmodeData.first_air_date || '',
        vote_average: watchmodeData.user_rating || watchmodeData.vote_average || 0,
        year: watchmodeData.year || (watchmodeData.release_date ? new Date(watchmodeData.release_date).getFullYear() : 0),
        imdb_id: watchmodeData.imdb_id || '',
        tmdb_id: watchmodeData.tmdb_id || watchmodeData.id || 0,
        tmdb_type: watchmodeData.tmdb_type || watchmodeData.type || '',
        type: watchmodeData.type || 'movie',
        runtime_minutes: watchmodeData.runtime_minutes || watchmodeData.runtime || 0,
        genre_names: watchmodeData.genre_names || watchmodeData.genres?.map((g: any) => g.name) || [],
        critic_score: watchmodeData.critic_score || watchmodeData.vote_average || 0,
        us_rating: watchmodeData.us_rating || '',
        original_language: watchmodeData.original_language || ''
    };
};

const mergeMovieDetails = (movie: Movie, details: WatchmodeMovieDetails): Movie => {
    return {
        ...movie,
        title: details.title || movie.title,
        overview: details.plot_overview || movie.overview,
        poster_path: details.poster || movie.poster_path,
        backdrop_path: details.backdrop || movie.backdrop_path,
        release_date: details.release_date || movie.release_date,
        vote_average: details.user_rating || movie.vote_average,
        year: details.year || movie.year,
        imdb_id: details.imdb_id || movie.imdb_id,
        tmdb_id: details.tmdb_id || movie.tmdb_id,
        tmdb_type: details.tmdb_type || movie.tmdb_type,
        runtime_minutes: details.runtime_minutes || movie.runtime_minutes,
        genre_names: details.genre_names || movie.genre_names,
        critic_score: details.critic_score || movie.critic_score,
        us_rating: details.us_rating || movie.us_rating,
        original_language: details.original_language || movie.original_language
    };
};

const CACHE_DURATION = 30 * 60 * 1000; 
const CACHE_KEYS = {
    NOW_PLAYING: 'nowPlaying',
    POPULAR: 'popular',
    TOP_RATED: 'topRated',
    UPCOMING: 'upcoming'
};

interface CacheItem {
    data: Movie[];
    timestamp: number;
}

const movieCache = new Map<string, CacheItem>();

const getFromCache = (key: string): Movie[] | null => {
    try {
        const memoryCache = movieCache.get(`movie_cache_${key}`);
        if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
            return memoryCache.data;
        }

        const cached = localStorage?.getItem(`movie_cache_${key}`);
        if (cached) {
            const { data, timestamp }: CacheItem = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                movieCache.set(`movie_cache_${key}`, { data, timestamp });
                return data;
            }
            localStorage?.removeItem(`movie_cache_${key}`);
        }
    } catch (error) {
        console.error('Cache read error:', error);
    }
    return null;
};

const setCache = (key: string, data: Movie[]): void => {
    try {
        const cacheItem: CacheItem = {
            data,
            timestamp: Date.now()
        };
        
        movieCache.set(`movie_cache_${key}`, cacheItem);
        
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`movie_cache_${key}`, JSON.stringify(cacheItem));
        }
    } catch (error) {
        console.error('Cache write error:', error);
    }
};

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

const Browse = () => {
    const user = useUser();
    const toggle = useSelector((store: RootState) => store.movie.toggle);
    const navigate = useNavigate();
    
    const { 
        nowPlayingMovies, 
        popularMovies, 
        topRatedMovies, 
        upcomingMovies,
        loading 
    } = useSelector((store: RootState) => ({
        nowPlayingMovies: store.movie?.nowPlayingMovies,
        popularMovies: store.movie?.popularMovies,
        topRatedMovies: store.movie?.topRatedMovies,
        upcomingMovies: store.movie?.upcomingMovies,
        loading: store.movie?.loading || {}
    }));
    
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    
    const [transformedMovies, setTransformedMovies] = useState<{
        nowPlaying: Movie[];
        popular: Movie[];
        topRated: Movie[];
        upcoming: Movie[];
    }>({
        nowPlaying: [],
        popular: [],
        topRated: [],
        upcoming: []
    });

    const [movieDetails, setMovieDetails] = useState<{[key: string]: WatchmodeMovieDetails}>({});
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    
    const detailsCacheRef = useRef<MovieDetailsCache>({});
    const loadingPromisesRef = useRef<Map<string, Promise<WatchmodeMovieDetails | null>>>(new Map());

    const isCacheValid = (timestamp: number): boolean => {
        return Date.now() - timestamp < CACHE_DURATION;
    };

    const getDetailsFromCache = (movieId: string): WatchmodeMovieDetails | null => {
        const cached = detailsCacheRef.current[movieId];
        if (cached && isCacheValid(cached.timestamp)) {
            return cached.data;
        }
        return null;
    };

    const storeDetailsInCache = (movieId: string, data: WatchmodeMovieDetails): void => {
        detailsCacheRef.current[movieId] = {
            data,
            timestamp: Date.now()
        };
    };

    const applyCachedDetailsToMovies = (movies: Movie[]): Movie[] => {
        return movies.map(movie => {
            const cachedDetails = getDetailsFromCache(movie.id);
            if (cachedDetails) {
                return mergeMovieDetails(movie, cachedDetails);
            }
            return movie;
        });
    };

    const fetchMovieDetails = async (movieId: string): Promise<WatchmodeMovieDetails | null> => {
        const cached = getDetailsFromCache(movieId);
        if (cached) {
            // console.log(`Using cached details for movie ${movieId}`);
            return cached;
        }

        if (loadingPromisesRef.current.has(movieId)) {
            // console.log(`Already loading details for movie ${movieId}, waiting for existing promise`);
            return loadingPromisesRef.current.get(movieId)!;
        }

        const loadingPromise = (async (): Promise<WatchmodeMovieDetails | null> => {
            try {
                const url = `${WATCHMODE_BASE_URL}/title/${movieId}/details/?apiKey=wOdG2B7Dgiy9fsosKaDdF4hv89nWRNxN3dnMD3Ba`;
                // console.log(`Fetching details from: ${url}`);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                
                const json: WatchmodeMovieDetails = await response.json();
                // console.log(`Movie details fetched for ${movieId}:`, json);
                
                storeDetailsInCache(movieId, json);
                
                return json;
            } catch (error) {
                console.error(`Error fetching movie details for ${movieId}:`, error);
                return null;
            } finally {
                loadingPromisesRef.current.delete(movieId);
            }
        })();

        loadingPromisesRef.current.set(movieId, loadingPromise);
        
        return loadingPromise;
    };

    const fetchMovieDetailsForList = async (movies: Movie[], categoryKey: keyof typeof transformedMovies): Promise<void> => {
        if (!movies || movies.length === 0) return;

        setIsLoadingDetails(true);
        setDetailsError(null);

        try {
            const moviesToFetch = movies.slice(0, 20);
            const detailsPromises = moviesToFetch.map(movie => 
                fetchMovieDetails(movie.id).then(details => ({
                    movieId: movie.id,
                    details
                }))
            );

            const results = await Promise.allSettled(detailsPromises);
            
            const newMovieDetails: {[key: string]: WatchmodeMovieDetails} = {};
            const updatedMovies: Movie[] = [...movies]; 
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.details) {
                    const movieId = result.value.movieId;
                    const details = result.value.details;
                    
                    newMovieDetails[movieId] = details;
                    
                    updatedMovies.forEach((movie, movieIndex) => {
                        if (movie.id === movieId) {
                            updatedMovies[movieIndex] = mergeMovieDetails(movie, details);
                        }
                    });
                }
            });

            setMovieDetails(prev => ({
                ...prev,
                ...newMovieDetails
            }));

            setTransformedMovies(prev => ({
                ...prev,
                [categoryKey]: updatedMovies
            }));

            setTransformedMovies(prev => {
                const updatedState = { ...prev };
                
                Object.keys(newMovieDetails).forEach(movieId => {
                    const details = newMovieDetails[movieId];
                    
                    Object.keys(updatedState).forEach(category => {
                        if (category !== categoryKey) {
                            updatedState[category as keyof typeof updatedState] = updatedState[category as keyof typeof updatedState].map(movie => 
                                movie.id === movieId ? mergeMovieDetails(movie, details) : movie
                            );
                        }
                    });
                });
                
                return updatedState;
            });

        } catch (error) {
            console.error('Error fetching movie details:', error);
            setDetailsError(`Failed to fetch movie details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const cache = detailsCacheRef.current;
            
            Object.keys(cache).forEach(key => {
                if (!isCacheValid(cache[key].timestamp)) {
                    delete cache[key];
                }
            });
        }, CACHE_DURATION);

        return () => clearInterval(cleanupInterval);
    }, []);
    
    useUpcomingMovies();
    useNowPlayingMovies();
    useTopRatedMovies();
    usePopularMovies();

    useEffect(() => {
        if (!user) {
            console.log("User not found, redirecting to login");
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        const transformAndCacheMovies = async () => {
            try {
                // console.log('Original data:', { nowPlayingMovies, popularMovies, topRatedMovies, upcomingMovies });
                
                const cachedNowPlaying = getFromCache(CACHE_KEYS.NOW_PLAYING);
                const cachedPopular = getFromCache(CACHE_KEYS.POPULAR);
                const cachedTopRated = getFromCache(CACHE_KEYS.TOP_RATED);
                const cachedUpcoming = getFromCache(CACHE_KEYS.UPCOMING);

                let transformedData = {
                    nowPlaying: cachedNowPlaying || [],
                    popular: cachedPopular || [],
                    topRated: cachedTopRated || [],
                    upcoming: cachedUpcoming || []
                };

                if (nowPlayingMovies && !cachedNowPlaying) {
                    const transformed = nowPlayingMovies.map(transformWatchmodeToMovie);
                    // console.log('Transformed now playing:', transformed);
                    transformedData.nowPlaying = applyCachedDetailsToMovies(transformed);
                    setCache(CACHE_KEYS.NOW_PLAYING, transformed);
                }

                if (popularMovies && !cachedPopular) {
                    const transformed = popularMovies.map(transformWatchmodeToMovie);
                    // console.log('Transformed popular:', transformed);
                    transformedData.popular = applyCachedDetailsToMovies(transformed);
                    setCache(CACHE_KEYS.POPULAR, transformed);
                }

                if (topRatedMovies && !cachedTopRated) {
                    const transformed = topRatedMovies.map(transformWatchmodeToMovie);
                    // console.log('Transformed top rated:', transformed);
                    transformedData.topRated = applyCachedDetailsToMovies(transformed);
                    setCache(CACHE_KEYS.TOP_RATED, transformed);
                }

                if (upcomingMovies && !cachedUpcoming) {
                    const transformed = upcomingMovies.map(transformWatchmodeToMovie);
                    // console.log('Transformed upcoming:', transformed);
                    transformedData.upcoming = applyCachedDetailsToMovies(transformed);
                    setCache(CACHE_KEYS.UPCOMING, transformed);
                }

                if (cachedNowPlaying) {
                    transformedData.nowPlaying = applyCachedDetailsToMovies(cachedNowPlaying);
                }
                if (cachedPopular) {
                    transformedData.popular = applyCachedDetailsToMovies(cachedPopular);
                }
                if (cachedTopRated) {
                    transformedData.topRated = applyCachedDetailsToMovies(cachedTopRated);
                }
                if (cachedUpcoming) {
                    transformedData.upcoming = applyCachedDetailsToMovies(cachedUpcoming);
                }

                setTransformedMovies(transformedData);
            } catch (error) {
                console.error('Error transforming movies:', error);
            }
        };

        transformAndCacheMovies();
    }, [nowPlayingMovies, popularMovies, topRatedMovies, upcomingMovies]);

    // Fetch movie details when movies are loaded - for all categories
    useEffect(() => {
        if (transformedMovies.popular.length > 0) {
            fetchMovieDetailsForList(transformedMovies.popular, 'popular');
        }
    }, [transformedMovies.popular]);

    useEffect(() => {
        if (transformedMovies.nowPlaying.length > 0) {
            fetchMovieDetailsForList(transformedMovies.nowPlaying, 'nowPlaying');
        }
    }, [transformedMovies.nowPlaying]);

    useEffect(() => {
        if (transformedMovies.topRated.length > 0) {
            fetchMovieDetailsForList(transformedMovies.topRated, 'topRated');
        }
    }, [transformedMovies.topRated]);

    useEffect(() => {
        if (transformedMovies.upcoming.length > 0) {
            fetchMovieDetailsForList(transformedMovies.upcoming, 'upcoming');
        }
    }, [transformedMovies.upcoming]);

    useEffect(() => {
        const loadedCategories = [
            transformedMovies.nowPlaying.length > 0,
            transformedMovies.popular.length > 0,
            transformedMovies.topRated.length > 0,
            transformedMovies.upcoming.length > 0
        ];

        const progress = (loadedCategories.filter(Boolean).length / 4) * 100;
        setLoadingProgress(progress);

        const allDataLoaded = loadedCategories.every(Boolean);
        const isAnyLoading = Object.values(loading).some(Boolean);
        
        if (allDataLoaded || !isAnyLoading) {
            setIsInitialLoading(false);
        }
    }, [transformedMovies, loading]);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-white text-2xl font-semibold mb-2">Loading Your Movies</h2>
                        <p className="text-gray-400 text-lg mb-4">Preparing your personalized experience...</p>
                        
                        <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                            <div 
                                className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">{Math.round(loadingProgress)}% Complete</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-black">
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
                <Header />
            </div>
    
            <main className="pt-20 pb-8"> 
                {toggle ? (
                    <div className="container mx-auto px-4">
                        <SearchMovie />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <section className="relative">
                            <MainContainer 
                                movies={transformedMovies.popular} 
                                movieDetails={movieDetails}
                                fetchMovieDetails={fetchMovieDetails}
                            />
                        </section>
    
                        <section className="relative bg-black">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
                            <div className="relative pt-16">
                                <MovieContainer 
                                    nowPlayingMovies={transformedMovies.nowPlaying}
                                    popularMovies={transformedMovies.popular}
                                    topRatedMovies={transformedMovies.topRated}
                                    upcomingMovies={transformedMovies.upcoming}
                                />
                            </div>
                        </section>
    
                        <div className="h-16"></div>
                    </div>
                )}
            </main>
    
            {(Object.values(loading).some(Boolean) || isLoadingDetails) && (
                <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
                    <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-center space-x-3 shadow-xl border border-gray-700">
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">
                            {isLoadingDetails ? 'Loading movie details...' : 'Updating movies...'}
                        </span>
                    </div>
                </div>
            )}

            {detailsError && (
                <div className="fixed bottom-20 right-6 z-40 max-w-sm">
                    <div className="bg-red-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl border border-red-600/50">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Movie Details Error</p>
                                <p className="text-xs text-red-200 mt-1">{detailsError}</p>
                            </div>
                            <button 
                                onClick={() => setDetailsError(null)}
                                className="text-red-200 hover:text-white flex-shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
    
            {!user && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="max-w-md mx-4 p-8 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-red-600/50 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-white text-2xl font-bold mb-2">Authentication Required</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">Please log in to access your personalized movie experience.</p>
                            <button
                                onClick={() => navigate("/")}
                                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Browse;