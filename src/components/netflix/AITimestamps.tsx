import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Clock, Sparkles } from "lucide-react";

interface Chapter {
  start: number;
  end: number;
  title: string;
}

interface AITimestampsProps {
  videoId: string;
  player: any; // YouTube player instance
  isPlayerReady: boolean;
}

export const AITimestamps: React.FC<AITimestampsProps> = ({
  videoId,
  player,
  isPlayerReady,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (videoId && isOpen && chapters.length === 0) {
      fetchChapters();
    }
  }, [videoId, isOpen]);

  useEffect(() => {
    if (player && isPlayerReady) {
      const interval = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentTime(time);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [player, isPlayerReady]);

  const fetchChapters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:4000/api/transcript/chapters/${videoId}`
      );

      if (response.data.success) {
        const data = response.data.data;

        // Check if there's an error in the response
        if (data.error) {
          if (data.error_type === "no_captions") {
            setError(
              "This video doesn't have captions. Try a different video with subtitles enabled."
            );
          } else {
            setError(data.error);
          }
          setChapters([]);
        } else if (data.chapters) {
          setChapters(data.chapters);
        }
      }
    } catch (err: any) {
      // Check if it's a specific error from the backend
      if (err.response?.data?.details?.includes("Subtitles are disabled")) {
        setError(
          "This video doesn't have captions. Try a different video with subtitles enabled."
        );
      } else {
        setError("Failed to generate timestamps");
      }
      console.error("Error fetching chapters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterClick = (startTime: number) => {
    if (player && isPlayerReady) {
      player.seekTo(startTime, true);
      player.playVideo();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isChapterActive = (start: number, end: number) => {
    return currentTime >= start && currentTime < end;
  };

  return (
    <div className="absolute top-4 left-4 z-40 w-80">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">
              AI Generated Timestamps
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="border-t border-gray-700">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">
                  Generating timestamps...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchChapters}
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Try again
                </button>
              </div>
            ) : chapters.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {chapters.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChapterClick(chapter.start)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-white/10 transition-colors text-left ${
                      isChapterActive(chapter.start, chapter.end)
                        ? "bg-purple-500/20 border-l-2 border-purple-500"
                        : ""
                    }`}
                  >
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          isChapterActive(chapter.start, chapter.end)
                            ? "text-purple-300 font-medium"
                            : "text-white"
                        }`}
                      >
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(chapter.start)} - {formatTime(chapter.end)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400">No timestamps available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
