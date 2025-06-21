import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import MovieCard from "../netflix/MovieCard";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

interface SearchResult {
  title: string;
  type: string;
  year: number;
  imdb_id: string;
  confidence: number;
  poster_path?: string;
  genre?: string[];
  rating?: number;
  release_date?: string;
  total_duration?: number;
  recommendation_reason?: string;
  priority?: number;
}

interface RecommendationQuery {
  query: string;
  reason: string;
  priority: number;
}

const RecommendationBar = () => {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Cache key for storing recommendations
  const getCacheKey = () =>
    `recommendations_${user?.id}_${new Date().getHours()}`;

  // Check if we can use cached recommendations
  const getCachedRecommendations = () => {
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        const data = JSON.parse(cached);
        // Cache for 1 hour
        if (Date.now() - data.timestamp < 3600000) {
          return data;
        }
      }
    } catch (e) {
      console.error("Cache error:", e);
    }
    return null;
  };

  // Fetch recommendations from FastAPI
  const fetchRecommendations = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedRecommendations();
      if (cached) {
        setRecommendations(cached.recommendations);
        setContext(cached.context);
        setLoading(false);
        return;
      }

      // Get recommendation queries from FastAPI
      const response = await axios.post(
        "http://127.0.0.1:8000/api/generate-recommendations",
        {
          user_id: user.id,
          limit: 7,
        }
      );

      const { search_queries, context: recommendationContext } = response.data;
      setContext(recommendationContext);

      // Update the search part of RecommendationBar.tsx
      const searchPromises = search_queries
        .slice(0, 5)
        .map(async (queryObj: RecommendationQuery) => {
          try {
            console.log("Searching for:", queryObj.query); // Add logging

            const searchResponse = await axios.post(
              "http://localhost:4000/api/get-audio/gemini/movie-search",
              {
                searchTerm: queryObj.query,
                languageName: "English",
              }
            );

            console.log("Search response:", searchResponse.data); // Log full response

            // Handle the response structure properly
            let results = [];

            // Check if we have the parsed object
            if (searchResponse.data?.parsed?.results) {
              results = searchResponse.data.parsed.results;
            } else if (searchResponse.data?.results) {
              results = searchResponse.data.results;
            } else if (searchResponse.data?.parsed_data?.results) {
              results = searchResponse.data.parsed_data.results;
            }

            console.log(
              `Found ${results.length} results for query: ${queryObj.query}`
            );

            // If no results, try a fallback simpler query
            if (results.length === 0) {
              console.log(
                `No results for "${queryObj.query}", trying simpler query`
              );

              // Extract first word or simplify the query
              const simpleQuery = queryObj.query
                .split(" ")[0]
                .replace(/[^a-zA-Z]/g, "");

              const fallbackResponse = await axios.post(
                "http://localhost:4000/api/get-audio/gemini/movie-search",
                {
                  searchTerm: simpleQuery,
                  languageName: "English",
                }
              );

              if (fallbackResponse.data?.parsed?.results) {
                results = fallbackResponse.data.parsed.results;
              } else if (fallbackResponse.data?.results) {
                results = fallbackResponse.data.results;
              }

              console.log(
                `Fallback search for "${simpleQuery}" found ${results.length} results`
              );
            }

            // Add metadata to results
            return results.map((result: any) => ({
              ...result,
              recommendation_reason: queryObj.reason,
              priority: queryObj.priority,
            }));
          } catch (err) {
            console.error(`Search failed for query: ${queryObj.query}`, err);
            return [];
          }
        });

      const searchResults = await Promise.all(searchPromises);
      let allResults = searchResults.flat();

      // If no results at all, use hardcoded fallback queries
      if (allResults.length === 0) {
        console.log("No results from AI queries, using fallback searches");

        const fallbackQueries = [
          { query: "action", reason: "Popular genre", priority: 5 },
          { query: "comedy", reason: "Popular genre", priority: 5 },
          { query: "drama", reason: "Popular genre", priority: 5 },
          { query: "thriller", reason: "Popular genre", priority: 5 },
          { query: "movie", reason: "General search", priority: 5 },
        ];

        const fallbackPromises = fallbackQueries.map(async (queryObj) => {
          try {
            const response = await axios.post(
              "http://localhost:4000/api/get-audio/gemini/movie-search",
              {
                searchTerm: queryObj.query,
                languageName: "English",
              }
            );

            let results = [];
            if (response.data?.parsed?.results) {
              results = response.data.parsed.results;
            } else if (response.data?.results) {
              results = response.data.results;
            }

            return results.map((result: any) => ({
              ...result,
              recommendation_reason: queryObj.reason,
              priority: queryObj.priority,
            }));
          } catch (err) {
            console.error("Fallback search failed:", err);
            return [];
          }
        });

        const fallbackResults = await Promise.all(fallbackPromises);
        allResults = fallbackResults.flat();
      }

      // If STILL no results, create some dummy data for testing
      if (allResults.length === 0) {
        console.log("Using dummy data as last resort");
        allResults = [
          {
            title: "Inception",
            type: "movie",
            year: 2010,
            imdb_id: "tt1375666",
            confidence: 0.9,
            recommendation_reason: "Popular movie",
            priority: 5,
          },
          {
            title: "The Dark Knight",
            type: "movie",
            year: 2008,
            imdb_id: "tt0468569",
            confidence: 0.9,
            recommendation_reason: "Popular movie",
            priority: 5,
          },
          {
            title: "Interstellar",
            type: "movie",
            year: 2014,
            imdb_id: "tt0816692",
            confidence: 0.9,
            recommendation_reason: "Popular movie",
            priority: 5,
          },
        ];
      }

      // Remove duplicates based on title
      const uniqueResults = Array.from(
        new Map(
          allResults.map((item) => [item.title?.toLowerCase(), item])
        ).values()
      );

      // Sort by priority and confidence
      uniqueResults.sort((a, b) => {
        const priorityDiff = (b.priority || 0) - (a.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return (b.confidence || 0) - (a.confidence || 0);
      });

      const resultsWithPosters = await Promise.all(
        uniqueResults.slice(0, 15).map(async (result) => {
          let posterPath = null;
          let additionalData = {};

          try {
            // Search on TVMaze (works for both movies and shows)
            const tvMazeResponse = await axios.get(
              `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
                result.title
              )}`
            );

            if (tvMazeResponse.data && tvMazeResponse.data.length > 0) {
              const show = tvMazeResponse.data[0].show;

              // Get poster
              posterPath = show.image?.original || show.image?.medium;

              // Get additional metadata
              additionalData = {
                genre: show.genres || result.genre,
                rating: show.rating?.average || result.rating,
                year: show.premiered
                  ? new Date(show.premiered).getFullYear()
                  : result.year,
                summary: show.summary, // HTML summary if you want to use it
                runtime: show.runtime || show.averageRuntime, // in minutes
              };
            }
          } catch (error) {
            console.error("TVMaze error for:", result.title);
          }

          // Fallback to placeholder
          if (!posterPath) {
            posterPath = `https://via.placeholder.com/200x300/1a1a1a/ffffff?text=${encodeURIComponent(
              result.title || "Show"
            )}`;
          }

          return {
            ...result,
            poster_path: posterPath,
            genre:
              additionalData.genre ||
              (result.type === "movie"
                ? ["Drama", "Action"]
                : ["Series", "Drama"]),
            rating: additionalData.rating || Math.random() * 4 + 6,
            release_date:
              result.release_date || `${additionalData.year || 2024}-01-01`,
            total_duration:
              additionalData.runtime || Math.floor(Math.random() * 180) + 60,
            ...additionalData,
          };
        })
      );

      setRecommendations(resultsWithPosters);

      // Cache the results
      localStorage.setItem(
        getCacheKey(),
        JSON.stringify({
          recommendations: resultsWithPosters,
          context: recommendationContext,
          timestamp: Date.now(),
        })
      );
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err);

      // More specific error messages
      if (err.response?.status === 404) {
        setError(
          "Recommendation service not found. Please check if the API is running."
        );
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === "ECONNREFUSED") {
        setError(
          "Cannot connect to recommendation service. Please ensure the API is running."
        );
      } else {
        setError("Failed to load recommendations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Scroll handlers
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 400;
    const container = scrollContainerRef.current;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user?.id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [recommendations]);

  const handleRefresh = () => {
    // Clear cache
    localStorage.removeItem(getCacheKey());
    fetchRecommendations();
  };

  if (!user) return null;

  // Helper function to get mood description
  const getMoodDescription = (moodSummary: string) => {
    if (!moodSummary) return "current";

    const lowerSummary = moodSummary.toLowerCase();
    if (lowerSummary.includes("neutral")) return "neutral";
    if (lowerSummary.includes("happiness") || lowerSummary.includes("happy"))
      return "happy";
    if (lowerSummary.includes("sadness") || lowerSummary.includes("sad"))
      return "contemplative";
    if (lowerSummary.includes("anger")) return "energetic";
    return "current";
  };

  // Helper function to get weather description
  const getWeatherDescription = (weather: string) => {
    if (!weather) return "";

    const lowerWeather = weather.toLowerCase();
    if (lowerWeather.includes("rainy") || lowerWeather.includes("rain"))
      return " and rainy weather";
    if (lowerWeather.includes("sunny") || lowerWeather.includes("sun"))
      return " and sunny weather";
    if (lowerWeather.includes("cloudy") || lowerWeather.includes("cloud"))
      return " and cloudy weather";
    if (lowerWeather.includes("stormy") || lowerWeather.includes("storm"))
      return " and stormy weather";
    return "";
  };

  return (
    <div className="relative mb-10 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Recommended For You
          </h2>
          {context && context.mood_summary && (
            <span className="text-xs text-gray-400 hidden md:inline">
              Based on your {getMoodDescription(context.mood_summary)} mood
              {getWeatherDescription(context.weather)}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-gray-400 text-sm">
              Analyzing your preferences...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">
            No recommendations available at the moment.
          </p>
        </div>
      ) : (
        <div className="relative group">
          {/* Scroll buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Movie cards */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recommendations.map((movie, index) => (
              <div
                key={`${movie.imdb_id || movie.title}-${index}`}
                className="flex-shrink-0"
              >
                <MovieCard
                  movieId={movie.imdb_id || `rec-${index}`}
                  posterPath={movie.poster_path}
                  title={movie.title}
                  rating={movie.rating}
                  releaseDate={movie.release_date}
                  genre={movie.genre}
                  totalDuration={movie.total_duration}
                />
                {/* Show recommendation reason on hover */}
                {movie.recommendation_reason && (
                  <p className="text-xs text-gray-500 mt-1 text-center max-w-[200px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {movie.recommendation_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationBar;
