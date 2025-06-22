import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onSubmit: (data: Record<string, any>) => void;
  mode: 'chaos' | 'user';
}

const genreOptions = ['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Sci-Fi', 'Horror', 'Documentary', 'Animation', 'Fantasy'];
const streamingOptions = ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu', 'HBO Max', 'Apple TV+'];

export default function InputForm({ onSubmit, mode }: Props) {
  const [mood, setMood] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [actor, setActor] = useState('');
  const [keywords, setKeywords] = useState('');
  const [streamingServices, setStreamingServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isChaos = mode === 'chaos';

  const toggleSelection = (
    option: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(option)) {
      setList(list.filter(item => item !== option));
    } else {
      setList([...list, option]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isChaos) {
        await onSubmit({});
      } else {
        await onSubmit({
          mood: mood.trim() || undefined,
          genre: genres.length ? genres : undefined,
          duration: duration.trim() || undefined,
          actor: actor.trim() || undefined,
          keywords: keywords.trim() || undefined,
          streamingService: streamingServices.length ? streamingServices : undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setMood('');
    setGenres([]);
    setDuration('');
    setActor('');
    setKeywords('');
    setStreamingServices([]);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-xl bg-black/60 backdrop-blur-lg p-6 rounded-2xl shadow-2xl space-y-6 border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {isChaos && (
        <div className="text-yellow-400 text-center text-sm font-medium mb-4">
          ⚠️ You're in <strong>Chaos Mode</strong>: all preferences are ignored, enjoy the randomness!
        </div>
      )}

      {/* Mood */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Mood</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-3 bg-gray-800/80 border border-gray-700 text-white"
          value={mood}
          onChange={e => setMood(e.target.value)}
          placeholder="e.g., happy, sad, romantic"
          disabled={isChaos || isSubmitting}
        />
      </div>

      {/* Genres */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Genres</label>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map(g => (
            <motion.button
              key={g}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSelection(g, genres, setGenres)}
              disabled={isChaos || isSubmitting}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                genres.includes(g)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300'
              } ${isChaos || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {g}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Duration</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-3 bg-gray-800/80 border border-gray-700 text-white"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="e.g., 2 hours, 90 mins"
          disabled={isChaos || isSubmitting}
        />
      </div>

      {/* Actor */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Favorite Actor</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-3 bg-gray-800/80 border border-gray-700 text-white"
          value={actor}
          onChange={e => setActor(e.target.value)}
          placeholder="e.g., Tom Hanks, Scarlett Johansson"
          disabled={isChaos || isSubmitting}
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Keywords</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-3 bg-gray-800/80 border border-gray-700 text-white"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="e.g., space, revenge, friendship"
          disabled={isChaos || isSubmitting}
        />
      </div>

      {/* Streaming Services */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">Streaming Services</label>
        <div className="flex flex-wrap gap-2">
          {streamingOptions.map(s => (
            <motion.button
              key={s}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSelection(s, streamingServices, setStreamingServices)}
              disabled={isChaos || isSubmitting}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                streamingServices.includes(s)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300'
              } ${isChaos || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Getting Recommendations...</span>
            </div>
          ) : (
            '🎬 Get My Recommendations'
          )}
        </button>

        {!isSubmitting && !isChaos && (
          <button
            type="button"
            onClick={clearForm}
            className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-medium rounded-lg transition-all duration-200 border border-gray-600"
          >
            🗑️ Clear Form
          </button>
        )}
      </div>

      {!isChaos && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>💡 Fill in any fields that matter to you</p>
          <p>🎯 More details = better recommendations</p>
        </div>
      )}
    </motion.form>
  );
}
