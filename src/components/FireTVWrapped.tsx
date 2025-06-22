// FireTVWrapped.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  TrendingUp,
  Award,
  Film,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  Calendar,
  BarChart,
  Heart,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GenericNavbar from "./GenericNavbar";
interface WatchData {
  totalHoursWatched: number;
  averageDailyWatch: number;
  mostActiveTimeOfDay: string;
  longestBingeSession: {
    title: string;
    duration: number;
    date: Date;
  };
  topGenres: Array<{ genre: string; hours: number; percentage: number }>;
  topShows: Array<{ title: string; watchTime: number; episodes?: number }>;
  newTitlesDiscovered: number;
  completionRate: number;
  totalTitlesWatched: number;
}

interface MoodData {
  dominantMood: string;
  moodDistribution: Record<string, number>;
  topMoodContentPairs: Array<{
    mood: string;
    genre: string;
    occurrences: number;
  }>;
}

interface WrappedData {
  watchData: WatchData;
  moodData: MoodData;
  year: number;
}

const FireTVWrapped: React.FC<{ userId: string }> = ({ userId }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWrappedData();
  }, [userId]);

  const fetchWrappedData = async () => {
    try {
      console.log("=== Starting data fetch ===");
      console.log("User ID:", userId);
      console.log("Current location:", window.location.href);

      // Build the full URLs
      const baseUrl = window.location.origin;
      const watchHistoryUrl = `/api/watchHistory/public/${userId}?limit=1000`;
      const moodHistoryUrl = `/api/moodHistory/${userId}`;

      console.log("Fetching from URLs:");
      console.log("Watch History:", baseUrl + watchHistoryUrl);
      console.log("Mood History:", baseUrl + moodHistoryUrl);

      // Use the correct route names with kebab-case
      const [watchResponse, moodResponse] = await Promise.all([
        fetch(`/api/watch-history/public/${userId}?limit=1000`), // Changed to kebab-case
        fetch(`/api/mood-history/${userId}`), // Changed to kebab-case
      ]);

      // Detailed response logging
      console.log("=== Watch History Response ===");
      console.log("Status:", watchResponse.status);
      console.log("Status Text:", watchResponse.statusText);
      console.log(
        "Headers:",
        Object.fromEntries(watchResponse.headers.entries())
      );

      console.log("=== Mood History Response ===");
      console.log("Status:", moodResponse.status);
      console.log("Status Text:", moodResponse.statusText);
      console.log(
        "Headers:",
        Object.fromEntries(moodResponse.headers.entries())
      );

      // Get the raw text responses
      const watchText = await watchResponse.text();
      const moodText = await moodResponse.text();

      console.log("=== Raw Response Data ===");
      console.log(
        "Watch History Response (first 500 chars):",
        watchText.substring(0, 500)
      );
      console.log("Watch History Response Length:", watchText.length);
      console.log("Watch History First Character:", watchText.charCodeAt(0));

      console.log(
        "Mood History Response (first 500 chars):",
        moodText.substring(0, 500)
      );
      console.log("Mood History Response Length:", moodText.length);
      console.log("Mood History First Character:", moodText.charCodeAt(0));

      // Check if responses are HTML (common issue)
      if (
        watchText.trim().startsWith("<!DOCTYPE") ||
        watchText.trim().startsWith("<html")
      ) {
        console.error(
          "Watch History API returned HTML instead of JSON. This usually means the route is not found."
        );
        throw new Error(
          "API returned HTML instead of JSON - check your API routes"
        );
      }

      if (
        moodText.trim().startsWith("<!DOCTYPE") ||
        moodText.trim().startsWith("<html")
      ) {
        console.error(
          "Mood History API returned HTML instead of JSON. This usually means the route is not found."
        );
        throw new Error(
          "API returned HTML instead of JSON - check your API routes"
        );
      }

      // Check if responses are empty
      if (!watchText.trim()) {
        console.error("Watch History API returned empty response");
        throw new Error("Watch History API returned empty response");
      }

      if (!moodText.trim()) {
        console.error("Mood History API returned empty response");
        throw new Error("Mood History API returned empty response");
      }

      // Try to parse JSON
      let watchHistory, moodHistory;
      try {
        console.log("Attempting to parse Watch History JSON...");
        watchHistory = JSON.parse(watchText);
        console.log("Watch History parsed successfully:", watchHistory);
      } catch (parseError) {
        console.error("Failed to parse Watch History JSON:", parseError);
        console.error("Invalid JSON string:", watchText);
        throw new Error(
          `Failed to parse Watch History JSON: ${parseError.message}`
        );
      }

      try {
        console.log("Attempting to parse Mood History JSON...");
        moodHistory = JSON.parse(moodText);
        console.log("Mood History parsed successfully:", moodHistory);
      } catch (parseError) {
        console.error("Failed to parse Mood History JSON:", parseError);
        console.error("Invalid JSON string:", moodText);
        throw new Error(
          `Failed to parse Mood History JSON: ${parseError.message}`
        );
      }

      // Process the data
      const processedData = processWrappedData(
        watchHistory.watchHistory,
        moodHistory
      );
      setWrappedData(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching wrapped data:", error);
      //   setError(error instanceof Error ? error.message : "Failed to load data");
      setLoading(false);
    }
  };

  const processWrappedData = (
    watchHistory: any[],
    moodData: any
  ): WrappedData => {
    // Handle empty watch history
    if (!watchHistory || watchHistory.length === 0) {
      return {
        watchData: {
          totalHoursWatched: 0,
          averageDailyWatch: 0,
          mostActiveTimeOfDay: "No data yet",
          longestBingeSession: {
            title: "No sessions yet",
            duration: 0,
            date: new Date(),
          },
          topGenres: [],
          topShows: [],
          newTitlesDiscovered: 0,
          completionRate: 0,
          totalTitlesWatched: 0,
        },
        moodData: {
          dominantMood: "Neutral",
          moodDistribution: {
            Neutral: 100,
            Happiness: 0,
            Sadness: 0,
            Anger: 0,
          },
          topMoodContentPairs: [],
        },
        year: new Date().getFullYear(),
      };
    }

    // Calculate total hours watched
    const totalMinutesWatched = watchHistory.reduce(
      (acc, item) => acc + (item.watchDuration || 0),
      0
    );
    const totalHoursWatched = Math.round(totalMinutesWatched / 60);

    // Calculate average daily watch time
    const uniqueDays = new Set(
      watchHistory.map((item) => new Date(item.watchedAt).toDateString())
    ).size;
    const averageDailyWatch =
      uniqueDays > 0 ? Math.round(totalHoursWatched / uniqueDays) : 0;

    // Find most active time of day
    const hourCounts = new Array(24).fill(0);
    watchHistory.forEach((item) => {
      const hour = new Date(item.watchedAt).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveTimeOfDay = getTimeOfDayDescription(peakHour);

    // Find longest binge session (only sessions with actual duration)
    const sessionsWithDuration = watchHistory.filter(
      (item) => item.watchDuration > 0
    );
    const sortedByDuration = [...sessionsWithDuration].sort(
      (a, b) => b.watchDuration - a.watchDuration
    );

    const longestSession = sortedByDuration[0];
    const longestBingeSession = longestSession
      ? {
          title: longestSession.title,
          duration: Math.round(longestSession.watchDuration / 60),
          date: new Date(longestSession.watchedAt),
        }
      : {
          title: "No complete sessions yet",
          duration: 0,
          date: new Date(),
        };

    // Calculate top genres
    const genreMap = new Map<string, number>();
    watchHistory.forEach((item) => {
      if (item.genre && Array.isArray(item.genre)) {
        item.genre.forEach((g: string) => {
          genreMap.set(g, (genreMap.get(g) || 0) + item.watchDuration);
        });
      }
    });

    const totalGenreMinutes = Array.from(genreMap.values()).reduce(
      (a, b) => a + b,
      0
    );

    const topGenres =
      totalGenreMinutes > 0
        ? Array.from(genreMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre, minutes]) => ({
              genre,
              hours: Math.round(minutes / 60),
              percentage: Math.round((minutes / totalGenreMinutes) * 100),
            }))
        : [];

    // Calculate top shows
    const showMap = new Map<string, number>();
    watchHistory.forEach((item) => {
      showMap.set(
        item.title,
        (showMap.get(item.title) || 0) + item.watchDuration
      );
    });

    const topShows = Array.from(showMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, minutes]) => ({
        title,
        watchTime: Math.round(minutes / 60),
      }));

    // Calculate other metrics
    const newTitlesDiscovered = new Set(
      watchHistory.map((item) => item.contentId)
    ).size;
    const completedItems = watchHistory.filter((item) => item.completed).length;
    const completionRate =
      watchHistory.length > 0
        ? Math.round((completedItems / watchHistory.length) * 100)
        : 0;

    // Process mood data with real correlation
    const topMoodContentPairs = calculateMoodContentPairs(
      watchHistory,
      moodData
    );

    // Calculate real mood distribution if available
    let moodDistribution = moodData.aggregatedData?.moodDistribution || {};

    // If no aggregated data, calculate from raw moods
    if (
      (!moodData.aggregatedData ||
        Object.keys(moodDistribution).length === 0) &&
      moodData.moods &&
      moodData.moods.length > 0
    ) {
      const moodCounts: Record<string, number> = {
        Neutral: 0,
        Happiness: 0,
        Sadness: 0,
        Anger: 0,
      };

      moodData.moods.forEach((mood: any) => {
        if (moodCounts.hasOwnProperty(mood.emotion)) {
          moodCounts[mood.emotion]++;
        }
      });

      const totalMoods = moodData.moods.length;
      Object.keys(moodCounts).forEach((mood) => {
        moodDistribution[mood] = (moodCounts[mood] / totalMoods) * 100;
      });
    }

    // Ensure all moods have a value in distribution
    ["Neutral", "Happiness", "Sadness", "Anger"].forEach((mood) => {
      if (!moodDistribution[mood]) {
        moodDistribution[mood] = 0;
      }
    });

    // Determine dominant mood
    let dominantMood = moodData.aggregatedData?.dominantMood;
    if (!dominantMood && moodData.moods && moodData.moods.length > 0) {
      const moodCounts: Record<string, number> = {};
      moodData.moods.forEach((mood: any) => {
        moodCounts[mood.emotion] = (moodCounts[mood.emotion] || 0) + 1;
      });

      let maxCount = 0;
      dominantMood = "Neutral";
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
        }
      });
    }

    return {
      watchData: {
        totalHoursWatched,
        averageDailyWatch,
        mostActiveTimeOfDay,
        longestBingeSession,
        topGenres,
        topShows,
        newTitlesDiscovered,
        completionRate,
        totalTitlesWatched: watchHistory.length,
      },
      moodData: {
        dominantMood: dominantMood || "Neutral",
        moodDistribution,
        topMoodContentPairs,
      },
      year: new Date().getFullYear(),
    };
  };

  const getTimeOfDayDescription = (hour: number): string => {
    if (hour >= 5 && hour < 12) return "Morning Person 🌅";
    if (hour >= 12 && hour < 17) return "Afternoon Viewer ☀️";
    if (hour >= 17 && hour < 21) return "Prime Time Watcher 🌆";
    return "Night Owl 🦉";
  };

  const calculateMoodContentPairs = (watchHistory: any[], moodData: any) => {
    if (
      !moodData.moods ||
      moodData.moods.length === 0 ||
      watchHistory.length === 0
    ) {
      return [];
    }

    // Create time windows (e.g., morning, afternoon, evening, night)
    const getTimeWindow = (date: Date) => {
      const hour = date.getHours();
      if (hour >= 5 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 17) return "Afternoon";
      if (hour >= 17 && hour < 21) return "Evening";
      return "Night";
    };

    // Group moods by time window
    const moodsByTimeWindow: Record<string, Record<string, number>> = {};
    moodData.moods.forEach((mood: any) => {
      const window = getTimeWindow(new Date(mood.timestamp));
      if (!moodsByTimeWindow[window]) {
        moodsByTimeWindow[window] = {};
      }
      moodsByTimeWindow[window][mood.emotion] =
        (moodsByTimeWindow[window][mood.emotion] || 0) + 1;
    });

    // Group watch history by time window and genre
    const genresByTimeWindow: Record<string, Record<string, number>> = {};
    watchHistory.forEach((item: any) => {
      const window = getTimeWindow(new Date(item.watchedAt));
      if (!genresByTimeWindow[window]) {
        genresByTimeWindow[window] = {};
      }
      item.genre.forEach((g: string) => {
        genresByTimeWindow[window][g] =
          (genresByTimeWindow[window][g] || 0) + 1;
      });
    });

    // Find patterns
    const patterns: Array<{
      mood: string;
      genre: string;
      occurrences: number;
    }> = [];

    Object.keys(moodsByTimeWindow).forEach((window) => {
      const moods = moodsByTimeWindow[window];
      const genres = genresByTimeWindow[window];

      if (moods && genres) {
        // Find dominant mood in this time window
        const dominantMood = Object.entries(moods).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0];

        // Find dominant genre in this time window
        const dominantGenre = Object.entries(genres).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0];

        if (dominantMood && dominantGenre) {
          const existing = patterns.find(
            (p) => p.mood === dominantMood && p.genre === dominantGenre
          );
          if (existing) {
            existing.occurrences++;
          } else {
            patterns.push({
              mood: dominantMood,
              genre: dominantGenre,
              occurrences: 1,
            });
          }
        }
      }
    });

    return patterns.sort((a, b) => b.occurrences - a.occurrences).slice(0, 5);
  };

  const slides = [
    <IntroSlide key="intro" data={wrappedData} />,
    <WatchTimeSlide key="watchtime" data={wrappedData?.watchData} />,
    <GenreSlide key="genre" data={wrappedData?.watchData} />,
    <MoodSlide key="mood" data={wrappedData?.moodData} />,
    <TopShowsSlide key="topshows" data={wrappedData?.watchData} />,
    <AwardsSlide key="awards" data={wrappedData} />,
    <SummarySlide key="summary" data={wrappedData} />,
  ];
  const navigate = useNavigate();
  const goHomeHandler = () => {
    navigate("/");
  };
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-500/20 space-y-4 relative"
          >
            <div className="flex justify-end">
              <button
                onClick={goHomeHandler}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>

            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-purple-500"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual Slide Components
const IntroSlide: React.FC<{ data: WrappedData | null }> = ({ data }) => (
  <div className="text-center text-white">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
    >
      <Sparkles className="w-20 h-20 mx-auto mb-6 text-purple-400" />
    </motion.div>
    <h1 className="text-4xl font-bold mb-4">Fire TV Wrapped {data?.year}</h1>
    <p className="text-lg text-gray-300">
      Your year in streaming, personalized just for you
    </p>
  </div>
);

const WatchTimeSlide: React.FC<{ data: WatchData | undefined }> = ({
  data,
}) => {
  if (!data) return null;

  return (
    <div className="text-white">
      <Clock className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-2xl font-bold mb-6">Your Watch Time</h2>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-purple-600/20 rounded-2xl p-6 mb-4"
      >
        <div className="text-5xl font-bold text-purple-400">
          {data.totalHoursWatched}
        </div>
        <div className="text-lg text-gray-300">Total Hours Watched</div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 rounded-xl p-4"
        >
          <div className="text-2xl font-semibold">
            {data.averageDailyWatch}h
          </div>
          <div className="text-sm text-gray-400">Daily Average</div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 rounded-xl p-4"
        >
          <div className="text-lg font-semibold">
            {data.mostActiveTimeOfDay}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4"
      >
        <div className="text-sm text-gray-300 mb-1">Longest Binge Session</div>
        <div className="font-semibold">{data.longestBingeSession.title}</div>
        <div className="text-sm text-gray-400">
          {data.longestBingeSession.duration} hours on{" "}
          {data.longestBingeSession.date.toLocaleDateString()}
        </div>
      </motion.div>
    </div>
  );
};

const GenreSlide: React.FC<{ data: WatchData | undefined }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="text-white">
      <Film className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-2xl font-bold mb-6">Your Genre Profile</h2>

      {data.topGenres.map((genre, index) => (
        <motion.div
          key={genre.genre}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{genre.genre}</span>
            <span className="text-sm text-gray-400">{genre.hours}h</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${genre.percentage}%` }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MoodSlide: React.FC<{ data: MoodData | undefined }> = ({ data }) => {
  if (!data) return null;

  const moodEmojis: Record<string, string> = {
    Neutral: "😌",
    Happiness: "😊",
    Sadness: "😢",
    Anger: "😠",
  };

  const moodColors: Record<string, string> = {
    Neutral: "bg-gray-500",
    Happiness: "bg-yellow-500",
    Sadness: "bg-blue-500",
    Anger: "bg-red-500",
  };

  return (
    <div className="text-white">
      <Heart className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-2xl font-bold mb-6">Your Mood Journey</h2>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-2">{moodEmojis[data.dominantMood]}</div>
        <div className="text-xl font-semibold">
          You were mostly {data.dominantMood.toLowerCase()}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(data.moodDistribution).map(
          ([mood, percentage], index) => (
            <motion.div
              key={mood}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`${moodColors[mood]}/20 rounded-xl p-4 text-center`}
            >
              <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
              <div className="font-semibold">{Math.round(percentage)}%</div>
              <div className="text-xs text-gray-300">{mood}</div>
            </motion.div>
          )
        )}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white/10 rounded-xl p-4"
      >
        <div className="text-sm text-gray-300 mb-2">
          Mood × Content Insights
        </div>
        {data.topMoodContentPairs.slice(0, 2).map((pair, index) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span className="text-sm">
              {moodEmojis[pair.mood]} + {" "}
              {pair.genre !== "null" ? pair.genre : "Voice commands"}
            </span>
            <span className="text-xs text-gray-400">
              {pair.occurrences} times
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const TopShowsSlide: React.FC<{ data: WatchData | undefined }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="text-white">
      <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-2xl font-bold mb-6">Your Top Shows</h2>

      <div className="space-y-3">
        {data.topShows.map((show, index) => (
          <motion.div
            key={show.title}
            initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.15 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-purple-400">
                #{index + 1}
              </div>
              <div>
                <div className="font-semibold">{show.title}</div>
                <div className="text-sm text-gray-400">
                  {show.watchTime} hours
                </div>
              </div>
            </div>
            <Play className="w-5 h-5 text-purple-400" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 bg-white/10 rounded-xl p-4 text-center"
      >
        <div className="text-3xl font-bold text-purple-400">
          {data.newTitlesDiscovered}
        </div>
        <div className="text-sm text-gray-300">New Titles Discovered</div>
      </motion.div>
    </div>
  );
};

const AwardsSlide: React.FC<{ data: WrappedData | null }> = ({ data }) => {
  if (!data) return null;

  const awards = [
    {
      title: "Binge Champion",
      description: `${data.watchData.longestBingeSession.duration}h marathon session`,
      icon: <Zap className="w-8 h-8" />,
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Genre Explorer",
      description: `Watched ${data.watchData.topGenres.length} different genres`,
      icon: <Award className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Mood Master",
      description: `${data.moodData.dominantMood} was your vibe`,
      icon: <Heart className="w-8 h-8" />,
      color: "from-blue-400 to-purple-500",
    },
    {
      title: "Discovery Pro",
      description: `Found ${data.watchData.newTitlesDiscovered} new favorites`,
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-green-400 to-blue-500",
    },
  ];

  return (
    <div className="text-white">
      <Award className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-2xl font-bold mb-6">Your 2025 Awards</h2>

      <div className="grid grid-cols-2 gap-4">
        {awards.map((award, index) => (
          <motion.div
            key={award.title}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: index * 0.2,
              type: "spring",
              stiffness: 200,
            }}
            className="relative"
          >
            <div className="bg-white/10 rounded-xl p-4 text-center overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${award.color} opacity-20`}
              />
              <div className="relative z-10">
                <div className="mb-2 flex justify-center text-white">
                  {award.icon}
                </div>
                <div className="font-semibold text-sm mb-1">{award.title}</div>
                <div className="text-xs text-gray-300">{award.description}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SummarySlide: React.FC<{ data: WrappedData | null }> = ({ data }) => {
  if (!data) return null;

  const yearSummary = generateYearSummary(data);

  return (
    <div className="text-white text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-6"
      >
        <Calendar className="w-16 h-16 mx-auto text-purple-400" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-6">Your 2025 in One Sentence</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 mb-6"
      >
        <p className="text-lg italic">"{yearSummary}"</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-2"
      >
        <div className="flex justify-between items-center bg-white/10 rounded-xl p-3">
          <span className="text-sm">Total Watch Time</span>
          <span className="font-semibold">
            {data.watchData.totalHoursWatched}h
          </span>
        </div>
        <div className="flex justify-between items-center bg-white/10 rounded-xl p-3">
          <span className="text-sm">Titles Watched</span>
          <span className="font-semibold">
            {data.watchData.totalTitlesWatched}
          </span>
        </div>
        <div className="flex justify-between items-center bg-white/10 rounded-xl p-3">
          <span className="text-sm">Completion Rate</span>
          <span className="font-semibold">
            {data.watchData.completionRate}%
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-6"
      >
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
          Share Your Wrapped
        </button>
      </motion.div>
    </div>
  );
};

// Helper function to generate year summary
const generateYearSummary = (data: WrappedData): string => {
  const { watchData, moodData } = data;
  const topGenre = watchData.topGenres[0]?.genre || "various genres";
  const mood = moodData.dominantMood.toLowerCase();

  const summaries = [
    `2025 was all about ${topGenre} marathons and ${mood} vibes!`,
    `You spent ${watchData.totalHoursWatched} hours exploring ${topGenre} while feeling ${mood}.`,
    `A year of ${watchData.mostActiveTimeOfDay.toLowerCase()} binges and ${topGenre} discoveries!`,
    `${watchData.newTitlesDiscovered} new adventures, mostly ${topGenre}, all while ${mood}.`,
  ];

  return summaries[Math.floor(Math.random() * summaries.length)];
};

export default FireTVWrapped;
